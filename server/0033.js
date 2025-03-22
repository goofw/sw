function(module, exports, __webpack_require__) {
    "use strict";
    function _interopDefault(ex) {
        return ex && "object" == typeof ex && "default" in ex ? ex.default : ex;
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var Stream = _interopDefault(__webpack_require__(3)), http = _interopDefault(__webpack_require__(11)), Url = _interopDefault(__webpack_require__(7)), https = _interopDefault(__webpack_require__(22)), zlib = _interopDefault(__webpack_require__(45));
    const Readable = Stream.Readable, BUFFER = Symbol("buffer"), TYPE = Symbol("type");
    class Blob {
        constructor() {
            this[TYPE] = "";
            const blobParts = arguments[0], options = arguments[1], buffers = [];
            let size = 0;
            if (blobParts) {
                const a = blobParts, length = Number(a.length);
                for (let i = 0; i < length; i++) {
                    const element = a[i];
                    let buffer;
                    buffer = element instanceof Buffer ? element : ArrayBuffer.isView(element) ? Buffer.from(element.buffer, element.byteOffset, element.byteLength) : element instanceof ArrayBuffer ? Buffer.from(element) : element instanceof Blob ? element[BUFFER] : Buffer.from("string" == typeof element ? element : String(element)), 
                    size += buffer.length, buffers.push(buffer);
                }
            }
            this[BUFFER] = Buffer.concat(buffers);
            let type = options && void 0 !== options.type && String(options.type).toLowerCase();
            type && !/[^\u0020-\u007E]/.test(type) && (this[TYPE] = type);
        }
        get size() {
            return this[BUFFER].length;
        }
        get type() {
            return this[TYPE];
        }
        text() {
            return Promise.resolve(this[BUFFER].toString());
        }
        arrayBuffer() {
            const buf = this[BUFFER], ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
            return Promise.resolve(ab);
        }
        stream() {
            const readable = new Readable;
            return readable._read = function() {}, readable.push(this[BUFFER]), readable.push(null), 
            readable;
        }
        toString() {
            return "[object Blob]";
        }
        slice() {
            const size = this.size, start = arguments[0], end = arguments[1];
            let relativeStart, relativeEnd;
            relativeStart = void 0 === start ? 0 : start < 0 ? Math.max(size + start, 0) : Math.min(start, size), 
            relativeEnd = void 0 === end ? size : end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
            const span = Math.max(relativeEnd - relativeStart, 0), slicedBuffer = this[BUFFER].slice(relativeStart, relativeStart + span), blob = new Blob([], {
                type: arguments[2]
            });
            return blob[BUFFER] = slicedBuffer, blob;
        }
    }
    function FetchError(message, type, systemError) {
        Error.call(this, message), this.message = message, this.type = type, systemError && (this.code = this.errno = systemError.code), 
        Error.captureStackTrace(this, this.constructor);
    }
    let convert;
    Object.defineProperties(Blob.prototype, {
        size: {
            enumerable: !0
        },
        type: {
            enumerable: !0
        },
        slice: {
            enumerable: !0
        }
    }), Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
        value: "Blob",
        writable: !1,
        enumerable: !1,
        configurable: !0
    }), FetchError.prototype = Object.create(Error.prototype), FetchError.prototype.constructor = FetchError, 
    FetchError.prototype.name = "FetchError";
    try {
        convert = __webpack_require__(520).convert;
    } catch (e) {}
    const INTERNALS = Symbol("Body internals"), PassThrough = Stream.PassThrough;
    function Body(body) {
        var _this = this, _ref = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, _ref$size = _ref.size;
        let size = void 0 === _ref$size ? 0 : _ref$size;
        var _ref$timeout = _ref.timeout;
        let timeout = void 0 === _ref$timeout ? 0 : _ref$timeout;
        null == body ? body = null : isURLSearchParams(body) ? body = Buffer.from(body.toString()) : isBlob(body) || Buffer.isBuffer(body) || ("[object ArrayBuffer]" === Object.prototype.toString.call(body) ? body = Buffer.from(body) : ArrayBuffer.isView(body) ? body = Buffer.from(body.buffer, body.byteOffset, body.byteLength) : body instanceof Stream || (body = Buffer.from(String(body)))), 
        this[INTERNALS] = {
            body: body,
            disturbed: !1,
            error: null
        }, this.size = size, this.timeout = timeout, body instanceof Stream && body.on("error", (function(err) {
            const error = "AbortError" === err.name ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, "system", err);
            _this[INTERNALS].error = error;
        }));
    }
    function consumeBody() {
        var _this4 = this;
        if (this[INTERNALS].disturbed) return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
        if (this[INTERNALS].disturbed = !0, this[INTERNALS].error) return Body.Promise.reject(this[INTERNALS].error);
        let body = this.body;
        if (null === body) return Body.Promise.resolve(Buffer.alloc(0));
        if (isBlob(body) && (body = body.stream()), Buffer.isBuffer(body)) return Body.Promise.resolve(body);
        if (!(body instanceof Stream)) return Body.Promise.resolve(Buffer.alloc(0));
        let accum = [], accumBytes = 0, abort = !1;
        return new Body.Promise((function(resolve, reject) {
            let resTimeout;
            _this4.timeout && (resTimeout = setTimeout((function() {
                abort = !0, reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, "body-timeout"));
            }), _this4.timeout)), body.on("error", (function(err) {
                "AbortError" === err.name ? (abort = !0, reject(err)) : reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, "system", err));
            })), body.on("data", (function(chunk) {
                if (!abort && null !== chunk) {
                    if (_this4.size && accumBytes + chunk.length > _this4.size) return abort = !0, void reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, "max-size"));
                    accumBytes += chunk.length, accum.push(chunk);
                }
            })), body.on("end", (function() {
                if (!abort) {
                    clearTimeout(resTimeout);
                    try {
                        resolve(Buffer.concat(accum, accumBytes));
                    } catch (err) {
                        reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, "system", err));
                    }
                }
            }));
        }));
    }
    function isURLSearchParams(obj) {
        return "object" == typeof obj && "function" == typeof obj.append && "function" == typeof obj.delete && "function" == typeof obj.get && "function" == typeof obj.getAll && "function" == typeof obj.has && "function" == typeof obj.set && ("URLSearchParams" === obj.constructor.name || "[object URLSearchParams]" === Object.prototype.toString.call(obj) || "function" == typeof obj.sort);
    }
    function isBlob(obj) {
        return "object" == typeof obj && "function" == typeof obj.arrayBuffer && "string" == typeof obj.type && "function" == typeof obj.stream && "function" == typeof obj.constructor && "string" == typeof obj.constructor.name && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
    }
    function clone(instance) {
        let p1, p2, body = instance.body;
        if (instance.bodyUsed) throw new Error("cannot clone body after it is used");
        return body instanceof Stream && "function" != typeof body.getBoundary && (p1 = new PassThrough, 
        p2 = new PassThrough, body.pipe(p1), body.pipe(p2), instance[INTERNALS].body = p1, 
        body = p2), body;
    }
    function extractContentType(body) {
        return null === body ? null : "string" == typeof body ? "text/plain;charset=UTF-8" : isURLSearchParams(body) ? "application/x-www-form-urlencoded;charset=UTF-8" : isBlob(body) ? body.type || null : Buffer.isBuffer(body) || "[object ArrayBuffer]" === Object.prototype.toString.call(body) || ArrayBuffer.isView(body) ? null : "function" == typeof body.getBoundary ? `multipart/form-data;boundary=${body.getBoundary()}` : body instanceof Stream ? null : "text/plain;charset=UTF-8";
    }
    function getTotalBytes(instance) {
        const body = instance.body;
        return null === body ? 0 : isBlob(body) ? body.size : Buffer.isBuffer(body) ? body.length : body && "function" == typeof body.getLengthSync && (body._lengthRetrievers && 0 == body._lengthRetrievers.length || body.hasKnownLength && body.hasKnownLength()) ? body.getLengthSync() : null;
    }
    Body.prototype = {
        get body() {
            return this[INTERNALS].body;
        },
        get bodyUsed() {
            return this[INTERNALS].disturbed;
        },
        arrayBuffer() {
            return consumeBody.call(this).then((function(buf) {
                return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
            }));
        },
        blob() {
            let ct = this.headers && this.headers.get("content-type") || "";
            return consumeBody.call(this).then((function(buf) {
                return Object.assign(new Blob([], {
                    type: ct.toLowerCase()
                }), {
                    [BUFFER]: buf
                });
            }));
        },
        json() {
            var _this2 = this;
            return consumeBody.call(this).then((function(buffer) {
                try {
                    return JSON.parse(buffer.toString());
                } catch (err) {
                    return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, "invalid-json"));
                }
            }));
        },
        text() {
            return consumeBody.call(this).then((function(buffer) {
                return buffer.toString();
            }));
        },
        buffer() {
            return consumeBody.call(this);
        },
        textConverted() {
            var _this3 = this;
            return consumeBody.call(this).then((function(buffer) {
                return (function(buffer, headers) {
                    if ("function" != typeof convert) throw new Error("The package `encoding` must be installed to use the textConverted() function");
                    const ct = headers.get("content-type");
                    let res, str, charset = "utf-8";
                    return ct && (res = /charset=([^;]*)/i.exec(ct)), str = buffer.slice(0, 1024).toString(), 
                    !res && str && (res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str)), !res && str && (res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str), 
                    res && (res = /charset=(.*)/i.exec(res.pop()))), !res && str && (res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str)), 
                    res && (charset = res.pop(), "gb2312" !== charset && "gbk" !== charset || (charset = "gb18030")), 
                    convert(buffer, "UTF-8", charset).toString();
                })(buffer, _this3.headers);
            }));
        }
    }, Object.defineProperties(Body.prototype, {
        body: {
            enumerable: !0
        },
        bodyUsed: {
            enumerable: !0
        },
        arrayBuffer: {
            enumerable: !0
        },
        blob: {
            enumerable: !0
        },
        json: {
            enumerable: !0
        },
        text: {
            enumerable: !0
        }
    }), Body.mixIn = function(proto) {
        for (const name of Object.getOwnPropertyNames(Body.prototype)) if (!(name in proto)) {
            const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
            Object.defineProperty(proto, name, desc);
        }
    }, Body.Promise = global.Promise;
    const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/, invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;
    function validateName(name) {
        if (name = `${name}`, invalidTokenRegex.test(name) || "" === name) throw new TypeError(`${name} is not a legal HTTP header name`);
    }
    function validateValue(value) {
        if (value = `${value}`, invalidHeaderCharRegex.test(value)) throw new TypeError(`${value} is not a legal HTTP header value`);
    }
    function find(map, name) {
        name = name.toLowerCase();
        for (const key in map) if (key.toLowerCase() === name) return key;
    }
    const MAP = Symbol("map");
    class Headers {
        constructor() {
            let init = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : void 0;
            if (this[MAP] = Object.create(null), init instanceof Headers) {
                const rawHeaders = init.raw(), headerNames = Object.keys(rawHeaders);
                for (const headerName of headerNames) for (const value of rawHeaders[headerName]) this.append(headerName, value);
            } else if (null == init) ; else {
                if ("object" != typeof init) throw new TypeError("Provided initializer must be an object");
                {
                    const method = init[Symbol.iterator];
                    if (null != method) {
                        if ("function" != typeof method) throw new TypeError("Header pairs must be iterable");
                        const pairs = [];
                        for (const pair of init) {
                            if ("object" != typeof pair || "function" != typeof pair[Symbol.iterator]) throw new TypeError("Each header pair must be iterable");
                            pairs.push(Array.from(pair));
                        }
                        for (const pair of pairs) {
                            if (2 !== pair.length) throw new TypeError("Each header pair must be a name/value tuple");
                            this.append(pair[0], pair[1]);
                        }
                    } else for (const key of Object.keys(init)) {
                        const value = init[key];
                        this.append(key, value);
                    }
                }
            }
        }
        get(name) {
            validateName(name = `${name}`);
            const key = find(this[MAP], name);
            return void 0 === key ? null : this[MAP][key].join(", ");
        }
        forEach(callback) {
            let thisArg = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : void 0, pairs = getHeaders(this), i = 0;
            for (;i < pairs.length; ) {
                var _pairs$i = pairs[i];
                const name = _pairs$i[0], value = _pairs$i[1];
                callback.call(thisArg, value, name, this), pairs = getHeaders(this), i++;
            }
        }
        set(name, value) {
            value = `${value}`, validateName(name = `${name}`), validateValue(value);
            const key = find(this[MAP], name);
            this[MAP][void 0 !== key ? key : name] = [ value ];
        }
        append(name, value) {
            value = `${value}`, validateName(name = `${name}`), validateValue(value);
            const key = find(this[MAP], name);
            void 0 !== key ? this[MAP][key].push(value) : this[MAP][name] = [ value ];
        }
        has(name) {
            return validateName(name = `${name}`), void 0 !== find(this[MAP], name);
        }
        delete(name) {
            validateName(name = `${name}`);
            const key = find(this[MAP], name);
            void 0 !== key && delete this[MAP][key];
        }
        raw() {
            return this[MAP];
        }
        keys() {
            return createHeadersIterator(this, "key");
        }
        values() {
            return createHeadersIterator(this, "value");
        }
        [Symbol.iterator]() {
            return createHeadersIterator(this, "key+value");
        }
    }
    function getHeaders(headers) {
        let kind = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "key+value";
        const keys = Object.keys(headers[MAP]).sort();
        return keys.map("key" === kind ? function(k) {
            return k.toLowerCase();
        } : "value" === kind ? function(k) {
            return headers[MAP][k].join(", ");
        } : function(k) {
            return [ k.toLowerCase(), headers[MAP][k].join(", ") ];
        });
    }
    Headers.prototype.entries = Headers.prototype[Symbol.iterator], Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
        value: "Headers",
        writable: !1,
        enumerable: !1,
        configurable: !0
    }), Object.defineProperties(Headers.prototype, {
        get: {
            enumerable: !0
        },
        forEach: {
            enumerable: !0
        },
        set: {
            enumerable: !0
        },
        append: {
            enumerable: !0
        },
        has: {
            enumerable: !0
        },
        delete: {
            enumerable: !0
        },
        keys: {
            enumerable: !0
        },
        values: {
            enumerable: !0
        },
        entries: {
            enumerable: !0
        }
    });
    const INTERNAL = Symbol("internal");
    function createHeadersIterator(target, kind) {
        const iterator = Object.create(HeadersIteratorPrototype);
        return iterator[INTERNAL] = {
            target: target,
            kind: kind,
            index: 0
        }, iterator;
    }
    const HeadersIteratorPrototype = Object.setPrototypeOf({
        next() {
            if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) throw new TypeError("Value of `this` is not a HeadersIterator");
            var _INTERNAL = this[INTERNAL];
            const target = _INTERNAL.target, kind = _INTERNAL.kind, index = _INTERNAL.index, values = getHeaders(target, kind);
            return index >= values.length ? {
                value: void 0,
                done: !0
            } : (this[INTERNAL].index = index + 1, {
                value: values[index],
                done: !1
            });
        }
    }, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));
    function exportNodeCompatibleHeaders(headers) {
        const obj = Object.assign({
            __proto__: null
        }, headers[MAP]), hostHeaderKey = find(headers[MAP], "Host");
        return void 0 !== hostHeaderKey && (obj[hostHeaderKey] = obj[hostHeaderKey][0]), 
        obj;
    }
    Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
        value: "HeadersIterator",
        writable: !1,
        enumerable: !1,
        configurable: !0
    });
    const INTERNALS$1 = Symbol("Response internals"), STATUS_CODES = http.STATUS_CODES;
    class Response {
        constructor() {
            let body = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : null, opts = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
            Body.call(this, body, opts);
            const status = opts.status || 200, headers = new Headers(opts.headers);
            if (null != body && !headers.has("Content-Type")) {
                const contentType = extractContentType(body);
                contentType && headers.append("Content-Type", contentType);
            }
            this[INTERNALS$1] = {
                url: opts.url,
                status: status,
                statusText: opts.statusText || STATUS_CODES[status],
                headers: headers,
                counter: opts.counter
            };
        }
        get url() {
            return this[INTERNALS$1].url || "";
        }
        get status() {
            return this[INTERNALS$1].status;
        }
        get ok() {
            return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
        }
        get redirected() {
            return this[INTERNALS$1].counter > 0;
        }
        get statusText() {
            return this[INTERNALS$1].statusText;
        }
        get headers() {
            return this[INTERNALS$1].headers;
        }
        clone() {
            return new Response(clone(this), {
                url: this.url,
                status: this.status,
                statusText: this.statusText,
                headers: this.headers,
                ok: this.ok,
                redirected: this.redirected
            });
        }
    }
    Body.mixIn(Response.prototype), Object.defineProperties(Response.prototype, {
        url: {
            enumerable: !0
        },
        status: {
            enumerable: !0
        },
        ok: {
            enumerable: !0
        },
        redirected: {
            enumerable: !0
        },
        statusText: {
            enumerable: !0
        },
        headers: {
            enumerable: !0
        },
        clone: {
            enumerable: !0
        }
    }), Object.defineProperty(Response.prototype, Symbol.toStringTag, {
        value: "Response",
        writable: !1,
        enumerable: !1,
        configurable: !0
    });
    const INTERNALS$2 = Symbol("Request internals"), parse_url = Url.parse, format_url = Url.format, streamDestructionSupported = "destroy" in Stream.Readable.prototype;
    function isRequest(input) {
        return "object" == typeof input && "object" == typeof input[INTERNALS$2];
    }
    class Request {
        constructor(input) {
            let parsedURL, init = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
            isRequest(input) ? parsedURL = parse_url(input.url) : (parsedURL = input && input.href ? parse_url(input.href) : parse_url(`${input}`), 
            input = {});
            let method = init.method || input.method || "GET";
            if (method = method.toUpperCase(), (null != init.body || isRequest(input) && null !== input.body) && ("GET" === method || "HEAD" === method)) throw new TypeError("Request with GET/HEAD method cannot have body");
            let inputBody = null != init.body ? init.body : isRequest(input) && null !== input.body ? clone(input) : null;
            Body.call(this, inputBody, {
                timeout: init.timeout || input.timeout || 0,
                size: init.size || input.size || 0
            });
            const headers = new Headers(init.headers || input.headers || {});
            if (null != inputBody && !headers.has("Content-Type")) {
                const contentType = extractContentType(inputBody);
                contentType && headers.append("Content-Type", contentType);
            }
            let signal = isRequest(input) ? input.signal : null;
            if ("signal" in init && (signal = init.signal), null != signal && !(function(signal) {
                const proto = signal && "object" == typeof signal && Object.getPrototypeOf(signal);
                return !(!proto || "AbortSignal" !== proto.constructor.name);
            })(signal)) throw new TypeError("Expected signal to be an instanceof AbortSignal");
            this[INTERNALS$2] = {
                method: method,
                redirect: init.redirect || input.redirect || "follow",
                headers: headers,
                parsedURL: parsedURL,
                signal: signal
            }, this.follow = void 0 !== init.follow ? init.follow : void 0 !== input.follow ? input.follow : 20, 
            this.compress = void 0 !== init.compress ? init.compress : void 0 === input.compress || input.compress, 
            this.counter = init.counter || input.counter || 0, this.agent = init.agent || input.agent;
        }
        get method() {
            return this[INTERNALS$2].method;
        }
        get url() {
            return format_url(this[INTERNALS$2].parsedURL);
        }
        get headers() {
            return this[INTERNALS$2].headers;
        }
        get redirect() {
            return this[INTERNALS$2].redirect;
        }
        get signal() {
            return this[INTERNALS$2].signal;
        }
        clone() {
            return new Request(this);
        }
    }
    function AbortError(message) {
        Error.call(this, message), this.type = "aborted", this.message = message, Error.captureStackTrace(this, this.constructor);
    }
    Body.mixIn(Request.prototype), Object.defineProperty(Request.prototype, Symbol.toStringTag, {
        value: "Request",
        writable: !1,
        enumerable: !1,
        configurable: !0
    }), Object.defineProperties(Request.prototype, {
        method: {
            enumerable: !0
        },
        url: {
            enumerable: !0
        },
        headers: {
            enumerable: !0
        },
        redirect: {
            enumerable: !0
        },
        clone: {
            enumerable: !0
        },
        signal: {
            enumerable: !0
        }
    }), AbortError.prototype = Object.create(Error.prototype), AbortError.prototype.constructor = AbortError, 
    AbortError.prototype.name = "AbortError";
    const PassThrough$1 = Stream.PassThrough, resolve_url = Url.resolve;
    function fetch(url, opts) {
        if (!fetch.Promise) throw new Error("native promise missing, set fetch.Promise to your favorite alternative");
        return Body.Promise = fetch.Promise, new fetch.Promise((function(resolve, reject) {
            const request = new Request(url, opts), options = (function(request) {
                const parsedURL = request[INTERNALS$2].parsedURL, headers = new Headers(request[INTERNALS$2].headers);
                if (headers.has("Accept") || headers.set("Accept", "*/*"), !parsedURL.protocol || !parsedURL.hostname) throw new TypeError("Only absolute URLs are supported");
                if (!/^https?:$/.test(parsedURL.protocol)) throw new TypeError("Only HTTP(S) protocols are supported");
                if (request.signal && request.body instanceof Stream.Readable && !streamDestructionSupported) throw new Error("Cancellation of streamed requests with AbortSignal is not supported in node < 8");
                let contentLengthValue = null;
                if (null == request.body && /^(POST|PUT)$/i.test(request.method) && (contentLengthValue = "0"), 
                null != request.body) {
                    const totalBytes = getTotalBytes(request);
                    "number" == typeof totalBytes && (contentLengthValue = String(totalBytes));
                }
                contentLengthValue && headers.set("Content-Length", contentLengthValue), headers.has("User-Agent") || headers.set("User-Agent", "node-fetch/1.0 (+https://github.com/bitinn/node-fetch)"), 
                request.compress && !headers.has("Accept-Encoding") && headers.set("Accept-Encoding", "gzip,deflate");
                let agent = request.agent;
                return "function" == typeof agent && (agent = agent(parsedURL)), headers.has("Connection") || agent || headers.set("Connection", "close"), 
                Object.assign({}, parsedURL, {
                    method: request.method,
                    headers: exportNodeCompatibleHeaders(headers),
                    agent: agent
                });
            })(request), send = ("https:" === options.protocol ? https : http).request, signal = request.signal;
            let response = null;
            const abort = function() {
                let error = new AbortError("The user aborted a request.");
                reject(error), request.body && request.body instanceof Stream.Readable && request.body.destroy(error), 
                response && response.body && response.body.emit("error", error);
            };
            if (signal && signal.aborted) return void abort();
            const abortAndFinalize = function() {
                abort(), finalize();
            }, req = send(options);
            let reqTimeout;
            function finalize() {
                req.abort(), signal && signal.removeEventListener("abort", abortAndFinalize), clearTimeout(reqTimeout);
            }
            signal && signal.addEventListener("abort", abortAndFinalize), request.timeout && req.once("socket", (function(socket) {
                reqTimeout = setTimeout((function() {
                    reject(new FetchError(`network timeout at: ${request.url}`, "request-timeout")), 
                    finalize();
                }), request.timeout);
            })), req.on("error", (function(err) {
                reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, "system", err)), 
                finalize();
            })), req.on("response", (function(res) {
                clearTimeout(reqTimeout);
                const headers = (function(obj) {
                    const headers = new Headers;
                    for (const name of Object.keys(obj)) if (!invalidTokenRegex.test(name)) if (Array.isArray(obj[name])) for (const val of obj[name]) invalidHeaderCharRegex.test(val) || (void 0 === headers[MAP][name] ? headers[MAP][name] = [ val ] : headers[MAP][name].push(val)); else invalidHeaderCharRegex.test(obj[name]) || (headers[MAP][name] = [ obj[name] ]);
                    return headers;
                })(res.headers);
                if (fetch.isRedirect(res.statusCode)) {
                    const location = headers.get("Location"), locationURL = null === location ? null : resolve_url(request.url, location);
                    switch (request.redirect) {
                      case "error":
                        return reject(new FetchError(`redirect mode is set to error: ${request.url}`, "no-redirect")), 
                        void finalize();

                      case "manual":
                        if (null !== locationURL) try {
                            headers.set("Location", locationURL);
                        } catch (err) {
                            reject(err);
                        }
                        break;

                      case "follow":
                        if (null === locationURL) break;
                        if (request.counter >= request.follow) return reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect")), 
                        void finalize();
                        const requestOpts = {
                            headers: new Headers(request.headers),
                            follow: request.follow,
                            counter: request.counter + 1,
                            agent: request.agent,
                            compress: request.compress,
                            method: request.method,
                            body: request.body,
                            signal: request.signal,
                            timeout: request.timeout
                        };
                        return 303 !== res.statusCode && request.body && null === getTotalBytes(request) ? (reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect")), 
                        void finalize()) : (303 !== res.statusCode && (301 !== res.statusCode && 302 !== res.statusCode || "POST" !== request.method) || (requestOpts.method = "GET", 
                        requestOpts.body = void 0, requestOpts.headers.delete("content-length")), resolve(fetch(new Request(locationURL, requestOpts))), 
                        void finalize());
                    }
                }
                res.once("end", (function() {
                    signal && signal.removeEventListener("abort", abortAndFinalize);
                }));
                let body = res.pipe(new PassThrough$1);
                const response_options = {
                    url: request.url,
                    status: res.statusCode,
                    statusText: res.statusMessage,
                    headers: headers,
                    size: request.size,
                    timeout: request.timeout,
                    counter: request.counter
                }, codings = headers.get("Content-Encoding");
                if (!request.compress || "HEAD" === request.method || null === codings || 204 === res.statusCode || 304 === res.statusCode) return response = new Response(body, response_options), 
                void resolve(response);
                const zlibOptions = {
                    flush: zlib.Z_SYNC_FLUSH,
                    finishFlush: zlib.Z_SYNC_FLUSH
                };
                if ("gzip" == codings || "x-gzip" == codings) return body = body.pipe(zlib.createGunzip(zlibOptions)), 
                response = new Response(body, response_options), void resolve(response);
                if ("deflate" != codings && "x-deflate" != codings) {
                    if ("br" == codings && "function" == typeof zlib.createBrotliDecompress) return body = body.pipe(zlib.createBrotliDecompress()), 
                    response = new Response(body, response_options), void resolve(response);
                    response = new Response(body, response_options), resolve(response);
                } else res.pipe(new PassThrough$1).once("data", (function(chunk) {
                    body = 8 == (15 & chunk[0]) ? body.pipe(zlib.createInflate()) : body.pipe(zlib.createInflateRaw()), 
                    response = new Response(body, response_options), resolve(response);
                }));
            })), (function(dest, instance) {
                const body = instance.body;
                null === body ? dest.end() : isBlob(body) ? body.stream().pipe(dest) : Buffer.isBuffer(body) ? (dest.write(body), 
                dest.end()) : body.pipe(dest);
            })(req, request);
        }));
    }
    fetch.isRedirect = function(code) {
        return 301 === code || 302 === code || 303 === code || 307 === code || 308 === code;
    }, fetch.Promise = global.Promise, module.exports = exports = fetch, Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.default = exports, exports.Headers = Headers, exports.Request = Request, 
    exports.Response = Response, exports.FetchError = FetchError;
}
