function(module, exports, __webpack_require__) {
    const {Mutex: Mutex} = __webpack_require__(402), userSettings = __webpack_require__(94), retrieveMediaSamples = __webpack_require__(405), probeMedia = __webpack_require__(401), m3u8 = __webpack_require__(431), MediaConverter = __webpack_require__(861), IGNORED_STREAM_CODECS = [ "dvb_subtitle", "dvd_subtitle", "hdmv_pgs_subtitle", "xsub" ];
    class ConverterDestroyedError extends Error {
        constructor() {
            super("MasterConverter is destroyed"), this.name = "ConverterDestroyedError";
        }
    }
    module.exports = function({ffmpeg: ffmpeg, ffprobe: ffprobe, id: id, mediaURL: mediaURL, maxAudioChannels: maxAudioChannels, videoCodecs: videoCodecs, audioCodecs: audioCodecs, forceTranscoding: forceTranscoding, profile: profile, maxWidth: maxWidth}) {
        if ("string" != typeof mediaURL || 0 === mediaURL.length) throw new Error("Invalid media url");
        if ("number" == typeof maxAudioChannels && maxAudioChannels <= 0) throw new Error("Invalid audio channels");
        let destroyed = !1;
        const queryData = [ [ "mediaURL", mediaURL ], ..."number" == typeof maxAudioChannels ? [ [ "maxAudioChannels", maxAudioChannels ] ] : [], ...forceTranscoding ? [ [ "forceTranscoding", "1" ] ] : [], ...Array.isArray(videoCodecs) ? videoCodecs.map((videoCodec => [ "videoCodecs", videoCodec ])) : [], ...Array.isArray(audioCodecs) ? audioCodecs.map((audioCodec => [ "audioCodecs", audioCodec ])) : [] ];
        profile && queryData.push([ "profile", profile ]), maxWidth && queryData.push([ "maxWidth", maxWidth ]);
        const query = new URLSearchParams(queryData).toString(), probe = {
            mutex: new Mutex(new ConverterDestroyedError),
            value: null,
            error: null,
            get: async () => {
                if (probe.mutex.isLocked() && await probe.mutex.acquire().then((release => release())), 
                null !== probe.value) return probe.value;
                if (null !== probe.error) throw probe.error;
                const release = await probe.mutex.acquire();
                try {
                    process.env.HLS_DEBUG && console.log("HLSV2:probe:start", mediaURL);
                    const {streams: streams, format: format} = await probeMedia({
                        ffprobe: ffprobe,
                        mediaURL: mediaURL
                    }).then((({streams: streams, format: format}) => ({
                        streams: streams.filter(((stream, index, streams) => "video" === stream.track && index === streams.findIndex((({track: track}) => "video" === track)) || "audio" === stream.track || "subtitle" === stream.track)),
                        format: format
                    })));
                    if (process.env.HLS_DEBUG && console.log("HLSV2:probe:result", JSON.stringify({
                        streams: streams,
                        format: format
                    }, null, 4)), !probe.mutex.isLocked()) throw new ConverterDestroyedError;
                    if ("number" != typeof format.duration) throw new Error("Live media is not supported");
                    const avStreams = streams.filter((({track: track}) => "video" === track || "audio" === track));
                    if (0 === avStreams.length) throw new Error("No video or audio streams found");
                    let samples = {};
                    try {
                        const avIndexes = avStreams.map((({index: index}) => index));
                        format.name.includes("mp4") ? samples = await retrieveMediaSamples.mp4(mediaURL, avIndexes) : format.name.includes("matroska") && (samples = await retrieveMediaSamples.matroska(mediaURL, avIndexes));
                    } catch (_) {}
                    if (!probe.mutex.isLocked()) throw new ConverterDestroyedError;
                    return probe.value = {
                        streams: streams,
                        format: format,
                        samples: samples
                    }, release(), probe.value;
                } catch (error) {
                    throw process.env.HLS_DEBUG && console.log("HLSV2:probe:error", error), error instanceof ConverterDestroyedError || (probe.error = error), 
                    release(), error;
                }
            },
            destroy: () => {
                probe.mutex.cancel(), value = null, error = null;
            }
        }, converters = {
            value: {},
            get: async track => {
                if ("string" != typeof track) throw new Error("Invalid track requested");
                if (!converters.value[track]) {
                    const trackType = track.replace(/[0-9]/g, "");
                    Object.keys(converters.value).filter((track => track.startsWith(trackType))).sort(((trackA, trackB) => converters.value[trackB].touched - converters.value[trackA].touched)).slice(userSettings.transcodeTrackConcurrency - 1).forEach((track => {
                        console.log(`hls-converter ${id} destroying track ${track} due to passing track concurrency of ${userSettings.transcodeTrackConcurrency}`), 
                        converters.value[track].destroy(), delete converters.value[track];
                    })), converters.value[track] = {
                        mutex: new Mutex(new ConverterDestroyedError),
                        value: null,
                        error: null,
                        touched: new Date,
                        destroy: () => {
                            converters.value[track].mutex.cancel(), converters.value[track].value && converters.value[track].value.destroy(), 
                            converters.value[track].value = null, converters.value[track].error = null;
                        }
                    };
                }
                const converter = converters.value[track];
                if (converter.touched.setTime(Date.now()), converter.mutex.isLocked() && await converter.mutex.acquire().then((release => release())), 
                null !== converter.value) return converter.value;
                if (null !== converter.error) throw converter.error;
                const release = await converter.mutex.acquire();
                try {
                    const {streams: streams, format: format, samples: samples} = await probe.get(), stream = streams.find((stream => `${stream.track}${stream.id}` === track));
                    if (!stream) throw new Error("Track not found");
                    return converter.value = new MediaConverter({
                        ffmpeg: ffmpeg,
                        mediaURL: mediaURL,
                        maxAudioChannels: maxAudioChannels,
                        videoCodecs: videoCodecs,
                        audioCodecs: audioCodecs,
                        forceTranscoding: forceTranscoding,
                        profile: profile,
                        maxWidth: maxWidth,
                        stream: stream,
                        format: format,
                        samples: samples[stream.index] ? samples[stream.index].samples : [],
                        sampleDuration: samples[stream.index] ? samples[stream.index].sampleDuration : null,
                        query: query
                    }), release(), converter.value;
                } catch (error) {
                    throw error instanceof ConverterDestroyedError || (converter.error = error), release(), 
                    error;
                }
            },
            destroy: () => {
                Object.values(converters.value).forEach((converter => {
                    converter.destroy();
                })), converters.value = {};
            }
        };
        this.playlist = async track => {
            if (destroyed) throw new ConverterDestroyedError;
            if ("master" === track) {
                const {streams: streams} = await probe.get();
                return m3u8.master({
                    streams: streams.filter((stream => -1 === IGNORED_STREAM_CODECS.indexOf(stream.codec))),
                    query: query
                });
            }
            return (await converters.get(track)).playlist();
        }, this.initSegment = async track => {
            if (destroyed) throw new ConverterDestroyedError;
            return (await converters.get(track)).initSegment();
        }, this.mediaSegment = async (track, sequenceNumber) => {
            if (destroyed) throw new ConverterDestroyedError;
            return (await converters.get(track)).mediaSegment(sequenceNumber);
        }, this.burnSubtitles = async ({url: url, id: id}) => {
            if (destroyed) throw new ConverterDestroyedError;
            return (await converters.get("video0")).burnSubtitles({
                url: url,
                id: id
            });
        }, this.status = async () => {
            if (destroyed) throw new ConverterDestroyedError;
            const result = {
                query: query,
                probe: {
                    value: probe.value,
                    error: probe.error ? probe.error.toString() : null
                },
                converters: {}
            };
            for (const track of Object.keys(converters.value)) try {
                const converter = await converters.get(track);
                result.converters[track] = await converter.status();
            } catch (error) {
                result.converters[track] = error.toString();
            }
            return result;
        }, this.destroy = () => {
            destroyed = !0, probe.destroy(), converters.destroy();
        };
    };
}
