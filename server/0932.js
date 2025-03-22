function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise, apiRejection, tryConvertToPromise, createContext, INTERNAL, debug) {
        var util = __webpack_require__(16), TypeError = __webpack_require__(55).TypeError, inherits = __webpack_require__(16).inherits, errorObj = util.errorObj, tryCatch = util.tryCatch, NULL = {};
        function thrower(e) {
            setTimeout((function() {
                throw e;
            }), 0);
        }
        function dispose(resources, inspection) {
            var i = 0, len = resources.length, ret = new Promise(INTERNAL);
            return (function iterator() {
                if (i >= len) return ret._fulfill();
                var maybePromise = (function(thenable) {
                    var maybePromise = tryConvertToPromise(thenable);
                    return maybePromise !== thenable && "function" == typeof thenable._isDisposable && "function" == typeof thenable._getDisposer && thenable._isDisposable() && maybePromise._setDisposable(thenable._getDisposer()), 
                    maybePromise;
                })(resources[i++]);
                if (maybePromise instanceof Promise && maybePromise._isDisposable()) {
                    try {
                        maybePromise = tryConvertToPromise(maybePromise._getDisposer().tryDispose(inspection), resources.promise);
                    } catch (e) {
                        return thrower(e);
                    }
                    if (maybePromise instanceof Promise) return maybePromise._then(iterator, thrower, null, null, null);
                }
                iterator();
            })(), ret;
        }
        function Disposer(data, promise, context) {
            this._data = data, this._promise = promise, this._context = context;
        }
        function FunctionDisposer(fn, promise, context) {
            this.constructor$(fn, promise, context);
        }
        function maybeUnwrapDisposer(value) {
            return Disposer.isDisposer(value) ? (this.resources[this.index]._setDisposable(value), 
            value.promise()) : value;
        }
        function ResourceList(length) {
            this.length = length, this.promise = null, this[length - 1] = null;
        }
        Disposer.prototype.data = function() {
            return this._data;
        }, Disposer.prototype.promise = function() {
            return this._promise;
        }, Disposer.prototype.resource = function() {
            return this.promise().isFulfilled() ? this.promise().value() : NULL;
        }, Disposer.prototype.tryDispose = function(inspection) {
            var resource = this.resource(), context = this._context;
            void 0 !== context && context._pushContext();
            var ret = resource !== NULL ? this.doDispose(resource, inspection) : null;
            return void 0 !== context && context._popContext(), this._promise._unsetDisposable(), 
            this._data = null, ret;
        }, Disposer.isDisposer = function(d) {
            return null != d && "function" == typeof d.resource && "function" == typeof d.tryDispose;
        }, inherits(FunctionDisposer, Disposer), FunctionDisposer.prototype.doDispose = function(resource, inspection) {
            return this.data().call(resource, resource, inspection);
        }, ResourceList.prototype._resultCancelled = function() {
            for (var len = this.length, i = 0; i < len; ++i) {
                var item = this[i];
                item instanceof Promise && item.cancel();
            }
        }, Promise.using = function() {
            var len = arguments.length;
            if (len < 2) return apiRejection("you must pass at least 2 arguments to Promise.using");
            var input, fn = arguments[len - 1];
            if ("function" != typeof fn) return apiRejection("expecting a function but got " + util.classString(fn));
            var spreadArgs = !0;
            2 === len && Array.isArray(arguments[0]) ? (len = (input = arguments[0]).length, 
            spreadArgs = !1) : (input = arguments, len--);
            for (var resources = new ResourceList(len), i = 0; i < len; ++i) {
                var resource = input[i];
                if (Disposer.isDisposer(resource)) {
                    var disposer = resource;
                    (resource = resource.promise())._setDisposable(disposer);
                } else {
                    var maybePromise = tryConvertToPromise(resource);
                    maybePromise instanceof Promise && (resource = maybePromise._then(maybeUnwrapDisposer, null, null, {
                        resources: resources,
                        index: i
                    }, void 0));
                }
                resources[i] = resource;
            }
            var reflectedResources = new Array(resources.length);
            for (i = 0; i < reflectedResources.length; ++i) reflectedResources[i] = Promise.resolve(resources[i]).reflect();
            var resultPromise = Promise.all(reflectedResources).then((function(inspections) {
                for (var i = 0; i < inspections.length; ++i) {
                    var inspection = inspections[i];
                    if (inspection.isRejected()) return errorObj.e = inspection.error(), errorObj;
                    if (!inspection.isFulfilled()) return void resultPromise.cancel();
                    inspections[i] = inspection.value();
                }
                promise._pushContext(), fn = tryCatch(fn);
                var ret = spreadArgs ? fn.apply(void 0, inspections) : fn(inspections), promiseCreated = promise._popContext();
                return debug.checkForgottenReturns(ret, promiseCreated, "Promise.using", promise), 
                ret;
            })), promise = resultPromise.lastly((function() {
                var inspection = new Promise.PromiseInspection(resultPromise);
                return dispose(resources, inspection);
            }));
            return resources.promise = promise, promise._setOnCancel(resources), promise;
        }, Promise.prototype._setDisposable = function(disposer) {
            this._bitField = 131072 | this._bitField, this._disposer = disposer;
        }, Promise.prototype._isDisposable = function() {
            return (131072 & this._bitField) > 0;
        }, Promise.prototype._getDisposer = function() {
            return this._disposer;
        }, Promise.prototype._unsetDisposable = function() {
            this._bitField = -131073 & this._bitField, this._disposer = void 0;
        }, Promise.prototype.disposer = function(fn) {
            if ("function" == typeof fn) return new FunctionDisposer(fn, this, createContext());
            throw new TypeError;
        };
    };
}
