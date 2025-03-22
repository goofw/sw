function(module, exports, __webpack_require__) {
    "use strict";
    var CACHE_CONTROL_NO_CACHE_REGEXP = /(?:^|,)\s*?no-cache\s*?(?:,|$)/;
    function parseHttpDate(date) {
        var timestamp = date && Date.parse(date);
        return "number" == typeof timestamp ? timestamp : NaN;
    }
    module.exports = function(reqHeaders, resHeaders) {
        var modifiedSince = reqHeaders["if-modified-since"], noneMatch = reqHeaders["if-none-match"];
        if (!modifiedSince && !noneMatch) return !1;
        var cacheControl = reqHeaders["cache-control"];
        if (cacheControl && CACHE_CONTROL_NO_CACHE_REGEXP.test(cacheControl)) return !1;
        if (noneMatch && "*" !== noneMatch) {
            var etag = resHeaders.etag;
            if (!etag) return !1;
            for (var etagStale = !0, matches = (function(str) {
                for (var end = 0, list = [], start = 0, i = 0, len = str.length; i < len; i++) switch (str.charCodeAt(i)) {
                  case 32:
                    start === end && (start = end = i + 1);
                    break;

                  case 44:
                    list.push(str.substring(start, end)), start = end = i + 1;
                    break;

                  default:
                    end = i + 1;
                }
                return list.push(str.substring(start, end)), list;
            })(noneMatch), i = 0; i < matches.length; i++) {
                var match = matches[i];
                if (match === etag || match === "W/" + etag || "W/" + match === etag) {
                    etagStale = !1;
                    break;
                }
            }
            if (etagStale) return !1;
        }
        if (modifiedSince) {
            var lastModified = resHeaders["last-modified"];
            if (!(lastModified && parseHttpDate(lastModified) <= parseHttpDate(modifiedSince))) return !1;
        }
        return !0;
    };
}
