function(module, exports, __webpack_require__) {
    "use strict";
    var encodeUrl = __webpack_require__(83), escapeHtml = __webpack_require__(84), parseUrl = __webpack_require__(46), resolve = __webpack_require__(4).resolve, send = __webpack_require__(225), url = __webpack_require__(7);
    module.exports = function(root, options) {
        if (!root) throw new TypeError("root path required");
        if ("string" != typeof root) throw new TypeError("root path must be a string");
        var opts = Object.create(options || null), fallthrough = !1 !== opts.fallthrough, redirect = !1 !== opts.redirect, setHeaders = opts.setHeaders;
        if (setHeaders && "function" != typeof setHeaders) throw new TypeError("option setHeaders must be function");
        opts.maxage = opts.maxage || opts.maxAge || 0, opts.root = resolve(root);
        var onDirectory = redirect ? function(res) {
            if (this.hasTrailingSlash()) this.error(404); else {
                var originalUrl = parseUrl.original(this.req);
                originalUrl.path = null, originalUrl.pathname = (function(str) {
                    for (var i = 0; i < str.length && 47 === str.charCodeAt(i); i++) ;
                    return i > 1 ? "/" + str.substr(i) : str;
                })(originalUrl.pathname + "/");
                var loc = encodeUrl(url.format(originalUrl)), doc = ("Redirecting", '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Redirecting</title>\n</head>\n<body>\n<pre>' + ('Redirecting to <a href="' + escapeHtml(loc) + '">' + escapeHtml(loc) + "</a>") + "</pre>\n</body>\n</html>\n");
                res.statusCode = 301, res.setHeader("Content-Type", "text/html; charset=UTF-8"), 
                res.setHeader("Content-Length", Buffer.byteLength(doc)), res.setHeader("Content-Security-Policy", "default-src 'none'"), 
                res.setHeader("X-Content-Type-Options", "nosniff"), res.setHeader("Location", loc), 
                res.end(doc);
            }
        } : function() {
            this.error(404);
        };
        return function(req, res, next) {
            if ("GET" !== req.method && "HEAD" !== req.method) return fallthrough ? next() : (res.statusCode = 405, 
            res.setHeader("Allow", "GET, HEAD"), res.setHeader("Content-Length", "0"), void res.end());
            var forwardError = !fallthrough, originalUrl = parseUrl.original(req), path = parseUrl(req).pathname;
            "/" === path && "/" !== originalUrl.pathname.substr(-1) && (path = "");
            var stream = send(req, path, opts);
            stream.on("directory", onDirectory), setHeaders && stream.on("headers", setHeaders), 
            fallthrough && stream.on("file", (function() {
                forwardError = !0;
            })), stream.on("error", (function(err) {
                !forwardError && err.statusCode < 500 ? next() : next(err);
            })), stream.pipe(res);
        };
    }, module.exports.mime = send.mime;
}
