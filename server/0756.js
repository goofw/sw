function(module, exports, __webpack_require__) {
    !(function(exports) {
        "use strict";
        function forEachAsync(arr, fn, thisArg) {
            var dones = [], index = -1;
            return setTimeout((function next(BREAK, result) {
                (index += 1) !== arr.length && BREAK !== forEachAsync.__BREAK ? fn.call(thisArg, next, arr[index], index, arr) : dones.forEach((function(done) {
                    done.call(thisArg, result);
                }));
            }), 4), {
                then: function(_done) {
                    return dones.push(_done), this;
                }
            };
        }
        forEachAsync.__BREAK = {}, exports.forEachAsync = forEachAsync;
    })(exports || new Function("return this")());
}
