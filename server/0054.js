function(module, exports, __webpack_require__) {
    "use strict";
    var secondsToVideoTs, secondsToAudioTs, videoTsToSeconds, audioTsToSeconds, audioTsToVideoTs, videoTsToAudioTs, metadataTsToSeconds;
    secondsToVideoTs = function(seconds) {
        return 9e4 * seconds;
    }, secondsToAudioTs = function(seconds, sampleRate) {
        return seconds * sampleRate;
    }, videoTsToSeconds = function(timestamp) {
        return timestamp / 9e4;
    }, audioTsToSeconds = function(timestamp, sampleRate) {
        return timestamp / sampleRate;
    }, audioTsToVideoTs = function(timestamp, sampleRate) {
        return secondsToVideoTs(audioTsToSeconds(timestamp, sampleRate));
    }, videoTsToAudioTs = function(timestamp, sampleRate) {
        return secondsToAudioTs(videoTsToSeconds(timestamp), sampleRate);
    }, metadataTsToSeconds = function(timestamp, timelineStartPts, keepOriginalTimestamps) {
        return videoTsToSeconds(keepOriginalTimestamps ? timestamp : timestamp - timelineStartPts);
    }, module.exports = {
        ONE_SECOND_IN_TS: 9e4,
        secondsToVideoTs: secondsToVideoTs,
        secondsToAudioTs: secondsToAudioTs,
        videoTsToSeconds: videoTsToSeconds,
        audioTsToSeconds: audioTsToSeconds,
        audioTsToVideoTs: audioTsToVideoTs,
        videoTsToAudioTs: videoTsToAudioTs,
        metadataTsToSeconds: metadataTsToSeconds
    };
}
