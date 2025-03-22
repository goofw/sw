function(module, exports, __webpack_require__) {
    "use strict";
    var psl = __webpack_require__(1041);
    exports.getPublicSuffix = function(domain) {
        return psl.get(domain);
    };
}
