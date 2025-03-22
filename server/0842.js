function(module, exports, __webpack_require__) {
    "use strict";
    var tagTypes = {
        8: "audio",
        9: "video",
        18: "metadata"
    }, hex = function(val) {
        return "0x" + ("00" + val.toString(16)).slice(-2).toUpperCase();
    }, hexStringList = function(data) {
        for (var i, arr = []; data.byteLength > 0; ) i = 0, arr.push(hex(data[i++])), data = data.subarray(1);
        return arr.join(" ");
    }, inspectFlvTag = function(tag) {
        var header = (function(tag) {
            return {
                tagType: tagTypes[tag[0]],
                dataSize: tag[1] << 16 | tag[2] << 8 | tag[3],
                timestamp: tag[7] << 24 | tag[4] << 16 | tag[5] << 8 | tag[6],
                streamID: tag[8] << 16 | tag[9] << 8 | tag[10]
            };
        })(tag);
        switch (tag[0]) {
          case 8:
            !(function(tag, obj) {
                var soundFormat = (tag[0] & parseInt("11110000", 2)) >>> 4;
                (obj = obj || {}).soundFormat = [ "Linear PCM, platform endian", "ADPCM", "MP3", "Linear PCM, little endian", "Nellymoser 16-kHz mono", "Nellymoser 8-kHz mono", "Nellymoser", "G.711 A-law logarithmic PCM", "G.711 mu-law logarithmic PCM", "reserved", "AAC", "Speex", "MP3 8-Khz", "Device-specific sound" ][soundFormat], 
                obj.soundRate = [ "5.5-kHz", "11-kHz", "22-kHz", "44-kHz" ][(tag[0] & parseInt("00001100", 2)) >>> 2], 
                obj.soundSize = (tag[0] & parseInt("00000010", 2)) >>> 1 ? "16-bit" : "8-bit", obj.soundType = tag[0] & parseInt("00000001", 2) ? "Stereo" : "Mono", 
                10 === soundFormat && (function(tag, obj) {
                    (obj = obj || {}).aacPacketType = [ "AAC Sequence Header", "AAC Raw" ][tag[0]], 
                    obj.data = hexStringList(tag.subarray(1));
                })(tag.subarray(1), obj);
            })(tag.subarray(11), header);
            break;

          case 9:
            !(function(tag, obj) {
                var codecID = tag[0] & parseInt("00001111", 2);
                (obj = obj || {}).frameType = [ "Unknown", "Keyframe (for AVC, a seekable frame)", "Inter frame (for AVC, a nonseekable frame)", "Disposable inter frame (H.263 only)", "Generated keyframe (reserved for server use only)", "Video info/command frame" ][(tag[0] & parseInt("11110000", 2)) >>> 4], 
                obj.codecID = codecID, 7 === codecID && (function(tag, obj) {
                    var compositionTime = tag[1] & parseInt("01111111", 2) << 16 | tag[2] << 8 | tag[3];
                    (obj = obj || {}).avcPacketType = [ "AVC Sequence Header", "AVC NALU", "AVC End-of-Sequence" ][tag[0]], 
                    obj.CompositionTime = tag[1] & parseInt("10000000", 2) ? -compositionTime : compositionTime, 
                    1 === tag[0] ? obj.nalUnitTypeRaw = hexStringList(tag.subarray(4, 100)) : obj.data = hexStringList(tag.subarray(4));
                })(tag.subarray(1), obj);
            })(tag.subarray(11), header);
        }
        return header;
    };
    module.exports = {
        inspectTag: inspectFlvTag,
        inspect: function(bytes) {
            var dataSize, tag, i = 9, parsedResults = [];
            for (i += 4; i < bytes.byteLength; ) dataSize = bytes[i + 1] << 16, dataSize |= bytes[i + 2] << 8, 
            dataSize |= bytes[i + 3], dataSize += 11, tag = bytes.subarray(i, i + dataSize), 
            parsedResults.push(inspectFlvTag(tag)), i += dataSize + 4;
            return parsedResults;
        },
        textify: function(flvTagArray) {
            return JSON.stringify(flvTagArray, null, 2);
        }
    };
}
