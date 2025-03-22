function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(data) {
        var i, view = new DataView(data.buffer, data.byteOffset, data.byteLength), result = {
            version: data[0],
            flags: new Uint8Array(data.subarray(1, 4)),
            trackId: view.getUint32(4)
        }, baseDataOffsetPresent = 1 & result.flags[2], sampleDescriptionIndexPresent = 2 & result.flags[2], defaultSampleDurationPresent = 8 & result.flags[2], defaultSampleSizePresent = 16 & result.flags[2], defaultSampleFlagsPresent = 32 & result.flags[2], durationIsEmpty = 65536 & result.flags[0], defaultBaseIsMoof = 131072 & result.flags[0];
        return i = 8, baseDataOffsetPresent && (i += 4, result.baseDataOffset = view.getUint32(12), 
        i += 4), sampleDescriptionIndexPresent && (result.sampleDescriptionIndex = view.getUint32(i), 
        i += 4), defaultSampleDurationPresent && (result.defaultSampleDuration = view.getUint32(i), 
        i += 4), defaultSampleSizePresent && (result.defaultSampleSize = view.getUint32(i), 
        i += 4), defaultSampleFlagsPresent && (result.defaultSampleFlags = view.getUint32(i)), 
        durationIsEmpty && (result.durationIsEmpty = !0), !baseDataOffsetPresent && defaultBaseIsMoof && (result.baseDataOffsetIsMoof = !0), 
        result;
    };
}
