function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = {
        toUnsigned: function(value) {
            return value >>> 0;
        },
        toHexString: function(value) {
            return ("00" + value.toString(16)).slice(-2);
        }
    };
}
