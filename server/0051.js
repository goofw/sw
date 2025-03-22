function(module, exports) {
    module.exports = function(model, calc) {
        var fn;
        return (fn = function(buf, previous) {
            return calc(buf, previous) >>> 0;
        }).signed = calc, fn.unsigned = fn, fn.model = model, fn;
    };
}
