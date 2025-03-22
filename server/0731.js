function(module, exports, __webpack_require__) {
    var Buffer = __webpack_require__(10).Buffer;
    module.exports = function(source, encoding) {
        return new Buffer(source, encoding);
    };
}
