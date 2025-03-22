function(module, exports, __webpack_require__) {
    module.exports = Fingerprint;
    var assert = __webpack_require__(15), Buffer = __webpack_require__(14).Buffer, algs = __webpack_require__(30), crypto = __webpack_require__(9), errs = __webpack_require__(44), Key = __webpack_require__(25), PrivateKey = __webpack_require__(27), Certificate = __webpack_require__(102), utils = __webpack_require__(26), FingerprintFormatError = errs.FingerprintFormatError, InvalidAlgorithmError = errs.InvalidAlgorithmError;
    function Fingerprint(opts) {
        if (assert.object(opts, "options"), assert.string(opts.type, "options.type"), assert.buffer(opts.hash, "options.hash"), 
        assert.string(opts.algorithm, "options.algorithm"), this.algorithm = opts.algorithm.toLowerCase(), 
        !0 !== algs.hashAlgs[this.algorithm]) throw new InvalidAlgorithmError(this.algorithm);
        this.hash = opts.hash, this.type = opts.type, this.hashType = opts.hashType;
    }
    Fingerprint.prototype.toString = function(format) {
        switch (void 0 === format && (format = "md5" === this.algorithm || "spki" === this.hashType ? "hex" : "base64"), 
        assert.string(format), format) {
          case "hex":
            return "spki" === this.hashType ? this.hash.toString("hex") : this.hash.toString("hex").replace(/(.{2})(?=.)/g, "$1:");

          case "base64":
            return "spki" === this.hashType ? this.hash.toString("base64") : (alg = this.algorithm, 
            h = this.hash.toString("base64"), alg.toUpperCase() + ":" + h.replace(/=*$/, ""));

          default:
            throw new FingerprintFormatError(void 0, format);
        }
        var alg, h;
    }, Fingerprint.prototype.matches = function(other) {
        assert.object(other, "key or certificate"), "key" === this.type && "ssh" !== this.hashType ? (utils.assertCompatible(other, Key, [ 1, 7 ], "key with spki"), 
        PrivateKey.isPrivateKey(other) && utils.assertCompatible(other, PrivateKey, [ 1, 6 ], "privatekey with spki support")) : "key" === this.type ? utils.assertCompatible(other, Key, [ 1, 0 ], "key") : utils.assertCompatible(other, Certificate, [ 1, 0 ], "certificate");
        var theirHash = other.hash(this.algorithm, this.hashType), theirHash2 = crypto.createHash(this.algorithm).update(theirHash).digest("base64");
        return void 0 === this.hash2 && (this.hash2 = crypto.createHash(this.algorithm).update(this.hash).digest("base64")), 
        this.hash2 === theirHash2;
    };
    var base64RE = /^[A-Za-z0-9+\/=]+$/, hexRE = /^[a-fA-F0-9]+$/;
    Fingerprint.parse = function(fp, options) {
        var alg, hash, enAlgs;
        assert.string(fp, "fingerprint"), Array.isArray(options) && (enAlgs = options, options = {}), 
        assert.optionalObject(options, "options"), void 0 === options && (options = {}), 
        void 0 !== options.enAlgs && (enAlgs = options.enAlgs), void 0 !== options.algorithms && (enAlgs = options.algorithms), 
        assert.optionalArrayOfString(enAlgs, "algorithms");
        var hashType = "ssh";
        void 0 !== options.hashType && (hashType = options.hashType), assert.string(hashType, "options.hashType");
        var parts = fp.split(":");
        if (2 == parts.length) {
            if (alg = parts[0].toLowerCase(), !base64RE.test(parts[1])) throw new FingerprintFormatError(fp);
            try {
                hash = Buffer.from(parts[1], "base64");
            } catch (e) {
                throw new FingerprintFormatError(fp);
            }
        } else if (parts.length > 2) {
            if (alg = "md5", "md5" === parts[0].toLowerCase() && (parts = parts.slice(1)), parts = (parts = parts.map((function(p) {
                for (;p.length < 2; ) p = "0" + p;
                if (p.length > 2) throw new FingerprintFormatError(fp);
                return p;
            }))).join(""), !hexRE.test(parts) || parts.length % 2 != 0) throw new FingerprintFormatError(fp);
            try {
                hash = Buffer.from(parts, "hex");
            } catch (e) {
                throw new FingerprintFormatError(fp);
            }
        } else {
            if (hexRE.test(fp)) hash = Buffer.from(fp, "hex"); else {
                if (!base64RE.test(fp)) throw new FingerprintFormatError(fp);
                hash = Buffer.from(fp, "base64");
            }
            switch (hash.length) {
              case 32:
                alg = "sha256";
                break;

              case 16:
                alg = "md5";
                break;

              case 20:
                alg = "sha1";
                break;

              case 64:
                alg = "sha512";
                break;

              default:
                throw new FingerprintFormatError(fp);
            }
            void 0 === options.hashType && (hashType = "spki");
        }
        if (void 0 === alg) throw new FingerprintFormatError(fp);
        if (void 0 === algs.hashAlgs[alg]) throw new InvalidAlgorithmError(alg);
        if (void 0 !== enAlgs && -1 === (enAlgs = enAlgs.map((function(a) {
            return a.toLowerCase();
        }))).indexOf(alg)) throw new InvalidAlgorithmError(alg);
        return new Fingerprint({
            algorithm: alg,
            hash: hash,
            type: options.type || "key",
            hashType: hashType
        });
    }, Fingerprint.isFingerprint = function(obj, ver) {
        return utils.isCompatible(obj, Fingerprint, ver);
    }, Fingerprint.prototype._sshpkApiVersion = [ 1, 2 ], Fingerprint._oldVersionDetect = function(obj) {
        return assert.func(obj.toString), assert.func(obj.matches), [ 1, 0 ];
    };
}
