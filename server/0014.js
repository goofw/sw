function(module, exports, __webpack_require__) {
    "use strict";
    var key, buffer = __webpack_require__(10), Buffer = buffer.Buffer, safer = {};
    for (key in buffer) buffer.hasOwnProperty(key) && "SlowBuffer" !== key && "Buffer" !== key && (safer[key] = buffer[key]);
    var Safer = safer.Buffer = {};
    for (key in Buffer) Buffer.hasOwnProperty(key) && "allocUnsafe" !== key && "allocUnsafeSlow" !== key && (Safer[key] = Buffer[key]);
    if (safer.Buffer.prototype = Buffer.prototype, Safer.from && Safer.from !== Uint8Array.from || (Safer.from = function(value, encodingOrOffset, length) {
        if ("number" == typeof value) throw new TypeError('The "value" argument must not be of type number. Received type ' + typeof value);
        if (value && void 0 === value.length) throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
        return Buffer(value, encodingOrOffset, length);
    }), Safer.alloc || (Safer.alloc = function(size, fill, encoding) {
        if ("number" != typeof size) throw new TypeError('The "size" argument must be of type number. Received type ' + typeof size);
        if (size < 0 || size >= 2 * (1 << 30)) throw new RangeError('The value "' + size + '" is invalid for option "size"');
        var buf = Buffer(size);
        return fill && 0 !== fill.length ? "string" == typeof encoding ? buf.fill(fill, encoding) : buf.fill(fill) : buf.fill(0), 
        buf;
    }), !safer.kStringMaxLength) try {
        safer.kStringMaxLength = process.binding("buffer").kStringMaxLength;
    } catch (e) {}
    safer.constants || (safer.constants = {
        MAX_LENGTH: safer.kMaxLength
    }, safer.kStringMaxLength && (safer.constants.MAX_STRING_LENGTH = safer.kStringMaxLength)), 
    module.exports = safer;
}
