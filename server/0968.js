function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise) {
        function PromiseInspection(promise) {
            void 0 !== promise ? (promise = promise._target(), this._bitField = promise._bitField, 
            this._settledValueField = promise._isFateSealed() ? promise._settledValue() : void 0) : (this._bitField = 0, 
            this._settledValueField = void 0);
        }
        PromiseInspection.prototype._settledValue = function() {
            return this._settledValueField;
        };
        var value = PromiseInspection.prototype.value = function() {
            if (!this.isFulfilled()) throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\n\n    See http://goo.gl/MqrFmX\n");
            return this._settledValue();
        }, reason = PromiseInspection.prototype.error = PromiseInspection.prototype.reason = function() {
            if (!this.isRejected()) throw new TypeError("cannot get rejection reason of a non-rejected promise\n\n    See http://goo.gl/MqrFmX\n");
            return this._settledValue();
        }, isFulfilled = PromiseInspection.prototype.isFulfilled = function() {
            return 0 != (33554432 & this._bitField);
        }, isRejected = PromiseInspection.prototype.isRejected = function() {
            return 0 != (16777216 & this._bitField);
        }, isPending = PromiseInspection.prototype.isPending = function() {
            return 0 == (50397184 & this._bitField);
        }, isResolved = PromiseInspection.prototype.isResolved = function() {
            return 0 != (50331648 & this._bitField);
        };
        PromiseInspection.prototype.isCancelled = function() {
            return 0 != (8454144 & this._bitField);
        }, Promise.prototype.__isCancelled = function() {
            return 65536 == (65536 & this._bitField);
        }, Promise.prototype._isCancelled = function() {
            return this._target().__isCancelled();
        }, Promise.prototype.isCancelled = function() {
            return 0 != (8454144 & this._target()._bitField);
        }, Promise.prototype.isPending = function() {
            return isPending.call(this._target());
        }, Promise.prototype.isRejected = function() {
            return isRejected.call(this._target());
        }, Promise.prototype.isFulfilled = function() {
            return isFulfilled.call(this._target());
        }, Promise.prototype.isResolved = function() {
            return isResolved.call(this._target());
        }, Promise.prototype.value = function() {
            return value.call(this._target());
        }, Promise.prototype.reason = function() {
            var target = this._target();
            return target._unsetRejectionIsUnhandled(), reason.call(target);
        }, Promise.prototype._value = function() {
            return this._settledValue();
        }, Promise.prototype._reason = function() {
            return this._unsetRejectionIsUnhandled(), this._settledValue();
        }, Promise.PromiseInspection = PromiseInspection;
    };
}
