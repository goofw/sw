function(module, exports, __webpack_require__) {
    var url = __webpack_require__(7), os = __webpack_require__(21), events = __webpack_require__(5), path = __webpack_require__(4), util = __webpack_require__(0), fs = __webpack_require__(2), fetch = __webpack_require__(33), connect = __webpack_require__(540), rangeParser = __webpack_require__(159), bodyParser = __webpack_require__(106), Router = __webpack_require__(111), mime = __webpack_require__(565), pump = __webpack_require__(162), PeerSearch = __webpack_require__(567), parseTorrentFile = __webpack_require__(269), EngineFS = new events.EventEmitter, Counter = __webpack_require__(621), GuessFileIdx = __webpack_require__(622), spoofedPeerId = __webpack_require__(624), safeStatelessRegex = __webpack_require__(169), IH_REGEX = new RegExp("([0-9A-Fa-f]){40}", "g");
    EngineFS.STREAM_TIMEOUT = 3e4, EngineFS.ENGINE_TIMEOUT = 6e4;
    var engines = {};
    function createEngine(infoHash, options, cb) {
        EngineFS.beforeCreateEngine(infoHash, (function() {
            if (!EngineFS.engine) throw new Error("EngineFS requires EngineFS.engine to point to engine constructor");
            "function" == typeof options && (cb = options, options = null), cb = cb || function() {}, 
            EngineFS.once("engine-ready:" + infoHash, (function() {
                cb(null, engines[infoHash]);
            })), (options = util._extend(EngineFS.getDefaults(infoHash), options || {})).path = options.path || EngineFS.getCachePath(infoHash), 
            Emit([ "engine-create", infoHash, options ]);
            var torrent = options.torrent || "magnet:?xt=urn:btih:" + infoHash;
            options.id = spoofedPeerId();
            var isNew = !engines[infoHash], e = engines[infoHash] = engines[infoHash] || EngineFS.engine(torrent, options);
            if (e.swarm.resume(), e.options = options, isNew && options.peerSearch) {
                var peerSources = [];
                peerSources = ((torrent || {}).announce || []).length ? peerSources.concat(torrent.announce).map((function(src) {
                    return "tracker:" + src;
                })).concat("dht:" + infoHash) : options.peerSearch.sources, new PeerSearch(peerSources, e.swarm, options.peerSearch);
            }
            if (isNew && options.swarmCap) {
                var updater = updateSwarmCap.bind(null, e, options.swarmCap);
                e.swarm.on("wire", updater), e.swarm.on("wire-disconnect", updater), e.on("download", updater);
            }
            options.growler && e.setFloodedPulse && e.setFloodedPulse(options.growler.flood, options.growler.pulse), 
            isNew && (e.on("error", (function(err) {
                EngineFS.emit("engine-error:" + infoHash, err), EngineFS.emit("engine-error", infoHash, err);
            })), e.on("invalid-piece", (function(p) {
                EngineFS.emit("engine-invalid-piece:" + infoHash, p), EngineFS.emit("engine-invalid-piece", infoHash, p);
            })), Emit([ "engine-created", infoHash ])), e.ready((function() {
                EngineFS.emit("engine-ready:" + infoHash, e.torrent), EngineFS.emit("engine-ready", infoHash, e.torrent);
            }));
        }));
    }
    function updateSwarmCap(e, opts) {
        var unchoked = e.swarm.wires.filter((function(peer) {
            return !peer.peerChoking;
        })).length, primaryCond = !0;
        opts.maxSpeed && (primaryCond = e.swarm.downloadSpeed() > opts.maxSpeed), opts.maxBuffer && (primaryCond = (function(e) {
            var buf = 0, n = 0, b = 0;
            return e.selection.forEach((function(sel) {
                if (sel.readFrom > 0 && sel.selectTo > 0) {
                    var bufferPieces = sel.selectTo - sel.readFrom, prog = (sel.from + sel.offset - sel.readFrom) / bufferPieces;
                    b += prog, n++;
                }
            })), n > 0 && (buf = b / n), buf;
        })(e) > opts.maxBuffer);
        var minPeerCond = unchoked > opts.minPeers;
        primaryCond && minPeerCond ? e.swarm.pause() : e.swarm.resume();
    }
    function getSelections(infoHash) {
        return (engines[infoHash.toLowerCase()] || {}).selection || [];
    }
    function getEngine(infoHash) {
        return engines[infoHash.toLowerCase()];
    }
    function existsEngine(infoHash) {
        return !!engines[infoHash.toLowerCase()];
    }
    function removeEngine(infoHash, cb) {
        existsEngine(infoHash) ? engines[infoHash.toLowerCase()].destroy((function() {
            Emit([ "engine-destroyed", infoHash ]), delete engines[infoHash.toLowerCase()], 
            cb && cb();
        })) : cb && cb();
    }
    function listEngines() {
        return Object.keys(engines);
    }
    EngineFS.getDefaults = function(ih) {
        return {
            peerSearch: {
                min: 40,
                max: 200,
                sources: [ "dht:" + ih ]
            },
            dht: !1,
            tracker: !1
        };
    }, EngineFS.getCachePath = function(ih) {
        return path.join(os.tmpdir(), ih);
    }, EngineFS.beforeCreateEngine = function(hash, cb) {
        cb();
    };
    var router = Router(), externalRouter = Router();
    function prewarmStream(hash, idx) {
        engines[hash] && engines[hash].ready((function() {
            engines[hash].files[idx].select();
        }));
    }
    var jsonHead = {
        "Content-Type": "application/json"
    };
    function handleTorrent(req, res, next) {
        var u = url.parse(req.url, !0), trackers = u.query.tr && [].concat(u.query.tr), fileMustInclude = u.query.f && [].concat(u.query.f), isRegex = /^\/(.*)\/(.*)$/;
        fileMustInclude = (fileMustInclude || []).map((function(el) {
            if ((el || "").match(isRegex)) {
                var parts = isRegex.exec(el);
                try {
                    return new RegExp(parts[1], parts[2]);
                } catch (e) {}
            }
            return el;
        })), (function(path, trackers, fileMustInclude, cb) {
            var parts = path.split("/").filter((function(x) {
                return x;
            }));
            if (parts[0] && parts[0].match(IH_REGEX)) {
                var infoHash = parts[0].toLowerCase(), i = Number(parts[1] || -1), opts = {};
                if (trackers) {
                    const defaults = EngineFS.getDefaults(infoHash);
                    opts.peerSearch = {
                        min: defaults.peerSearch.min,
                        max: defaults.peerSearch.max,
                        sources: trackers
                    };
                }
                createEngine(infoHash, opts, (function(err, engine) {
                    if (err) return cb(err);
                    if ((fileMustInclude || []).length && engine.files.find((function(file, idx) {
                        return !!fileMustInclude.find((function(reg) {
                            return reg = "string" == typeof reg ? new RegExp(reg) : reg, !!safeStatelessRegex(file.name, reg, 500) && (i = idx, 
                            !0);
                        }));
                    })), isNaN(i)) {
                        var name = decodeURIComponent(parts[1]);
                        if (engine.files.some((function(file, idx) {
                            if (name === file.name) return i = idx, !0;
                        })), isNaN(i)) return cb(new Error("Cannot parse path: info hash received, but invalid file index or file name"));
                    } else if (-1 === i) {
                        var engineStats = getStatistics(engine);
                        engineStats.files && (i = GuessFileIdx(engineStats.files, {}));
                    }
                    if (!engine.files[i]) return cb(new Error("Torrent does not contain file with index " + i));
                    cb(null, engine.files[i], engine);
                }));
            } else {
                if (parts[0] && 64 == parts[0].length) return cb(new Error("Not implemented yet"));
                cb(new Error("Cannot parse path"));
            }
        })(u.pathname, trackers, fileMustInclude, (function(err, handle, e) {
            if (err) return console.error(err), res.statusCode = 500, res.end();
            if (u.query.external) return res.statusCode = 307, res.setHeader("Location", "/" + e.infoHash + "/" + encodeURIComponent(handle.name) + (u.query.download ? "?download=1" : "")), 
            res.end();
            EngineFS.emit("stream-open", e.infoHash, e.files.indexOf(handle));
            var closed = !1, emitClose = function() {
                closed || (closed = !0, EngineFS.emit("stream-close", e.infoHash, e.files.indexOf(handle)));
            };
            res.on("finish", emitClose), res.on("close", emitClose), req.connection.setTimeout(864e5);
            var range = req.headers.range;
            range && range.endsWith("-") && (EngineFS.getDefaults(e.infoHash).circularBuffer || prewarmStream(e.infoHash, e.files.indexOf(handle))), 
            range = range && rangeParser(handle.length, range)[0], res.setHeader("Accept-Ranges", "bytes"), 
            res.setHeader("Content-Type", mime.lookup(handle.name)), res.setHeader("Cache-Control", "max-age=0, no-cache"), 
            u.query.download && res.setHeader("Content-Disposition", 'attachment; filename="' + handle.name + '";'), 
            u.query.subtitles && res.setHeader("CaptionInfo.sec", u.query.subtitles);
            var opts = {};
            return req.headers["enginefs-prio"] && (opts.priority = parseInt(req.headers["enginefs-prio"]) || 1), 
            range ? (res.statusCode = 206, res.setHeader("Content-Length", range.end - range.start + 1), 
            res.setHeader("Content-Range", "bytes " + range.start + "-" + range.end + "/" + handle.length), 
            "HEAD" === req.method ? res.end() : void pump(handle.createReadStream(util._extend(range, opts)), res)) : (res.setHeader("Content-Length", handle.length), 
            "HEAD" === req.method ? res.end() : void pump(handle.createReadStream(opts), res));
        }));
    }
    function createApp() {
        var app = connect();
        return app.use((function(req, res, next) {
            util._extend(req, url.parse(req.url, !0)), EngineFS.loggingEnabled && console.log("-> " + req.method + " " + url.parse(req.url).path + " " + (req.headers.range || "")), 
            next();
        })), app.use(bodyParser.json({
            limit: "3mb"
        })), app.use(bodyParser.urlencoded({
            extended: !0
        })), app.use(externalRouter), app.use(router), app;
    }
    function sendCORSHeaders(req, res, next) {
        if ("OPTIONS" === req.method && req.headers.origin) return res.setHeader("Access-Control-Allow-Origin", "*"), 
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS"), res.setHeader("Access-Control-Allow-Headers", req.headers["access-control-request-headers"] || "Range"), 
        res.setHeader("Access-Control-Max-Age", "1728000"), res.end(), !0;
        req.headers.origin && res.setHeader("Access-Control-Allow-Origin", "*"), next && next();
    }
    function sendDLNAHeaders(req, res, next) {
        res.setHeader("transferMode.dlna.org", "Streaming"), res.setHeader("contentFeatures.dlna.org", "DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000"), 
        next && next();
    }
    function getStatistics(e, idx) {
        if (!e) return null;
        var s = {
            infoHash: e.infoHash,
            name: e.torrent && e.torrent.name,
            peers: e.swarm.wires.length,
            unchoked: e.swarm.wires.filter((function(peer) {
                return !peer.peerChoking;
            })).length,
            queued: e.swarm.queued,
            unique: Object.keys(e.swarm._peers).length,
            connectionTries: e.swarm.tries,
            swarmPaused: e.swarm.paused,
            swarmConnections: e.swarm.connections.length,
            swarmSize: e.swarm.size,
            selections: e.selection,
            wires: void 0 !== idx ? null : e.swarm.wires.filter((function(peer) {
                return !peer.peerChoking;
            })).map((function(wire) {
                return {
                    requests: wire.requests.length,
                    address: wire.peerAddress,
                    amInterested: wire.amInterested,
                    isSeeder: wire.isSeeder,
                    downSpeed: wire.downloadSpeed(),
                    upSpeed: wire.uploadSpeed()
                };
            })),
            files: e.torrent && e.torrent.files,
            downloaded: e.swarm.downloaded,
            uploaded: e.swarm.uploaded,
            downloadSpeed: e.swarm.downloadSpeed(),
            uploadSpeed: e.swarm.downloadSpeed(),
            sources: e.swarm.peerSearch && e.swarm.peerSearch.stats(),
            peerSearchRunning: e.swarm.peerSearch ? e.swarm.peerSearch.isRunning() : void 0,
            opts: e.options
        };
        return !isNaN(idx) && e.torrent && e.torrent.files[idx] && util._extend(s, (function(e, file) {
            var stats = {};
            stats.streamLen = file.length, stats.streamName = file.name;
            for (var startPiece = file.offset / e.torrent.pieceLength | 0, endPiece = (file.offset + file.length - 1) / e.torrent.pieceLength | 0, availablePieces = 0, i = startPiece; i <= endPiece; i++) e.bitfield.get(i) && availablePieces++;
            var filePieces = Math.ceil(file.length / e.torrent.pieceLength);
            return stats.streamProgress = availablePieces / filePieces, stats;
        })(e, e.torrent.files[idx])), s;
    }
    function Emit(args) {
        EngineFS.emit.apply(EngineFS, args), EngineFS.emit(args.join(":"));
    }
    router.use(sendCORSHeaders), router.get("/favicon.ico", (function(req, res) {
        res.writeHead(404, jsonHead), res.end();
    })), router.get("/:infoHash/stats.json", (function(req, res) {
        res.writeHead(200, jsonHead), res.end(JSON.stringify(getStatistics(engines[req.params.infoHash])));
    })), router.get("/:infoHash/:idx/stats.json", (function(req, res) {
        res.writeHead(200, jsonHead), res.end(JSON.stringify(getStatistics(engines[req.params.infoHash], req.params.idx)));
    })), router.get("/stats.json", (function(req, res) {
        res.writeHead(200, jsonHead);
        var stats = {};
        for (ih in req.url.match("sys=1") && (stats.sys = {
            loadavg: os.loadavg(),
            cpus: os.cpus()
        }), engines) stats[ih] = getStatistics(engines[ih]);
        res.end(JSON.stringify(stats));
    })), router.all("/:infoHash/create", (function(req, res) {
        var ih = req.params.infoHash.toLowerCase(), body = req.body || {};
        createEngine(ih, body, (function() {
            res.writeHead(200, jsonHead);
            var engineStats = getStatistics(engines[ih]);
            if (engineStats.files) {
                if ((body.fileMustInclude || []).length) {
                    var isRegex = /^\/(.*)\/(.*)$/;
                    fileMustInclude = body.fileMustInclude.map((function(el) {
                        if ((el || "").match(isRegex)) {
                            var parts = isRegex.exec(el);
                            try {
                                return new RegExp(parts[1], parts[2]);
                            } catch (e) {}
                        }
                        return el;
                    })), engineStats.files.find((function(file, idx) {
                        return !!fileMustInclude.find((function(reg) {
                            return reg = "string" == typeof reg ? new RegExp(reg) : reg, !!safeStatelessRegex(file.name, reg, 500) && (engineStats.guessedFileIdx = idx, 
                            !0);
                        }));
                    }));
                }
                body.guessFileIdx && !engineStats.hasOwnProperty("guessedFileIdx") && (engineStats.guessedFileIdx = GuessFileIdx(engineStats.files, body.guessFileIdx));
            }
            res.end(JSON.stringify(engineStats));
        }));
    })), router.all("/create", (function(req, res) {
        var from = req.body.from, blob = req.body.blob;
        if ("string" == typeof blob) onBlob(null, Buffer.from(blob, "hex")); else {
            if ("string" != typeof from) return onErr();
            0 === from.indexOf("http") ? fetch(from).then((function(res) {
                return res.buffer();
            })).then((function(buf) {
                onBlob(null, buf);
            })).catch(onErr) : fs.readFile(req.body.from, onBlob);
        }
        function onBlob(err, blob) {
            if (err) return onErr(err);
            var ih = null, parsed = null;
            try {
                ih = (parsed = parseTorrentFile(blob)).infoHash.toLowerCase();
            } catch (e) {
                return onErr(e);
            }
            createEngine(ih, {
                torrent: parsed
            }, (function(err, res) {
                err ? onErr(err) : onSuccess(res);
            }));
        }
        function onErr(err) {
            res.writeHead(500), res.end(), console.error(err);
        }
        function onSuccess(result) {
            res.writeHead(200, jsonHead), res.end(JSON.stringify(getStatistics(result)));
        }
    })), router.get("/:infoHash/remove", (function(req, res) {
        removeEngine(req.params.infoHash, (function() {
            res.writeHead(200, jsonHead), res.end(JSON.stringify({}));
        }));
    })), router.get("/removeAll", (function(req, res) {
        for (ih in engines) removeEngine(ih);
        res.writeHead(200, jsonHead), res.end(JSON.stringify({}));
    })), router.get("/:infoHash/:idx", sendDLNAHeaders, handleTorrent), router.get("/:infoHash/:idx/*", sendDLNAHeaders, handleTorrent), 
    EngineFS.on("stream-open", (function(infoHash, fileIndex) {
        var e = getEngine(infoHash);
        e.ready((function() {
            var file = e.torrent.files[fileIndex];
            if (!file.__cacheEvents) {
                file.__cacheEvents = !0, EngineFS.emit("stream-created", infoHash, fileIndex, file);
                for (var startPiece = file.offset / e.torrent.pieceLength | 0, endPiece = (file.offset + file.length - 1) / e.torrent.pieceLength | 0, fpieces = [], i = startPiece; i <= endPiece; i++) e.bitfield.get(i) || fpieces.push(i);
                var filePieces = Math.ceil(file.length / e.torrent.pieceLength), onDownload = function(p) {
                    if (void 0 !== p) {
                        var idx = fpieces.indexOf(p);
                        if (-1 == idx) return;
                        fpieces.splice(idx, 1);
                    }
                    if (EngineFS.emit("stream-progress:" + infoHash + ":" + fileIndex, (filePieces - fpieces.length) / filePieces, fpath), 
                    !fpieces.length) {
                        var fpath = e.store.getDest && e.store.getDest(fileIndex);
                        EngineFS.emit("stream-cached:" + infoHash + ":" + fileIndex, fpath, file), EngineFS.emit("stream-cached", infoHash, fileIndex, fpath, file), 
                        e.removeListener("download", onDownload), e.removeListener("verify", onDownload);
                    }
                };
                e.on("verify", onDownload), onDownload();
                var vLen = e.torrent.realPieceLength || e.torrent.verificationLen || e.torrent.pieceLength, ratio = (startPiece = file.offset / vLen | 0, 
                endPiece = (file.offset + file.length - 1) / vLen | 0, vLen / e.torrent.pieceLength);
                e.buffer || e.select(startPiece * ratio, (endPiece + 1) * ratio, !1);
            }
        }));
    })), new Counter(EngineFS, "stream-open", "stream-close", (function(hash, idx) {
        return hash + ":" + idx;
    }), (function(hash, idx) {
        Emit([ "stream-active", hash, idx ]);
    }), (function(hash, idx) {
        existsEngine(hash) && Emit([ "stream-inactive", hash, idx ]);
    }), (function() {
        return EngineFS.STREAM_TIMEOUT;
    })), new Counter(EngineFS, "stream-open", "stream-close", (function(hash, idx) {
        return hash;
    }), (function(hash) {
        Emit([ "engine-active", hash ]);
    }), (function(hash) {
        existsEngine(hash) && Emit([ "engine-inactive", hash ]);
    }), (function() {
        return EngineFS.ENGINE_TIMEOUT;
    })), new Counter(EngineFS, "stream-created", "stream-cached", (function(hash, idx) {
        return hash;
    }), (function() {}), (function(hash) {
        existsEngine(hash) && Emit([ "engine-idle", hash ]);
    }), (function() {
        return EngineFS.STREAM_TIMEOUT;
    })), EngineFS.http = function(port) {
        var server = __webpack_require__(11).createServer(createApp());
        return port && server.listen(port), server;
    }, EngineFS.app = createApp, EngineFS.sendCORSHeaders = sendCORSHeaders, EngineFS.sendDLNAHeaders = sendDLNAHeaders, 
    EngineFS.create = createEngine, EngineFS.exists = existsEngine, EngineFS.getFilename = function(infoHash, fileIdx) {
        return !!existsEngine(infoHash) && (getEngine(infoHash).files[fileIdx] || {}).name;
    }, EngineFS.remove = removeEngine, EngineFS.settings = function(infoHash, settings) {
        var e = engines[infoHash];
        e && (settings.hasOwnProperty("writeQueue") && e.store.writequeue && e.ready((function() {
            "PAUSE" == settings.writeQueue ? (e.store.writequeue.pause(), setTimeout((function() {
                e.store.writequeue.resume();
            }), 5e4)) : e.store.writequeue.resume();
        })), "PAUSE" == settings.swarm && e.swarm.pause(), "RESUME" == settings.swarm && e.swarm.resume());
    }, EngineFS.stats = function(infoHash, idx) {
        return engines[infoHash] ? getStatistics(engines[infoHash], idx) : null;
    }, EngineFS.list = listEngines, EngineFS.getSelections = getSelections, EngineFS.keepConcurrency = function(hash, concurrency) {
        const enginesCount = listEngines().length + 1;
        if (!concurrency || enginesCount <= concurrency) return Promise.resolve();
        console.log("keep concurrency", concurrency);
        const enginesToRemove = listEngines().filter((ih => ih.toLowerCase() !== hash.toLowerCase() && 0 === getSelections(ih).length)).slice(0, enginesCount - concurrency);
        return enginesToRemove.length ? new Promise((resolve => {
            enginesToRemove.forEach(((ih, idx) => {
                console.log(`remove engine ${ih}`), removeEngine(ih, (() => {
                    idx === enginesToRemove.length - 1 && resolve();
                }));
            }));
        })) : Promise.resolve();
    }, EngineFS.prewarmStream = prewarmStream, EngineFS.router = externalRouter, EngineFS.loggingEnabled = !1, 
    EngineFS.getRootRouter = function() {
        return router;
    }, module.exports = EngineFS;
}
