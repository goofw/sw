function(module, exports, __webpack_require__) {
    var crypto = __webpack_require__(9);
    function sha1sync(buf) {
        return crypto.createHash("sha1").update(buf).digest("hex");
    }
    module.exports = function(buf, cb) {
        var hash = sha1sync(buf);
        process.nextTick((function() {
            cb(hash);
        }));
    }, module.exports.sync = sha1sync;
}
