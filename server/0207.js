function(module, exports, __webpack_require__) {
    "use strict";
    var _H264Stream, _NalByteStream, PROFILES_WITH_OPTIONAL_SPS_DATA, Stream = __webpack_require__(37), ExpGolomb = __webpack_require__(823);
    (_NalByteStream = function() {
        var i, buffer, syncPoint = 0;
        _NalByteStream.prototype.init.call(this), this.push = function(data) {
            var swapBuffer;
            buffer ? ((swapBuffer = new Uint8Array(buffer.byteLength + data.data.byteLength)).set(buffer), 
            swapBuffer.set(data.data, buffer.byteLength), buffer = swapBuffer) : buffer = data.data;
            for (var len = buffer.byteLength; syncPoint < len - 3; syncPoint++) if (1 === buffer[syncPoint + 2]) {
                i = syncPoint + 5;
                break;
            }
            for (;i < len; ) switch (buffer[i]) {
              case 0:
                if (0 !== buffer[i - 1]) {
                    i += 2;
                    break;
                }
                if (0 !== buffer[i - 2]) {
                    i++;
                    break;
                }
                syncPoint + 3 !== i - 2 && this.trigger("data", buffer.subarray(syncPoint + 3, i - 2));
                do {
                    i++;
                } while (1 !== buffer[i] && i < len);
                syncPoint = i - 2, i += 3;
                break;

              case 1:
                if (0 !== buffer[i - 1] || 0 !== buffer[i - 2]) {
                    i += 3;
                    break;
                }
                this.trigger("data", buffer.subarray(syncPoint + 3, i - 2)), syncPoint = i - 2, 
                i += 3;
                break;

              default:
                i += 3;
            }
            buffer = buffer.subarray(syncPoint), i -= syncPoint, syncPoint = 0;
        }, this.reset = function() {
            buffer = null, syncPoint = 0, this.trigger("reset");
        }, this.flush = function() {
            buffer && buffer.byteLength > 3 && this.trigger("data", buffer.subarray(syncPoint + 3)), 
            buffer = null, syncPoint = 0, this.trigger("done");
        }, this.endTimeline = function() {
            this.flush(), this.trigger("endedtimeline");
        };
    }).prototype = new Stream, PROFILES_WITH_OPTIONAL_SPS_DATA = {
        100: !0,
        110: !0,
        122: !0,
        244: !0,
        44: !0,
        83: !0,
        86: !0,
        118: !0,
        128: !0,
        138: !0,
        139: !0,
        134: !0
    }, (_H264Stream = function() {
        var self, trackId, currentPts, currentDts, discardEmulationPreventionBytes, readSequenceParameterSet, skipScalingList, nalByteStream = new _NalByteStream;
        _H264Stream.prototype.init.call(this), self = this, this.push = function(packet) {
            "video" === packet.type && (trackId = packet.trackId, currentPts = packet.pts, currentDts = packet.dts, 
            nalByteStream.push(packet));
        }, nalByteStream.on("data", (function(data) {
            var event = {
                trackId: trackId,
                pts: currentPts,
                dts: currentDts,
                data: data,
                nalUnitTypeCode: 31 & data[0]
            };
            switch (event.nalUnitTypeCode) {
              case 5:
                event.nalUnitType = "slice_layer_without_partitioning_rbsp_idr";
                break;

              case 6:
                event.nalUnitType = "sei_rbsp", event.escapedRBSP = discardEmulationPreventionBytes(data.subarray(1));
                break;

              case 7:
                event.nalUnitType = "seq_parameter_set_rbsp", event.escapedRBSP = discardEmulationPreventionBytes(data.subarray(1)), 
                event.config = readSequenceParameterSet(event.escapedRBSP);
                break;

              case 8:
                event.nalUnitType = "pic_parameter_set_rbsp";
                break;

              case 9:
                event.nalUnitType = "access_unit_delimiter_rbsp";
            }
            self.trigger("data", event);
        })), nalByteStream.on("done", (function() {
            self.trigger("done");
        })), nalByteStream.on("partialdone", (function() {
            self.trigger("partialdone");
        })), nalByteStream.on("reset", (function() {
            self.trigger("reset");
        })), nalByteStream.on("endedtimeline", (function() {
            self.trigger("endedtimeline");
        })), this.flush = function() {
            nalByteStream.flush();
        }, this.partialFlush = function() {
            nalByteStream.partialFlush();
        }, this.reset = function() {
            nalByteStream.reset();
        }, this.endTimeline = function() {
            nalByteStream.endTimeline();
        }, skipScalingList = function(count, expGolombDecoder) {
            var j, lastScale = 8, nextScale = 8;
            for (j = 0; j < count; j++) 0 !== nextScale && (nextScale = (lastScale + expGolombDecoder.readExpGolomb() + 256) % 256), 
            lastScale = 0 === nextScale ? lastScale : nextScale;
        }, discardEmulationPreventionBytes = function(data) {
            for (var newLength, newData, length = data.byteLength, emulationPreventionBytesPositions = [], i = 1; i < length - 2; ) 0 === data[i] && 0 === data[i + 1] && 3 === data[i + 2] ? (emulationPreventionBytesPositions.push(i + 2), 
            i += 2) : i++;
            if (0 === emulationPreventionBytesPositions.length) return data;
            newLength = length - emulationPreventionBytesPositions.length, newData = new Uint8Array(newLength);
            var sourceIndex = 0;
            for (i = 0; i < newLength; sourceIndex++, i++) sourceIndex === emulationPreventionBytesPositions[0] && (sourceIndex++, 
            emulationPreventionBytesPositions.shift()), newData[i] = data[sourceIndex];
            return newData;
        }, readSequenceParameterSet = function(data) {
            var expGolombDecoder, profileIdc, levelIdc, profileCompatibility, chromaFormatIdc, picOrderCntType, numRefFramesInPicOrderCntCycle, picWidthInMbsMinus1, picHeightInMapUnitsMinus1, frameMbsOnlyFlag, scalingListCount, i, frameCropLeftOffset = 0, frameCropRightOffset = 0, frameCropTopOffset = 0, frameCropBottomOffset = 0, sarRatio = [ 1, 1 ];
            if (profileIdc = (expGolombDecoder = new ExpGolomb(data)).readUnsignedByte(), profileCompatibility = expGolombDecoder.readUnsignedByte(), 
            levelIdc = expGolombDecoder.readUnsignedByte(), expGolombDecoder.skipUnsignedExpGolomb(), 
            PROFILES_WITH_OPTIONAL_SPS_DATA[profileIdc] && (3 === (chromaFormatIdc = expGolombDecoder.readUnsignedExpGolomb()) && expGolombDecoder.skipBits(1), 
            expGolombDecoder.skipUnsignedExpGolomb(), expGolombDecoder.skipUnsignedExpGolomb(), 
            expGolombDecoder.skipBits(1), expGolombDecoder.readBoolean())) for (scalingListCount = 3 !== chromaFormatIdc ? 8 : 12, 
            i = 0; i < scalingListCount; i++) expGolombDecoder.readBoolean() && skipScalingList(i < 6 ? 16 : 64, expGolombDecoder);
            if (expGolombDecoder.skipUnsignedExpGolomb(), 0 === (picOrderCntType = expGolombDecoder.readUnsignedExpGolomb())) expGolombDecoder.readUnsignedExpGolomb(); else if (1 === picOrderCntType) for (expGolombDecoder.skipBits(1), 
            expGolombDecoder.skipExpGolomb(), expGolombDecoder.skipExpGolomb(), numRefFramesInPicOrderCntCycle = expGolombDecoder.readUnsignedExpGolomb(), 
            i = 0; i < numRefFramesInPicOrderCntCycle; i++) expGolombDecoder.skipExpGolomb();
            if (expGolombDecoder.skipUnsignedExpGolomb(), expGolombDecoder.skipBits(1), picWidthInMbsMinus1 = expGolombDecoder.readUnsignedExpGolomb(), 
            picHeightInMapUnitsMinus1 = expGolombDecoder.readUnsignedExpGolomb(), 0 === (frameMbsOnlyFlag = expGolombDecoder.readBits(1)) && expGolombDecoder.skipBits(1), 
            expGolombDecoder.skipBits(1), expGolombDecoder.readBoolean() && (frameCropLeftOffset = expGolombDecoder.readUnsignedExpGolomb(), 
            frameCropRightOffset = expGolombDecoder.readUnsignedExpGolomb(), frameCropTopOffset = expGolombDecoder.readUnsignedExpGolomb(), 
            frameCropBottomOffset = expGolombDecoder.readUnsignedExpGolomb()), expGolombDecoder.readBoolean() && expGolombDecoder.readBoolean()) {
                switch (expGolombDecoder.readUnsignedByte()) {
                  case 1:
                    sarRatio = [ 1, 1 ];
                    break;

                  case 2:
                    sarRatio = [ 12, 11 ];
                    break;

                  case 3:
                    sarRatio = [ 10, 11 ];
                    break;

                  case 4:
                    sarRatio = [ 16, 11 ];
                    break;

                  case 5:
                    sarRatio = [ 40, 33 ];
                    break;

                  case 6:
                    sarRatio = [ 24, 11 ];
                    break;

                  case 7:
                    sarRatio = [ 20, 11 ];
                    break;

                  case 8:
                    sarRatio = [ 32, 11 ];
                    break;

                  case 9:
                    sarRatio = [ 80, 33 ];
                    break;

                  case 10:
                    sarRatio = [ 18, 11 ];
                    break;

                  case 11:
                    sarRatio = [ 15, 11 ];
                    break;

                  case 12:
                    sarRatio = [ 64, 33 ];
                    break;

                  case 13:
                    sarRatio = [ 160, 99 ];
                    break;

                  case 14:
                    sarRatio = [ 4, 3 ];
                    break;

                  case 15:
                    sarRatio = [ 3, 2 ];
                    break;

                  case 16:
                    sarRatio = [ 2, 1 ];
                    break;

                  case 255:
                    sarRatio = [ expGolombDecoder.readUnsignedByte() << 8 | expGolombDecoder.readUnsignedByte(), expGolombDecoder.readUnsignedByte() << 8 | expGolombDecoder.readUnsignedByte() ];
                }
                sarRatio && (sarRatio[0], sarRatio[1]);
            }
            return {
                profileIdc: profileIdc,
                levelIdc: levelIdc,
                profileCompatibility: profileCompatibility,
                width: 16 * (picWidthInMbsMinus1 + 1) - 2 * frameCropLeftOffset - 2 * frameCropRightOffset,
                height: (2 - frameMbsOnlyFlag) * (picHeightInMapUnitsMinus1 + 1) * 16 - 2 * frameCropTopOffset - 2 * frameCropBottomOffset,
                sarRatio: sarRatio
            };
        };
    }).prototype = new Stream, module.exports = {
        H264Stream: _H264Stream,
        NalByteStream: _NalByteStream
    };
}
