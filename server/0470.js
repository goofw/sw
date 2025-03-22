function(module, exports, __webpack_require__) {
    "use strict";
    function $flatten(array, result) {
        for (var i = 0; i < array.length; i++) {
            var value = array[i];
            Array.isArray(value) ? $flatten(value, result) : result.push(value);
        }
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.flatten = function(array) {
        var result = [];
        return $flatten(array, result), result;
    };
}
