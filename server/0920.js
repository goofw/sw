function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise, PromiseArray, tryConvertToPromise, INTERNAL, async, getDomain) {
        var reject, util = __webpack_require__(16), canEvaluate = util.canEvaluate, tryCatch = util.tryCatch, errorObj = util.errorObj;
        if (canEvaluate) {
            for (var thenCallback = function(i) {
                return new Function("value", "holder", "                             \n            'use strict';                                                    \n            holder.pIndex = value;                                           \n            holder.checkFulfillment(this);                                   \n            ".replace(/Index/g, i));
            }, promiseSetter = function(i) {
                return new Function("promise", "holder", "                           \n            'use strict';                                                    \n            holder.pIndex = promise;                                         \n            ".replace(/Index/g, i));
            }, generateHolderClass = function(total) {
                for (var props = new Array(total), i = 0; i < props.length; ++i) props[i] = "this.p" + (i + 1);
                var assignment = props.join(" = ") + " = null;", cancellationCode = "var promise;\n" + props.map((function(prop) {
                    return "                                                         \n                promise = " + prop + ";                                      \n                if (promise instanceof Promise) {                            \n                    promise.cancel();                                        \n                }                                                            \n            ";
                })).join("\n"), passedArguments = props.join(", "), name = "Holder$" + total, code = "return function(tryCatch, errorObj, Promise, async) {    \n            'use strict';                                                    \n            function [TheName](fn) {                                         \n                [TheProperties]                                              \n                this.fn = fn;                                                \n                this.asyncNeeded = true;                                     \n                this.now = 0;                                                \n            }                                                                \n                                                                             \n            [TheName].prototype._callFunction = function(promise) {          \n                promise._pushContext();                                      \n                var ret = tryCatch(this.fn)([ThePassedArguments]);           \n                promise._popContext();                                       \n                if (ret === errorObj) {                                      \n                    promise._rejectCallback(ret.e, false);                   \n                } else {                                                     \n                    promise._resolveCallback(ret);                           \n                }                                                            \n            };                                                               \n                                                                             \n            [TheName].prototype.checkFulfillment = function(promise) {       \n                var now = ++this.now;                                        \n                if (now === [TheTotal]) {                                    \n                    if (this.asyncNeeded) {                                  \n                        async.invoke(this._callFunction, this, promise);     \n                    } else {                                                 \n                        this._callFunction(promise);                         \n                    }                                                        \n                                                                             \n                }                                                            \n            };                                                               \n                                                                             \n            [TheName].prototype._resultCancelled = function() {              \n                [CancellationCode]                                           \n            };                                                               \n                                                                             \n            return [TheName];                                                \n        }(tryCatch, errorObj, Promise, async);                               \n        ";
                return code = code.replace(/\[TheName\]/g, name).replace(/\[TheTotal\]/g, total).replace(/\[ThePassedArguments\]/g, passedArguments).replace(/\[TheProperties\]/g, assignment).replace(/\[CancellationCode\]/g, cancellationCode), 
                new Function("tryCatch", "errorObj", "Promise", "async", code)(tryCatch, errorObj, Promise, async);
            }, holderClasses = [], thenCallbacks = [], promiseSetters = [], i = 0; i < 8; ++i) holderClasses.push(generateHolderClass(i + 1)), 
            thenCallbacks.push(thenCallback(i + 1)), promiseSetters.push(promiseSetter(i + 1));
            reject = function(reason) {
                this._reject(reason);
            };
        }
        Promise.join = function() {
            var fn, last = arguments.length - 1;
            if (last > 0 && "function" == typeof arguments[last] && (fn = arguments[last], last <= 8 && canEvaluate)) {
                (ret = new Promise(INTERNAL))._captureStackTrace();
                for (var HolderClass = holderClasses[last - 1], holder = new HolderClass(fn), callbacks = thenCallbacks, i = 0; i < last; ++i) {
                    var maybePromise = tryConvertToPromise(arguments[i], ret);
                    if (maybePromise instanceof Promise) {
                        var bitField = (maybePromise = maybePromise._target())._bitField;
                        0 == (50397184 & bitField) ? (maybePromise._then(callbacks[i], reject, void 0, ret, holder), 
                        promiseSetters[i](maybePromise, holder), holder.asyncNeeded = !1) : 0 != (33554432 & bitField) ? callbacks[i].call(ret, maybePromise._value(), holder) : 0 != (16777216 & bitField) ? ret._reject(maybePromise._reason()) : ret._cancel();
                    } else callbacks[i].call(ret, maybePromise, holder);
                }
                if (!ret._isFateSealed()) {
                    if (holder.asyncNeeded) {
                        var domain = getDomain();
                        null !== domain && (holder.fn = util.domainBind(domain, holder.fn));
                    }
                    ret._setAsyncGuaranteed(), ret._setOnCancel(holder);
                }
                return ret;
            }
            for (var $_len = arguments.length, args = new Array($_len), $_i = 0; $_i < $_len; ++$_i) args[$_i] = arguments[$_i];
            fn && args.pop();
            var ret = new PromiseArray(args).promise();
            return void 0 !== fn ? ret.spread(fn) : ret;
        };
    };
}
