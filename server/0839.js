function(module, exports, __webpack_require__) {
    "use strict";
    var Stream = __webpack_require__(37), mp4 = __webpack_require__(140), trackInfo = __webpack_require__(142), frameUtils = __webpack_require__(414), VIDEO_PROPERTIES = __webpack_require__(421), VideoSegmentStream = function VideoSegmentStream(track, options) {
        var config, pps, gops, sequenceNumber = 0, nalUnits = [], frameCache = [], segmentStartPts = null, segmentEndPts = null, ensureNextFrameIsKeyFrame = !0;
        options = options || {}, VideoSegmentStream.prototype.init.call(this), this.push = function(nalUnit) {
            trackInfo.collectDtsInfo(track, nalUnit), void 0 === track.timelineStartInfo.dts && (track.timelineStartInfo.dts = nalUnit.dts), 
            "seq_parameter_set_rbsp" !== nalUnit.nalUnitType || config || (config = nalUnit.config, 
            track.sps = [ nalUnit.data ], VIDEO_PROPERTIES.forEach((function(prop) {
                track[prop] = config[prop];
            }), this)), "pic_parameter_set_rbsp" !== nalUnit.nalUnitType || pps || (pps = nalUnit.data, 
            track.pps = [ nalUnit.data ]), nalUnits.push(nalUnit);
        }, this.processNals_ = function(cacheLastFrame) {
            var i;
            for (nalUnits = frameCache.concat(nalUnits); nalUnits.length && "access_unit_delimiter_rbsp" !== nalUnits[0].nalUnitType; ) nalUnits.shift();
            if (0 !== nalUnits.length) {
                var frames = frameUtils.groupNalsIntoFrames(nalUnits);
                if (frames.length) if (frameCache = frames[frames.length - 1], cacheLastFrame && (frames.pop(), 
                frames.duration -= frameCache.duration, frames.nalCount -= frameCache.length, frames.byteLength -= frameCache.byteLength), 
                frames.length) {
                    if (this.trigger("timelineStartInfo", track.timelineStartInfo), ensureNextFrameIsKeyFrame) {
                        if (!(gops = frameUtils.groupFramesIntoGops(frames))[0][0].keyFrame) {
                            if (!(gops = frameUtils.extendFirstKeyFrame(gops))[0][0].keyFrame) return nalUnits = [].concat.apply([], frames).concat(frameCache), 
                            void (frameCache = []);
                            (frames = [].concat.apply([], gops)).duration = gops.duration;
                        }
                        ensureNextFrameIsKeyFrame = !1;
                    }
                    for (null === segmentStartPts && (segmentStartPts = frames[0].pts, segmentEndPts = segmentStartPts), 
                    segmentEndPts += frames.duration, this.trigger("timingInfo", {
                        start: segmentStartPts,
                        end: segmentEndPts
                    }), i = 0; i < frames.length; i++) {
                        var frame = frames[i];
                        track.samples = frameUtils.generateSampleTableForFrame(frame);
                        var mdat = mp4.mdat(frameUtils.concatenateNalDataForFrame(frame));
                        trackInfo.clearDtsInfo(track), trackInfo.collectDtsInfo(track, frame), track.baseMediaDecodeTime = trackInfo.calculateTrackBaseMediaDecodeTime(track, options.keepOriginalTimestamps);
                        var moof = mp4.moof(sequenceNumber, [ track ]);
                        sequenceNumber++, track.initSegment = mp4.initSegment([ track ]);
                        var boxes = new Uint8Array(moof.byteLength + mdat.byteLength);
                        boxes.set(moof), boxes.set(mdat, moof.byteLength), this.trigger("data", {
                            track: track,
                            boxes: boxes,
                            sequence: sequenceNumber,
                            videoFrameDts: frame.dts,
                            videoFramePts: frame.pts
                        });
                    }
                    nalUnits = [];
                } else nalUnits = [];
            }
        }, this.resetTimingAndConfig_ = function() {
            config = void 0, pps = void 0, segmentStartPts = null, segmentEndPts = null;
        }, this.partialFlush = function() {
            this.processNals_(!0), this.trigger("partialdone", "VideoSegmentStream");
        }, this.flush = function() {
            this.processNals_(!1), this.resetTimingAndConfig_(), this.trigger("done", "VideoSegmentStream");
        }, this.endTimeline = function() {
            this.flush(), this.trigger("endedtimeline", "VideoSegmentStream");
        }, this.reset = function() {
            this.resetTimingAndConfig_(), frameCache = [], nalUnits = [], ensureNextFrameIsKeyFrame = !0, 
            this.trigger("reset");
        };
    };
    VideoSegmentStream.prototype = new Stream, module.exports = VideoSegmentStream;
}
