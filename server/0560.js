function(module, exports, __webpack_require__) {
    "use strict";
    var bytes = __webpack_require__(86), contentType = __webpack_require__(107), createError = __webpack_require__(87), debug = __webpack_require__(8)("body-parser:urlencoded"), deprecate = __webpack_require__(47)("body-parser"), read = __webpack_require__(110), typeis = __webpack_require__(88);
    module.exports = function(options) {
        var opts = options || {};
        void 0 === opts.extended && deprecate("undefined extended: provide extended option");
        var extended = !1 !== opts.extended, inflate = !1 !== opts.inflate, limit = "number" != typeof opts.limit ? bytes.parse(opts.limit || "100kb") : opts.limit, type = opts.type || "application/x-www-form-urlencoded", verify = opts.verify || !1;
        if (!1 !== verify && "function" != typeof verify) throw new TypeError("option verify must be function");
        var queryparse = extended ? (function(options) {
            var parameterLimit = void 0 !== options.parameterLimit ? options.parameterLimit : 1e3, parse = parser("qs");
            if (isNaN(parameterLimit) || parameterLimit < 1) throw new TypeError("option parameterLimit must be a positive number");
            return isFinite(parameterLimit) && (parameterLimit |= 0), function(body) {
                var paramCount = parameterCount(body, parameterLimit);
                if (void 0 === paramCount) throw debug("too many parameters"), createError(413, "too many parameters", {
                    type: "parameters.too.many"
                });
                var arrayLimit = Math.max(100, paramCount);
                return debug("parse extended urlencoding"), parse(body, {
                    allowPrototypes: !0,
                    arrayLimit: arrayLimit,
                    depth: 1 / 0,
                    parameterLimit: parameterLimit
                });
            };
        })(opts) : (function(options) {
            var parameterLimit = void 0 !== options.parameterLimit ? options.parameterLimit : 1e3, parse = parser("querystring");
            if (isNaN(parameterLimit) || parameterLimit < 1) throw new TypeError("option parameterLimit must be a positive number");
            return isFinite(parameterLimit) && (parameterLimit |= 0), function(body) {
                if (void 0 === parameterCount(body, parameterLimit)) throw debug("too many parameters"), 
                createError(413, "too many parameters", {
                    type: "parameters.too.many"
                });
                return debug("parse urlencoding"), parse(body, void 0, void 0, {
                    maxKeys: parameterLimit
                });
            };
        })(opts), shouldParse = "function" != typeof type ? (function(type) {
            return function(req) {
                return Boolean(typeis(req, type));
            };
        })(type) : type;
        function parse(body) {
            return body.length ? queryparse(body) : {};
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
            if ("utf-8" !== charset) return debug("invalid charset"), void next(createError(415, 'unsupported charset "' + charset.toUpperCase() + '"', {
                charset: charset,
                type: "charset.unsupported"
            }));
            read(req, res, next, parse, debug, {
                debug: debug,
                encoding: charset,
                inflate: inflate,
                limit: limit,
                verify: verify
            });
        };
    };
    var parsers = Object.create(null);
    function parameterCount(body, limit) {
        for (var count = 0, index = 0; -1 !== (index = body.indexOf("&", index)); ) if (index++, 
        ++count === limit) return;
        return count;
    }
    function parser(name) {
        var mod = parsers[name];
        if (void 0 !== mod) return mod.parse;
        switch (name) {
          case "qs":
            mod = __webpack_require__(160);
            break;

          case "querystring":
            mod = __webpack_require__(28);
        }
        return parsers[name] = mod, mod.parse;
    }
}
