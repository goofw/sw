function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise, INTERNAL, tryConvertToPromise, apiRejection) {
        var util = __webpack_require__(16);
        function race(promises, parent) {
            var promise, maybePromise = tryConvertToPromise(promises);
            if (maybePromise instanceof Promise) return (promise = maybePromise).then((function(array) {
                return race(array, promise);
            }));
            if (null === (promises = util.asArray(promises))) return apiRejection("expecting an array or an iterable object but got " + util.classString(promises));
            var ret = new Promise(INTERNAL);
            void 0 !== parent && ret._propagateFrom(parent, 3);
            for (var fulfill = ret._fulfill, reject = ret._reject, i = 0, len = promises.length; i < len; ++i) {
                var val = promises[i];
                (void 0 !== val || i in promises) && Promise.cast(val)._then(fulfill, reject, void 0, ret, null);
            }
            return ret;
        }
        Promise.race = function(promises) {
            return race(promises, void 0);
        }, Promise.prototype.race = function() {
            return race(this, void 0);
        };
    };
}
