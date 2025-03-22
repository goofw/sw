function(module, exports) {
    function NGramParser(theNgramList, theByteMap) {
        this.byteIndex = 0, this.ngram = 0, this.ngramList = theNgramList, this.byteMap = theByteMap, 
        this.ngramCount = 0, this.hitCount = 0;
    }
    NGramParser.prototype = {
        lookup: function(thisNgram) {
            this.ngramCount += 1, NGramParser.search(this.ngramList, thisNgram) >= 0 && (this.hitCount += 1);
        },
        addByte: function(b) {
            this.ngram = (this.ngram << 8) + (255 & b) & NGramParser.N_GRAM_MASK, this.lookup(this.ngram);
        },
        nextByte: function(input) {
            return this.byteIndex >= input.length ? -1 : 255 & input[this.byteIndex++];
        },
        parseCharacters: function(input) {
            for (var b, ignoreSpace = !1; (b = this.nextByte(input)) >= 0; ) {
                var mb = this.byteMap[b];
                0 != mb && (mb == this.spaceChar && ignoreSpace || this.addByte(mb), ignoreSpace = mb == this.spaceChar);
            }
        },
        parse: function(input, spaceCh) {
            this.spaceChar = spaceCh || 32, this.parseCharacters(input), this.addByte(this.spaceChar);
            var rawPercent = this.hitCount / this.ngramCount;
            return rawPercent > .33 ? 98 : 300 * rawPercent;
        }
    }, NGramParser.N_GRAM_MASK = 16777215, NGramParser.search = function(table, value) {
        var index = 0;
        return table[index + 32] <= value && (index += 32), table[index + 16] <= value && (index += 16), 
        table[index + 8] <= value && (index += 8), table[index + 4] <= value && (index += 4), 
        table[index + 2] <= value && (index += 2), table[index + 1] <= value && (index += 1), 
        table[index] > value && (index -= 1), index < 0 || table[index] != value ? -1 : index;
    }, module.exports = NGramParser;
}
