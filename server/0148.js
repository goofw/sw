function(module, exports, __webpack_require__) {
    var rng = __webpack_require__(938), bytesToUuid = __webpack_require__(939);
    module.exports = function(options, buf, offset) {
        var i = buf && offset || 0;
        "string" == typeof options && (buf = "binary" === options ? new Array(16) : null, 
        options = null);
        var rnds = (options = options || {}).random || (options.rng || rng)();
        if (rnds[6] = 15 & rnds[6] | 64, rnds[8] = 63 & rnds[8] | 128, buf) for (var ii = 0; ii < 16; ++ii) buf[i + ii] = rnds[ii];
        return buf || bytesToUuid(rnds);
    };
}
