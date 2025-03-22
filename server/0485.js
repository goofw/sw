function(module, exports, __webpack_require__) {
    var util = __webpack_require__(0), Stream = __webpack_require__(3).Stream, DelayedStream = __webpack_require__(1069);
    function CombinedStream() {
        this.writable = !1, this.readable = !0, this.dataSize = 0, this.maxDataSize = 2097152, 
        this.pauseStreams = !0, this._released = !1, this._streams = [], this._currentStream = null, 
        this._insideLoop = !1, this._pendingNext = !1;
    }
    module.exports = CombinedStream, util.inherits(CombinedStream, Stream), CombinedStream.create = function(options) {
        var combinedStream = new this;
        for (var option in options = options || {}) combinedStream[option] = options[option];
        return combinedStream;
    }, CombinedStream.isStreamLike = function(stream) {
        return "function" != typeof stream && "string" != typeof stream && "boolean" != typeof stream && "number" != typeof stream && !Buffer.isBuffer(stream);
    }, CombinedStream.prototype.append = function(stream) {
        if (CombinedStream.isStreamLike(stream)) {
            if (!(stream instanceof DelayedStream)) {
                var newStream = DelayedStream.create(stream, {
                    maxDataSize: 1 / 0,
                    pauseStream: this.pauseStreams
                });
                stream.on("data", this._checkDataSize.bind(this)), stream = newStream;
            }
            this._handleErrors(stream), this.pauseStreams && stream.pause();
        }
        return this._streams.push(stream), this;
    }, CombinedStream.prototype.pipe = function(dest, options) {
        return Stream.prototype.pipe.call(this, dest, options), this.resume(), dest;
    }, CombinedStream.prototype._getNext = function() {
        if (this._currentStream = null, this._insideLoop) this._pendingNext = !0; else {
            this._insideLoop = !0;
            try {
                do {
                    this._pendingNext = !1, this._realGetNext();
                } while (this._pendingNext);
            } finally {
                this._insideLoop = !1;
            }
        }
    }, CombinedStream.prototype._realGetNext = function() {
        var stream = this._streams.shift();
        void 0 !== stream ? "function" == typeof stream ? stream(function(stream) {
            CombinedStream.isStreamLike(stream) && (stream.on("data", this._checkDataSize.bind(this)), 
            this._handleErrors(stream)), this._pipeNext(stream);
        }.bind(this)) : this._pipeNext(stream) : this.end();
    }, CombinedStream.prototype._pipeNext = function(stream) {
        if (this._currentStream = stream, CombinedStream.isStreamLike(stream)) return stream.on("end", this._getNext.bind(this)), 
        void stream.pipe(this, {
            end: !1
        });
        var value = stream;
        this.write(value), this._getNext();
    }, CombinedStream.prototype._handleErrors = function(stream) {
        var self = this;
        stream.on("error", (function(err) {
            self._emitError(err);
        }));
    }, CombinedStream.prototype.write = function(data) {
        this.emit("data", data);
    }, CombinedStream.prototype.pause = function() {
        this.pauseStreams && (this.pauseStreams && this._currentStream && "function" == typeof this._currentStream.pause && this._currentStream.pause(), 
        this.emit("pause"));
    }, CombinedStream.prototype.resume = function() {
        this._released || (this._released = !0, this.writable = !0, this._getNext()), this.pauseStreams && this._currentStream && "function" == typeof this._currentStream.resume && this._currentStream.resume(), 
        this.emit("resume");
    }, CombinedStream.prototype.end = function() {
        this._reset(), this.emit("end");
    }, CombinedStream.prototype.destroy = function() {
        this._reset(), this.emit("close");
    }, CombinedStream.prototype._reset = function() {
        this.writable = !1, this._streams = [], this._currentStream = null;
    }, CombinedStream.prototype._checkDataSize = function() {
        if (this._updateDataSize(), !(this.dataSize <= this.maxDataSize)) {
            var message = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
            this._emitError(new Error(message));
        }
    }, CombinedStream.prototype._updateDataSize = function() {
        this.dataSize = 0;
        var self = this;
        this._streams.forEach((function(stream) {
            stream.dataSize && (self.dataSize += stream.dataSize);
        })), this._currentStream && this._currentStream.dataSize && (this.dataSize += this._currentStream.dataSize);
    }, CombinedStream.prototype._emitError = function(err) {
        this._reset(), this.emit("error", err);
    };
}
