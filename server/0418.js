function(module, exports, __webpack_require__) {
    "use strict";
    var Stream = __webpack_require__(37), handleRollover = function(value, reference) {
        var direction = 1;
        for (value > reference && (direction = -1); Math.abs(reference - value) > 4294967296; ) value += 8589934592 * direction;
        return value;
    }, TimestampRolloverStream = function TimestampRolloverStream(type) {
        var lastDTS, referenceDTS;
        TimestampRolloverStream.prototype.init.call(this), this.type_ = type || "shared", 
        this.push = function(data) {
            "shared" !== this.type_ && data.type !== this.type_ || (void 0 === referenceDTS && (referenceDTS = data.dts), 
            data.dts = handleRollover(data.dts, referenceDTS), data.pts = handleRollover(data.pts, referenceDTS), 
            lastDTS = data.dts, this.trigger("data", data));
        }, this.flush = function() {
            referenceDTS = lastDTS, this.trigger("done");
        }, this.endTimeline = function() {
            this.flush(), this.trigger("endedtimeline");
        }, this.discontinuity = function() {
            referenceDTS = void 0, lastDTS = void 0;
        }, this.reset = function() {
            this.discontinuity(), this.trigger("reset");
        };
    };
    TimestampRolloverStream.prototype = new Stream, module.exports = {
        TimestampRolloverStream: TimestampRolloverStream,
        handleRollover: handleRollover
    };
}
