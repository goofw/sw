function(module, exports, __webpack_require__) {
    var bencode = module.exports;
    bencode.encode = __webpack_require__(570), bencode.decode = __webpack_require__(571), 
    bencode.byteLength = bencode.encodingLength = function(value) {
        return bencode.encode(value).length;
    };
}
