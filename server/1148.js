function(module, exports, __webpack_require__) {
    const mime = __webpack_require__(63);
    module.exports = function(rarInnerFile) {
        return mime.lookup(rarInnerFile.name) || "application/octet-stream";
    };
}
