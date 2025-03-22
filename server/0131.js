function(module, exports) {
    function iteratedChar(input) {
        this.charValue = 0, this.index = 0, this.nextIndex = 0, this.error = !1, this.done = !1, 
        this.input = input, this.inputLength = input.length;
    }
    iteratedChar.prototype = {
        reset: function() {
            this.charValue = 0, this.index = -1, this.nextIndex = 0, this.error = !1, this.done = !1;
        },
        nextByte: function() {
            return this.nextIndex >= this.inputLength ? (this.done = !0, -1) : 255 & this.input[this.nextIndex++];
        }
    }, module.exports = function(commonChars, nextChar) {
        return function(input) {
            var doubleByteCharCount = 0, commonCharCount = 0, badCharCount = 0, totalCharCount = 0, confidence = 0, iter = new iteratedChar(input);
            detectBlock: {
                for (iter.reset(); nextChar(iter); ) {
                    if (totalCharCount++, iter.error) badCharCount++; else {
                        var cv = 4294967295 & iter.charValue;
                        !(cv <= 255) && (doubleByteCharCount++, null != commonChars && commonChars.indexOf(cv) >= 0 && commonCharCount++);
                    }
                    if (badCharCount >= 2 && 5 * badCharCount >= doubleByteCharCount) break detectBlock;
                }
                if (doubleByteCharCount <= 10 && 0 == badCharCount) confidence = 0 == doubleByteCharCount && totalCharCount < 10 ? 0 : 10; else if (doubleByteCharCount < 20 * badCharCount) confidence = 0; else if (null == commonChars) (confidence = 30 + doubleByteCharCount - 20 * badCharCount) > 100 && (confidence = 100); else {
                    var scaleFactor = 90 / Math.log(doubleByteCharCount / 4);
                    confidence = Math.log(commonCharCount + 1) * scaleFactor + 10, confidence = Math.min(confidence, 100);
                }
            }
            return confidence;
        };
    };
}
