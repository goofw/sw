function(module, exports, __webpack_require__) {
    var bufferAlloc = __webpack_require__(388), UINT_32_MAX = Math.pow(2, 32);
    exports.encodingLength = function() {
        return 8;
    }, exports.encode = function(num, buf, offset) {
        buf || (buf = bufferAlloc(8)), offset || (offset = 0);
        var top = Math.floor(num / UINT_32_MAX), rem = num - top * UINT_32_MAX;
        return buf.writeUInt32BE(top, offset), buf.writeUInt32BE(rem, offset + 4), buf;
    }, exports.decode = function(buf, offset) {
        offset || (offset = 0);
        var top = buf.readUInt32BE(offset), rem = buf.readUInt32BE(offset + 4);
        return top * UINT_32_MAX + rem;
    }, exports.encode.bytes = 8, exports.decode.bytes = 8;
}
