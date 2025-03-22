function(module, exports, __webpack_require__) {
    module.exports = Certificate;
    var assert = __webpack_require__(15), Buffer = __webpack_require__(14).Buffer, algs = __webpack_require__(30), crypto = __webpack_require__(9), Fingerprint = __webpack_require__(97), errs = (__webpack_require__(48), 
    __webpack_require__(44)), utils = (__webpack_require__(0), __webpack_require__(26)), Key = __webpack_require__(25), PrivateKey = __webpack_require__(27), Identity = __webpack_require__(103), formats = {};
    formats.openssh = __webpack_require__(1057), formats.x509 = __webpack_require__(484), 
    formats.pem = __webpack_require__(1058);
    var CertificateParseError = errs.CertificateParseError, InvalidAlgorithmError = errs.InvalidAlgorithmError;
    function Certificate(opts) {
        assert.object(opts, "options"), assert.arrayOfObject(opts.subjects, "options.subjects"), 
        utils.assertCompatible(opts.subjects[0], Identity, [ 1, 0 ], "options.subjects"), 
        utils.assertCompatible(opts.subjectKey, Key, [ 1, 0 ], "options.subjectKey"), utils.assertCompatible(opts.issuer, Identity, [ 1, 0 ], "options.issuer"), 
        void 0 !== opts.issuerKey && utils.assertCompatible(opts.issuerKey, Key, [ 1, 0 ], "options.issuerKey"), 
        assert.object(opts.signatures, "options.signatures"), assert.buffer(opts.serial, "options.serial"), 
        assert.date(opts.validFrom, "options.validFrom"), assert.date(opts.validUntil, "optons.validUntil"), 
        assert.optionalArrayOfString(opts.purposes, "options.purposes"), this._hashCache = {}, 
        this.subjects = opts.subjects, this.issuer = opts.issuer, this.subjectKey = opts.subjectKey, 
        this.issuerKey = opts.issuerKey, this.signatures = opts.signatures, this.serial = opts.serial, 
        this.validFrom = opts.validFrom, this.validUntil = opts.validUntil, this.purposes = opts.purposes;
    }
    Certificate.formats = formats, Certificate.prototype.toBuffer = function(format, options) {
        return void 0 === format && (format = "x509"), assert.string(format, "format"), 
        assert.object(formats[format], "formats[format]"), assert.optionalObject(options, "options"), 
        formats[format].write(this, options);
    }, Certificate.prototype.toString = function(format, options) {
        return void 0 === format && (format = "pem"), this.toBuffer(format, options).toString();
    }, Certificate.prototype.fingerprint = function(algo) {
        void 0 === algo && (algo = "sha256"), assert.string(algo, "algorithm");
        var opts = {
            type: "certificate",
            hash: this.hash(algo),
            algorithm: algo
        };
        return new Fingerprint(opts);
    }, Certificate.prototype.hash = function(algo) {
        if (assert.string(algo, "algorithm"), algo = algo.toLowerCase(), void 0 === algs.hashAlgs[algo]) throw new InvalidAlgorithmError(algo);
        if (this._hashCache[algo]) return this._hashCache[algo];
        var hash = crypto.createHash(algo).update(this.toBuffer("x509")).digest();
        return this._hashCache[algo] = hash, hash;
    }, Certificate.prototype.isExpired = function(when) {
        return void 0 === when && (when = new Date), !(when.getTime() >= this.validFrom.getTime() && when.getTime() < this.validUntil.getTime());
    }, Certificate.prototype.isSignedBy = function(issuerCert) {
        return utils.assertCompatible(issuerCert, Certificate, [ 1, 0 ], "issuer"), !!this.issuer.equals(issuerCert.subjects[0]) && !(this.issuer.purposes && this.issuer.purposes.length > 0 && -1 === this.issuer.purposes.indexOf("ca")) && this.isSignedByKey(issuerCert.subjectKey);
    }, Certificate.prototype.getExtension = function(keyOrOid) {
        return assert.string(keyOrOid, "keyOrOid"), this.getExtensions().filter((function(maybeExt) {
            return "x509" === maybeExt.format ? maybeExt.oid === keyOrOid : "openssh" === maybeExt.format && maybeExt.name === keyOrOid;
        }))[0];
    }, Certificate.prototype.getExtensions = function() {
        var exts = [], x509 = this.signatures.x509;
        x509 && x509.extras && x509.extras.exts && x509.extras.exts.forEach((function(ext) {
            ext.format = "x509", exts.push(ext);
        }));
        var openssh = this.signatures.openssh;
        return openssh && openssh.exts && openssh.exts.forEach((function(ext) {
            ext.format = "openssh", exts.push(ext);
        })), exts;
    }, Certificate.prototype.isSignedByKey = function(issuerKey) {
        if (utils.assertCompatible(issuerKey, Key, [ 1, 2 ], "issuerKey"), void 0 !== this.issuerKey) return this.issuerKey.fingerprint("sha512").matches(issuerKey);
        var fmt = Object.keys(this.signatures)[0], valid = formats[fmt].verify(this, issuerKey);
        return valid && (this.issuerKey = issuerKey), valid;
    }, Certificate.prototype.signWith = function(key) {
        utils.assertCompatible(key, PrivateKey, [ 1, 2 ], "key");
        for (var fmts = Object.keys(formats), didOne = !1, i = 0; i < fmts.length; ++i) "pem" !== fmts[i] && !0 === formats[fmts[i]].sign(this, key) && (didOne = !0);
        if (!didOne) throw new Error("Failed to sign the certificate for any available certificate formats");
    }, Certificate.createSelfSigned = function(subjectOrSubjects, key, options) {
        var subjects;
        subjects = Array.isArray(subjectOrSubjects) ? subjectOrSubjects : [ subjectOrSubjects ], 
        assert.arrayOfObject(subjects), subjects.forEach((function(subject) {
            utils.assertCompatible(subject, Identity, [ 1, 0 ], "subject");
        })), utils.assertCompatible(key, PrivateKey, [ 1, 2 ], "private key"), assert.optionalObject(options, "options"), 
        void 0 === options && (options = {}), assert.optionalObject(options.validFrom, "options.validFrom"), 
        assert.optionalObject(options.validUntil, "options.validUntil");
        var validFrom = options.validFrom, validUntil = options.validUntil;
        if (void 0 === validFrom && (validFrom = new Date), void 0 === validUntil) {
            assert.optionalNumber(options.lifetime, "options.lifetime");
            var lifetime = options.lifetime;
            void 0 === lifetime && (lifetime = 31536e4), (validUntil = new Date).setTime(validUntil.getTime() + 1e3 * lifetime);
        }
        assert.optionalBuffer(options.serial, "options.serial");
        var serial = options.serial;
        void 0 === serial && (serial = Buffer.from("0000000000000001", "hex"));
        var purposes = options.purposes;
        if (void 0 === purposes && (purposes = []), -1 === purposes.indexOf("signature") && purposes.push("signature"), 
        -1 === purposes.indexOf("ca") && purposes.push("ca"), -1 === purposes.indexOf("crl") && purposes.push("crl"), 
        purposes.length <= 3) {
            var hostSubjects = subjects.filter((function(subject) {
                return "host" === subject.type;
            })), userSubjects = subjects.filter((function(subject) {
                return "user" === subject.type;
            }));
            hostSubjects.length > 0 && -1 === purposes.indexOf("serverAuth") && purposes.push("serverAuth"), 
            userSubjects.length > 0 && -1 === purposes.indexOf("clientAuth") && purposes.push("clientAuth"), 
            (userSubjects.length > 0 || hostSubjects.length > 0) && (-1 === purposes.indexOf("keyAgreement") && purposes.push("keyAgreement"), 
            "rsa" === key.type && -1 === purposes.indexOf("encryption") && purposes.push("encryption"));
        }
        var cert = new Certificate({
            subjects: subjects,
            issuer: subjects[0],
            subjectKey: key.toPublic(),
            issuerKey: key.toPublic(),
            signatures: {},
            serial: serial,
            validFrom: validFrom,
            validUntil: validUntil,
            purposes: purposes
        });
        return cert.signWith(key), cert;
    }, Certificate.create = function(subjectOrSubjects, key, issuer, issuerKey, options) {
        var subjects;
        subjects = Array.isArray(subjectOrSubjects) ? subjectOrSubjects : [ subjectOrSubjects ], 
        assert.arrayOfObject(subjects), subjects.forEach((function(subject) {
            utils.assertCompatible(subject, Identity, [ 1, 0 ], "subject");
        })), utils.assertCompatible(key, Key, [ 1, 0 ], "key"), PrivateKey.isPrivateKey(key) && (key = key.toPublic()), 
        utils.assertCompatible(issuer, Identity, [ 1, 0 ], "issuer"), utils.assertCompatible(issuerKey, PrivateKey, [ 1, 2 ], "issuer key"), 
        assert.optionalObject(options, "options"), void 0 === options && (options = {}), 
        assert.optionalObject(options.validFrom, "options.validFrom"), assert.optionalObject(options.validUntil, "options.validUntil");
        var validFrom = options.validFrom, validUntil = options.validUntil;
        if (void 0 === validFrom && (validFrom = new Date), void 0 === validUntil) {
            assert.optionalNumber(options.lifetime, "options.lifetime");
            var lifetime = options.lifetime;
            void 0 === lifetime && (lifetime = 31536e4), (validUntil = new Date).setTime(validUntil.getTime() + 1e3 * lifetime);
        }
        assert.optionalBuffer(options.serial, "options.serial");
        var serial = options.serial;
        void 0 === serial && (serial = Buffer.from("0000000000000001", "hex"));
        var purposes = options.purposes;
        void 0 === purposes && (purposes = []), -1 === purposes.indexOf("signature") && purposes.push("signature"), 
        !0 === options.ca && (-1 === purposes.indexOf("ca") && purposes.push("ca"), -1 === purposes.indexOf("crl") && purposes.push("crl"));
        var hostSubjects = subjects.filter((function(subject) {
            return "host" === subject.type;
        })), userSubjects = subjects.filter((function(subject) {
            return "user" === subject.type;
        }));
        hostSubjects.length > 0 && -1 === purposes.indexOf("serverAuth") && purposes.push("serverAuth"), 
        userSubjects.length > 0 && -1 === purposes.indexOf("clientAuth") && purposes.push("clientAuth"), 
        (userSubjects.length > 0 || hostSubjects.length > 0) && (-1 === purposes.indexOf("keyAgreement") && purposes.push("keyAgreement"), 
        "rsa" === key.type && -1 === purposes.indexOf("encryption") && purposes.push("encryption"));
        var cert = new Certificate({
            subjects: subjects,
            issuer: issuer,
            subjectKey: key,
            issuerKey: issuerKey.toPublic(),
            signatures: {},
            serial: serial,
            validFrom: validFrom,
            validUntil: validUntil,
            purposes: purposes
        });
        return cert.signWith(issuerKey), cert;
    }, Certificate.parse = function(data, format, options) {
        "string" != typeof data && assert.buffer(data, "data"), void 0 === format && (format = "auto"), 
        assert.string(format, "format"), "string" == typeof options && (options = {
            filename: options
        }), assert.optionalObject(options, "options"), void 0 === options && (options = {}), 
        assert.optionalString(options.filename, "options.filename"), void 0 === options.filename && (options.filename = "(unnamed)"), 
        assert.object(formats[format], "formats[format]");
        try {
            return formats[format].read(data, options);
        } catch (e) {
            throw new CertificateParseError(options.filename, format, e);
        }
    }, Certificate.isCertificate = function(obj, ver) {
        return utils.isCompatible(obj, Certificate, ver);
    }, Certificate.prototype._sshpkApiVersion = [ 1, 1 ], Certificate._oldVersionDetect = function(obj) {
        return [ 1, 0 ];
    };
}
