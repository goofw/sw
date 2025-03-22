function(module, exports, __webpack_require__) {
    "use strict";
    var coneOfSilence = __webpack_require__(827), clock = __webpack_require__(54);
    module.exports = {
        prefixWithSilence: function(track, frames, audioAppendStartTs, videoBaseMediaDecodeTime) {
            var baseMediaDecodeTimeTs, frameDuration, silentFrame, i, firstFrame, audioGapDuration = 0, audioFillFrameCount = 0, audioFillDuration = 0;
            if (frames.length && (baseMediaDecodeTimeTs = clock.audioTsToVideoTs(track.baseMediaDecodeTime, track.samplerate), 
            frameDuration = Math.ceil(clock.ONE_SECOND_IN_TS / (track.samplerate / 1024)), audioAppendStartTs && videoBaseMediaDecodeTime && (audioGapDuration = baseMediaDecodeTimeTs - Math.max(audioAppendStartTs, videoBaseMediaDecodeTime), 
            audioFillDuration = (audioFillFrameCount = Math.floor(audioGapDuration / frameDuration)) * frameDuration), 
            !(audioFillFrameCount < 1 || audioFillDuration > clock.ONE_SECOND_IN_TS / 2))) {
                for ((silentFrame = coneOfSilence()[track.samplerate]) || (silentFrame = frames[0].data), 
                i = 0; i < audioFillFrameCount; i++) firstFrame = frames[0], frames.splice(0, 0, {
                    data: silentFrame,
                    dts: firstFrame.dts - frameDuration,
                    pts: firstFrame.pts - frameDuration
                });
                return track.baseMediaDecodeTime -= Math.floor(clock.videoTsToAudioTs(audioFillDuration, track.samplerate)), 
                audioFillDuration;
            }
        },
        trimAdtsFramesByEarliestDts: function(adtsFrames, track, earliestAllowedDts) {
            return track.minSegmentDts >= earliestAllowedDts ? adtsFrames : (track.minSegmentDts = 1 / 0, 
            adtsFrames.filter((function(currentFrame) {
                return currentFrame.dts >= earliestAllowedDts && (track.minSegmentDts = Math.min(track.minSegmentDts, currentFrame.dts), 
                track.minSegmentPts = track.minSegmentDts, !0);
            })));
        },
        generateSampleTable: function(frames) {
            var i, currentFrame, samples = [];
            for (i = 0; i < frames.length; i++) currentFrame = frames[i], samples.push({
                size: currentFrame.data.byteLength,
                duration: 1024
            });
            return samples;
        },
        concatenateFrameData: function(frames) {
            var i, currentFrame, dataOffset = 0, data = new Uint8Array((function(array) {
                var i, sum = 0;
                for (i = 0; i < array.length; i++) sum += array[i].data.byteLength;
                return sum;
            })(frames));
            for (i = 0; i < frames.length; i++) currentFrame = frames[i], data.set(currentFrame.data, dataOffset), 
            dataOffset += currentFrame.data.byteLength;
            return data;
        }
    };
}
