function(module, exports, __webpack_require__) {
    "use strict";
    var EventEmitter = __webpack_require__(5).EventEmitter;
    function lazyProperty(obj, prop, getter) {
        Object.defineProperty(obj, prop, {
            configurable: !0,
            enumerable: !0,
            get: function() {
                var val = getter();
                return Object.defineProperty(obj, prop, {
                    configurable: !0,
                    enumerable: !0,
                    value: val
                }), val;
            }
        });
    }
    function toString(obj) {
        return obj.toString();
    }
    lazyProperty(module.exports, "callSiteToString", (function() {
        var limit = Error.stackTraceLimit, obj = {}, prep = Error.prepareStackTrace;
        Error.prepareStackTrace = function(obj, stack) {
            return stack;
        }, Error.stackTraceLimit = 2, Error.captureStackTrace(obj);
        var stack = obj.stack.slice();
        return Error.prepareStackTrace = prep, Error.stackTraceLimit = limit, stack[0].toString ? toString : __webpack_require__(548);
    })), lazyProperty(module.exports, "eventListenerCount", (function() {
        return EventEmitter.listenerCount || __webpack_require__(549);
    }));
}
