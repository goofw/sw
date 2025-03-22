function(module, exports, __webpack_require__) {
    var Key = __webpack_require__(25), Fingerprint = __webpack_require__(97), Signature = __webpack_require__(48), PrivateKey = __webpack_require__(27), Certificate = __webpack_require__(102), Identity = __webpack_require__(103), errs = __webpack_require__(44);
    module.exports = {
        Key: Key,
        parseKey: Key.parse,
        Fingerprint: Fingerprint,
        parseFingerprint: Fingerprint.parse,
        Signature: Signature,
        parseSignature: Signature.parse,
        PrivateKey: PrivateKey,
        parsePrivateKey: PrivateKey.parse,
        generatePrivateKey: PrivateKey.generate,
        Certificate: Certificate,
        parseCertificate: Certificate.parse,
        createSelfSignedCertificate: Certificate.createSelfSigned,
        createCertificate: Certificate.create,
        Identity: Identity,
        identityFromDN: Identity.parseDN,
        identityForHost: Identity.forHost,
        identityForUser: Identity.forUser,
        identityForEmail: Identity.forEmail,
        identityFromArray: Identity.fromArray,
        FingerprintFormatError: errs.FingerprintFormatError,
        InvalidAlgorithmError: errs.InvalidAlgorithmError,
        KeyParseError: errs.KeyParseError,
        SignatureParseError: errs.SignatureParseError,
        KeyEncryptedError: errs.KeyEncryptedError,
        CertificateParseError: errs.CertificateParseError
    };
}
