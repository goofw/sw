function(module, exports, __webpack_require__) {
    const {ffprobe: ffprobe} = __webpack_require__(186), JSONStream = __webpack_require__(807), probeCache = [];
    module.exports = function(options = {}) {
        const cached = probeCache.find((el => el.mediaURL === options.mediaURL));
        if (cached) return process.env.HLS_DEBUG && console.log("HLSV2:probe:info used cached result"), 
        Promise.resolve(cached.result);
        const timeout = "number" == typeof options.timeout ? options.timeout : 12e4;
        return new Promise((async (resolve, reject) => {
            let probeProcess, result = null;
            try {
                const FFprobeProc = new ffprobe(options);
                probeProcess = await FFprobeProc.create();
            } catch (error) {
                return void reject(error);
            }
            const timeoutId = setTimeout((() => {
                probeProcess.destroy();
            }), timeout);
            probeProcess.events.once("close", ((code, signal) => {
                clearTimeout(timeoutId), null === code ? reject(new Error(`Probe process has been terminated with signal: ${signal}`)) : code > 0 ? reject(new Error(`Probe process exited with code: ${code}`)) : null === result ? reject(new Error("Probe process failed")) : (probeCache.unshift({
                    mediaURL: options.mediaURL,
                    result: result
                }), probeCache.length > 3 && probeCache.pop(), resolve(result));
            })), probeProcess.stream.pipe(JSONStream.parse()).once("data", (({streams: streams = [], format: format = {}} = {}) => {
                const formatName = format.format_name, formatDuration = parseFloat(format.duration), formatBitRate = parseInt(format.bit_rate || 0, 10), formatMaxBitRate = parseInt(format.max_bit_rate || 0, 10);
                result = {
                    format: {
                        name: "string" == typeof formatName ? formatName : "unknown",
                        duration: !isNaN(formatDuration) && isFinite(formatDuration) ? formatDuration : null
                    },
                    streams: streams.map((stream => {
                        const id = streams.filter((({codec_type: codec_type}) => codec_type === stream.codec_type)).findIndex((({index: index}) => index === stream.index)), index = parseInt(stream.index, 10), track = stream.codec_type, codec = stream.codec_name, streamBitRate = parseInt(stream.bit_rate || 0, 10), streamMaxBitRate = parseInt(stream.max_bit_rate || 0, 10), bps = parseInt((stream.tags || []).BPS || 0, 10), numberOfBytes = parseInt((stream.tags || []).NUMBER_OF_BYTES || 0, 10), startTime = parseFloat(stream.start_time), startTimeTs = parseInt(stream.start_pts, 10), timescale = "string" == typeof stream.time_base ? parseInt(stream.time_base.slice(stream.time_base.indexOf("/") + 1), 10) : NaN, width = parseInt(stream.width, 10), height = parseInt(stream.height, 10), frameRate = "string" == typeof stream.r_frame_rate ? parseInt(stream.r_frame_rate.slice(0, stream.r_frame_rate.indexOf("/")), 10) / parseInt(stream.r_frame_rate.slice(stream.r_frame_rate.indexOf("/") + 1), 10) : NaN, numberOfFrames = parseInt(stream.nb_frames, 10), hasBFrames = "number" == typeof stream.has_b_frames && stream.has_b_frames > 0, isHdr = "bt2020nc" === stream.color_space && "smpte2084" === stream.color_transfer && "bt2020" === stream.color_primaries, isDoVi = "dvhe" === stream.codec_tag_string, sampleRate = parseInt(stream.sample_rate, 10), channels = parseInt(stream.channels, 10), channelLayout = stream.channel_layout, title = stream.tags ? stream.tags.title : null, language = stream.tags ? stream.tags.language : null;
                        return {
                            id: id,
                            index: !isNaN(index) && isFinite(index) ? index : -1,
                            track: "string" == typeof track ? track : "unknown",
                            codec: "string" == typeof codec ? codec : "unknown",
                            streamBitRate: streamBitRate,
                            streamMaxBitRate: streamMaxBitRate,
                            startTime: !isNaN(startTime) && isFinite(startTime) ? startTime : null,
                            startTimeTs: !isNaN(startTimeTs) && isFinite(startTimeTs) ? startTimeTs : null,
                            timescale: !isNaN(timescale) && isFinite(timescale) ? timescale : 1,
                            ..."video" === track ? {
                                width: !isNaN(width) && isFinite(width) ? width : null,
                                height: !isNaN(height) && isFinite(height) ? height : null,
                                frameRate: !isNaN(frameRate) && isFinite(frameRate) ? frameRate : null,
                                numberOfFrames: !isNaN(numberOfFrames) && isFinite(numberOfFrames) ? numberOfFrames : null,
                                isHdr: isHdr,
                                isDoVi: isDoVi,
                                hasBFrames: hasBFrames,
                                formatBitRate: formatBitRate,
                                formatMaxBitRate: formatMaxBitRate,
                                bps: bps,
                                numberOfBytes: numberOfBytes,
                                formatDuration: formatDuration
                            } : {},
                            ..."audio" === track ? {
                                sampleRate: !isNaN(sampleRate) && isFinite(sampleRate) ? sampleRate : null,
                                channels: !isNaN(channels) && isFinite(channels) ? channels : null,
                                channelLayout: "string" == typeof channelLayout ? channelLayout : "unknown",
                                title: "string" == typeof title ? title : null,
                                language: "string" == typeof language ? language : null
                            } : {},
                            ..."subtitle" === track ? {
                                title: "string" == typeof title ? title : null,
                                language: "string" == typeof language ? language : null
                            } : {}
                        };
                    }))
                };
            }));
        }));
    };
}
