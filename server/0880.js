function(module, exports, __webpack_require__) {
    const PassThrough = __webpack_require__(3).PassThrough, getInfo = __webpack_require__(881), utils = __webpack_require__(95), formatUtils = __webpack_require__(435), urlUtils = __webpack_require__(436), sig = __webpack_require__(438), miniget = __webpack_require__(146), m3u8stream = __webpack_require__(217), {parseTimestamp: parseTimestamp} = __webpack_require__(217), ytdl = (link, options) => {
        const stream = createStream(options);
        return ytdl.getInfo(link, options).then((info => {
            downloadFromInfoCallback(stream, info, options);
        }), stream.emit.bind(stream, "error")), stream;
    };
    module.exports = ytdl, ytdl.getBasicInfo = getInfo.getBasicInfo, ytdl.getInfo = getInfo.getInfo, 
    ytdl.chooseFormat = formatUtils.chooseFormat, ytdl.filterFormats = formatUtils.filterFormats, 
    ytdl.validateID = urlUtils.validateID, ytdl.validateURL = urlUtils.validateURL, 
    ytdl.getURLVideoID = urlUtils.getURLVideoID, ytdl.getVideoID = urlUtils.getVideoID, 
    ytdl.cache = {
        sig: sig.cache,
        info: getInfo.cache,
        watch: getInfo.watchPageCache,
        cookie: getInfo.cookieCache
    }, ytdl.version = __webpack_require__(434).version;
    const createStream = options => {
        const stream = new PassThrough({
            highWaterMark: options && options.highWaterMark || 524288
        });
        return stream._destroy = () => {
            stream.destroyed = !0;
        }, stream;
    }, pipeAndSetEvents = (req, stream, end) => {
        [ "abort", "request", "response", "error", "redirect", "retry", "reconnect" ].forEach((event => {
            req.prependListener(event, stream.emit.bind(stream, event));
        })), req.pipe(stream, {
            end: end
        });
    }, downloadFromInfoCallback = (stream, info, options) => {
        options = options || {};
        let format, err = utils.playError(info.player_response, [ "UNPLAYABLE", "LIVE_STREAM_OFFLINE", "LOGIN_REQUIRED" ]);
        if (err) return void stream.emit("error", err);
        if (!info.formats.length) return void stream.emit("error", Error("This video is unavailable"));
        try {
            format = formatUtils.chooseFormat(info.formats, options);
        } catch (e) {
            return void stream.emit("error", e);
        }
        if (stream.emit("info", info, format), stream.destroyed) return;
        let contentLength, downloaded = 0;
        const ondata = chunk => {
            downloaded += chunk.length, stream.emit("progress", chunk.length, downloaded, contentLength);
        }, dlChunkSize = options.dlChunkSize || 10485760;
        let req, shouldEnd = !0;
        if (format.isHLS || format.isDashMPD) req = m3u8stream(format.url, {
            chunkReadahead: +info.live_chunk_readahead,
            begin: options.begin || format.isLive && Date.now(),
            liveBuffer: options.liveBuffer,
            requestOptions: options.requestOptions,
            parser: format.isDashMPD ? "dash-mpd" : "m3u8",
            id: format.itag
        }), req.on("progress", ((segment, totalSegments) => {
            stream.emit("progress", segment.size, segment.num, totalSegments);
        })), pipeAndSetEvents(req, stream, shouldEnd); else {
            const requestOptions = Object.assign({}, options.requestOptions, {
                maxReconnects: 6,
                maxRetries: 3,
                backoff: {
                    inc: 500,
                    max: 1e4
                }
            });
            if (0 === dlChunkSize || format.hasAudio && format.hasVideo) options.begin && (format.url += `&begin=${parseTimestamp(options.begin)}`), 
            options.range && (options.range.start || options.range.end) && (requestOptions.headers = Object.assign({}, requestOptions.headers, {
                Range: `bytes=${options.range.start || "0"}-${options.range.end || ""}`
            })), req = miniget(format.url, requestOptions), req.on("response", (res => {
                stream.destroyed || (contentLength = contentLength || parseInt(res.headers["content-length"]));
            })), req.on("data", ondata), pipeAndSetEvents(req, stream, shouldEnd); else {
                let start = options.range && options.range.start || 0, end = start + dlChunkSize;
                const rangeEnd = options.range && options.range.end;
                contentLength = options.range ? (rangeEnd ? rangeEnd + 1 : parseInt(format.contentLength)) - start : parseInt(format.contentLength);
                const getNextChunk = () => {
                    !rangeEnd && end >= contentLength && (end = 0), rangeEnd && end > rangeEnd && (end = rangeEnd), 
                    shouldEnd = !end || end === rangeEnd, requestOptions.headers = Object.assign({}, requestOptions.headers, {
                        Range: `bytes=${start}-${end || ""}`
                    }), req = miniget(format.url, requestOptions), req.on("data", ondata), req.on("end", (() => {
                        stream.destroyed || end && end !== rangeEnd && (start = end + 1, end += dlChunkSize, 
                        getNextChunk());
                    })), pipeAndSetEvents(req, stream, shouldEnd);
                };
                getNextChunk();
            }
        }
        stream._destroy = () => {
            stream.destroyed = !0, req.destroy(), req.end();
        };
    };
    ytdl.downloadFromInfo = (info, options) => {
        const stream = createStream(options);
        if (!info.full) throw Error("Cannot use `ytdl.downloadFromInfo()` when called with info from `ytdl.getBasicInfo()`");
        return setImmediate((() => {
            downloadFromInfoCallback(stream, info, options);
        })), stream;
    };
}
