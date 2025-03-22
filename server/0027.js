function(module, exports, __webpack_require__) {
    module.exports = PrivateKey;
    var assert = __webpack_require__(15), Buffer = __webpack_require__(14).Buffer, algs = __webpack_require__(30), crypto = __webpack_require__(9), Signature = (__webpack_require__(97), 
    __webpack_require__(48)), errs = __webpack_require__(44), util = __webpack_require__(0), utils = __webpack_require__(26), dhe = __webpack_require__(233), generateECDSA = dhe.generateECDSA, generateED25519 = dhe.generateED25519, edCompat = __webpack_require__(479), nacl = __webpack_require__(99), Key = __webpack_require__(25), KeyParseError = (errs.InvalidAlgorithmError, 
    errs.KeyParseError), formats = (errs.KeyEncryptedError, {});
    function PrivateKey(opts) {
        assert.object(opts, "options"), Key.call(this, opts), this._pubCache = void 0;
    }
    formats.auto = __webpack_require__(480), formats.pem = __webpack_require__(56), 
    formats.pkcs1 = __webpack_require__(234), formats.pkcs8 = __webpack_require__(101), 
    formats.rfc4253 = __webpack_require__(57), formats["ssh-private"] = __webpack_require__(152), 
    formats.openssh = formats["ssh-private"], formats.ssh = formats["ssh-private"], 
    formats.dnssec = __webpack_require__(235), util.inherits(PrivateKey, Key), PrivateKey.formats = formats, 
    PrivateKey.prototype.toBuffer = function(format, options) {
        return void 0 === format && (format = "pkcs1"), assert.string(format, "format"), 
        assert.object(formats[format], "formats[format]"), assert.optionalObject(options, "options"), 
        formats[format].write(this, options);
    }, PrivateKey.prototype.hash = function(algo, type) {
        return this.toPublic().hash(algo, type);
    }, PrivateKey.prototype.fingerprint = function(algo, type) {
        return this.toPublic().fingerprint(algo, type);
    }, PrivateKey.prototype.toPublic = function() {
        if (this._pubCache) return this._pubCache;
        for (var algInfo = algs.info[this.type], pubParts = [], i = 0; i < algInfo.parts.length; ++i) {
            var p = algInfo.parts[i];
            pubParts.push(this.part[p]);
        }
        return this._pubCache = new Key({
            type: this.type,
            source: this,
            parts: pubParts
        }), this.comment && (this._pubCache.comment = this.comment), this._pubCache;
    }, PrivateKey.prototype.derive = function(newType) {
        var priv, pub, pair;
        if (assert.string(newType, "type"), "ed25519" === this.type && "curve25519" === newType) return 0 === (priv = this.part.k.data)[0] && (priv = priv.slice(1)), 
        pair = nacl.box.keyPair.fromSecretKey(new Uint8Array(priv)), pub = Buffer.from(pair.publicKey), 
        new PrivateKey({
            type: "curve25519",
            parts: [ {
                name: "A",
                data: utils.mpNormalize(pub)
            }, {
                name: "k",
                data: utils.mpNormalize(priv)
            } ]
        });
        if ("curve25519" === this.type && "ed25519" === newType) return 0 === (priv = this.part.k.data)[0] && (priv = priv.slice(1)), 
        pair = nacl.sign.keyPair.fromSeed(new Uint8Array(priv)), pub = Buffer.from(pair.publicKey), 
        new PrivateKey({
            type: "ed25519",
            parts: [ {
                name: "A",
                data: utils.mpNormalize(pub)
            }, {
                name: "k",
                data: utils.mpNormalize(priv)
            } ]
        });
        throw new Error("Key derivation not supported from " + this.type + " to " + newType);
    }, PrivateKey.prototype.createVerify = function(hashAlgo) {
        return this.toPublic().createVerify(hashAlgo);
    }, PrivateKey.prototype.createSign = function(hashAlgo) {
        if (void 0 === hashAlgo && (hashAlgo = this.defaultHashAlgorithm()), assert.string(hashAlgo, "hash algorithm"), 
        "ed25519" === this.type && void 0 !== edCompat) return new edCompat.Signer(this, hashAlgo);
        if ("curve25519" === this.type) throw new Error("Curve25519 keys are not suitable for signing or verification");
        var v, nm, err;
        try {
            nm = hashAlgo.toUpperCase(), v = crypto.createSign(nm);
        } catch (e) {
            err = e;
        }
        (void 0 === v || err instanceof Error && err.message.match(/Unknown message digest/)) && (nm = "RSA-", 
        nm += hashAlgo.toUpperCase(), v = crypto.createSign(nm)), assert.ok(v, "failed to create verifier");
        var oldSign = v.sign.bind(v), key = this.toBuffer("pkcs1"), type = this.type, curve = this.curve;
        return v.sign = function() {
            var sig = oldSign(key);
            return "string" == typeof sig && (sig = Buffer.from(sig, "binary")), (sig = Signature.parse(sig, type, "asn1")).hashAlgorithm = hashAlgo, 
            sig.curve = curve, sig;
        }, v;
    }, PrivateKey.parse = function(data, format, options) {
        "string" != typeof data && assert.buffer(data, "data"), void 0 === format && (format = "auto"), 
        assert.string(format, "format"), "string" == typeof options && (options = {
            filename: options
        }), assert.optionalObject(options, "options"), void 0 === options && (options = {}), 
        assert.optionalString(options.filename, "options.filename"), void 0 === options.filename && (options.filename = "(unnamed)"), 
        assert.object(formats[format], "formats[format]");
        try {
            var k = formats[format].read(data, options);
            return assert.ok(k instanceof PrivateKey, "key is not a private key"), k.comment || (k.comment = options.filename), 
            k;
        } catch (e) {
            if ("KeyEncryptedError" === e.name) throw e;
            throw new KeyParseError(options.filename, format, e);
        }
    }, PrivateKey.isPrivateKey = function(obj, ver) {
        return utils.isCompatible(obj, PrivateKey, ver);
    }, PrivateKey.generate = function(type, options) {
        switch (void 0 === options && (options = {}), assert.object(options, "options"), 
        type) {
          case "ecdsa":
            return void 0 === options.curve && (options.curve = "nistp256"), assert.string(options.curve, "options.curve"), 
            generateECDSA(options.curve);

          case "ed25519":
            return generateED25519();

          default:
            throw new Error('Key generation not supported with key type "' + type + '"');
        }
    }, PrivateKey.prototype._sshpkApiVersion = [ 1, 6 ], PrivateKey._oldVersionDetect = function(obj) {
        return assert.func(obj.toPublic), assert.func(obj.createSign), obj.derive ? [ 1, 3 ] : obj.defaultHashAlgorithm ? [ 1, 2 ] : obj.formats.auto ? [ 1, 1 ] : [ 1, 0 ];
    };
}
