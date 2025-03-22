function(module, exports, __webpack_require__) {
    var stream = __webpack_require__(793), util = __webpack_require__(0), bagpipe = __webpack_require__(184), debug = __webpack_require__(8)("p2p-file-stream"), FileStream = function(engine, file, opts) {
        if (!(this instanceof FileStream)) return new FileStream(engine, file, opts);
        stream.Readable.call(this), opts || (opts = {}), opts.start || (opts.start = 0), 
        opts.end || "number" == typeof opts.end || (opts.end = file.length - 1);
        var offset = opts.start + file.offset, pieceLength = engine.torrent.pieceLength;
        this.length = opts.end - opts.start + 1, this.startPiece = offset / pieceLength | 0, 
        this.endPiece = (opts.end + file.offset) / pieceLength | 0, this.bufferPieces = engine.buffer ? engine.buffer / pieceLength | 0 : null, 
        this._destroyed = !1, this._engine = engine, this._piece = this.startPiece, this._missing = this.length, 
        this._critical = 0 | Math.min(1048576 / pieceLength, 4), this._readpipe = new bagpipe(2), 
        this._offset = offset - this.startPiece * pieceLength, this.selection = engine.select(this.startPiece, this.endPiece, !opts.hasOwnProperty("priority") || opts.priority, this.notify.bind(this)), 
        this.bufferPieces && (this.selection.selectTo = Math.min(this.endPiece, this._piece + this.bufferPieces), 
        this.selection.readFrom = this._piece), debug("open file stream with selection %s:%s ", +this.startPiece, this.endPiece);
    };
    util.inherits(FileStream, stream.Readable), FileStream.prototype.notify = function() {
        this.emit("notify");
    }, FileStream.prototype._read = function() {
        var self = this;
        if (debug("read piece " + this._piece), this._missing) {
            if (!this._engine.bitfield.get(this._piece)) return debug("WAIT for piece " + this._piece), 
            !this._engine.selection.some((function(sel) {
                return self._piece <= sel.to && sel.from + sel.offset <= self._piece;
            })) && (debug("Piece %s has no selection", this._piece), this._engine.select(this._piece, this.selection.to, !0, this.notify.bind(this))), 
            this.once("notify", self._read), this._engine.critical(this._piece, this._critical), 
            void this._engine.refresh();
            var pieceToGet = this._piece;
            this._engine.lockedPieces.push(pieceToGet), this._readpipe.push(this._engine.store.read, this._piece++, (function(err, buffer) {
                var idx = self._engine.lockedPieces.indexOf(pieceToGet);
                if (self._engine.lockedPieces.splice(idx, 1), err && self._engine.emit("error", err), 
                !self._destroyed && buffer) {
                    if (err) return self.destroy(err);
                    if (self._offset && (buffer = buffer.slice(self._offset), self._offset = 0), self._missing < buffer.length && (buffer = buffer.slice(0, self._missing)), 
                    self._missing -= buffer.length, !self._missing) return self.push(buffer), void self.push(null);
                    self.push(buffer);
                }
            })), this.bufferPieces && (this.selection.selectTo = Math.min(this.endPiece, this._piece + this.bufferPieces), 
            this.selection.readFrom = this._piece, this._engine.refresh(), debug("bufferPieces select from %s to %s", this._piece, this.selection.selectTo));
        }
    }, FileStream.prototype.destroy = function() {
        debug("destroy filestream readFrom:%s selectTo:%s", this.selection.readFrom, this.selection.selectTo), 
        this._destroyed || (this._destroyed = !0, this.emit("close"));
    }, module.exports = FileStream;
}
