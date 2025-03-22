function(module, exports, __webpack_require__) {
    var stream = __webpack_require__(3), util = __webpack_require__(0), timers = __webpack_require__(117);
    function createLineStream(readStream, options) {
        if (!readStream) throw new Error("expected readStream");
        if (!readStream.readable) throw new Error("readStream must be readable");
        var ls = new LineStream(options);
        return readStream.pipe(ls), ls;
    }
    function LineStream(options) {
        stream.Transform.call(this, options), options = options || {}, this._readableState.objectMode = !0, 
        this._lineBuffer = [], this._keepEmptyLines = options.keepEmptyLines || !1, this._lastChunkEndedWithCR = !1;
        var self = this;
        this.on("pipe", (function(src) {
            self.encoding || src instanceof stream.Readable && (self.encoding = src._readableState.encoding);
        }));
    }
    module.exports = function(readStream, options) {
        return module.exports.createStream(readStream, options);
    }, module.exports.createStream = function(readStream, options) {
        return readStream ? createLineStream(readStream, options) : new LineStream(options);
    }, module.exports.createLineStream = function(readStream) {
        return console.log("WARNING: byline#createLineStream is deprecated and will be removed soon"), 
        createLineStream(readStream);
    }, module.exports.LineStream = LineStream, util.inherits(LineStream, stream.Transform), 
    LineStream.prototype._transform = function(chunk, encoding, done) {
        encoding = encoding || "utf8", Buffer.isBuffer(chunk) && ("buffer" == encoding ? (chunk = chunk.toString(), 
        encoding = "utf8") : chunk = chunk.toString(encoding)), this._chunkEncoding = encoding;
        var lines = chunk.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/g);
        this._lastChunkEndedWithCR && "\n" == chunk[0] && lines.shift(), this._lineBuffer.length > 0 && (this._lineBuffer[this._lineBuffer.length - 1] += lines[0], 
        lines.shift()), this._lastChunkEndedWithCR = "\r" == chunk[chunk.length - 1], this._lineBuffer = this._lineBuffer.concat(lines), 
        this._pushBuffer(encoding, 1, done);
    }, LineStream.prototype._pushBuffer = function(encoding, keep, done) {
        for (;this._lineBuffer.length > keep; ) {
            var line = this._lineBuffer.shift();
            if ((this._keepEmptyLines || line.length > 0) && !this.push(this._reencode(line, encoding))) {
                var self = this;
                return void timers.setImmediate((function() {
                    self._pushBuffer(encoding, keep, done);
                }));
            }
        }
        done();
    }, LineStream.prototype._flush = function(done) {
        this._pushBuffer(this._chunkEncoding, 0, done);
    }, LineStream.prototype._reencode = function(line, chunkEncoding) {
        return this.encoding && this.encoding != chunkEncoding ? new Buffer(line, chunkEncoding).toString(this.encoding) : this.encoding ? line : new Buffer(line, chunkEncoding);
    };
}
