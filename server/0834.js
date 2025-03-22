function(module, exports, __webpack_require__) {
    "use strict";
    var FlvTag = __webpack_require__(214);
    module.exports = function(duration, audio, video) {
        var metadata, result, metadataLength, headBytes = new Uint8Array(9), head = new DataView(headBytes.buffer);
        return duration = duration || 0, audio = void 0 === audio || audio, video = void 0 === video || video, 
        head.setUint8(0, 70), head.setUint8(1, 76), head.setUint8(2, 86), head.setUint8(3, 1), 
        head.setUint8(4, (audio ? 4 : 0) | (video ? 1 : 0)), head.setUint32(5, headBytes.byteLength), 
        duration <= 0 ? ((result = new Uint8Array(headBytes.byteLength + 4)).set(headBytes), 
        result.set([ 0, 0, 0, 0 ], headBytes.byteLength), result) : ((metadata = new FlvTag(FlvTag.METADATA_TAG)).pts = metadata.dts = 0, 
        metadata.writeMetaDataDouble("duration", duration), metadataLength = metadata.finalize().length, 
        (result = new Uint8Array(headBytes.byteLength + metadataLength)).set(headBytes), 
        result.set(head.byteLength, metadataLength), result);
    };
}
