function(module, exports, __webpack_require__) {
    const fs = __webpack_require__(2), path = __webpack_require__(4), muxjs = __webpack_require__(412), {Mutex: Mutex} = __webpack_require__(402), readChunk = __webpack_require__(216), segmenter = __webpack_require__(862), mp4 = __webpack_require__(864), vtt = __webpack_require__(868), m3u8 = __webpack_require__(431), spawnConvertProcess = __webpack_require__(877), TRANSMUXED_VIDEO_CODECS = [ "h264" ], TRANSMUXED_AUDIO_CODECS = [ "aac", "mp3" ], TRANSCODING_AAC_SAMPLE_RATES = [ 7350, 8e3, 11025, 12e3, 16e3, 22050, 24e3, 32e3, 44100, 48e3, 64e3, 88200, 96e3 ];
    class ConverterDestroyedError extends Error {
        constructor() {
            super("MediaConverter is destroyed"), this.name = "ConverterDestroyedError";
        }
    }
    class SegmentCanceledError extends Error {
        constructor() {
            super("Segment is canceled"), this.name = "SegmentCanceledError";
        }
    }
    module.exports = function({ffmpeg: ffmpeg, mediaURL: mediaURL, maxAudioChannels: maxAudioChannels, videoCodecs: videoCodecs, audioCodecs: audioCodecs, forceTranscoding: forceTranscoding, profile: profile, maxWidth: maxWidth, stream: stream, format: format, samples: samples, sampleDuration: sampleDuration, query: query}) {
        let destroyed = !1;
        const initMutex = new Mutex(new ConverterDestroyedError);
        let initError = null, initSegmentBuffer = null, mediaSegments = null, timescale = null;
        const convertMutex = new Mutex(new SegmentCanceledError);
        let convertOptions = null, convertProcess = null, sequenceNumber = null;
        const debugOutput = process.env.HLS_DEBUG && "android" !== process.platform ? fs.createWriteStream(path.join(path.dirname(__webpack_require__.c[__webpack_require__.s].filename), `media_${stream.track}${stream.id}_${encodeURIComponent(new URL(mediaURL).pathname)}.log`)) : null;
        function debug(message) {
            process.env.HLS_DEBUG && ("android" === process.platform ? console.log(`HLSV2:convert:${stream.track}${stream.id}:debug`, message) : debugOutput.write(`${(new Date).toLocaleTimeString()} ${message}\n`));
        }
        async function init(subtitles) {
            if (initMutex.isLocked() && (debug("init:pending"), await initMutex.acquire().then((release => release()))), 
            null !== initError) throw initError;
            if (null !== mediaSegments) return;
            const release = await initMutex.acquire();
            debug(`init:started:${JSON.stringify({
                ffmpeg: ffmpeg,
                mediaURL: mediaURL,
                maxAudioChannels: maxAudioChannels,
                videoCodecs: videoCodecs,
                audioCodecs: audioCodecs,
                forceTranscoding: forceTranscoding,
                stream: stream,
                format: format,
                samples: samples,
                sampleDuration: sampleDuration,
                query: query,
                subtitles: subtitles
            }, null, 4)}`);
            try {
                if ("video" === stream.track || "audio" === stream.track) {
                    const transmuxedCodecs = "video" === stream.track ? Array.isArray(videoCodecs) ? videoCodecs : TRANSMUXED_VIDEO_CODECS : Array.isArray(audioCodecs) ? audioCodecs : TRANSMUXED_AUDIO_CODECS, requiresTranscoding = forceTranscoding || !samples.some((({key: key}) => key)) && ("number" != typeof sampleDuration || "video" === stream.track) || ("video" === stream.track ? !transmuxedCodecs.includes(stream.codec) || !!subtitles : !transmuxedCodecs.includes(stream.codec) || "number" == typeof maxAudioChannels && stream.channels > maxAudioChannels), track = stream.track;
                    if (requiresTranscoding) {
                        const audioSampleRate = "audio" === track ? TRANSCODING_AAC_SAMPLE_RATES.includes(stream.sampleRate) ? stream.sampleRate : "number" == typeof stream.sampleRate ? TRANSCODING_AAC_SAMPLE_RATES.reduce(((result, sampleRate) => stream.sampleRate <= TRANSCODING_AAC_SAMPLE_RATES[0] ? TRANSCODING_AAC_SAMPLE_RATES[0] : stream.sampleRate >= TRANSCODING_AAC_SAMPLE_RATES[TRANSCODING_AAC_SAMPLE_RATES.length - 1] ? TRANSCODING_AAC_SAMPLE_RATES[TRANSCODING_AAC_SAMPLE_RATES.length - 1] : Math.abs(sampleRate - stream.sampleRate) < Math.abs(result - stream.sampleRate) ? sampleRate : result), TRANSCODING_AAC_SAMPLE_RATES[0]) : 48e3 : null;
                        convertOptions = {
                            ffmpeg: ffmpeg,
                            mediaURL: mediaURL,
                            segmentDuration: "video" === track ? 4 : 196608 / audioSampleRate,
                            format: format,
                            [track]: {
                                ...stream,
                                transcode: !0,
                                override: {
                                    frameRate: "video" === track ? 24 : null,
                                    embeddedSubtitlesId: "video" === track && subtitles && "string" == typeof subtitles.id ? subtitles.id : null,
                                    externalSubtitlesUrl: "video" === track && subtitles && "string" == typeof subtitles.url ? subtitles.url : null,
                                    channels: "audio" === track && "number" == typeof maxAudioChannels && stream.channels > maxAudioChannels ? maxAudioChannels : stream.channels,
                                    sampleRate: "audio" === track ? audioSampleRate : null
                                }
                            },
                            track: `${stream.track}${stream.id}`,
                            profile: profile,
                            maxWidth: maxWidth
                        };
                    } else convertOptions = {
                        ffmpeg: ffmpeg,
                        mediaURL: mediaURL,
                        segmentDuration: "video" === track ? 6 : 4.096,
                        format: format,
                        [track]: stream,
                        track: `${stream.track}${stream.id}`,
                        profile: profile,
                        maxWidth: maxWidth
                    };
                    if (convertProcess = spawnConvertProcess(convertOptions), await convertProcess.create(), 
                    initSegmentBuffer = await mp4.init(convertProcess.stream), !initMutex.isLocked()) throw new ConverterDestroyedError;
                    if (timescale = muxjs.mp4.probe.timescale(initSegmentBuffer)[1], "audio" === track && convertOptions.audio.transcode && convertOptions.audio.override.sampleRate !== timescale) throw new Error("Output audio timescale does not match the sample rate");
                    mediaSegments = requiresTranscoding ? segmenter.predict({
                        stream: stream,
                        format: format,
                        timescale: timescale,
                        segmentDuration: convertOptions.segmentDuration
                    }) : segmenter.retrieve({
                        stream: stream,
                        format: format,
                        timescale: timescale,
                        segmentDuration: convertOptions.segmentDuration,
                        samples: samples,
                        sampleDuration: sampleDuration
                    }), release();
                } else convertOptions = {
                    ffmpeg: ffmpeg,
                    mediaURL: mediaURL,
                    format: format,
                    [stream.track]: stream,
                    track: `${stream.track}${stream.id}`
                }, convertProcess = spawnConvertProcess(convertOptions), await convertProcess.create(), 
                timescale = stream.timescale, mediaSegments = segmenter.predict({
                    stream: stream,
                    format: format,
                    timescale: timescale,
                    segmentDuration: 10
                }), release();
            } catch (error) {
                throw debug(`init:error:${error}`), error instanceof ConverterDestroyedError || (initError = error), 
                initSegmentBuffer = null, mediaSegments = null, timescale = null, convertMutex.cancel(), 
                convertOptions = null, stop(), release(), error;
            }
            debug(`init:ended:${JSON.stringify(convertOptions, null, 4)}`);
        }
        function stop() {
            debug("stop"), sequenceNumber = null, null !== convertProcess && (convertProcess.destroy(), 
            convertProcess = null);
        }
        function clear() {
            debug("clear");
            for (const [_, mediaSegment] of mediaSegments) {
                mediaSegment.buffer = null, mediaSegment.cues = [];
                for (const extraSegment of mediaSegment.extraSegments) extraSegment.buffer = null;
            }
        }
        async function seek(targetSequenceNumber, blank) {
            debug(`seek:started:${targetSequenceNumber}`);
            const seekSequenceNumber = mediaSegments.has(targetSequenceNumber - 1) ? targetSequenceNumber - 1 : targetSequenceNumber, seekMediaSegment = mediaSegments.get(seekSequenceNumber), seekConvertProcess = spawnConvertProcess({
                ...convertOptions,
                blank: blank,
                sequenceNumber: seekMediaSegment.sequenceNumber,
                time: seekMediaSegment.seekTime / timescale
            });
            if (sequenceNumber = targetSequenceNumber, convertProcess = seekConvertProcess, 
            await seekConvertProcess.create(), seekConvertProcess !== convertProcess) throw new SegmentCanceledError;
            if (("video" === stream.track || "audio" === stream.track) && (await mp4.init(seekConvertProcess.stream), 
            seekConvertProcess !== convertProcess)) throw new SegmentCanceledError;
            if (seekSequenceNumber !== targetSequenceNumber) {
                try {
                    await readOutputSegment(seekSequenceNumber);
                } catch (error) {}
                if (seekConvertProcess !== convertProcess) throw new SegmentCanceledError;
                "video" !== stream.track && "audio" !== stream.track || clear();
            }
            debug(`seek:ended:${targetSequenceNumber}`);
        }
        async function readOutputSegment(targetSequenceNumber) {
            return "video" === stream.track ? (async function(targetSequenceNumber) {
                debug(`read:started:${targetSequenceNumber}`);
                const targetConvertProcess = convertProcess, targetMediaSegment = mediaSegments.get(targetSequenceNumber);
                for (let i = 0; i < targetMediaSegment.extraSegments.length + 1; i++) {
                    const chunks = [], targetDuration = 0 === i ? targetMediaSegment.duration : targetMediaSegment.extraSegments[i - 1].duration;
                    for (let duration = 0; duration < targetDuration; ) {
                        let mediaSegmentBuffer;
                        try {
                            mediaSegmentBuffer = await mp4.media(targetConvertProcess.stream);
                        } catch (error) {
                            if (targetConvertProcess !== convertProcess) throw new SegmentCanceledError;
                            throw error;
                        }
                        if (targetConvertProcess !== convertProcess) throw new SegmentCanceledError;
                        const boxes = muxjs.mp4.tools.inspect(mediaSegmentBuffer), sidx = boxes.find((({type: type}) => "sidx" === type));
                        mp4.updateBaseMediaDecodeTime({
                            buffer: mediaSegmentBuffer,
                            baseMediaDecodeTime: sidx.earliestPresentationTime,
                            trackId: 1,
                            boxes: boxes
                        }), duration += sidx.references.reduce(((duration, {subsegmentDuration: subsegmentDuration}) => duration + subsegmentDuration), 0), 
                        chunks.push(mediaSegmentBuffer);
                    }
                    0 === i ? targetMediaSegment.buffer = Buffer.concat(chunks) : targetMediaSegment.extraSegments[i - 1].buffer = Buffer.concat(chunks);
                }
                debug(`read:ended:${targetSequenceNumber}`);
            })(targetSequenceNumber) : "audio" === stream.track ? (async function(targetSequenceNumber) {
                debug(`read:started:${targetSequenceNumber}`);
                const targetConvertProcess = convertProcess, targetMediaSegment = mediaSegments.get(targetSequenceNumber);
                let mediaSegmentBuffer;
                try {
                    mediaSegmentBuffer = await mp4.media(targetConvertProcess.stream);
                } catch (error) {
                    if (targetConvertProcess !== convertProcess) throw new SegmentCanceledError;
                    throw error;
                }
                if (targetConvertProcess !== convertProcess) throw new SegmentCanceledError;
                const boxes = muxjs.mp4.tools.inspect(mediaSegmentBuffer), sidx = boxes.find((({type: type}) => "sidx" === type));
                mp4.updateBaseMediaDecodeTime({
                    buffer: mediaSegmentBuffer,
                    baseMediaDecodeTime: sidx.earliestPresentationTime,
                    trackId: 1,
                    boxes: boxes
                }), targetMediaSegment.buffer = mediaSegmentBuffer, debug(`read:ended:${targetSequenceNumber}`);
            })(targetSequenceNumber) : (async function(targetSequenceNumber) {
                debug(`read:started:${targetSequenceNumber}`);
                const targetConvertProcess = convertProcess, targetMediaSegment = mediaSegments.get(targetSequenceNumber);
                for (;null === targetMediaSegment.buffer; ) {
                    let text = "";
                    try {
                        const size = targetSequenceNumber === mediaSegments.size ? 1 / 0 : null;
                        text = (await readChunk(targetConvertProcess.stream, size)).toString();
                    } catch (error) {
                        if (null === targetConvertProcess.exitCode && null === targetConvertProcess.signalCode && await new Promise((resolve => {
                            targetConvertProcess.events.on("exit", resolve);
                        })), targetConvertProcess !== convertProcess) throw new SegmentCanceledError;
                        if (0 !== targetConvertProcess.exitCode) throw error;
                    }
                    if (targetConvertProcess !== convertProcess) throw new SegmentCanceledError;
                    const cues = vtt.parse(text);
                    for (const cue of cues) {
                        const startSequenceNumber = Math.floor(cue.startTime / 10) + 1, endSequenceNumber = Math.floor(cue.endTime / 10) + 1;
                        for (let sequenceNumber = startSequenceNumber; sequenceNumber <= endSequenceNumber; sequenceNumber++) mediaSegments.get(sequenceNumber).cues.push(cue);
                    }
                    const lastSequenceNumber = 0 === targetConvertProcess.exitCode || targetSequenceNumber === mediaSegments.size ? mediaSegments.size : Array.from(mediaSegments.entries()).reduceRight(((lastSequenceNumber, [sequenceNumber, {cues: cues}]) => null === lastSequenceNumber && cues.length > 0 ? sequenceNumber - 1 : lastSequenceNumber), null);
                    if (null !== lastSequenceNumber) for (let sequenceNumber = targetSequenceNumber; sequenceNumber <= lastSequenceNumber; sequenceNumber++) {
                        const mediaSegment = mediaSegments.get(sequenceNumber);
                        null === mediaSegment.buffer && (mediaSegment.buffer = Buffer.from(vtt.format(mediaSegment.cues)));
                    }
                }
                debug(`read:ended:${targetSequenceNumber}`);
            })(targetSequenceNumber);
        }
        this.playlist = async () => {
            if (destroyed) throw new ConverterDestroyedError;
            return await init(), m3u8.media({
                mediaSegments: mediaSegments,
                timescale: timescale,
                track: `${stream.track}${stream.id}`,
                query: query
            });
        }, this.initSegment = async () => {
            if (destroyed) throw new ConverterDestroyedError;
            if ("video" !== stream.track && "audio" !== stream.track) throw new Error("init segment is available only for A/V streams");
            return await init(), initSegmentBuffer;
        }, this.mediaSegment = async targetSequenceNumber => {
            if (destroyed) throw new ConverterDestroyedError;
            if (await init(), !mediaSegments.has(targetSequenceNumber)) throw new Error("Sequence number out of range");
            const targetMediaSegment = mediaSegments.get(targetSequenceNumber);
            if (null === targetMediaSegment.buffer || targetMediaSegment.extraSegments.some((({buffer: buffer}) => null === buffer))) {
                targetSequenceNumber !== sequenceNumber && (convertMutex.cancel(), stop());
                const release = await convertMutex.acquire();
                if (null !== targetMediaSegment.buffer) return release(), debug(`mediaSegment:buffered:${targetSequenceNumber}`), 
                Buffer.concat([ targetMediaSegment.buffer ].concat("video" === stream.track ? targetMediaSegment.extraSegments.map((({buffer: buffer}) => buffer)) : []));
                "video" !== stream.track && "audio" !== stream.track && targetSequenceNumber === sequenceNumber || clear();
                try {
                    targetSequenceNumber !== sequenceNumber && await seek(targetSequenceNumber);
                    try {
                        await readOutputSegment(targetSequenceNumber);
                    } catch (error) {
                        if (error instanceof SegmentCanceledError) throw error;
                        if ("video" !== stream.track && "audio" !== stream.track) throw error;
                        const targetConvertProcess = convertProcess;
                        if (null === targetConvertProcess.exitCode && null === targetConvertProcess.signalCode && await new Promise((resolve => {
                            targetConvertProcess.events.on("exit", resolve);
                        })), targetConvertProcess !== convertProcess) throw new SegmentCanceledError;
                        if (0 !== targetConvertProcess.exitCode) throw error;
                        clear(), await seek(targetSequenceNumber, !0), await readOutputSegment(targetSequenceNumber);
                    }
                } catch (error) {
                    throw debug(`mediaSegment:error:${targetSequenceNumber}:${error}`), error instanceof SegmentCanceledError || stop(), 
                    release(), error;
                }
                sequenceNumber = Array.from(mediaSegments.entries()).reduceRight(((result, [sequenceNumber, {buffer: buffer}]) => null === result && null !== buffer ? sequenceNumber + 1 : result), null), 
                mediaSegments.has(sequenceNumber) || stop(), release();
            }
            return debug(`mediaSegment:read:${targetSequenceNumber}`), Buffer.concat([ targetMediaSegment.buffer ].concat("video" === stream.track ? targetMediaSegment.extraSegments.map((({buffer: buffer}) => buffer)) : []));
        }, this.burnSubtitles = async ({url: url, id: id}) => {
            if (destroyed) throw new ConverterDestroyedError;
            if (initMutex.isLocked() && await initMutex.acquire().then((release => release())), 
            "video" !== stream.track || null !== convertOptions && !convertOptions.video.transcode) throw new Error("Burning subtitles only allowed for the transcoded video track");
            initError = null, initSegmentBuffer = null, mediaSegments = null, timescale = null, 
            convertMutex.cancel(), convertOptions = null, stop(), await init({
                url: url,
                id: id
            });
        }, this.status = async () => {
            if (destroyed) throw new ConverterDestroyedError;
            try {
                await init();
            } catch (e) {}
            return {
                convertOptions: convertOptions,
                sequenceNumber: sequenceNumber,
                initError: initError,
                init: null !== initSegmentBuffer
            };
        }, this.destroy = () => {
            debug("destroy"), destroyed = !0, initMutex.cancel(), initError = null, initSegmentBuffer = null, 
            mediaSegments = null, timescale = null, convertMutex.cancel(), convertOptions = null, 
            stop();
        };
    };
}
