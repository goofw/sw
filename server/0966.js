function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise, PromiseArray, apiRejection, debug) {
        var util = __webpack_require__(17), tryCatch = util.tryCatch, errorObj = util.errorObj, async = Promise._async;
        Promise.prototype.break = Promise.prototype.cancel = function() {
            if (!debug.cancellation()) return this._warn("cancellation is disabled");
            for (var promise = this, child = promise; promise._isCancellable(); ) {
                if (!promise._cancelBy(child)) {
                    child._isFollowing() ? child._followee().cancel() : child._cancelBranched();
                    break;
                }
                var parent = promise._cancellationParent;
                if (null == parent || !parent._isCancellable()) {
                    promise._isFollowing() ? promise._followee().cancel() : promise._cancelBranched();
                    break;
                }
                promise._isFollowing() && promise._followee().cancel(), promise._setWillBeCancelled(), 
                child = promise, promise = parent;
            }
        }, Promise.prototype._branchHasCancelled = function() {
            this._branchesRemainingToCancel--;
        }, Promise.prototype._enoughBranchesHaveCancelled = function() {
            return void 0 === this._branchesRemainingToCancel || this._branchesRemainingToCancel <= 0;
        }, Promise.prototype._cancelBy = function(canceller) {
            return canceller === this ? (this._branchesRemainingToCancel = 0, this._invokeOnCancel(), 
            !0) : (this._branchHasCancelled(), !!this._enoughBranchesHaveCancelled() && (this._invokeOnCancel(), 
            !0));
        }, Promise.prototype._cancelBranched = function() {
            this._enoughBranchesHaveCancelled() && this._cancel();
        }, Promise.prototype._cancel = function() {
            this._isCancellable() && (this._setCancelled(), async.invoke(this._cancelPromises, this, void 0));
        }, Promise.prototype._cancelPromises = function() {
            this._length() > 0 && this._settlePromises();
        }, Promise.prototype._unsetOnCancel = function() {
            this._onCancelField = void 0;
        }, Promise.prototype._isCancellable = function() {
            return this.isPending() && !this._isCancelled();
        }, Promise.prototype.isCancellable = function() {
            return this.isPending() && !this.isCancelled();
        }, Promise.prototype._doInvokeOnCancel = function(onCancelCallback, internalOnly) {
            if (util.isArray(onCancelCallback)) for (var i = 0; i < onCancelCallback.length; ++i) this._doInvokeOnCancel(onCancelCallback[i], internalOnly); else if (void 0 !== onCancelCallback) if ("function" == typeof onCancelCallback) {
                if (!internalOnly) {
                    var e = tryCatch(onCancelCallback).call(this._boundValue());
                    e === errorObj && (this._attachExtraTrace(e.e), async.throwLater(e.e));
                }
            } else onCancelCallback._resultCancelled(this);
        }, Promise.prototype._invokeOnCancel = function() {
            var onCancelCallback = this._onCancel();
            this._unsetOnCancel(), async.invoke(this._doInvokeOnCancel, this, onCancelCallback);
        }, Promise.prototype._invokeInternalOnCancel = function() {
            this._isCancellable() && (this._doInvokeOnCancel(this._onCancel(), !0), this._unsetOnCancel());
        }, Promise.prototype._resultCancelled = function() {
            this.cancel();
        };
    };
}
