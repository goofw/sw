function(module, exports) {
    module.exports = function(text, textLen, escapeSequences) {
        var i, j, escN, quality, hits = 0, misses = 0, shifts = 0;
        scanInput: for (i = 0; i < textLen; i++) {
            if (27 == text[i]) {
                checkEscapes: for (escN = 0; escN < escapeSequences.length; escN++) {
                    var seq = escapeSequences[escN];
                    if (!(textLen - i < seq.length)) {
                        for (j = 1; j < seq.length; j++) if (seq[j] != text[i + j]) continue checkEscapes;
                        hits++, i += seq.length - 1;
                        continue scanInput;
                    }
                }
                misses++;
            }
            14 != text[i] && 15 != text[i] || shifts++;
        }
        return 0 == hits ? 0 : (quality = (100 * hits - 100 * misses) / (hits + misses), 
        hits + shifts < 5 && (quality -= 10 * (5 - (hits + shifts))), quality < 0 && (quality = 0), 
        quality);
    };
}
