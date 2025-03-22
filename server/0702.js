function(module, exports, __webpack_require__) {
    module.exports = __webpack_require__(369)((function(input, index) {
        return (255 & input[index + 3]) << 24 | (255 & input[index + 2]) << 16 | (255 & input[index + 1]) << 8 | 255 & input[index + 0];
    }), "UTF-32LE");
}
