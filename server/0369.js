function(module, exports, __webpack_require__) {
    var CharsetMatch = __webpack_require__(18);
    module.exports = function(getChar, name) {
        return function(input) {
            var limit = input.length / 4 * 4, numValid = 0, numInvalid = 0, hasBOM = !1, confidence = 0;
            if (0 == limit) return null;
            65279 == getChar(input, 0) && (hasBOM = !0);
            for (var i = 0; i < limit; i += 4) {
                var ch = getChar(input, i);
                ch < 0 || ch >= 1114111 || ch >= 55296 && ch <= 57343 ? numInvalid += 1 : numValid += 1;
            }
            return hasBOM && 0 == numInvalid ? confidence = 100 : hasBOM && numValid > 10 * numInvalid ? confidence = 80 : numValid > 3 && 0 == numInvalid ? confidence = 100 : numValid > 0 && 0 == numInvalid ? confidence = 80 : numValid > 10 * numInvalid && (confidence = 25), 
            0 == confidence ? null : new CharsetMatch(confidence, name);
        };
    };
}
