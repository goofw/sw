function(module, exports) {
    module.exports = function(xs, fn) {
        for (var res = [], i = 0; i < xs.length; i++) {
            var x = fn(xs[i], i);
            isArray(x) ? res.push.apply(res, x) : res.push(x);
        }
        return res;
    };
    var isArray = Array.isArray || function(xs) {
        return "[object Array]" === Object.prototype.toString.call(xs);
    };
}
