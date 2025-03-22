function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var tslib_1 = __webpack_require__(134), errors_1 = __webpack_require__(135), Semaphore = (function() {
        function Semaphore(_maxConcurrency, _cancelError) {
            if (void 0 === _cancelError && (_cancelError = errors_1.E_CANCELED), this._maxConcurrency = _maxConcurrency, 
            this._cancelError = _cancelError, this._queue = [], this._waiters = [], _maxConcurrency <= 0) throw new Error("semaphore must be initialized to a positive value");
            this._value = _maxConcurrency;
        }
        return Semaphore.prototype.acquire = function() {
            var _this = this, locked = this.isLocked(), ticketPromise = new Promise((function(resolve, reject) {
                return _this._queue.push({
                    resolve: resolve,
                    reject: reject
                });
            }));
            return locked || this._dispatch(), ticketPromise;
        }, Semaphore.prototype.runExclusive = function(callback) {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, (function() {
                var _a, value, release;
                return (0, tslib_1.__generator)(this, (function(_b) {
                    switch (_b.label) {
                      case 0:
                        return [ 4, this.acquire() ];

                      case 1:
                        _a = _b.sent(), value = _a[0], release = _a[1], _b.label = 2;

                      case 2:
                        return _b.trys.push([ 2, , 4, 5 ]), [ 4, callback(value) ];

                      case 3:
                        return [ 2, _b.sent() ];

                      case 4:
                        return release(), [ 7 ];

                      case 5:
                        return [ 2 ];
                    }
                }));
            }));
        }, Semaphore.prototype.waitForUnlock = function() {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, (function() {
                var _this = this;
                return (0, tslib_1.__generator)(this, (function(_a) {
                    return this.isLocked() ? [ 2, new Promise((function(resolve) {
                        return _this._waiters.push({
                            resolve: resolve
                        });
                    })) ] : [ 2, Promise.resolve() ];
                }));
            }));
        }, Semaphore.prototype.isLocked = function() {
            return this._value <= 0;
        }, Semaphore.prototype.release = function() {
            if (this._maxConcurrency > 1) throw new Error("this method is unavailable on semaphores with concurrency > 1; use the scoped release returned by acquire instead");
            if (this._currentReleaser) {
                var releaser = this._currentReleaser;
                this._currentReleaser = void 0, releaser();
            }
        }, Semaphore.prototype.cancel = function() {
            var _this = this;
            this._queue.forEach((function(ticket) {
                return ticket.reject(_this._cancelError);
            })), this._queue = [];
        }, Semaphore.prototype._dispatch = function() {
            var _this = this, nextTicket = this._queue.shift();
            if (nextTicket) {
                var released = !1;
                this._currentReleaser = function() {
                    released || (released = !0, _this._value++, _this._resolveWaiters(), _this._dispatch());
                }, nextTicket.resolve([ this._value--, this._currentReleaser ]);
            }
        }, Semaphore.prototype._resolveWaiters = function() {
            this._waiters.forEach((function(waiter) {
                return waiter.resolve();
            })), this._waiters = [];
        }, Semaphore;
    })();
    exports.default = Semaphore;
}
