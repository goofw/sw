function(module, exports, __webpack_require__) {
    var magnet = __webpack_require__(761), hat = __webpack_require__(91), pws = __webpack_require__(764), bncode = __webpack_require__(179), bitfield = __webpack_require__(776), parseTorrent = __webpack_require__(269), mkdirp = __webpack_require__(132), rimraf = __webpack_require__(777), events = __webpack_require__(5), path = __webpack_require__(4), fs = __webpack_require__(2), os = __webpack_require__(21), eos = __webpack_require__(163), _ = (__webpack_require__(784), 
    __webpack_require__(183)), bagpipe = __webpack_require__(184), blocklist = __webpack_require__(787), encode = __webpack_require__(788), exchangeMetadata = __webpack_require__(789), storage = __webpack_require__(790), storageCircular = __webpack_require__(791), fileStream = __webpack_require__(792), piece = __webpack_require__(796), SPEED_THRESHOLD = 3 * piece.BLOCK_SIZE, TMP = fs.existsSync("/tmp") ? "/tmp" : os.tmpdir(), noop = function() {}, thruthy = function() {
        return !0;
    }, falsy = function() {
        return !1;
    }, toNumber = function(val) {
        return !0 === val ? 1 : val || 0;
    };
    module.exports = function(link, opts) {
        if (!(link = "string" == typeof link ? magnet(link) : Buffer.isBuffer(link) ? parseTorrent(link) : link) || !link.infoHash) throw new Error("You must pass a valid torrent or magnet link");
        var infoHash = link.infoHash;
        opts || (opts = {}), opts.id || (opts.id = "-TS0008-" + hat(48)), opts.path || (opts.path = path.join(opts.tmp || TMP, opts.name || "torrent-stream", infoHash)), 
        opts.flood || (opts.flood = 0), opts.pulse || (opts.pulse = Number.MAX_SAFE_INTEGER);
        var verificationLen, verificationsCount, engine = new events.EventEmitter, swarm = pws(infoHash, opts.id, {
            size: opts.connections || opts.size,
            handshakeTimeout: opts.handshakeTimeout,
            utp: !1
        }), torrentPath = (blocklist(opts.blocklist), path.join(opts.path, "cache")), wires = swarm.wires, critical = [], refresh = noop, verifications = null;
        engine.infoHash = infoHash;
        var rechokeIntervalId, rechokeSlots = !1 === opts.uploads || 0 === opts.uploads ? 0 : +opts.uploads || 5, rechokeOptimistic = null, rechokeOptimisticTime = 0;
        engine.path = opts.path, engine.files = [], engine.selection = [], engine.lockedPieces = [], 
        engine.torrent = null, engine.bitfield = null, engine.amInterested = !1, engine.store = null, 
        engine.swarm = swarm, engine._flood = opts.flood, engine.pulse = opts.pulse, engine.buffer = opts.buffer, 
        engine.ready = function(cb) {
            engine.torrent ? process.nextTick(cb) : engine.once("ready", cb);
        };
        var ontorrent = function(torrent) {
            var lastFile = torrent.files[torrent.files.length - 1];
            if (verifications = torrent.pieces, verificationLen = torrent.pieceLength, verificationsCount = Math.ceil((lastFile.offset + lastFile.length) / verificationLen), 
            engine.verified = bitfield(verificationsCount, opts.circularBuffer ? null : path.join(opts.path, "bitfield")), 
            opts.virtual) {
                var pieceLength = torrent.pieceLength > 524288 && torrent.pieceLength % 524288 == 0 ? 524288 : torrent.pieceLength, pieceCount = Math.ceil((lastFile.offset + lastFile.length) / pieceLength);
                torrent.pieceLength = pieceLength, torrent.verificationLen = verificationLen, torrent.pieces = [];
                for (var i = 0; i != pieceCount; i++) torrent.pieces.push(0);
            }
            var mapPiece = function(index) {
                return opts.virtual ? Math.floor(index * torrent.pieceLength / verificationLen) : index;
            };
            if (opts.circularBuffer && !opts.buffer) throw "circularBuffer can only be used with buffer";
            engine.store = opts.circularBuffer ? storageCircular(opts.path, torrent, opts.circularBuffer, engine) : storage(opts.path, torrent, opts, engine), 
            engine.torrent = torrent, engine.bitfield = bitfield(torrent.pieces.length), pieceLength = torrent.pieceLength;
            var pieceRemainder = torrent.length % pieceLength || pieceLength, getPieceLen = function(i) {
                return i === torrent.pieces.length - 1 ? pieceRemainder : pieceLength;
            }, pieces = engine.pieces = torrent.pieces.map((function(hash, i) {
                return piece(getPieceLen(i));
            })), reservations = engine.reservations = torrent.pieces.map((function() {
                return [];
            }));
            if (!opts.circularBuffer) {
                for (i = 0; i != torrent.files.length; i++) if (!fs.existsSync(path.join(opts.path, i + ""))) for (var file = torrent.files[i], startPiece = file.offset / verificationLen | 0, endPiece = (file.offset + file.length - 1) / verificationLen | 0, j = startPiece; j <= endPiece; j++) engine.verified.set(j, !1);
                for (i = 0; i != verificationsCount; i++) if (engine.verified.get(i)) {
                    var start = Math.floor(i * verificationLen / torrent.pieceLength), end = Math.floor((i + 1) * verificationLen / torrent.pieceLength);
                    for (j = start; j != end; j++) pieces[j] = null, engine.bitfield.set(j, !0), engine.emit("verify", j);
                }
            }
            torrent.files.forEach((function(f) {
                var sel, file = _.extend({}, f), offsetPiece = Math.floor(file.offset / verificationLen) * (verificationLen / torrent.pieceLength), endPiece = Math.ceil((file.offset + file.length - 1) / verificationLen) * (verificationLen / torrent.pieceLength);
                file.deselect = function() {
                    engine.deselect(sel);
                }, file.select = function() {
                    sel = engine.select(offsetPiece, endPiece, !1);
                }, file.createReadStream = function(opts) {
                    var stream = fileStream(engine, file, opts);
                    return eos(stream, (function() {
                        engine.deselect(stream.selection);
                    })), stream;
                }, engine.files.push(file);
            }));
            var oninterestchange = function() {
                var prev = engine.amInterested;
                engine.amInterested = !!engine.selection.length, wires.forEach((function(wire) {
                    engine.amInterested ? wire.interested() : wire.uninterested();
                })), prev !== engine.amInterested && (engine.amInterested ? engine.emit("interested") : engine.emit("uninterested"));
            }, gc = function() {
                for (var i = 0; i < engine.selection.length; i++) {
                    for (var s = engine.selection[i], oldOffset = s.offset; !pieces[s.from + s.offset] && s.from + s.offset < s.to; ) s.offset++;
                    oldOffset !== s.offset && s.notify(), s.to === s.from + s.offset && (pieces[s.from + s.offset] || (engine.selection.splice(i, 1), 
                    i--, s.notify(), oninterestchange()));
                }
                engine.selection.length || engine.emit("idle");
            }, resetpiece = engine.resetPiece = function(idx) {
                engine.bitfield.set(idx, !1), critical[idx] = null, reservations[idx] = [], pieces[idx] = piece(getPieceLen(idx));
            }, onhotswap = !1 === opts.hotswap ? falsy : function(wire, index) {
                var speed = wire.downloadSpeed();
                if (!(speed < piece.BLOCK_SIZE) && reservations[index] && pieces[index]) {
                    for (var min, r = reservations[index], minSpeed = 1 / 0, i = 0; i < r.length; i++) {
                        var other = r[i];
                        if (other && other !== wire) {
                            var otherSpeed = other.downloadSpeed();
                            otherSpeed >= SPEED_THRESHOLD || 2 * otherSpeed > speed || otherSpeed > minSpeed || (min = other, 
                            minSpeed = otherSpeed);
                        }
                    }
                    if (!min) return !1;
                    for (i = 0; i < r.length; i++) r[i] === min && (r[i] = null);
                    var requests, reqs = (requests = min.requests, opts.virtual ? requests.map((function(r) {
                        var pos = r.piece * verificationLen + r.offset;
                        return {
                            piece: Math.floor(pos / torrent.pieceLength),
                            offset: pos % torrent.pieceLength,
                            callback: r.callback,
                            timeout: r.timeout,
                            length: r.length
                        };
                    })) : requests);
                    for (i = 0; i < reqs.length; i++) {
                        var req = reqs[i];
                        req.piece === index && pieces[index].cancel(req.offset / piece.BLOCK_SIZE | 0);
                    }
                    return engine.emit("hotswap", min, wire, index), !0;
                }
            }, onupdatetick = function() {
                if (engine.emit("update"), swarm.downloaded >= engine._flood && swarm.downloadSpeed() > engine.pulse) return delayupdatetick();
                process.nextTick(onupdate);
            }, delayupdatetick = _.debounce(onupdatetick, 500), onrequest = function(wire, index, hotswap) {
                if (!pieces[index]) return !1;
                var p = pieces[index], reservation = p.reserve();
                if (-1 === reservation && hotswap && onhotswap(wire, index) && (reservation = p.reserve()), 
                -1 === reservation) return !1;
                var r = reservations[index] || [], offset = p.offset(reservation), size = p.size(reservation), i = r.indexOf(null);
                return -1 === i && (i = r.length), r[i] = wire, (function(peer, index, offset, size, cb) {
                    if (!opts.virtual) return peer.request(index, offset, size, cb);
                    var pos = index * torrent.pieceLength + offset;
                    index = Math.floor(pos / verificationLen), offset = pos % verificationLen, peer.request(index, offset, size, cb);
                })(wire, index, offset, size, (function(err, block) {
                    if (r[i] === wire && (r[i] = null), p !== pieces[index]) return onupdatetick();
                    if (err) return p.cancel(reservation), onupdatetick();
                    var ready = !p.set(reservation, block);
                    if (engine.emit("piece-progress", index, p.buffered / p.parts), ready) return onupdatetick();
                    var buffer = p.flush();
                    !(function(index, buffer) {
                        if (pieces[index]) {
                            try {
                                engine.store.write(index, buffer);
                            } catch (e) {
                                return void engine.emit("error", e);
                            }
                            engine.bitfield.set(index, !0);
                            var ver = engine.store.verify(index, verifications);
                            if (ver && ver.success && engine.store.commit(ver.start, ver.end - 1, (function(err, noNotifyHave) {
                                if (err) return engine.emit("error", err);
                                for (var j = ver.start; j != ver.end; j++) engine.emit("verify", j);
                                if (!noNotifyHave) {
                                    var idx = mapPiece(index);
                                    engine.verified.set(idx, !0);
                                    for (var i = 0; i < wires.length; i++) wires[i].have(idx);
                                }
                            })), !ver || ver.success) pieces[index] = null, reservations[index] = null, engine.emit("download", index, buffer), 
                            gc(); else for (var j = ver.start; j != ver.end; j++) engine.emit("invalid-piece", j), 
                            resetpiece(j);
                        }
                    })(index, buffer), onupdatetick();
                })), !0;
            }, getRequestsNumber = function() {
                var unchoked = wires.filter((function(peer) {
                    return !peer.peerChoking;
                })).length, normalRange = 1 - Math.max(0, Math.min(1, (unchoked - 1) / 29));
                return Math.round(45 * Math.pow(normalRange, 4) + 5);
            }, shufflePriority = function(i) {
                for (var last = i, j = i; j < engine.selection.length && engine.selection[j].priority; j++) last = j;
                engine.selection.splice(last, 0, engine.selection.splice(i, 1)[0]);
            }, select = function(wire, hotswap) {
                var maxRequests = getRequestsNumber();
                if (wire.requests.length >= maxRequests) return !0;
                for (var rank = (function(wire) {
                    var speed = wire.downloadSpeed() || 1;
                    if (speed > SPEED_THRESHOLD) return thruthy;
                    var secs = getRequestsNumber() * piece.BLOCK_SIZE / speed, tries = 10, ptr = 0;
                    return function(index) {
                        if (!tries || !pieces[index]) return !0;
                        for (var missing = pieces[index].missing; ptr < wires.length; ptr++) {
                            var other = wires[ptr], otherSpeed = other.downloadSpeed();
                            if (!(otherSpeed < SPEED_THRESHOLD) && !(otherSpeed <= speed) && other.peerPieces[mapPiece(index)] && !((missing -= otherSpeed * secs) > 0)) return tries--, 
                            !1;
                        }
                        return !0;
                    };
                })(wire), i = 0; i < engine.selection.length; i++) for (var next = engine.selection[i], j = next.from + next.offset; j <= (next.selectTo || next.to); j++) if (wire.peerPieces[mapPiece(j)] && rank(j)) {
                    for (;wire.requests.length < maxRequests && onrequest(wire, j, critical[j] || hotswap); ) ;
                    if (!(wire.requests.length < maxRequests)) return next.priority && shufflePriority(i), 
                    !0;
                }
                return !1;
            }, onupdatewire = function(wire) {
                if (!wire.peerChoking) return wire.downloaded ? void (select(wire, !1) || select(wire, !0)) : (function(wire) {
                    if (!wire.requests.length) for (var i = engine.selection.length - 1; i >= 0; i--) for (var next = engine.selection[i], j = next.selectTo || next.to; j >= next.from + next.offset; j--) if (wire.peerPieces[mapPiece(j)] && onrequest(wire, j, !1)) return;
                })(wire);
            }, onupdate = function() {
                wires.forEach(onupdatewire);
            }, onwire = function(wire) {
                wire.setTimeout(opts.timeout || 3e4, (function() {
                    engine.emit("timeout", wire), wire.destroy();
                })), engine.selection.length && wire.interested();
                var id, onchoketimeout = function() {
                    if (swarm.queued > 2 * (swarm.size - swarm.wires.length) && wire.amInterested) return wire.destroy();
                    id = setTimeout(onchoketimeout, 5e3);
                };
                wire.on("close", (function() {
                    clearTimeout(id);
                })), wire.on("choke", (function() {
                    clearTimeout(id), id = setTimeout(onchoketimeout, 5e3);
                })), wire.on("unchoke", (function() {
                    clearTimeout(id);
                }));
                var uploadPipe = new bagpipe(4);
                wire.on("request", (function(index, offset, length, cb) {
                    var pos = index * verificationLen + offset;
                    if (index = Math.floor(pos / torrent.pieceLength), offset = pos % torrent.pieceLength, 
                    !engine.bitfield.get(index)) return engine.emit("invalid-request", index);
                    uploadPipe.push(engine.store.read, index, (function(err, buffer) {
                        return err ? cb(err) : buffer ? (engine.emit("upload", index, offset, length), void cb(null, buffer.slice(offset, offset + length))) : cb(new Error("Empty buffer returned"));
                    }));
                })), wire.on("unchoke", onupdatetick), wire.on("bitfield", onupdatetick), wire.on("have", onupdatetick), 
                wire.isSeeder = !1;
                var i = 0, checkseeder = function() {
                    if (wire.peerPieces.length === torrent.pieces.length) {
                        for (;i < torrent.pieces.length; ++i) if (!wire.peerPieces[i]) return;
                        wire.isSeeder = !0;
                    }
                };
                wire.on("bitfield", checkseeder), wire.on("have", checkseeder), checkseeder(), id = setTimeout(onchoketimeout, 5e3);
            }, rechokeSort = function(a, b) {
                return a.downSpeed != b.downSpeed ? a.downSpeed > b.downSpeed ? -1 : 1 : a.upSpeed != b.upSpeed ? a.upSpeed > b.upSpeed ? -1 : 1 : a.wasChoked != b.wasChoked ? a.wasChoked ? 1 : -1 : a.salt - b.salt;
            };
            swarm.on("wire", onwire), swarm.wires.forEach(onwire), refresh = function() {
                process.nextTick(gc), oninterestchange(), onupdatetick();
            }, rechokeIntervalId = setInterval((function() {
                rechokeOptimisticTime > 0 ? --rechokeOptimisticTime : rechokeOptimistic = null;
                var peers = [];
                wires.forEach((function(wire) {
                    wire.isSeeder ? wire.amChoking || wire.choke() : wire !== rechokeOptimistic && peers.push({
                        wire: wire,
                        downSpeed: wire.downloadSpeed(),
                        upSpeed: wire.uploadSpeed(),
                        salt: Math.random(),
                        interested: wire.peerInterested,
                        wasChoked: wire.amChoking,
                        isChoked: !0
                    });
                })), peers.sort(rechokeSort);
                for (var i = 0, unchokeInterested = 0; i < peers.length && unchokeInterested < rechokeSlots; ++i) peers[i].isChoked = !1, 
                peers[i].interested && ++unchokeInterested;
                if (!rechokeOptimistic && i < peers.length && rechokeSlots) {
                    var candidates = peers.slice(i).filter((function(peer) {
                        return peer.interested;
                    })), optimistic = candidates[Math.random() * candidates.length | 0];
                    optimistic && (optimistic.isChoked = !1, rechokeOptimistic = optimistic.wire, rechokeOptimisticTime = 2);
                }
                peers.forEach((function(peer) {
                    peer.wasChoked != peer.isChoked && (peer.isChoked ? peer.wire.choke() : peer.wire.unchoke());
                }));
            }), 1e4), engine.emit("ready"), refresh();
        }, exchange = exchangeMetadata(engine, (function(metadata) {
            var result = {};
            try {
                result.info = bncode.decode(metadata);
            } catch (e) {
                return;
            }
            result["announce-list"] = [];
            var buf = bncode.encode(result), tor = parseTorrent(buf);
            verifications || (verifications = tor.pieces), engine.torrent || ontorrent(tor), 
            fs.writeFile(torrentPath, buf, (function(err) {
                err && console.error(err);
            }));
        }));
        return swarm.on("wire", (function(wire) {
            engine.emit("wire", wire), exchange(wire), engine.verified ? wire.bitfield(engine.verified) : engine.bitfield && wire.bitfield(engine.bitfield);
        })), swarm.pause(), (function(next) {
            if (opts.circularBuffer) return next();
            mkdirp(opts.path, (function(err) {
                if (err) return next(err);
                fs.readFile(torrentPath, (function(_, buf) {
                    try {
                        buf && (link = parseTorrent(buf));
                    } catch (e) {}
                    next();
                }));
            }));
        })((function(err) {
            return err ? engine.emit("error", err) : link.files && link.pieces ? (metadata = encode(link), 
            swarm.resume(), void (metadata && ontorrent(link))) : void 0;
        })), engine.critical = function(piece, width) {
            for (var i = 0; i < (width || 1); i++) critical[piece + i] = !0;
        }, engine.isCritical = function(piece) {
            return critical[piece];
        }, engine.select = function(from, to, priority, notify) {
            var sel;
            return engine.selection.push(sel = {
                from: from,
                to: to,
                offset: 0,
                priority: toNumber(priority),
                notify: notify || noop
            }), engine.selection.sort((function(a, b) {
                return b.priority - a.priority;
            })), refresh(), sel;
        }, engine.deselect = function(sel) {
            var idx = engine.selection.indexOf(sel);
            idx > -1 && (engine.selection.splice(idx, 1), refresh());
        }, engine.refresh = function() {
            refresh();
        }, engine.setPulse = function(bps) {
            engine.pulse = bps, "undefined" != typeof onupdatetick && onupdatetick();
        }, engine.setFlood = function(b) {
            engine._flood = b + swarm.downloaded;
        }, engine.setFloodedPulse = function(b, bps) {
            engine.setFlood(b), engine.setPulse(bps);
        }, engine.flood = function() {
            engine._flood = 0, engine.pulse = Number.MAX_SAFE_INTEGER;
        }, engine.connect = function(addr) {
            swarm.add(addr);
        }, engine.disconnect = function(addr) {
            swarm.remove(addr);
        }, engine.remove = function(cb) {
            rimraf(engine.path, cb || noop);
        }, engine.destroy = function(cb) {
            engine.removeAllListeners(), swarm.destroy(), clearInterval(rechokeIntervalId), 
            engine.store ? engine.store.close(cb) : cb && process.nextTick(cb);
        }, engine.listen = function(port, cb) {
            if ("function" == typeof port) return that.listen(0, port);
            engine.port = port || 6881, swarm.listen(engine.port, cb);
        }, engine;
    };
}
