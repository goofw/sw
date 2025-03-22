function(module, exports, __webpack_require__) {
    var NGramParser = __webpack_require__(371), NGramParser_IBM420 = __webpack_require__(715);
    module.exports.match = function(input, ngrams, byteMap, spaceChar) {
        return spaceChar = spaceChar || 32, new NGramParser(ngrams, byteMap).parse(input, spaceChar);
    }, module.exports.matchIBM420 = function(input, ngrams, byteMap, spaceChar) {
        return spaceChar = spaceChar || 32, new NGramParser_IBM420(ngrams, byteMap).parse(input, spaceChar);
    }, module.exports.NGramsPlusLang = function(la, ng) {
        this.lang = la, this.ngrams = ng;
    };
}
