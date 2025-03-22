function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise, PromiseArray, apiRejection) {
        var util = __webpack_require__(17), RangeError = __webpack_require__(58).RangeError, AggregateError = __webpack_require__(58).AggregateError, isArray = util.isArray, CANCELLATION = {};
        function SomePromiseArray(values) {
            this.constructor$(values), this._howMany = 0, this._unwrap = !1, this._initialized = !1;
        }
        function some(promises, howMany) {
            if ((0 | howMany) !== howMany || howMany < 0) return apiRejection("expecting a positive integer\n\n    See http://goo.gl/MqrFmX\n");
            var ret = new SomePromiseArray(promises), promise = ret.promise();
            return ret.setHowMany(howMany), ret.init(), promise;
        }
        util.inherits(SomePromiseArray, PromiseArray), SomePromiseArray.prototype._init = function() {
            if (this._initialized) if (0 !== this._howMany) {
                this._init$(void 0, -5);
                var isArrayResolved = isArray(this._values);
                !this._isResolved() && isArrayResolved && this._howMany > this._canPossiblyFulfill() && this._reject(this._getRangeError(this.length()));
            } else this._resolve([]);
        }, SomePromiseArray.prototype.init = function() {
            this._initialized = !0, this._init();
        }, SomePromiseArray.prototype.setUnwrap = function() {
            this._unwrap = !0;
        }, SomePromiseArray.prototype.howMany = function() {
            return this._howMany;
        }, SomePromiseArray.prototype.setHowMany = function(count) {
            this._howMany = count;
        }, SomePromiseArray.prototype._promiseFulfilled = function(value) {
            return this._addFulfilled(value), this._fulfilled() === this.howMany() && (this._values.length = this.howMany(), 
            1 === this.howMany() && this._unwrap ? this._resolve(this._values[0]) : this._resolve(this._values), 
            !0);
        }, SomePromiseArray.prototype._promiseRejected = function(reason) {
            return this._addRejected(reason), this._checkOutcome();
        }, SomePromiseArray.prototype._promiseCancelled = function() {
            return this._values instanceof Promise || null == this._values ? this._cancel() : (this._addRejected(CANCELLATION), 
            this._checkOutcome());
        }, SomePromiseArray.prototype._checkOutcome = function() {
            if (this.howMany() > this._canPossiblyFulfill()) {
                for (var e = new AggregateError, i = this.length(); i < this._values.length; ++i) this._values[i] !== CANCELLATION && e.push(this._values[i]);
                return e.length > 0 ? this._reject(e) : this._cancel(), !0;
            }
            return !1;
        }, SomePromiseArray.prototype._fulfilled = function() {
            return this._totalResolved;
        }, SomePromiseArray.prototype._rejected = function() {
            return this._values.length - this.length();
        }, SomePromiseArray.prototype._addRejected = function(reason) {
            this._values.push(reason);
        }, SomePromiseArray.prototype._addFulfilled = function(value) {
            this._values[this._totalResolved++] = value;
        }, SomePromiseArray.prototype._canPossiblyFulfill = function() {
            return this.length() - this._rejected();
        }, SomePromiseArray.prototype._getRangeError = function(count) {
            var message = "Input array must contain at least " + this._howMany + " items but contains only " + count + " items";
            return new RangeError(message);
        }, SomePromiseArray.prototype._resolveEmptyArray = function() {
            this._reject(this._getRangeError(0));
        }, Promise.some = function(promises, howMany) {
            return some(promises, howMany);
        }, Promise.prototype.some = function(howMany) {
            return some(this, howMany);
        }, Promise._SomePromiseArray = SomePromiseArray;
    };
}
