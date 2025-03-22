function(module, exports, __webpack_require__) {
    var debug;
    module.exports = function() {
        if (!debug) {
            try {
                debug = __webpack_require__(41)("follow-redirects");
            } catch (error) {}
            "function" != typeof debug && (debug = function() {});
        }
        debug.apply(null, arguments);
    };
}
