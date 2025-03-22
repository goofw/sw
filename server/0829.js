function(module, exports, __webpack_require__) {
    "use strict";
    var discardEmulationPreventionBytes = __webpack_require__(417).discardEmulationPreventionBytes, CaptionStream = __webpack_require__(416).CaptionStream, findBox = __webpack_require__(208), parseTfdt = __webpack_require__(212), parseTrun = __webpack_require__(211), parseTfhd = __webpack_require__(210), mapToSample = function(offset, samples) {
        for (var approximateOffset = offset, i = 0; i < samples.length; i++) {
            var sample = samples[i];
            if (approximateOffset < sample.size) return sample;
            approximateOffset -= sample.size;
        }
        return null;
    };
    module.exports = function() {
        var captionStream, segmentCache, trackId, timescale, parsedCaptions, parsingPartial, isInitialized = !1;
        this.isInitialized = function() {
            return isInitialized;
        }, this.init = function(options) {
            captionStream = new CaptionStream, isInitialized = !0, parsingPartial = !!options && options.isPartial, 
            captionStream.on("data", (function(event) {
                event.startTime = event.startPts / timescale, event.endTime = event.endPts / timescale, 
                parsedCaptions.captions.push(event), parsedCaptions.captionStreams[event.stream] = !0;
            })), captionStream.on("log", (function(log) {
                parsedCaptions.logs.push(log);
            }));
        }, this.isNewInit = function(videoTrackIds, timescales) {
            return !(videoTrackIds && 0 === videoTrackIds.length || timescales && "object" == typeof timescales && 0 === Object.keys(timescales).length || trackId === videoTrackIds[0] && timescale === timescales[trackId]);
        }, this.parse = function(segment, videoTrackIds, timescales) {
            var parsedData;
            if (!this.isInitialized()) return null;
            if (!videoTrackIds || !timescales) return null;
            if (this.isNewInit(videoTrackIds, timescales)) trackId = videoTrackIds[0], timescale = timescales[trackId]; else if (null === trackId || !timescale) return segmentCache.push(segment), 
            null;
            for (;segmentCache.length > 0; ) {
                var cachedSegment = segmentCache.shift();
                this.parse(cachedSegment, videoTrackIds, timescales);
            }
            return parsedData = (function(segment, trackId, timescale) {
                if (null === trackId) return null;
                var trackNals = (function(segment, videoTrackId) {
                    var trafs = findBox(segment, [ "moof", "traf" ]), mdats = findBox(segment, [ "mdat" ]), captionNals = {}, mdatTrafPairs = [];
                    return mdats.forEach((function(mdat, index) {
                        var matchingTraf = trafs[index];
                        mdatTrafPairs.push({
                            mdat: mdat,
                            traf: matchingTraf
                        });
                    })), mdatTrafPairs.forEach((function(pair) {
                        var samples, result, mdat = pair.mdat, traf = pair.traf, tfhd = findBox(traf, [ "tfhd" ]), headerInfo = parseTfhd(tfhd[0]), trackId = headerInfo.trackId, tfdt = findBox(traf, [ "tfdt" ]), baseMediaDecodeTime = tfdt.length > 0 ? parseTfdt(tfdt[0]).baseMediaDecodeTime : 0, truns = findBox(traf, [ "trun" ]);
                        videoTrackId === trackId && truns.length > 0 && (samples = (function(truns, baseMediaDecodeTime, tfhd) {
                            var currentDts = baseMediaDecodeTime, defaultSampleDuration = tfhd.defaultSampleDuration || 0, defaultSampleSize = tfhd.defaultSampleSize || 0, trackId = tfhd.trackId, allSamples = [];
                            return truns.forEach((function(trun) {
                                var samples = parseTrun(trun).samples;
                                samples.forEach((function(sample) {
                                    void 0 === sample.duration && (sample.duration = defaultSampleDuration), void 0 === sample.size && (sample.size = defaultSampleSize), 
                                    sample.trackId = trackId, sample.dts = currentDts, void 0 === sample.compositionTimeOffset && (sample.compositionTimeOffset = 0), 
                                    sample.pts = currentDts + sample.compositionTimeOffset, currentDts += sample.duration;
                                })), allSamples = allSamples.concat(samples);
                            })), allSamples;
                        })(truns, baseMediaDecodeTime, headerInfo), result = (function(avcStream, samples, trackId) {
                            var seiNal, i, length, lastMatchedSample, avcView = new DataView(avcStream.buffer, avcStream.byteOffset, avcStream.byteLength), result = {
                                logs: [],
                                seiNals: []
                            };
                            for (i = 0; i + 4 < avcStream.length; i += length) if (length = avcView.getUint32(i), 
                            i += 4, !(length <= 0)) switch (31 & avcStream[i]) {
                              case 6:
                                var data = avcStream.subarray(i + 1, i + 1 + length), matchingSample = mapToSample(i, samples);
                                if (seiNal = {
                                    nalUnitType: "sei_rbsp",
                                    size: length,
                                    data: data,
                                    escapedRBSP: discardEmulationPreventionBytes(data),
                                    trackId: trackId
                                }, matchingSample) seiNal.pts = matchingSample.pts, seiNal.dts = matchingSample.dts, 
                                lastMatchedSample = matchingSample; else {
                                    if (!lastMatchedSample) {
                                        result.logs.push({
                                            level: "warn",
                                            message: "We've encountered a nal unit without data at " + i + " for trackId " + trackId + ". See mux.js#223."
                                        });
                                        break;
                                    }
                                    seiNal.pts = lastMatchedSample.pts, seiNal.dts = lastMatchedSample.dts;
                                }
                                result.seiNals.push(seiNal);
                            }
                            return result;
                        })(mdat, samples, trackId), captionNals[trackId] || (captionNals[trackId] = {
                            seiNals: [],
                            logs: []
                        }), captionNals[trackId].seiNals = captionNals[trackId].seiNals.concat(result.seiNals), 
                        captionNals[trackId].logs = captionNals[trackId].logs.concat(result.logs));
                    })), captionNals;
                })(segment, trackId)[trackId] || {};
                return {
                    seiNals: trackNals.seiNals,
                    logs: trackNals.logs,
                    timescale: timescale
                };
            })(segment, trackId, timescale), parsedData && parsedData.logs && (parsedCaptions.logs = parsedCaptions.logs.concat(parsedData.logs)), 
            null !== parsedData && parsedData.seiNals ? (this.pushNals(parsedData.seiNals), 
            this.flushStream(), parsedCaptions) : parsedCaptions.logs.length ? {
                logs: parsedCaptions.logs,
                captions: [],
                captionStreams: []
            } : null;
        }, this.pushNals = function(nals) {
            if (!this.isInitialized() || !nals || 0 === nals.length) return null;
            nals.forEach((function(nal) {
                captionStream.push(nal);
            }));
        }, this.flushStream = function() {
            if (!this.isInitialized()) return null;
            parsingPartial ? captionStream.partialFlush() : captionStream.flush();
        }, this.clearParsedCaptions = function() {
            parsedCaptions.captions = [], parsedCaptions.captionStreams = {}, parsedCaptions.logs = [];
        }, this.resetCaptionStream = function() {
            if (!this.isInitialized()) return null;
            captionStream.reset();
        }, this.clearAllCaptions = function() {
            this.clearParsedCaptions(), this.resetCaptionStream();
        }, this.reset = function() {
            segmentCache = [], trackId = null, timescale = null, parsedCaptions ? this.clearParsedCaptions() : parsedCaptions = {
                captions: [],
                captionStreams: {},
                logs: []
            }, this.resetCaptionStream();
        }, this.reset();
    };
}
