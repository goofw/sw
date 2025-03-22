function(module, exports, __webpack_require__) {
    !(function() {
        "use strict";
        var assign = __webpack_require__(993), vary = __webpack_require__(464), defaults = {
            origin: "*",
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
            preflightContinue: !1,
            optionsSuccessStatus: 204
        };
        function isString(s) {
            return "string" == typeof s || s instanceof String;
        }
        function isOriginAllowed(origin, allowedOrigin) {
            if (Array.isArray(allowedOrigin)) {
                for (var i = 0; i < allowedOrigin.length; ++i) if (isOriginAllowed(origin, allowedOrigin[i])) return !0;
                return !1;
            }
            return isString(allowedOrigin) ? origin === allowedOrigin : allowedOrigin instanceof RegExp ? allowedOrigin.test(origin) : !!allowedOrigin;
        }
        function configureOrigin(options, req) {
            var isAllowed, requestOrigin = req.headers.origin, headers = [];
            return options.origin && "*" !== options.origin ? isString(options.origin) ? (headers.push([ {
                key: "Access-Control-Allow-Origin",
                value: options.origin
            } ]), headers.push([ {
                key: "Vary",
                value: "Origin"
            } ])) : (isAllowed = isOriginAllowed(requestOrigin, options.origin), headers.push([ {
                key: "Access-Control-Allow-Origin",
                value: !!isAllowed && requestOrigin
            } ]), headers.push([ {
                key: "Vary",
                value: "Origin"
            } ])) : headers.push([ {
                key: "Access-Control-Allow-Origin",
                value: "*"
            } ]), headers;
        }
        function configureCredentials(options) {
            return !0 === options.credentials ? {
                key: "Access-Control-Allow-Credentials",
                value: "true"
            } : null;
        }
        function configureExposedHeaders(options) {
            var headers = options.exposedHeaders;
            return headers ? (headers.join && (headers = headers.join(",")), headers && headers.length ? {
                key: "Access-Control-Expose-Headers",
                value: headers
            } : null) : null;
        }
        function applyHeaders(headers, res) {
            for (var i = 0, n = headers.length; i < n; i++) {
                var header = headers[i];
                header && (Array.isArray(header) ? applyHeaders(header, res) : "Vary" === header.key && header.value ? vary(res, header.value) : header.value && res.setHeader(header.key, header.value));
            }
        }
        module.exports = function(o) {
            var optionsCallback = null;
            return optionsCallback = "function" == typeof o ? o : function(req, cb) {
                cb(null, o);
            }, function(req, res, next) {
                optionsCallback(req, (function(err, options) {
                    if (err) next(err); else {
                        var corsOptions = assign({}, defaults, options), originCallback = null;
                        corsOptions.origin && "function" == typeof corsOptions.origin ? originCallback = corsOptions.origin : corsOptions.origin && (originCallback = function(origin, cb) {
                            cb(null, corsOptions.origin);
                        }), originCallback ? originCallback(req.headers.origin, (function(err2, origin) {
                            err2 || !origin ? next(err2) : (corsOptions.origin = origin, (function(options, req, res, next) {
                                var headers = [];
                                "OPTIONS" === (req.method && req.method.toUpperCase && req.method.toUpperCase()) ? (headers.push(configureOrigin(options, req)), 
                                headers.push(configureCredentials(options)), headers.push((function(options) {
                                    var methods = options.methods;
                                    return methods.join && (methods = options.methods.join(",")), {
                                        key: "Access-Control-Allow-Methods",
                                        value: methods
                                    };
                                })(options)), headers.push((function(options, req) {
                                    var allowedHeaders = options.allowedHeaders || options.headers, headers = [];
                                    return allowedHeaders ? allowedHeaders.join && (allowedHeaders = allowedHeaders.join(",")) : (allowedHeaders = req.headers["access-control-request-headers"], 
                                    headers.push([ {
                                        key: "Vary",
                                        value: "Access-Control-Request-Headers"
                                    } ])), allowedHeaders && allowedHeaders.length && headers.push([ {
                                        key: "Access-Control-Allow-Headers",
                                        value: allowedHeaders
                                    } ]), headers;
                                })(options, req)), headers.push((function(options) {
                                    var maxAge = ("number" == typeof options.maxAge || options.maxAge) && options.maxAge.toString();
                                    return maxAge && maxAge.length ? {
                                        key: "Access-Control-Max-Age",
                                        value: maxAge
                                    } : null;
                                })(options)), headers.push(configureExposedHeaders(options)), applyHeaders(headers, res), 
                                options.preflightContinue ? next() : (res.statusCode = options.optionsSuccessStatus, 
                                res.setHeader("Content-Length", "0"), res.end())) : (headers.push(configureOrigin(options, req)), 
                                headers.push(configureCredentials(options)), headers.push(configureExposedHeaders(options)), 
                                applyHeaders(headers, res), next());
                            })(corsOptions, req, res, next));
                        })) : next();
                    }
                }));
            };
        };
    })();
}
