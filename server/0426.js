function(module, exports, __webpack_require__) {
    "use strict";
    var ERR_INVALID_OPT_VALUE = __webpack_require__(65).codes.ERR_INVALID_OPT_VALUE;
    module.exports = {
        getHighWaterMark: function(state, options, duplexKey, isDuplex) {
            var hwm = (function(options, isDuplex, duplexKey) {
                return null != options.highWaterMark ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
            })(options, isDuplex, duplexKey);
            if (null != hwm) {
                if (!isFinite(hwm) || Math.floor(hwm) !== hwm || hwm < 0) throw new ERR_INVALID_OPT_VALUE(isDuplex ? duplexKey : "highWaterMark", hwm);
                return Math.floor(hwm);
            }
            return state.objectMode ? 16 : 16384;
        }
    };
}
