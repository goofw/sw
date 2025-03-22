function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise, tryConvertToPromise, NEXT_FILTER) {
        var util = __webpack_require__(16), CancellationError = Promise.CancellationError, errorObj = util.errorObj, catchFilter = __webpack_require__(441)(NEXT_FILTER);
        function PassThroughHandlerContext(promise, type, handler) {
            this.promise = promise, this.type = type, this.handler = handler, this.called = !1, 
            this.cancelPromise = null;
        }
        function FinallyHandlerCancelReaction(finallyHandler) {
            this.finallyHandler = finallyHandler;
        }
        function checkCancel(ctx, reason) {
            return null != ctx.cancelPromise && (arguments.length > 1 ? ctx.cancelPromise._reject(reason) : ctx.cancelPromise._cancel(), 
            ctx.cancelPromise = null, !0);
        }
        function succeed() {
            return finallyHandler.call(this, this.promise._target()._settledValue());
        }
        function fail(reason) {
            if (!checkCancel(this, reason)) return errorObj.e = reason, errorObj;
        }
        function finallyHandler(reasonOrValue) {
            var promise = this.promise, handler = this.handler;
            if (!this.called) {
                this.called = !0;
                var ret = this.isFinallyHandler() ? handler.call(promise._boundValue()) : handler.call(promise._boundValue(), reasonOrValue);
                if (ret === NEXT_FILTER) return ret;
                if (void 0 !== ret) {
                    promise._setReturnedNonUndefined();
                    var maybePromise = tryConvertToPromise(ret, promise);
                    if (maybePromise instanceof Promise) {
                        if (null != this.cancelPromise) {
                            if (maybePromise._isCancelled()) {
                                var reason = new CancellationError("late cancellation observer");
                                return promise._attachExtraTrace(reason), errorObj.e = reason, errorObj;
                            }
                            maybePromise.isPending() && maybePromise._attachCancellationCallback(new FinallyHandlerCancelReaction(this));
                        }
                        return maybePromise._then(succeed, fail, void 0, this, void 0);
                    }
                }
            }
            return promise.isRejected() ? (checkCancel(this), errorObj.e = reasonOrValue, errorObj) : (checkCancel(this), 
            reasonOrValue);
        }
        return PassThroughHandlerContext.prototype.isFinallyHandler = function() {
            return 0 === this.type;
        }, FinallyHandlerCancelReaction.prototype._resultCancelled = function() {
            checkCancel(this.finallyHandler);
        }, Promise.prototype._passThrough = function(handler, type, success, fail) {
            return "function" != typeof handler ? this.then() : this._then(success, fail, void 0, new PassThroughHandlerContext(this, type, handler), void 0);
        }, Promise.prototype.lastly = Promise.prototype.finally = function(handler) {
            return this._passThrough(handler, 0, finallyHandler, finallyHandler);
        }, Promise.prototype.tap = function(handler) {
            return this._passThrough(handler, 1, finallyHandler);
        }, Promise.prototype.tapCatch = function(handlerOrPredicate) {
            var len = arguments.length;
            if (1 === len) return this._passThrough(handlerOrPredicate, 1, void 0, finallyHandler);
            var i, catchInstances = new Array(len - 1), j = 0;
            for (i = 0; i < len - 1; ++i) {
                var item = arguments[i];
                if (!util.isObject(item)) return Promise.reject(new TypeError("tapCatch statement predicate: expecting an object but got " + util.classString(item)));
                catchInstances[j++] = item;
            }
            catchInstances.length = j;
            var handler = arguments[i];
            return this._passThrough(catchFilter(catchInstances, handler, this), 1, void 0, finallyHandler);
        }, PassThroughHandlerContext;
    };
}
