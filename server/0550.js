function(module, exports, __webpack_require__) {
    "use strict";
    var bytes = __webpack_require__(86), contentType = __webpack_require__(107), createError = __webpack_require__(87), debug = __webpack_require__(8)("body-parser:json"), read = __webpack_require__(110), typeis = __webpack_require__(88);
    module.exports = function(options) {
        var opts = options || {}, limit = "number" != typeof opts.limit ? bytes.parse(opts.limit || "100kb") : opts.limit, inflate = !1 !== opts.inflate, reviver = opts.reviver, strict = !1 !== opts.strict, type = opts.type || "application/json", verify = opts.verify || !1;
        if (!1 !== verify && "function" != typeof verify) throw new TypeError("option verify must be function");
        var shouldParse = "function" != typeof type ? (function(type) {
            return function(req) {
                return Boolean(typeis(req, type));
            };
        })(type) : type;
        function parse(body) {
            if (0 === body.length) return {};
            if (strict) {
                var first = (str = body, FIRST_CHAR_REGEXP.exec(str)[1]);
                if ("{" !== first && "[" !== first) throw debug("strict violation"), (function(str, char) {
                    var index = str.indexOf(char), partial = str.substring(0, index) + "#";
                    try {
                        throw JSON.parse(partial), new SyntaxError("strict violation");
                    } catch (e) {
                        return normalizeJsonSyntaxError(e, {
                            message: e.message.replace("#", char),
                            stack: e.stack
                        });
                    }
                })(body, first);
            }
            var str;
            try {
                return debug("parse json"), JSON.parse(body, reviver);
            } catch (e) {
                throw normalizeJsonSyntaxError(e, {
                    message: e.message,
                    stack: e.stack
                });
            }
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
            })(req) || "utf-8";
            if ("utf-" !== charset.substr(0, 4)) return debug("invalid charset"), void next(createError(415, 'unsupported charset "' + charset.toUpperCase() + '"', {
                charset: charset,
                type: "charset.unsupported"
            }));
            read(req, res, next, parse, debug, {
                encoding: charset,
                inflate: inflate,
                limit: limit,
                verify: verify
            });
        };
    };
    var FIRST_CHAR_REGEXP = /^[\x20\x09\x0a\x0d]*(.)/;
    function normalizeJsonSyntaxError(error, obj) {
        for (var keys = Object.getOwnPropertyNames(error), i = 0; i < keys.length; i++) {
            var key = keys[i];
            "stack" !== key && "message" !== key && delete error[key];
        }
        return error.stack = obj.stack.replace(error.message, obj.message), error.message = obj.message, 
        error;
    }
}
