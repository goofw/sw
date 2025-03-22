function(module, exports, __webpack_require__) {
    "use strict";
    function listener(event, done) {
        return function(arg1) {
            for (var args = new Array(arguments.length), ee = this, err = "error" === event ? arg1 : null, i = 0; i < args.length; i++) args[i] = arguments[i];
            done(err, ee, event, args);
        };
    }
    module.exports = function(stuff, done) {
        if (!Array.isArray(stuff)) throw new TypeError("arg must be an array of [ee, events...] arrays");
        for (var cleanups = [], i = 0; i < stuff.length; i++) {
            var arr = stuff[i];
            if (!Array.isArray(arr) || arr.length < 2) throw new TypeError("each array member must be [ee, events...]");
            for (var ee = arr[0], j = 1; j < arr.length; j++) {
                var event = arr[j], fn = listener(event, callback);
                ee.on(event, fn), cleanups.push({
                    ee: ee,
                    event: event,
                    fn: fn
                });
            }
        }
        function callback() {
            cleanup(), done.apply(null, arguments);
        }
        function cleanup() {
            for (var x, i = 0; i < cleanups.length; i++) (x = cleanups[i]).ee.removeListener(x.event, x.fn);
        }
        function thunk(fn) {
            done = fn;
        }
        return thunk.cancel = cleanup, thunk;
    };
}
