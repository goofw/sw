function(module, exports, __webpack_require__) {
    var stream = __webpack_require__(846), nextEvent = __webpack_require__(852), Box = __webpack_require__(429), EMPTY = Buffer.alloc(0);
    class Decoder extends stream.Writable {
        constructor(opts) {
            super(opts), this.destroyed = !1, this._pending = 0, this._missing = 0, this._ignoreEmpty = !1, 
            this._buf = null, this._str = null, this._cb = null, this._ondrain = null, this._writeBuffer = null, 
            this._writeCb = null, this._ondrain = null, this._kick();
        }
        destroy(err) {
            this.destroyed || (this.destroyed = !0, err && this.emit("error", err), this.emit("close"));
        }
        _write(data, enc, next) {
            if (!this.destroyed) {
                for (var drained = !this._str || !this._str._writableState.needDrain; data.length && !this.destroyed; ) {
                    if (!this._missing && !this._ignoreEmpty) return this._writeBuffer = data, void (this._writeCb = next);
                    var consumed = data.length < this._missing ? data.length : this._missing;
                    if (this._buf ? data.copy(this._buf, this._buf.length - this._missing) : this._str && (drained = this._str.write(consumed === data.length ? data : data.slice(0, consumed))), 
                    this._missing -= consumed, !this._missing) {
                        var buf = this._buf, cb = this._cb, stream = this._str;
                        this._buf = this._cb = this._str = this._ondrain = null, drained = !0, this._ignoreEmpty = !1, 
                        stream && stream.end(), cb && cb(buf);
                    }
                    data = consumed === data.length ? EMPTY : data.slice(consumed);
                }
                if (this._pending && !this._missing) return this._writeBuffer = data, void (this._writeCb = next);
                drained ? next() : this._ondrain(next);
            }
        }
        _buffer(size, cb) {
            this._missing = size, this._buf = Buffer.alloc(size), this._cb = cb;
        }
        _stream(size, cb) {
            return this._missing = size, this._str = new MediaData(this), this._ondrain = nextEvent(this._str, "drain"), 
            this._pending++, this._str.on("end", (() => {
                this._pending--, this._kick();
            })), this._cb = cb, this._str;
        }
        _readBox() {
            const bufferHeaders = (len, buf) => {
                this._buffer(len, (additionalBuf => {
                    buf = buf ? Buffer.concat([ buf, additionalBuf ]) : additionalBuf;
                    var headers = Box.readHeaders(buf);
                    "number" == typeof headers ? bufferHeaders(headers - buf.length, buf) : (this._pending++, 
                    this._headers = headers, this.emit("box", headers));
                }));
            };
            bufferHeaders(8);
        }
        stream() {
            if (!this._headers) throw new Error("this function can only be called once after 'box' is emitted");
            var headers = this._headers;
            return this._headers = null, this._stream(headers.contentLen, null);
        }
        decode(cb) {
            if (!this._headers) throw new Error("this function can only be called once after 'box' is emitted");
            var headers = this._headers;
            this._headers = null, this._buffer(headers.contentLen, (buf => {
                var box = Box.decodeWithoutHeaders(headers, buf);
                cb(box), this._pending--, this._kick();
            }));
        }
        ignore() {
            if (!this._headers) throw new Error("this function can only be called once after 'box' is emitted");
            var headers = this._headers;
            this._headers = null, this._missing = headers.contentLen, 0 === this._missing && (this._ignoreEmpty = !0), 
            this._cb = () => {
                this._pending--, this._kick();
            };
        }
        _kick() {
            if (!this._pending && (this._buf || this._str || this._readBox(), this._writeBuffer)) {
                var next = this._writeCb, buffer = this._writeBuffer;
                this._writeBuffer = null, this._writeCb = null, this._write(buffer, null, next);
            }
        }
    }
    class MediaData extends stream.PassThrough {
        constructor(parent) {
            super(), this._parent = parent, this.destroyed = !1;
        }
        destroy(err) {
            this.destroyed || (this.destroyed = !0, this._parent.destroy(err), err && this.emit("error", err), 
            this.emit("close"));
        }
    }
    module.exports = Decoder;
}
