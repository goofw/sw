function(module, exports, __webpack_require__) {
    const Router = __webpack_require__(111), userSettings = __webpack_require__(94), {ffmpeg: ffmpeg} = __webpack_require__(186), {probeMedia: probeMedia, Converter: Converter} = __webpack_require__(806), retrieveMediaSamples = __webpack_require__(405), ERROR_CODE = {
        CREATE_CONVERTER_FAILED: 1,
        READ_PLAYLIST_FAILED: 10,
        READ_INIT_SEGMENT_FAILED: 20,
        READ_MEDIA_SEGMENT_FAILED: 30,
        BURN_SUBTITLES_FAILED: 40,
        PROBE_MEDIA_FAILED: 100,
        GET_STATUS_FAILED: 200
    };
    module.exports = function(options = {}) {
        const router = new Router, converters = new Map;
        return setInterval((() => {
            for (const [id, {converter: converter, touched: touched}] of converters.entries()) touched.getTime() < Date.now() - 12e4 && (console.log(`hls-converter ${id} is inactive, destroying it`), 
            converter.destroy(), converters.delete(id), console.log(`hls-converter ${id} destoyed`));
        }), 12e4), router.param("id", (async (req, res, next) => {
            if (!converters.has(req.params.id)) try {
                const maxAudioChannels = parseInt(req.query.maxAudioChannels, 10), converter = new Converter({
                    ffmpeg: options.ffmpeg,
                    ffprobe: options.ffprobe,
                    id: req.params.id,
                    mediaURL: req.query.mediaURL,
                    maxAudioChannels: !isNaN(maxAudioChannels) && isFinite(maxAudioChannels) ? maxAudioChannels : null,
                    forceTranscoding: !!req.query.forceTranscoding,
                    profile: req.query.profile || null,
                    maxWidth: req.query.maxWidth || null,
                    videoCodecs: Array.isArray(req.query.videoCodecs) ? req.query.videoCodecs : "string" == typeof req.query.videoCodecs ? [ req.query.videoCodecs ] : null,
                    audioCodecs: Array.isArray(req.query.audioCodecs) ? req.query.audioCodecs : "string" == typeof req.query.audioCodecs ? [ req.query.audioCodecs ] : null
                });
                Array.from(converters.entries()).sort((([_, {touched: touchedA}], [__, {touched: touchedB}]) => touchedB - touchedA)).slice(userSettings.transcodeConcurrency - 1).forEach((([id, {converter: converter}]) => {
                    console.log(`hls-converter ${id} will be destroyed due to passing concurrency of ${userSettings.transcodeConcurrency}`), 
                    converter.destroy(), converters.delete(id);
                })), converters.set(req.params.id, {
                    converter: converter,
                    touched: new Date
                });
            } catch (error) {
                return console.error(error), res.statusCode = 500, res.setHeader("content-type", "application/json"), 
                void res.end(JSON.stringify({
                    error: {
                        code: ERROR_CODE.CREATE_CONVERTER_FAILED,
                        message: `Failed to create hls converter: ${error.message}`
                    }
                }));
            }
            const {converter: converter, touched: touched} = converters.get(req.params.id);
            touched.setTime(Date.now()), req.converter = converter, next();
        })), router.get("/:id/:track.m3u8", (async (req, res) => {
            let playlist;
            try {
                playlist = await req.converter.playlist(req.params.track);
            } catch (error) {
                return console.error(error), res.statusCode = 500, res.setHeader("content-type", "application/json"), 
                void res.end(JSON.stringify({
                    error: {
                        code: ERROR_CODE.READ_PLAYLIST_FAILED,
                        message: `Failed to read hls playlist: ${error.message}`
                    }
                }));
            }
            res.setHeader("content-type", "application/vnd.apple.mpegurl"), res.setHeader("content-length", Buffer.byteLength(playlist)), 
            res.end(playlist);
        })), router.get("/:id/:track/init.mp4", (async (req, res, next) => {
            if (!req.params.track.match(/^(?:video|audio).+$/)) return void next();
            let initSegment;
            try {
                initSegment = await req.converter.initSegment(req.params.track);
            } catch (error) {
                return console.error(error), res.statusCode = 500, res.setHeader("content-type", "application/json"), 
                void res.end(JSON.stringify({
                    error: {
                        code: ERROR_CODE.READ_INIT_SEGMENT_FAILED,
                        message: `Failed to read init segment: ${error.message}`
                    }
                }));
            }
            res.setHeader("content-type", "video/mp4"), res.setHeader("content-length", initSegment.length), 
            res.end(initSegment);
        })), router.get("/:id/:track/segment:sequenceNumber.:ext", (async (req, res, next) => {
            if (req.params.track.match(/^(?:video|audio).+$/) && "m4s" !== req.params.ext || req.params.track.match(/^subtitle.+$/) && "vtt" !== req.params.ext) return void next();
            const sequenceNumber = parseInt(req.params.sequenceNumber, 10);
            let mediaSegment;
            try {
                mediaSegment = await req.converter.mediaSegment(req.params.track, sequenceNumber);
            } catch (error) {
                return console.error(error), res.statusCode = 500, res.setHeader("content-type", "application/json"), 
                void res.end(JSON.stringify({
                    error: {
                        code: ERROR_CODE.READ_MEDIA_SEGMENT_FAILED,
                        message: `Failed to read media segment: ${error.message}`
                    }
                }));
            }
            res.setHeader("content-type", "m4s" === req.params.ext ? "video/mp4" : "text/vtt"), 
            res.setHeader("content-length", mediaSegment.length), res.end(mediaSegment);
        })), router.get("/:id/burn", (async (req, res) => {
            try {
                await req.converter.burnSubtitles({
                    url: req.query.url,
                    id: req.query.id
                });
            } catch (error) {
                console.error(error), res.statusCode = 500, res.setHeader("content-type", "application/json"), 
                res.end(JSON.stringify({
                    error: {
                        code: ERROR_CODE.BURN_SUBTITLES_FAILED,
                        message: `Failed to burn subtitles: ${error.message}`
                    }
                }));
            }
            res.end();
        })), router.get("/probe", (async (req, res) => {
            let result;
            try {
                const {format: format, streams: streams} = await probeMedia({
                    ffprobe: options.ffprobe,
                    mediaURL: req.query.mediaURL
                });
                let samples = {};
                req.query.samples && (format.name.includes("mp4") ? samples = await retrieveMediaSamples.mp4(req.query.mediaURL) : format.name.includes("matroska") && (samples = await retrieveMediaSamples.matroska(req.query.mediaURL))), 
                result = {
                    format: format,
                    streams: streams,
                    samples: samples
                };
            } catch (error) {
                return console.error(error), res.statusCode = 500, res.setHeader("content-type", "application/json"), 
                void res.end(JSON.stringify({
                    error: {
                        code: ERROR_CODE.PROBE_FAILED,
                        message: `Failed to probe media: ${error.message}`
                    }
                }));
            }
            res.setHeader("content-type", "application/json"), res.end(JSON.stringify(result));
        })), router.get("/status", (async (_, res) => {
            const result = {};
            try {
                for (const [id, {converter: converter, touched: touched}] of converters.entries()) result[id] = {
                    status: await converter.status(),
                    touched: touched
                };
            } catch (error) {
                return console.error(error), res.statusCode = 500, res.setHeader("content-type", "application/json"), 
                void res.end(JSON.stringify({
                    error: {
                        code: ERROR_CODE.GET_STATUS_FAILED,
                        message: `Failed to get status: ${error.message}`
                    }
                }));
            }
            res.setHeader("content-type", "application/json"), res.end(JSON.stringify(result));
        })), router.get("/exec", (async (req, res) => {
            const options = JSON.parse(req.query.options), process = new ffmpeg(options);
            await process.create(), process.stream.pipe(res), process.stream.resume();
        })), router.get("/:id/destroy", (async (req, res) => {
            console.log(`hls-converter ${req.params.id} has been requested to be destroyed`);
            const {converter: converter} = converters.get(req.params.id);
            converter.destroy(), console.log(`hls-converter ${req.params.id} destoyed`), res.end();
        })), router;
    };
}
