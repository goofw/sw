function(module, exports, __webpack_require__) {
    "use strict";
    var nextTick = function(fn, a, b) {
        process.nextTick((function() {
            fn(a, b);
        }));
    };
    function isError(err) {
        return "[object Error]" === Object.prototype.toString.call(err);
    }
    function noop() {}
    function apply(callback, args) {
        callback.apply(null, args);
    }
    process.nextTick((function(val) {
        42 === val && (nextTick = process.nextTick);
    }), 42), module.exports = function(fn) {
        var state = function run(callback) {
            var stack = [ callback ];
            state = function(callback) {
                stack.push(callback);
            }, fn((function(err) {
                var args = arguments;
                for (state = isError(err) ? run : finished; stack.length; ) finished(stack.shift());
                function finished(callback) {
                    nextTick(apply, callback, args);
                }
            }));
        };
        return function(callback) {
            state(callback || noop);
        };
    };
}
