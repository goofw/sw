function(module, exports) {
    var hat = module.exports = function(bits, base) {
        if (base || (base = 16), void 0 === bits && (bits = 128), bits <= 0) return "0";
        for (var digits = Math.log(Math.pow(2, bits)) / Math.log(base), i = 2; digits === 1 / 0; i *= 2) digits = Math.log(Math.pow(2, bits / i)) / Math.log(base) * i;
        var rem = digits - Math.floor(digits), res = "";
        for (i = 0; i < Math.floor(digits); i++) res = Math.floor(Math.random() * base).toString(base) + res;
        if (rem) {
            var b = Math.pow(base, rem);
            res = Math.floor(Math.random() * b).toString(base) + res;
        }
        var parsed = parseInt(res, base);
        return parsed !== 1 / 0 && parsed >= Math.pow(2, bits) ? hat(bits, base) : res;
    };
    hat.rack = function(bits, base, expandBy) {
        var fn = function(data) {
            var iters = 0;
            do {
                if (iters++ > 10) {
                    if (!expandBy) throw new Error("too many ID collisions, use more bits");
                    bits += expandBy;
                }
                var id = hat(bits, base);
            } while (Object.hasOwnProperty.call(hats, id));
            return hats[id] = data, id;
        }, hats = fn.hats = {};
        return fn.get = function(id) {
            return fn.hats[id];
        }, fn.set = function(id, value) {
            return fn.hats[id] = value, fn;
        }, fn.bits = bits || 128, fn.base = base || 16, fn;
    };
}
