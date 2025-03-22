function(module, exports, __webpack_require__) {
    var assert = __webpack_require__(15), sshpk = __webpack_require__(230), util = __webpack_require__(0), HASH_ALGOS = {
        sha1: !0,
        sha256: !0,
        sha512: !0
    }, PK_ALGOS = {
        rsa: !0,
        dsa: !0,
        ecdsa: !0
    };
    function HttpSignatureError(message, caller) {
        Error.captureStackTrace && Error.captureStackTrace(this, caller || HttpSignatureError), 
        this.message = message, this.name = caller.name;
    }
    function InvalidAlgorithmError(message) {
        HttpSignatureError.call(this, message, InvalidAlgorithmError);
    }
    util.inherits(HttpSignatureError, Error), util.inherits(InvalidAlgorithmError, HttpSignatureError), 
    module.exports = {
        HASH_ALGOS: HASH_ALGOS,
        PK_ALGOS: PK_ALGOS,
        HttpSignatureError: HttpSignatureError,
        InvalidAlgorithmError: InvalidAlgorithmError,
        validateAlgorithm: function(algorithm) {
            var alg = algorithm.toLowerCase().split("-");
            if (2 !== alg.length) throw new InvalidAlgorithmError(alg[0].toUpperCase() + " is not a valid algorithm");
            if ("hmac" !== alg[0] && !PK_ALGOS[alg[0]]) throw new InvalidAlgorithmError(alg[0].toUpperCase() + " type keys are not supported");
            if (!HASH_ALGOS[alg[1]]) throw new InvalidAlgorithmError(alg[1].toUpperCase() + " is not a supported hash algorithm");
            return alg;
        },
        sshKeyToPEM: function(key) {
            return assert.string(key, "ssh_key"), sshpk.parseKey(key, "ssh").toString("pem");
        },
        fingerprint: function(key) {
            return assert.string(key, "ssh_key"), sshpk.parseKey(key, "ssh").fingerprint("md5").toString("hex");
        },
        pemToRsaSSHKey: function(pem, comment) {
            assert.equal("string", typeof pem, "typeof pem");
            var k = sshpk.parseKey(pem, "pem");
            return k.comment = comment, k.toString("ssh");
        }
    };
}
