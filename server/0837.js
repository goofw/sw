function(module, exports, __webpack_require__) {
    "use strict";
    var Stream = __webpack_require__(37), m2ts = __webpack_require__(143), codecs = __webpack_require__(413), AudioSegmentStream = __webpack_require__(838), VideoSegmentStream = __webpack_require__(839), trackInfo = __webpack_require__(142), isLikelyAacData = __webpack_require__(145).isLikelyAacData, AdtsStream = __webpack_require__(139), AacStream = __webpack_require__(419), clock = __webpack_require__(54), createPipeline = function(object) {
        return object.prototype = new Stream, object.prototype.init.call(object), object;
    }, setupPipelineListeners = function(pipeline, transmuxer) {
        pipeline.on("data", transmuxer.trigger.bind(transmuxer, "data")), pipeline.on("done", transmuxer.trigger.bind(transmuxer, "done")), 
        pipeline.on("partialdone", transmuxer.trigger.bind(transmuxer, "partialdone")), 
        pipeline.on("endedtimeline", transmuxer.trigger.bind(transmuxer, "endedtimeline")), 
        pipeline.on("audioTimingInfo", transmuxer.trigger.bind(transmuxer, "audioTimingInfo")), 
        pipeline.on("videoTimingInfo", transmuxer.trigger.bind(transmuxer, "videoTimingInfo")), 
        pipeline.on("trackinfo", transmuxer.trigger.bind(transmuxer, "trackinfo")), pipeline.on("id3Frame", (function(event) {
            event.dispatchType = pipeline.metadataStream.dispatchType, event.cueTime = clock.videoTsToSeconds(event.pts), 
            transmuxer.trigger("id3Frame", event);
        })), pipeline.on("caption", (function(event) {
            transmuxer.trigger("caption", event);
        }));
    }, Transmuxer = function Transmuxer(options) {
        var pipeline = null, hasFlushed = !0;
        options = options || {}, Transmuxer.prototype.init.call(this), options.baseMediaDecodeTime = options.baseMediaDecodeTime || 0, 
        this.push = function(bytes) {
            if (hasFlushed) {
                var isAac = isLikelyAacData(bytes);
                !isAac || pipeline && "aac" === pipeline.type ? isAac || pipeline && "ts" === pipeline.type || (pipeline = (function(options) {
                    var pipeline = {
                        type: "ts",
                        tracks: {
                            audio: null,
                            video: null
                        },
                        packet: new m2ts.TransportPacketStream,
                        parse: new m2ts.TransportParseStream,
                        elementary: new m2ts.ElementaryStream,
                        timestampRollover: new m2ts.TimestampRolloverStream,
                        adts: new codecs.Adts,
                        h264: new codecs.h264.H264Stream,
                        captionStream: new m2ts.CaptionStream(options),
                        metadataStream: new m2ts.MetadataStream
                    };
                    return pipeline.headOfPipeline = pipeline.packet, pipeline.packet.pipe(pipeline.parse).pipe(pipeline.elementary).pipe(pipeline.timestampRollover), 
                    pipeline.timestampRollover.pipe(pipeline.h264), pipeline.h264.pipe(pipeline.captionStream), 
                    pipeline.timestampRollover.pipe(pipeline.metadataStream), pipeline.timestampRollover.pipe(pipeline.adts), 
                    pipeline.elementary.on("data", (function(data) {
                        if ("metadata" === data.type) {
                            for (var i = 0; i < data.tracks.length; i++) pipeline.tracks[data.tracks[i].type] || (pipeline.tracks[data.tracks[i].type] = data.tracks[i], 
                            pipeline.tracks[data.tracks[i].type].timelineStartInfo.baseMediaDecodeTime = options.baseMediaDecodeTime);
                            pipeline.tracks.video && !pipeline.videoSegmentStream && (pipeline.videoSegmentStream = new VideoSegmentStream(pipeline.tracks.video, options), 
                            pipeline.videoSegmentStream.on("timelineStartInfo", (function(timelineStartInfo) {
                                pipeline.tracks.audio && !options.keepOriginalTimestamps && pipeline.audioSegmentStream.setEarliestDts(timelineStartInfo.dts - options.baseMediaDecodeTime);
                            })), pipeline.videoSegmentStream.on("timingInfo", pipeline.trigger.bind(pipeline, "videoTimingInfo")), 
                            pipeline.videoSegmentStream.on("data", (function(data) {
                                pipeline.trigger("data", {
                                    type: "video",
                                    data: data
                                });
                            })), pipeline.videoSegmentStream.on("done", pipeline.trigger.bind(pipeline, "done")), 
                            pipeline.videoSegmentStream.on("partialdone", pipeline.trigger.bind(pipeline, "partialdone")), 
                            pipeline.videoSegmentStream.on("endedtimeline", pipeline.trigger.bind(pipeline, "endedtimeline")), 
                            pipeline.h264.pipe(pipeline.videoSegmentStream)), pipeline.tracks.audio && !pipeline.audioSegmentStream && (pipeline.audioSegmentStream = new AudioSegmentStream(pipeline.tracks.audio, options), 
                            pipeline.audioSegmentStream.on("data", (function(data) {
                                pipeline.trigger("data", {
                                    type: "audio",
                                    data: data
                                });
                            })), pipeline.audioSegmentStream.on("done", pipeline.trigger.bind(pipeline, "done")), 
                            pipeline.audioSegmentStream.on("partialdone", pipeline.trigger.bind(pipeline, "partialdone")), 
                            pipeline.audioSegmentStream.on("endedtimeline", pipeline.trigger.bind(pipeline, "endedtimeline")), 
                            pipeline.audioSegmentStream.on("timingInfo", pipeline.trigger.bind(pipeline, "audioTimingInfo")), 
                            pipeline.adts.pipe(pipeline.audioSegmentStream)), pipeline.trigger("trackinfo", {
                                hasAudio: !!pipeline.tracks.audio,
                                hasVideo: !!pipeline.tracks.video
                            });
                        }
                    })), pipeline.captionStream.on("data", (function(caption) {
                        var timelineStartPts;
                        timelineStartPts = pipeline.tracks.video && pipeline.tracks.video.timelineStartInfo.pts || 0, 
                        caption.startTime = clock.metadataTsToSeconds(caption.startPts, timelineStartPts, options.keepOriginalTimestamps), 
                        caption.endTime = clock.metadataTsToSeconds(caption.endPts, timelineStartPts, options.keepOriginalTimestamps), 
                        pipeline.trigger("caption", caption);
                    })), (pipeline = createPipeline(pipeline)).metadataStream.on("data", pipeline.trigger.bind(pipeline, "id3Frame")), 
                    pipeline;
                })(options), setupPipelineListeners(pipeline, this)) : (pipeline = (function(options) {
                    var pipeline = {
                        type: "aac",
                        tracks: {
                            audio: null
                        },
                        metadataStream: new m2ts.MetadataStream,
                        aacStream: new AacStream,
                        audioRollover: new m2ts.TimestampRolloverStream("audio"),
                        timedMetadataRollover: new m2ts.TimestampRolloverStream("timed-metadata"),
                        adtsStream: new AdtsStream(!0)
                    };
                    return pipeline.headOfPipeline = pipeline.aacStream, pipeline.aacStream.pipe(pipeline.audioRollover).pipe(pipeline.adtsStream), 
                    pipeline.aacStream.pipe(pipeline.timedMetadataRollover).pipe(pipeline.metadataStream), 
                    pipeline.metadataStream.on("timestamp", (function(frame) {
                        pipeline.aacStream.setTimestamp(frame.timeStamp);
                    })), pipeline.aacStream.on("data", (function(data) {
                        "timed-metadata" !== data.type && "audio" !== data.type || pipeline.audioSegmentStream || (pipeline.tracks.audio = pipeline.tracks.audio || {
                            timelineStartInfo: {
                                baseMediaDecodeTime: options.baseMediaDecodeTime
                            },
                            codec: "adts",
                            type: "audio"
                        }, pipeline.audioSegmentStream = new AudioSegmentStream(pipeline.tracks.audio, options), 
                        pipeline.audioSegmentStream.on("data", (function(data) {
                            pipeline.trigger("data", {
                                type: "audio",
                                data: data
                            });
                        })), pipeline.audioSegmentStream.on("partialdone", pipeline.trigger.bind(pipeline, "partialdone")), 
                        pipeline.audioSegmentStream.on("done", pipeline.trigger.bind(pipeline, "done")), 
                        pipeline.audioSegmentStream.on("endedtimeline", pipeline.trigger.bind(pipeline, "endedtimeline")), 
                        pipeline.audioSegmentStream.on("timingInfo", pipeline.trigger.bind(pipeline, "audioTimingInfo")), 
                        pipeline.adtsStream.pipe(pipeline.audioSegmentStream), pipeline.trigger("trackinfo", {
                            hasAudio: !!pipeline.tracks.audio,
                            hasVideo: !!pipeline.tracks.video
                        }));
                    })), (pipeline = createPipeline(pipeline)).metadataStream.on("data", pipeline.trigger.bind(pipeline, "id3Frame")), 
                    pipeline;
                })(options), setupPipelineListeners(pipeline, this)), hasFlushed = !1;
            }
            pipeline.headOfPipeline.push(bytes);
        }, this.flush = function() {
            pipeline && (hasFlushed = !0, pipeline.headOfPipeline.flush());
        }, this.partialFlush = function() {
            pipeline && pipeline.headOfPipeline.partialFlush();
        }, this.endTimeline = function() {
            pipeline && pipeline.headOfPipeline.endTimeline();
        }, this.reset = function() {
            pipeline && pipeline.headOfPipeline.reset();
        }, this.setBaseMediaDecodeTime = function(baseMediaDecodeTime) {
            options.keepOriginalTimestamps || (options.baseMediaDecodeTime = baseMediaDecodeTime), 
            pipeline && (pipeline.tracks.audio && (pipeline.tracks.audio.timelineStartInfo.dts = void 0, 
            pipeline.tracks.audio.timelineStartInfo.pts = void 0, trackInfo.clearDtsInfo(pipeline.tracks.audio), 
            pipeline.audioRollover && pipeline.audioRollover.discontinuity()), pipeline.tracks.video && (pipeline.videoSegmentStream && (pipeline.videoSegmentStream.gopCache_ = []), 
            pipeline.tracks.video.timelineStartInfo.dts = void 0, pipeline.tracks.video.timelineStartInfo.pts = void 0, 
            trackInfo.clearDtsInfo(pipeline.tracks.video)), pipeline.timestampRollover && pipeline.timestampRollover.discontinuity());
        }, this.setRemux = function(val) {
            options.remux = val, pipeline && pipeline.coalesceStream && pipeline.coalesceStream.setRemux(val);
        }, this.setAudioAppendStart = function(audioAppendStart) {
            pipeline && pipeline.tracks.audio && pipeline.audioSegmentStream && pipeline.audioSegmentStream.setAudioAppendStart(audioAppendStart);
        }, this.alignGopsWith = function(gopsToAlignWith) {};
    };
    Transmuxer.prototype = new Stream, module.exports = Transmuxer;
}
