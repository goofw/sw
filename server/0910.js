function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise, INTERNAL) {
        var util = __webpack_require__(16), errorObj = util.errorObj, isObject = util.isObject, hasProp = {}.hasOwnProperty;
        return function(obj, context) {
            if (isObject(obj)) {
                if (obj instanceof Promise) return obj;
                var then = (function(obj) {
                    try {
                        return (function(obj) {
                            return obj.then;
                        })(obj);
                    } catch (e) {
                        return errorObj.e = e, errorObj;
                    }
                })(obj);
                if (then === errorObj) {
                    context && context._pushContext();
                    var ret = Promise.reject(then.e);
                    return context && context._popContext(), ret;
                }
                if ("function" == typeof then) return (function(obj) {
                    try {
                        return hasProp.call(obj, "_promise0");
                    } catch (e) {
                        return !1;
                    }
                })(obj) ? (ret = new Promise(INTERNAL), obj._then(ret._fulfill, ret._reject, void 0, ret, null), 
                ret) : (function(x, then, context) {
                    var promise = new Promise(INTERNAL), ret = promise;
                    context && context._pushContext(), promise._captureStackTrace(), context && context._popContext();
                    var result = util.tryCatch(then).call(x, (function(value) {
                        promise && (promise._resolveCallback(value), promise = null);
                    }), (function(reason) {
                        promise && (promise._rejectCallback(reason, false, !0), promise = null);
                    }));
                    return !1, promise && result === errorObj && (promise._rejectCallback(result.e, !0, !0), 
                    promise = null), ret;
                })(obj, then, context);
            }
            return obj;
        };
    };
}
