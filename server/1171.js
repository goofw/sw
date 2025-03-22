function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise, INTERNAL, tryConvertToPromise, debug) {
        var calledBind = !1, rejectThis = function(_, e) {
            this._reject(e);
        }, targetRejected = function(e, context) {
            context.promiseRejectionQueued = !0, context.bindingPromise._then(rejectThis, rejectThis, null, this, e);
        }, bindingResolved = function(thisArg, context) {
            0 == (50397184 & this._bitField) && this._resolveCallback(context.target);
        }, bindingRejected = function(e, context) {
            context.promiseRejectionQueued || this._reject(e);
        };
        Promise.prototype.bind = function(thisArg) {
            calledBind || (calledBind = !0, Promise.prototype._propagateFrom = debug.propagateFromFunction(), 
            Promise.prototype._boundValue = debug.boundValueFunction());
            var maybePromise = tryConvertToPromise(thisArg), ret = new Promise(INTERNAL);
            ret._propagateFrom(this, 1);
            var target = this._target();
            if (ret._setBoundTo(maybePromise), maybePromise instanceof Promise) {
                var context = {
                    promiseRejectionQueued: !1,
                    promise: ret,
                    target: target,
                    bindingPromise: maybePromise
                };
                target._then(INTERNAL, targetRejected, void 0, ret, context), maybePromise._then(bindingResolved, bindingRejected, void 0, ret, context), 
                ret._setOnCancel(maybePromise);
            } else ret._resolveCallback(target);
            return ret;
        }, Promise.prototype._setBoundTo = function(obj) {
            void 0 !== obj ? (this._bitField = 2097152 | this._bitField, this._boundTo = obj) : this._bitField = -2097153 & this._bitField;
        }, Promise.prototype._isBound = function() {
            return 2097152 == (2097152 & this._bitField);
        }, Promise.bind = function(thisArg, value) {
            return Promise.resolve(value).bind(thisArg);
        };
    };
}
