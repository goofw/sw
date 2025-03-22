function(module, exports) {
    module.exports = function(fn) {
        var nextTick = "function" == typeof setImmediate ? setImmediate : "object" == typeof process && "function" == typeof process.nextTick ? process.nextTick : null;
        nextTick ? nextTick(fn) : setTimeout(fn, 0);
    };
}
