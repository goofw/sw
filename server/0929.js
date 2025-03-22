function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise, PromiseArray, debug) {
        var PromiseInspection = Promise.PromiseInspection;
        function SettledPromiseArray(values) {
            this.constructor$(values);
        }
        __webpack_require__(16).inherits(SettledPromiseArray, PromiseArray), SettledPromiseArray.prototype._promiseResolved = function(index, inspection) {
            return this._values[index] = inspection, ++this._totalResolved >= this._length && (this._resolve(this._values), 
            !0);
        }, SettledPromiseArray.prototype._promiseFulfilled = function(value, index) {
            var ret = new PromiseInspection;
            return ret._bitField = 33554432, ret._settledValueField = value, this._promiseResolved(index, ret);
        }, SettledPromiseArray.prototype._promiseRejected = function(reason, index) {
            var ret = new PromiseInspection;
            return ret._bitField = 16777216, ret._settledValueField = reason, this._promiseResolved(index, ret);
        }, Promise.settle = function(promises) {
            return debug.deprecated(".settle()", ".reflect()"), new SettledPromiseArray(promises).promise();
        }, Promise.prototype.settle = function() {
            return Promise.settle(this);
        };
    };
}
