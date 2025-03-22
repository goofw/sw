function(module, exports, __webpack_require__) {
    var defer = __webpack_require__(1072);
    module.exports = function(callback) {
        var isAsync = !1;
        return defer((function() {
            isAsync = !0;
        })), function(err, result) {
            isAsync ? callback(err, result) : defer((function() {
                callback(err, result);
            }));
        };
    };
}
