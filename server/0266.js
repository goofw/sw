function(module, exports, __webpack_require__) {
    "use strict";
    var bufferUtil;
    try {
        bufferUtil = __webpack_require__(602);
    } catch (e) {
        bufferUtil = __webpack_require__(603);
    }
    module.exports = bufferUtil.BufferUtil || bufferUtil;
}
