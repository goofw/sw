function(module, exports, __webpack_require__) {
    var fs = __webpack_require__(2), path = __webpack_require__(4), mkdirp = __webpack_require__(132), crypto = __webpack_require__(9), _ = __webpack_require__(183), debug = __webpack_require__(8)("p2p-stream-storage-circular"), noop = function() {}, SANTINEL_BUFFER_FS = new Buffer("fs");
    module.exports = function(dir, torrent, opts, engine) {
        var that = {}, piecesFolder = path.join(dir, "pieces");
        function piecePath(idx) {
            return path.join(piecesFolder, idx + "");
        }
        if ("memory" != (opts = _.extend({
            type: "memory",
            size: 31457280
        }, opts)).type && "fs" != opts.type) throw "storage-circular: only memory and fs type supported";
        function writePieceToFS(p) {
            fs.writeFile(piecePath(p.idx), p.buf, (function(err) {
                err ? debug(err) : (debug("wrote %s piece to fs", p.idx), p.buf = SANTINEL_BUFFER_FS);
            }));
        }
        "fs" == opts.type && (fs.existsSync(piecesFolder) || mkdirp.sync(piecesFolder)), 
        torrent.pieceLength, that.read = function(index, cb) {
            debug("read %s", index);
            var p = find(index);
            p ? (p.atime = new Date, p.buf === SANTINEL_BUFFER_FS ? fs.readFile(piecePath(p.idx), cb) : cb(null, p.buf)) : cb(new Error("piece not found in circular buf"));
        }, that.write = function(index, buffer) {
            if (pieces.length) {
                debug("write %s", index);
                var idx, oldest, p = find(index) || pieces.find((function(p) {
                    return !p.buf;
                }));
                if (!p) {
                    if (oldest = null, pieces.forEach((function(p) {
                        p.buf && p.committed && (isPieceSelected(p.idx) || (function(p) {
                            return engine.lockedPieces.indexOf(p) > -1;
                        })(p.idx) || (!oldest || oldest.atime.getTime() > p.atime.getTime()) && (oldest = p));
                    })), !(p = oldest)) throw "circular buf is full, unable to free; unfreeable pieces: " + pieces.filter((function(p) {
                        return !p.committed || isPieceSelected(p.idx);
                    })).map((function(p) {
                        return p.idx + (p.committed ? "" : "uc");
                    })).join(", ");
                    debug("free %s", p.idx), p.buf === SANTINEL_BUFFER_FS && (idx = p.idx, fs.unlink(piecePath(idx), (function(err) {
                        if (err) return debug("could not remove %s piece from fs", idx), void debug(err);
                        debug("remove %s piece from fs", idx);
                    }))), engine.resetPiece(p.idx);
                }
                p.buf = buffer, p.idx = index, p.atime = new Date;
            }
        }, that.commit = function(start, end, cb) {
            debug("commit %s %s", start, end), cb || (cb = noop);
            for (var i = start; i <= end; i++) {
                var p = find(i);
                p && (p.committed = !0, "fs" == opts.type && writePieceToFS(p));
            }
            cb(null, !0);
        }, that.verify = function(index, map) {
            debug("verify %s", index);
            for (var ratio = torrent.verificationLen ? torrent.verificationLen / torrent.pieceLength : 1, real = Math.floor(index / ratio), start = real * ratio, end = Math.min(torrent.pieces.length, (real + 1) * ratio), hash = crypto.createHash("sha1"), i = start; i != end; i++) {
                if (!engine.bitfield.get(i)) return null;
                var p = find(i);
                if (!p) return null;
                hash.update(p.buf);
            }
            return {
                success: hash.digest("hex") === map[real],
                start: start,
                end: end
            };
        }, that.close = function(cb) {
            cb || (cb = noop), pieces = [], cb();
        };
        for (var pieces = [], i = 0; i != Math.floor(opts.size / torrent.pieceLength); i++) pieces.push(new Piece);
        function Piece() {
            this.idx = void 0, this.buf = void 0, this.committed = new Date(0), this.atime = void 0;
        }
        function find(idx) {
            return pieces.find((function(p) {
                return p.idx === idx;
            }));
        }
        function isPieceSelected(p) {
            for (var i = 0; i < engine.selection.length; i++) {
                var sel = engine.selection[i];
                if (sel.hasOwnProperty("selectTo") && p >= sel.readFrom && p <= sel.selectTo) return !0;
            }
            return !1;
        }
        return debug("%s pieces created", pieces.length), that;
    };
}
