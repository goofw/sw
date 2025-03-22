function(module, exports, __webpack_require__) {
    "use strict";
    var url = __webpack_require__(7), parse = url.parse, Url = url.Url;
    function parseurl(req) {
        var url = req.url;
        if (void 0 !== url) {
            var parsed = req._parsedUrl;
            return fresh(url, parsed) ? parsed : ((parsed = fastparse(url))._raw = url, req._parsedUrl = parsed);
        }
    }
    function fastparse(str) {
        if ("string" != typeof str || 47 !== str.charCodeAt(0)) return parse(str);
        for (var pathname = str, query = null, search = null, i = 1; i < str.length; i++) switch (str.charCodeAt(i)) {
          case 63:
            null === search && (pathname = str.substring(0, i), query = str.substring(i + 1), 
            search = str.substring(i));
            break;

          case 9:
          case 10:
          case 12:
          case 13:
          case 32:
          case 35:
          case 160:
          case 65279:
            return parse(str);
        }
        var url = void 0 !== Url ? new Url : {};
        return url.path = str, url.href = str, url.pathname = pathname, null !== search && (url.query = query, 
        url.search = search), url;
    }
    function fresh(url, parsedUrl) {
        return "object" == typeof parsedUrl && null !== parsedUrl && (void 0 === Url || parsedUrl instanceof Url) && parsedUrl._raw === url;
    }
    module.exports = parseurl, module.exports.original = function(req) {
        var url = req.originalUrl;
        if ("string" != typeof url) return parseurl(req);
        var parsed = req._parsedOriginalUrl;
        return fresh(url, parsed) ? parsed : ((parsed = fastparse(url))._raw = url, req._parsedOriginalUrl = parsed);
    };
}
