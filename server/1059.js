function(module, exports, __webpack_require__) {
    var assert = __webpack_require__(15), crypto = __webpack_require__(9), util = (__webpack_require__(11), 
    __webpack_require__(0)), sshpk = __webpack_require__(230), jsprim = __webpack_require__(1060), utils = __webpack_require__(150), sprintf = __webpack_require__(0).format, HASH_ALGOS = utils.HASH_ALGOS, PK_ALGOS = utils.PK_ALGOS, InvalidAlgorithmError = utils.InvalidAlgorithmError, HttpSignatureError = utils.HttpSignatureError, validateAlgorithm = utils.validateAlgorithm, AUTHZ_FMT = 'Signature keyId="%s",algorithm="%s",headers="%s",signature="%s"';
    function MissingHeaderError(message) {
        HttpSignatureError.call(this, message, MissingHeaderError);
    }
    function StrictParsingError(message) {
        HttpSignatureError.call(this, message, StrictParsingError);
    }
    function RequestSigner(options) {
        assert.object(options, "options");
        var alg = [];
        if (void 0 !== options.algorithm && (assert.string(options.algorithm, "options.algorithm"), 
        alg = validateAlgorithm(options.algorithm)), this.rs_alg = alg, void 0 !== options.sign) assert.func(options.sign, "options.sign"), 
        this.rs_signFunc = options.sign; else if ("hmac" === alg[0] && void 0 !== options.key) {
            if (assert.string(options.keyId, "options.keyId"), this.rs_keyId = options.keyId, 
            "string" != typeof options.key && !Buffer.isBuffer(options.key)) throw new TypeError("options.key for HMAC must be a string or Buffer");
            this.rs_signer = crypto.createHmac(alg[1].toUpperCase(), options.key), this.rs_signer.sign = function() {
                var digest = this.digest("base64");
                return {
                    hashAlgorithm: alg[1],
                    toString: function() {
                        return digest;
                    }
                };
            };
        } else {
            if (void 0 === options.key) throw new TypeError("options.sign (func) or options.key is required");
            var key = options.key;
            if (("string" == typeof key || Buffer.isBuffer(key)) && (key = sshpk.parsePrivateKey(key)), 
            assert.ok(sshpk.PrivateKey.isPrivateKey(key, [ 1, 2 ]), "options.key must be a sshpk.PrivateKey"), 
            this.rs_key = key, assert.string(options.keyId, "options.keyId"), this.rs_keyId = options.keyId, 
            !PK_ALGOS[key.type]) throw new InvalidAlgorithmError(key.type.toUpperCase() + " type keys are not supported");
            if (void 0 !== alg[0] && key.type !== alg[0]) throw new InvalidAlgorithmError("options.key must be a " + alg[0].toUpperCase() + " key, was given a " + key.type.toUpperCase() + " key instead");
            this.rs_signer = key.createSign(alg[1]);
        }
        this.rs_headers = [], this.rs_lines = [];
    }
    util.inherits(MissingHeaderError, HttpSignatureError), util.inherits(StrictParsingError, HttpSignatureError), 
    RequestSigner.prototype.writeHeader = function(header, value) {
        if (assert.string(header, "header"), header = header.toLowerCase(), assert.string(value, "value"), 
        this.rs_headers.push(header), this.rs_signFunc) this.rs_lines.push(header + ": " + value); else {
            var line = header + ": " + value;
            this.rs_headers.length > 0 && (line = "\n" + line), this.rs_signer.update(line);
        }
        return value;
    }, RequestSigner.prototype.writeDateHeader = function() {
        return this.writeHeader("date", jsprim.rfc1123(new Date));
    }, RequestSigner.prototype.writeTarget = function(method, path) {
        assert.string(method, "method"), assert.string(path, "path"), method = method.toLowerCase(), 
        this.writeHeader("(request-target)", method + " " + path);
    }, RequestSigner.prototype.sign = function(cb) {
        if (assert.func(cb, "callback"), this.rs_headers.length < 1) throw new Error("At least one header must be signed");
        var alg, authz;
        if (this.rs_signFunc) {
            var data = this.rs_lines.join("\n"), self = this;
            this.rs_signFunc(data, (function(err, sig) {
                if (err) cb(err); else {
                    try {
                        assert.object(sig, "signature"), assert.string(sig.keyId, "signature.keyId"), assert.string(sig.algorithm, "signature.algorithm"), 
                        assert.string(sig.signature, "signature.signature"), alg = validateAlgorithm(sig.algorithm), 
                        authz = sprintf(AUTHZ_FMT, sig.keyId, sig.algorithm, self.rs_headers.join(" "), sig.signature);
                    } catch (e) {
                        return void cb(e);
                    }
                    cb(null, authz);
                }
            }));
        } else {
            try {
                var sigObj = this.rs_signer.sign();
            } catch (e) {
                return void cb(e);
            }
            alg = (this.rs_alg[0] || this.rs_key.type) + "-" + sigObj.hashAlgorithm;
            var signature = sigObj.toString();
            authz = sprintf(AUTHZ_FMT, this.rs_keyId, alg, this.rs_headers.join(" "), signature), 
            cb(null, authz);
        }
    }, module.exports = {
        isSigner: function(obj) {
            return "object" == typeof obj && obj instanceof RequestSigner;
        },
        createSigner: function(options) {
            return new RequestSigner(options);
        },
        signRequest: function(request, options) {
            assert.object(request, "request"), assert.object(options, "options"), assert.optionalString(options.algorithm, "options.algorithm"), 
            assert.string(options.keyId, "options.keyId"), assert.optionalArrayOfString(options.headers, "options.headers"), 
            assert.optionalString(options.httpVersion, "options.httpVersion"), request.getHeader("Date") || request.setHeader("Date", jsprim.rfc1123(new Date)), 
            options.headers || (options.headers = [ "date" ]), options.httpVersion || (options.httpVersion = "1.1");
            var i, alg = [];
            options.algorithm && (options.algorithm = options.algorithm.toLowerCase(), alg = validateAlgorithm(options.algorithm));
            var signature, stringToSign = "";
            for (i = 0; i < options.headers.length; i++) {
                if ("string" != typeof options.headers[i]) throw new TypeError("options.headers must be an array of Strings");
                var h = options.headers[i].toLowerCase();
                if ("request-line" === h) {
                    if (options.strict) throw new StrictParsingError("request-line is not a valid header with strict parsing enabled.");
                    stringToSign += request.method + " " + request.path + " HTTP/" + options.httpVersion;
                } else if ("(request-target)" === h) stringToSign += "(request-target): " + request.method.toLowerCase() + " " + request.path; else {
                    var value = request.getHeader(h);
                    if (void 0 === value || "" === value) throw new MissingHeaderError(h + " was not in the request");
                    stringToSign += h + ": " + value;
                }
                i + 1 < options.headers.length && (stringToSign += "\n");
            }
            if (request.hasOwnProperty("_stringToSign") && (request._stringToSign = stringToSign), 
            "hmac" === alg[0]) {
                if ("string" != typeof options.key && !Buffer.isBuffer(options.key)) throw new TypeError("options.key must be a string or Buffer");
                var hmac = crypto.createHmac(alg[1].toUpperCase(), options.key);
                hmac.update(stringToSign), signature = hmac.digest("base64");
            } else {
                var key = options.key;
                if (("string" == typeof key || Buffer.isBuffer(key)) && (key = sshpk.parsePrivateKey(options.key)), 
                assert.ok(sshpk.PrivateKey.isPrivateKey(key, [ 1, 2 ]), "options.key must be a sshpk.PrivateKey"), 
                !PK_ALGOS[key.type]) throw new InvalidAlgorithmError(key.type.toUpperCase() + " type keys are not supported");
                if (void 0 !== alg[0] && key.type !== alg[0]) throw new InvalidAlgorithmError("options.key must be a " + alg[0].toUpperCase() + " key, was given a " + key.type.toUpperCase() + " key instead");
                var signer = key.createSign(alg[1]);
                signer.update(stringToSign);
                var sigObj = signer.sign();
                if (!HASH_ALGOS[sigObj.hashAlgorithm]) throw new InvalidAlgorithmError(sigObj.hashAlgorithm.toUpperCase() + " is not a supported hash algorithm");
                options.algorithm = key.type + "-" + sigObj.hashAlgorithm, signature = sigObj.toString(), 
                assert.notStrictEqual(signature, "", "empty signature produced");
            }
            var authzHeaderName = options.authorizationHeaderName || "Authorization";
            return request.setHeader(authzHeaderName, sprintf(AUTHZ_FMT, options.keyId, options.algorithm, options.headers.join(" "), signature)), 
            !0;
        }
    };
}
