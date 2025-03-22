function(module, exports, __webpack_require__) {
    var bufferFill = __webpack_require__(774), allocUnsafe = __webpack_require__(775);
    module.exports = function(size, fill, encoding) {
        if ("number" != typeof size) throw new TypeError('"size" argument must be a number');
        if (size < 0) throw new RangeError('"size" argument must not be negative');
        if (Buffer.alloc) return Buffer.alloc(size, fill, encoding);
        var buffer = allocUnsafe(size);
        return 0 === size ? buffer : void 0 === fill ? bufferFill(buffer, 0) : ("string" != typeof encoding && (encoding = void 0), 
        bufferFill(buffer, fill, encoding));
    };
}
