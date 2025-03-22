function(module, exports, __webpack_require__) {
    module.exports = {
        read: function(buf, options) {
            Buffer.isBuffer(buf) && (buf = buf.toString("ascii"));
            var parts = buf.trim().split(/[ \t\n]+/g);
            if (parts.length < 2 || parts.length > 3) throw new Error("Not a valid SSH certificate line");
            var algo = parts[0], data = parts[1];
            return fromBuffer(data = Buffer.from(data, "base64"), algo);
        },
        verify: function(cert, key) {
            return !1;
        },
        sign: function(cert, key) {
            void 0 === cert.signatures.openssh && (cert.signatures.openssh = {});
            try {
                var blob = toBuffer(cert, !0);
            } catch (e) {
                return delete cert.signatures.openssh, !1;
            }
            var sig = cert.signatures.openssh, hashAlgo = void 0;
            "rsa" !== key.type && "dsa" !== key.type || (hashAlgo = "sha1");
            var signer = key.createSign(hashAlgo);
            return signer.write(blob), sig.signature = signer.sign(), !0;
        },
        signAsync: function(cert, signer, done) {
            void 0 === cert.signatures.openssh && (cert.signatures.openssh = {});
            try {
                var blob = toBuffer(cert, !0);
            } catch (e) {
                return delete cert.signatures.openssh, void done(e);
            }
            var sig = cert.signatures.openssh;
            signer(blob, (function(err, signature) {
                if (err) done(err); else {
                    try {
                        signature.toBuffer("ssh");
                    } catch (e) {
                        return void done(e);
                    }
                    sig.signature = signature, done();
                }
            }));
        },
        write: function(cert, options) {
            void 0 === options && (options = {});
            var blob = toBuffer(cert), out = getCertType(cert.subjectKey) + " " + blob.toString("base64");
            return options.comment && (out = out + " " + options.comment), out;
        },
        fromBuffer: fromBuffer,
        toBuffer: toBuffer
    };
    var assert = __webpack_require__(15), SSHBuffer = __webpack_require__(100), crypto = __webpack_require__(9), Buffer = __webpack_require__(14).Buffer, algs = __webpack_require__(30), Key = __webpack_require__(25), Identity = (__webpack_require__(27), 
    __webpack_require__(103)), rfc4253 = __webpack_require__(57), Signature = __webpack_require__(48), utils = __webpack_require__(26), Certificate = __webpack_require__(102), TYPES = {
        user: 1,
        host: 2
    };
    Object.keys(TYPES).forEach((function(k) {
        TYPES[TYPES[k]] = k;
    }));
    var ECDSA_ALGO = /^ecdsa-sha2-([^@-]+)-cert-v01@openssh.com$/;
    function fromBuffer(data, algo, partial) {
        var sshbuf = new SSHBuffer({
            buffer: data
        }), innerAlgo = sshbuf.readString();
        if (void 0 !== algo && innerAlgo !== algo) throw new Error("SSH certificate algorithm mismatch");
        void 0 === algo && (algo = innerAlgo);
        var cert = {
            signatures: {}
        };
        cert.signatures.openssh = {}, cert.signatures.openssh.nonce = sshbuf.readBuffer();
        var key = {}, parts = key.parts = [];
        key.type = (function(certType) {
            if ("ssh-rsa-cert-v01@openssh.com" === certType) return "rsa";
            if ("ssh-dss-cert-v01@openssh.com" === certType) return "dsa";
            if (certType.match(ECDSA_ALGO)) return "ecdsa";
            if ("ssh-ed25519-cert-v01@openssh.com" === certType) return "ed25519";
            throw new Error("Unsupported cert type " + certType);
        })(algo);
        for (var partCount = algs.info[key.type].parts.length; parts.length < partCount; ) parts.push(sshbuf.readPart());
        assert.ok(parts.length >= 1, "key must have at least one part");
        var algInfo = algs.info[key.type];
        if ("ecdsa" === key.type) {
            var res = ECDSA_ALGO.exec(algo);
            assert.ok(null !== res), assert.strictEqual(res[1], parts[0].data.toString());
        }
        for (var i = 0; i < algInfo.parts.length; ++i) if (parts[i].name = algInfo.parts[i], 
        "curve" !== parts[i].name && !1 !== algInfo.normalize) {
            var p = parts[i];
            p.data = utils.mpNormalize(p.data);
        }
        cert.subjectKey = new Key(key), cert.serial = sshbuf.readInt64();
        var type = TYPES[sshbuf.readInt()];
        assert.string(type, "valid cert type"), cert.signatures.openssh.keyId = sshbuf.readString();
        for (var principals = [], pbuf = sshbuf.readBuffer(), psshbuf = new SSHBuffer({
            buffer: pbuf
        }); !psshbuf.atEnd(); ) principals.push(psshbuf.readString());
        0 === principals.length && (principals = [ "*" ]), cert.subjects = principals.map((function(pr) {
            if ("user" === type) return Identity.forUser(pr);
            if ("host" === type) return Identity.forHost(pr);
            throw new Error("Unknown identity type " + type);
        })), cert.validFrom = int64ToDate(sshbuf.readInt64()), cert.validUntil = int64ToDate(sshbuf.readInt64());
        for (var ext, exts = [], extbuf = new SSHBuffer({
            buffer: sshbuf.readBuffer()
        }); !extbuf.atEnd(); ) (ext = {
            critical: !0
        }).name = extbuf.readString(), ext.data = extbuf.readBuffer(), exts.push(ext);
        for (extbuf = new SSHBuffer({
            buffer: sshbuf.readBuffer()
        }); !extbuf.atEnd(); ) (ext = {
            critical: !1
        }).name = extbuf.readString(), ext.data = extbuf.readBuffer(), exts.push(ext);
        cert.signatures.openssh.exts = exts, sshbuf.readBuffer();
        var signingKeyBuf = sshbuf.readBuffer();
        cert.issuerKey = rfc4253.read(signingKeyBuf), cert.issuer = Identity.forHost("**");
        var sigBuf = sshbuf.readBuffer();
        return cert.signatures.openssh.signature = Signature.parse(sigBuf, cert.issuerKey.type, "ssh"), 
        void 0 !== partial && (partial.remainder = sshbuf.remainder(), partial.consumed = sshbuf._offset), 
        new Certificate(cert);
    }
    function int64ToDate(buf) {
        var i = 4294967296 * buf.readUInt32BE(0);
        i += buf.readUInt32BE(4);
        var d = new Date;
        return d.setTime(1e3 * i), d.sourceInt64 = buf, d;
    }
    function dateToInt64(date) {
        if (void 0 !== date.sourceInt64) return date.sourceInt64;
        var i = Math.round(date.getTime() / 1e3), upper = Math.floor(i / 4294967296), lower = Math.floor(i % 4294967296), buf = Buffer.alloc(8);
        return buf.writeUInt32BE(upper, 0), buf.writeUInt32BE(lower, 4), buf;
    }
    function toBuffer(cert, noSig) {
        assert.object(cert.signatures.openssh, "signature for openssh format");
        var sig = cert.signatures.openssh;
        void 0 === sig.nonce && (sig.nonce = crypto.randomBytes(16));
        var buf = new SSHBuffer({});
        buf.writeString(getCertType(cert.subjectKey)), buf.writeBuffer(sig.nonce);
        var key = cert.subjectKey;
        algs.info[key.type].parts.forEach((function(part) {
            buf.writePart(key.part[part]);
        })), buf.writeInt64(cert.serial);
        var type = cert.subjects[0].type;
        assert.notStrictEqual(type, "unknown"), cert.subjects.forEach((function(id) {
            assert.strictEqual(id.type, type);
        })), type = TYPES[type], buf.writeInt(type), void 0 === sig.keyId && (sig.keyId = cert.subjects[0].type + "_" + (cert.subjects[0].uid || cert.subjects[0].hostname)), 
        buf.writeString(sig.keyId);
        var sub = new SSHBuffer({});
        cert.subjects.forEach((function(id) {
            type === TYPES.host ? sub.writeString(id.hostname) : type === TYPES.user && sub.writeString(id.uid);
        })), buf.writeBuffer(sub.toBuffer()), buf.writeInt64(dateToInt64(cert.validFrom)), 
        buf.writeInt64(dateToInt64(cert.validUntil));
        var exts = sig.exts;
        void 0 === exts && (exts = []);
        var extbuf = new SSHBuffer({});
        return exts.forEach((function(ext) {
            !0 === ext.critical && (extbuf.writeString(ext.name), extbuf.writeBuffer(ext.data));
        })), buf.writeBuffer(extbuf.toBuffer()), extbuf = new SSHBuffer({}), exts.forEach((function(ext) {
            !0 !== ext.critical && (extbuf.writeString(ext.name), extbuf.writeBuffer(ext.data));
        })), buf.writeBuffer(extbuf.toBuffer()), buf.writeBuffer(Buffer.alloc(0)), sub = rfc4253.write(cert.issuerKey), 
        buf.writeBuffer(sub), noSig || buf.writeBuffer(sig.signature.toBuffer("ssh")), buf.toBuffer();
    }
    function getCertType(key) {
        if ("rsa" === key.type) return "ssh-rsa-cert-v01@openssh.com";
        if ("dsa" === key.type) return "ssh-dss-cert-v01@openssh.com";
        if ("ecdsa" === key.type) return "ecdsa-sha2-" + key.curve + "-cert-v01@openssh.com";
        if ("ed25519" === key.type) return "ssh-ed25519-cert-v01@openssh.com";
        throw new Error("Unsupported key type " + key.type);
    }
}
