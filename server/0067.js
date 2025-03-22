function(module, exports, __webpack_require__) {
    "use strict";
    var Buffer = __webpack_require__(23).Buffer, contentDisposition = __webpack_require__(460), contentType = __webpack_require__(107), deprecate = __webpack_require__(47)("express"), flatten = __webpack_require__(149), mime = __webpack_require__(225).mime, etag = __webpack_require__(461), proxyaddr = __webpack_require__(463), qs = __webpack_require__(160), querystring = __webpack_require__(28);
    function createETagGenerator(options) {
        return function(body, encoding) {
            var buf = Buffer.isBuffer(body) ? body : Buffer.from(body, encoding);
            return etag(buf, options);
        };
    }
    function parseExtendedQueryString(str) {
        return qs.parse(str, {
            allowPrototypes: !0
        });
    }
    function newObject() {
        return {};
    }
    exports.etag = createETagGenerator({
        weak: !1
    }), exports.wetag = createETagGenerator({
        weak: !0
    }), exports.isAbsolute = function(path) {
        return "/" === path[0] || ":" === path[1] && ("\\" === path[2] || "/" === path[2]) || "\\\\" === path.substring(0, 2) || void 0;
    }, exports.flatten = deprecate.function(flatten, "utils.flatten: use array-flatten npm module instead"), 
    exports.normalizeType = function(type) {
        return ~type.indexOf("/") ? (function(str, index) {
            for (var parts = str.split(/ *; */), ret = {
                value: parts[0],
                quality: 1,
                params: {},
                originalIndex: void 0
            }, i = 1; i < parts.length; ++i) {
                var pms = parts[i].split(/ *= */);
                "q" === pms[0] ? ret.quality = parseFloat(pms[1]) : ret.params[pms[0]] = pms[1];
            }
            return ret;
        })(type) : {
            value: mime.lookup(type),
            params: {}
        };
    }, exports.normalizeTypes = function(types) {
        for (var ret = [], i = 0; i < types.length; ++i) ret.push(exports.normalizeType(types[i]));
        return ret;
    }, exports.contentDisposition = deprecate.function(contentDisposition, "utils.contentDisposition: use content-disposition npm module instead"), 
    exports.compileETag = function(val) {
        var fn;
        if ("function" == typeof val) return val;
        switch (val) {
          case !0:
            fn = exports.wetag;
            break;

          case !1:
            break;

          case "strong":
            fn = exports.etag;
            break;

          case "weak":
            fn = exports.wetag;
            break;

          default:
            throw new TypeError("unknown value for etag function: " + val);
        }
        return fn;
    }, exports.compileQueryParser = function(val) {
        var fn;
        if ("function" == typeof val) return val;
        switch (val) {
          case !0:
            fn = querystring.parse;
            break;

          case !1:
            fn = newObject;
            break;

          case "extended":
            fn = parseExtendedQueryString;
            break;

          case "simple":
            fn = querystring.parse;
            break;

          default:
            throw new TypeError("unknown value for query parser function: " + val);
        }
        return fn;
    }, exports.compileTrust = function(val) {
        return "function" == typeof val ? val : !0 === val ? function() {
            return !0;
        } : "number" == typeof val ? function(a, i) {
            return i < val;
        } : ("string" == typeof val && (val = val.split(/ *, */)), proxyaddr.compile(val || []));
    }, exports.setCharset = function(type, charset) {
        if (!type || !charset) return type;
        var parsed = contentType.parse(type);
        return parsed.parameters.charset = charset, contentType.format(parsed);
    };
}
