function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise) {
        var util = __webpack_require__(16), async = Promise._async, tryCatch = util.tryCatch, errorObj = util.errorObj;
        function spreadAdapter(val, nodeback) {
            if (!util.isArray(val)) return successAdapter.call(this, val, nodeback);
            var ret = tryCatch(nodeback).apply(this._boundValue(), [ null ].concat(val));
            ret === errorObj && async.throwLater(ret.e);
        }
        function successAdapter(val, nodeback) {
            var receiver = this._boundValue(), ret = void 0 === val ? tryCatch(nodeback).call(receiver, null) : tryCatch(nodeback).call(receiver, null, val);
            ret === errorObj && async.throwLater(ret.e);
        }
        function errorAdapter(reason, nodeback) {
            if (!reason) {
                var newReason = new Error(reason + "");
                newReason.cause = reason, reason = newReason;
            }
            var ret = tryCatch(nodeback).call(this._boundValue(), reason);
            ret === errorObj && async.throwLater(ret.e);
        }
        Promise.prototype.asCallback = Promise.prototype.nodeify = function(nodeback, options) {
            if ("function" == typeof nodeback) {
                var adapter = successAdapter;
                void 0 !== options && Object(options).spread && (adapter = spreadAdapter), this._then(adapter, errorAdapter, void 0, this, nodeback);
            }
            return this;
        };
    };
}
