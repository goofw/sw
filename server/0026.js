function(module, exports, __webpack_require__) {
    module.exports = {
        bufferSplit: function(buf, chr) {
            assert.buffer(buf), assert.string(chr);
            for (var parts = [], lastPart = 0, matches = 0, i = 0; i < buf.length; ++i) if (buf[i] === chr.charCodeAt(matches) ? ++matches : matches = buf[i] === chr.charCodeAt(0) ? 1 : 0, 
            matches >= chr.length) {
                var newPart = i + 1;
                parts.push(buf.slice(lastPart, newPart - matches)), lastPart = newPart, matches = 0;
            }
            return lastPart <= buf.length && parts.push(buf.slice(lastPart, buf.length)), parts;
        },
        addRSAMissing: function(key) {
            assert.object(key), assertCompatible(key, PrivateKey, [ 1, 1 ]);
            var buf, d = new jsbn(key.part.d.data);
            if (!key.part.dmodp) {
                var p = new jsbn(key.part.p.data);
                buf = bigintToMpBuf(d.mod(p.subtract(1))), key.part.dmodp = {
                    name: "dmodp",
                    data: buf
                }, key.parts.push(key.part.dmodp);
            }
            if (!key.part.dmodq) {
                var q = new jsbn(key.part.q.data);
                buf = bigintToMpBuf(d.mod(q.subtract(1))), key.part.dmodq = {
                    name: "dmodq",
                    data: buf
                }, key.parts.push(key.part.dmodq);
            }
        },
        calculateDSAPublic: function(g, p, x) {
            return assert.buffer(g), assert.buffer(p), assert.buffer(x), g = new jsbn(g), p = new jsbn(p), 
            x = new jsbn(x), bigintToMpBuf(g.modPow(x, p));
        },
        calculateED25519Public: function(k) {
            assert.buffer(k);
            var kp = nacl.sign.keyPair.fromSeed(new Uint8Array(k));
            return Buffer.from(kp.publicKey);
        },
        calculateX25519Public: function(k) {
            assert.buffer(k);
            var kp = nacl.box.keyPair.fromSeed(new Uint8Array(k));
            return Buffer.from(kp.publicKey);
        },
        mpNormalize: mpNormalize,
        mpDenormalize: function(buf) {
            for (assert.buffer(buf); buf.length > 1 && 0 === buf[0]; ) buf = buf.slice(1);
            return buf;
        },
        ecNormalize: function(buf, addZero) {
            if (assert.buffer(buf), 0 === buf[0] && 4 === buf[1]) return addZero ? buf : buf.slice(1);
            if (4 === buf[0]) {
                if (!addZero) return buf;
            } else {
                for (;0 === buf[0]; ) buf = buf.slice(1);
                if (2 === buf[0] || 3 === buf[0]) throw new Error("Compressed elliptic curve points are not supported");
                if (4 !== buf[0]) throw new Error("Not a valid elliptic curve point");
                if (!addZero) return buf;
            }
            var b = Buffer.alloc(buf.length + 1);
            return b[0] = 0, buf.copy(b, 1), b;
        },
        countZeros: function(buf) {
            for (var o = 0, obit = 8; o < buf.length; ) {
                var mask = 1 << obit;
                if ((buf[o] & mask) === mask) break;
                --obit < 0 && (o++, obit = 8);
            }
            return 8 * o + (8 - obit) - 1;
        },
        assertCompatible: assertCompatible,
        isCompatible: function(obj, klass, needVer) {
            if (null === obj || "object" != typeof obj) return !1;
            if (void 0 === needVer && (needVer = klass.prototype._sshpkApiVersion), obj instanceof klass && klass.prototype._sshpkApiVersion[0] == needVer[0]) return !0;
            for (var proto = Object.getPrototypeOf(obj), depth = 0; proto.constructor.name !== klass.name; ) if (!(proto = Object.getPrototypeOf(proto)) || ++depth > 3) return !1;
            if (proto.constructor.name !== klass.name) return !1;
            var ver = proto._sshpkApiVersion;
            return void 0 === ver && (ver = klass._oldVersionDetect(obj)), !(ver[0] != needVer[0] || ver[1] < needVer[1]);
        },
        opensslKeyDeriv: function(cipher, salt, passphrase, count) {
            assert.buffer(salt, "salt"), assert.buffer(passphrase, "passphrase"), assert.number(count, "iteration count");
            var D, D_prev, bufs, clen = CIPHER_LEN[cipher];
            assert.object(clen, "supported cipher"), salt = salt.slice(0, 8);
            for (var material = Buffer.alloc(0); material.length < clen.key + clen.iv; ) {
                bufs = [], D_prev && bufs.push(D_prev), bufs.push(passphrase), bufs.push(salt), 
                D = Buffer.concat(bufs);
                for (var j = 0; j < count; ++j) D = crypto.createHash("md5").update(D).digest();
                material = Buffer.concat([ material, D ]), D_prev = D;
            }
            return {
                key: material.slice(0, clen.key),
                iv: material.slice(clen.key, clen.key + clen.iv)
            };
        },
        opensshCipherInfo: function(cipher) {
            var inf = {};
            switch (cipher) {
              case "3des-cbc":
                inf.keySize = 24, inf.blockSize = 8, inf.opensslName = "des-ede3-cbc";
                break;

              case "blowfish-cbc":
                inf.keySize = 16, inf.blockSize = 8, inf.opensslName = "bf-cbc";
                break;

              case "aes128-cbc":
              case "aes128-ctr":
              case "aes128-gcm@openssh.com":
                inf.keySize = 16, inf.blockSize = 16, inf.opensslName = "aes-128-" + cipher.slice(7, 10);
                break;

              case "aes192-cbc":
              case "aes192-ctr":
              case "aes192-gcm@openssh.com":
                inf.keySize = 24, inf.blockSize = 16, inf.opensslName = "aes-192-" + cipher.slice(7, 10);
                break;

              case "aes256-cbc":
              case "aes256-ctr":
              case "aes256-gcm@openssh.com":
                inf.keySize = 32, inf.blockSize = 16, inf.opensslName = "aes-256-" + cipher.slice(7, 10);
                break;

              default:
                throw new Error('Unsupported openssl cipher "' + cipher + '"');
            }
            return inf;
        },
        publicFromPrivateECDSA: function(curveName, priv) {
            assert.string(curveName, "curveName"), assert.buffer(priv);
            var params = algs.curves[curveName], p = new jsbn(params.p), a = new jsbn(params.a), b = new jsbn(params.b), curve = new ec.ECCurveFp(p, a, b), G = curve.decodePointHex(params.G.toString("hex")), d = new jsbn(mpNormalize(priv)), pub = G.multiply(d);
            pub = Buffer.from(curve.encodePointHex(pub), "hex");
            var parts = [];
            return parts.push({
                name: "curve",
                data: Buffer.from(curveName)
            }), parts.push({
                name: "Q",
                data: pub
            }), new Key({
                type: "ecdsa",
                curve: curve,
                parts: parts
            });
        },
        zeroPadToLength: function(buf, len) {
            for (assert.buffer(buf), assert.number(len); buf.length > len; ) assert.equal(buf[0], 0), 
            buf = buf.slice(1);
            for (;buf.length < len; ) {
                var b = Buffer.alloc(buf.length + 1);
                b[0] = 0, buf.copy(b, 1), buf = b;
            }
            return buf;
        },
        writeBitString: function(der, buf, tag) {
            void 0 === tag && (tag = asn1.Ber.BitString);
            var b = Buffer.alloc(buf.length + 1);
            b[0] = 0, buf.copy(b, 1), der.writeBuffer(b, tag);
        },
        readBitString: function(der, tag) {
            void 0 === tag && (tag = asn1.Ber.BitString);
            var buf = der.readString(tag, !0);
            return assert.strictEqual(buf[0], 0, "bit strings with unused bits are not supported (0x" + buf[0].toString(16) + ")"), 
            buf.slice(1);
        },
        pbkdf2: function(hashAlg, salt, iterations, size, passphrase) {
            var hkey = Buffer.alloc(salt.length + 4);
            salt.copy(hkey);
            for (var gen = 0, ts = [], i = 1; gen < size; ) {
                var t = T(i++);
                gen += t.length, ts.push(t);
            }
            return Buffer.concat(ts).slice(0, size);
            function T(I) {
                hkey.writeUInt32BE(I, hkey.length - 4);
                var hmac = crypto.createHmac(hashAlg, passphrase);
                hmac.update(hkey);
                for (var Ti = hmac.digest(), Uc = Ti, c = 1; c++ < iterations; ) {
                    (hmac = crypto.createHmac(hashAlg, passphrase)).update(Uc), Uc = hmac.digest();
                    for (var x = 0; x < Ti.length; ++x) Ti[x] ^= Uc[x];
                }
                return Ti;
            }
        }
    };
    var assert = __webpack_require__(15), Buffer = __webpack_require__(14).Buffer, PrivateKey = __webpack_require__(27), Key = __webpack_require__(25), crypto = __webpack_require__(9), algs = __webpack_require__(30), asn1 = __webpack_require__(49), ec = __webpack_require__(151), jsbn = __webpack_require__(98).BigInteger, nacl = __webpack_require__(99);
    function assertCompatible(obj, klass, needVer, name) {
        if (void 0 === name && (name = "object"), assert.ok(obj, name + " must not be null"), 
        assert.object(obj, name + " must be an object"), void 0 === needVer && (needVer = klass.prototype._sshpkApiVersion), 
        !(obj instanceof klass && klass.prototype._sshpkApiVersion[0] == needVer[0])) {
            for (var proto = Object.getPrototypeOf(obj), depth = 0; proto.constructor.name !== klass.name; ) proto = Object.getPrototypeOf(proto), 
            assert.ok(proto && ++depth <= 3, name + " must be a " + klass.name + " instance");
            assert.strictEqual(proto.constructor.name, klass.name, name + " must be a " + klass.name + " instance");
            var ver = proto._sshpkApiVersion;
            void 0 === ver && (ver = klass._oldVersionDetect(obj)), assert.ok(ver[0] == needVer[0] && ver[1] >= needVer[1], name + " must be compatible with " + klass.name + " klass version " + needVer[0] + "." + needVer[1]);
        }
    }
    var CIPHER_LEN = {
        "des-ede3-cbc": {
            key: 24,
            iv: 8
        },
        "aes-128-cbc": {
            key: 16,
            iv: 16
        },
        "aes-256-cbc": {
            key: 32,
            iv: 16
        }
    };
    function mpNormalize(buf) {
        for (assert.buffer(buf); buf.length > 1 && 0 === buf[0] && 0 == (128 & buf[1]); ) buf = buf.slice(1);
        if (128 == (128 & buf[0])) {
            var b = Buffer.alloc(buf.length + 1);
            b[0] = 0, buf.copy(b, 1), buf = b;
        }
        return buf;
    }
    function bigintToMpBuf(bigint) {
        var buf = Buffer.from(bigint.toByteArray());
        return mpNormalize(buf);
    }
}
