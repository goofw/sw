function(module, exports, __webpack_require__) {
    var crypto = __webpack_require__(9);
    module.exports = function() {
        return crypto.randomBytes(16);
    };
}
