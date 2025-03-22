function(module, exports) {
    module.exports = function wrappy(fn, cb) {
        if (fn && cb) return wrappy(fn)(cb);
        if ("function" != typeof fn) throw new TypeError("need wrapper function");
        return Object.keys(fn).forEach((function(k) {
            wrapper[k] = fn[k];
        })), wrapper;
        function wrapper() {
            for (var args = new Array(arguments.length), i = 0; i < args.length; i++) args[i] = arguments[i];
            var ret = fn.apply(this, args), cb = args[args.length - 1];
            return "function" == typeof ret && ret !== cb && Object.keys(cb).forEach((function(k) {
                ret[k] = cb[k];
            })), ret;
        }
    };
}
