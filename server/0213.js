function(module, exports, __webpack_require__) {
    "use strict";
    var _VideoSegmentStream, _AudioSegmentStream, _Transmuxer, _CoalesceStream, Stream = __webpack_require__(37), mp4 = __webpack_require__(140), frameUtils = __webpack_require__(414), audioFrameUtils = __webpack_require__(415), trackDecodeInfo = __webpack_require__(142), m2ts = __webpack_require__(143), clock = __webpack_require__(54), AdtsStream = __webpack_require__(139), H264Stream = __webpack_require__(207).H264Stream, AacStream = __webpack_require__(419), isLikelyAacData = __webpack_require__(145).isLikelyAacData, ONE_SECOND_IN_TS = __webpack_require__(54).ONE_SECOND_IN_TS, AUDIO_PROPERTIES = __webpack_require__(420), VIDEO_PROPERTIES = __webpack_require__(421), arrayEquals = function(a, b) {
        var i;
        if (a.length !== b.length) return !1;
        for (i = 0; i < a.length; i++) if (a[i] !== b[i]) return !1;
        return !0;
    }, generateSegmentTimingInfo = function(baseMediaDecodeTime, startDts, startPts, endDts, endPts, prependedContentDuration) {
        return {
            start: {
                dts: baseMediaDecodeTime,
                pts: baseMediaDecodeTime + (startPts - startDts)
            },
            end: {
                dts: baseMediaDecodeTime + (endDts - startDts),
                pts: baseMediaDecodeTime + (endPts - startPts)
            },
            prependedContentDuration: prependedContentDuration,
            baseMediaDecodeTime: baseMediaDecodeTime
        };
    };
    (_AudioSegmentStream = function(track, options) {
        var adtsFrames = [], sequenceNumber = 0, earliestAllowedDts = 0, audioAppendStartTs = 0, videoBaseMediaDecodeTime = 1 / 0;
        options = options || {}, _AudioSegmentStream.prototype.init.call(this), this.push = function(data) {
            trackDecodeInfo.collectDtsInfo(track, data), track && AUDIO_PROPERTIES.forEach((function(prop) {
                track[prop] = data[prop];
            })), adtsFrames.push(data);
        }, this.setEarliestDts = function(earliestDts) {
            earliestAllowedDts = earliestDts;
        }, this.setVideoBaseMediaDecodeTime = function(baseMediaDecodeTime) {
            videoBaseMediaDecodeTime = baseMediaDecodeTime;
        }, this.setAudioAppendStart = function(timestamp) {
            audioAppendStartTs = timestamp;
        }, this.flush = function() {
            var frames, moof, mdat, boxes, frameDuration, segmentDuration, videoClockCyclesOfSilencePrefixed;
            0 !== adtsFrames.length ? (frames = audioFrameUtils.trimAdtsFramesByEarliestDts(adtsFrames, track, earliestAllowedDts), 
            track.baseMediaDecodeTime = trackDecodeInfo.calculateTrackBaseMediaDecodeTime(track, options.keepOriginalTimestamps), 
            videoClockCyclesOfSilencePrefixed = audioFrameUtils.prefixWithSilence(track, frames, audioAppendStartTs, videoBaseMediaDecodeTime), 
            track.samples = audioFrameUtils.generateSampleTable(frames), mdat = mp4.mdat(audioFrameUtils.concatenateFrameData(frames)), 
            adtsFrames = [], moof = mp4.moof(sequenceNumber, [ track ]), boxes = new Uint8Array(moof.byteLength + mdat.byteLength), 
            sequenceNumber++, boxes.set(moof), boxes.set(mdat, moof.byteLength), trackDecodeInfo.clearDtsInfo(track), 
            frameDuration = Math.ceil(1024 * ONE_SECOND_IN_TS / track.samplerate), frames.length && (segmentDuration = frames.length * frameDuration, 
            this.trigger("segmentTimingInfo", generateSegmentTimingInfo(clock.audioTsToVideoTs(track.baseMediaDecodeTime, track.samplerate), frames[0].dts, frames[0].pts, frames[0].dts + segmentDuration, frames[0].pts + segmentDuration, videoClockCyclesOfSilencePrefixed || 0)), 
            this.trigger("timingInfo", {
                start: frames[0].pts,
                end: frames[0].pts + segmentDuration
            })), this.trigger("data", {
                track: track,
                boxes: boxes
            }), this.trigger("done", "AudioSegmentStream")) : this.trigger("done", "AudioSegmentStream");
        }, this.reset = function() {
            trackDecodeInfo.clearDtsInfo(track), adtsFrames = [], this.trigger("reset");
        };
    }).prototype = new Stream, (_VideoSegmentStream = function(track, options) {
        var config, pps, sequenceNumber = 0, nalUnits = [], gopsToAlignWith = [];
        options = options || {}, _VideoSegmentStream.prototype.init.call(this), delete track.minPTS, 
        this.gopCache_ = [], this.push = function(nalUnit) {
            trackDecodeInfo.collectDtsInfo(track, nalUnit), "seq_parameter_set_rbsp" !== nalUnit.nalUnitType || config || (config = nalUnit.config, 
            track.sps = [ nalUnit.data ], VIDEO_PROPERTIES.forEach((function(prop) {
                track[prop] = config[prop];
            }), this)), "pic_parameter_set_rbsp" !== nalUnit.nalUnitType || pps || (pps = nalUnit.data, 
            track.pps = [ nalUnit.data ]), nalUnits.push(nalUnit);
        }, this.flush = function() {
            for (var frames, gopForFusion, gops, moof, mdat, boxes, firstGop, lastGop, prependedContentDuration = 0; nalUnits.length && "access_unit_delimiter_rbsp" !== nalUnits[0].nalUnitType; ) nalUnits.shift();
            if (0 === nalUnits.length) return this.resetStream_(), void this.trigger("done", "VideoSegmentStream");
            if (frames = frameUtils.groupNalsIntoFrames(nalUnits), (gops = frameUtils.groupFramesIntoGops(frames))[0][0].keyFrame || ((gopForFusion = this.getGopForFusion_(nalUnits[0], track)) ? (prependedContentDuration = gopForFusion.duration, 
            gops.unshift(gopForFusion), gops.byteLength += gopForFusion.byteLength, gops.nalCount += gopForFusion.nalCount, 
            gops.pts = gopForFusion.pts, gops.dts = gopForFusion.dts, gops.duration += gopForFusion.duration) : gops = frameUtils.extendFirstKeyFrame(gops)), 
            gopsToAlignWith.length) {
                var alignedGops;
                if (!(alignedGops = options.alignGopsAtEnd ? this.alignGopsAtEnd_(gops) : this.alignGopsAtStart_(gops))) return this.gopCache_.unshift({
                    gop: gops.pop(),
                    pps: track.pps,
                    sps: track.sps
                }), this.gopCache_.length = Math.min(6, this.gopCache_.length), nalUnits = [], this.resetStream_(), 
                void this.trigger("done", "VideoSegmentStream");
                trackDecodeInfo.clearDtsInfo(track), gops = alignedGops;
            }
            trackDecodeInfo.collectDtsInfo(track, gops), track.samples = frameUtils.generateSampleTable(gops), 
            mdat = mp4.mdat(frameUtils.concatenateNalData(gops)), track.baseMediaDecodeTime = trackDecodeInfo.calculateTrackBaseMediaDecodeTime(track, options.keepOriginalTimestamps), 
            this.trigger("processedGopsInfo", gops.map((function(gop) {
                return {
                    pts: gop.pts,
                    dts: gop.dts,
                    byteLength: gop.byteLength
                };
            }))), firstGop = gops[0], lastGop = gops[gops.length - 1], this.trigger("segmentTimingInfo", generateSegmentTimingInfo(track.baseMediaDecodeTime, firstGop.dts, firstGop.pts, lastGop.dts + lastGop.duration, lastGop.pts + lastGop.duration, prependedContentDuration)), 
            this.trigger("timingInfo", {
                start: gops[0].pts,
                end: gops[gops.length - 1].pts + gops[gops.length - 1].duration
            }), this.gopCache_.unshift({
                gop: gops.pop(),
                pps: track.pps,
                sps: track.sps
            }), this.gopCache_.length = Math.min(6, this.gopCache_.length), nalUnits = [], this.trigger("baseMediaDecodeTime", track.baseMediaDecodeTime), 
            this.trigger("timelineStartInfo", track.timelineStartInfo), moof = mp4.moof(sequenceNumber, [ track ]), 
            boxes = new Uint8Array(moof.byteLength + mdat.byteLength), sequenceNumber++, boxes.set(moof), 
            boxes.set(mdat, moof.byteLength), this.trigger("data", {
                track: track,
                boxes: boxes
            }), this.resetStream_(), this.trigger("done", "VideoSegmentStream");
        }, this.reset = function() {
            this.resetStream_(), nalUnits = [], this.gopCache_.length = 0, gopsToAlignWith.length = 0, 
            this.trigger("reset");
        }, this.resetStream_ = function() {
            trackDecodeInfo.clearDtsInfo(track), config = void 0, pps = void 0;
        }, this.getGopForFusion_ = function(nalUnit) {
            var dtsDistance, nearestGopObj, currentGop, currentGopObj, i, nearestDistance = 1 / 0;
            for (i = 0; i < this.gopCache_.length; i++) currentGop = (currentGopObj = this.gopCache_[i]).gop, 
            track.pps && arrayEquals(track.pps[0], currentGopObj.pps[0]) && track.sps && arrayEquals(track.sps[0], currentGopObj.sps[0]) && (currentGop.dts < track.timelineStartInfo.dts || (dtsDistance = nalUnit.dts - currentGop.dts - currentGop.duration) >= -1e4 && dtsDistance <= 45e3 && (!nearestGopObj || nearestDistance > dtsDistance) && (nearestGopObj = currentGopObj, 
            nearestDistance = dtsDistance));
            return nearestGopObj ? nearestGopObj.gop : null;
        }, this.alignGopsAtStart_ = function(gops) {
            var alignIndex, gopIndex, align, gop, byteLength, nalCount, duration, alignedGops;
            for (byteLength = gops.byteLength, nalCount = gops.nalCount, duration = gops.duration, 
            alignIndex = gopIndex = 0; alignIndex < gopsToAlignWith.length && gopIndex < gops.length && (align = gopsToAlignWith[alignIndex], 
            gop = gops[gopIndex], align.pts !== gop.pts); ) gop.pts > align.pts ? alignIndex++ : (gopIndex++, 
            byteLength -= gop.byteLength, nalCount -= gop.nalCount, duration -= gop.duration);
            return 0 === gopIndex ? gops : gopIndex === gops.length ? null : ((alignedGops = gops.slice(gopIndex)).byteLength = byteLength, 
            alignedGops.duration = duration, alignedGops.nalCount = nalCount, alignedGops.pts = alignedGops[0].pts, 
            alignedGops.dts = alignedGops[0].dts, alignedGops);
        }, this.alignGopsAtEnd_ = function(gops) {
            var alignIndex, gopIndex, align, gop, alignEndIndex, matchFound, trimIndex;
            for (alignIndex = gopsToAlignWith.length - 1, gopIndex = gops.length - 1, alignEndIndex = null, 
            matchFound = !1; alignIndex >= 0 && gopIndex >= 0; ) {
                if (align = gopsToAlignWith[alignIndex], gop = gops[gopIndex], align.pts === gop.pts) {
                    matchFound = !0;
                    break;
                }
                align.pts > gop.pts ? alignIndex-- : (alignIndex === gopsToAlignWith.length - 1 && (alignEndIndex = gopIndex), 
                gopIndex--);
            }
            if (!matchFound && null === alignEndIndex) return null;
            if (0 === (trimIndex = matchFound ? gopIndex : alignEndIndex)) return gops;
            var alignedGops = gops.slice(trimIndex), metadata = alignedGops.reduce((function(total, gop) {
                return total.byteLength += gop.byteLength, total.duration += gop.duration, total.nalCount += gop.nalCount, 
                total;
            }), {
                byteLength: 0,
                duration: 0,
                nalCount: 0
            });
            return alignedGops.byteLength = metadata.byteLength, alignedGops.duration = metadata.duration, 
            alignedGops.nalCount = metadata.nalCount, alignedGops.pts = alignedGops[0].pts, 
            alignedGops.dts = alignedGops[0].dts, alignedGops;
        }, this.alignGopsWith = function(newGopsToAlignWith) {
            gopsToAlignWith = newGopsToAlignWith;
        };
    }).prototype = new Stream, (_CoalesceStream = function(options, metadataStream) {
        this.numberOfTracks = 0, this.metadataStream = metadataStream, void 0 !== (options = options || {}).remux ? this.remuxTracks = !!options.remux : this.remuxTracks = !0, 
        "boolean" == typeof options.keepOriginalTimestamps ? this.keepOriginalTimestamps = options.keepOriginalTimestamps : this.keepOriginalTimestamps = !1, 
        this.pendingTracks = [], this.videoTrack = null, this.pendingBoxes = [], this.pendingCaptions = [], 
        this.pendingMetadata = [], this.pendingBytes = 0, this.emittedTracks = 0, _CoalesceStream.prototype.init.call(this), 
        this.push = function(output) {
            return output.text ? this.pendingCaptions.push(output) : output.frames ? this.pendingMetadata.push(output) : (this.pendingTracks.push(output.track), 
            this.pendingBytes += output.boxes.byteLength, "video" === output.track.type && (this.videoTrack = output.track, 
            this.pendingBoxes.push(output.boxes)), void ("audio" === output.track.type && (this.audioTrack = output.track, 
            this.pendingBoxes.unshift(output.boxes))));
        };
    }).prototype = new Stream, _CoalesceStream.prototype.flush = function(flushSource) {
        var caption, id3, initSegment, i, offset = 0, event = {
            captions: [],
            captionStreams: {},
            metadata: [],
            info: {}
        }, timelineStartPts = 0;
        if (this.pendingTracks.length < this.numberOfTracks) {
            if ("VideoSegmentStream" !== flushSource && "AudioSegmentStream" !== flushSource) return;
            if (this.remuxTracks) return;
            if (0 === this.pendingTracks.length) return this.emittedTracks++, void (this.emittedTracks >= this.numberOfTracks && (this.trigger("done"), 
            this.emittedTracks = 0));
        }
        if (this.videoTrack ? (timelineStartPts = this.videoTrack.timelineStartInfo.pts, 
        VIDEO_PROPERTIES.forEach((function(prop) {
            event.info[prop] = this.videoTrack[prop];
        }), this)) : this.audioTrack && (timelineStartPts = this.audioTrack.timelineStartInfo.pts, 
        AUDIO_PROPERTIES.forEach((function(prop) {
            event.info[prop] = this.audioTrack[prop];
        }), this)), this.videoTrack || this.audioTrack) {
            for (1 === this.pendingTracks.length ? event.type = this.pendingTracks[0].type : event.type = "combined", 
            this.emittedTracks += this.pendingTracks.length, initSegment = mp4.initSegment(this.pendingTracks), 
            event.initSegment = new Uint8Array(initSegment.byteLength), event.initSegment.set(initSegment), 
            event.data = new Uint8Array(this.pendingBytes), i = 0; i < this.pendingBoxes.length; i++) event.data.set(this.pendingBoxes[i], offset), 
            offset += this.pendingBoxes[i].byteLength;
            for (i = 0; i < this.pendingCaptions.length; i++) (caption = this.pendingCaptions[i]).startTime = clock.metadataTsToSeconds(caption.startPts, timelineStartPts, this.keepOriginalTimestamps), 
            caption.endTime = clock.metadataTsToSeconds(caption.endPts, timelineStartPts, this.keepOriginalTimestamps), 
            event.captionStreams[caption.stream] = !0, event.captions.push(caption);
            for (i = 0; i < this.pendingMetadata.length; i++) (id3 = this.pendingMetadata[i]).cueTime = clock.metadataTsToSeconds(id3.pts, timelineStartPts, this.keepOriginalTimestamps), 
            event.metadata.push(id3);
            for (event.metadata.dispatchType = this.metadataStream.dispatchType, this.pendingTracks.length = 0, 
            this.videoTrack = null, this.pendingBoxes.length = 0, this.pendingCaptions.length = 0, 
            this.pendingBytes = 0, this.pendingMetadata.length = 0, this.trigger("data", event), 
            i = 0; i < event.captions.length; i++) caption = event.captions[i], this.trigger("caption", caption);
            for (i = 0; i < event.metadata.length; i++) id3 = event.metadata[i], this.trigger("id3Frame", id3);
        }
        this.emittedTracks >= this.numberOfTracks && (this.trigger("done"), this.emittedTracks = 0);
    }, _CoalesceStream.prototype.setRemux = function(val) {
        this.remuxTracks = val;
    }, (_Transmuxer = function(options) {
        var videoTrack, audioTrack, self = this, hasFlushed = !0;
        _Transmuxer.prototype.init.call(this), options = options || {}, this.baseMediaDecodeTime = options.baseMediaDecodeTime || 0, 
        this.transmuxPipeline_ = {}, this.setupAacPipeline = function() {
            var pipeline = {};
            this.transmuxPipeline_ = pipeline, pipeline.type = "aac", pipeline.metadataStream = new m2ts.MetadataStream, 
            pipeline.aacStream = new AacStream, pipeline.audioTimestampRolloverStream = new m2ts.TimestampRolloverStream("audio"), 
            pipeline.timedMetadataTimestampRolloverStream = new m2ts.TimestampRolloverStream("timed-metadata"), 
            pipeline.adtsStream = new AdtsStream, pipeline.coalesceStream = new _CoalesceStream(options, pipeline.metadataStream), 
            pipeline.headOfPipeline = pipeline.aacStream, pipeline.aacStream.pipe(pipeline.audioTimestampRolloverStream).pipe(pipeline.adtsStream), 
            pipeline.aacStream.pipe(pipeline.timedMetadataTimestampRolloverStream).pipe(pipeline.metadataStream).pipe(pipeline.coalesceStream), 
            pipeline.metadataStream.on("timestamp", (function(frame) {
                pipeline.aacStream.setTimestamp(frame.timeStamp);
            })), pipeline.aacStream.on("data", (function(data) {
                "timed-metadata" !== data.type && "audio" !== data.type || pipeline.audioSegmentStream || (audioTrack = audioTrack || {
                    timelineStartInfo: {
                        baseMediaDecodeTime: self.baseMediaDecodeTime
                    },
                    codec: "adts",
                    type: "audio"
                }, pipeline.coalesceStream.numberOfTracks++, pipeline.audioSegmentStream = new _AudioSegmentStream(audioTrack, options), 
                pipeline.audioSegmentStream.on("log", self.getLogTrigger_("audioSegmentStream")), 
                pipeline.audioSegmentStream.on("timingInfo", self.trigger.bind(self, "audioTimingInfo")), 
                pipeline.adtsStream.pipe(pipeline.audioSegmentStream).pipe(pipeline.coalesceStream), 
                self.trigger("trackinfo", {
                    hasAudio: !!audioTrack,
                    hasVideo: !!videoTrack
                }));
            })), pipeline.coalesceStream.on("data", this.trigger.bind(this, "data")), pipeline.coalesceStream.on("done", this.trigger.bind(this, "done"));
        }, this.setupTsPipeline = function() {
            var pipeline = {};
            this.transmuxPipeline_ = pipeline, pipeline.type = "ts", pipeline.metadataStream = new m2ts.MetadataStream, 
            pipeline.packetStream = new m2ts.TransportPacketStream, pipeline.parseStream = new m2ts.TransportParseStream, 
            pipeline.elementaryStream = new m2ts.ElementaryStream, pipeline.timestampRolloverStream = new m2ts.TimestampRolloverStream, 
            pipeline.adtsStream = new AdtsStream, pipeline.h264Stream = new H264Stream, pipeline.captionStream = new m2ts.CaptionStream(options), 
            pipeline.coalesceStream = new _CoalesceStream(options, pipeline.metadataStream), 
            pipeline.headOfPipeline = pipeline.packetStream, pipeline.packetStream.pipe(pipeline.parseStream).pipe(pipeline.elementaryStream).pipe(pipeline.timestampRolloverStream), 
            pipeline.timestampRolloverStream.pipe(pipeline.h264Stream), pipeline.timestampRolloverStream.pipe(pipeline.adtsStream), 
            pipeline.timestampRolloverStream.pipe(pipeline.metadataStream).pipe(pipeline.coalesceStream), 
            pipeline.h264Stream.pipe(pipeline.captionStream).pipe(pipeline.coalesceStream), 
            pipeline.elementaryStream.on("data", (function(data) {
                var i;
                if ("metadata" === data.type) {
                    for (i = data.tracks.length; i--; ) videoTrack || "video" !== data.tracks[i].type ? audioTrack || "audio" !== data.tracks[i].type || ((audioTrack = data.tracks[i]).timelineStartInfo.baseMediaDecodeTime = self.baseMediaDecodeTime) : (videoTrack = data.tracks[i]).timelineStartInfo.baseMediaDecodeTime = self.baseMediaDecodeTime;
                    videoTrack && !pipeline.videoSegmentStream && (pipeline.coalesceStream.numberOfTracks++, 
                    pipeline.videoSegmentStream = new _VideoSegmentStream(videoTrack, options), pipeline.videoSegmentStream.on("log", self.getLogTrigger_("videoSegmentStream")), 
                    pipeline.videoSegmentStream.on("timelineStartInfo", (function(timelineStartInfo) {
                        audioTrack && !options.keepOriginalTimestamps && (audioTrack.timelineStartInfo = timelineStartInfo, 
                        pipeline.audioSegmentStream.setEarliestDts(timelineStartInfo.dts - self.baseMediaDecodeTime));
                    })), pipeline.videoSegmentStream.on("processedGopsInfo", self.trigger.bind(self, "gopInfo")), 
                    pipeline.videoSegmentStream.on("segmentTimingInfo", self.trigger.bind(self, "videoSegmentTimingInfo")), 
                    pipeline.videoSegmentStream.on("baseMediaDecodeTime", (function(baseMediaDecodeTime) {
                        audioTrack && pipeline.audioSegmentStream.setVideoBaseMediaDecodeTime(baseMediaDecodeTime);
                    })), pipeline.videoSegmentStream.on("timingInfo", self.trigger.bind(self, "videoTimingInfo")), 
                    pipeline.h264Stream.pipe(pipeline.videoSegmentStream).pipe(pipeline.coalesceStream)), 
                    audioTrack && !pipeline.audioSegmentStream && (pipeline.coalesceStream.numberOfTracks++, 
                    pipeline.audioSegmentStream = new _AudioSegmentStream(audioTrack, options), pipeline.audioSegmentStream.on("log", self.getLogTrigger_("audioSegmentStream")), 
                    pipeline.audioSegmentStream.on("timingInfo", self.trigger.bind(self, "audioTimingInfo")), 
                    pipeline.audioSegmentStream.on("segmentTimingInfo", self.trigger.bind(self, "audioSegmentTimingInfo")), 
                    pipeline.adtsStream.pipe(pipeline.audioSegmentStream).pipe(pipeline.coalesceStream)), 
                    self.trigger("trackinfo", {
                        hasAudio: !!audioTrack,
                        hasVideo: !!videoTrack
                    });
                }
            })), pipeline.coalesceStream.on("data", this.trigger.bind(this, "data")), pipeline.coalesceStream.on("id3Frame", (function(id3Frame) {
                id3Frame.dispatchType = pipeline.metadataStream.dispatchType, self.trigger("id3Frame", id3Frame);
            })), pipeline.coalesceStream.on("caption", this.trigger.bind(this, "caption")), 
            pipeline.coalesceStream.on("done", this.trigger.bind(this, "done"));
        }, this.setBaseMediaDecodeTime = function(baseMediaDecodeTime) {
            var pipeline = this.transmuxPipeline_;
            options.keepOriginalTimestamps || (this.baseMediaDecodeTime = baseMediaDecodeTime), 
            audioTrack && (audioTrack.timelineStartInfo.dts = void 0, audioTrack.timelineStartInfo.pts = void 0, 
            trackDecodeInfo.clearDtsInfo(audioTrack), pipeline.audioTimestampRolloverStream && pipeline.audioTimestampRolloverStream.discontinuity()), 
            videoTrack && (pipeline.videoSegmentStream && (pipeline.videoSegmentStream.gopCache_ = []), 
            videoTrack.timelineStartInfo.dts = void 0, videoTrack.timelineStartInfo.pts = void 0, 
            trackDecodeInfo.clearDtsInfo(videoTrack), pipeline.captionStream.reset()), pipeline.timestampRolloverStream && pipeline.timestampRolloverStream.discontinuity();
        }, this.setAudioAppendStart = function(timestamp) {
            audioTrack && this.transmuxPipeline_.audioSegmentStream.setAudioAppendStart(timestamp);
        }, this.setRemux = function(val) {
            var pipeline = this.transmuxPipeline_;
            options.remux = val, pipeline && pipeline.coalesceStream && pipeline.coalesceStream.setRemux(val);
        }, this.alignGopsWith = function(gopsToAlignWith) {
            videoTrack && this.transmuxPipeline_.videoSegmentStream && this.transmuxPipeline_.videoSegmentStream.alignGopsWith(gopsToAlignWith);
        }, this.getLogTrigger_ = function(key) {
            var self = this;
            return function(event) {
                event.stream = key, self.trigger("log", event);
            };
        }, this.push = function(data) {
            if (hasFlushed) {
                var isAac = isLikelyAacData(data);
                if (isAac && "aac" !== this.transmuxPipeline_.type ? this.setupAacPipeline() : isAac || "ts" === this.transmuxPipeline_.type || this.setupTsPipeline(), 
                this.transmuxPipeline_) for (var keys = Object.keys(this.transmuxPipeline_), i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    "headOfPipeline" !== key && this.transmuxPipeline_[key].on && this.transmuxPipeline_[key].on("log", this.getLogTrigger_(key));
                }
                hasFlushed = !1;
            }
            this.transmuxPipeline_.headOfPipeline.push(data);
        }, this.flush = function() {
            hasFlushed = !0, this.transmuxPipeline_.headOfPipeline.flush();
        }, this.endTimeline = function() {
            this.transmuxPipeline_.headOfPipeline.endTimeline();
        }, this.reset = function() {
            this.transmuxPipeline_.headOfPipeline && this.transmuxPipeline_.headOfPipeline.reset();
        }, this.resetCaptions = function() {
            this.transmuxPipeline_.captionStream && this.transmuxPipeline_.captionStream.reset();
        };
    }).prototype = new Stream, module.exports = {
        Transmuxer: _Transmuxer,
        VideoSegmentStream: _VideoSegmentStream,
        AudioSegmentStream: _AudioSegmentStream,
        AUDIO_PROPERTIES: AUDIO_PROPERTIES,
        VIDEO_PROPERTIES: VIDEO_PROPERTIES,
        generateSegmentTimingInfo: generateSegmentTimingInfo
    };
}
