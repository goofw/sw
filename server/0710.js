function(module, exports, __webpack_require__) {
    var escapeSequences = [ [ 27, 36, 40, 67 ], [ 27, 36, 40, 68 ], [ 27, 36, 64 ], [ 27, 36, 65 ], [ 27, 36, 66 ], [ 27, 38, 64 ], [ 27, 40, 66 ], [ 27, 40, 72 ], [ 27, 40, 73 ], [ 27, 40, 74 ], [ 27, 46, 65 ], [ 27, 46, 70 ] ], baseMatch = __webpack_require__(176), CharsetMatch = __webpack_require__(18);
    module.exports = function(input) {
        var confidence = baseMatch(input, input.length, escapeSequences);
        return 0 == confidence ? null : new CharsetMatch(confidence, "ISO-2022-JP");
    };
}
