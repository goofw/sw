function(module, exports, __webpack_require__) {
    var Stream = __webpack_require__(3).Stream, util = __webpack_require__(0);
    function DelayedStream() {
        this.source = null, this.dataSize = 0, this.maxDataSize = 1048576, this.pauseStream = !0, 
        this._maxDataSizeExceeded = !1, this._released = !1, this._bufferedEvents = [];
    }
    module.exports = DelayedStream, util.inherits(DelayedStream, Stream), DelayedStream.create = function(source, options) {
        var delayedStream = new this;
        for (var option in options = options || {}) delayedStream[option] = options[option];
        delayedStream.source = source;
        var realEmit = source.emit;
        return source.emit = function() {
            return delayedStream._handleEmit(arguments), realEmit.apply(source, arguments);
        }, source.on("error", (function() {})), delayedStream.pauseStream && source.pause(), 
        delayedStream;
    }, Object.defineProperty(DelayedStream.prototype, "readable", {
        configurable: !0,
        enumerable: !0,
        get: function() {
            return this.source.readable;
        }
    }), DelayedStream.prototype.setEncoding = function() {
        return this.source.setEncoding.apply(this.source, arguments);
    }, DelayedStream.prototype.resume = function() {
        this._released || this.release(), this.source.resume();
    }, DelayedStream.prototype.pause = function() {
        this.source.pause();
    }, DelayedStream.prototype.release = function() {
        this._released = !0, this._bufferedEvents.forEach(function(args) {
            this.emit.apply(this, args);
        }.bind(this)), this._bufferedEvents = [];
    }, DelayedStream.prototype.pipe = function() {
        var r = Stream.prototype.pipe.apply(this, arguments);
        return this.resume(), r;
    }, DelayedStream.prototype._handleEmit = function(args) {
        this._released ? this.emit.apply(this, args) : ("data" === args[0] && (this.dataSize += args[1].length, 
        this._checkIfMaxDataSizeExceeded()), this._bufferedEvents.push(args));
    }, DelayedStream.prototype._checkIfMaxDataSizeExceeded = function() {
        if (!(this._maxDataSizeExceeded || this.dataSize <= this.maxDataSize)) {
            this._maxDataSizeExceeded = !0;
            var message = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
            this.emit("error", new Error(message));
        }
    };
}
