function(module, exports, __webpack_require__) {
    var base32 = __webpack_require__(762);
    module.exports = function(uri) {
        var m, result = {}, data = uri.split("magnet:?")[1];
        if (!data || 0 === data.length) return result;
        if (data.split("&").forEach((function(param) {
            var keyval = param.split("=");
            if (2 === keyval.length) {
                var key = keyval[0], val = keyval[1];
                if ("tr" === key && (val = decodeURIComponent(val)), result[key]) if (Array.isArray(result[key])) result[key].push(val); else {
                    var old = result[key];
                    result[key] = [ old, val ];
                } else result[key] = val;
            }
        })), result.xt && (m = result.xt.match(/^urn:btih:(.{40})/))) result.infoHash = new Buffer(m[1], "hex").toString("hex"); else if (result.xt && (m = result.xt.match(/^urn:btih:(.{32})/))) {
            var decodedStr = base32.decode(m[1]);
            result.infoHash = new Buffer(decodedStr, "binary").toString("hex");
        }
        return result;
    };
}
