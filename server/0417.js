function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = {
        parseSei: function(bytes) {
            for (var i = 0, result = {
                payloadType: -1,
                payloadSize: 0
            }, payloadType = 0, payloadSize = 0; i < bytes.byteLength && 128 !== bytes[i]; ) {
                for (;255 === bytes[i]; ) payloadType += 255, i++;
                for (payloadType += bytes[i++]; 255 === bytes[i]; ) payloadSize += 255, i++;
                if (payloadSize += bytes[i++], !result.payload && 4 === payloadType) {
                    if ("GA94" === String.fromCharCode(bytes[i + 3], bytes[i + 4], bytes[i + 5], bytes[i + 6])) {
                        result.payloadType = payloadType, result.payloadSize = payloadSize, result.payload = bytes.subarray(i, i + payloadSize);
                        break;
                    }
                    result.payload = void 0;
                }
                i += payloadSize, payloadType = 0, payloadSize = 0;
            }
            return result;
        },
        parseUserData: function(sei) {
            return 181 !== sei.payload[0] || 49 != (sei.payload[1] << 8 | sei.payload[2]) || "GA94" !== String.fromCharCode(sei.payload[3], sei.payload[4], sei.payload[5], sei.payload[6]) || 3 !== sei.payload[7] ? null : sei.payload.subarray(8, sei.payload.length - 1);
        },
        parseCaptionPackets: function(pts, userData) {
            var i, count, offset, data, results = [];
            if (!(64 & userData[0])) return results;
            for (count = 31 & userData[0], i = 0; i < count; i++) data = {
                type: 3 & userData[2 + (offset = 3 * i)],
                pts: pts
            }, 4 & userData[offset + 2] && (data.ccData = userData[offset + 3] << 8 | userData[offset + 4], 
            results.push(data));
            return results;
        },
        discardEmulationPreventionBytes: function(data) {
            for (var newLength, newData, length = data.byteLength, emulationPreventionBytesPositions = [], i = 1; i < length - 2; ) 0 === data[i] && 0 === data[i + 1] && 3 === data[i + 2] ? (emulationPreventionBytesPositions.push(i + 2), 
            i += 2) : i++;
            if (0 === emulationPreventionBytesPositions.length) return data;
            newLength = length - emulationPreventionBytesPositions.length, newData = new Uint8Array(newLength);
            var sourceIndex = 0;
            for (i = 0; i < newLength; sourceIndex++, i++) sourceIndex === emulationPreventionBytesPositions[0] && (sourceIndex++, 
            emulationPreventionBytesPositions.shift()), newData[i] = data[sourceIndex];
            return newData;
        },
        USER_DATA_REGISTERED_ITU_T_T35: 4
    };
}
