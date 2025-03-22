function(module, exports, __webpack_require__) {
    "use strict";
    function flattenFrom(array) {
        return flattenDown(array, []);
    }
    function flattenFromDepth(array, depth) {
        if ("number" != typeof depth) throw new TypeError("Expected the depth to be a number");
        return flattenDownDepth(array, [], depth);
    }
    function flattenDown(array, result) {
        for (var i = 0; i < array.length; i++) {
            var value = array[i];
            Array.isArray(value) ? flattenDown(value, result) : result.push(value);
        }
        return result;
    }
    function flattenDownDepth(array, result, depth) {
        depth--;
        for (var i = 0; i < array.length; i++) {
            var value = array[i];
            depth > -1 && Array.isArray(value) ? flattenDownDepth(value, result, depth) : result.push(value);
        }
        return result;
    }
    module.exports = function(array) {
        if (!Array.isArray(array)) throw new TypeError("Expected value to be an array");
        return flattenFrom(array);
    }, module.exports.from = flattenFrom, module.exports.depth = function(array, depth) {
        if (!Array.isArray(array)) throw new TypeError("Expected value to be an array");
        return flattenFromDepth(array, depth);
    }, module.exports.fromDepth = flattenFromDepth;
}
