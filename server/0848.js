function(module, exports, __webpack_require__) {
    "use strict";
    var _Object$setPrototypeO;
    function _defineProperty(obj, key, value) {
        return key in obj ? Object.defineProperty(obj, key, {
            value: value,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : obj[key] = value, obj;
    }
    var finished = __webpack_require__(215), kLastResolve = Symbol("lastResolve"), kLastReject = Symbol("lastReject"), kError = Symbol("error"), kEnded = Symbol("ended"), kLastPromise = Symbol("lastPromise"), kHandlePromise = Symbol("handlePromise"), kStream = Symbol("stream");
    function createIterResult(value, done) {
        return {
            value: value,
            done: done
        };
    }
    function readAndResolve(iter) {
        var resolve = iter[kLastResolve];
        if (null !== resolve) {
            var data = iter[kStream].read();
            null !== data && (iter[kLastPromise] = null, iter[kLastResolve] = null, iter[kLastReject] = null, 
            resolve(createIterResult(data, !1)));
        }
    }
    function onReadable(iter) {
        process.nextTick(readAndResolve, iter);
    }
    var AsyncIteratorPrototype = Object.getPrototypeOf((function() {})), ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_defineProperty(_Object$setPrototypeO = {
        get stream() {
            return this[kStream];
        },
        next: function() {
            var _this = this, error = this[kError];
            if (null !== error) return Promise.reject(error);
            if (this[kEnded]) return Promise.resolve(createIterResult(void 0, !0));
            if (this[kStream].destroyed) return new Promise((function(resolve, reject) {
                process.nextTick((function() {
                    _this[kError] ? reject(_this[kError]) : resolve(createIterResult(void 0, !0));
                }));
            }));
            var promise, lastPromise = this[kLastPromise];
            if (lastPromise) promise = new Promise((function(lastPromise, iter) {
                return function(resolve, reject) {
                    lastPromise.then((function() {
                        iter[kEnded] ? resolve(createIterResult(void 0, !0)) : iter[kHandlePromise](resolve, reject);
                    }), reject);
                };
            })(lastPromise, this)); else {
                var data = this[kStream].read();
                if (null !== data) return Promise.resolve(createIterResult(data, !1));
                promise = new Promise(this[kHandlePromise]);
            }
            return this[kLastPromise] = promise, promise;
        }
    }, Symbol.asyncIterator, (function() {
        return this;
    })), _defineProperty(_Object$setPrototypeO, "return", (function() {
        var _this2 = this;
        return new Promise((function(resolve, reject) {
            _this2[kStream].destroy(null, (function(err) {
                err ? reject(err) : resolve(createIterResult(void 0, !0));
            }));
        }));
    })), _Object$setPrototypeO), AsyncIteratorPrototype);
    module.exports = function(stream) {
        var _Object$create, iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_defineProperty(_Object$create = {}, kStream, {
            value: stream,
            writable: !0
        }), _defineProperty(_Object$create, kLastResolve, {
            value: null,
            writable: !0
        }), _defineProperty(_Object$create, kLastReject, {
            value: null,
            writable: !0
        }), _defineProperty(_Object$create, kError, {
            value: null,
            writable: !0
        }), _defineProperty(_Object$create, kEnded, {
            value: stream._readableState.endEmitted,
            writable: !0
        }), _defineProperty(_Object$create, kHandlePromise, {
            value: function(resolve, reject) {
                var data = iterator[kStream].read();
                data ? (iterator[kLastPromise] = null, iterator[kLastResolve] = null, iterator[kLastReject] = null, 
                resolve(createIterResult(data, !1))) : (iterator[kLastResolve] = resolve, iterator[kLastReject] = reject);
            },
            writable: !0
        }), _Object$create));
        return iterator[kLastPromise] = null, finished(stream, (function(err) {
            if (err && "ERR_STREAM_PREMATURE_CLOSE" !== err.code) {
                var reject = iterator[kLastReject];
                return null !== reject && (iterator[kLastPromise] = null, iterator[kLastResolve] = null, 
                iterator[kLastReject] = null, reject(err)), void (iterator[kError] = err);
            }
            var resolve = iterator[kLastResolve];
            null !== resolve && (iterator[kLastPromise] = null, iterator[kLastResolve] = null, 
            iterator[kLastReject] = null, resolve(createIterResult(void 0, !0))), iterator[kEnded] = !0;
        })), stream.on("readable", onReadable.bind(null, iterator)), iterator;
    };
}
