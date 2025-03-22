function(module, exports, __webpack_require__) {
    var assert = __webpack_require__(15), crypto = __webpack_require__(9), sshpk = __webpack_require__(230), utils = __webpack_require__(150), validateAlgorithm = (utils.HASH_ALGOS, 
    utils.PK_ALGOS, utils.InvalidAlgorithmError, utils.HttpSignatureError, utils.validateAlgorithm);
    module.exports = {
        verifySignature: function(parsedSignature, pubkey) {
            assert.object(parsedSignature, "parsedSignature"), ("string" == typeof pubkey || Buffer.isBuffer(pubkey)) && (pubkey = sshpk.parseKey(pubkey)), 
            assert.ok(sshpk.Key.isKey(pubkey, [ 1, 1 ]), "pubkey must be a sshpk.Key");
            var alg = validateAlgorithm(parsedSignature.algorithm);
            if ("hmac" === alg[0] || alg[0] !== pubkey.type) return !1;
            var v = pubkey.createVerify(alg[1]);
            return v.update(parsedSignature.signingString), v.verify(parsedSignature.params.signature, "base64");
        },
        verifyHMAC: function(parsedSignature, secret) {
            assert.object(parsedSignature, "parsedHMAC"), assert.string(secret, "secret");
            var alg = validateAlgorithm(parsedSignature.algorithm);
            if ("hmac" !== alg[0]) return !1;
            var hashAlg = alg[1].toUpperCase(), hmac = crypto.createHmac(hashAlg, secret);
            hmac.update(parsedSignature.signingString);
            var h1 = crypto.createHmac(hashAlg, secret);
            h1.update(hmac.digest()), h1 = h1.digest();
            var h2 = crypto.createHmac(hashAlg, secret);
            return h2.update(new Buffer(parsedSignature.params.signature, "base64")), h2 = h2.digest(), 
            "string" == typeof h1 ? h1 === h2 : Buffer.isBuffer(h1) && !h1.equals ? h1.toString("binary") === h2.toString("binary") : h1.equals(h2);
        }
    };
}
