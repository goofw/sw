function(module, exports, __webpack_require__) {
    module.exports = {
        read: read.bind(void 0, !1, void 0),
        readType: read.bind(void 0, !1),
        write: function(key, options) {
            assert.object(key);
            var i, alg = keyTypeToAlg(key), algInfo = algs.info[key.type];
            PrivateKey.isPrivateKey(key) && (algInfo = algs.privInfo[key.type]);
            var parts = algInfo.parts, buf = new SSHBuffer({});
            for (buf.writeString(alg), i = 0; i < parts.length; ++i) {
                var data = key.part[parts[i]].data;
                !1 !== algInfo.normalize && (data = "ed25519" === key.type ? utils.zeroPadToLength(data, 32) : utils.mpNormalize(data)), 
                "ed25519" === key.type && "k" === parts[i] && (data = Buffer.concat([ data, key.part.A.data ])), 
                buf.writeBuffer(data);
            }
            return buf.toBuffer();
        },
        readPartial: read.bind(void 0, !0),
        readInternal: read,
        keyTypeToAlg: keyTypeToAlg,
        algToKeyType: algToKeyType
    };
    var assert = __webpack_require__(15), Buffer = __webpack_require__(14).Buffer, algs = __webpack_require__(30), utils = __webpack_require__(26), Key = __webpack_require__(25), PrivateKey = __webpack_require__(27), SSHBuffer = __webpack_require__(100);
    function algToKeyType(alg) {
        if (assert.string(alg), "ssh-dss" === alg) return "dsa";
        if ("ssh-rsa" === alg) return "rsa";
        if ("ssh-ed25519" === alg) return "ed25519";
        if ("ssh-curve25519" === alg) return "curve25519";
        if (alg.match(/^ecdsa-sha2-/)) return "ecdsa";
        throw new Error("Unknown algorithm " + alg);
    }
    function keyTypeToAlg(key) {
        if (assert.object(key), "dsa" === key.type) return "ssh-dss";
        if ("rsa" === key.type) return "ssh-rsa";
        if ("ed25519" === key.type) return "ssh-ed25519";
        if ("curve25519" === key.type) return "ssh-curve25519";
        if ("ecdsa" === key.type) return "ecdsa-sha2-" + key.part.curve.data.toString();
        throw new Error("Unknown key type " + key.type);
    }
    function read(partial, type, buf, options) {
        "string" == typeof buf && (buf = Buffer.from(buf)), assert.buffer(buf, "buf");
        var key = {}, parts = key.parts = [], sshbuf = new SSHBuffer({
            buffer: buf
        }), alg = sshbuf.readString();
        assert.ok(!sshbuf.atEnd(), "key must have at least one part"), key.type = algToKeyType(alg);
        var partCount = algs.info[key.type].parts.length;
        for (type && "private" === type && (partCount = algs.privInfo[key.type].parts.length); !sshbuf.atEnd() && parts.length < partCount; ) parts.push(sshbuf.readPart());
        for (;!partial && !sshbuf.atEnd(); ) parts.push(sshbuf.readPart());
        assert.ok(parts.length >= 1, "key must have at least one part"), assert.ok(partial || sshbuf.atEnd(), "leftover bytes at end of key");
        var Constructor = Key, algInfo = algs.info[key.type];
        if ("private" !== type && algInfo.parts.length === parts.length || (algInfo = algs.privInfo[key.type], 
        Constructor = PrivateKey), assert.strictEqual(algInfo.parts.length, parts.length), 
        "ecdsa" === key.type) {
            var res = /^ecdsa-sha2-(.+)$/.exec(alg);
            assert.ok(null !== res), assert.strictEqual(res[1], parts[0].data.toString());
        }
        for (var normalized = !0, i = 0; i < algInfo.parts.length; ++i) {
            var nd, p = parts[i];
            p.name = algInfo.parts[i], "ed25519" === key.type && "k" === p.name && (p.data = p.data.slice(0, 32)), 
            "curve" !== p.name && !1 !== algInfo.normalize && (nd = "ed25519" === key.type ? utils.zeroPadToLength(p.data, 32) : utils.mpNormalize(p.data)).toString("binary") !== p.data.toString("binary") && (p.data = nd, 
            normalized = !1);
        }
        return normalized && (key._rfc4253Cache = sshbuf.toBuffer()), partial && "object" == typeof partial && (partial.remainder = sshbuf.remainder(), 
        partial.consumed = sshbuf._offset), new Constructor(key);
    }
}
