function(module, exports, __webpack_require__) {
    module.exports = {
        DiffieHellman: DiffieHellman,
        generateECDSA: function(curve) {
            var parts = [];
            if (CRYPTO_HAVE_ECDH) {
                var osCurve = {
                    nistp256: "prime256v1",
                    nistp384: "secp384r1",
                    nistp521: "secp521r1"
                }[curve], dh = crypto.createECDH(osCurve);
                return dh.generateKeys(), parts.push({
                    name: "curve",
                    data: Buffer.from(curve)
                }), parts.push({
                    name: "Q",
                    data: dh.getPublicKey()
                }), parts.push({
                    name: "d",
                    data: dh.getPrivateKey()
                }), new PrivateKey({
                    type: "ecdsa",
                    curve: curve,
                    parts: parts
                });
            }
            var ecParams = new X9ECParameters(curve), n = ecParams.getN(), cByteLen = Math.ceil((n.bitLength() + 64) / 8), c = new jsbn(crypto.randomBytes(cByteLen)), n1 = n.subtract(jsbn.ONE), priv = c.mod(n1).add(jsbn.ONE), pub = ecParams.getG().multiply(priv);
            return priv = Buffer.from(priv.toByteArray()), pub = Buffer.from(ecParams.getCurve().encodePointHex(pub), "hex"), 
            parts.push({
                name: "curve",
                data: Buffer.from(curve)
            }), parts.push({
                name: "Q",
                data: pub
            }), parts.push({
                name: "d",
                data: priv
            }), new PrivateKey({
                type: "ecdsa",
                curve: curve,
                parts: parts
            });
        },
        generateED25519: function() {
            var pair = nacl.sign.keyPair(), priv = Buffer.from(pair.secretKey), pub = Buffer.from(pair.publicKey);
            assert.strictEqual(priv.length, 64), assert.strictEqual(pub.length, 32);
            var parts = [];
            return parts.push({
                name: "A",
                data: pub
            }), parts.push({
                name: "k",
                data: priv.slice(0, 32)
            }), new PrivateKey({
                type: "ed25519",
                parts: parts
            });
        }
    };
    var assert = __webpack_require__(15), crypto = __webpack_require__(9), Buffer = __webpack_require__(14).Buffer, algs = __webpack_require__(30), utils = __webpack_require__(26), nacl = __webpack_require__(99), Key = __webpack_require__(25), PrivateKey = __webpack_require__(27), CRYPTO_HAVE_ECDH = void 0 !== crypto.createECDH, ec = (__webpack_require__(1055), 
    __webpack_require__(151)), jsbn = __webpack_require__(98).BigInteger;
    function DiffieHellman(key) {
        if (utils.assertCompatible(key, Key, [ 1, 4 ], "key"), this._isPriv = PrivateKey.isPrivateKey(key, [ 1, 3 ]), 
        this._algo = key.type, this._curve = key.curve, this._key = key, "dsa" === key.type) {
            if (!CRYPTO_HAVE_ECDH) throw new Error("Due to bugs in the node 0.10 crypto API, node 0.12.x or later is required to use DH");
            this._dh = crypto.createDiffieHellman(key.part.p.data, void 0, key.part.g.data, void 0), 
            this._p = key.part.p, this._g = key.part.g, this._isPriv && this._dh.setPrivateKey(key.part.x.data), 
            this._dh.setPublicKey(key.part.y.data);
        } else if ("ecdsa" === key.type) {
            if (!CRYPTO_HAVE_ECDH) return this._ecParams = new X9ECParameters(this._curve), 
            void (this._isPriv && (this._priv = new ECPrivate(this._ecParams, key.part.d.data)));
            var curve = {
                nistp256: "prime256v1",
                nistp384: "secp384r1",
                nistp521: "secp521r1"
            }[key.curve];
            if (this._dh = crypto.createECDH(curve), "object" != typeof this._dh || "function" != typeof this._dh.setPrivateKey) return CRYPTO_HAVE_ECDH = !1, 
            void DiffieHellman.call(this, key);
            this._isPriv && this._dh.setPrivateKey(key.part.d.data), this._dh.setPublicKey(key.part.Q.data);
        } else {
            if ("curve25519" !== key.type) throw new Error("DH not supported for " + key.type + " keys");
            this._isPriv && (utils.assertCompatible(key, PrivateKey, [ 1, 5 ], "key"), this._priv = key.part.k.data);
        }
    }
    function X9ECParameters(name) {
        var params = algs.curves[name];
        assert.object(params);
        var p = new jsbn(params.p), a = new jsbn(params.a), b = new jsbn(params.b), n = new jsbn(params.n), h = jsbn.ONE, curve = new ec.ECCurveFp(p, a, b), G = curve.decodePointHex(params.G.toString("hex"));
        this.curve = curve, this.g = G, this.n = n, this.h = h;
    }
    function ECPublic(params, buffer) {
        this._params = params, 0 === buffer[0] && (buffer = buffer.slice(1)), this._pub = params.getCurve().decodePointHex(buffer.toString("hex"));
    }
    function ECPrivate(params, buffer) {
        this._params = params, this._priv = new jsbn(utils.mpNormalize(buffer));
    }
    DiffieHellman.prototype.getPublicKey = function() {
        return this._isPriv ? this._key.toPublic() : this._key;
    }, DiffieHellman.prototype.getPrivateKey = function() {
        return this._isPriv ? this._key : void 0;
    }, DiffieHellman.prototype.getKey = DiffieHellman.prototype.getPrivateKey, DiffieHellman.prototype._keyCheck = function(pk, isPub) {
        if (assert.object(pk, "key"), isPub || utils.assertCompatible(pk, PrivateKey, [ 1, 3 ], "key"), 
        utils.assertCompatible(pk, Key, [ 1, 4 ], "key"), pk.type !== this._algo) throw new Error("A " + pk.type + " key cannot be used in " + this._algo + " Diffie-Hellman");
        if (pk.curve !== this._curve) throw new Error("A key from the " + pk.curve + " curve cannot be used with a " + this._curve + " Diffie-Hellman");
        "dsa" === pk.type && (assert.deepEqual(pk.part.p, this._p, "DSA key prime does not match"), 
        assert.deepEqual(pk.part.g, this._g, "DSA key generator does not match"));
    }, DiffieHellman.prototype.setKey = function(pk) {
        if (this._keyCheck(pk), "dsa" === pk.type) this._dh.setPrivateKey(pk.part.x.data), 
        this._dh.setPublicKey(pk.part.y.data); else if ("ecdsa" === pk.type) CRYPTO_HAVE_ECDH ? (this._dh.setPrivateKey(pk.part.d.data), 
        this._dh.setPublicKey(pk.part.Q.data)) : this._priv = new ECPrivate(this._ecParams, pk.part.d.data); else if ("curve25519" === pk.type) {
            var k = pk.part.k;
            pk.part.k || (k = pk.part.r), this._priv = k.data, 0 === this._priv[0] && (this._priv = this._priv.slice(1)), 
            this._priv = this._priv.slice(0, 32);
        }
        this._key = pk, this._isPriv = !0;
    }, DiffieHellman.prototype.setPrivateKey = DiffieHellman.prototype.setKey, DiffieHellman.prototype.computeSecret = function(otherpk) {
        if (this._keyCheck(otherpk, !0), !this._isPriv) throw new Error("DH exchange has not been initialized with a private key yet");
        var pub;
        if ("dsa" === this._algo) return this._dh.computeSecret(otherpk.part.y.data);
        if ("ecdsa" === this._algo) return CRYPTO_HAVE_ECDH ? this._dh.computeSecret(otherpk.part.Q.data) : (pub = new ECPublic(this._ecParams, otherpk.part.Q.data), 
        this._priv.deriveSharedSecret(pub));
        if ("curve25519" === this._algo) {
            for (pub = otherpk.part.A.data; 0 === pub[0] && pub.length > 32; ) pub = pub.slice(1);
            var priv = this._priv;
            assert.strictEqual(pub.length, 32), assert.strictEqual(priv.length, 32);
            var secret = nacl.box.before(new Uint8Array(pub), new Uint8Array(priv));
            return Buffer.from(secret);
        }
        throw new Error("Invalid algorithm: " + this._algo);
    }, DiffieHellman.prototype.generateKey = function() {
        var priv, pub, parts = [];
        if ("dsa" === this._algo) return this._dh.generateKeys(), parts.push({
            name: "p",
            data: this._p.data
        }), parts.push({
            name: "q",
            data: this._key.part.q.data
        }), parts.push({
            name: "g",
            data: this._g.data
        }), parts.push({
            name: "y",
            data: this._dh.getPublicKey()
        }), parts.push({
            name: "x",
            data: this._dh.getPrivateKey()
        }), this._key = new PrivateKey({
            type: "dsa",
            parts: parts
        }), this._isPriv = !0, this._key;
        if ("ecdsa" === this._algo) {
            if (CRYPTO_HAVE_ECDH) return this._dh.generateKeys(), parts.push({
                name: "curve",
                data: Buffer.from(this._curve)
            }), parts.push({
                name: "Q",
                data: this._dh.getPublicKey()
            }), parts.push({
                name: "d",
                data: this._dh.getPrivateKey()
            }), this._key = new PrivateKey({
                type: "ecdsa",
                curve: this._curve,
                parts: parts
            }), this._isPriv = !0, this._key;
            var n = this._ecParams.getN(), r = new jsbn(crypto.randomBytes(n.bitLength())), n1 = n.subtract(jsbn.ONE);
            return priv = r.mod(n1).add(jsbn.ONE), pub = this._ecParams.getG().multiply(priv), 
            priv = Buffer.from(priv.toByteArray()), pub = Buffer.from(this._ecParams.getCurve().encodePointHex(pub), "hex"), 
            this._priv = new ECPrivate(this._ecParams, priv), parts.push({
                name: "curve",
                data: Buffer.from(this._curve)
            }), parts.push({
                name: "Q",
                data: pub
            }), parts.push({
                name: "d",
                data: priv
            }), this._key = new PrivateKey({
                type: "ecdsa",
                curve: this._curve,
                parts: parts
            }), this._isPriv = !0, this._key;
        }
        if ("curve25519" === this._algo) {
            var pair = nacl.box.keyPair();
            return priv = Buffer.from(pair.secretKey), pub = Buffer.from(pair.publicKey), priv = Buffer.concat([ priv, pub ]), 
            assert.strictEqual(priv.length, 64), assert.strictEqual(pub.length, 32), parts.push({
                name: "A",
                data: pub
            }), parts.push({
                name: "k",
                data: priv
            }), this._key = new PrivateKey({
                type: "curve25519",
                parts: parts
            }), this._isPriv = !0, this._key;
        }
        throw new Error("Invalid algorithm: " + this._algo);
    }, DiffieHellman.prototype.generateKeys = DiffieHellman.prototype.generateKey, X9ECParameters.prototype.getCurve = function() {
        return this.curve;
    }, X9ECParameters.prototype.getG = function() {
        return this.g;
    }, X9ECParameters.prototype.getN = function() {
        return this.n;
    }, X9ECParameters.prototype.getH = function() {
        return this.h;
    }, ECPrivate.prototype.deriveSharedSecret = function(pubKey) {
        assert.ok(pubKey instanceof ECPublic);
        var S = pubKey._pub.multiply(this._priv);
        return Buffer.from(S.getX().toBigInteger().toByteArray());
    };
}
