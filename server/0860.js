function(module, exports) {
    module.exports = function({mediaSegments: mediaSegments, timescale: timescale, track: track, query: query}) {
        const durations = Array.from(mediaSegments.values()).map((({duration: duration, extraSegments: extraSegments = []}) => {
            const totalDuration = duration + extraSegments.reduce(((result, {duration: duration}) => result + duration), 0);
            return Math.ceil(totalDuration / timescale);
        })), ext = track.match(/^(?:video|audio).+$/) ? "m4s" : "vtt";
        return [ "#EXTM3U", "#EXT-X-VERSION:7", `#EXT-X-TARGETDURATION:${Math.max.apply(null, durations.concat(1))}`, "#EXT-X-MEDIA-SEQUENCE:1", "#EXT-X-PLAYLIST-TYPE:VOD", ...track.match(/^(?:video|audio).+$/) ? [ `#EXT-X-MAP:URI="${track}/init.mp4?${query}"` ] : [], ...Array.from(mediaSegments.entries()).map((([sequenceNumber, {duration: duration, extraSegments: extraSegments = []}]) => {
            const totalDuration = duration + extraSegments.reduce(((result, {duration: duration}) => result + duration), 0);
            return [ `#EXTINF:${(totalDuration / timescale).toFixed(6)},`, `${track}/segment${sequenceNumber}.${ext}?${query}` ];
        })).reduce(((result, segment) => result.concat(segment)), []), "#EXT-X-ENDLIST" ].join("\n");
    };
}
