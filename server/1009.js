function(module, exports, __webpack_require__) {
    "use strict";
    var byteTable = [ 255, 255, 26, 27, 28, 29, 30, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 255, 255, 255, 255, 255, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 255, 255, 255, 255, 255 ];
    exports.encode = function(plain) {
        Buffer.isBuffer(plain) || (plain = new Buffer(plain));
        for (var buff, quintets, i = 0, j = 0, shiftIndex = 0, digit = 0, encoded = new Buffer(8 * (buff = plain, 
        quintets = Math.floor(buff.length / 5), buff.length % 5 == 0 ? quintets : quintets + 1)); i < plain.length; ) {
            var current = plain[i];
            shiftIndex > 3 ? (digit = (digit = current & 255 >> shiftIndex) << (shiftIndex = (shiftIndex + 5) % 8) | (i + 1 < plain.length ? plain[i + 1] : 0) >> 8 - shiftIndex, 
            i++) : (digit = current >> 8 - (shiftIndex + 5) & 31, 0 == (shiftIndex = (shiftIndex + 5) % 8) && i++), 
            encoded[j] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".charCodeAt(digit), j++;
        }
        for (i = j; i < encoded.length; i++) encoded[i] = 61;
        return encoded;
    }, exports.decode = function(encoded) {
        var plainChar, shiftIndex = 0, plainDigit = 0, plainPos = 0;
        Buffer.isBuffer(encoded) || (encoded = new Buffer(encoded));
        for (var decoded = new Buffer(Math.ceil(5 * encoded.length / 8)), i = 0; i < encoded.length && 61 !== encoded[i]; i++) {
            var encodedByte = encoded[i] - 48;
            if (!(encodedByte < byteTable.length)) throw new Error("Invalid input - it is not base32 encoded string");
            plainDigit = byteTable[encodedByte], shiftIndex <= 3 ? 0 == (shiftIndex = (shiftIndex + 5) % 8) ? (plainChar |= plainDigit, 
            decoded[plainPos] = plainChar, plainPos++, plainChar = 0) : plainChar |= 255 & plainDigit << 8 - shiftIndex : (plainChar |= 255 & plainDigit >>> (shiftIndex = (shiftIndex + 5) % 8), 
            decoded[plainPos] = plainChar, plainPos++, plainChar = 255 & plainDigit << 8 - shiftIndex);
        }
        return decoded.slice(0, plainPos);
    };
}
