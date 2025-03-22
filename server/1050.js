function(module, exports, __webpack_require__) {
    var parser = __webpack_require__(1051), signer = __webpack_require__(1059), verify = __webpack_require__(1066), utils = __webpack_require__(150);
    module.exports = {
        parse: parser.parseRequest,
        parseRequest: parser.parseRequest,
        sign: signer.signRequest,
        signRequest: signer.signRequest,
        createSigner: signer.createSigner,
        isSigner: signer.isSigner,
        sshKeyToPEM: utils.sshKeyToPEM,
        sshKeyFingerprint: utils.fingerprint,
        pemToRsaSSHKey: utils.pemToRsaSSHKey,
        verify: verify.verifySignature,
        verifySignature: verify.verifySignature,
        verifyHMAC: verify.verifyHMAC
    };
}
