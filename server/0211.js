function(module, exports, __webpack_require__) {
    "use strict";
    var parseSampleFlags = __webpack_require__(826);
    module.exports = function(data) {
        var sample, result = {
            version: data[0],
            flags: new Uint8Array(data.subarray(1, 4)),
            samples: []
        }, view = new DataView(data.buffer, data.byteOffset, data.byteLength), dataOffsetPresent = 1 & result.flags[2], firstSampleFlagsPresent = 4 & result.flags[2], sampleDurationPresent = 1 & result.flags[1], sampleSizePresent = 2 & result.flags[1], sampleFlagsPresent = 4 & result.flags[1], sampleCompositionTimeOffsetPresent = 8 & result.flags[1], sampleCount = view.getUint32(4), offset = 8;
        for (dataOffsetPresent && (result.dataOffset = view.getInt32(offset), offset += 4), 
        firstSampleFlagsPresent && sampleCount && (sample = {
            flags: parseSampleFlags(data.subarray(offset, offset + 4))
        }, offset += 4, sampleDurationPresent && (sample.duration = view.getUint32(offset), 
        offset += 4), sampleSizePresent && (sample.size = view.getUint32(offset), offset += 4), 
        sampleCompositionTimeOffsetPresent && (1 === result.version ? sample.compositionTimeOffset = view.getInt32(offset) : sample.compositionTimeOffset = view.getUint32(offset), 
        offset += 4), result.samples.push(sample), sampleCount--); sampleCount--; ) sample = {}, 
        sampleDurationPresent && (sample.duration = view.getUint32(offset), offset += 4), 
        sampleSizePresent && (sample.size = view.getUint32(offset), offset += 4), sampleFlagsPresent && (sample.flags = parseSampleFlags(data.subarray(offset, offset + 4)), 
        offset += 4), sampleCompositionTimeOffsetPresent && (1 === result.version ? sample.compositionTimeOffset = view.getInt32(offset) : sample.compositionTimeOffset = view.getUint32(offset), 
        offset += 4), result.samples.push(sample);
        return result;
    };
}
