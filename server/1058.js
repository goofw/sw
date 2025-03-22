function(module, exports, __webpack_require__) {
    var x509 = __webpack_require__(484);
    module.exports = {
        read: function(buf, options) {
            "string" != typeof buf && (assert.buffer(buf, "buf"), buf = buf.toString("ascii"));
            for (var m, m2, lines = buf.trim().split(/[\r\n]+/g), si = -1; !m && si < lines.length; ) m = lines[++si].match(/[-]+[ ]*BEGIN CERTIFICATE[ ]*[-]+/);
            assert.ok(m, "invalid PEM header");
            for (var ei = lines.length; !m2 && ei > 0; ) m2 = lines[--ei].match(/[-]+[ ]*END CERTIFICATE[ ]*[-]+/);
            assert.ok(m2, "invalid PEM footer"), lines = lines.slice(si, ei + 1);
            for (var headers = {}; m = (lines = lines.slice(1))[0].match(/^([A-Za-z0-9-]+): (.+)$/); ) headers[m[1].toLowerCase()] = m[2];
            return lines = lines.slice(0, -1).join(""), buf = Buffer.from(lines, "base64"), 
            x509.read(buf, options);
        },
        verify: x509.verify,
        sign: x509.sign,
        write: function(cert, options) {
            var tmp = x509.write(cert, options).toString("base64"), len = tmp.length + tmp.length / 64 + 18 + 16 + 2 * "CERTIFICATE".length + 10, buf = Buffer.alloc(len), o = 0;
            o += buf.write("-----BEGIN CERTIFICATE-----\n", o);
            for (var i = 0; i < tmp.length; ) {
                var limit = i + 64;
                limit > tmp.length && (limit = tmp.length), o += buf.write(tmp.slice(i, limit), o), 
                buf[o++] = 10, i = limit;
            }
            return o += buf.write("-----END CERTIFICATE-----\n", o), buf.slice(0, o);
        }
    };
    var assert = __webpack_require__(15), Buffer = (__webpack_require__(49), __webpack_require__(14).Buffer);
    __webpack_require__(30), __webpack_require__(26), __webpack_require__(25), __webpack_require__(27), 
    __webpack_require__(56), __webpack_require__(103), __webpack_require__(48), __webpack_require__(102);
}
