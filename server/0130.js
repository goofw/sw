function(module, exports) {
    exports.codeUnit16FromBytes = function(hi, lo) {
        return (255 & hi) << 8 | 255 & lo;
    }, exports.adjustConfidence = function(codeUnit, confidence) {
        return 0 == codeUnit ? confidence -= 10 : (codeUnit >= 32 && codeUnit <= 255 || 10 == codeUnit) && (confidence += 10), 
        confidence < 0 ? confidence = 0 : confidence > 100 && (confidence = 100), confidence;
    };
}
