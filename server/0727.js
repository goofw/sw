function(module, exports, __webpack_require__) {
    var CharsetMatch = __webpack_require__(18);
    module.exports = function(input) {
        var i, confidence, hasBOM = !1, numValid = 0, numInvalid = 0, trailBytes = 0, inputLength = input.length;
        for (inputLength >= 3 && 239 == (255 & input[0]) && 187 == (255 & input[1]) && 191 == (255 & input[2]) && (hasBOM = !0), 
        i = 0; i < inputLength; i++) {
            var b = input[i];
            if (0 != (128 & b)) {
                if (192 == (224 & b)) trailBytes = 1; else if (224 == (240 & b)) trailBytes = 2; else {
                    if (240 != (248 & b)) {
                        numInvalid++;
                        continue;
                    }
                    trailBytes = 3;
                }
                for (;!(++i >= inputLength); ) {
                    if (128 != (192 & (b = input[i]))) {
                        numInvalid++;
                        break;
                    }
                    if (0 == --trailBytes) {
                        numValid++;
                        break;
                    }
                }
            }
        }
        return confidence = 0, hasBOM && 0 == numInvalid ? confidence = 100 : hasBOM && numValid > 10 * numInvalid ? confidence = 80 : numValid > 3 && 0 == numInvalid ? confidence = 100 : numValid > 0 && 0 == numInvalid ? confidence = 80 : 0 == numValid && 0 == numInvalid ? confidence = 15 : numValid > 10 * numInvalid && (confidence = 25), 
        0 == confidence ? null : new CharsetMatch(confidence, "UTF-8");
    };
}
