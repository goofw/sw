function(module, exports, __webpack_require__) {
    "use strict";
    var old;
    "undefined" != typeof Promise && (old = Promise);
    var bluebird = __webpack_require__(1160)();
    bluebird.noConflict = function() {
        try {
            Promise === bluebird && (Promise = old);
        } catch (e) {}
        return bluebird;
    }, module.exports = bluebird;
}
