function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise, INTERNAL, debug) {
        var util = __webpack_require__(17), TimeoutError = Promise.TimeoutError;
        function HandleWrapper(handle) {
            this.handle = handle;
        }
        HandleWrapper.prototype._resultCancelled = function() {
            clearTimeout(this.handle);
        };
        var afterValue = function(value) {
            return delay(+this).thenReturn(value);
        }, delay = Promise.delay = function(ms, value) {
            var ret, handle;
            return void 0 !== value ? (ret = Promise.resolve(value)._then(afterValue, null, null, ms, void 0), 
            debug.cancellation() && value instanceof Promise && ret._setOnCancel(value)) : (ret = new Promise(INTERNAL), 
            handle = setTimeout((function() {
                ret._fulfill();
            }), +ms), debug.cancellation() && ret._setOnCancel(new HandleWrapper(handle)), ret._captureStackTrace()), 
            ret._setAsyncGuaranteed(), ret;
        };
        function successClear(value) {
            return clearTimeout(this.handle), value;
        }
        function failureClear(reason) {
            throw clearTimeout(this.handle), reason;
        }
        Promise.prototype.delay = function(ms) {
            return delay(ms, this);
        }, Promise.prototype.timeout = function(ms, message) {
            var ret, parent;
            ms = +ms;
            var handleWrapper = new HandleWrapper(setTimeout((function() {
                ret.isPending() && (function(promise, message, parent) {
                    var err;
                    err = "string" != typeof message ? message instanceof Error ? message : new TimeoutError("operation timed out") : new TimeoutError(message), 
                    util.markAsOriginatingFromRejection(err), promise._attachExtraTrace(err), promise._reject(err), 
                    null != parent && parent.cancel();
                })(ret, message, parent);
            }), ms));
            return debug.cancellation() ? (parent = this.then(), (ret = parent._then(successClear, failureClear, void 0, handleWrapper, void 0))._setOnCancel(handleWrapper)) : ret = this._then(successClear, failureClear, void 0, handleWrapper, void 0), 
            ret;
        };
    };
}
