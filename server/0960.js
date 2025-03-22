function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise) {
        var longStackTraces = !1, contextStack = [];
        function Context() {
            this._trace = new Context.CapturedTrace(peekContext());
        }
        function peekContext() {
            var lastIndex = contextStack.length - 1;
            if (lastIndex >= 0) return contextStack[lastIndex];
        }
        return Promise.prototype._promiseCreated = function() {}, Promise.prototype._pushContext = function() {}, 
        Promise.prototype._popContext = function() {
            return null;
        }, Promise._peekContext = Promise.prototype._peekContext = function() {}, Context.prototype._pushContext = function() {
            void 0 !== this._trace && (this._trace._promiseCreated = null, contextStack.push(this._trace));
        }, Context.prototype._popContext = function() {
            if (void 0 !== this._trace) {
                var trace = contextStack.pop(), ret = trace._promiseCreated;
                return trace._promiseCreated = null, ret;
            }
            return null;
        }, Context.CapturedTrace = null, Context.create = function() {
            if (longStackTraces) return new Context;
        }, Context.deactivateLongStackTraces = function() {}, Context.activateLongStackTraces = function() {
            var Promise_pushContext = Promise.prototype._pushContext, Promise_popContext = Promise.prototype._popContext, Promise_PeekContext = Promise._peekContext, Promise_peekContext = Promise.prototype._peekContext, Promise_promiseCreated = Promise.prototype._promiseCreated;
            Context.deactivateLongStackTraces = function() {
                Promise.prototype._pushContext = Promise_pushContext, Promise.prototype._popContext = Promise_popContext, 
                Promise._peekContext = Promise_PeekContext, Promise.prototype._peekContext = Promise_peekContext, 
                Promise.prototype._promiseCreated = Promise_promiseCreated, longStackTraces = !1;
            }, longStackTraces = !0, Promise.prototype._pushContext = Context.prototype._pushContext, 
            Promise.prototype._popContext = Context.prototype._popContext, Promise._peekContext = Promise.prototype._peekContext = peekContext, 
            Promise.prototype._promiseCreated = function() {
                var ctx = this._peekContext();
                ctx && null == ctx._promiseCreated && (ctx._promiseCreated = this);
            };
        }, Context;
    };
}
