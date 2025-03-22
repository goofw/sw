function(module, exports, __webpack_require__) {
    module.exports = {
        read: function(buf, options) {
            "string" != typeof buf && (assert.buffer(buf, "buf"), buf = buf.toString("ascii"));
            var trimmed = buf.trim().replace(/[\\\r]/g, ""), m = trimmed.match(SSHKEY_RE);
            m || (m = trimmed.match(SSHKEY_RE2)), assert.ok(m, "key must match regex");
            var key, type = rfc4253.algToKeyType(m[1]), kbuf = Buffer.from(m[2], "base64"), ret = {};
            if (m[4]) try {
                key = rfc4253.read(kbuf);
            } catch (e) {
                m = trimmed.match(SSHKEY_RE2), assert.ok(m, "key must match regex"), kbuf = Buffer.from(m[2], "base64"), 
                key = rfc4253.readInternal(ret, "public", kbuf);
            } else key = rfc4253.readInternal(ret, "public", kbuf);
            if (assert.strictEqual(type, key.type), m[4] && m[4].length > 0) key.comment = m[4]; else if (ret.consumed) {
                var data = m[2] + (m[3] ? m[3] : ""), realOffset = 4 * Math.ceil(ret.consumed / 3);
                for (data = data.slice(0, realOffset - 2).replace(/[^a-zA-Z0-9+\/=]/g, "") + data.slice(realOffset - 2), 
                ret.consumed % 3 > 0 && "=" !== data.slice(realOffset - 1, realOffset) && realOffset--; "=" === data.slice(realOffset, realOffset + 1); ) realOffset++;
                var trailer = data.slice(realOffset);
                (trailer = trailer.replace(/[\r\n]/g, " ").replace(/^\s+/, "")).match(/^[a-zA-Z0-9]/) && (key.comment = trailer);
            }
            return key;
        },
        write: function(key, options) {
            if (assert.object(key), !Key.isKey(key)) throw new Error("Must be a public key");
            var parts = [], alg = rfc4253.keyTypeToAlg(key);
            parts.push(alg);
            var buf = rfc4253.write(key);
            return parts.push(buf.toString("base64")), key.comment && parts.push(key.comment), 
            Buffer.from(parts.join(" "));
        }
    };
    var assert = __webpack_require__(15), Buffer = __webpack_require__(14).Buffer, rfc4253 = __webpack_require__(57), Key = (__webpack_require__(26), 
    __webpack_require__(25)), SSHKEY_RE = (__webpack_require__(27), __webpack_require__(152), 
    /^([a-z0-9-]+)[ \t]+([a-zA-Z0-9+\/]+[=]*)([ \t]+([^ \t][^\n]*[\n]*)?)?$/), SSHKEY_RE2 = /^([a-z0-9-]+)[ \t\n]+([a-zA-Z0-9+\/][a-zA-Z0-9+\/ \t\n=]*)([^a-zA-Z0-9+\/ \t\n=].*)?$/;
}
