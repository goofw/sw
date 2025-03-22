function(module, exports) {
    module.exports = function({stream: stream, format: format, segmentDuration: segmentDuration, timescale: timescale}) {
        const timescaleCoef = timescale / stream.timescale, startTimeTs = "number" == typeof stream.startTimeTs ? stream.startTimeTs * timescaleCoef : 0, formatDurationTs = Math.ceil(format.duration * timescale), segmentDurationTs = Math.ceil(segmentDuration * timescale), lastSegmentDurationTs = formatDurationTs % segmentDurationTs;
        return Array(Math.floor(formatDurationTs / segmentDurationTs)).fill(segmentDurationTs).concat(0 !== lastSegmentDurationTs ? [ lastSegmentDurationTs ] : []).reduce(((result, duration, index) => result.set(index + 1, {
            sequenceNumber: index + 1,
            seekTime: startTimeTs + index * segmentDurationTs,
            duration: duration,
            buffer: null,
            cues: [],
            extraSegments: []
        })), new Map);
    };
}
