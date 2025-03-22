function(module, exports, __webpack_require__) {
    "use strict";
    var ONE_SECOND_IN_TS = __webpack_require__(54).ONE_SECOND_IN_TS;
    module.exports = {
        clearDtsInfo: function(track) {
            delete track.minSegmentDts, delete track.maxSegmentDts, delete track.minSegmentPts, 
            delete track.maxSegmentPts;
        },
        calculateTrackBaseMediaDecodeTime: function(track, keepOriginalTimestamps) {
            var baseMediaDecodeTime, minSegmentDts = track.minSegmentDts;
            return keepOriginalTimestamps || (minSegmentDts -= track.timelineStartInfo.dts), 
            baseMediaDecodeTime = track.timelineStartInfo.baseMediaDecodeTime, baseMediaDecodeTime += minSegmentDts, 
            baseMediaDecodeTime = Math.max(0, baseMediaDecodeTime), "audio" === track.type && (baseMediaDecodeTime *= track.samplerate / ONE_SECOND_IN_TS, 
            baseMediaDecodeTime = Math.floor(baseMediaDecodeTime)), baseMediaDecodeTime;
        },
        collectDtsInfo: function(track, data) {
            "number" == typeof data.pts && (void 0 === track.timelineStartInfo.pts && (track.timelineStartInfo.pts = data.pts), 
            void 0 === track.minSegmentPts ? track.minSegmentPts = data.pts : track.minSegmentPts = Math.min(track.minSegmentPts, data.pts), 
            void 0 === track.maxSegmentPts ? track.maxSegmentPts = data.pts : track.maxSegmentPts = Math.max(track.maxSegmentPts, data.pts)), 
            "number" == typeof data.dts && (void 0 === track.timelineStartInfo.dts && (track.timelineStartInfo.dts = data.dts), 
            void 0 === track.minSegmentDts ? track.minSegmentDts = data.dts : track.minSegmentDts = Math.min(track.minSegmentDts, data.dts), 
            void 0 === track.maxSegmentDts ? track.maxSegmentDts = data.dts : track.maxSegmentDts = Math.max(track.maxSegmentDts, data.dts));
        }
    };
}
