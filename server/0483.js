function(module, exports, __webpack_require__) {
    module.exports = {
        read: function(buf, options) {
            for (var parts, lines = buf.toString("ascii").split(/[\r\n]+/), found = !1, si = 0; si < lines.length; ) if ((parts = splitHeader(lines[si++])) && "putty-user-key-file-2" === parts[0].toLowerCase()) {
                found = !0;
                break;
            }
            if (!found) throw new Error("No PuTTY format first line found");
            var alg = parts[1];
            parts = splitHeader(lines[si++]), assert.equal(parts[0].toLowerCase(), "encryption"), 
            parts = splitHeader(lines[si++]), assert.equal(parts[0].toLowerCase(), "comment");
            var comment = parts[1];
            parts = splitHeader(lines[si++]), assert.equal(parts[0].toLowerCase(), "public-lines");
            var publicLines = parseInt(parts[1], 10);
            if (!isFinite(publicLines) || publicLines < 0 || publicLines > lines.length) throw new Error("Invalid public-lines count");
            var publicBuf = Buffer.from(lines.slice(si, si + publicLines).join(""), "base64"), keyType = rfc4253.algToKeyType(alg), key = rfc4253.read(publicBuf);
            if (key.type !== keyType) throw new Error("Outer key algorithm mismatch");
            return key.comment = comment, key;
        },
        write: function(key, options) {
            if (assert.object(key), !Key.isKey(key)) throw new Error("Must be a public key");
            var alg = rfc4253.keyTypeToAlg(key), buf = rfc4253.write(key), comment = key.comment || "", lines = (function(txt, len) {
                for (var lines = [], pos = 0; pos < txt.length; ) lines.push(txt.slice(pos, pos + 64)), 
                pos += 64;
                return lines;
            })(buf.toString("base64"));
            return lines.unshift("Public-Lines: " + lines.length), lines.unshift("Comment: " + comment), 
            lines.unshift("Encryption: none"), lines.unshift("PuTTY-User-Key-File-2: " + alg), 
            Buffer.from(lines.join("\n") + "\n");
        }
    };
    var assert = __webpack_require__(15), Buffer = __webpack_require__(14).Buffer, rfc4253 = __webpack_require__(57), Key = __webpack_require__(25);
    function splitHeader(line) {
        var idx = line.indexOf(":");
        if (-1 === idx) return null;
        var header = line.slice(0, idx);
        for (++idx; " " === line[idx]; ) ++idx;
        return [ header, line.slice(idx) ];
    }
    __webpack_require__(44);
}
