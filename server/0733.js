function(module, exports, __webpack_require__) {
    var Buffer = __webpack_require__(10).Buffer;
    module.exports = function(buffer) {
        return Buffer.isBuffer(buffer);
    };
}
