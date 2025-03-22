function(module, exports, __webpack_require__) {
    "use strict";
    var MAX_UINT32 = Math.pow(2, 32);
    module.exports = function(data) {
        var view = new DataView(data.buffer, data.byteOffset, data.byteLength), result = {
            version: data[0],
            flags: new Uint8Array(data.subarray(1, 4)),
            references: [],
            referenceId: view.getUint32(4),
            timescale: view.getUint32(8)
        }, i = 12;
        0 === result.version ? (result.earliestPresentationTime = view.getUint32(i), result.firstOffset = view.getUint32(i + 4), 
        i += 8) : (result.earliestPresentationTime = view.getUint32(i) * MAX_UINT32 + view.getUint32(i + 4), 
        result.firstOffset = view.getUint32(i + 8) * MAX_UINT32 + view.getUint32(i + 12), 
        i += 16), i += 2;
        var referenceCount = view.getUint16(i);
        for (i += 2; referenceCount > 0; i += 12, referenceCount--) result.references.push({
            referenceType: (128 & data[i]) >>> 7,
            referencedSize: 2147483647 & view.getUint32(i),
            subsegmentDuration: view.getUint32(i + 4),
            startsWithSap: !!(128 & data[i + 8]),
            sapType: (112 & data[i + 8]) >>> 4,
            sapDeltaTime: 268435455 & view.getUint32(i + 8)
        });
        return result;
    };
}
