function(module, exports, __webpack_require__) {
    module.exports = {
        Verifier: Verifier,
        Signer: Signer
    };
    var nacl = __webpack_require__(99), stream = __webpack_require__(3), util = __webpack_require__(0), assert = __webpack_require__(15), Buffer = __webpack_require__(14).Buffer, Signature = __webpack_require__(48);
    function Verifier(key, hashAlgo) {
        if ("sha512" !== hashAlgo.toLowerCase()) throw new Error("ED25519 only supports the use of SHA-512 hashes");
        this.key = key, this.chunks = [], stream.Writable.call(this, {});
    }
    function Signer(key, hashAlgo) {
        if ("sha512" !== hashAlgo.toLowerCase()) throw new Error("ED25519 only supports the use of SHA-512 hashes");
        this.key = key, this.chunks = [], stream.Writable.call(this, {});
    }
    util.inherits(Verifier, stream.Writable), Verifier.prototype._write = function(chunk, enc, cb) {
        this.chunks.push(chunk), cb();
    }, Verifier.prototype.update = function(chunk) {
        "string" == typeof chunk && (chunk = Buffer.from(chunk, "binary")), this.chunks.push(chunk);
    }, Verifier.prototype.verify = function(signature, fmt) {
        var sig;
        if (Signature.isSignature(signature, [ 2, 0 ])) {
            if ("ed25519" !== signature.type) return !1;
            sig = signature.toBuffer("raw");
        } else if ("string" == typeof signature) sig = Buffer.from(signature, "base64"); else if (Signature.isSignature(signature, [ 1, 0 ])) throw new Error("signature was created by too old a version of sshpk and cannot be verified");
        return assert.buffer(sig), nacl.sign.detached.verify(new Uint8Array(Buffer.concat(this.chunks)), new Uint8Array(sig), new Uint8Array(this.key.part.A.data));
    }, util.inherits(Signer, stream.Writable), Signer.prototype._write = function(chunk, enc, cb) {
        this.chunks.push(chunk), cb();
    }, Signer.prototype.update = function(chunk) {
        "string" == typeof chunk && (chunk = Buffer.from(chunk, "binary")), this.chunks.push(chunk);
    }, Signer.prototype.sign = function() {
        var sig = nacl.sign.detached(new Uint8Array(Buffer.concat(this.chunks)), new Uint8Array(Buffer.concat([ this.key.part.k.data, this.key.part.A.data ]))), sigBuf = Buffer.from(sig), sigObj = Signature.parse(sigBuf, "ed25519", "raw");
        return sigObj.hashAlgorithm = "sha512", sigObj;
    };
}
