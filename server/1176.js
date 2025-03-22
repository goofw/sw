function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug) {
        var getDomain = Promise._getDomain, util = __webpack_require__(17), tryCatch = util.tryCatch, errorObj = util.errorObj, async = Promise._async;
        function MappingPromiseArray(promises, fn, limit, _filter) {
            this.constructor$(promises), this._promise._captureStackTrace();
            var domain = getDomain();
            this._callback = null === domain ? fn : util.domainBind(domain, fn), this._preservedValues = _filter === INTERNAL ? new Array(this.length()) : null, 
            this._limit = limit, this._inFlight = 0, this._queue = [], async.invoke(this._asyncInit, this, void 0);
        }
        function map(promises, fn, options, _filter) {
            if ("function" != typeof fn) return apiRejection("expecting a function but got " + util.classString(fn));
            var limit = 0;
            if (void 0 !== options) {
                if ("object" != typeof options || null === options) return Promise.reject(new TypeError("options argument must be an object but it is " + util.classString(options)));
                if ("number" != typeof options.concurrency) return Promise.reject(new TypeError("'concurrency' must be a number but it is " + util.classString(options.concurrency)));
                limit = options.concurrency;
            }
            return new MappingPromiseArray(promises, fn, limit = "number" == typeof limit && isFinite(limit) && limit >= 1 ? limit : 0, _filter).promise();
        }
        util.inherits(MappingPromiseArray, PromiseArray), MappingPromiseArray.prototype._asyncInit = function() {
            this._init$(void 0, -2);
        }, MappingPromiseArray.prototype._init = function() {}, MappingPromiseArray.prototype._promiseFulfilled = function(value, index) {
            var values = this._values, length = this.length(), preservedValues = this._preservedValues, limit = this._limit;
            if (index < 0) {
                if (values[index = -1 * index - 1] = value, limit >= 1 && (this._inFlight--, this._drainQueue(), 
                this._isResolved())) return !0;
            } else {
                if (limit >= 1 && this._inFlight >= limit) return values[index] = value, this._queue.push(index), 
                !1;
                null !== preservedValues && (preservedValues[index] = value);
                var promise = this._promise, callback = this._callback, receiver = promise._boundValue();
                promise._pushContext();
                var ret = tryCatch(callback).call(receiver, value, index, length), promiseCreated = promise._popContext();
                if (debug.checkForgottenReturns(ret, promiseCreated, null !== preservedValues ? "Promise.filter" : "Promise.map", promise), 
                ret === errorObj) return this._reject(ret.e), !0;
                var maybePromise = tryConvertToPromise(ret, this._promise);
                if (maybePromise instanceof Promise) {
                    var bitField = (maybePromise = maybePromise._target())._bitField;
                    if (0 == (50397184 & bitField)) return limit >= 1 && this._inFlight++, values[index] = maybePromise, 
                    maybePromise._proxy(this, -1 * (index + 1)), !1;
                    if (0 == (33554432 & bitField)) return 0 != (16777216 & bitField) ? (this._reject(maybePromise._reason()), 
                    !0) : (this._cancel(), !0);
                    ret = maybePromise._value();
                }
                values[index] = ret;
            }
            return ++this._totalResolved >= length && (null !== preservedValues ? this._filter(values, preservedValues) : this._resolve(values), 
            !0);
        }, MappingPromiseArray.prototype._drainQueue = function() {
            for (var queue = this._queue, limit = this._limit, values = this._values; queue.length > 0 && this._inFlight < limit; ) {
                if (this._isResolved()) return;
                var index = queue.pop();
                this._promiseFulfilled(values[index], index);
            }
        }, MappingPromiseArray.prototype._filter = function(booleans, values) {
            for (var len = values.length, ret = new Array(len), j = 0, i = 0; i < len; ++i) booleans[i] && (ret[j++] = values[i]);
            ret.length = j, this._resolve(ret);
        }, MappingPromiseArray.prototype.preservedValues = function() {
            return this._preservedValues;
        }, Promise.prototype.map = function(fn, options) {
            return map(this, fn, options, null);
        }, Promise.map = function(promises, fn, options, _filter) {
            return map(promises, fn, options, _filter);
        };
    };
}
