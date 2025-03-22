function(module, exports, __webpack_require__) {
    "use strict";
    "undefined" == typeof process || !process.version || 0 === process.version.indexOf("v0.") || 0 === process.version.indexOf("v1.") && 0 !== process.version.indexOf("v1.8.") ? module.exports = {
        nextTick: function(fn, arg1, arg2, arg3) {
            if ("function" != typeof fn) throw new TypeError('"callback" argument must be a function');
            var args, i, len = arguments.length;
            switch (len) {
              case 0:
              case 1:
                return process.nextTick(fn);

              case 2:
                return process.nextTick((function() {
                    fn.call(null, arg1);
                }));

              case 3:
                return process.nextTick((function() {
                    fn.call(null, arg1, arg2);
                }));

              case 4:
                return process.nextTick((function() {
                    fn.call(null, arg1, arg2, arg3);
                }));

              default:
                for (args = new Array(len - 1), i = 0; i < args.length; ) args[i++] = arguments[i];
                return process.nextTick((function() {
                    fn.apply(null, args);
                }));
            }
        }
    } : module.exports = process;
}
