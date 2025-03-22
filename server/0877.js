function(module, exports, __webpack_require__) {
    const {ffmpeg: ffmpeg} = __webpack_require__(186), bitrate = __webpack_require__(878), os = __webpack_require__(21), userSettings = __webpack_require__(94), applyProfile = __webpack_require__(377).applyProfile;
    module.exports = function(options = {}) {
        !options.profile && userSettings.transcodeHardwareAccel && userSettings.transcodeProfile && (options.profile = userSettings.transcodeProfile);
        const cpuCores = (os.cpus() || []).length, audioChannels = options.audio ? options.audio.override && "number" == typeof options.audio.override.channels ? options.audio.override.channels : options.audio.channels || 2 : 2, videoBitRate = !!(options.video || {}).transcode && bitrate.video(options.video, options.video.codec, "libx264", userSettings.transcodeMaxBitRate), audioBitRate = !!(options.audio || {}).transcode && bitrate.audio(options.audio, "aac", audioChannels), encodeThreads = cpuCores ? cpuCores * userSettings.transcodeHorsepower : 0;
        let accelConfig = {
            inputArgs: [],
            maxWidth: options.maxWidth || userSettings.transcodeMaxWidth,
            videoBitRate: videoBitRate,
            audioBitRate: audioBitRate,
            encoderH264: "libx264",
            levelH264: "51",
            encoderAAC: "aac",
            videoPreset: "ultrafast",
            pixelFormat: "yuv420p",
            videoTune: "zerolatency",
            resizeHeightAuto: "-2",
            scaleExtra: ":flags=lanczos",
            scalePrefix: "",
            wrapSwFilters: !1,
            scale: !1,
            noH264Level: !1,
            extraVideoOutputArgs: [],
            hwFilters: [],
            encodeThreads: isNaN(encodeThreads) ? 0 : encodeThreads,
            colorSpace: "bt709"
        };
        accelConfig = applyProfile(options.profile, accelConfig, options);
        const filters = () => (() => {
            const filters = [ options.video.override ? "string" == typeof options.video.override.embeddedSubtitlesId ? `subtitles='${options.mediaURL.replace(/\:/g, "\\:")}':stream_index=${options.video.override.embeddedSubtitlesId}` : "string" == typeof options.video.override.externalSubtitlesUrl ? `subtitles='${options.video.override.externalSubtitlesUrl.replace(/\:/g, "\\:")}'` : null : null, options.blank ? "tpad=stop=-1" : null ].concat(accelConfig.extraSwFilters || []).filter((v => null !== v));
            return accelConfig.scale || (options.video.width > accelConfig.maxWidth && filters.push(`${accelConfig.scalePrefix}scale=${accelConfig.maxWidth}:${accelConfig.resizeHeightAuto}${accelConfig.scaleExtra}`), 
            filters.push(`format=${accelConfig.pixelFormat}`)), filters.length && accelConfig.wrapSwFilters && (accelConfig.wrapSwFilters[0] && filters.unshift(accelConfig.wrapSwFilters[0]), 
            accelConfig.wrapSwFilters[1] && filters.push(accelConfig.wrapSwFilters[1])), filters;
        })().concat((() => {
            if (!(options.video || {}).transcode) return [];
            const filters = [ accelConfig.scale ? options.video.width > accelConfig.maxWidth ? `${accelConfig.scalePrefix}${accelConfig.scale}=${accelConfig.maxWidth}:${accelConfig.resizeHeightAuto}${accelConfig.scaleExtra}:format=${accelConfig.pixelFormat}` : accelConfig.pixelFormat ? `${accelConfig.scale || "scale"}=format=${accelConfig.pixelFormat}` : null : null ].concat(accelConfig.hwFilters || []);
            return filters.unshift(`setparams=color_primaries=${accelConfig.colorSpace}:color_trc=${accelConfig.colorSpace}:colorspace=${accelConfig.colorSpace}`), 
            filters.filter((v => null !== v));
        })());
        return options.args = [ ...(options.video || {}).transcode && accelConfig.inputArgs ? accelConfig.inputArgs : [], "-fflags", "+genpts", "-noaccurate_seek", "-seek_timestamp", "1", "-copyts", ...options.format && options.format.name.includes("matroska") ? [ "-seek2any", "1" ] : [], ..."number" == typeof options.time ? [ "-ss", options.time ] : [], "-i", options.mediaURL, "-threads", accelConfig.encodeThreads + "", ..."number" == typeof options.time && (options.audio || options.video && options.video.transcode) ? [ "-ss", options.time, "-output_ts_offset", options.time ] : [], "-max_muxing_queue_size", "2048", "-ignore_unknown", "-map_metadata", "-1", "-map_chapters", "-1", "-map", "-0:d?", "-map", "-0:t?", ...options.video ? [ "-map", `v:${options.video.id}`, ...options.video.transcode ? [ ...filters().length ? [ "-vf", filters().join(",") ] : [], "-c:v", accelConfig.encoderH264, "-preset:v", accelConfig.videoPreset, "-profile:v", "high", "-tune:v", accelConfig.videoTune, ...accelConfig.noH264Level ? [] : [ "-level", accelConfig.levelH264 ], ...options.video.override && "number" == typeof options.video.override.frameRate ? [ "-vsync", "cfr", "-r:v", options.video.override.frameRate, ..."number" == typeof options.segmentDuration ? [ "-sc_threshold", "0", "-g", options.video.override.frameRate * options.segmentDuration, "-keyint_min", options.video.override.frameRate * options.segmentDuration ] : [] ] : [], ...accelConfig.extraVideoOutputArgs ? accelConfig.extraVideoOutputArgs.map((v => "{bitrate}" === v ? accelConfig.videoBitRate + "" : "{bufsize}" === v ? 2 * accelConfig.videoBitRate + "" : v)) : [] ] : [ "-c:v", "copy", "-force_key_frames:v", "source" ] ] : [ "-map", "-0:v?" ], ...options.audio ? [ "-map", `a:${options.audio.id}`, ...options.audio.transcode ? [ "-c:a", accelConfig.encoderAAC, "-filter:a", "apad", "-async", 1, ...options.audio.override && "number" == typeof options.audio.override.channels ? [ "-ac:a", options.audio.override.channels, "-ab", `${accelConfig.audioBitRate}` ] : [], ...options.audio.override && "number" == typeof options.audio.override.sampleRate ? [ "-ar:a", options.audio.override.sampleRate ] : [] ] : [ "-c:a", "copy", ..."aac" === options.audio.codec ? [ "-bsf:a", "aac_adtstoasc" ] : [] ] ] : [ "-map", "-0:a?" ], ...options.subtitle ? [ "-map", `s:${options.subtitle.id}` ] : [ "-map", "-0:s?" ], ..."number" == typeof options.segmentDuration && (options.audio || options.video && options.video.transcode) ? [ "-frag_duration", Math.floor(1e3 * options.segmentDuration * 1e3) ] : [], ..."number" == typeof options.sequenceNumber && (options.video || options.audio) ? [ "-fragment_index", options.sequenceNumber ] : [], ...options.video ? [ "-movflags", "frag_keyframe+empty_moov+default_base_moof+delay_moov+dash" ] : options.audio ? [ "-movflags", "empty_moov+default_base_moof+delay_moov+dash" ] : [], ...options.video || options.audio ? [ "-use_editlist", "1", "-f", "mp4" ] : options.subtitle ? [ "-f", "webvtt" ] : [] ], 
        new ffmpeg(options);
    };
}
