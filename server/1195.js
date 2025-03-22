function(module, exports, __webpack_require__) {
    var Stream = __webpack_require__(3).Stream;
    module.exports = function(fs) {
        return {
            ReadStream: function ReadStream(path, options) {
                if (!(this instanceof ReadStream)) return new ReadStream(path, options);
                Stream.call(this);
                var self = this;
                this.path = path, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", 
                this.mode = 438, this.bufferSize = 65536, options = options || {};
                for (var keys = Object.keys(options), index = 0, length = keys.length; index < length; index++) {
                    var key = keys[index];
                    this[key] = options[key];
                }
                if (this.encoding && this.setEncoding(this.encoding), void 0 !== this.start) {
                    if ("number" != typeof this.start) throw TypeError("start must be a Number");
                    if (void 0 === this.end) this.end = 1 / 0; else if ("number" != typeof this.end) throw TypeError("end must be a Number");
                    if (this.start > this.end) throw new Error("start must be <= end");
                    this.pos = this.start;
                }
                null === this.fd ? fs.open(this.path, this.flags, this.mode, (function(err, fd) {
                    if (err) return self.emit("error", err), void (self.readable = !1);
                    self.fd = fd, self.emit("open", fd), self._read();
                })) : process.nextTick((function() {
                    self._read();
                }));
            },
            WriteStream: function WriteStream(path, options) {
                if (!(this instanceof WriteStream)) return new WriteStream(path, options);
                Stream.call(this), this.path = path, this.fd = null, this.writable = !0, this.flags = "w", 
                this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, options = options || {};
                for (var keys = Object.keys(options), index = 0, length = keys.length; index < length; index++) {
                    var key = keys[index];
                    this[key] = options[key];
                }
                if (void 0 !== this.start) {
                    if ("number" != typeof this.start) throw TypeError("start must be a Number");
                    if (this.start < 0) throw new Error("start must be >= zero");
                    this.pos = this.start;
                }
                this.busy = !1, this._queue = [], null === this.fd && (this._open = fs.open, this._queue.push([ this._open, this.path, this.flags, this.mode, void 0 ]), 
                this.flush());
            }
        };
    };
}
