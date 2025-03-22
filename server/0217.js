function(module, exports, __webpack_require__) {
    "use strict";
    var __importDefault = this && this.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : {
            default: mod
        };
    };
    const stream_1 = __webpack_require__(3), url_1 = __webpack_require__(7), miniget_1 = __importDefault(__webpack_require__(146)), m3u8_parser_1 = __importDefault(__webpack_require__(884)), dash_mpd_parser_1 = __importDefault(__webpack_require__(885)), queue_1 = __importDefault(__webpack_require__(886)), parse_time_1 = __webpack_require__(437), supportedParsers = {
        m3u8: m3u8_parser_1.default,
        "dash-mpd": dash_mpd_parser_1.default
    };
    let m3u8stream = (playlistURL, options = {}) => {
        const stream = new stream_1.PassThrough, chunkReadahead = options.chunkReadahead || 3, liveBuffer = options.liveBuffer || 2e4, requestOptions = options.requestOptions, Parser = supportedParsers[options.parser || (/\.mpd$/.test(playlistURL) ? "dash-mpd" : "m3u8")];
        if (!Parser) throw TypeError(`parser '${options.parser}' not supported`);
        let begin = 0;
        void 0 !== options.begin && (begin = "string" == typeof options.begin ? parse_time_1.humanStr(options.begin) : Math.max(options.begin - liveBuffer, 0));
        const forwardEvents = req => {
            for (let event of [ "abort", "request", "response", "redirect", "retry", "reconnect" ]) req.on(event, stream.emit.bind(stream, event));
        };
        let currSegment;
        const streamQueue = new queue_1.default(((req, callback) => {
            currSegment = req;
            let size = 0;
            req.on("data", (chunk => size += chunk.length)), req.pipe(stream, {
                end: !1
            }), req.on("end", (() => callback(void 0, size)));
        }), {
            concurrency: 1
        });
        let segmentNumber = 0, downloaded = 0;
        const requestQueue = new queue_1.default(((segment, callback) => {
            let options = Object.assign({}, requestOptions);
            segment.range && (options.headers = Object.assign({}, options.headers, {
                Range: `bytes=${segment.range.start}-${segment.range.end}`
            }));
            let req = miniget_1.default(url_1.resolve(playlistURL, segment.url), options);
            req.on("error", callback), forwardEvents(req), streamQueue.push(req, ((err, size) => {
                downloaded += +size, stream.emit("progress", {
                    num: ++segmentNumber,
                    size: size,
                    duration: segment.duration,
                    url: segment.url
                }, requestQueue.total, downloaded), callback();
            }));
        }), {
            concurrency: chunkReadahead
        }), onError = err => {
            ended || (stream.emit("error", err), stream.end());
        };
        let refreshThreshold, minRefreshTime, refreshTimeout, lastRefresh, fetchingPlaylist = !0, ended = !1, isStatic = !1;
        const onQueuedEnd = err => {
            if (currSegment = null, err) onError(err); else if (!fetchingPlaylist && !ended && !isStatic && requestQueue.tasks.length + requestQueue.active <= refreshThreshold) {
                let ms = Math.max(0, minRefreshTime - (Date.now() - lastRefresh));
                fetchingPlaylist = !0, refreshTimeout = setTimeout(refreshPlaylist, ms);
            } else !ended && !isStatic || requestQueue.tasks.length || requestQueue.active || stream.end();
        };
        let currPlaylist, lastSeq, starttime = 0;
        const refreshPlaylist = () => {
            lastRefresh = Date.now(), currPlaylist = miniget_1.default(playlistURL, requestOptions), 
            currPlaylist.on("error", onError), forwardEvents(currPlaylist);
            const parser = currPlaylist.pipe(new Parser(options.id));
            parser.on("starttime", (a => {
                starttime || (starttime = a, "string" == typeof options.begin && begin >= 0 && (begin += starttime));
            })), parser.on("endlist", (() => {
                isStatic = !0;
            })), parser.on("endearly", currPlaylist.unpipe.bind(currPlaylist, parser));
            let addedItems = [];
            const addItem = item => {
                if (!item.init) {
                    if (item.seq <= lastSeq) return;
                    lastSeq = item.seq;
                }
                begin = item.time, requestQueue.push(item, onQueuedEnd), addedItems.push(item);
            };
            let tailedItems = [], tailedItemsDuration = 0;
            parser.on("item", (item => {
                let timedItem = Object.assign({
                    time: starttime
                }, item);
                if (begin <= timedItem.time) addItem(timedItem); else for (tailedItems.push(timedItem), 
                tailedItemsDuration += timedItem.duration; tailedItems.length > 1 && tailedItemsDuration - tailedItems[0].duration > liveBuffer; ) tailedItemsDuration -= tailedItems.shift().duration;
                starttime += timedItem.duration;
            })), parser.on("end", (() => {
                currPlaylist = null, !addedItems.length && tailedItems.length && tailedItems.forEach((item => {
                    addItem(item);
                })), refreshThreshold = Math.max(1, Math.ceil(.01 * addedItems.length)), minRefreshTime = addedItems.reduce(((total, item) => item.duration + total), 0), 
                fetchingPlaylist = !1, onQueuedEnd();
            }));
        };
        return refreshPlaylist(), stream.end = () => {
            ended = !0, streamQueue.die(), requestQueue.die(), clearTimeout(refreshTimeout), 
            null == currPlaylist || currPlaylist.destroy(), null == currSegment || currSegment.destroy(), 
            stream_1.PassThrough.prototype.end.call(stream, null);
        }, stream;
    };
    m3u8stream.parseTimestamp = parse_time_1.humanStr, module.exports = m3u8stream;
}
