function(module, exports, __webpack_require__) {
    module.exports = FileReader;
    var fs = __webpack_require__(59), inherits = __webpack_require__(6), Reader = __webpack_require__(82), EOF = {
        EOF: !0
    }, CLOSE = {
        CLOSE: !0
    };
    function FileReader(props) {
        if (!(this instanceof FileReader)) throw new Error("FileReader must be called as constructor.");
        if (!("Link" === props.type && props.Link || "File" === props.type && props.File)) throw new Error("Non-file type " + props.type);
        this._buffer = [], this._bytesEmitted = 0, Reader.call(this, props);
    }
    inherits(FileReader, Reader), FileReader.prototype._getStream = function() {
        var self = this, stream = self._stream = fs.createReadStream(self._path, self.props);
        self.props.blksize && (stream.bufferSize = self.props.blksize), stream.on("open", self.emit.bind(self, "open")), 
        stream.on("data", (function(c) {
            self._bytesEmitted += c.length, c.length && (self._paused || self._buffer.length ? (self._buffer.push(c), 
            self._read()) : self.emit("data", c));
        })), stream.on("end", (function() {
            self._paused || self._buffer.length ? (self._buffer.push(EOF), self._read()) : self.emit("end"), 
            self._bytesEmitted !== self.props.size && self.error("Didn't get expected byte count\nexpect: " + self.props.size + "\nactual: " + self._bytesEmitted);
        })), stream.on("close", (function() {
            self._paused || self._buffer.length ? (self._buffer.push(CLOSE), self._read()) : self.emit("close");
        })), stream.on("error", (function(e) {
            self.emit("error", e);
        })), self._read();
    }, FileReader.prototype._read = function() {
        if (!this._paused) {
            if (!this._stream) return this._getStream();
            if (this._buffer.length) {
                for (var buf = this._buffer, i = 0, l = buf.length; i < l; i++) {
                    var c = buf[i];
                    if (c === EOF ? this.emit("end") : c === CLOSE ? this.emit("close") : this.emit("data", c), 
                    this._paused) return void (this._buffer = buf.slice(i));
                }
                this._buffer.length = 0;
            }
        }
    }, FileReader.prototype.pause = function(who) {
        this._paused || (who = who || this, this._paused = !0, this._stream && this._stream.pause(), 
        this.emit("pause", who));
    }, FileReader.prototype.resume = function(who) {
        this._paused && (who = who || this, this.emit("resume", who), this._paused = !1, 
        this._stream && this._stream.resume(), this._read());
    };
}
