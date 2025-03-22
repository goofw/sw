function(module, exports, __webpack_require__) {
    "use strict";
    var bytes = __webpack_require__(86), contentType = __webpack_require__(107), debug = __webpack_require__(8)("body-parser:text"), read = __webpack_require__(110), typeis = __webpack_require__(88);
    module.exports = function(options) {
        var opts = options || {}, defaultCharset = opts.defaultCharset || "utf-8", inflate = !1 !== opts.inflate, limit = "number" != typeof opts.limit ? bytes.parse(opts.limit || "100kb") : opts.limit, type = opts.type || "text/plain", verify = opts.verify || !1;
        if (!1 !== verify && "function" != typeof verify) throw new TypeError("option verify must be function");
        var shouldParse = "function" != typeof type ? (function(type) {
            return function(req) {
                return Boolean(typeis(req, type));
            };
        })(type) : type;
        function parse(buf) {
            return buf;
        }
        return function(req, res, next) {
            if (req._body) return debug("body already parsed"), void next();
            if (req.body = req.body || {}, !typeis.hasBody(req)) return debug("skip empty body"), 
            void next();
            if (debug("content-type %j", req.headers["content-type"]), !shouldParse(req)) return debug("skip parsing"), 
            void next();
            var charset = (function(req) {
                try {
                    return (contentType.parse(req).parameters.charset || "").toLowerCase();
                } catch (e) {
                    return;
                }
            })(req) || defaultCharset;
            read(req, res, next, parse, debug, {
                encoding: charset,
                inflate: inflate,
                limit: limit,
                verify: verify
            });
        };
    };
}
