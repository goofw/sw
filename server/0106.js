function(module, exports, __webpack_require__) {
    "use strict";
    var deprecate = __webpack_require__(47)("body-parser"), parsers = Object.create(null);
    function createParserGetter(name) {
        return function() {
            return (function(parserName) {
                var parser = parsers[parserName];
                if (void 0 !== parser) return parser;
                switch (parserName) {
                  case "json":
                    parser = __webpack_require__(550);
                    break;

                  case "raw":
                    parser = __webpack_require__(558);
                    break;

                  case "text":
                    parser = __webpack_require__(559);
                    break;

                  case "urlencoded":
                    parser = __webpack_require__(560);
                }
                return parsers[parserName] = parser;
            })(name);
        };
    }
    exports = module.exports = deprecate.function((function(options) {
        var opts = {};
        if (options) for (var prop in options) "type" !== prop && (opts[prop] = options[prop]);
        var _urlencoded = exports.urlencoded(opts), _json = exports.json(opts);
        return function(req, res, next) {
            _json(req, res, (function(err) {
                if (err) return next(err);
                _urlencoded(req, res, next);
            }));
        };
    }), "bodyParser: use individual json/urlencoded middlewares"), Object.defineProperty(exports, "json", {
        configurable: !0,
        enumerable: !0,
        get: createParserGetter("json")
    }), Object.defineProperty(exports, "raw", {
        configurable: !0,
        enumerable: !0,
        get: createParserGetter("raw")
    }), Object.defineProperty(exports, "text", {
        configurable: !0,
        enumerable: !0,
        get: createParserGetter("text")
    }), Object.defineProperty(exports, "urlencoded", {
        configurable: !0,
        enumerable: !0,
        get: createParserGetter("urlencoded")
    });
}
