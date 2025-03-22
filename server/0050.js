function(module, exports, __webpack_require__) {
    var extend = __webpack_require__(587);
    exports.DEFAULT_ANNOUNCE_PEERS = 50, exports.MAX_ANNOUNCE_PEERS = 82, exports.binaryToHex = function(str) {
        return new Buffer(str, "binary").toString("hex");
    }, exports.hexToBinary = function(str) {
        return new Buffer(str, "hex").toString("binary");
    }, extend(exports, __webpack_require__(588));
}
