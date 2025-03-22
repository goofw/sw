function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(emitter, type) {
        return emitter.listeners(type).length;
    };
}
