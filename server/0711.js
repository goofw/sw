function(module, exports, __webpack_require__) {
    var escapeSequences = [ [ 27, 36, 41, 67 ] ], baseMatch = __webpack_require__(176), CharsetMatch = __webpack_require__(18);
    module.exports = function(input) {
        var confidence = baseMatch(input, input.length, escapeSequences);
        return 0 == confidence ? null : new CharsetMatch(confidence, "ISO-2022-KR");
    };
}
