function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug) {
        var getDomain = Promise._getDomain, util = __webpack_require__(16), tryCatch = util.tryCatch;
        function ReductionPromiseArray(promises, fn, initialValue, _each) {
            this.constructor$(promises);
            var domain = getDomain();
            this._fn = null === domain ? fn : util.domainBind(domain, fn), void 0 !== initialValue && (initialValue = Promise.resolve(initialValue))._attachCancellationCallback(this), 
            this._initialValue = initialValue, this._currentCancellable = null, this._eachValues = _each === INTERNAL ? Array(this._length) : 0 === _each ? null : void 0, 
            this._promise._captureStackTrace(), this._init$(void 0, -5);
        }
        function completed(valueOrReason, array) {
            this.isFulfilled() ? array._resolve(valueOrReason) : array._reject(valueOrReason);
        }
        function reduce(promises, fn, initialValue, _each) {
            return "function" != typeof fn ? apiRejection("expecting a function but got " + util.classString(fn)) : new ReductionPromiseArray(promises, fn, initialValue, _each).promise();
        }
        function gotAccum(accum) {
            this.accum = accum, this.array._gotAccum(accum);
            var value = tryConvertToPromise(this.value, this.array._promise);
            return value instanceof Promise ? (this.array._currentCancellable = value, value._then(gotValue, void 0, void 0, this, void 0)) : gotValue.call(this, value);
        }
        function gotValue(value) {
            var ret, array = this.array, promise = array._promise, fn = tryCatch(array._fn);
            promise._pushContext(), (ret = void 0 !== array._eachValues ? fn.call(promise._boundValue(), value, this.index, this.length) : fn.call(promise._boundValue(), this.accum, value, this.index, this.length)) instanceof Promise && (array._currentCancellable = ret);
            var promiseCreated = promise._popContext();
            return debug.checkForgottenReturns(ret, promiseCreated, void 0 !== array._eachValues ? "Promise.each" : "Promise.reduce", promise), 
            ret;
        }
        util.inherits(ReductionPromiseArray, PromiseArray), ReductionPromiseArray.prototype._gotAccum = function(accum) {
            void 0 !== this._eachValues && null !== this._eachValues && accum !== INTERNAL && this._eachValues.push(accum);
        }, ReductionPromiseArray.prototype._eachComplete = function(value) {
            return null !== this._eachValues && this._eachValues.push(value), this._eachValues;
        }, ReductionPromiseArray.prototype._init = function() {}, ReductionPromiseArray.prototype._resolveEmptyArray = function() {
            this._resolve(void 0 !== this._eachValues ? this._eachValues : this._initialValue);
        }, ReductionPromiseArray.prototype.shouldCopyValues = function() {
            return !1;
        }, ReductionPromiseArray.prototype._resolve = function(value) {
            this._promise._resolveCallback(value), this._values = null;
        }, ReductionPromiseArray.prototype._resultCancelled = function(sender) {
            if (sender === this._initialValue) return this._cancel();
            this._isResolved() || (this._resultCancelled$(), this._currentCancellable instanceof Promise && this._currentCancellable.cancel(), 
            this._initialValue instanceof Promise && this._initialValue.cancel());
        }, ReductionPromiseArray.prototype._iterate = function(values) {
            var value, i;
            this._values = values;
            var length = values.length;
            if (void 0 !== this._initialValue ? (value = this._initialValue, i = 0) : (value = Promise.resolve(values[0]), 
            i = 1), this._currentCancellable = value, !value.isRejected()) for (;i < length; ++i) {
                var ctx = {
                    accum: null,
                    value: values[i],
                    index: i,
                    length: length,
                    array: this
                };
                value = value._then(gotAccum, void 0, void 0, ctx, void 0);
            }
            void 0 !== this._eachValues && (value = value._then(this._eachComplete, void 0, void 0, this, void 0)), 
            value._then(completed, completed, void 0, value, this);
        }, Promise.prototype.reduce = function(fn, initialValue) {
            return reduce(this, fn, initialValue, null);
        }, Promise.reduce = function(promises, fn, initialValue, _each) {
            return reduce(promises, fn, initialValue, _each);
        };
    };
}
