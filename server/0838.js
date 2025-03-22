function(module, exports, __webpack_require__) {
    "use strict";
    var Stream = __webpack_require__(37), mp4 = __webpack_require__(140), audioFrameUtils = __webpack_require__(415), trackInfo = __webpack_require__(142), ONE_SECOND_IN_TS = __webpack_require__(54).ONE_SECOND_IN_TS, AUDIO_PROPERTIES = __webpack_require__(420), AudioSegmentStream = function AudioSegmentStream(track, options) {
        var adtsFrames = [], sequenceNumber = 0, earliestAllowedDts = 0, audioAppendStartTs = 0, videoBaseMediaDecodeTime = 1 / 0, segmentStartPts = null, segmentEndPts = null;
        options = options || {}, AudioSegmentStream.prototype.init.call(this), this.push = function(data) {
            trackInfo.collectDtsInfo(track, data), track && AUDIO_PROPERTIES.forEach((function(prop) {
                track[prop] = data[prop];
            })), adtsFrames.push(data);
        }, this.setEarliestDts = function(earliestDts) {
            earliestAllowedDts = earliestDts;
        }, this.setVideoBaseMediaDecodeTime = function(baseMediaDecodeTime) {
            videoBaseMediaDecodeTime = baseMediaDecodeTime;
        }, this.setAudioAppendStart = function(timestamp) {
            audioAppendStartTs = timestamp;
        }, this.processFrames_ = function() {
            var frames, moof, mdat, boxes, timingInfo;
            0 !== adtsFrames.length && 0 !== (frames = audioFrameUtils.trimAdtsFramesByEarliestDts(adtsFrames, track, earliestAllowedDts)).length && (track.baseMediaDecodeTime = trackInfo.calculateTrackBaseMediaDecodeTime(track, options.keepOriginalTimestamps), 
            audioFrameUtils.prefixWithSilence(track, frames, audioAppendStartTs, videoBaseMediaDecodeTime), 
            track.samples = audioFrameUtils.generateSampleTable(frames), mdat = mp4.mdat(audioFrameUtils.concatenateFrameData(frames)), 
            adtsFrames = [], moof = mp4.moof(sequenceNumber, [ track ]), sequenceNumber++, track.initSegment = mp4.initSegment([ track ]), 
            (boxes = new Uint8Array(moof.byteLength + mdat.byteLength)).set(moof), boxes.set(mdat, moof.byteLength), 
            trackInfo.clearDtsInfo(track), null === segmentStartPts && (segmentEndPts = segmentStartPts = frames[0].pts), 
            segmentEndPts += frames.length * (1024 * ONE_SECOND_IN_TS / track.samplerate), timingInfo = {
                start: segmentStartPts
            }, this.trigger("timingInfo", timingInfo), this.trigger("data", {
                track: track,
                boxes: boxes
            }));
        }, this.flush = function() {
            this.processFrames_(), this.trigger("timingInfo", {
                start: segmentStartPts,
                end: segmentEndPts
            }), this.resetTiming_(), this.trigger("done", "AudioSegmentStream");
        }, this.partialFlush = function() {
            this.processFrames_(), this.trigger("partialdone", "AudioSegmentStream");
        }, this.endTimeline = function() {
            this.flush(), this.trigger("endedtimeline", "AudioSegmentStream");
        }, this.resetTiming_ = function() {
            trackInfo.clearDtsInfo(track), segmentStartPts = null, segmentEndPts = null;
        }, this.reset = function() {
            this.resetTiming_(), adtsFrames = [], this.trigger("reset");
        };
    };
    AudioSegmentStream.prototype = new Stream, module.exports = AudioSegmentStream;
}
