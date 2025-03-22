function(module, exports, __webpack_require__) {
    var Buffer = __webpack_require__(10).Buffer;
    void 0 === Buffer.from && (Buffer.from = function(a, b, c) {
        return new Buffer(a, b, c);
    }, Buffer.alloc = Buffer.from), module.exports = Buffer;
}
