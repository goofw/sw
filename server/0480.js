function(module, exports, __webpack_require__) {
    module.exports = {
        read: function(buf, options) {
            if ("string" == typeof buf) {
                if (buf.trim().match(/^[-]+[ ]*BEGIN/)) return pem.read(buf, options);
                if (buf.match(/^\s*ssh-[a-z]/)) return ssh.read(buf, options);
                if (buf.match(/^\s*ecdsa-/)) return ssh.read(buf, options);
                if (buf.match(/^putty-user-key-file-2:/i)) return putty.read(buf, options);
                if (findDNSSECHeader(buf)) return dnssec.read(buf, options);
                buf = Buffer.from(buf, "binary");
            } else {
                if (assert.buffer(buf), (function(buf) {
                    for (var offset = 0; offset < buf.length && (32 === buf[offset] || 10 === buf[offset]); ) ++offset;
                    if (45 !== buf[offset]) return !1;
                    for (;offset < buf.length && 45 === buf[offset]; ) ++offset;
                    for (;offset < buf.length && 32 === buf[offset]; ) ++offset;
                    return !(offset + 5 > buf.length || "BEGIN" !== buf.slice(offset, offset + 5).toString("ascii"));
                })(buf)) return pem.read(buf, options);
                if ((function(buf) {
                    for (var offset = 0; offset < buf.length && (32 === buf[offset] || 10 === buf[offset] || 9 === buf[offset]); ) ++offset;
                    return offset + 4 <= buf.length && "ssh-" === buf.slice(offset, offset + 4).toString("ascii") || offset + 6 <= buf.length && "ecdsa-" === buf.slice(offset, offset + 6).toString("ascii");
                })(buf)) return ssh.read(buf, options);
                if ((function(buf) {
                    for (var offset = 0; offset < buf.length && (32 === buf[offset] || 10 === buf[offset] || 9 === buf[offset]); ) ++offset;
                    return offset + 22 <= buf.length && "putty-user-key-file-2:" === buf.slice(offset, offset + 22).toString("ascii").toLowerCase();
                })(buf)) return putty.read(buf, options);
                if (findDNSSECHeader(buf)) return dnssec.read(buf, options);
            }
            if (buf.readUInt32BE(0) < buf.length) return rfc4253.read(buf, options);
            throw new Error("Failed to auto-detect format of key");
        },
        write: function(key, options) {
            throw new Error('"auto" format cannot be used for writing');
        }
    };
    var assert = __webpack_require__(15), Buffer = __webpack_require__(14).Buffer, pem = (__webpack_require__(26), 
    __webpack_require__(25), __webpack_require__(27), __webpack_require__(56)), ssh = __webpack_require__(482), rfc4253 = __webpack_require__(57), dnssec = __webpack_require__(235), putty = __webpack_require__(483);
    function findDNSSECHeader(buf) {
        if (buf.length <= "Private-key-format: v1".length) return !1;
        if ("Private-key-format: v1" === buf.slice(0, "Private-key-format: v1".length).toString("ascii")) return !0;
        "string" != typeof buf && (buf = buf.toString("ascii"));
        for (var lines = buf.split("\n"), line = 0; lines[line].match(/^\;/); ) line++;
        return !!lines[line].toString("ascii").match(/\. IN KEY /) || !!lines[line].toString("ascii").match(/\. IN DNSKEY /);
    }
}
