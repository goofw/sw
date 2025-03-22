function(module, exports) {
    var toString = Object.prototype.toString, isModern = "undefined" != typeof Buffer && "function" == typeof Buffer.alloc && "function" == typeof Buffer.allocUnsafe && "function" == typeof Buffer.from;
    module.exports = function(value, encodingOrOffset, length) {
        if ("number" == typeof value) throw new TypeError('"value" argument must not be a number');
        return input = value, "ArrayBuffer" === toString.call(input).slice(8, -1) ? (function(obj, byteOffset, length) {
            byteOffset >>>= 0;
            var maxLength = obj.byteLength - byteOffset;
            if (maxLength < 0) throw new RangeError("'offset' is out of bounds");
            if (void 0 === length) length = maxLength; else if ((length >>>= 0) > maxLength) throw new RangeError("'length' is out of bounds");
            return isModern ? Buffer.from(obj.slice(byteOffset, byteOffset + length)) : new Buffer(new Uint8Array(obj.slice(byteOffset, byteOffset + length)));
        })(value, encodingOrOffset, length) : "string" == typeof value ? (function(string, encoding) {
            if ("string" == typeof encoding && "" !== encoding || (encoding = "utf8"), !Buffer.isEncoding(encoding)) throw new TypeError('"encoding" must be a valid string encoding');
            return isModern ? Buffer.from(string, encoding) : new Buffer(string, encoding);
        })(value, encodingOrOffset) : isModern ? Buffer.from(value) : new Buffer(value);
        var input;
    };
}
