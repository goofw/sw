function(module, exports, __webpack_require__) {
    var unescape = __webpack_require__(28).unescape;
    const COOKIE_PAIR = /^([^=\s]+)\s*=\s*("?)\s*(.*)\s*\2\s*$/, EXCLUDED_CHARS = /[\x00-\x1F\x7F\x3B\x3B\s\"\,\\"%]/g;
    function encodeCookieComponent(str) {
        return str.toString().replace(EXCLUDED_CHARS, encodeURIComponent);
    }
    exports.read = function(header) {
        return header ? (header = header instanceof Array ? header : [ header ]).reduce((function(res, str) {
            var cookie = (function(str) {
                str = (function(str) {
                    var index = str.indexOf(";");
                    return -1 === index ? str : str.substr(0, index);
                })(str = (function(str) {
                    return str.trim().replace(/\x3B+$/, "");
                })(str));
                var res = COOKIE_PAIR.exec(str);
                return res && res[3] ? {
                    name: unescape(res[1]),
                    value: unescape(res[3])
                } : null;
            })(str);
            return cookie && (res[cookie.name] = cookie.value), res;
        }), {}) : {};
    }, exports.write = function(obj) {
        return Object.keys(obj).reduce((function(str, name) {
            return str + (str ? "; " : "") + encodeCookieComponent(name) + "=" + encodeCookieComponent(obj[name]);
        }), "");
    };
}
