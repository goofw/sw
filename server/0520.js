function(module, exports, __webpack_require__) {
    "use strict";
    var iconvLite = __webpack_require__(68), Iconv = __webpack_require__(538);
    function convertIconvLite(str, to, from) {
        return "UTF-8" === to ? iconvLite.decode(str, from) : "UTF-8" === from ? iconvLite.encode(str, to) : iconvLite.encode(iconvLite.decode(str, from), to);
    }
    function checkEncoding(name) {
        return (name || "").toString().trim().replace(/^latin[\-_]?(\d+)$/i, "ISO-8859-$1").replace(/^win(?:dows)?[\-_]?(\d+)$/i, "WINDOWS-$1").replace(/^utf[\-_]?(\d+)$/i, "UTF-$1").replace(/^ks_c_5601\-1987$/i, "CP949").replace(/^us[\-_]?ascii$/i, "ASCII").toUpperCase();
    }
    module.exports.convert = function(str, to, from, useLite) {
        var result;
        if (from = checkEncoding(from || "UTF-8"), to = checkEncoding(to || "UTF-8"), str = str || "", 
        "UTF-8" !== from && "string" == typeof str && (str = new Buffer(str, "binary")), 
        from === to) result = "string" == typeof str ? new Buffer(str) : str; else if (Iconv && !useLite) try {
            result = (function(str, to, from) {
                var response;
                return (response = new Iconv(from, to + "//TRANSLIT//IGNORE").convert(str)).slice(0, response.length);
            })(str, to, from);
        } catch (E) {
            console.error(E);
            try {
                result = convertIconvLite(str, to, from);
            } catch (E) {
                console.error(E), result = str;
            }
        } else try {
            result = convertIconvLite(str, to, from);
        } catch (E) {
            console.error(E), result = str;
        }
        return "string" == typeof result && (result = new Buffer(result, "utf-8")), result;
    };
}
