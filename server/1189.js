function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise, INTERNAL) {
        var PromiseReduce = Promise.reduce, PromiseAll = Promise.all;
        function promiseAllThis() {
            return PromiseAll(this);
        }
        Promise.prototype.each = function(fn) {
            return PromiseReduce(this, fn, INTERNAL, 0)._then(promiseAllThis, void 0, void 0, this, void 0);
        }, Promise.prototype.mapSeries = function(fn) {
            return PromiseReduce(this, fn, INTERNAL, INTERNAL);
        }, Promise.each = function(promises, fn) {
            return PromiseReduce(promises, fn, INTERNAL, 0)._then(promiseAllThis, void 0, void 0, promises, void 0);
        }, Promise.mapSeries = function(promises, fn) {
            return PromiseReduce(promises, fn, INTERNAL, INTERNAL);
        };
    };
}
