function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.tryAcquire = exports.withTimeout = exports.Semaphore = exports.Mutex = void 0;
    var tslib_1 = __webpack_require__(134), Mutex_1 = __webpack_require__(811);
    Object.defineProperty(exports, "Mutex", {
        enumerable: !0,
        get: function() {
            return Mutex_1.default;
        }
    });
    var Semaphore_1 = __webpack_require__(403);
    Object.defineProperty(exports, "Semaphore", {
        enumerable: !0,
        get: function() {
            return Semaphore_1.default;
        }
    });
    var withTimeout_1 = __webpack_require__(404);
    Object.defineProperty(exports, "withTimeout", {
        enumerable: !0,
        get: function() {
            return withTimeout_1.withTimeout;
        }
    });
    var tryAcquire_1 = __webpack_require__(812);
    Object.defineProperty(exports, "tryAcquire", {
        enumerable: !0,
        get: function() {
            return tryAcquire_1.tryAcquire;
        }
    }), (0, tslib_1.__exportStar)(__webpack_require__(135), exports);
}
