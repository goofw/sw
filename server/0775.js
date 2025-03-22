function(module, exports) {
    module.exports = function(size) {
        if ("number" != typeof size) throw new TypeError('"size" argument must be a number');
        if (size < 0) throw new RangeError('"size" argument must not be negative');
        return Buffer.allocUnsafe ? Buffer.allocUnsafe(size) : new Buffer(size);
    };
}
