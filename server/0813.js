function(module, exports, __webpack_require__) {
    const {Decoder: Decoder, Schema: Schema} = __webpack_require__(814), TRACK_TYPE_NAMES = {
        1: "video",
        2: "audio"
    };
    module.exports = async function(url, trackIndexes = []) {
        const segment = (await (async function(url, ebmlIDs = [], skipTags = {}) {
            return new Promise(((resolve, reject) => {
                new Decoder({
                    skipTags: skipTags
                }).parseEbmlIDs(url, ebmlIDs, ((error, document) => {
                    error ? reject(error) : resolve(document);
                }));
            }));
        })(url, [ Schema.byName.Info, Schema.byName.Cues, Schema.byName.Tracks ], {
            SimpleBlock: !0,
            Void: !0,
            Block: !0,
            FileData: !0,
            TagBinary: !0
        })).children.find((({ebmlID: ebmlID}) => ebmlID === Schema.byName.Segment));
        if (!segment) throw new Error("Segment element missing");
        const info = segment.children.find((({ebmlID: ebmlID}) => ebmlID === Schema.byName.Info));
        if (!info) throw new Error("Info element missing");
        const tracks = segment.children.find((({ebmlID: ebmlID}) => ebmlID === Schema.byName.Tracks));
        if (!tracks) throw new Error("Tracks element missing");
        const cues = segment.children.find((({ebmlID: ebmlID}) => ebmlID === Schema.byName.Cues)), cuesPoints = (cues ? cues.children : []).filter((({ebmlID: ebmlID}) => ebmlID === Schema.byName.CuePoint)), timecodeScale = info.timecodeScale;
        return tracks.children.filter((({ebmlID: ebmlID}) => ebmlID === Schema.byName.TrackEntry)).reduce(((result, track, index) => {
            const trackNumber = track.trackNumber, trackType = track.trackType, defaultDuration = track.defaultDuration;
            if (!TRACK_TYPE_NAMES[trackType] || trackIndexes.length > 0 && !trackIndexes.includes(index)) return result;
            const type = TRACK_TYPE_NAMES[trackType], timescale = timecodeScale / 1e3, sampleDuration = "number" == typeof defaultDuration ? defaultDuration / timecodeScale : null, samples = cuesPoints.reduce(((result, cuePoint) => {
                if (cuePoint.children.find((({ebmlID: ebmlID}) => ebmlID === Schema.byName.CueTrackPositions)).children.find((({ebmlID: ebmlID}) => ebmlID === Schema.byName.CueTrack)).getUInt() === trackNumber) {
                    const cueTime = cuePoint.children.find((({ebmlID: ebmlID}) => ebmlID === Schema.byName.CueTime));
                    result.push({
                        key: !0,
                        pts: cueTime.getUInt()
                    });
                }
                return result;
            }), []).sort(((a, b) => a.pts - b.pts));
            return {
                ...result,
                [index]: {
                    type: type,
                    timescale: timescale,
                    sampleDuration: sampleDuration,
                    samples: samples
                }
            };
        }), {});
    };
}
