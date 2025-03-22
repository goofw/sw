function(module, exports, __webpack_require__) {
    "use strict";
    var StreamTypes = __webpack_require__(144), parsePid = function(packet) {
        var pid = 31 & packet[1];
        return (pid <<= 8) | packet[2];
    }, parsePayloadUnitStartIndicator = function(packet) {
        return !!(64 & packet[1]);
    }, parseAdaptionField = function(packet) {
        var offset = 0;
        return (48 & packet[3]) >>> 4 > 1 && (offset += packet[4] + 1), offset;
    }, parseNalUnitType = function(type) {
        switch (type) {
          case 5:
            return "slice_layer_without_partitioning_rbsp_idr";

          case 6:
            return "sei_rbsp";

          case 7:
            return "seq_parameter_set_rbsp";

          case 8:
            return "pic_parameter_set_rbsp";

          case 9:
            return "access_unit_delimiter_rbsp";

          default:
            return null;
        }
    };
    module.exports = {
        parseType: function(packet, pmtPid) {
            var pid = parsePid(packet);
            return 0 === pid ? "pat" : pid === pmtPid ? "pmt" : pmtPid ? "pes" : null;
        },
        parsePat: function(packet) {
            var pusi = parsePayloadUnitStartIndicator(packet), offset = 4 + parseAdaptionField(packet);
            return pusi && (offset += packet[offset] + 1), (31 & packet[offset + 10]) << 8 | packet[offset + 11];
        },
        parsePmt: function(packet) {
            var programMapTable = {}, pusi = parsePayloadUnitStartIndicator(packet), payloadOffset = 4 + parseAdaptionField(packet);
            if (pusi && (payloadOffset += packet[payloadOffset] + 1), 1 & packet[payloadOffset + 5]) {
                var tableEnd;
                tableEnd = 3 + ((15 & packet[payloadOffset + 1]) << 8 | packet[payloadOffset + 2]) - 4;
                for (var offset = 12 + ((15 & packet[payloadOffset + 10]) << 8 | packet[payloadOffset + 11]); offset < tableEnd; ) {
                    var i = payloadOffset + offset;
                    programMapTable[(31 & packet[i + 1]) << 8 | packet[i + 2]] = packet[i], offset += 5 + ((15 & packet[i + 3]) << 8 | packet[i + 4]);
                }
                return programMapTable;
            }
        },
        parsePayloadUnitStartIndicator: parsePayloadUnitStartIndicator,
        parsePesType: function(packet, programMapTable) {
            switch (programMapTable[parsePid(packet)]) {
              case StreamTypes.H264_STREAM_TYPE:
                return "video";

              case StreamTypes.ADTS_STREAM_TYPE:
                return "audio";

              case StreamTypes.METADATA_STREAM_TYPE:
                return "timed-metadata";

              default:
                return null;
            }
        },
        parsePesTime: function(packet) {
            if (!parsePayloadUnitStartIndicator(packet)) return null;
            var offset = 4 + parseAdaptionField(packet);
            if (offset >= packet.byteLength) return null;
            var ptsDtsFlags, pes = null;
            return 192 & (ptsDtsFlags = packet[offset + 7]) && ((pes = {}).pts = (14 & packet[offset + 9]) << 27 | (255 & packet[offset + 10]) << 20 | (254 & packet[offset + 11]) << 12 | (255 & packet[offset + 12]) << 5 | (254 & packet[offset + 13]) >>> 3, 
            pes.pts *= 4, pes.pts += (6 & packet[offset + 13]) >>> 1, pes.dts = pes.pts, 64 & ptsDtsFlags && (pes.dts = (14 & packet[offset + 14]) << 27 | (255 & packet[offset + 15]) << 20 | (254 & packet[offset + 16]) << 12 | (255 & packet[offset + 17]) << 5 | (254 & packet[offset + 18]) >>> 3, 
            pes.dts *= 4, pes.dts += (6 & packet[offset + 18]) >>> 1)), pes;
        },
        videoPacketContainsKeyFrame: function(packet) {
            for (var offset = 4 + parseAdaptionField(packet), frameBuffer = packet.subarray(offset), frameI = 0, frameSyncPoint = 0, foundKeyFrame = !1; frameSyncPoint < frameBuffer.byteLength - 3; frameSyncPoint++) if (1 === frameBuffer[frameSyncPoint + 2]) {
                frameI = frameSyncPoint + 5;
                break;
            }
            for (;frameI < frameBuffer.byteLength; ) switch (frameBuffer[frameI]) {
              case 0:
                if (0 !== frameBuffer[frameI - 1]) {
                    frameI += 2;
                    break;
                }
                if (0 !== frameBuffer[frameI - 2]) {
                    frameI++;
                    break;
                }
                frameSyncPoint + 3 !== frameI - 2 && "slice_layer_without_partitioning_rbsp_idr" === parseNalUnitType(31 & frameBuffer[frameSyncPoint + 3]) && (foundKeyFrame = !0);
                do {
                    frameI++;
                } while (1 !== frameBuffer[frameI] && frameI < frameBuffer.length);
                frameSyncPoint = frameI - 2, frameI += 3;
                break;

              case 1:
                if (0 !== frameBuffer[frameI - 1] || 0 !== frameBuffer[frameI - 2]) {
                    frameI += 3;
                    break;
                }
                "slice_layer_without_partitioning_rbsp_idr" === parseNalUnitType(31 & frameBuffer[frameSyncPoint + 3]) && (foundKeyFrame = !0), 
                frameSyncPoint = frameI - 2, frameI += 3;
                break;

              default:
                frameI += 3;
            }
            return frameBuffer = frameBuffer.subarray(frameSyncPoint), frameI -= frameSyncPoint, 
            frameSyncPoint = 0, frameBuffer && frameBuffer.byteLength > 3 && "slice_layer_without_partitioning_rbsp_idr" === parseNalUnitType(31 & frameBuffer[frameSyncPoint + 3]) && (foundKeyFrame = !0), 
            foundKeyFrame;
        }
    };
}
