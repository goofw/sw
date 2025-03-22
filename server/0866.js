function(module, exports, __webpack_require__) {
    const readUntilBox = __webpack_require__(433);
    module.exports = async function(stream) {
        return readUntilBox(stream, "mdat");
    };
}
