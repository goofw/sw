function(module, exports, __webpack_require__) {
    var ipaddr = __webpack_require__(166), compact2string = function(buf) {
        switch (buf.length) {
          case 6:
            return buf[0] + "." + buf[1] + "." + buf[2] + "." + buf[3] + ":" + buf.readUInt16BE(4);

          case 18:
            for (var hexGroups = [], i = 0; i < 8; i++) hexGroups.push(buf.readUInt16BE(2 * i).toString(16));
            return "[" + ipaddr.parse(hexGroups.join(":")).toString() + "]:" + buf.readUInt16BE(16);

          default:
            throw new Error("Invalid Compact IP/PORT, It should contain 6 or 18 bytes");
        }
    };
    compact2string.multi = function(buf) {
        if (buf.length % 6 != 0) throw new Error("buf length isn't multiple of compact IP/PORTs (6 bytes)");
        for (var output = [], i = 0; i <= buf.length - 1; i += 6) output.push(compact2string(buf.slice(i, i + 6)));
        return output;
    }, compact2string.multi6 = function(buf) {
        if (buf.length % 18 != 0) throw new Error("buf length isn't multiple of compact IP6/PORTs (18 bytes)");
        for (var output = [], i = 0; i <= buf.length - 1; i += 18) output.push(compact2string(buf.slice(i, i + 18)));
        return output;
    }, module.exports = compact2string;
}
