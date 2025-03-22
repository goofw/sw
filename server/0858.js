function(module, exports, __webpack_require__) {
    var debug;
    module.exports = function() {
        if (!debug) try {
            debug = __webpack_require__(8)("follow-redirects");
        } catch (error) {
            debug = function() {};
        }
        debug.apply(null, arguments);
    };
}
