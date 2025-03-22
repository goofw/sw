function(module, exports, __webpack_require__) {
    var crypto = __webpack_require__(9);
    function sha(key, body, algorithm) {
        return crypto.createHmac(algorithm, key).update(body).digest("base64");
    }
    function rfc3986(str) {
        return encodeURIComponent(str).replace(/!/g, "%21").replace(/\*/g, "%2A").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/'/g, "%27");
    }
    function compare(a, b) {
        return a > b ? 1 : a < b ? -1 : 0;
    }
    function generateBase(httpMethod, base_uri, params) {
        var normalized = (function(obj) {
            var key, val, arr = [];
            for (key in obj) if (val = obj[key], Array.isArray(val)) for (var i = 0; i < val.length; i++) arr.push([ key, val[i] ]); else if ("object" == typeof val) for (var prop in val) arr.push([ key + "[" + prop + "]", val[prop] ]); else arr.push([ key, val ]);
            return arr;
        })(params).map((function(p) {
            return [ rfc3986(p[0]), rfc3986(p[1] || "") ];
        })).sort((function(a, b) {
            return compare(a[0], b[0]) || compare(a[1], b[1]);
        })).map((function(p) {
            return p.join("=");
        })).join("&");
        return [ rfc3986(httpMethod ? httpMethod.toUpperCase() : "GET"), rfc3986(base_uri), rfc3986(normalized) ].join("&");
    }
    function hmacsign(httpMethod, base_uri, params, consumer_secret, token_secret) {
        var base = generateBase(httpMethod, base_uri, params);
        return sha([ consumer_secret || "", token_secret || "" ].map(rfc3986).join("&"), base, "sha1");
    }
    function hmacsign256(httpMethod, base_uri, params, consumer_secret, token_secret) {
        var base = generateBase(httpMethod, base_uri, params);
        return sha([ consumer_secret || "", token_secret || "" ].map(rfc3986).join("&"), base, "sha256");
    }
    function rsasign(httpMethod, base_uri, params, private_key, token_secret) {
        return key = private_key || "", body = generateBase(httpMethod, base_uri, params), 
        crypto.createSign("RSA-SHA1").update(body).sign(key, "base64");
        var key, body;
    }
    function plaintext(consumer_secret, token_secret) {
        return [ consumer_secret || "", token_secret || "" ].map(rfc3986).join("&");
    }
    exports.hmacsign = hmacsign, exports.hmacsign256 = hmacsign256, exports.rsasign = rsasign, 
    exports.plaintext = plaintext, exports.sign = function(signMethod, httpMethod, base_uri, params, consumer_secret, token_secret) {
        var method, skipArgs = 1;
        switch (signMethod) {
          case "RSA-SHA1":
            method = rsasign;
            break;

          case "HMAC-SHA1":
            method = hmacsign;
            break;

          case "HMAC-SHA256":
            method = hmacsign256;
            break;

          case "PLAINTEXT":
            method = plaintext, skipArgs = 4;
            break;

          default:
            throw new Error("Signature method not supported: " + signMethod);
        }
        return method.apply(null, [].slice.call(arguments, skipArgs));
    }, exports.rfc3986 = rfc3986, exports.generateBase = generateBase;
}
