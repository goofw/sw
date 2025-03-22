function(module, exports, __webpack_require__) {
    "use strict";
    var __importDefault = this && this.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : {
            default: mod
        };
    };
    const http_1 = __importDefault(__webpack_require__(11)), https_1 = __importDefault(__webpack_require__(22)), url_1 = __webpack_require__(7), stream_1 = __webpack_require__(3), httpLibs = {
        "http:": http_1.default,
        "https:": https_1.default
    }, redirectStatusCodes = new Set([ 301, 302, 303, 307, 308 ]), retryStatusCodes = new Set([ 429, 503 ]), requestEvents = [ "connect", "continue", "information", "socket", "timeout", "upgrade" ], responseEvents = [ "aborted" ];
    function Miniget(url, options = {}) {
        var _a;
        const opts = Object.assign({}, Miniget.defaultOptions, options), stream = new stream_1.PassThrough({
            highWaterMark: opts.highWaterMark
        });
        let activeRequest, activeResponse, activeDecodedStream;
        stream.destroyed = stream.aborted = !1;
        let retryTimeout, contentLength, rangeEnd, redirects = 0, retries = 0, reconnects = 0, acceptRanges = !1, rangeStart = 0, downloaded = 0;
        if (null === (_a = opts.headers) || void 0 === _a ? void 0 : _a.Range) {
            let r = /bytes=(\d+)-(\d+)?/.exec(`${opts.headers.Range}`);
            r && (rangeStart = parseInt(r[1], 10), rangeEnd = parseInt(r[2], 10));
        }
        opts.acceptEncoding && (opts.headers = Object.assign({
            "Accept-Encoding": Object.keys(opts.acceptEncoding).join(", ")
        }, opts.headers));
        const reconnectIfEndedEarly = err => !!("HEAD" !== options.method && acceptRanges && downloaded !== contentLength && reconnects++ < opts.maxReconnects) && ((err => {
            activeDecodedStream = null, retries = 0;
            let inc = opts.backoff.inc, ms = Math.min(inc, opts.backoff.max);
            retryTimeout = setTimeout(doDownload, ms), stream.emit("reconnect", reconnects, err);
        })(err), !0), retryRequest = retryOptions => {
            if (stream.destroyed) return !1;
            if (activeDecodedStream && downloaded > 0) return reconnectIfEndedEarly(retryOptions.err);
            if ((!retryOptions.err || "ENOTFOUND" === retryOptions.err.message) && retries++ < opts.maxRetries) {
                let ms = retryOptions.retryAfter || Math.min(retries * opts.backoff.inc, opts.backoff.max);
                return retryTimeout = setTimeout(doDownload, ms), stream.emit("retry", retries, retryOptions.err), 
                !0;
            }
            return !1;
        }, forwardEvents = (ee, events) => {
            for (let event of events) ee.on(event, stream.emit.bind(stream, event));
        }, doDownload = () => {
            let httpLib, parsed = {};
            try {
                let urlObj = "string" == typeof url ? new url_1.URL(url) : url;
                parsed = Object.assign({}, {
                    host: urlObj.host,
                    hostname: urlObj.hostname,
                    path: urlObj.pathname + urlObj.search + urlObj.hash,
                    port: urlObj.port,
                    protocol: urlObj.protocol
                }), urlObj.username && (parsed.auth = `${urlObj.username}:${urlObj.password}`), 
                httpLib = httpLibs[String(parsed.protocol)];
            } catch (err) {}
            if (!httpLib) return void stream.emit("error", new Miniget.MinigetError(`Invalid URL: ${url}`));
            if (Object.assign(parsed, opts), acceptRanges && downloaded > 0) {
                let start = downloaded + rangeStart, end = rangeEnd || "";
                parsed.headers = Object.assign({}, parsed.headers, {
                    Range: `bytes=${start}-${end}`
                });
            }
            if (opts.transform) {
                try {
                    parsed = opts.transform(parsed);
                } catch (err) {
                    return void stream.emit("error", err);
                }
                if ((!parsed || parsed.protocol) && (httpLib = httpLibs[String(null == parsed ? void 0 : parsed.protocol)], 
                !httpLib)) return void stream.emit("error", new Miniget.MinigetError("Invalid URL object from `transform` function"));
            }
            const onError = err => {
                stream.destroyed || stream.readableEnded || stream._readableState.ended || (cleanup(), 
                retryRequest({
                    err: err
                }) ? activeRequest.removeListener("close", onRequestClose) : stream.emit("error", err));
            }, onRequestClose = () => {
                cleanup(), retryRequest({});
            }, cleanup = () => {
                activeRequest.removeListener("close", onRequestClose), null == activeResponse || activeResponse.removeListener("data", onData), 
                null == activeDecodedStream || activeDecodedStream.removeListener("end", onEnd);
            }, onData = chunk => {
                downloaded += chunk.length;
            }, onEnd = () => {
                cleanup(), reconnectIfEndedEarly() || stream.end();
            };
            activeRequest = httpLib.request(parsed, (res => {
                if (!stream.destroyed) if (redirectStatusCodes.has(res.statusCode)) {
                    if (redirects++ >= opts.maxRedirects) stream.emit("error", new Miniget.MinigetError("Too many redirects")); else {
                        if (!res.headers.location) {
                            let err = new Miniget.MinigetError("Redirect status code given with no location", res.statusCode);
                            return stream.emit("error", err), void cleanup();
                        }
                        url = res.headers.location, setTimeout(doDownload, 1e3 * parseInt(res.headers["retry-after"] || "0", 10)), 
                        stream.emit("redirect", url);
                    }
                    cleanup();
                } else if (retryStatusCodes.has(res.statusCode)) {
                    if (!retryRequest({
                        retryAfter: parseInt(res.headers["retry-after"] || "0", 10)
                    })) {
                        let err = new Miniget.MinigetError(`Status code: ${res.statusCode}`, res.statusCode);
                        stream.emit("error", err);
                    }
                    cleanup();
                } else {
                    if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 400)) {
                        let err = new Miniget.MinigetError(`Status code: ${res.statusCode}`, res.statusCode);
                        return res.statusCode >= 500 ? onError(err) : stream.emit("error", err), void cleanup();
                    }
                    if (activeDecodedStream = res, opts.acceptEncoding && res.headers["content-encoding"]) for (let enc of res.headers["content-encoding"].split(", ").reverse()) {
                        let fn = opts.acceptEncoding[enc];
                        fn && (activeDecodedStream = activeDecodedStream.pipe(fn()), activeDecodedStream.on("error", onError));
                    }
                    contentLength || (contentLength = parseInt(`${res.headers["content-length"]}`, 10), 
                    acceptRanges = "bytes" === res.headers["accept-ranges"] && contentLength > 0 && opts.maxReconnects > 0), 
                    res.on("data", onData), activeDecodedStream.on("end", onEnd), activeDecodedStream.pipe(stream, {
                        end: !acceptRanges
                    }), activeResponse = res, stream.emit("response", res), res.on("error", onError), 
                    forwardEvents(res, responseEvents);
                }
            })), activeRequest.on("error", onError), activeRequest.on("close", onRequestClose), 
            forwardEvents(activeRequest, requestEvents), stream.destroyed && streamDestroy(...destroyArgs), 
            stream.emit("request", activeRequest), activeRequest.end();
        };
        let destroyArgs;
        stream.abort = err => {
            console.warn("`MinigetStream#abort()` has been deprecated in favor of `MinigetStream#destroy()`"), 
            stream.aborted = !0, stream.emit("abort"), stream.destroy(err);
        };
        const streamDestroy = err => {
            activeRequest.destroy(err), null == activeDecodedStream || activeDecodedStream.unpipe(stream), 
            null == activeDecodedStream || activeDecodedStream.destroy(), clearTimeout(retryTimeout);
        };
        return stream._destroy = (...args) => {
            stream.destroyed = !0, activeRequest ? streamDestroy(...args) : destroyArgs = args;
        }, stream.text = () => new Promise(((resolve, reject) => {
            let body = "";
            stream.setEncoding("utf8"), stream.on("data", (chunk => body += chunk)), stream.on("end", (() => resolve(body))), 
            stream.on("error", reject);
        })), process.nextTick(doDownload), stream;
    }
    Miniget.MinigetError = class extends Error {
        constructor(message, statusCode) {
            super(message), this.statusCode = statusCode;
        }
    }, Miniget.defaultOptions = {
        maxRedirects: 10,
        maxRetries: 2,
        maxReconnects: 0,
        backoff: {
            inc: 100,
            max: 1e4
        }
    }, module.exports = Miniget;
}
