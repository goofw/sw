function(module, exports, __webpack_require__) {
    var Buffer = __webpack_require__(90).Buffer;
    function getIntFromBuffer(buffer, start, end) {
        for (var sum = 0, sign = 1, i = start; i < end; i++) {
            var num = buffer[i];
            if (num < 58 && num >= 48) sum = 10 * sum + (num - 48); else if (i !== start || 43 !== num) {
                if (i !== start || 45 !== num) {
                    if (46 === num) break;
                    throw new Error("not a number: buffer[" + i + "] = " + num);
                }
                sign = -1;
            }
        }
        return sum * sign;
    }
    function decode(data, start, end, encoding) {
        return null == data || 0 === data.length ? null : ("number" != typeof start && null == encoding && (encoding = start, 
        start = void 0), "number" != typeof end && null == encoding && (encoding = end, 
        end = void 0), decode.position = 0, decode.encoding = encoding || null, decode.data = Buffer.isBuffer(data) ? data.slice(start, end) : Buffer.from(data), 
        decode.bytes = decode.data.length, decode.next());
    }
    decode.bytes = 0, decode.position = 0, decode.data = null, decode.encoding = null, 
    decode.next = function() {
        switch (decode.data[decode.position]) {
          case 100:
            return decode.dictionary();

          case 108:
            return decode.list();

          case 105:
            return decode.integer();

          default:
            return decode.buffer();
        }
    }, decode.find = function(chr) {
        for (var i = decode.position, c = decode.data.length, d = decode.data; i < c; ) {
            if (d[i] === chr) return i;
            i++;
        }
        throw new Error('Invalid data: Missing delimiter "' + String.fromCharCode(chr) + '" [0x' + chr.toString(16) + "]");
    }, decode.dictionary = function() {
        decode.position++;
        for (var dict = {}; 101 !== decode.data[decode.position]; ) dict[decode.buffer()] = decode.next();
        return decode.position++, dict;
    }, decode.list = function() {
        decode.position++;
        for (var lst = []; 101 !== decode.data[decode.position]; ) lst.push(decode.next());
        return decode.position++, lst;
    }, decode.integer = function() {
        var end = decode.find(101), number = getIntFromBuffer(decode.data, decode.position + 1, end);
        return decode.position += end + 1 - decode.position, number;
    }, decode.buffer = function() {
        var sep = decode.find(58), length = getIntFromBuffer(decode.data, decode.position, sep), end = ++sep + length;
        return decode.position = end, decode.encoding ? decode.data.toString(decode.encoding, sep, end) : decode.data.slice(sep, end);
    }, module.exports = decode;
}
