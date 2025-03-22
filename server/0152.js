function(module, exports, __webpack_require__) {
    module.exports = {
        read: function(buf, options) {
            return pem.read(buf, options);
        },
        readSSHPrivate: function(type, buf, options) {
            var magic = (buf = new SSHBuffer({
                buffer: buf
            })).readCString();
            assert.strictEqual(magic, "openssh-key-v1", "bad magic string");
            var cipher = buf.readString(), kdf = buf.readString(), kdfOpts = buf.readBuffer();
            if (1 !== buf.readInt()) throw new Error("OpenSSH-format key file contains multiple keys: this is unsupported.");
            var pubKey = buf.readBuffer();
            if ("public" === type) return assert.ok(buf.atEnd(), "excess bytes left after key"), 
            rfc4253.read(pubKey);
            var privKeyBlob = buf.readBuffer();
            assert.ok(buf.atEnd(), "excess bytes left after key");
            var kdfOptsBuf = new SSHBuffer({
                buffer: kdfOpts
            });
            switch (kdf) {
              case "none":
                if ("none" !== cipher) throw new Error('OpenSSH-format key uses KDF "none" but specifies a cipher other than "none"');
                break;

              case "bcrypt":
                var salt = kdfOptsBuf.readBuffer(), rounds = kdfOptsBuf.readInt(), cinf = utils.opensshCipherInfo(cipher);
                if (void 0 === bcrypt && (bcrypt = __webpack_require__(481)), "string" == typeof options.passphrase && (options.passphrase = Buffer.from(options.passphrase, "utf-8")), 
                !Buffer.isBuffer(options.passphrase)) throw new errors.KeyEncryptedError(options.filename, "OpenSSH");
                var pass = new Uint8Array(options.passphrase), salti = new Uint8Array(salt), out = new Uint8Array(cinf.keySize + cinf.blockSize);
                if (0 !== bcrypt.pbkdf(pass, pass.length, salti, salti.length, out, out.length, rounds)) throw new Error("bcrypt_pbkdf function returned failure, parameters invalid");
                var ckey = (out = Buffer.from(out)).slice(0, cinf.keySize), iv = out.slice(cinf.keySize, cinf.keySize + cinf.blockSize), cipherStream = crypto.createDecipheriv(cinf.opensslName, ckey, iv);
                cipherStream.setAutoPadding(!1);
                var chunk, chunks = [];
                for (cipherStream.once("error", (function(e) {
                    if (-1 !== e.toString().indexOf("bad decrypt")) throw new Error("Incorrect passphrase supplied, could not decrypt key");
                    throw e;
                })), cipherStream.write(privKeyBlob), cipherStream.end(); null !== (chunk = cipherStream.read()); ) chunks.push(chunk);
                privKeyBlob = Buffer.concat(chunks);
                break;

              default:
                throw new Error('OpenSSH-format key uses unknown KDF "' + kdf + '"');
            }
            if ((buf = new SSHBuffer({
                buffer: privKeyBlob
            })).readInt() !== buf.readInt()) throw new Error("Incorrect passphrase supplied, could not decrypt key");
            var ret = {}, key = rfc4253.readInternal(ret, "private", buf.remainder());
            buf.skip(ret.consumed);
            var comment = buf.readString();
            return key.comment = comment, key;
        },
        write: function(key, options) {
            var pubKey;
            pubKey = PrivateKey.isPrivateKey(key) ? key.toPublic() : key;
            var passphrase, privBuf, cipher = "none", kdf = "none", kdfopts = Buffer.alloc(0), cinf = {
                blockSize: 8
            };
            if (void 0 !== options && ("string" == typeof (passphrase = options.passphrase) && (passphrase = Buffer.from(passphrase, "utf-8")), 
            void 0 !== passphrase && (assert.buffer(passphrase, "options.passphrase"), assert.optionalString(options.cipher, "options.cipher"), 
            void 0 === (cipher = options.cipher) && (cipher = "aes128-ctr"), cinf = utils.opensshCipherInfo(cipher), 
            kdf = "bcrypt")), PrivateKey.isPrivateKey(key)) {
                privBuf = new SSHBuffer({});
                var checkInt = crypto.randomBytes(4).readUInt32BE(0);
                privBuf.writeInt(checkInt), privBuf.writeInt(checkInt), privBuf.write(key.toBuffer("rfc4253")), 
                privBuf.writeString(key.comment || "");
                for (var n = 1; privBuf._offset % cinf.blockSize != 0; ) privBuf.writeChar(n++);
                privBuf = privBuf.toBuffer();
            }
            switch (kdf) {
              case "none":
                break;

              case "bcrypt":
                var salt = crypto.randomBytes(16), kdfssh = new SSHBuffer({});
                kdfssh.writeBuffer(salt), kdfssh.writeInt(16), kdfopts = kdfssh.toBuffer(), void 0 === bcrypt && (bcrypt = __webpack_require__(481));
                var pass = new Uint8Array(passphrase), salti = new Uint8Array(salt), out = new Uint8Array(cinf.keySize + cinf.blockSize);
                if (0 !== bcrypt.pbkdf(pass, pass.length, salti, salti.length, out, out.length, 16)) throw new Error("bcrypt_pbkdf function returned failure, parameters invalid");
                var ckey = (out = Buffer.from(out)).slice(0, cinf.keySize), iv = out.slice(cinf.keySize, cinf.keySize + cinf.blockSize), cipherStream = crypto.createCipheriv(cinf.opensslName, ckey, iv);
                cipherStream.setAutoPadding(!1);
                var chunk, chunks = [];
                for (cipherStream.once("error", (function(e) {
                    throw e;
                })), cipherStream.write(privBuf), cipherStream.end(); null !== (chunk = cipherStream.read()); ) chunks.push(chunk);
                privBuf = Buffer.concat(chunks);
                break;

              default:
                throw new Error("Unsupported kdf " + kdf);
            }
            var header, buf = new SSHBuffer({});
            buf.writeCString("openssh-key-v1"), buf.writeString(cipher), buf.writeString(kdf), 
            buf.writeBuffer(kdfopts), buf.writeInt(1), buf.writeBuffer(pubKey.toBuffer("rfc4253")), 
            privBuf && buf.writeBuffer(privBuf), buf = buf.toBuffer(), header = PrivateKey.isPrivateKey(key) ? "OPENSSH PRIVATE KEY" : "OPENSSH PUBLIC KEY";
            var tmp = buf.toString("base64"), len = tmp.length + tmp.length / 70 + 18 + 16 + 2 * header.length + 10, o = 0;
            o += (buf = Buffer.alloc(len)).write("-----BEGIN " + header + "-----\n", o);
            for (var i = 0; i < tmp.length; ) {
                var limit = i + 70;
                limit > tmp.length && (limit = tmp.length), o += buf.write(tmp.slice(i, limit), o), 
                buf[o++] = 10, i = limit;
            }
            return o += buf.write("-----END " + header + "-----\n", o), buf.slice(0, o);
        }
    };
    var bcrypt, assert = __webpack_require__(15), Buffer = (__webpack_require__(49), 
    __webpack_require__(14).Buffer), utils = (__webpack_require__(30), __webpack_require__(26)), crypto = __webpack_require__(9), PrivateKey = (__webpack_require__(25), 
    __webpack_require__(27)), pem = __webpack_require__(56), rfc4253 = __webpack_require__(57), SSHBuffer = __webpack_require__(100), errors = __webpack_require__(44);
}
