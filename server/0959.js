function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise, INTERNAL, tryConvertToPromise, apiRejection, Proxyable) {
        var util = __webpack_require__(17);
        function PromiseArray(values) {
            var promise = this._promise = new Promise(INTERNAL);
            values instanceof Promise && promise._propagateFrom(values, 3), promise._setOnCancel(this), 
            this._values = values, this._length = 0, this._totalResolved = 0, this._init(void 0, -2);
        }
        return util.isArray, util.inherits(PromiseArray, Proxyable), PromiseArray.prototype.length = function() {
            return this._length;
        }, PromiseArray.prototype.promise = function() {
            return this._promise;
        }, PromiseArray.prototype._init = function init(_, resolveValueIfEmpty) {
            var values = tryConvertToPromise(this._values, this._promise);
            if (values instanceof Promise) {
                var bitField = (values = values._target())._bitField;
                if (this._values = values, 0 == (50397184 & bitField)) return this._promise._setAsyncGuaranteed(), 
                values._then(init, this._reject, void 0, this, resolveValueIfEmpty);
                if (0 == (33554432 & bitField)) return 0 != (16777216 & bitField) ? this._reject(values._reason()) : this._cancel();
                values = values._value();
            }
            if (null !== (values = util.asArray(values))) 0 !== values.length ? this._iterate(values) : -5 === resolveValueIfEmpty ? this._resolveEmptyArray() : this._resolve((function(val) {
                switch (val) {
                  case -2:
                    return [];

                  case -3:
                    return {};
                }
            })(resolveValueIfEmpty)); else {
                var err = apiRejection("expecting an array or an iterable object but got " + util.classString(values)).reason();
                this._promise._rejectCallback(err, !1);
            }
        }, PromiseArray.prototype._iterate = function(values) {
            var len = this.getActualLength(values.length);
            this._length = len, this._values = this.shouldCopyValues() ? new Array(len) : this._values;
            for (var result = this._promise, isResolved = !1, bitField = null, i = 0; i < len; ++i) {
                var maybePromise = tryConvertToPromise(values[i], result);
                bitField = maybePromise instanceof Promise ? (maybePromise = maybePromise._target())._bitField : null, 
                isResolved ? null !== bitField && maybePromise.suppressUnhandledRejections() : null !== bitField ? 0 == (50397184 & bitField) ? (maybePromise._proxy(this, i), 
                this._values[i] = maybePromise) : isResolved = 0 != (33554432 & bitField) ? this._promiseFulfilled(maybePromise._value(), i) : 0 != (16777216 & bitField) ? this._promiseRejected(maybePromise._reason(), i) : this._promiseCancelled(i) : isResolved = this._promiseFulfilled(maybePromise, i);
            }
            isResolved || result._setAsyncGuaranteed();
        }, PromiseArray.prototype._isResolved = function() {
            return null === this._values;
        }, PromiseArray.prototype._resolve = function(value) {
            this._values = null, this._promise._fulfill(value);
        }, PromiseArray.prototype._cancel = function() {
            !this._isResolved() && this._promise._isCancellable() && (this._values = null, this._promise._cancel());
        }, PromiseArray.prototype._reject = function(reason) {
            this._values = null, this._promise._rejectCallback(reason, !1);
        }, PromiseArray.prototype._promiseFulfilled = function(value, index) {
            return this._values[index] = value, ++this._totalResolved >= this._length && (this._resolve(this._values), 
            !0);
        }, PromiseArray.prototype._promiseCancelled = function() {
            return this._cancel(), !0;
        }, PromiseArray.prototype._promiseRejected = function(reason) {
            return this._totalResolved++, this._reject(reason), !0;
        }, PromiseArray.prototype._resultCancelled = function() {
            if (!this._isResolved()) {
                var values = this._values;
                if (this._cancel(), values instanceof Promise) values.cancel(); else for (var i = 0; i < values.length; ++i) values[i] instanceof Promise && values[i].cancel();
            }
        }, PromiseArray.prototype.shouldCopyValues = function() {
            return !0;
        }, PromiseArray.prototype.getActualLength = function(len) {
            return len;
        }, PromiseArray;
    };
}
