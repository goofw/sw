function(module, exports, __webpack_require__) {
    "use strict";
    var extensions, types, preference, db = __webpack_require__(556), extname = __webpack_require__(4).extname, EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/, TEXT_TYPE_REGEXP = /^text\//i;
    function charset(type) {
        if (!type || "string" != typeof type) return !1;
        var match = EXTRACT_TYPE_REGEXP.exec(type), mime = match && db[match[1].toLowerCase()];
        return mime && mime.charset ? mime.charset : !(!match || !TEXT_TYPE_REGEXP.test(match[1])) && "UTF-8";
    }
    exports.charset = charset, exports.charsets = {
        lookup: charset
    }, exports.contentType = function(str) {
        if (!str || "string" != typeof str) return !1;
        var mime = -1 === str.indexOf("/") ? exports.lookup(str) : str;
        if (!mime) return !1;
        if (-1 === mime.indexOf("charset")) {
            var charset = exports.charset(mime);
            charset && (mime += "; charset=" + charset.toLowerCase());
        }
        return mime;
    }, exports.extension = function(type) {
        if (!type || "string" != typeof type) return !1;
        var match = EXTRACT_TYPE_REGEXP.exec(type), exts = match && exports.extensions[match[1].toLowerCase()];
        return !(!exts || !exts.length) && exts[0];
    }, exports.extensions = Object.create(null), exports.lookup = function(path) {
        if (!path || "string" != typeof path) return !1;
        var extension = extname("x." + path).toLowerCase().substr(1);
        return extension && exports.types[extension] || !1;
    }, exports.types = Object.create(null), extensions = exports.extensions, types = exports.types, 
    preference = [ "nginx", "apache", void 0, "iana" ], Object.keys(db).forEach((function(type) {
        var mime = db[type], exts = mime.extensions;
        if (exts && exts.length) {
            extensions[type] = exts;
            for (var i = 0; i < exts.length; i++) {
                var extension = exts[i];
                if (types[extension]) {
                    var from = preference.indexOf(db[types[extension]].source), to = preference.indexOf(mime.source);
                    if ("application/octet-stream" !== types[extension] && (from > to || from === to && "application/" === types[extension].substr(0, 12))) continue;
                }
                types[extension] = type;
            }
        }
    }));
}
