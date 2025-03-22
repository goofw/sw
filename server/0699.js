function(module, exports, __webpack_require__) {
    var CharsetMatch = __webpack_require__(18), codeUnit16FromBytes = __webpack_require__(130).codeUnit16FromBytes, adjustConfidence = __webpack_require__(130).adjustConfidence;
    module.exports = function(input) {
        for (var confidence = 10, bytesToCheck = Math.min(input.length, 30), charIndex = 0; charIndex < bytesToCheck - 1; charIndex += 2) {
            var codeUnit = codeUnit16FromBytes(input[charIndex], input[charIndex + 1]);
            if (0 == charIndex && 65279 == codeUnit) {
                confidence = 100;
                break;
            }
            if (0 == (confidence = adjustConfidence(codeUnit, confidence)) || 100 == confidence) break;
        }
        return bytesToCheck < 4 && confidence < 100 && (confidence = 0), confidence > 0 ? new CharsetMatch(confidence, "UTF-16BE") : null;
    };
}
