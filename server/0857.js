function(module, exports, __webpack_require__) {
    var url = __webpack_require__(7), URL = url.URL, http = __webpack_require__(11), https = __webpack_require__(22), Writable = __webpack_require__(3).Writable, assert = __webpack_require__(24), debug = __webpack_require__(858), eventHandlers = Object.create(null);
    [ "abort", "aborted", "connect", "error", "socket", "timeout" ].forEach((function(event) {
        eventHandlers[event] = function(arg1, arg2, arg3) {
            this._redirectable.emit(event, arg1, arg2, arg3);
        };
    }));
    var RedirectionError = createErrorType("ERR_FR_REDIRECTION_FAILURE", ""), TooManyRedirectsError = createErrorType("ERR_FR_TOO_MANY_REDIRECTS", "Maximum number of redirects exceeded"), MaxBodyLengthExceededError = createErrorType("ERR_FR_MAX_BODY_LENGTH_EXCEEDED", "Request body larger than maxBodyLength limit"), WriteAfterEndError = createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");
    function RedirectableRequest(options, responseCallback) {
        Writable.call(this), this._sanitizeOptions(options), this._options = options, this._ended = !1, 
        this._ending = !1, this._redirectCount = 0, this._redirects = [], this._requestBodyLength = 0, 
        this._requestBodyBuffers = [], responseCallback && this.on("response", responseCallback);
        var self = this;
        this._onNativeResponse = function(response) {
            self._processResponse(response);
        }, this._performRequest();
    }
    function wrap(protocols) {
        var exports = {
            maxRedirects: 21,
            maxBodyLength: 10485760
        }, nativeProtocols = {};
        return Object.keys(protocols).forEach((function(scheme) {
            var protocol = scheme + ":", nativeProtocol = nativeProtocols[protocol] = protocols[scheme], wrappedProtocol = exports[scheme] = Object.create(nativeProtocol);
            Object.defineProperties(wrappedProtocol, {
                request: {
                    value: function(input, options, callback) {
                        if ("string" == typeof input) {
                            var urlStr = input;
                            try {
                                input = urlToOptions(new URL(urlStr));
                            } catch (err) {
                                input = url.parse(urlStr);
                            }
                        } else URL && input instanceof URL ? input = urlToOptions(input) : (callback = options, 
                        options = input, input = {
                            protocol: protocol
                        });
                        return "function" == typeof options && (callback = options, options = null), (options = Object.assign({
                            maxRedirects: exports.maxRedirects,
                            maxBodyLength: exports.maxBodyLength
                        }, input, options)).nativeProtocols = nativeProtocols, assert.equal(options.protocol, protocol, "protocol mismatch"), 
                        debug("options", options), new RedirectableRequest(options, callback);
                    },
                    configurable: !0,
                    enumerable: !0,
                    writable: !0
                },
                get: {
                    value: function(input, options, callback) {
                        var wrappedRequest = wrappedProtocol.request(input, options, callback);
                        return wrappedRequest.end(), wrappedRequest;
                    },
                    configurable: !0,
                    enumerable: !0,
                    writable: !0
                }
            });
        })), exports;
    }
    function noop() {}
    function urlToOptions(urlObject) {
        var options = {
            protocol: urlObject.protocol,
            hostname: urlObject.hostname.startsWith("[") ? urlObject.hostname.slice(1, -1) : urlObject.hostname,
            hash: urlObject.hash,
            search: urlObject.search,
            pathname: urlObject.pathname,
            path: urlObject.pathname + urlObject.search,
            href: urlObject.href
        };
        return "" !== urlObject.port && (options.port = Number(urlObject.port)), options;
    }
    function removeMatchingHeaders(regex, headers) {
        var lastValue;
        for (var header in headers) regex.test(header) && (lastValue = headers[header], 
        delete headers[header]);
        return lastValue;
    }
    function createErrorType(code, defaultMessage) {
        function CustomError(message) {
            Error.captureStackTrace(this, this.constructor), this.message = message || defaultMessage;
        }
        return CustomError.prototype = new Error, CustomError.prototype.constructor = CustomError, 
        CustomError.prototype.name = "Error [" + code + "]", CustomError.prototype.code = code, 
        CustomError;
    }
    RedirectableRequest.prototype = Object.create(Writable.prototype), RedirectableRequest.prototype.abort = function() {
        this._currentRequest.removeAllListeners(), this._currentRequest.on("error", noop), 
        this._currentRequest.abort(), this.emit("abort"), this.removeAllListeners();
    }, RedirectableRequest.prototype.write = function(data, encoding, callback) {
        if (this._ending) throw new WriteAfterEndError;
        if (!("string" == typeof data || "object" == typeof data && "length" in data)) throw new TypeError("data should be a string, Buffer or Uint8Array");
        "function" == typeof encoding && (callback = encoding, encoding = null), 0 !== data.length ? this._requestBodyLength + data.length <= this._options.maxBodyLength ? (this._requestBodyLength += data.length, 
        this._requestBodyBuffers.push({
            data: data,
            encoding: encoding
        }), this._currentRequest.write(data, encoding, callback)) : (this.emit("error", new MaxBodyLengthExceededError), 
        this.abort()) : callback && callback();
    }, RedirectableRequest.prototype.end = function(data, encoding, callback) {
        if ("function" == typeof data ? (callback = data, data = encoding = null) : "function" == typeof encoding && (callback = encoding, 
        encoding = null), data) {
            var self = this, currentRequest = this._currentRequest;
            this.write(data, encoding, (function() {
                self._ended = !0, currentRequest.end(null, null, callback);
            })), this._ending = !0;
        } else this._ended = this._ending = !0, this._currentRequest.end(null, null, callback);
    }, RedirectableRequest.prototype.setHeader = function(name, value) {
        this._options.headers[name] = value, this._currentRequest.setHeader(name, value);
    }, RedirectableRequest.prototype.removeHeader = function(name) {
        delete this._options.headers[name], this._currentRequest.removeHeader(name);
    }, RedirectableRequest.prototype.setTimeout = function(msecs, callback) {
        var self = this;
        function startTimer() {
            self._timeout && clearTimeout(self._timeout), self._timeout = setTimeout((function() {
                self.emit("timeout"), clearTimer();
            }), msecs);
        }
        function clearTimer() {
            clearTimeout(this._timeout), callback && self.removeListener("timeout", callback), 
            this.socket || self._currentRequest.removeListener("socket", startTimer);
        }
        return callback && this.on("timeout", callback), this.socket ? startTimer() : this._currentRequest.once("socket", startTimer), 
        this.once("response", clearTimer), this.once("error", clearTimer), this;
    }, [ "flushHeaders", "getHeader", "setNoDelay", "setSocketKeepAlive" ].forEach((function(method) {
        RedirectableRequest.prototype[method] = function(a, b) {
            return this._currentRequest[method](a, b);
        };
    })), [ "aborted", "connection", "socket" ].forEach((function(property) {
        Object.defineProperty(RedirectableRequest.prototype, property, {
            get: function() {
                return this._currentRequest[property];
            }
        });
    })), RedirectableRequest.prototype._sanitizeOptions = function(options) {
        if (options.headers || (options.headers = {}), options.host && (options.hostname || (options.hostname = options.host), 
        delete options.host), !options.pathname && options.path) {
            var searchPos = options.path.indexOf("?");
            searchPos < 0 ? options.pathname = options.path : (options.pathname = options.path.substring(0, searchPos), 
            options.search = options.path.substring(searchPos));
        }
    }, RedirectableRequest.prototype._performRequest = function() {
        var protocol = this._options.protocol, nativeProtocol = this._options.nativeProtocols[protocol];
        if (nativeProtocol) {
            if (this._options.agents) {
                var scheme = protocol.substr(0, protocol.length - 1);
                this._options.agent = this._options.agents[scheme];
            }
            var request = this._currentRequest = nativeProtocol.request(this._options, this._onNativeResponse);
            for (var event in this._currentUrl = url.format(this._options), request._redirectable = this, 
            eventHandlers) event && request.on(event, eventHandlers[event]);
            if (this._isRedirect) {
                var i = 0, self = this, buffers = this._requestBodyBuffers;
                !(function writeNext(error) {
                    if (request === self._currentRequest) if (error) self.emit("error", error); else if (i < buffers.length) {
                        var buffer = buffers[i++];
                        request.finished || request.write(buffer.data, buffer.encoding, writeNext);
                    } else self._ended && request.end();
                })();
            }
        } else this.emit("error", new TypeError("Unsupported protocol " + protocol));
    }, RedirectableRequest.prototype._processResponse = function(response) {
        var statusCode = response.statusCode;
        this._options.trackRedirects && this._redirects.push({
            url: this._currentUrl,
            headers: response.headers,
            statusCode: statusCode
        });
        var location = response.headers.location;
        if (location && !1 !== this._options.followRedirects && statusCode >= 300 && statusCode < 400) {
            if (this._currentRequest.removeAllListeners(), this._currentRequest.on("error", noop), 
            this._currentRequest.abort(), response.destroy(), ++this._redirectCount > this._options.maxRedirects) return void this.emit("error", new TooManyRedirectsError);
            ((301 === statusCode || 302 === statusCode) && "POST" === this._options.method || 303 === statusCode && !/^(?:GET|HEAD)$/.test(this._options.method)) && (this._options.method = "GET", 
            this._requestBodyBuffers = [], removeMatchingHeaders(/^content-/i, this._options.headers));
            var previousHostName = removeMatchingHeaders(/^host$/i, this._options.headers) || url.parse(this._currentUrl).hostname, redirectUrl = url.resolve(this._currentUrl, location);
            debug("redirecting to", redirectUrl), this._isRedirect = !0;
            var redirectUrlParts = url.parse(redirectUrl);
            if (Object.assign(this._options, redirectUrlParts), redirectUrlParts.hostname !== previousHostName && removeMatchingHeaders(/^authorization$/i, this._options.headers), 
            "function" == typeof this._options.beforeRedirect) {
                var responseDetails = {
                    headers: response.headers
                };
                try {
                    this._options.beforeRedirect.call(null, this._options, responseDetails);
                } catch (err) {
                    return void this.emit("error", err);
                }
                this._sanitizeOptions(this._options);
            }
            try {
                this._performRequest();
            } catch (cause) {
                var error = new RedirectionError("Redirected request failed: " + cause.message);
                error.cause = cause, this.emit("error", error);
            }
        } else response.responseUrl = this._currentUrl, response.redirects = this._redirects, 
        this.emit("response", response), this._requestBodyBuffers = [];
    }, module.exports = wrap({
        http: http,
        https: https
    }), module.exports.wrap = wrap;
}
