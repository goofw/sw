function(module, exports, __webpack_require__) {
    var Buffer, create;
    Buffer = __webpack_require__(10).Buffer, create = __webpack_require__(51), module.exports = create("crc1", (function(buf, previous) {
        var accum, crc, _i, _len;
        for (Buffer.isBuffer(buf) || (buf = Buffer(buf)), crc = ~~previous, accum = 0, _i = 0, 
        _len = buf.length; _i < _len; _i++) accum += buf[_i];
        return (crc += accum % 256) % 256;
    }));
}
