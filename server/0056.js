function(module, exports, __webpack_require__) {
    module.exports = {
        read: function(buf, options, forceType) {
            var input = buf;
            "string" != typeof buf && (assert.buffer(buf, "buf"), buf = buf.toString("ascii"));
            for (var m, m2, lines = buf.trim().split(/[\r\n]+/g), si = -1; !m && si < lines.length; ) m = lines[++si].match(/[-]+[ ]*BEGIN ([A-Z0-9][A-Za-z0-9]+ )?(PUBLIC|PRIVATE) KEY[ ]*[-]+/);
            assert.ok(m, "invalid PEM header");
            for (var ei = lines.length; !m2 && ei > 0; ) m2 = lines[--ei].match(/[-]+[ ]*END ([A-Z0-9][A-Za-z0-9]+ )?(PUBLIC|PRIVATE) KEY[ ]*[-]+/);
            assert.ok(m2, "invalid PEM footer"), assert.equal(m[2], m2[2]);
            var alg, type = m[2].toLowerCase();
            m[1] && (assert.equal(m[1], m2[1], "PEM header and footer mismatch"), alg = m[1].trim()), 
            lines = lines.slice(si, ei + 1);
            for (var cipher, key, iv, headers = {}; m = (lines = lines.slice(1))[0].match(/^([A-Za-z0-9-]+): (.+)$/); ) headers[m[1].toLowerCase()] = m[2];
            if (lines = lines.slice(0, -1).join(""), buf = Buffer.from(lines, "base64"), headers["proc-type"]) {
                var parts = headers["proc-type"].split(",");
                if ("4" === parts[0] && "ENCRYPTED" === parts[1]) {
                    if ("string" == typeof options.passphrase && (options.passphrase = Buffer.from(options.passphrase, "utf-8")), 
                    !Buffer.isBuffer(options.passphrase)) throw new errors.KeyEncryptedError(options.filename, "PEM");
                    parts = headers["dek-info"].split(","), assert.ok(2 === parts.length), cipher = parts[0].toLowerCase(), 
                    iv = Buffer.from(parts[1], "hex"), key = utils.opensslKeyDeriv(cipher, iv, options.passphrase, 1).key;
                }
            }
            if (alg && "encrypted" === alg.toLowerCase()) {
                var pbesEnd, eder = new asn1.BerReader(buf);
                eder.readSequence(), eder.readSequence(), pbesEnd = eder.offset + eder.length;
                var method = eder.readOID();
                if ("1.2.840.113549.1.5.13" !== method) throw new Error("Unsupported PEM/PKCS8 encryption scheme: " + method);
                eder.readSequence(), eder.readSequence();
                var kdfEnd = eder.offset + eder.length, kdfOid = eder.readOID();
                if ("1.2.840.113549.1.5.12" !== kdfOid) throw new Error("Unsupported PBES2 KDF: " + kdfOid);
                eder.readSequence();
                var salt = eder.readString(asn1.Ber.OctetString, !0), iterations = eder.readInt(), hashAlg = "sha1";
                if (eder.offset < kdfEnd) {
                    eder.readSequence();
                    var hashAlgOid = eder.readOID();
                    if (void 0 === (hashAlg = OID_TO_HASH[hashAlgOid])) throw new Error("Unsupported PBKDF2 hash: " + hashAlgOid);
                }
                eder._offset = kdfEnd, eder.readSequence();
                var cipherOid = eder.readOID();
                if (void 0 === (cipher = OID_TO_CIPHER[cipherOid])) throw new Error("Unsupported PBES2 cipher: " + cipherOid);
                if (iv = eder.readString(asn1.Ber.OctetString, !0), eder._offset = pbesEnd, buf = eder.readString(asn1.Ber.OctetString, !0), 
                "string" == typeof options.passphrase && (options.passphrase = Buffer.from(options.passphrase, "utf-8")), 
                !Buffer.isBuffer(options.passphrase)) throw new errors.KeyEncryptedError(options.filename, "PEM");
                var cinfo = utils.opensshCipherInfo(cipher);
                cipher = cinfo.opensslName, key = utils.pbkdf2(hashAlg, salt, iterations, cinfo.keySize, options.passphrase), 
                alg = void 0;
            }
            if (cipher && key && iv) {
                var chunk, cipherStream = crypto.createDecipheriv(cipher, key, iv), chunks = [];
                for (cipherStream.once("error", (function(e) {
                    if (-1 !== e.toString().indexOf("bad decrypt")) throw new Error("Incorrect passphrase supplied, could not decrypt key");
                    throw e;
                })), cipherStream.write(buf), cipherStream.end(); null !== (chunk = cipherStream.read()); ) chunks.push(chunk);
                buf = Buffer.concat(chunks);
            }
            if (alg && "openssh" === alg.toLowerCase()) return sshpriv.readSSHPrivate(type, buf, options);
            if (alg && "ssh2" === alg.toLowerCase()) return rfc4253.readType(type, buf, options);
            var der = new asn1.BerReader(buf);
            return der.originalInput = input, der.readSequence(), alg ? (forceType && assert.strictEqual(forceType, "pkcs1"), 
            pkcs1.readPkcs1(alg, type, der)) : (forceType && assert.strictEqual(forceType, "pkcs8"), 
            pkcs8.readPkcs8(alg, type, der));
        },
        write: function(key, options, type) {
            assert.object(key);
            var header, alg = {
                ecdsa: "EC",
                rsa: "RSA",
                dsa: "DSA",
                ed25519: "EdDSA"
            }[key.type], der = new asn1.BerWriter;
            if (PrivateKey.isPrivateKey(key)) type && "pkcs8" === type ? (header = "PRIVATE KEY", 
            pkcs8.writePkcs8(der, key)) : (type && assert.strictEqual(type, "pkcs1"), header = alg + " PRIVATE KEY", 
            pkcs1.writePkcs1(der, key)); else {
                if (!Key.isKey(key)) throw new Error("key is not a Key or PrivateKey");
                type && "pkcs1" === type ? (header = alg + " PUBLIC KEY", pkcs1.writePkcs1(der, key)) : (type && assert.strictEqual(type, "pkcs8"), 
                header = "PUBLIC KEY", pkcs8.writePkcs8(der, key));
            }
            var tmp = der.buffer.toString("base64"), len = tmp.length + tmp.length / 64 + 18 + 16 + 2 * header.length + 10, buf = Buffer.alloc(len), o = 0;
            o += buf.write("-----BEGIN " + header + "-----\n", o);
            for (var i = 0; i < tmp.length; ) {
                var limit = i + 64;
                limit > tmp.length && (limit = tmp.length), o += buf.write(tmp.slice(i, limit), o), 
                buf[o++] = 10, i = limit;
            }
            return o += buf.write("-----END " + header + "-----\n", o), buf.slice(0, o);
        }
    };
    var assert = __webpack_require__(15), asn1 = __webpack_require__(49), crypto = __webpack_require__(9), Buffer = __webpack_require__(14).Buffer, utils = (__webpack_require__(30), 
    __webpack_require__(26)), Key = __webpack_require__(25), PrivateKey = __webpack_require__(27), pkcs1 = __webpack_require__(234), pkcs8 = __webpack_require__(101), sshpriv = __webpack_require__(152), rfc4253 = __webpack_require__(57), errors = __webpack_require__(44), OID_TO_CIPHER = {
        "1.2.840.113549.3.7": "3des-cbc",
        "2.16.840.1.101.3.4.1.2": "aes128-cbc",
        "2.16.840.1.101.3.4.1.42": "aes256-cbc"
    }, CIPHER_TO_OID = {};
    Object.keys(OID_TO_CIPHER).forEach((function(k) {
        CIPHER_TO_OID[OID_TO_CIPHER[k]] = k;
    }));
    var OID_TO_HASH = {
        "1.2.840.113549.2.7": "sha1",
        "1.2.840.113549.2.9": "sha256",
        "1.2.840.113549.2.11": "sha512"
    }, HASH_TO_OID = {};
    Object.keys(OID_TO_HASH).forEach((function(k) {
        HASH_TO_OID[OID_TO_HASH[k]] = k;
    }));
}
