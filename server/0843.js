function(module, exports, __webpack_require__) {
    "use strict";
    var StreamTypes = __webpack_require__(144), handleRollover = __webpack_require__(418).handleRollover, probe = {};
    probe.ts = __webpack_require__(844), probe.aac = __webpack_require__(145);
    var ONE_SECOND_IN_TS = __webpack_require__(54).ONE_SECOND_IN_TS, parseAudioPes_ = function(bytes, pmt, result) {
        for (var packet, pesType, pusi, parsed, startIndex = 0, endIndex = 188, endLoop = !1; endIndex <= bytes.byteLength; ) if (71 !== bytes[startIndex] || 71 !== bytes[endIndex] && endIndex !== bytes.byteLength) startIndex++, 
        endIndex++; else {
            if (packet = bytes.subarray(startIndex, endIndex), "pes" === probe.ts.parseType(packet, pmt.pid) && (pesType = probe.ts.parsePesType(packet, pmt.table), 
            pusi = probe.ts.parsePayloadUnitStartIndicator(packet), "audio" === pesType && pusi && (parsed = probe.ts.parsePesTime(packet)) && (parsed.type = "audio", 
            result.audio.push(parsed), endLoop = !0)), endLoop) break;
            startIndex += 188, endIndex += 188;
        }
        for (startIndex = (endIndex = bytes.byteLength) - 188, endLoop = !1; startIndex >= 0; ) if (71 !== bytes[startIndex] || 71 !== bytes[endIndex] && endIndex !== bytes.byteLength) startIndex--, 
        endIndex--; else {
            if (packet = bytes.subarray(startIndex, endIndex), "pes" === probe.ts.parseType(packet, pmt.pid) && (pesType = probe.ts.parsePesType(packet, pmt.table), 
            pusi = probe.ts.parsePayloadUnitStartIndicator(packet), "audio" === pesType && pusi && (parsed = probe.ts.parsePesTime(packet)) && (parsed.type = "audio", 
            result.audio.push(parsed), endLoop = !0)), endLoop) break;
            startIndex -= 188, endIndex -= 188;
        }
    }, parseVideoPes_ = function(bytes, pmt, result) {
        for (var packet, pesType, pusi, parsed, frame, i, pes, startIndex = 0, endIndex = 188, endLoop = !1, currentFrame = {
            data: [],
            size: 0
        }; endIndex < bytes.byteLength; ) if (71 !== bytes[startIndex] || 71 !== bytes[endIndex]) startIndex++, 
        endIndex++; else {
            if (packet = bytes.subarray(startIndex, endIndex), "pes" === probe.ts.parseType(packet, pmt.pid) && (pesType = probe.ts.parsePesType(packet, pmt.table), 
            pusi = probe.ts.parsePayloadUnitStartIndicator(packet), "video" === pesType && (pusi && !endLoop && (parsed = probe.ts.parsePesTime(packet)) && (parsed.type = "video", 
            result.video.push(parsed), endLoop = !0), !result.firstKeyFrame))) {
                if (pusi && 0 !== currentFrame.size) {
                    for (frame = new Uint8Array(currentFrame.size), i = 0; currentFrame.data.length; ) pes = currentFrame.data.shift(), 
                    frame.set(pes, i), i += pes.byteLength;
                    if (probe.ts.videoPacketContainsKeyFrame(frame)) {
                        var firstKeyFrame = probe.ts.parsePesTime(frame);
                        firstKeyFrame ? (result.firstKeyFrame = firstKeyFrame, result.firstKeyFrame.type = "video") : console.warn("Failed to extract PTS/DTS from PES at first keyframe. This could be an unusual TS segment, or else mux.js did not parse your TS segment correctly. If you know your TS segments do contain PTS/DTS on keyframes please file a bug report! You can try ffprobe to double check for yourself.");
                    }
                    currentFrame.size = 0;
                }
                currentFrame.data.push(packet), currentFrame.size += packet.byteLength;
            }
            if (endLoop && result.firstKeyFrame) break;
            startIndex += 188, endIndex += 188;
        }
        for (startIndex = (endIndex = bytes.byteLength) - 188, endLoop = !1; startIndex >= 0; ) if (71 !== bytes[startIndex] || 71 !== bytes[endIndex]) startIndex--, 
        endIndex--; else {
            if (packet = bytes.subarray(startIndex, endIndex), "pes" === probe.ts.parseType(packet, pmt.pid) && (pesType = probe.ts.parsePesType(packet, pmt.table), 
            pusi = probe.ts.parsePayloadUnitStartIndicator(packet), "video" === pesType && pusi && (parsed = probe.ts.parsePesTime(packet)) && (parsed.type = "video", 
            result.video.push(parsed), endLoop = !0)), endLoop) break;
            startIndex -= 188, endIndex -= 188;
        }
    };
    module.exports = {
        inspect: function(bytes, baseTimestamp) {
            var result;
            return result = probe.aac.isLikelyAacData(bytes) ? (function(bytes) {
                for (var packet, endLoop = !1, audioCount = 0, sampleRate = null, timestamp = null, frameSize = 0, byteIndex = 0; bytes.length - byteIndex >= 3; ) {
                    switch (probe.aac.parseType(bytes, byteIndex)) {
                      case "timed-metadata":
                        if (bytes.length - byteIndex < 10) {
                            endLoop = !0;
                            break;
                        }
                        if ((frameSize = probe.aac.parseId3TagSize(bytes, byteIndex)) > bytes.length) {
                            endLoop = !0;
                            break;
                        }
                        null === timestamp && (packet = bytes.subarray(byteIndex, byteIndex + frameSize), 
                        timestamp = probe.aac.parseAacTimestamp(packet)), byteIndex += frameSize;
                        break;

                      case "audio":
                        if (bytes.length - byteIndex < 7) {
                            endLoop = !0;
                            break;
                        }
                        if ((frameSize = probe.aac.parseAdtsSize(bytes, byteIndex)) > bytes.length) {
                            endLoop = !0;
                            break;
                        }
                        null === sampleRate && (packet = bytes.subarray(byteIndex, byteIndex + frameSize), 
                        sampleRate = probe.aac.parseSampleRate(packet)), audioCount++, byteIndex += frameSize;
                        break;

                      default:
                        byteIndex++;
                    }
                    if (endLoop) return null;
                }
                if (null === sampleRate || null === timestamp) return null;
                var audioTimescale = ONE_SECOND_IN_TS / sampleRate;
                return {
                    audio: [ {
                        type: "audio",
                        dts: timestamp,
                        pts: timestamp
                    }, {
                        type: "audio",
                        dts: timestamp + 1024 * audioCount * audioTimescale,
                        pts: timestamp + 1024 * audioCount * audioTimescale
                    } ]
                };
            })(bytes) : (function(bytes) {
                var pmt = {
                    pid: null,
                    table: null
                }, result = {};
                for (var pid in (function(bytes, pmt) {
                    for (var packet, startIndex = 0, endIndex = 188; endIndex < bytes.byteLength; ) if (71 !== bytes[startIndex] || 71 !== bytes[endIndex]) startIndex++, 
                    endIndex++; else {
                        switch (packet = bytes.subarray(startIndex, endIndex), probe.ts.parseType(packet, pmt.pid)) {
                          case "pat":
                            pmt.pid = probe.ts.parsePat(packet);
                            break;

                          case "pmt":
                            var table = probe.ts.parsePmt(packet);
                            pmt.table = pmt.table || {}, Object.keys(table).forEach((function(key) {
                                pmt.table[key] = table[key];
                            }));
                        }
                        startIndex += 188, endIndex += 188;
                    }
                })(bytes, pmt), pmt.table) if (pmt.table.hasOwnProperty(pid)) switch (pmt.table[pid]) {
                  case StreamTypes.H264_STREAM_TYPE:
                    result.video = [], parseVideoPes_(bytes, pmt, result), 0 === result.video.length && delete result.video;
                    break;

                  case StreamTypes.ADTS_STREAM_TYPE:
                    result.audio = [], parseAudioPes_(bytes, pmt, result), 0 === result.audio.length && delete result.audio;
                }
                return result;
            })(bytes), result && (result.audio || result.video) ? ((function(segmentInfo, baseTimestamp) {
                if (segmentInfo.audio && segmentInfo.audio.length) {
                    var audioBaseTimestamp = baseTimestamp;
                    (void 0 === audioBaseTimestamp || isNaN(audioBaseTimestamp)) && (audioBaseTimestamp = segmentInfo.audio[0].dts), 
                    segmentInfo.audio.forEach((function(info) {
                        info.dts = handleRollover(info.dts, audioBaseTimestamp), info.pts = handleRollover(info.pts, audioBaseTimestamp), 
                        info.dtsTime = info.dts / ONE_SECOND_IN_TS, info.ptsTime = info.pts / ONE_SECOND_IN_TS;
                    }));
                }
                if (segmentInfo.video && segmentInfo.video.length) {
                    var videoBaseTimestamp = baseTimestamp;
                    if ((void 0 === videoBaseTimestamp || isNaN(videoBaseTimestamp)) && (videoBaseTimestamp = segmentInfo.video[0].dts), 
                    segmentInfo.video.forEach((function(info) {
                        info.dts = handleRollover(info.dts, videoBaseTimestamp), info.pts = handleRollover(info.pts, videoBaseTimestamp), 
                        info.dtsTime = info.dts / ONE_SECOND_IN_TS, info.ptsTime = info.pts / ONE_SECOND_IN_TS;
                    })), segmentInfo.firstKeyFrame) {
                        var frame = segmentInfo.firstKeyFrame;
                        frame.dts = handleRollover(frame.dts, videoBaseTimestamp), frame.pts = handleRollover(frame.pts, videoBaseTimestamp), 
                        frame.dtsTime = frame.dts / ONE_SECOND_IN_TS, frame.ptsTime = frame.pts / ONE_SECOND_IN_TS;
                    }
                }
            })(result, baseTimestamp), result) : null;
        },
        parseAudioPes_: parseAudioPes_
    };
}
