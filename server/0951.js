function(module, exports, __webpack_require__) {
    var table, bigInt = __webpack_require__(1158), Stream = __webpack_require__(3);
    function crc(ch, crc) {
        return table || (function() {
            var c, n, k;
            for (table = [], n = 0; n < 256; n++) {
                for (c = n, k = 0; k < 8; k++) c = 1 & c ? 3988292384 ^ c >>> 1 : c >>>= 1;
                table[n] = c >>> 0;
            }
        })(), ch.charCodeAt && (ch = ch.charCodeAt(0)), bigInt(crc).shiftRight(8).and(16777215).xor(table[bigInt(crc).xor(ch).and(255)]).value;
    }
    function Decrypt() {
        if (!(this instanceof Decrypt)) return new Decrypt;
        this.key0 = 305419896, this.key1 = 591751049, this.key2 = 878082192;
    }
    Stream.Writable && Stream.Writable.prototype.destroy || (Stream = __webpack_require__(77)), 
    Decrypt.prototype.update = function(h) {
        this.key0 = crc(h, this.key0), this.key1 = bigInt(this.key0).and(255).and(4294967295).add(this.key1), 
        this.key1 = bigInt(this.key1).multiply(134775813).add(1).and(4294967295).value, 
        this.key2 = crc(bigInt(this.key1).shiftRight(24).and(255), this.key2);
    }, Decrypt.prototype.decryptByte = function(c) {
        var k = bigInt(this.key2).or(2);
        return c ^= bigInt(k).multiply(bigInt(1 ^ k)).shiftRight(8).and(255), this.update(c), 
        c;
    }, Decrypt.prototype.stream = function() {
        var stream = Stream.Transform(), self = this;
        return stream._transform = function(d, e, cb) {
            for (var i = 0; i < d.length; i++) d[i] = self.decryptByte(d[i]);
            this.push(d), cb();
        }, stream;
    }, module.exports = Decrypt;
}
