function(module, exports, __webpack_require__) {
    var stream = __webpack_require__(3);
    function isStream(obj) {
        return obj instanceof stream.Stream;
    }
    function isReadable(obj) {
        return isStream(obj) && "function" == typeof obj._read && "object" == typeof obj._readableState;
    }
    function isWritable(obj) {
        return isStream(obj) && "function" == typeof obj._write && "object" == typeof obj._writableState;
    }
    module.exports = isStream, module.exports.isReadable = isReadable, module.exports.isWritable = isWritable, 
    module.exports.isDuplex = function(obj) {
        return isReadable(obj) && isWritable(obj);
    };
}
