function(module, exports, __webpack_require__) {
    var url = __webpack_require__(7), URL = url.URL, http = __webpack_require__(11), https = __webpack_require__(22), Writable = __webpack_require__(3).Writable, assert = __webpack_require__(24), debug = __webpack_require__(820), useNativeURL = !1;
    try {
        assert(new URL);
    } catch (error) {
        useNativeURL = "ERR_INVALID_URL" === error.code;
    }
    var preservedUrlFields = [ "auth", "host", "hostname", "href", "path", "pathname", "port", "protocol", "query", "search", "hash" ], events = [ "abort", "aborted", "connect", "error", "socket", "timeout" ], eventHandlers = Object.create(null);
    events.forEach((function(event) {
        eventHandlers[event] = function(arg1, arg2, arg3) {
            this._redirectable.emit(event, arg1, arg2, arg3);
        };
    }));
    var InvalidUrlError = createErrorType("ERR_INVALID_URL", "Invalid URL", TypeError), RedirectionError = createErrorType("ERR_FR_REDIRECTION_FAILURE", "Redirected request failed"), TooManyRedirectsError = createErrorType("ERR_FR_TOO_MANY_REDIRECTS", "Maximum number of redirects exceeded", RedirectionError), MaxBodyLengthExceededError = createErrorType("ERR_FR_MAX_BODY_LENGTH_EXCEEDED", "Request body larger than maxBodyLength limit"), WriteAfterEndError = createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end"), destroy = Writable.prototype.destroy || noop;
    function RedirectableRequest(options, responseCallback) {
        Writable.call(this), this._sanitizeOptions(options), this._options = options, this._ended = !1, 
        this._ending = !1, this._redirectCount = 0, this._redirects = [], this._requestBodyLength = 0, 
        this._requestBodyBuffers = [], responseCallback && this.on("response", responseCallback);
        var self = this;
        this._onNativeResponse = function(response) {
            try {
                self._processResponse(response);
            } catch (cause) {
                self.emit("error", cause instanceof RedirectionError ? cause : new RedirectionError({
                    cause: cause
                }));
            }
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
                        return (function(value) {
                            return URL && value instanceof URL;
                        })(input) ? input = spreadUrlObject(input) : isString(input) ? input = spreadUrlObject(parseUrl(input)) : (callback = options, 
                        options = validateUrl(input), input = {
                            protocol: protocol
                        }), isFunction(options) && (callback = options, options = null), (options = Object.assign({
                            maxRedirects: exports.maxRedirects,
                            maxBodyLength: exports.maxBodyLength
                        }, input, options)).nativeProtocols = nativeProtocols, isString(options.host) || isString(options.hostname) || (options.hostname = "::1"), 
                        assert.equal(options.protocol, protocol, "protocol mismatch"), debug("options", options), 
                        new RedirectableRequest(options, callback);
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
    function parseUrl(input) {
        var parsed;
        if (useNativeURL) parsed = new URL(input); else if (!isString((parsed = validateUrl(url.parse(input))).protocol)) throw new InvalidUrlError({
            input: input
        });
        return parsed;
    }
    function validateUrl(input) {
        if (/^\[/.test(input.hostname) && !/^\[[:0-9a-f]+\]$/i.test(input.hostname)) throw new InvalidUrlError({
            input: input.href || input
        });
        if (/^\[/.test(input.host) && !/^\[[:0-9a-f]+\](:\d+)?$/i.test(input.host)) throw new InvalidUrlError({
            input: input.href || input
        });
        return input;
    }
    function spreadUrlObject(urlObject, target) {
        var spread = target || {};
        for (var key of preservedUrlFields) spread[key] = urlObject[key];
        return spread.hostname.startsWith("[") && (spread.hostname = spread.hostname.slice(1, -1)), 
        "" !== spread.port && (spread.port = Number(spread.port)), spread.path = spread.search ? spread.pathname + spread.search : spread.pathname, 
        spread;
    }
    function removeMatchingHeaders(regex, headers) {
        var lastValue;
        for (var header in headers) regex.test(header) && (lastValue = headers[header], 
        delete headers[header]);
        return null == lastValue ? void 0 : String(lastValue).trim();
    }
    function createErrorType(code, message, baseClass) {
        function CustomError(properties) {
            Error.captureStackTrace(this, this.constructor), Object.assign(this, properties || {}), 
            this.code = code, this.message = this.cause ? message + ": " + this.cause.message : message;
        }
        return CustomError.prototype = new (baseClass || Error), Object.defineProperties(CustomError.prototype, {
            constructor: {
                value: CustomError,
                enumerable: !1
            },
            name: {
                value: "Error [" + code + "]",
                enumerable: !1
            }
        }), CustomError;
    }
    function destroyRequest(request, error) {
        for (var event of events) request.removeListener(event, eventHandlers[event]);
        request.on("error", noop), request.destroy(error);
    }
    function isString(value) {
        return "string" == typeof value || value instanceof String;
    }
    function isFunction(value) {
        return "function" == typeof value;
    }
    RedirectableRequest.prototype = Object.create(Writable.prototype), RedirectableRequest.prototype.abort = function() {
        destroyRequest(this._currentRequest), this._currentRequest.abort(), this.emit("abort");
    }, RedirectableRequest.prototype.destroy = function(error) {
        return destroyRequest(this._currentRequest, error), destroy.call(this, error), this;
    }, RedirectableRequest.prototype.write = function(data, encoding, callback) {
        if (this._ending) throw new WriteAfterEndError;
        if (!isString(data) && !(function(value) {
            return "object" == typeof value && "length" in value;
        })(data)) throw new TypeError("data should be a string, Buffer or Uint8Array");
        isFunction(encoding) && (callback = encoding, encoding = null), 0 !== data.length ? this._requestBodyLength + data.length <= this._options.maxBodyLength ? (this._requestBodyLength += data.length, 
        this._requestBodyBuffers.push({
            data: data,
            encoding: encoding
        }), this._currentRequest.write(data, encoding, callback)) : (this.emit("error", new MaxBodyLengthExceededError), 
        this.abort()) : callback && callback();
    }, RedirectableRequest.prototype.end = function(data, encoding, callback) {
        if (isFunction(data) ? (callback = data, data = encoding = null) : isFunction(encoding) && (callback = encoding, 
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
        function destroyOnTimeout(socket) {
            socket.setTimeout(msecs), socket.removeListener("timeout", socket.destroy), socket.addListener("timeout", socket.destroy);
        }
        function startTimer(socket) {
            self._timeout && clearTimeout(self._timeout), self._timeout = setTimeout((function() {
                self.emit("timeout"), clearTimer();
            }), msecs), destroyOnTimeout(socket);
        }
        function clearTimer() {
            self._timeout && (clearTimeout(self._timeout), self._timeout = null), self.removeListener("abort", clearTimer), 
            self.removeListener("error", clearTimer), self.removeListener("response", clearTimer), 
            self.removeListener("close", clearTimer), callback && self.removeListener("timeout", callback), 
            self.socket || self._currentRequest.removeListener("socket", startTimer);
        }
        return callback && this.on("timeout", callback), this.socket ? startTimer(this.socket) : this._currentRequest.once("socket", startTimer), 
        this.on("socket", destroyOnTimeout), this.on("abort", clearTimer), this.on("error", clearTimer), 
        this.on("response", clearTimer), this.on("close", clearTimer), this;
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
        if (!nativeProtocol) throw new TypeError("Unsupported protocol " + protocol);
        if (this._options.agents) {
            var scheme = protocol.slice(0, -1);
            this._options.agent = this._options.agents[scheme];
        }
        var request = this._currentRequest = nativeProtocol.request(this._options, this._onNativeResponse);
        for (var event of (request._redirectable = this, events)) request.on(event, eventHandlers[event]);
        if (this._currentUrl = /^\//.test(this._options.path) ? url.format(this._options) : this._options.path, 
        this._isRedirect) {
            var i = 0, self = this, buffers = this._requestBodyBuffers;
            !(function writeNext(error) {
                if (request === self._currentRequest) if (error) self.emit("error", error); else if (i < buffers.length) {
                    var buffer = buffers[i++];
                    request.finished || request.write(buffer.data, buffer.encoding, writeNext);
                } else self._ended && request.end();
            })();
        }
    }, RedirectableRequest.prototype._processResponse = function(response) {
        var statusCode = response.statusCode;
        this._options.trackRedirects && this._redirects.push({
            url: this._currentUrl,
            headers: response.headers,
            statusCode: statusCode
        });
        var requestHeaders, location = response.headers.location;
        if (!location || !1 === this._options.followRedirects || statusCode < 300 || statusCode >= 400) return response.responseUrl = this._currentUrl, 
        response.redirects = this._redirects, this.emit("response", response), void (this._requestBodyBuffers = []);
        if (destroyRequest(this._currentRequest), response.destroy(), ++this._redirectCount > this._options.maxRedirects) throw new TooManyRedirectsError;
        var beforeRedirect = this._options.beforeRedirect;
        beforeRedirect && (requestHeaders = Object.assign({
            Host: response.req.getHeader("host")
        }, this._options.headers));
        var method = this._options.method;
        ((301 === statusCode || 302 === statusCode) && "POST" === this._options.method || 303 === statusCode && !/^(?:GET|HEAD)$/.test(this._options.method)) && (this._options.method = "GET", 
        this._requestBodyBuffers = [], removeMatchingHeaders(/^content-/i, this._options.headers));
        var relative, base, currentHostHeader = removeMatchingHeaders(/^host$/i, this._options.headers), currentUrlParts = parseUrl(this._currentUrl), currentHost = currentHostHeader || currentUrlParts.host, currentUrl = /^\w+:/.test(location) ? this._currentUrl : url.format(Object.assign(currentUrlParts, {
            host: currentHost
        })), redirectUrl = (relative = location, base = currentUrl, useNativeURL ? new URL(relative, base) : parseUrl(url.resolve(base, relative)));
        if (debug("redirecting to", redirectUrl.href), this._isRedirect = !0, spreadUrlObject(redirectUrl, this._options), 
        (redirectUrl.protocol !== currentUrlParts.protocol && "https:" !== redirectUrl.protocol || redirectUrl.host !== currentHost && !(function(subdomain, domain) {
            assert(isString(subdomain) && isString(domain));
            var dot = subdomain.length - domain.length - 1;
            return dot > 0 && "." === subdomain[dot] && subdomain.endsWith(domain);
        })(redirectUrl.host, currentHost)) && removeMatchingHeaders(/^(?:authorization|cookie)$/i, this._options.headers), 
        isFunction(beforeRedirect)) {
            var responseDetails = {
                headers: response.headers,
                statusCode: statusCode
            }, requestDetails = {
                url: currentUrl,
                method: method,
                headers: requestHeaders
            };
            beforeRedirect(this._options, responseDetails, requestDetails), this._sanitizeOptions(this._options);
        }
        this._performRequest();
    }, module.exports = wrap({
        http: http,
        https: https
    }), module.exports.wrap = wrap;
}
