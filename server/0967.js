function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise) {
        function returner() {
            return this.value;
        }
        function thrower() {
            throw this.reason;
        }
        Promise.prototype.return = Promise.prototype.thenReturn = function(value) {
            return value instanceof Promise && value.suppressUnhandledRejections(), this._then(returner, void 0, void 0, {
                value: value
            }, void 0);
        }, Promise.prototype.throw = Promise.prototype.thenThrow = function(reason) {
            return this._then(thrower, void 0, void 0, {
                reason: reason
            }, void 0);
        }, Promise.prototype.catchThrow = function(reason) {
            if (arguments.length <= 1) return this._then(void 0, thrower, void 0, {
                reason: reason
            }, void 0);
            var _reason = arguments[1], handler = function() {
                throw _reason;
            };
            return this.caught(reason, handler);
        }, Promise.prototype.catchReturn = function(value) {
            if (arguments.length <= 1) return value instanceof Promise && value.suppressUnhandledRejections(), 
            this._then(void 0, returner, void 0, {
                value: value
            }, void 0);
            var _value = arguments[1];
            _value instanceof Promise && _value.suppressUnhandledRejections();
            var handler = function() {
                return _value;
            };
            return this.caught(value, handler);
        };
    };
}
