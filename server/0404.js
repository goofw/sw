function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.withTimeout = void 0;
    var tslib_1 = __webpack_require__(134), errors_1 = __webpack_require__(135);
    exports.withTimeout = function(sync, timeout, timeoutError) {
        var _this = this;
        return void 0 === timeoutError && (timeoutError = errors_1.E_TIMEOUT), {
            acquire: function() {
                return new Promise((function(resolve, reject) {
                    return (0, tslib_1.__awaiter)(_this, void 0, void 0, (function() {
                        var isTimeout, handle, ticket, e_1;
                        return (0, tslib_1.__generator)(this, (function(_a) {
                            switch (_a.label) {
                              case 0:
                                isTimeout = !1, handle = setTimeout((function() {
                                    isTimeout = !0, reject(timeoutError);
                                }), timeout), _a.label = 1;

                              case 1:
                                return _a.trys.push([ 1, 3, , 4 ]), [ 4, sync.acquire() ];

                              case 2:
                                return ticket = _a.sent(), isTimeout ? (Array.isArray(ticket) ? ticket[1] : ticket)() : (clearTimeout(handle), 
                                resolve(ticket)), [ 3, 4 ];

                              case 3:
                                return e_1 = _a.sent(), isTimeout || (clearTimeout(handle), reject(e_1)), [ 3, 4 ];

                              case 4:
                                return [ 2 ];
                            }
                        }));
                    }));
                }));
            },
            runExclusive: function(callback) {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, (function() {
                    var release, ticket;
                    return (0, tslib_1.__generator)(this, (function(_a) {
                        switch (_a.label) {
                          case 0:
                            release = function() {}, _a.label = 1;

                          case 1:
                            return _a.trys.push([ 1, , 7, 8 ]), [ 4, this.acquire() ];

                          case 2:
                            return ticket = _a.sent(), Array.isArray(ticket) ? (release = ticket[1], [ 4, callback(ticket[0]) ]) : [ 3, 4 ];

                          case 3:
                            return [ 2, _a.sent() ];

                          case 4:
                            return release = ticket, [ 4, callback() ];

                          case 5:
                            return [ 2, _a.sent() ];

                          case 6:
                            return [ 3, 8 ];

                          case 7:
                            return release(), [ 7 ];

                          case 8:
                            return [ 2 ];
                        }
                    }));
                }));
            },
            release: function() {
                sync.release();
            },
            cancel: function() {
                return sync.cancel();
            },
            waitForUnlock: function() {
                return sync.waitForUnlock();
            },
            isLocked: function() {
                return sync.isLocked();
            }
        };
    };
}
