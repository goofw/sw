function(module, exports, __webpack_require__) {
    "use strict";
    var jsonSafeStringify = __webpack_require__(1045), crypto = __webpack_require__(9), Buffer = __webpack_require__(23).Buffer, defer = "undefined" == typeof setImmediate ? process.nextTick : setImmediate;
    exports.paramsHaveRequestBody = function(params) {
        return params.body || params.requestBodyStream || params.json && "boolean" != typeof params.json || params.multipart;
    }, exports.safeStringify = function(obj, replacer) {
        var ret;
        try {
            ret = JSON.stringify(obj, replacer);
        } catch (e) {
            ret = jsonSafeStringify(obj, replacer);
        }
        return ret;
    }, exports.md5 = function(str) {
        return crypto.createHash("md5").update(str).digest("hex");
    }, exports.isReadStream = function(rs) {
        return rs.readable && rs.path && rs.mode;
    }, exports.toBase64 = function(str) {
        return Buffer.from(str || "", "utf8").toString("base64");
    }, exports.copy = function(obj) {
        var o = {};
        return Object.keys(obj).forEach((function(i) {
            o[i] = obj[i];
        })), o;
    }, exports.version = function() {
        var numbers = process.version.replace("v", "").split(".");
        return {
            major: parseInt(numbers[0], 10),
            minor: parseInt(numbers[1], 10),
            patch: parseInt(numbers[2], 10)
        };
    }, exports.defer = defer;
}
