function(module, exports, __webpack_require__) {
    var NGramParser = __webpack_require__(371), unshapeMap = [ 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 66, 66, 68, 69, 70, 71, 71, 73, 74, 75, 76, 77, 78, 79, 80, 73, 82, 83, 84, 85, 86, 86, 88, 88, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 99, 101, 101, 103, 103, 105, 106, 107, 108, 109, 110, 111, 105, 113, 113, 115, 116, 117, 118, 119, 119, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 128, 139, 139, 141, 141, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 154, 154, 154, 158, 158, 158, 161, 162, 163, 164, 165, 166, 167, 168, 169, 158, 171, 171, 173, 173, 175, 175, 177, 178, 179, 180, 181, 182, 183, 184, 185, 177, 187, 187, 189, 189, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 191, 204, 191, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 218, 220, 220, 220, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255 ];
    function NGramParser_IBM420(theNgramList, theByteMap) {
        this.alef = 0, NGramParser.call(this, theNgramList, theByteMap);
    }
    NGramParser_IBM420.prototype = Object.create(NGramParser.prototype), NGramParser_IBM420.prototype.nextByte = function(input) {
        return this.byteIndex >= input.length || 0 == input[this.byteIndex] ? -1 : (this.alef = 178 == (b = input[this.byteIndex]) || 179 == b ? 71 : 180 == b || 181 == b ? 73 : 184 == b || 185 == b ? 86 : 0, 
        next = 0 != this.alef ? 177 : 255 & unshapeMap[255 & input[this.byteIndex]], this.byteIndex++, 
        next);
        var next, b;
    }, NGramParser_IBM420.prototype.parseCharacters = function(input) {
        for (var b, ignoreSpace = !1; (b = this.nextByte(input)) >= 0; ) {
            var mb = this.byteMap[b];
            0 != mb && (mb == this.spaceChar && ignoreSpace || this.addByte(mb), ignoreSpace = mb == this.spaceChar), 
            0 != this.alef && 0 != (mb = this.byteMap[255 & this.alef]) && (mb == this.spaceChar && ignoreSpace || this.addByte(mb), 
            ignoreSpace = mb == this.spaceChar);
        }
    }, module.exports = NGramParser_IBM420;
}
