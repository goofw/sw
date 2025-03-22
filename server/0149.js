function(module, exports, __webpack_require__) {
    "use strict";
    function flattenWithDepth(array, result, depth) {
        for (var i = 0; i < array.length; i++) {
            var value = array[i];
            depth > 0 && Array.isArray(value) ? flattenWithDepth(value, result, depth - 1) : result.push(value);
        }
        return result;
    }
    function flattenForever(array, result) {
        for (var i = 0; i < array.length; i++) {
            var value = array[i];
            Array.isArray(value) ? flattenForever(value, result) : result.push(value);
        }
        return result;
    }
    module.exports = function(array, depth) {
        return null == depth ? flattenForever(array, []) : flattenWithDepth(array, [], depth);
    };
}
