function(module, exports, __webpack_require__) {
    module.exports = Key;
    var edCompat, assert = __webpack_require__(15), algs = __webpack_require__(30), crypto = __webpack_require__(9), Fingerprint = __webpack_require__(97), Signature = __webpack_require__(48), DiffieHellman = __webpack_require__(233).DiffieHellman, errs = __webpack_require__(44), utils = __webpack_require__(26), PrivateKey = __webpack_require__(27);
    try {
        edCompat = __webpack_require__(479);
    } catch (e) {}
    var InvalidAlgorithmError = errs.InvalidAlgorithmError, KeyParseError = errs.KeyParseError, formats = {};
    function Key(opts) {
        assert.object(opts, "options"), assert.arrayOfObject(opts.parts, "options.parts"), 
        assert.string(opts.type, "options.type"), assert.optionalString(opts.comment, "options.comment");
        var algInfo = algs.info[opts.type];
        if ("object" != typeof algInfo) throw new InvalidAlgorithmError(opts.type);
        for (var sz, partLookup = {}, i = 0; i < opts.parts.length; ++i) {
            var part = opts.parts[i];
            partLookup[part.name] = part;
        }
        if (this.type = opts.type, this.parts = opts.parts, this.part = partLookup, this.comment = void 0, 
        this.source = opts.source, this._rfc4253Cache = opts._rfc4253Cache, this._hashCache = {}, 
        this.curve = void 0, "ecdsa" === this.type) {
            var curve = this.part.curve.data.toString();
            this.curve = curve, sz = algs.curves[curve].size;
        } else if ("ed25519" === this.type || "curve25519" === this.type) sz = 256, this.curve = "curve25519"; else {
            var szPart = this.part[algInfo.sizePart];
            sz = 8 * (sz = szPart.data.length) - utils.countZeros(szPart.data);
        }
        this.size = sz;
    }
    formats.auto = __webpack_require__(480), formats.pem = __webpack_require__(56), 
    formats.pkcs1 = __webpack_require__(234), formats.pkcs8 = __webpack_require__(101), 
    formats.rfc4253 = __webpack_require__(57), formats.ssh = __webpack_require__(482), 
    formats["ssh-private"] = __webpack_require__(152), formats.openssh = formats["ssh-private"], 
    formats.dnssec = __webpack_require__(235), formats.putty = __webpack_require__(483), 
    formats.ppk = formats.putty, Key.formats = formats, Key.prototype.toBuffer = function(format, options) {
        return void 0 === format && (format = "ssh"), assert.string(format, "format"), assert.object(formats[format], "formats[format]"), 
        assert.optionalObject(options, "options"), "rfc4253" === format ? (void 0 === this._rfc4253Cache && (this._rfc4253Cache = formats.rfc4253.write(this)), 
        this._rfc4253Cache) : formats[format].write(this, options);
    }, Key.prototype.toString = function(format, options) {
        return this.toBuffer(format, options).toString();
    }, Key.prototype.hash = function(algo, type) {
        if (assert.string(algo, "algorithm"), assert.optionalString(type, "type"), void 0 === type && (type = "ssh"), 
        algo = algo.toLowerCase(), void 0 === algs.hashAlgs[algo]) throw new InvalidAlgorithmError(algo);
        var buf, cacheKey = algo + "||" + type;
        if (this._hashCache[cacheKey]) return this._hashCache[cacheKey];
        if ("ssh" === type) buf = this.toBuffer("rfc4253"); else {
            if ("spki" !== type) throw new Error("Hash type " + type + " not supported");
            buf = formats.pkcs8.pkcs8ToBuffer(this);
        }
        var hash = crypto.createHash(algo).update(buf).digest();
        return this._hashCache[cacheKey] = hash, hash;
    }, Key.prototype.fingerprint = function(algo, type) {
        void 0 === algo && (algo = "sha256"), void 0 === type && (type = "ssh"), assert.string(algo, "algorithm"), 
        assert.string(type, "type");
        var opts = {
            type: "key",
            hash: this.hash(algo, type),
            algorithm: algo,
            hashType: type
        };
        return new Fingerprint(opts);
    }, Key.prototype.defaultHashAlgorithm = function() {
        var hashAlgo = "sha1";
        return "rsa" === this.type && (hashAlgo = "sha256"), "dsa" === this.type && this.size > 1024 && (hashAlgo = "sha256"), 
        "ed25519" === this.type && (hashAlgo = "sha512"), "ecdsa" === this.type && (hashAlgo = this.size <= 256 ? "sha256" : this.size <= 384 ? "sha384" : "sha512"), 
        hashAlgo;
    }, Key.prototype.createVerify = function(hashAlgo) {
        if (void 0 === hashAlgo && (hashAlgo = this.defaultHashAlgorithm()), assert.string(hashAlgo, "hash algorithm"), 
        "ed25519" === this.type && void 0 !== edCompat) return new edCompat.Verifier(this, hashAlgo);
        if ("curve25519" === this.type) throw new Error("Curve25519 keys are not suitable for signing or verification");
        var v, nm, err;
        try {
            nm = hashAlgo.toUpperCase(), v = crypto.createVerify(nm);
        } catch (e) {
            err = e;
        }
        (void 0 === v || err instanceof Error && err.message.match(/Unknown message digest/)) && (nm = "RSA-", 
        nm += hashAlgo.toUpperCase(), v = crypto.createVerify(nm)), assert.ok(v, "failed to create verifier");
        var oldVerify = v.verify.bind(v), key = this.toBuffer("pkcs8"), curve = this.curve, self = this;
        return v.verify = function(signature, fmt) {
            if (Signature.isSignature(signature, [ 2, 0 ])) return signature.type === self.type && (!signature.hashAlgorithm || signature.hashAlgorithm === hashAlgo) && (!signature.curve || "ecdsa" !== self.type || signature.curve === curve) && oldVerify(key, signature.toBuffer("asn1"));
            if ("string" == typeof signature || Buffer.isBuffer(signature)) return oldVerify(key, signature, fmt);
            throw Signature.isSignature(signature, [ 1, 0 ]) ? new Error("signature was created by too old a version of sshpk and cannot be verified") : new TypeError("signature must be a string, Buffer, or Signature object");
        }, v;
    }, Key.prototype.createDiffieHellman = function() {
        if ("rsa" === this.type) throw new Error("RSA keys do not support Diffie-Hellman");
        return new DiffieHellman(this);
    }, Key.prototype.createDH = Key.prototype.createDiffieHellman, Key.parse = function(data, format, options) {
        "string" != typeof data && assert.buffer(data, "data"), void 0 === format && (format = "auto"), 
        assert.string(format, "format"), "string" == typeof options && (options = {
            filename: options
        }), assert.optionalObject(options, "options"), void 0 === options && (options = {}), 
        assert.optionalString(options.filename, "options.filename"), void 0 === options.filename && (options.filename = "(unnamed)"), 
        assert.object(formats[format], "formats[format]");
        try {
            var k = formats[format].read(data, options);
            return k instanceof PrivateKey && (k = k.toPublic()), k.comment || (k.comment = options.filename), 
            k;
        } catch (e) {
            if ("KeyEncryptedError" === e.name) throw e;
            throw new KeyParseError(options.filename, format, e);
        }
    }, Key.isKey = function(obj, ver) {
        return utils.isCompatible(obj, Key, ver);
    }, Key.prototype._sshpkApiVersion = [ 1, 7 ], Key._oldVersionDetect = function(obj) {
        return assert.func(obj.toBuffer), assert.func(obj.fingerprint), obj.createDH ? [ 1, 4 ] : obj.defaultHashAlgorithm ? [ 1, 3 ] : obj.formats.auto ? [ 1, 2 ] : obj.formats.pkcs1 ? [ 1, 1 ] : [ 1, 0 ];
    };
}
