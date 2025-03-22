function(module, exports, __webpack_require__) {
    "use strict";
    var _AdtsStream, Stream = __webpack_require__(37), ONE_SECOND_IN_TS = __webpack_require__(54).ONE_SECOND_IN_TS, ADTS_SAMPLING_FREQUENCIES = [ 96e3, 88200, 64e3, 48e3, 44100, 32e3, 24e3, 22050, 16e3, 12e3, 11025, 8e3, 7350 ];
    (_AdtsStream = function(handlePartialSegments) {
        var buffer, frameNum = 0;
        _AdtsStream.prototype.init.call(this), this.skipWarn_ = function(start, end) {
            this.trigger("log", {
                level: "warn",
                message: "adts skiping bytes " + start + " to " + end + " in frame " + frameNum + " outside syncword"
            });
        }, this.push = function(packet) {
            var frameLength, protectionSkipBytes, oldBuffer, sampleCount, adtsFrameDuration, i = 0;
            if (handlePartialSegments || (frameNum = 0), "audio" === packet.type) {
                var skip;
                for (buffer && buffer.length ? (oldBuffer = buffer, (buffer = new Uint8Array(oldBuffer.byteLength + packet.data.byteLength)).set(oldBuffer), 
                buffer.set(packet.data, oldBuffer.byteLength)) : buffer = packet.data; i + 7 < buffer.length; ) if (255 === buffer[i] && 240 == (246 & buffer[i + 1])) {
                    if ("number" == typeof skip && (this.skipWarn_(skip, i), skip = null), protectionSkipBytes = 2 * (1 & ~buffer[i + 1]), 
                    frameLength = (3 & buffer[i + 3]) << 11 | buffer[i + 4] << 3 | (224 & buffer[i + 5]) >> 5, 
                    adtsFrameDuration = (sampleCount = 1024 * (1 + (3 & buffer[i + 6]))) * ONE_SECOND_IN_TS / ADTS_SAMPLING_FREQUENCIES[(60 & buffer[i + 2]) >>> 2], 
                    buffer.byteLength - i < frameLength) break;
                    this.trigger("data", {
                        pts: packet.pts + frameNum * adtsFrameDuration,
                        dts: packet.dts + frameNum * adtsFrameDuration,
                        sampleCount: sampleCount,
                        audioobjecttype: 1 + (buffer[i + 2] >>> 6 & 3),
                        channelcount: (1 & buffer[i + 2]) << 2 | (192 & buffer[i + 3]) >>> 6,
                        samplerate: ADTS_SAMPLING_FREQUENCIES[(60 & buffer[i + 2]) >>> 2],
                        samplingfrequencyindex: (60 & buffer[i + 2]) >>> 2,
                        samplesize: 16,
                        data: buffer.subarray(i + 7 + protectionSkipBytes, i + frameLength)
                    }), frameNum++, i += frameLength;
                } else "number" != typeof skip && (skip = i), i++;
                "number" == typeof skip && (this.skipWarn_(skip, i), skip = null), buffer = buffer.subarray(i);
            }
        }, this.flush = function() {
            frameNum = 0, this.trigger("done");
        }, this.reset = function() {
            buffer = void 0, this.trigger("reset");
        }, this.endTimeline = function() {
            buffer = void 0, this.trigger("endedtimeline");
        };
    }).prototype = new Stream, module.exports = _AdtsStream;
}
