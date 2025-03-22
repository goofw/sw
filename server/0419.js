function(module, exports, __webpack_require__) {
    "use strict";
    var _AacStream, Stream = __webpack_require__(37), aacUtils = __webpack_require__(145);
    (_AacStream = function() {
        var everything = new Uint8Array, timeStamp = 0;
        _AacStream.prototype.init.call(this), this.setTimestamp = function(timestamp) {
            timeStamp = timestamp;
        }, this.push = function(bytes) {
            var bytesLeft, chunk, packet, tempLength, frameSize = 0, byteIndex = 0;
            for (everything.length ? (tempLength = everything.length, (everything = new Uint8Array(bytes.byteLength + tempLength)).set(everything.subarray(0, tempLength)), 
            everything.set(bytes, tempLength)) : everything = bytes; everything.length - byteIndex >= 3; ) if (everything[byteIndex] !== "I".charCodeAt(0) || everything[byteIndex + 1] !== "D".charCodeAt(0) || everything[byteIndex + 2] !== "3".charCodeAt(0)) if (255 != (255 & everything[byteIndex]) || 240 != (240 & everything[byteIndex + 1])) byteIndex++; else {
                if (everything.length - byteIndex < 7) break;
                if (byteIndex + (frameSize = aacUtils.parseAdtsSize(everything, byteIndex)) > everything.length) break;
                packet = {
                    type: "audio",
                    data: everything.subarray(byteIndex, byteIndex + frameSize),
                    pts: timeStamp,
                    dts: timeStamp
                }, this.trigger("data", packet), byteIndex += frameSize;
            } else {
                if (everything.length - byteIndex < 10) break;
                if (byteIndex + (frameSize = aacUtils.parseId3TagSize(everything, byteIndex)) > everything.length) break;
                chunk = {
                    type: "timed-metadata",
                    data: everything.subarray(byteIndex, byteIndex + frameSize)
                }, this.trigger("data", chunk), byteIndex += frameSize;
            }
            bytesLeft = everything.length - byteIndex, everything = bytesLeft > 0 ? everything.subarray(byteIndex) : new Uint8Array;
        }, this.reset = function() {
            everything = new Uint8Array, this.trigger("reset");
        }, this.endTimeline = function() {
            everything = new Uint8Array, this.trigger("endedtimeline");
        };
    }).prototype = new Stream, module.exports = _AacStream;
}
