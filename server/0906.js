function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function() {
        var makeSelfResolutionError = function() {
            return new TypeError("circular promise resolution chain\n\n    See http://goo.gl/MqrFmX\n");
        }, reflectHandler = function() {
            return new Promise.PromiseInspection(this._target());
        }, apiRejection = function(msg) {
            return Promise.reject(new TypeError(msg));
        };
        function Proxyable() {}
        var getDomain, UNDEFINED_BINDING = {}, util = __webpack_require__(16);
        getDomain = util.isNode ? function() {
            var ret = process.domain;
            return void 0 === ret && (ret = null), ret;
        } : function() {
            return null;
        }, util.notEnumerableProp(Promise, "_getDomain", getDomain);
        var es5 = __webpack_require__(66), Async = __webpack_require__(907), async = new Async;
        es5.defineProperty(Promise, "_async", {
            value: async
        });
        var errors = __webpack_require__(55), TypeError = Promise.TypeError = errors.TypeError;
        Promise.RangeError = errors.RangeError;
        var CancellationError = Promise.CancellationError = errors.CancellationError;
        Promise.TimeoutError = errors.TimeoutError, Promise.OperationalError = errors.OperationalError, 
        Promise.RejectionError = errors.OperationalError, Promise.AggregateError = errors.AggregateError;
        var INTERNAL = function() {}, APPLY = {}, NEXT_FILTER = {}, tryConvertToPromise = __webpack_require__(910)(Promise, INTERNAL), PromiseArray = __webpack_require__(911)(Promise, INTERNAL, tryConvertToPromise, apiRejection, Proxyable), Context = __webpack_require__(912)(Promise), createContext = Context.create, debug = __webpack_require__(913)(Promise, Context), PassThroughHandlerContext = (debug.CapturedTrace, 
        __webpack_require__(914)(Promise, tryConvertToPromise, NEXT_FILTER)), catchFilter = __webpack_require__(441)(NEXT_FILTER), nodebackForPromise = __webpack_require__(442), errorObj = util.errorObj, tryCatch = util.tryCatch;
        function Promise(executor) {
            executor !== INTERNAL && (function(self, executor) {
                if (null == self || self.constructor !== Promise) throw new TypeError("the promise constructor cannot be invoked directly\n\n    See http://goo.gl/MqrFmX\n");
                if ("function" != typeof executor) throw new TypeError("expecting a function but got " + util.classString(executor));
            })(this, executor), this._bitField = 0, this._fulfillmentHandler0 = void 0, this._rejectionHandler0 = void 0, 
            this._promise0 = void 0, this._receiver0 = void 0, this._resolveFromExecutor(executor), 
            this._promiseCreated(), this._fireEvent("promiseCreated", this);
        }
        function deferResolve(v) {
            this.promise._resolveCallback(v);
        }
        function deferReject(v) {
            this.promise._rejectCallback(v, !1);
        }
        function fillTypes(value) {
            var p = new Promise(INTERNAL);
            p._fulfillmentHandler0 = value, p._rejectionHandler0 = value, p._promise0 = value, 
            p._receiver0 = value;
        }
        return Promise.prototype.toString = function() {
            return "[object Promise]";
        }, Promise.prototype.caught = Promise.prototype.catch = function(fn) {
            var len = arguments.length;
            if (len > 1) {
                var i, catchInstances = new Array(len - 1), j = 0;
                for (i = 0; i < len - 1; ++i) {
                    var item = arguments[i];
                    if (!util.isObject(item)) return apiRejection("Catch statement predicate: expecting an object but got " + util.classString(item));
                    catchInstances[j++] = item;
                }
                if (catchInstances.length = j, "function" != typeof (fn = arguments[i])) throw new TypeError("The last argument to .catch() must be a function, got " + util.toString(fn));
                return this.then(void 0, catchFilter(catchInstances, fn, this));
            }
            return this.then(void 0, fn);
        }, Promise.prototype.reflect = function() {
            return this._then(reflectHandler, reflectHandler, void 0, this, void 0);
        }, Promise.prototype.then = function(didFulfill, didReject) {
            if (debug.warnings() && arguments.length > 0 && "function" != typeof didFulfill && "function" != typeof didReject) {
                var msg = ".then() only accepts functions but was passed: " + util.classString(didFulfill);
                arguments.length > 1 && (msg += ", " + util.classString(didReject)), this._warn(msg);
            }
            return this._then(didFulfill, didReject, void 0, void 0, void 0);
        }, Promise.prototype.done = function(didFulfill, didReject) {
            this._then(didFulfill, didReject, void 0, void 0, void 0)._setIsFinal();
        }, Promise.prototype.spread = function(fn) {
            return "function" != typeof fn ? apiRejection("expecting a function but got " + util.classString(fn)) : this.all()._then(fn, void 0, void 0, APPLY, void 0);
        }, Promise.prototype.toJSON = function() {
            var ret = {
                isFulfilled: !1,
                isRejected: !1,
                fulfillmentValue: void 0,
                rejectionReason: void 0
            };
            return this.isFulfilled() ? (ret.fulfillmentValue = this.value(), ret.isFulfilled = !0) : this.isRejected() && (ret.rejectionReason = this.reason(), 
            ret.isRejected = !0), ret;
        }, Promise.prototype.all = function() {
            return arguments.length > 0 && this._warn(".all() was passed arguments but it does not take any"), 
            new PromiseArray(this).promise();
        }, Promise.prototype.error = function(fn) {
            return this.caught(util.originatesFromRejection, fn);
        }, Promise.getNewLibraryCopy = module.exports, Promise.is = function(val) {
            return val instanceof Promise;
        }, Promise.fromNode = Promise.fromCallback = function(fn) {
            var ret = new Promise(INTERNAL);
            ret._captureStackTrace();
            var multiArgs = arguments.length > 1 && !!Object(arguments[1]).multiArgs, result = tryCatch(fn)(nodebackForPromise(ret, multiArgs));
            return result === errorObj && ret._rejectCallback(result.e, !0), ret._isFateSealed() || ret._setAsyncGuaranteed(), 
            ret;
        }, Promise.all = function(promises) {
            return new PromiseArray(promises).promise();
        }, Promise.cast = function(obj) {
            var ret = tryConvertToPromise(obj);
            return ret instanceof Promise || ((ret = new Promise(INTERNAL))._captureStackTrace(), 
            ret._setFulfilled(), ret._rejectionHandler0 = obj), ret;
        }, Promise.resolve = Promise.fulfilled = Promise.cast, Promise.reject = Promise.rejected = function(reason) {
            var ret = new Promise(INTERNAL);
            return ret._captureStackTrace(), ret._rejectCallback(reason, !0), ret;
        }, Promise.setScheduler = function(fn) {
            if ("function" != typeof fn) throw new TypeError("expecting a function but got " + util.classString(fn));
            return async.setScheduler(fn);
        }, Promise.prototype._then = function(didFulfill, didReject, _, receiver, internalData) {
            var haveInternalData = void 0 !== internalData, promise = haveInternalData ? internalData : new Promise(INTERNAL), target = this._target(), bitField = target._bitField;
            haveInternalData || (promise._propagateFrom(this, 3), promise._captureStackTrace(), 
            void 0 === receiver && 0 != (2097152 & this._bitField) && (receiver = 0 != (50397184 & bitField) ? this._boundValue() : target === this ? void 0 : this._boundTo), 
            this._fireEvent("promiseChained", this, promise));
            var domain = getDomain();
            if (0 != (50397184 & bitField)) {
                var handler, value, settler = target._settlePromiseCtx;
                0 != (33554432 & bitField) ? (value = target._rejectionHandler0, handler = didFulfill) : 0 != (16777216 & bitField) ? (value = target._fulfillmentHandler0, 
                handler = didReject, target._unsetRejectionIsUnhandled()) : (settler = target._settlePromiseLateCancellationObserver, 
                value = new CancellationError("late cancellation observer"), target._attachExtraTrace(value), 
                handler = didReject), async.invoke(settler, target, {
                    handler: null === domain ? handler : "function" == typeof handler && util.domainBind(domain, handler),
                    promise: promise,
                    receiver: receiver,
                    value: value
                });
            } else target._addCallbacks(didFulfill, didReject, promise, receiver, domain);
            return promise;
        }, Promise.prototype._length = function() {
            return 65535 & this._bitField;
        }, Promise.prototype._isFateSealed = function() {
            return 0 != (117506048 & this._bitField);
        }, Promise.prototype._isFollowing = function() {
            return 67108864 == (67108864 & this._bitField);
        }, Promise.prototype._setLength = function(len) {
            this._bitField = -65536 & this._bitField | 65535 & len;
        }, Promise.prototype._setFulfilled = function() {
            this._bitField = 33554432 | this._bitField, this._fireEvent("promiseFulfilled", this);
        }, Promise.prototype._setRejected = function() {
            this._bitField = 16777216 | this._bitField, this._fireEvent("promiseRejected", this);
        }, Promise.prototype._setFollowing = function() {
            this._bitField = 67108864 | this._bitField, this._fireEvent("promiseResolved", this);
        }, Promise.prototype._setIsFinal = function() {
            this._bitField = 4194304 | this._bitField;
        }, Promise.prototype._isFinal = function() {
            return (4194304 & this._bitField) > 0;
        }, Promise.prototype._unsetCancelled = function() {
            this._bitField = -65537 & this._bitField;
        }, Promise.prototype._setCancelled = function() {
            this._bitField = 65536 | this._bitField, this._fireEvent("promiseCancelled", this);
        }, Promise.prototype._setWillBeCancelled = function() {
            this._bitField = 8388608 | this._bitField;
        }, Promise.prototype._setAsyncGuaranteed = function() {
            async.hasCustomScheduler() || (this._bitField = 134217728 | this._bitField);
        }, Promise.prototype._receiverAt = function(index) {
            var ret = 0 === index ? this._receiver0 : this[4 * index - 4 + 3];
            if (ret !== UNDEFINED_BINDING) return void 0 === ret && this._isBound() ? this._boundValue() : ret;
        }, Promise.prototype._promiseAt = function(index) {
            return this[4 * index - 4 + 2];
        }, Promise.prototype._fulfillmentHandlerAt = function(index) {
            return this[4 * index - 4 + 0];
        }, Promise.prototype._rejectionHandlerAt = function(index) {
            return this[4 * index - 4 + 1];
        }, Promise.prototype._boundValue = function() {}, Promise.prototype._migrateCallback0 = function(follower) {
            follower._bitField;
            var fulfill = follower._fulfillmentHandler0, reject = follower._rejectionHandler0, promise = follower._promise0, receiver = follower._receiverAt(0);
            void 0 === receiver && (receiver = UNDEFINED_BINDING), this._addCallbacks(fulfill, reject, promise, receiver, null);
        }, Promise.prototype._migrateCallbackAt = function(follower, index) {
            var fulfill = follower._fulfillmentHandlerAt(index), reject = follower._rejectionHandlerAt(index), promise = follower._promiseAt(index), receiver = follower._receiverAt(index);
            void 0 === receiver && (receiver = UNDEFINED_BINDING), this._addCallbacks(fulfill, reject, promise, receiver, null);
        }, Promise.prototype._addCallbacks = function(fulfill, reject, promise, receiver, domain) {
            var index = this._length();
            if (index >= 65531 && (index = 0, this._setLength(0)), 0 === index) this._promise0 = promise, 
            this._receiver0 = receiver, "function" == typeof fulfill && (this._fulfillmentHandler0 = null === domain ? fulfill : util.domainBind(domain, fulfill)), 
            "function" == typeof reject && (this._rejectionHandler0 = null === domain ? reject : util.domainBind(domain, reject)); else {
                var base = 4 * index - 4;
                this[base + 2] = promise, this[base + 3] = receiver, "function" == typeof fulfill && (this[base + 0] = null === domain ? fulfill : util.domainBind(domain, fulfill)), 
                "function" == typeof reject && (this[base + 1] = null === domain ? reject : util.domainBind(domain, reject));
            }
            return this._setLength(index + 1), index;
        }, Promise.prototype._proxy = function(proxyable, arg) {
            this._addCallbacks(void 0, void 0, arg, proxyable, null);
        }, Promise.prototype._resolveCallback = function(value, shouldBind) {
            if (0 == (117506048 & this._bitField)) {
                if (value === this) return this._rejectCallback(makeSelfResolutionError(), !1);
                var maybePromise = tryConvertToPromise(value, this);
                if (!(maybePromise instanceof Promise)) return this._fulfill(value);
                shouldBind && this._propagateFrom(maybePromise, 2);
                var promise = maybePromise._target();
                if (promise !== this) {
                    var bitField = promise._bitField;
                    if (0 == (50397184 & bitField)) {
                        var len = this._length();
                        len > 0 && promise._migrateCallback0(this);
                        for (var i = 1; i < len; ++i) promise._migrateCallbackAt(this, i);
                        this._setFollowing(), this._setLength(0), this._setFollowee(promise);
                    } else if (0 != (33554432 & bitField)) this._fulfill(promise._value()); else if (0 != (16777216 & bitField)) this._reject(promise._reason()); else {
                        var reason = new CancellationError("late cancellation observer");
                        promise._attachExtraTrace(reason), this._reject(reason);
                    }
                } else this._reject(makeSelfResolutionError());
            }
        }, Promise.prototype._rejectCallback = function(reason, synchronous, ignoreNonErrorWarnings) {
            var trace = util.ensureErrorObject(reason), hasStack = trace === reason;
            if (!hasStack && !ignoreNonErrorWarnings && debug.warnings()) {
                var message = "a promise was rejected with a non-error: " + util.classString(reason);
                this._warn(message, !0);
            }
            this._attachExtraTrace(trace, !!synchronous && hasStack), this._reject(reason);
        }, Promise.prototype._resolveFromExecutor = function(executor) {
            if (executor !== INTERNAL) {
                var promise = this;
                this._captureStackTrace(), this._pushContext();
                var synchronous = !0, r = this._execute(executor, (function(value) {
                    promise._resolveCallback(value);
                }), (function(reason) {
                    promise._rejectCallback(reason, synchronous);
                }));
                synchronous = !1, this._popContext(), void 0 !== r && promise._rejectCallback(r, !0);
            }
        }, Promise.prototype._settlePromiseFromHandler = function(handler, receiver, value, promise) {
            var bitField = promise._bitField;
            if (0 == (65536 & bitField)) {
                var x;
                promise._pushContext(), receiver === APPLY ? value && "number" == typeof value.length ? x = tryCatch(handler).apply(this._boundValue(), value) : (x = errorObj).e = new TypeError("cannot .spread() a non-array: " + util.classString(value)) : x = tryCatch(handler).call(receiver, value);
                var promiseCreated = promise._popContext();
                0 == (65536 & (bitField = promise._bitField)) && (x === NEXT_FILTER ? promise._reject(value) : x === errorObj ? promise._rejectCallback(x.e, !1) : (debug.checkForgottenReturns(x, promiseCreated, "", promise, this), 
                promise._resolveCallback(x)));
            }
        }, Promise.prototype._target = function() {
            for (var ret = this; ret._isFollowing(); ) ret = ret._followee();
            return ret;
        }, Promise.prototype._followee = function() {
            return this._rejectionHandler0;
        }, Promise.prototype._setFollowee = function(promise) {
            this._rejectionHandler0 = promise;
        }, Promise.prototype._settlePromise = function(promise, handler, receiver, value) {
            var isPromise = promise instanceof Promise, bitField = this._bitField, asyncGuaranteed = 0 != (134217728 & bitField);
            0 != (65536 & bitField) ? (isPromise && promise._invokeInternalOnCancel(), receiver instanceof PassThroughHandlerContext && receiver.isFinallyHandler() ? (receiver.cancelPromise = promise, 
            tryCatch(handler).call(receiver, value) === errorObj && promise._reject(errorObj.e)) : handler === reflectHandler ? promise._fulfill(reflectHandler.call(receiver)) : receiver instanceof Proxyable ? receiver._promiseCancelled(promise) : isPromise || promise instanceof PromiseArray ? promise._cancel() : receiver.cancel()) : "function" == typeof handler ? isPromise ? (asyncGuaranteed && promise._setAsyncGuaranteed(), 
            this._settlePromiseFromHandler(handler, receiver, value, promise)) : handler.call(receiver, value, promise) : receiver instanceof Proxyable ? receiver._isResolved() || (0 != (33554432 & bitField) ? receiver._promiseFulfilled(value, promise) : receiver._promiseRejected(value, promise)) : isPromise && (asyncGuaranteed && promise._setAsyncGuaranteed(), 
            0 != (33554432 & bitField) ? promise._fulfill(value) : promise._reject(value));
        }, Promise.prototype._settlePromiseLateCancellationObserver = function(ctx) {
            var handler = ctx.handler, promise = ctx.promise, receiver = ctx.receiver, value = ctx.value;
            "function" == typeof handler ? promise instanceof Promise ? this._settlePromiseFromHandler(handler, receiver, value, promise) : handler.call(receiver, value, promise) : promise instanceof Promise && promise._reject(value);
        }, Promise.prototype._settlePromiseCtx = function(ctx) {
            this._settlePromise(ctx.promise, ctx.handler, ctx.receiver, ctx.value);
        }, Promise.prototype._settlePromise0 = function(handler, value, bitField) {
            var promise = this._promise0, receiver = this._receiverAt(0);
            this._promise0 = void 0, this._receiver0 = void 0, this._settlePromise(promise, handler, receiver, value);
        }, Promise.prototype._clearCallbackDataAtIndex = function(index) {
            var base = 4 * index - 4;
            this[base + 2] = this[base + 3] = this[base + 0] = this[base + 1] = void 0;
        }, Promise.prototype._fulfill = function(value) {
            var bitField = this._bitField;
            if (!((117506048 & bitField) >>> 16)) {
                if (value === this) {
                    var err = makeSelfResolutionError();
                    return this._attachExtraTrace(err), this._reject(err);
                }
                this._setFulfilled(), this._rejectionHandler0 = value, (65535 & bitField) > 0 && (0 != (134217728 & bitField) ? this._settlePromises() : async.settlePromises(this), 
                this._dereferenceTrace());
            }
        }, Promise.prototype._reject = function(reason) {
            var bitField = this._bitField;
            if (!((117506048 & bitField) >>> 16)) {
                if (this._setRejected(), this._fulfillmentHandler0 = reason, this._isFinal()) return async.fatalError(reason, util.isNode);
                (65535 & bitField) > 0 ? async.settlePromises(this) : this._ensurePossibleRejectionHandled();
            }
        }, Promise.prototype._fulfillPromises = function(len, value) {
            for (var i = 1; i < len; i++) {
                var handler = this._fulfillmentHandlerAt(i), promise = this._promiseAt(i), receiver = this._receiverAt(i);
                this._clearCallbackDataAtIndex(i), this._settlePromise(promise, handler, receiver, value);
            }
        }, Promise.prototype._rejectPromises = function(len, reason) {
            for (var i = 1; i < len; i++) {
                var handler = this._rejectionHandlerAt(i), promise = this._promiseAt(i), receiver = this._receiverAt(i);
                this._clearCallbackDataAtIndex(i), this._settlePromise(promise, handler, receiver, reason);
            }
        }, Promise.prototype._settlePromises = function() {
            var bitField = this._bitField, len = 65535 & bitField;
            if (len > 0) {
                if (0 != (16842752 & bitField)) {
                    var reason = this._fulfillmentHandler0;
                    this._settlePromise0(this._rejectionHandler0, reason, bitField), this._rejectPromises(len, reason);
                } else {
                    var value = this._rejectionHandler0;
                    this._settlePromise0(this._fulfillmentHandler0, value, bitField), this._fulfillPromises(len, value);
                }
                this._setLength(0);
            }
            this._clearCancellationData();
        }, Promise.prototype._settledValue = function() {
            var bitField = this._bitField;
            return 0 != (33554432 & bitField) ? this._rejectionHandler0 : 0 != (16777216 & bitField) ? this._fulfillmentHandler0 : void 0;
        }, "undefined" != typeof Symbol && Symbol.toStringTag && es5.defineProperty(Promise.prototype, Symbol.toStringTag, {
            get: function() {
                return "Object";
            }
        }), Promise.defer = Promise.pending = function() {
            return debug.deprecated("Promise.defer", "new Promise"), {
                promise: new Promise(INTERNAL),
                resolve: deferResolve,
                reject: deferReject
            };
        }, util.notEnumerableProp(Promise, "_makeSelfResolutionError", makeSelfResolutionError), 
        __webpack_require__(915)(Promise, INTERNAL, tryConvertToPromise, apiRejection, debug), 
        __webpack_require__(916)(Promise, INTERNAL, tryConvertToPromise, debug), __webpack_require__(917)(Promise, PromiseArray, apiRejection, debug), 
        __webpack_require__(918)(Promise), __webpack_require__(919)(Promise), __webpack_require__(920)(Promise, PromiseArray, tryConvertToPromise, INTERNAL, async, getDomain), 
        Promise.Promise = Promise, Promise.version = "3.5.5", __webpack_require__(921)(Promise), 
        __webpack_require__(922)(Promise, apiRejection, INTERNAL, tryConvertToPromise, Proxyable, debug), 
        __webpack_require__(923)(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug), 
        __webpack_require__(924)(Promise), __webpack_require__(925)(Promise, INTERNAL), 
        __webpack_require__(926)(Promise, PromiseArray, tryConvertToPromise, apiRejection), 
        __webpack_require__(927)(Promise, INTERNAL, tryConvertToPromise, apiRejection), 
        __webpack_require__(928)(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug), 
        __webpack_require__(929)(Promise, PromiseArray, debug), __webpack_require__(930)(Promise, PromiseArray, apiRejection), 
        __webpack_require__(931)(Promise, INTERNAL, debug), __webpack_require__(932)(Promise, apiRejection, tryConvertToPromise, createContext, INTERNAL, debug), 
        __webpack_require__(933)(Promise), __webpack_require__(934)(Promise, INTERNAL), 
        __webpack_require__(935)(Promise, INTERNAL), util.toFastProperties(Promise), util.toFastProperties(Promise.prototype), 
        fillTypes({
            a: 1
        }), fillTypes({
            b: 2
        }), fillTypes({
            c: 3
        }), fillTypes(1), fillTypes((function() {})), fillTypes(void 0), fillTypes(!1), 
        fillTypes(new Promise(INTERNAL)), debug.setBounds(Async.firstLineError, util.lastLineError), 
        Promise;
    };
}
