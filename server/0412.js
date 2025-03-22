function(module, exports, __webpack_require__) {
    "use strict";
    var muxjs = {
        codecs: __webpack_require__(413),
        mp4: __webpack_require__(824),
        flv: __webpack_require__(830),
        mp2t: __webpack_require__(835),
        partial: __webpack_require__(836)
    };
    muxjs.mp4.tools = __webpack_require__(840), muxjs.flv.tools = __webpack_require__(842), 
    muxjs.mp2t.tools = __webpack_require__(843), module.exports = muxjs;
}
