function(module, exports, __webpack_require__) {
    var fs = __webpack_require__(2), path = __webpack_require__(4), async = __webpack_require__(38), bagpipe = (path = __webpack_require__(4), 
    __webpack_require__(184)), crypto = __webpack_require__(9), _ = __webpack_require__(183), debug = __webpack_require__(8)("p2p-stream-storage"), noop = function() {};
    module.exports = function(dir, torrent, opts, engine) {
        var that = {};
        opts = _.extend({
            storageMemoryCache: !1
        }, opts);
        var files = torrent.files.map((function(file, index) {
            var fd, destPath = path.join(dir, index + ""), openFile = function() {
                dests[index] && destPath != dests[index] && (fd && fs.close(fd), fd = null, destPath = dests[index]), 
                fd = fd || fs.openSync(destPath, fs.existsSync(destPath) ? "r+" : "w+");
            };
            return {
                byteStart: file.offset,
                byteEnd: file.offset + file.length,
                read: function(offset, len, cb) {
                    if (!fd && !fs.existsSync(destPath)) return cb(new Error("File does not exist: " + destPath));
                    openFile(), fs.read(fd, Buffer.alloc(len), 0, len, offset, (function(err, _, buf) {
                        cb(err, buf);
                    }));
                },
                write: function(buf, bufOffset, bufLen, offset, cb) {
                    if (openFile(), bufOffset + bufLen > buf.length) return cb(new Error("bufOffset+bufLen > buf.length: " + bufOffset + " " + bufLen + " / " + buf.length));
                    fs.write(fd, buf, bufOffset, bufLen, offset, cb);
                },
                close: function(cb) {
                    if (void 0 === fd) return process.nextTick(cb);
                    fs.close(fd, cb), fd = null;
                }
            };
        })), writequeue = that.writequeue = new bagpipe(1), pieceLength = torrent.pieceLength, lastFile = torrent.files[torrent.files.length - 1];
        that.read = function(index, cb) {
            if (debug("read %s", index), memHas(index)) return cb(null, memGet(index));
            var len = pieceLength;
            index == torrent.pieces.length - 1 && (len = Math.min(len, (lastFile.length + lastFile.offset) % pieceLength));
            var byteStart = index * pieceLength, byteEnd = byteStart + len, result = null;
            async.each(files, (function(dest, innerCb) {
                var start = Math.max(byteStart, dest.byteStart), end = Math.min(byteEnd, dest.byteEnd);
                if (start >= end) return innerCb();
                var readStart = Math.max(0, byteStart - dest.byteStart), readLen = end - start;
                if (0 == readLen) return innerCb();
                dest.read(readStart, readLen, (function(err, buf) {
                    if (buf) {
                        if (buf.length === len && 1 === files.length) return result = buf, innerCb();
                        result || (result = Buffer.alloc(len)), buf.copy(result, Math.max(0, dest.byteStart - byteStart));
                    }
                    innerCb(err);
                }));
            }), (function(err) {
                cb(err, result);
            }));
        }, that.write = function(index, buffer) {
            var i, buf;
            debug("write %s", index), buf = buffer, debug("memSet %s", i = index), memBumpLru(i) || lru.push(i), 
            mem[i] = buf, lru.forEach((function(idx, i) {
                opts.storageMemoryCache && lru.length > opts.storageMemoryCache / pieceLength && !isNaN(idx) && mem[idx] && mem[idx].free && (mem[idx] = null, 
                lru.splice(i, 1), debug("lru clean %s", idx));
            }));
        }, that.commit = function(start, end, cb) {
            debug("commit %s %s", start, end), cb || (cb = noop);
            for (var pieces = [], i = start; i <= end; i++) pieces.push(i);
            async.each(pieces, (function(i) {
                var byteStart = i * pieceLength, byteEnd = byteStart + pieceLength;
                async.each(files, (function(dest, innerCb) {
                    var start = Math.max(byteStart, dest.byteStart), end = Math.min(byteEnd, dest.byteEnd);
                    if (start >= end) return innerCb();
                    writequeue.push(dest.write, memGet(i), Math.max(start - byteStart, 0), Math.min(end - start, pieceLength), Math.max(0, byteStart - dest.byteStart), innerCb);
                }), (function(err) {
                    if (err) return cb(err);
                    !(function(i) {
                        debug("free memory %s", i), opts.storageMemoryCache ? mem[i] && (mem[i].free = !0) : mem[i] = null;
                    })(i), cb();
                }));
            }), cb);
        }, that.verify = function(index, map) {
            debug("verify %s", index);
            for (var ratio = torrent.verificationLen ? torrent.verificationLen / torrent.pieceLength : 1, real = Math.floor(index / ratio), start = real * ratio, end = Math.min(torrent.pieces.length, (real + 1) * ratio), i = start; i != end; i++) if (!memHas(i) || !engine.bitfield.get(i)) return null;
            var hash = crypto.createHash("sha1");
            for (i = start; i != end; i++) hash.update(memGet(i));
            return {
                success: hash.digest("hex") === map[real],
                start: start,
                end: end
            };
        }, that.close = function(cb) {
            cb || (cb = noop), writequeue.push((function(cb) {
                async.eachSeries(files, (function(file, next) {
                    file.close(next);
                }), cb);
            }), cb);
        };
        var dests = [];
        that.setDest = function(i, path) {
            dests[i] = path;
        }, that.getDest = function(i) {
            return dests[i] || path.join(dir, i + "");
        }, that.memoryBufSize = function() {
            var len = 0;
            return mem.forEach((function(x) {
                x && (len += torrent.pieceLength);
            })), len;
        };
        var mem = [], lru = [];
        function memBumpLru(i) {
            var idx = lru.indexOf(i);
            if (idx > -1) return lru.splice(idx, 1), lru.push(i), !0;
        }
        function memHas(i) {
            return !!mem[i];
        }
        function memGet(i) {
            return debug("memGet %s", i), memBumpLru(i), mem[i];
        }
        return that;
    };
}
