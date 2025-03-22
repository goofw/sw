function(module, exports, __webpack_require__) {
    var crypto = __webpack_require__(9), parse = __webpack_require__(7).parse, keys = [ "acl", "location", "logging", "notification", "partNumber", "policy", "requestPayment", "torrent", "uploadId", "uploads", "versionId", "versioning", "versions", "website" ];
    function authorization(options) {
        return "AWS " + options.key + ":" + sign(options);
    }
    function hmacSha1(options) {
        return crypto.createHmac("sha1", options.secret).update(options.message).digest("base64");
    }
    function sign(options) {
        return options.message = stringToSign(options), hmacSha1(options);
    }
    function stringToSign(options) {
        var headers = options.amazonHeaders || "";
        return headers && (headers += "\n"), [ options.verb, options.md5, options.contentType, options.date ? options.date.toUTCString() : "", headers + options.resource ].join("\n");
    }
    function queryStringToSign(options) {
        return "GET\n\n\n" + options.date + "\n" + options.resource;
    }
    module.exports = authorization, module.exports.authorization = authorization, module.exports.hmacSha1 = hmacSha1, 
    module.exports.sign = sign, module.exports.signQuery = function(options) {
        return options.message = queryStringToSign(options), hmacSha1(options);
    }, module.exports.stringToSign = stringToSign, module.exports.queryStringToSign = queryStringToSign, 
    module.exports.canonicalizeHeaders = function(headers) {
        for (var buf = [], fields = Object.keys(headers), i = 0, len = fields.length; i < len; ++i) {
            var field, val = headers[field = fields[i]];
            0 === (field = field.toLowerCase()).indexOf("x-amz") && buf.push(field + ":" + val);
        }
        return buf.sort().join("\n");
    }, module.exports.canonicalizeResource = function(resource) {
        var url = parse(resource, !0), path = url.pathname, buf = [];
        return Object.keys(url.query).forEach((function(key) {
            if (~keys.indexOf(key)) {
                var val = "" == url.query[key] ? "" : "=" + encodeURIComponent(url.query[key]);
                buf.push(key + val);
            }
        })), path + (buf.length ? "?" + buf.sort().join("&") : "");
    };
}
