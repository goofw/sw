function(module, exports, __webpack_require__) {
    "use strict";
    var http = __webpack_require__(11), https = __webpack_require__(22), url = __webpack_require__(7), util = __webpack_require__(0), stream = __webpack_require__(3), zlib = __webpack_require__(45), aws2 = __webpack_require__(1047), aws4 = __webpack_require__(1048), httpSignature = __webpack_require__(1050), mime = __webpack_require__(89), caseless = __webpack_require__(236), ForeverAgent = __webpack_require__(1067), FormData = __webpack_require__(1068), extend = __webpack_require__(147), isstream = __webpack_require__(492), isTypedArray = __webpack_require__(168).strict, helpers = __webpack_require__(229), cookies = __webpack_require__(473), getProxyFromURI = __webpack_require__(1075), Querystring = __webpack_require__(1076).Querystring, Har = __webpack_require__(1079).Har, Auth = __webpack_require__(1135).Auth, OAuth = __webpack_require__(1136).OAuth, hawk = __webpack_require__(1138), Multipart = __webpack_require__(1139).Multipart, Redirect = __webpack_require__(1140).Redirect, Tunnel = __webpack_require__(1141).Tunnel, now = __webpack_require__(1143), Buffer = __webpack_require__(23).Buffer, safeStringify = helpers.safeStringify, isReadStream = helpers.isReadStream, toBase64 = helpers.toBase64, defer = helpers.defer, copy = helpers.copy, version = helpers.version, globalCookieJar = cookies.jar(), globalPool = {};
    function requestToJSON() {
        return {
            uri: this.uri,
            method: this.method,
            headers: this.headers
        };
    }
    function responseToJSON() {
        return {
            statusCode: this.statusCode,
            body: this.body,
            headers: this.headers,
            request: requestToJSON.call(this.request)
        };
    }
    function Request(options) {
        options.har && (this._har = new Har(this), options = this._har.options(options)), 
        stream.Stream.call(this);
        var reserved = Object.keys(Request.prototype), nonReserved = (function(reserved, options) {
            var object = {};
            for (var i in options) -1 === reserved.indexOf(i) && (object[i] = options[i]);
            return object;
        })(reserved, options);
        extend(this, nonReserved), options = (function(reserved, options) {
            var object = {};
            for (var i in options) {
                var isReserved = !(-1 === reserved.indexOf(i)), isFunction = "function" == typeof options[i];
                isReserved && isFunction || (object[i] = options[i]);
            }
            return object;
        })(reserved, options), this.readable = !0, this.writable = !0, options.method && (this.explicitMethod = !0), 
        this._qs = new Querystring(this), this._auth = new Auth(this), this._oauth = new OAuth(this), 
        this._multipart = new Multipart(this), this._redirect = new Redirect(this), this._tunnel = new Tunnel(this), 
        this.init(options);
    }
    function debug() {
        Request.debug && console.error("REQUEST %s", util.format.apply(util, arguments));
    }
    util.inherits(Request, stream.Stream), Request.debug = process.env.NODE_DEBUG && /\brequest\b/.test(process.env.NODE_DEBUG), 
    Request.prototype.debug = debug, Request.prototype.init = function(options) {
        var self = this;
        for (var headerName in options || (options = {}), self.headers = self.headers ? copy(self.headers) : {}, 
        self.headers) void 0 === self.headers[headerName] && delete self.headers[headerName];
        if (caseless.httpify(self, self.headers), self.method || (self.method = options.method || "GET"), 
        self.localAddress || (self.localAddress = options.localAddress), self._qs.init(options), 
        debug(options), self.pool || !1 === self.pool || (self.pool = globalPool), self.dests = self.dests || [], 
        self.__isRequestRequest = !0, !self._callback && self.callback && (self._callback = self.callback, 
        self.callback = function() {
            self._callbackCalled || (self._callbackCalled = !0, self._callback.apply(self, arguments));
        }, self.on("error", self.callback.bind()), self.on("complete", self.callback.bind(self, null))), 
        !self.uri && self.url && (self.uri = self.url, delete self.url), self.baseUrl) {
            if ("string" != typeof self.baseUrl) return self.emit("error", new Error("options.baseUrl must be a string"));
            if ("string" != typeof self.uri) return self.emit("error", new Error("options.uri must be a string when using options.baseUrl"));
            if (0 === self.uri.indexOf("//") || -1 !== self.uri.indexOf("://")) return self.emit("error", new Error("options.uri must be a path when using options.baseUrl"));
            var baseUrlEndsWithSlash = self.baseUrl.lastIndexOf("/") === self.baseUrl.length - 1, uriStartsWithSlash = 0 === self.uri.indexOf("/");
            baseUrlEndsWithSlash && uriStartsWithSlash ? self.uri = self.baseUrl + self.uri.slice(1) : baseUrlEndsWithSlash || uriStartsWithSlash ? self.uri = self.baseUrl + self.uri : "" === self.uri ? self.uri = self.baseUrl : self.uri = self.baseUrl + "/" + self.uri, 
            delete self.baseUrl;
        }
        if (!self.uri) return self.emit("error", new Error("options.uri is a required argument"));
        if ("string" == typeof self.uri && (self.uri = url.parse(self.uri)), self.uri.href || (self.uri.href = url.format(self.uri)), 
        "unix:" === self.uri.protocol) return self.emit("error", new Error("`unix://` URL scheme is no longer supported. Please use the format `http://unix:SOCKET:PATH`"));
        if ("unix" === self.uri.host && self.enableUnixSocket(), !1 === self.strictSSL && (self.rejectUnauthorized = !1), 
        self.uri.pathname || (self.uri.pathname = "/"), !(self.uri.host || self.uri.hostname && self.uri.port || self.uri.isUnix)) {
            var message = 'Invalid URI "' + url.format(self.uri) + '"';
            return 0 === Object.keys(options).length && (message += ". This can be caused by a crappy redirection."), 
            self.abort(), self.emit("error", new Error(message));
        }
        if (self.hasOwnProperty("proxy") || (self.proxy = getProxyFromURI(self.uri)), self.tunnel = self._tunnel.isEnabled(), 
        self.proxy && self._tunnel.setup(options), self._redirect.onRequest(options), self.setHost = !1, 
        !self.hasHeader("host")) {
            var hostHeaderName = self.originalHostHeaderName || "host";
            self.setHeader(hostHeaderName, self.uri.host), self.uri.port && ("80" === self.uri.port && "http:" === self.uri.protocol || "443" === self.uri.port && "https:" === self.uri.protocol) && self.setHeader(hostHeaderName, self.uri.hostname), 
            self.setHost = !0;
        }
        if (self.jar(self._jar || options.jar), self.uri.port || ("http:" === self.uri.protocol ? self.uri.port = 80 : "https:" === self.uri.protocol && (self.uri.port = 443)), 
        self.proxy && !self.tunnel ? (self.port = self.proxy.port, self.host = self.proxy.hostname) : (self.port = self.uri.port, 
        self.host = self.uri.hostname), options.form && self.form(options.form), options.formData) {
            var formData = options.formData, requestForm = self.form(), appendFormValue = function(key, value) {
                value && value.hasOwnProperty("value") && value.hasOwnProperty("options") ? requestForm.append(key, value.value, value.options) : requestForm.append(key, value);
            };
            for (var formKey in formData) if (formData.hasOwnProperty(formKey)) {
                var formValue = formData[formKey];
                if (formValue instanceof Array) for (var j = 0; j < formValue.length; j++) appendFormValue(formKey, formValue[j]); else appendFormValue(formKey, formValue);
            }
        }
        if (options.qs && self.qs(options.qs), self.uri.path ? self.path = self.uri.path : self.path = self.uri.pathname + (self.uri.search || ""), 
        0 === self.path.length && (self.path = "/"), options.aws && self.aws(options.aws), 
        options.hawk && self.hawk(options.hawk), options.httpSignature && self.httpSignature(options.httpSignature), 
        options.auth && (Object.prototype.hasOwnProperty.call(options.auth, "username") && (options.auth.user = options.auth.username), 
        Object.prototype.hasOwnProperty.call(options.auth, "password") && (options.auth.pass = options.auth.password), 
        self.auth(options.auth.user, options.auth.pass, options.auth.sendImmediately, options.auth.bearer)), 
        self.gzip && !self.hasHeader("accept-encoding") && self.setHeader("accept-encoding", "gzip, deflate"), 
        self.uri.auth && !self.hasHeader("authorization")) {
            var uriAuthPieces = self.uri.auth.split(":").map((function(item) {
                return self._qs.unescape(item);
            }));
            self.auth(uriAuthPieces[0], uriAuthPieces.slice(1).join(":"), !0);
        }
        if (!self.tunnel && self.proxy && self.proxy.auth && !self.hasHeader("proxy-authorization")) {
            var proxyAuthPieces = self.proxy.auth.split(":").map((function(item) {
                return self._qs.unescape(item);
            })), authHeader = "Basic " + toBase64(proxyAuthPieces.join(":"));
            self.setHeader("proxy-authorization", authHeader);
        }
        function setContentLength() {
            var length;
            isTypedArray(self.body) && (self.body = Buffer.from(self.body)), self.hasHeader("content-length") || ((length = "string" == typeof self.body ? Buffer.byteLength(self.body) : Array.isArray(self.body) ? self.body.reduce((function(a, b) {
                return a + b.length;
            }), 0) : self.body.length) ? self.setHeader("content-length", length) : self.emit("error", new Error("Argument error, options.body.")));
        }
        self.proxy && !self.tunnel && (self.path = self.uri.protocol + "//" + self.uri.host + self.path), 
        options.json && self.json(options.json), options.multipart && self.multipart(options.multipart), 
        options.time && (self.timing = !0, self.elapsedTime = self.elapsedTime || 0), self.body && !isstream(self.body) && setContentLength(), 
        options.oauth ? self.oauth(options.oauth) : self._oauth.params && self.hasHeader("authorization") && self.oauth(self._oauth.params);
        var protocol = self.proxy && !self.tunnel ? self.proxy.protocol : self.uri.protocol, defaultModules = {
            "http:": http,
            "https:": https
        }, httpModules = self.httpModules || {};
        if (self.httpModule = httpModules[protocol] || defaultModules[protocol], !self.httpModule) return self.emit("error", new Error("Invalid protocol: " + protocol));
        if (options.ca && (self.ca = options.ca), !self.agent) if (options.agentOptions && (self.agentOptions = options.agentOptions), 
        options.agentClass) self.agentClass = options.agentClass; else if (options.forever) {
            var v = version();
            0 === v.major && v.minor <= 10 ? self.agentClass = "http:" === protocol ? ForeverAgent : ForeverAgent.SSL : (self.agentClass = self.httpModule.Agent, 
            self.agentOptions = self.agentOptions || {}, self.agentOptions.keepAlive = !0);
        } else self.agentClass = self.httpModule.Agent;
        !1 === self.pool ? self.agent = !1 : self.agent = self.agent || self.getNewAgent(), 
        self.on("pipe", (function(src) {
            if (self.ntick && self._started && self.emit("error", new Error("You cannot pipe to this stream after the outbound request has started.")), 
            self.src = src, isReadStream(src)) self.hasHeader("content-type") || self.setHeader("content-type", mime.lookup(src.path)); else {
                if (src.headers) for (var i in src.headers) self.hasHeader(i) || self.setHeader(i, src.headers[i]);
                self._json && !self.hasHeader("content-type") && self.setHeader("content-type", "application/json"), 
                src.method && !self.explicitMethod && (self.method = src.method);
            }
        })), defer((function() {
            if (!self._aborted) {
                var end = function() {
                    if (self._form && (self._auth.hasAuth ? self._auth.hasAuth && self._auth.sentAuth && self._form.pipe(self) : self._form.pipe(self)), 
                    self._multipart && self._multipart.chunked && self._multipart.body.pipe(self), self.body) isstream(self.body) ? self.body.pipe(self) : (setContentLength(), 
                    Array.isArray(self.body) ? self.body.forEach((function(part) {
                        self.write(part);
                    })) : self.write(self.body), self.end()); else if (self.requestBodyStream) console.warn("options.requestBodyStream is deprecated, please pass the request object to stream.pipe."), 
                    self.requestBodyStream.pipe(self); else if (!self.src) {
                        if (self._auth.hasAuth && !self._auth.sentAuth) return void self.end();
                        "GET" !== self.method && void 0 !== self.method && self.setHeader("content-length", 0), 
                        self.end();
                    }
                };
                self._form && !self.hasHeader("content-length") ? (self.setHeader(self._form.getHeaders(), !0), 
                self._form.getLength((function(err, length) {
                    err || isNaN(length) || self.setHeader("content-length", length), end();
                }))) : end(), self.ntick = !0;
            }
        }));
    }, Request.prototype.getNewAgent = function() {
        var Agent = this.agentClass, options = {};
        if (this.agentOptions) for (var i in this.agentOptions) options[i] = this.agentOptions[i];
        this.ca && (options.ca = this.ca), this.ciphers && (options.ciphers = this.ciphers), 
        this.secureProtocol && (options.secureProtocol = this.secureProtocol), this.secureOptions && (options.secureOptions = this.secureOptions), 
        void 0 !== this.rejectUnauthorized && (options.rejectUnauthorized = this.rejectUnauthorized), 
        this.cert && this.key && (options.key = this.key, options.cert = this.cert), this.pfx && (options.pfx = this.pfx), 
        this.passphrase && (options.passphrase = this.passphrase);
        var poolKey = "";
        Agent !== this.httpModule.Agent && (poolKey += Agent.name);
        var proxy = this.proxy;
        return "string" == typeof proxy && (proxy = url.parse(proxy)), (proxy && "https:" === proxy.protocol || "https:" === this.uri.protocol) && (options.ca && (poolKey && (poolKey += ":"), 
        poolKey += options.ca), void 0 !== options.rejectUnauthorized && (poolKey && (poolKey += ":"), 
        poolKey += options.rejectUnauthorized), options.cert && (poolKey && (poolKey += ":"), 
        poolKey += options.cert.toString("ascii") + options.key.toString("ascii")), options.pfx && (poolKey && (poolKey += ":"), 
        poolKey += options.pfx.toString("ascii")), options.ciphers && (poolKey && (poolKey += ":"), 
        poolKey += options.ciphers), options.secureProtocol && (poolKey && (poolKey += ":"), 
        poolKey += options.secureProtocol), options.secureOptions && (poolKey && (poolKey += ":"), 
        poolKey += options.secureOptions)), this.pool === globalPool && !poolKey && 0 === Object.keys(options).length && this.httpModule.globalAgent ? this.httpModule.globalAgent : (poolKey = this.uri.protocol + poolKey, 
        this.pool[poolKey] || (this.pool[poolKey] = new Agent(options), this.pool.maxSockets && (this.pool[poolKey].maxSockets = this.pool.maxSockets)), 
        this.pool[poolKey]);
    }, Request.prototype.start = function() {
        var self = this;
        if (self.timing) var startTime = (new Date).getTime(), startTimeNow = now();
        if (!self._aborted) {
            self._started = !0, self.method = self.method || "GET", self.href = self.uri.href, 
            self.src && self.src.stat && self.src.stat.size && !self.hasHeader("content-length") && self.setHeader("content-length", self.src.stat.size), 
            self._aws && self.aws(self._aws, !0);
            var timeout, reqOptions = copy(self);
            delete reqOptions.auth, debug("make request", self.uri.href), delete reqOptions.timeout;
            try {
                self.req = self.httpModule.request(reqOptions);
            } catch (err) {
                return void self.emit("error", err);
            }
            self.timing && (self.startTime = startTime, self.startTimeNow = startTimeNow, self.timings = {}), 
            self.timeout && !self.timeoutTimer && (self.timeout < 0 ? timeout = 0 : "number" == typeof self.timeout && isFinite(self.timeout) && (timeout = self.timeout)), 
            self.req.on("response", self.onRequestResponse.bind(self)), self.req.on("error", self.onRequestError.bind(self)), 
            self.req.on("drain", (function() {
                self.emit("drain");
            })), self.req.on("socket", (function(socket) {
                var isConnecting = socket._connecting || socket.connecting;
                if (self.timing && (self.timings.socket = now() - self.startTimeNow, isConnecting)) {
                    var onLookupTiming = function() {
                        self.timings.lookup = now() - self.startTimeNow;
                    }, onConnectTiming = function() {
                        self.timings.connect = now() - self.startTimeNow;
                    };
                    socket.once("lookup", onLookupTiming), socket.once("connect", onConnectTiming), 
                    self.req.once("error", (function() {
                        socket.removeListener("lookup", onLookupTiming), socket.removeListener("connect", onConnectTiming);
                    }));
                }
                var setReqTimeout = function() {
                    self.req.setTimeout(timeout, (function() {
                        if (self.req) {
                            self.abort();
                            var e = new Error("ESOCKETTIMEDOUT");
                            e.code = "ESOCKETTIMEDOUT", e.connect = !1, self.emit("error", e);
                        }
                    }));
                };
                if (void 0 !== timeout) if (isConnecting) {
                    var onReqSockConnect = function() {
                        socket.removeListener("connect", onReqSockConnect), clearTimeout(self.timeoutTimer), 
                        self.timeoutTimer = null, setReqTimeout();
                    };
                    socket.on("connect", onReqSockConnect), self.req.on("error", (function(err) {
                        socket.removeListener("connect", onReqSockConnect);
                    })), self.timeoutTimer = setTimeout((function() {
                        socket.removeListener("connect", onReqSockConnect), self.abort();
                        var e = new Error("ETIMEDOUT");
                        e.code = "ETIMEDOUT", e.connect = !0, self.emit("error", e);
                    }), timeout);
                } else setReqTimeout();
                self.emit("socket", socket);
            })), self.emit("request", self.req);
        }
    }, Request.prototype.onRequestError = function(error) {
        if (!this._aborted) {
            if (this.req && this.req._reusedSocket && "ECONNRESET" === error.code && this.agent.addRequestNoreuse) return this.agent = {
                addRequest: this.agent.addRequestNoreuse.bind(this.agent)
            }, this.start(), void this.req.end();
            this.timeout && this.timeoutTimer && (clearTimeout(this.timeoutTimer), this.timeoutTimer = null), 
            this.emit("error", error);
        }
    }, Request.prototype.onRequestResponse = function(response) {
        var self = this;
        if (self.timing && (self.timings.response = now() - self.startTimeNow), debug("onRequestResponse", self.uri.href, response.statusCode, response.headers), 
        response.on("end", (function() {
            self.timing && (self.timings.end = now() - self.startTimeNow, response.timingStart = self.startTime, 
            self.timings.socket || (self.timings.socket = 0), self.timings.lookup || (self.timings.lookup = self.timings.socket), 
            self.timings.connect || (self.timings.connect = self.timings.lookup), self.timings.response || (self.timings.response = self.timings.connect), 
            debug("elapsed time", self.timings.end), self.elapsedTime += Math.round(self.timings.end), 
            response.elapsedTime = self.elapsedTime, response.timings = self.timings, response.timingPhases = {
                wait: self.timings.socket,
                dns: self.timings.lookup - self.timings.socket,
                tcp: self.timings.connect - self.timings.lookup,
                firstByte: self.timings.response - self.timings.connect,
                download: self.timings.end - self.timings.response,
                total: self.timings.end
            }), debug("response end", self.uri.href, response.statusCode, response.headers);
        })), self._aborted) return debug("aborted", self.uri.href), void response.resume();
        if (self.response = response, response.request = self, response.toJSON = responseToJSON, 
        self.httpModule !== https || !self.strictSSL || response.hasOwnProperty("socket") && response.socket.authorized) {
            self.originalHost = self.getHeader("host"), self.originalHostHeaderName || (self.originalHostHeaderName = self.hasHeader("host")), 
            self.setHost && self.removeHeader("host"), self.timeout && self.timeoutTimer && (clearTimeout(self.timeoutTimer), 
            self.timeoutTimer = null);
            var targetCookieJar = self._jar && self._jar.setCookie ? self._jar : globalCookieJar, addCookie = function(cookie) {
                try {
                    targetCookieJar.setCookie(cookie, self.uri.href, {
                        ignoreError: !0
                    });
                } catch (e) {
                    self.emit("error", e);
                }
            };
            if (response.caseless = caseless(response.headers), response.caseless.has("set-cookie") && !self._disableCookies) {
                var headerName = response.caseless.has("set-cookie");
                Array.isArray(response.headers[headerName]) ? response.headers[headerName].forEach(addCookie) : addCookie(response.headers[headerName]);
            }
            if (!self._redirect.onResponse(response)) {
                var responseContent, code;
                if (response.on("close", (function() {
                    self._ended || self.response.emit("end");
                })), response.once("end", (function() {
                    self._ended = !0;
                })), !self.gzip || (code = response.statusCode, "HEAD" === self.method || code >= 100 && code < 200 || 204 === code || 304 === code)) responseContent = response; else {
                    var contentEncoding = response.headers["content-encoding"] || "identity";
                    contentEncoding = contentEncoding.trim().toLowerCase();
                    var zlibOptions = {
                        flush: zlib.Z_SYNC_FLUSH,
                        finishFlush: zlib.Z_SYNC_FLUSH
                    };
                    "gzip" === contentEncoding ? (responseContent = zlib.createGunzip(zlibOptions), 
                    response.pipe(responseContent)) : "deflate" === contentEncoding ? (responseContent = zlib.createInflate(zlibOptions), 
                    response.pipe(responseContent)) : ("identity" !== contentEncoding && debug("ignoring unrecognized Content-Encoding " + contentEncoding), 
                    responseContent = response);
                }
                self.encoding && (0 !== self.dests.length ? console.error("Ignoring encoding parameter as this stream is being piped to another stream which makes the encoding option invalid.") : responseContent.setEncoding(self.encoding)), 
                self._paused && responseContent.pause(), self.responseContent = responseContent, 
                self.emit("response", response), self.dests.forEach((function(dest) {
                    self.pipeDest(dest);
                })), responseContent.on("data", (function(chunk) {
                    self.timing && !self.responseStarted && (self.responseStartTime = (new Date).getTime(), 
                    response.responseStartTime = self.responseStartTime), self._destdata = !0, self.emit("data", chunk);
                })), responseContent.once("end", (function(chunk) {
                    self.emit("end", chunk);
                })), responseContent.on("error", (function(error) {
                    self.emit("error", error);
                })), responseContent.on("close", (function() {
                    self.emit("close");
                })), self.callback ? self.readResponseBody(response) : self.on("end", (function() {
                    self._aborted ? debug("aborted", self.uri.href) : self.emit("complete", response);
                })), debug("finish init function", self.uri.href);
            }
        } else {
            debug("strict ssl error", self.uri.href);
            var sslErr = response.hasOwnProperty("socket") ? response.socket.authorizationError : self.uri.href + " does not support SSL";
            self.emit("error", new Error("SSL Error: " + sslErr));
        }
    }, Request.prototype.readResponseBody = function(response) {
        var self = this;
        debug("reading response's body");
        var buffers = [], bufferLength = 0, strings = [];
        self.on("data", (function(chunk) {
            Buffer.isBuffer(chunk) ? chunk.length && (bufferLength += chunk.length, buffers.push(chunk)) : strings.push(chunk);
        })), self.on("end", (function() {
            if (debug("end event", self.uri.href), self._aborted) return debug("aborted", self.uri.href), 
            buffers = [], void (bufferLength = 0);
            if (bufferLength ? (debug("has body", self.uri.href, bufferLength), response.body = Buffer.concat(buffers, bufferLength), 
            null !== self.encoding && (response.body = response.body.toString(self.encoding)), 
            buffers = [], bufferLength = 0) : strings.length && ("utf8" === self.encoding && strings[0].length > 0 && "\ufeff" === strings[0][0] && (strings[0] = strings[0].substring(1)), 
            response.body = strings.join("")), self._json) try {
                response.body = JSON.parse(response.body, self._jsonReviver);
            } catch (e) {
                debug("invalid JSON received", self.uri.href);
            }
            debug("emitting complete", self.uri.href), void 0 !== response.body || self._json || (response.body = null === self.encoding ? Buffer.alloc(0) : ""), 
            self.emit("complete", response, response.body);
        }));
    }, Request.prototype.abort = function() {
        this._aborted = !0, this.req ? this.req.abort() : this.response && this.response.destroy(), 
        this.emit("abort");
    }, Request.prototype.pipeDest = function(dest) {
        var response = this.response;
        if (dest.headers && !dest.headersSent) {
            if (response.caseless.has("content-type")) {
                var ctname = response.caseless.has("content-type");
                dest.setHeader ? dest.setHeader(ctname, response.headers[ctname]) : dest.headers[ctname] = response.headers[ctname];
            }
            if (response.caseless.has("content-length")) {
                var clname = response.caseless.has("content-length");
                dest.setHeader ? dest.setHeader(clname, response.headers[clname]) : dest.headers[clname] = response.headers[clname];
            }
        }
        if (dest.setHeader && !dest.headersSent) {
            for (var i in response.headers) this.gzip && "content-encoding" === i || dest.setHeader(i, response.headers[i]);
            dest.statusCode = response.statusCode;
        }
        this.pipefilter && this.pipefilter(response, dest);
    }, Request.prototype.qs = function(q, clobber) {
        var base;
        for (var i in base = !clobber && this.uri.query ? this._qs.parse(this.uri.query) : {}, 
        q) base[i] = q[i];
        var qs = this._qs.stringify(base);
        return "" === qs || (this.uri = url.parse(this.uri.href.split("?")[0] + "?" + qs), 
        this.url = this.uri, this.path = this.uri.path, "unix" === this.uri.host && this.enableUnixSocket()), 
        this;
    }, Request.prototype.form = function(form) {
        var self = this;
        return form ? (/^application\/x-www-form-urlencoded\b/.test(self.getHeader("content-type")) || self.setHeader("content-type", "application/x-www-form-urlencoded"), 
        self.body = "string" == typeof form ? self._qs.rfc3986(form.toString("utf8")) : self._qs.stringify(form).toString("utf8"), 
        self) : (self._form = new FormData, self._form.on("error", (function(err) {
            err.message = "form-data: " + err.message, self.emit("error", err), self.abort();
        })), self._form);
    }, Request.prototype.multipart = function(multipart) {
        return this._multipart.onRequest(multipart), this._multipart.chunked || (this.body = this._multipart.body), 
        this;
    }, Request.prototype.json = function(val) {
        return this.hasHeader("accept") || this.setHeader("accept", "application/json"), 
        "function" == typeof this.jsonReplacer && (this._jsonReplacer = this.jsonReplacer), 
        this._json = !0, "boolean" == typeof val ? void 0 !== this.body && (/^application\/x-www-form-urlencoded\b/.test(this.getHeader("content-type")) ? this.body = this._qs.rfc3986(this.body) : this.body = safeStringify(this.body, this._jsonReplacer), 
        this.hasHeader("content-type") || this.setHeader("content-type", "application/json")) : (this.body = safeStringify(val, this._jsonReplacer), 
        this.hasHeader("content-type") || this.setHeader("content-type", "application/json")), 
        "function" == typeof this.jsonReviver && (this._jsonReviver = this.jsonReviver), 
        this;
    }, Request.prototype.getHeader = function(name, headers) {
        var result, re;
        return headers || (headers = this.headers), Object.keys(headers).forEach((function(key) {
            key.length === name.length && (re = new RegExp(name, "i"), key.match(re) && (result = headers[key]));
        })), result;
    }, Request.prototype.enableUnixSocket = function() {
        var unixParts = this.uri.path.split(":"), host = unixParts[0], path = unixParts[1];
        this.socketPath = host, this.uri.pathname = path, this.uri.path = path, this.uri.host = host, 
        this.uri.hostname = host, this.uri.isUnix = !0;
    }, Request.prototype.auth = function(user, pass, sendImmediately, bearer) {
        return this._auth.onRequest(user, pass, sendImmediately, bearer), this;
    }, Request.prototype.aws = function(opts, now) {
        if (!now) return this._aws = opts, this;
        if (4 === opts.sign_version || "4" === opts.sign_version) {
            var options = {
                host: this.uri.host,
                path: this.uri.path,
                method: this.method,
                headers: this.headers,
                body: this.body
            };
            opts.service && (options.service = opts.service);
            var signRes = aws4.sign(options, {
                accessKeyId: opts.key,
                secretAccessKey: opts.secret,
                sessionToken: opts.session
            });
            this.setHeader("authorization", signRes.headers.Authorization), this.setHeader("x-amz-date", signRes.headers["X-Amz-Date"]), 
            signRes.headers["X-Amz-Security-Token"] && this.setHeader("x-amz-security-token", signRes.headers["X-Amz-Security-Token"]);
        } else {
            var date = new Date;
            this.setHeader("date", date.toUTCString());
            var auth = {
                key: opts.key,
                secret: opts.secret,
                verb: this.method.toUpperCase(),
                date: date,
                contentType: this.getHeader("content-type") || "",
                md5: this.getHeader("content-md5") || "",
                amazonHeaders: aws2.canonicalizeHeaders(this.headers)
            }, path = this.uri.path;
            opts.bucket && path ? auth.resource = "/" + opts.bucket + path : opts.bucket && !path ? auth.resource = "/" + opts.bucket : !opts.bucket && path ? auth.resource = path : opts.bucket || path || (auth.resource = "/"), 
            auth.resource = aws2.canonicalizeResource(auth.resource), this.setHeader("authorization", aws2.authorization(auth));
        }
        return this;
    }, Request.prototype.httpSignature = function(opts) {
        var self = this;
        return httpSignature.signRequest({
            getHeader: function(header) {
                return self.getHeader(header, self.headers);
            },
            setHeader: function(header, value) {
                self.setHeader(header, value);
            },
            method: self.method,
            path: self.path
        }, opts), debug("httpSignature authorization", self.getHeader("authorization")), 
        self;
    }, Request.prototype.hawk = function(opts) {
        this.setHeader("Authorization", hawk.header(this.uri, this.method, opts));
    }, Request.prototype.oauth = function(_oauth) {
        return this._oauth.onRequest(_oauth), this;
    }, Request.prototype.jar = function(jar) {
        var cookies;
        if (0 === this._redirect.redirectsFollowed && (this.originalCookieHeader = this.getHeader("cookie")), 
        jar) {
            var targetCookieJar = jar && jar.getCookieString ? jar : globalCookieJar, urihref = this.uri.href;
            targetCookieJar && (cookies = targetCookieJar.getCookieString(urihref));
        } else cookies = !1, this._disableCookies = !0;
        return cookies && cookies.length && (this.originalCookieHeader ? this.setHeader("cookie", this.originalCookieHeader + "; " + cookies) : this.setHeader("cookie", cookies)), 
        this._jar = jar, this;
    }, Request.prototype.pipe = function(dest, opts) {
        if (!this.response) return this.dests.push(dest), stream.Stream.prototype.pipe.call(this, dest, opts), 
        dest;
        if (this._destdata) this.emit("error", new Error("You cannot pipe after data has been emitted from the response.")); else {
            if (!this._ended) return stream.Stream.prototype.pipe.call(this, dest, opts), this.pipeDest(dest), 
            dest;
            this.emit("error", new Error("You cannot pipe after the response has been ended."));
        }
    }, Request.prototype.write = function() {
        var self = this;
        if (!self._aborted) return self._started || self.start(), self.req ? self.req.write.apply(self.req, arguments) : void 0;
    }, Request.prototype.end = function(chunk) {
        this._aborted || (chunk && this.write(chunk), this._started || this.start(), this.req && this.req.end());
    }, Request.prototype.pause = function() {
        var self = this;
        self.responseContent ? self.responseContent.pause.apply(self.responseContent, arguments) : self._paused = !0;
    }, Request.prototype.resume = function() {
        var self = this;
        self.responseContent ? self.responseContent.resume.apply(self.responseContent, arguments) : self._paused = !1;
    }, Request.prototype.destroy = function() {
        this._ended ? this.response && this.response.destroy() : this.end();
    }, Request.defaultProxyHeaderWhiteList = Tunnel.defaultProxyHeaderWhiteList.slice(), 
    Request.defaultProxyHeaderExclusiveList = Tunnel.defaultProxyHeaderExclusiveList.slice(), 
    Request.prototype.toJSON = requestToJSON, module.exports = Request;
}
