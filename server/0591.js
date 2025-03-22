function(module, exports, __webpack_require__) {
    var Dict = __webpack_require__(592);
    function decode(data, encoding) {
        return decode.position = 0, decode.encoding = encoding || null, decode.data = Buffer.isBuffer(data) ? data : new Buffer(data), 
        decode.next();
    }
    decode.position = 0, decode.data = null, decode.encoding = null, decode.next = function() {
        switch (decode.data[decode.position]) {
          case 100:
            return decode.dictionary();

          case 108:
            return decode.list();

          case 105:
            return decode.integer();

          default:
            return decode.bytes();
        }
    }, decode.find = function(chr) {
        for (var i = decode.position, c = decode.data.length, d = decode.data; i < c; ) {
            if (d[i] === chr) return i;
            i++;
        }
        throw new Error('Invalid data: Missing delimiter "' + String.fromCharCode(chr) + '" [0x' + chr.toString(16) + "]");
    }, decode.dictionary = function() {
        decode.position++;
        for (var dict = new Dict; 101 !== decode.data[decode.position]; ) dict.binarySet(decode.bytes(), decode.next());
        return decode.position++, dict;
    }, decode.list = function() {
        decode.position++;
        for (var lst = []; 101 !== decode.data[decode.position]; ) lst.push(decode.next());
        return decode.position++, lst;
    }, decode.integer = function() {
        var end = decode.find(101), number = decode.data.toString("ascii", decode.position + 1, end);
        return decode.position += end + 1 - decode.position, parseInt(number, 10);
    }, decode.bytes = function() {
        var sep = decode.find(58), length = parseInt(decode.data.toString("ascii", decode.position, sep), 10), end = ++sep + length;
        return decode.position = end, decode.encoding ? decode.data.toString(decode.encoding, sep, end) : decode.data.slice(sep, end);
    }, module.exports = decode;
}
