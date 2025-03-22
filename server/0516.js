function(module, exports, __webpack_require__) {
    module.exports = FileWriter;
    var fs = __webpack_require__(59), Writer = __webpack_require__(104), inherits = __webpack_require__(6), EOF = {};
    function FileWriter(props) {
        if (!(this instanceof FileWriter)) throw new Error("FileWriter must be called as constructor.");
        if ("File" !== props.type || !props.File) throw new Error("Non-file type " + props.type);
        this._buffer = [], this._bytesWritten = 0, Writer.call(this, props);
    }
    inherits(FileWriter, Writer), FileWriter.prototype._create = function() {
        var self = this;
        if (!self._stream) {
            var so = {};
            self.props.flags && (so.flags = self.props.flags), so.mode = Writer.filemode, self._old && self._old.blksize && (so.bufferSize = self._old.blksize), 
            self._stream = fs.createWriteStream(self._path, so), self._stream.on("open", (function() {
                self.ready = !0, self._buffer.forEach((function(c) {
                    c === EOF ? self._stream.end() : self._stream.write(c);
                })), self.emit("ready"), self.emit("drain");
            })), self._stream.on("error", (function(er) {
                self.emit("error", er);
            })), self._stream.on("drain", (function() {
                self.emit("drain");
            })), self._stream.on("close", (function() {
                self._finish();
            }));
        }
    }, FileWriter.prototype.write = function(c) {
        if (this._bytesWritten += c.length, !this.ready) {
            if (!Buffer.isBuffer(c) && "string" != typeof c) throw new Error("invalid write data");
            return this._buffer.push(c), !1;
        }
        var ret = this._stream.write(c);
        return !1 === ret && this._stream._queue ? this._stream._queue.length <= 2 : ret;
    }, FileWriter.prototype.end = function(c) {
        return c && this.write(c), this.ready ? this._stream.end() : (this._buffer.push(EOF), 
        !1);
    }, FileWriter.prototype._finish = function() {
        "number" == typeof this.size && this._bytesWritten !== this.size && this.error("Did not get expected byte count.\nexpect: " + this.size + "\nactual: " + this._bytesWritten), 
        Writer.prototype._finish.call(this);
    };
}
