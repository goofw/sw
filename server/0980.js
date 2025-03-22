function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(req) {
        if (!req) throw new TypeError("argument req is required");
        var proxyAddrs = (function(header) {
            for (var end = header.length, list = [], start = header.length, i = header.length - 1; i >= 0; i--) switch (header.charCodeAt(i)) {
              case 32:
                start === end && (start = end = i);
                break;

              case 44:
                start !== end && list.push(header.substring(start, end)), start = end = i;
                break;

              default:
                start = i;
            }
            return start !== end && list.push(header.substring(start, end)), list;
        })(req.headers["x-forwarded-for"] || "");
        return [ req.connection.remoteAddress ].concat(proxyAddrs);
    };
}
