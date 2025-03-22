function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.tryAcquire = void 0;
    var errors_1 = __webpack_require__(135), withTimeout_1 = __webpack_require__(404);
    exports.tryAcquire = function(sync, alreadyAcquiredError) {
        return void 0 === alreadyAcquiredError && (alreadyAcquiredError = errors_1.E_ALREADY_LOCKED), 
        (0, withTimeout_1.withTimeout)(sync, 0, alreadyAcquiredError);
    };
}
