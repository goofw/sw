function(module, exports, __webpack_require__) {
    var bencode = module.exports;
    bencode.encode = __webpack_require__(1004), bencode.decode = __webpack_require__(1005), 
    bencode.byteLength = bencode.encodingLength = function(value) {
        return bencode.encode(value).length;
    };
}
