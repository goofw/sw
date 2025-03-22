function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise, INTERNAL, tryConvertToPromise, apiRejection, debug) {
        var util = __webpack_require__(16), tryCatch = util.tryCatch;
        Promise.method = function(fn) {
            if ("function" != typeof fn) throw new Promise.TypeError("expecting a function but got " + util.classString(fn));
            return function() {
                var ret = new Promise(INTERNAL);
                ret._captureStackTrace(), ret._pushContext();
                var value = tryCatch(fn).apply(this, arguments), promiseCreated = ret._popContext();
                return debug.checkForgottenReturns(value, promiseCreated, "Promise.method", ret), 
                ret._resolveFromSyncValue(value), ret;
            };
        }, Promise.attempt = Promise.try = function(fn) {
            if ("function" != typeof fn) return apiRejection("expecting a function but got " + util.classString(fn));
            var value, ret = new Promise(INTERNAL);
            if (ret._captureStackTrace(), ret._pushContext(), arguments.length > 1) {
                debug.deprecated("calling Promise.try with more than 1 argument");
                var arg = arguments[1], ctx = arguments[2];
                value = util.isArray(arg) ? tryCatch(fn).apply(ctx, arg) : tryCatch(fn).call(ctx, arg);
            } else value = tryCatch(fn)();
            var promiseCreated = ret._popContext();
            return debug.checkForgottenReturns(value, promiseCreated, "Promise.try", ret), ret._resolveFromSyncValue(value), 
            ret;
        }, Promise.prototype._resolveFromSyncValue = function(value) {
            value === util.errorObj ? this._rejectCallback(value.e, !1) : this._resolveCallback(value, !0);
        };
    };
}
