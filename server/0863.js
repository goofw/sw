function(module, exports, __webpack_require__) {
    const predict = __webpack_require__(432);
    module.exports = function({stream: stream, format: format, samples: samples, sampleDuration: sampleDuration, timescale: timescale, segmentDuration: segmentDuration}) {
        const timescaleCoef = timescale / stream.timescale, segmentDurationTs = Math.ceil(segmentDuration * timescale), sampleDurationTs = sampleDuration * timescaleCoef;
        if (samples.some((({key: key}) => key))) return samples.filter((({key: key}) => key)).map((({pts: pts}, index, keySamples) => ({
            sequenceNumber: index + 1,
            seekTime: pts * timescaleCoef,
            duration: index + 1 < keySamples.length ? (keySamples[index + 1].pts - pts) * timescaleCoef : sampleDurationTs,
            buffer: null,
            cues: [],
            extraSegments: []
        }))).map(((segment, index, segments) => [ segment, "video" === stream.track && [ segment, segments[index - 1] ].some((segment => segment && segment.duration < 20 * sampleDurationTs)) ])).reduce(((result, [segment, extra]) => {
            if (result.has(result.size)) {
                const lastRootSegment = result.get(result.size), lastRootSegmentTotalDuration = lastRootSegment.duration + lastRootSegment.extraSegments.reduce(((result, {duration: duration}) => result + duration), 0);
                if (lastRootSegmentTotalDuration < segmentDurationTs || extra) return "audio" === stream.track && (segment.sequenceNumber = null), 
                lastRootSegment.extraSegments.push(segment), result;
            }
            return "audio" === stream.track && (segment.sequenceNumber = result.size + 1), result.set(result.size + 1, segment), 
            result;
        }), new Map);
        const samplesPerSegment = Math.ceil(segmentDurationTs / (sampleDuration * timescaleCoef));
        return predict({
            stream: stream,
            format: format,
            segmentDuration: samplesPerSegment * sampleDuration / stream.timescale,
            timescale: timescale
        });
    };
}
