function(module, exports, __webpack_require__) {
    var escapeSequences = [ [ 27, 36, 41, 65 ], [ 27, 36, 41, 71 ], [ 27, 36, 42, 72 ], [ 27, 36, 41, 69 ], [ 27, 36, 43, 73 ], [ 27, 36, 43, 74 ], [ 27, 36, 43, 75 ], [ 27, 36, 43, 76 ], [ 27, 36, 43, 77 ], [ 27, 78 ], [ 27, 79 ] ], baseMatch = __webpack_require__(176), CharsetMatch = __webpack_require__(18);
    module.exports = function(input) {
        var confidence = baseMatch(input, input.length, escapeSequences);
        return 0 == confidence ? null : new CharsetMatch(confidence, "ISO-2022-CN");
    };
}
