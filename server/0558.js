function(module, exports, __webpack_require__) {
    "use strict";
    var bytes = __webpack_require__(86), debug = __webpack_require__(8)("body-parser:raw"), read = __webpack_require__(110), typeis = __webpack_require__(88);
    module.exports = function(options) {
        var opts = options || {}, inflate = !1 !== opts.inflate, limit = "number" != typeof opts.limit ? bytes.parse(opts.limit || "100kb") : opts.limit, type = opts.type || "application/octet-stream", verify = opts.verify || !1;
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
            return req._body ? (debug("body already parsed"), void next()) : (req.body = req.body || {}, 
            typeis.hasBody(req) ? (debug("content-type %j", req.headers["content-type"]), shouldParse(req) ? void read(req, res, next, parse, debug, {
                encoding: null,
                inflate: inflate,
                limit: limit,
                verify: verify
            }) : (debug("skip parsing"), void next())) : (debug("skip empty body"), void next()));
        };
    };
}
