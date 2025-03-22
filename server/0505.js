function(module, exports, __webpack_require__) {
    var Stream = __webpack_require__(3), util = __webpack_require__(0), Buffer = __webpack_require__(153);
    function PullStream() {
        if (!(this instanceof PullStream)) return new PullStream;
        Stream.Duplex.call(this, {
            decodeStrings: !1,
            objectMode: !0
        }), this.buffer = Buffer.from("");
        var self = this;
        self.on("finish", (function() {
            self.finished = !0, self.emit("chunk", !1);
        }));
    }
    Stream.Writable && Stream.Writable.prototype.destroy || (Stream = __webpack_require__(77)), 
    util.inherits(PullStream, Stream.Duplex), PullStream.prototype._write = function(chunk, e, cb) {
        this.buffer = Buffer.concat([ this.buffer, chunk ]), this.cb = cb, this.emit("chunk");
    }, PullStream.prototype.stream = function(eof, includeEof) {
        var done, p = Stream.PassThrough(), self = this;
        function cb() {
            if ("function" == typeof self.cb) {
                var callback = self.cb;
                return self.cb = void 0, callback();
            }
        }
        function pull() {
            var packet;
            if (self.buffer && self.buffer.length) {
                if ("number" == typeof eof) packet = self.buffer.slice(0, eof), self.buffer = self.buffer.slice(eof), 
                eof -= packet.length, done = !eof; else {
                    var match = self.buffer.indexOf(eof);
                    if (-1 !== match) self.match = match, includeEof && (match += eof.length), packet = self.buffer.slice(0, match), 
                    self.buffer = self.buffer.slice(match), done = !0; else {
                        var len = self.buffer.length - eof.length;
                        len <= 0 ? cb() : (packet = self.buffer.slice(0, len), self.buffer = self.buffer.slice(len));
                    }
                }
                packet && p.write(packet, (function() {
                    (0 === self.buffer.length || eof.length && self.buffer.length <= eof.length) && cb();
                }));
            }
            if (done) self.removeListener("chunk", pull), p.end(); else if (self.finished) return self.removeListener("chunk", pull), 
            void self.emit("error", new Error("FILE_ENDED"));
        }
        return self.on("chunk", pull), pull(), p;
    }, PullStream.prototype.pull = function(eof, includeEof) {
        if (0 === eof) return Promise.resolve("");
        if (!isNaN(eof) && this.buffer.length > eof) {
            var data = this.buffer.slice(0, eof);
            return this.buffer = this.buffer.slice(eof), Promise.resolve(data);
        }
        var rejectHandler, pullStreamRejectHandler, buffer = Buffer.from(""), self = this, concatStream = Stream.Transform();
        return concatStream._transform = function(d, e, cb) {
            buffer = Buffer.concat([ buffer, d ]), cb();
        }, new Promise((function(resolve, reject) {
            if (rejectHandler = reject, pullStreamRejectHandler = function(e) {
                self.__emittedError = e, reject(e);
            }, self.finished) return reject(new Error("FILE_ENDED"));
            self.once("error", pullStreamRejectHandler), self.stream(eof, includeEof).on("error", reject).pipe(concatStream).on("finish", (function() {
                resolve(buffer);
            })).on("error", reject);
        })).finally((function() {
            self.removeListener("error", rejectHandler), self.removeListener("error", pullStreamRejectHandler);
        }));
    }, PullStream.prototype._read = function() {}, module.exports = PullStream;
}
