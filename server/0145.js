function(module, exports, __webpack_require__) {
    "use strict";
    var ADTS_SAMPLING_FREQUENCIES = [ 96e3, 88200, 64e3, 48e3, 44100, 32e3, 24e3, 22050, 16e3, 12e3, 11025, 8e3, 7350 ], parseId3TagSize = function(header, byteIndex) {
        var returnSize = header[byteIndex + 6] << 21 | header[byteIndex + 7] << 14 | header[byteIndex + 8] << 7 | header[byteIndex + 9];
        return returnSize = returnSize >= 0 ? returnSize : 0, (16 & header[byteIndex + 5]) >> 4 ? returnSize + 20 : returnSize + 10;
    }, getId3Offset = function getId3Offset(data, offset) {
        return data.length - offset < 10 || data[offset] !== "I".charCodeAt(0) || data[offset + 1] !== "D".charCodeAt(0) || data[offset + 2] !== "3".charCodeAt(0) ? offset : getId3Offset(data, offset += parseId3TagSize(data, offset));
    }, parseSyncSafeInteger = function(data) {
        return data[0] << 21 | data[1] << 14 | data[2] << 7 | data[3];
    };
    module.exports = {
        isLikelyAacData: function(data) {
            var offset = getId3Offset(data, 0);
            return data.length >= offset + 2 && 255 == (255 & data[offset]) && 240 == (240 & data[offset + 1]) && 16 == (22 & data[offset + 1]);
        },
        parseId3TagSize: parseId3TagSize,
        parseAdtsSize: function(header, byteIndex) {
            var lowThree = (224 & header[byteIndex + 5]) >> 5, middle = header[byteIndex + 4] << 3;
            return 6144 & header[byteIndex + 3] | middle | lowThree;
        },
        parseType: function(header, byteIndex) {
            return header[byteIndex] === "I".charCodeAt(0) && header[byteIndex + 1] === "D".charCodeAt(0) && header[byteIndex + 2] === "3".charCodeAt(0) ? "timed-metadata" : !0 & header[byteIndex] && 240 == (240 & header[byteIndex + 1]) ? "audio" : null;
        },
        parseSampleRate: function(packet) {
            for (var i = 0; i + 5 < packet.length; ) {
                if (255 === packet[i] && 240 == (246 & packet[i + 1])) return ADTS_SAMPLING_FREQUENCIES[(60 & packet[i + 2]) >>> 2];
                i++;
            }
            return null;
        },
        parseAacTimestamp: function(packet) {
            var frameStart, frameSize, frame;
            frameStart = 10, 64 & packet[5] && (frameStart += 4, frameStart += parseSyncSafeInteger(packet.subarray(10, 14)));
            do {
                if ((frameSize = parseSyncSafeInteger(packet.subarray(frameStart + 4, frameStart + 8))) < 1) return null;
                if ("PRIV" === String.fromCharCode(packet[frameStart], packet[frameStart + 1], packet[frameStart + 2], packet[frameStart + 3])) {
                    frame = packet.subarray(frameStart + 10, frameStart + frameSize + 10);
                    for (var i = 0; i < frame.byteLength; i++) if (0 === frame[i]) {
                        var owner = unescape((function(bytes, start, end) {
                            var i, result = "";
                            for (i = 0; i < end; i++) result += "%" + ("00" + bytes[i].toString(16)).slice(-2);
                            return result;
                        })(frame, 0, i));
                        if ("com.apple.streaming.transportStreamTimestamp" === owner) {
                            var d = frame.subarray(i + 1), size = (1 & d[3]) << 30 | d[4] << 22 | d[5] << 14 | d[6] << 6 | d[7] >>> 2;
                            return (size *= 4) + (3 & d[7]);
                        }
                        break;
                    }
                }
                frameStart += 10, frameStart += frameSize;
            } while (frameStart < packet.byteLength);
            return null;
        }
    };
}
