function(module, exports, __webpack_require__) {
    "use strict";
    var debug = __webpack_require__(8)("finalhandler"), encodeUrl = __webpack_require__(83), escapeHtml = __webpack_require__(84), onFinished = __webpack_require__(85), parseUrl = __webpack_require__(46), statuses = __webpack_require__(546), unpipe = __webpack_require__(158), DOUBLE_SPACE_REGEXP = /\x20{2}/g, NEWLINE_REGEXP = /\n/g, defer = "function" == typeof setImmediate ? setImmediate : function(fn) {
        process.nextTick(fn.bind.apply(fn, arguments));
    }, isFinished = onFinished.isFinished;
    function headersSent(res) {
        return "boolean" != typeof res.headersSent ? Boolean(res._header) : res.headersSent;
    }
    module.exports = function(req, res, options) {
        var opts = options || {}, env = opts.env || "production", onerror = opts.onerror;
        return function(err) {
            var headers, msg, status;
            if (err || !headersSent(res)) {
                if (err ? (status = (function(err) {
                    return "number" == typeof err.status && err.status >= 400 && err.status < 600 ? err.status : "number" == typeof err.statusCode && err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : void 0;
                })(err), void 0 !== status && (headers = (function(err) {
                    if (err.headers && "object" == typeof err.headers) {
                        for (var headers = Object.create(null), keys = Object.keys(err.headers), i = 0; i < keys.length; i++) {
                            var key = keys[i];
                            headers[key] = err.headers[key];
                        }
                        return headers;
                    }
                })(err)), void 0 === status && (status = (function(res) {
                    var status = res.statusCode;
                    return ("number" != typeof status || status < 400 || status > 599) && (status = 500), 
                    status;
                })(res)), msg = (function(err, status, env) {
                    var msg;
                    return "production" !== env && ((msg = err.stack) || "function" != typeof err.toString || (msg = err.toString())), 
                    msg || statuses[status];
                })(err, status, env)) : (status = 404, msg = "Cannot " + req.method + " " + encodeUrl(parseUrl.original(req).pathname)), 
                debug("default %s", status), err && onerror && defer(onerror, err, req, res), headersSent(res)) return debug("cannot %d after headers sent", status), 
                void req.socket.destroy();
                !(function(req, res, status, headers, message) {
                    function write() {
                        var body = (function(message) {
                            return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Error</title>\n</head>\n<body>\n<pre>' + escapeHtml(message).replace(NEWLINE_REGEXP, "<br>").replace(DOUBLE_SPACE_REGEXP, " &nbsp;") + "</pre>\n</body>\n</html>\n";
                        })(message);
                        res.statusCode = status, res.statusMessage = statuses[status], (function(res, headers) {
                            if (headers) for (var keys = Object.keys(headers), i = 0; i < keys.length; i++) {
                                var key = keys[i];
                                res.setHeader(key, headers[key]);
                            }
                        })(res, headers), res.setHeader("Content-Security-Policy", "default-src 'self'"), 
                        res.setHeader("X-Content-Type-Options", "nosniff"), res.setHeader("Content-Type", "text/html; charset=utf-8"), 
                        res.setHeader("Content-Length", Buffer.byteLength(body, "utf8")), "HEAD" !== req.method ? res.end(body, "utf8") : res.end();
                    }
                    isFinished(req) ? write() : (unpipe(req), onFinished(req, write), req.resume());
                })(req, res, status, headers, msg);
            } else debug("cannot 404 after headers sent");
        };
    };
}
