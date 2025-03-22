function(module, exports, __webpack_require__) {
    "use strict";
    exports.parse = function(str, options) {
        if ("string" != typeof str) throw new TypeError("argument str must be a string");
        for (var obj = {}, opt = options || {}, pairs = str.split(pairSplitRegExp), dec = opt.decode || decode, i = 0; i < pairs.length; i++) {
            var pair = pairs[i], eq_idx = pair.indexOf("=");
            if (!(eq_idx < 0)) {
                var key = pair.substr(0, eq_idx).trim(), val = pair.substr(++eq_idx, pair.length).trim();
                '"' == val[0] && (val = val.slice(1, -1)), null == obj[key] && (obj[key] = tryDecode(val, dec));
            }
        }
        return obj;
    }, exports.serialize = function(name, val, options) {
        var opt = options || {}, enc = opt.encode || encode;
        if ("function" != typeof enc) throw new TypeError("option encode is invalid");
        if (!fieldContentRegExp.test(name)) throw new TypeError("argument name is invalid");
        var value = enc(val);
        if (value && !fieldContentRegExp.test(value)) throw new TypeError("argument val is invalid");
        var str = name + "=" + value;
        if (null != opt.maxAge) {
            var maxAge = opt.maxAge - 0;
            if (isNaN(maxAge)) throw new Error("maxAge should be a Number");
            str += "; Max-Age=" + Math.floor(maxAge);
        }
        if (opt.domain) {
            if (!fieldContentRegExp.test(opt.domain)) throw new TypeError("option domain is invalid");
            str += "; Domain=" + opt.domain;
        }
        if (opt.path) {
            if (!fieldContentRegExp.test(opt.path)) throw new TypeError("option path is invalid");
            str += "; Path=" + opt.path;
        }
        if (opt.expires) {
            if ("function" != typeof opt.expires.toUTCString) throw new TypeError("option expires is invalid");
            str += "; Expires=" + opt.expires.toUTCString();
        }
        if (opt.httpOnly && (str += "; HttpOnly"), opt.secure && (str += "; Secure"), opt.sameSite) switch ("string" == typeof opt.sameSite ? opt.sameSite.toLowerCase() : opt.sameSite) {
          case !0:
            str += "; SameSite=Strict";
            break;

          case "lax":
            str += "; SameSite=Lax";
            break;

          case "strict":
            str += "; SameSite=Strict";
            break;

          case "none":
            str += "; SameSite=None";
            break;

          default:
            throw new TypeError("option sameSite is invalid");
        }
        return str;
    };
    var decode = decodeURIComponent, encode = encodeURIComponent, pairSplitRegExp = /; */, fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
    function tryDecode(str, decode) {
        try {
            return decode(str);
        } catch (e) {
            return str;
        }
    }
}
