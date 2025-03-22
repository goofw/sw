function(module, exports, __webpack_require__) {
    var crypto = __webpack_require__(9);
    function sha1(str) {
        return crypto.createHash("sha1").update(str).digest("hex");
    }
    exports.sign = function(val, secret) {
        if ("string" != typeof val) throw new TypeError("Cookie value must be provided as a string.");
        if ("string" != typeof secret) throw new TypeError("Secret string must be provided.");
        return val + "." + crypto.createHmac("sha256", secret).update(val).digest("base64").replace(/\=+$/, "");
    }, exports.unsign = function(val, secret) {
        if ("string" != typeof val) throw new TypeError("Signed cookie string must be provided.");
        if ("string" != typeof secret) throw new TypeError("Secret string must be provided.");
        var str = val.slice(0, val.lastIndexOf("."));
        return sha1(exports.sign(str, secret)) == sha1(val) && str;
    };
}
