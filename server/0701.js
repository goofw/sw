function(module, exports, __webpack_require__) {
    module.exports = __webpack_require__(369)((function(input, index) {
        return (255 & input[index + 0]) << 24 | (255 & input[index + 1]) << 16 | (255 & input[index + 2]) << 8 | 255 & input[index + 3];
    }), "UTF-32BE");
}
