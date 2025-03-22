function(module, exports, __webpack_require__) {
    const utils = __webpack_require__(95), FORMATS = __webpack_require__(882), audioEncodingRanks = [ "mp4a", "mp3", "vorbis", "aac", "opus", "flac" ], videoEncodingRanks = [ "mp4v", "avc1", "Sorenson H.283", "MPEG-4 Visual", "VP8", "VP9", "H.264" ], getVideoBitrate = format => format.bitrate || 0, getVideoEncodingRank = format => videoEncodingRanks.findIndex((enc => format.codecs && format.codecs.includes(enc))), getAudioBitrate = format => format.audioBitrate || 0, getAudioEncodingRank = format => audioEncodingRanks.findIndex((enc => format.codecs && format.codecs.includes(enc))), sortFormatsBy = (a, b, sortBy) => {
        let res = 0;
        for (let fn of sortBy) if (res = fn(b) - fn(a), 0 !== res) break;
        return res;
    }, sortFormatsByVideo = (a, b) => sortFormatsBy(a, b, [ format => parseInt(format.qualityLabel), getVideoBitrate, getVideoEncodingRank ]), sortFormatsByAudio = (a, b) => sortFormatsBy(a, b, [ getAudioBitrate, getAudioEncodingRank ]);
    exports.sortFormats = (a, b) => sortFormatsBy(a, b, [ format => +!!format.isHLS, format => +!!format.isDashMPD, format => +(format.contentLength > 0), format => +(format.hasVideo && format.hasAudio), format => +format.hasVideo, format => parseInt(format.qualityLabel) || 0, getVideoBitrate, getAudioBitrate, getVideoEncodingRank, getAudioEncodingRank ]), 
    exports.chooseFormat = (formats, options) => {
        if ("object" == typeof options.format) {
            if (!options.format.url) throw Error("Invalid format given, did you use `ytdl.getInfo()`?");
            return options.format;
        }
        let format;
        options.filter && (formats = exports.filterFormats(formats, options.filter)), formats.some((fmt => fmt.isHLS)) && (formats = formats.filter((fmt => fmt.isHLS || !fmt.isLive)));
        const quality = options.quality || "highest";
        switch (quality) {
          case "highest":
            format = formats[0];
            break;

          case "lowest":
            format = formats[formats.length - 1];
            break;

          case "highestaudio":
            {
                (formats = exports.filterFormats(formats, "audio")).sort(sortFormatsByAudio);
                const bestAudioFormat = formats[0], worstVideoQuality = (formats = formats.filter((f => 0 === sortFormatsByAudio(bestAudioFormat, f)))).map((f => parseInt(f.qualityLabel) || 0)).sort(((a, b) => a - b))[0];
                format = formats.find((f => (parseInt(f.qualityLabel) || 0) === worstVideoQuality));
                break;
            }

          case "lowestaudio":
            (formats = exports.filterFormats(formats, "audio")).sort(sortFormatsByAudio), format = formats[formats.length - 1];
            break;

          case "highestvideo":
            {
                (formats = exports.filterFormats(formats, "video")).sort(sortFormatsByVideo);
                const bestVideoFormat = formats[0], worstAudioQuality = (formats = formats.filter((f => 0 === sortFormatsByVideo(bestVideoFormat, f)))).map((f => f.audioBitrate || 0)).sort(((a, b) => a - b))[0];
                format = formats.find((f => (f.audioBitrate || 0) === worstAudioQuality));
                break;
            }

          case "lowestvideo":
            (formats = exports.filterFormats(formats, "video")).sort(sortFormatsByVideo), format = formats[formats.length - 1];
            break;

          default:
            format = getFormatByQuality(quality, formats);
        }
        if (!format) throw Error(`No such format found: ${quality}`);
        return format;
    };
    const getFormatByQuality = (quality, formats) => {
        let getFormat = itag => formats.find((format => `${format.itag}` == `${itag}`));
        return Array.isArray(quality) ? getFormat(quality.find((q => getFormat(q)))) : getFormat(quality);
    };
    exports.filterFormats = (formats, filter) => {
        let fn;
        switch (filter) {
          case "videoandaudio":
          case "audioandvideo":
            fn = format => format.hasVideo && format.hasAudio;
            break;

          case "video":
            fn = format => format.hasVideo;
            break;

          case "videoonly":
            fn = format => format.hasVideo && !format.hasAudio;
            break;

          case "audio":
            fn = format => format.hasAudio;
            break;

          case "audioonly":
            fn = format => !format.hasVideo && format.hasAudio;
            break;

          default:
            if ("function" != typeof filter) throw TypeError(`Given filter (${filter}) is not supported`);
            fn = filter;
        }
        return formats.filter((format => !!format.url && fn(format)));
    }, exports.addFormatMeta = format => ((format = Object.assign({}, FORMATS[format.itag], format)).hasVideo = !!format.qualityLabel, 
    format.hasAudio = !!format.audioBitrate, format.container = format.mimeType ? format.mimeType.split(";")[0].split("/")[1] : null, 
    format.codecs = format.mimeType ? utils.between(format.mimeType, 'codecs="', '"') : null, 
    format.videoCodec = format.hasVideo && format.codecs ? format.codecs.split(", ")[0] : null, 
    format.audioCodec = format.hasAudio && format.codecs ? format.codecs.split(", ").slice(-1)[0] : null, 
    format.isLive = /\bsource[/=]yt_live_broadcast\b/.test(format.url), format.isHLS = /\/manifest\/hls_(variant|playlist)\//.test(format.url), 
    format.isDashMPD = /\/manifest\/dash\//.test(format.url), format);
}
