function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise, apiRejection, INTERNAL, tryConvertToPromise, Proxyable, debug) {
        var TypeError = __webpack_require__(58).TypeError, util = __webpack_require__(17), errorObj = util.errorObj, tryCatch = util.tryCatch, yieldHandlers = [];
        function PromiseSpawn(generatorFunction, receiver, yieldHandler, stack) {
            if (debug.cancellation()) {
                var internal = new Promise(INTERNAL), _finallyPromise = this._finallyPromise = new Promise(INTERNAL);
                this._promise = internal.lastly((function() {
                    return _finallyPromise;
                })), internal._captureStackTrace(), internal._setOnCancel(this);
            } else (this._promise = new Promise(INTERNAL))._captureStackTrace();
            this._stack = stack, this._generatorFunction = generatorFunction, this._receiver = receiver, 
            this._generator = void 0, this._yieldHandlers = "function" == typeof yieldHandler ? [ yieldHandler ].concat(yieldHandlers) : yieldHandlers, 
            this._yieldedPromise = null, this._cancellationPhase = !1;
        }
        util.inherits(PromiseSpawn, Proxyable), PromiseSpawn.prototype._isResolved = function() {
            return null === this._promise;
        }, PromiseSpawn.prototype._cleanup = function() {
            this._promise = this._generator = null, debug.cancellation() && null !== this._finallyPromise && (this._finallyPromise._fulfill(), 
            this._finallyPromise = null);
        }, PromiseSpawn.prototype._promiseCancelled = function() {
            if (!this._isResolved()) {
                var result;
                if (void 0 !== this._generator.return) this._promise._pushContext(), result = tryCatch(this._generator.return).call(this._generator, void 0), 
                this._promise._popContext(); else {
                    var reason = new Promise.CancellationError("generator .return() sentinel");
                    Promise.coroutine.returnSentinel = reason, this._promise._attachExtraTrace(reason), 
                    this._promise._pushContext(), result = tryCatch(this._generator.throw).call(this._generator, reason), 
                    this._promise._popContext();
                }
                this._cancellationPhase = !0, this._yieldedPromise = null, this._continue(result);
            }
        }, PromiseSpawn.prototype._promiseFulfilled = function(value) {
            this._yieldedPromise = null, this._promise._pushContext();
            var result = tryCatch(this._generator.next).call(this._generator, value);
            this._promise._popContext(), this._continue(result);
        }, PromiseSpawn.prototype._promiseRejected = function(reason) {
            this._yieldedPromise = null, this._promise._attachExtraTrace(reason), this._promise._pushContext();
            var result = tryCatch(this._generator.throw).call(this._generator, reason);
            this._promise._popContext(), this._continue(result);
        }, PromiseSpawn.prototype._resultCancelled = function() {
            if (this._yieldedPromise instanceof Promise) {
                var promise = this._yieldedPromise;
                this._yieldedPromise = null, promise.cancel();
            }
        }, PromiseSpawn.prototype.promise = function() {
            return this._promise;
        }, PromiseSpawn.prototype._run = function() {
            this._generator = this._generatorFunction.call(this._receiver), this._receiver = this._generatorFunction = void 0, 
            this._promiseFulfilled(void 0);
        }, PromiseSpawn.prototype._continue = function(result) {
            var promise = this._promise;
            if (result === errorObj) return this._cleanup(), this._cancellationPhase ? promise.cancel() : promise._rejectCallback(result.e, !1);
            var value = result.value;
            if (!0 === result.done) return this._cleanup(), this._cancellationPhase ? promise.cancel() : promise._resolveCallback(value);
            var maybePromise = tryConvertToPromise(value, this._promise);
            if (maybePromise instanceof Promise || (maybePromise = (function(value, yieldHandlers, traceParent) {
                for (var i = 0; i < yieldHandlers.length; ++i) {
                    traceParent._pushContext();
                    var result = tryCatch(yieldHandlers[i])(value);
                    if (traceParent._popContext(), result === errorObj) {
                        traceParent._pushContext();
                        var ret = Promise.reject(errorObj.e);
                        return traceParent._popContext(), ret;
                    }
                    var maybePromise = tryConvertToPromise(result, traceParent);
                    if (maybePromise instanceof Promise) return maybePromise;
                }
                return null;
            })(maybePromise, this._yieldHandlers, this._promise), null !== maybePromise)) {
                var bitField = (maybePromise = maybePromise._target())._bitField;
                0 == (50397184 & bitField) ? (this._yieldedPromise = maybePromise, maybePromise._proxy(this, null)) : 0 != (33554432 & bitField) ? Promise._async.invoke(this._promiseFulfilled, this, maybePromise._value()) : 0 != (16777216 & bitField) ? Promise._async.invoke(this._promiseRejected, this, maybePromise._reason()) : this._promiseCancelled();
            } else this._promiseRejected(new TypeError("A value %s was yielded that could not be treated as a promise\n\n    See http://goo.gl/MqrFmX\n\n".replace("%s", value) + "From coroutine:\n" + this._stack.split("\n").slice(1, -7).join("\n")));
        }, Promise.coroutine = function(generatorFunction, options) {
            if ("function" != typeof generatorFunction) throw new TypeError("generatorFunction must be a function\n\n    See http://goo.gl/MqrFmX\n");
            var yieldHandler = Object(options).yieldHandler, PromiseSpawn$ = PromiseSpawn, stack = (new Error).stack;
            return function() {
                var generator = generatorFunction.apply(this, arguments), spawn = new PromiseSpawn$(void 0, void 0, yieldHandler, stack), ret = spawn.promise();
                return spawn._generator = generator, spawn._promiseFulfilled(void 0), ret;
            };
        }, Promise.coroutine.addYieldHandler = function(fn) {
            if ("function" != typeof fn) throw new TypeError("expecting a function but got " + util.classString(fn));
            yieldHandlers.push(fn);
        }, Promise.spawn = function(generatorFunction) {
            if (debug.deprecated("Promise.spawn()", "Promise.coroutine()"), "function" != typeof generatorFunction) return apiRejection("generatorFunction must be a function\n\n    See http://goo.gl/MqrFmX\n");
            var spawn = new PromiseSpawn(generatorFunction, this), ret = spawn.promise();
            return spawn._run(Promise.spawn), ret;
        };
    };
}
