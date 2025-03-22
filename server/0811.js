function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var tslib_1 = __webpack_require__(134), Semaphore_1 = __webpack_require__(403), Mutex = (function() {
        function Mutex(cancelError) {
            this._semaphore = new Semaphore_1.default(1, cancelError);
        }
        return Mutex.prototype.acquire = function() {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, (function() {
                return (0, tslib_1.__generator)(this, (function(_b) {
                    switch (_b.label) {
                      case 0:
                        return [ 4, this._semaphore.acquire() ];

                      case 1:
                        return [ 2, _b.sent()[1] ];
                    }
                }));
            }));
        }, Mutex.prototype.runExclusive = function(callback) {
            return this._semaphore.runExclusive((function() {
                return callback();
            }));
        }, Mutex.prototype.isLocked = function() {
            return this._semaphore.isLocked();
        }, Mutex.prototype.waitForUnlock = function() {
            return this._semaphore.waitForUnlock();
        }, Mutex.prototype.release = function() {
            this._semaphore.release();
        }, Mutex.prototype.cancel = function() {
            return this._semaphore.cancel();
        }, Mutex;
    })();
    exports.default = Mutex;
}
