function(module, exports, __webpack_require__) {
    __webpack_require__(15);
    var util = __webpack_require__(0);
    function FingerprintFormatError(fp, format) {
        Error.captureStackTrace && Error.captureStackTrace(this, FingerprintFormatError), 
        this.name = "FingerprintFormatError", this.fingerprint = fp, this.format = format, 
        this.message = "Fingerprint format is not supported, or is invalid: ", void 0 !== fp && (this.message += " fingerprint = " + fp), 
        void 0 !== format && (this.message += " format = " + format);
    }
    function InvalidAlgorithmError(alg) {
        Error.captureStackTrace && Error.captureStackTrace(this, InvalidAlgorithmError), 
        this.name = "InvalidAlgorithmError", this.algorithm = alg, this.message = 'Algorithm "' + alg + '" is not supported';
    }
    function KeyParseError(name, format, innerErr) {
        Error.captureStackTrace && Error.captureStackTrace(this, KeyParseError), this.name = "KeyParseError", 
        this.format = format, this.keyName = name, this.innerErr = innerErr, this.message = "Failed to parse " + name + " as a valid " + format + " format key: " + innerErr.message;
    }
    function SignatureParseError(type, format, innerErr) {
        Error.captureStackTrace && Error.captureStackTrace(this, SignatureParseError), this.name = "SignatureParseError", 
        this.type = type, this.format = format, this.innerErr = innerErr, this.message = "Failed to parse the given data as a " + type + " signature in " + format + " format: " + innerErr.message;
    }
    function CertificateParseError(name, format, innerErr) {
        Error.captureStackTrace && Error.captureStackTrace(this, CertificateParseError), 
        this.name = "CertificateParseError", this.format = format, this.certName = name, 
        this.innerErr = innerErr, this.message = "Failed to parse " + name + " as a valid " + format + " format certificate: " + innerErr.message;
    }
    function KeyEncryptedError(name, format) {
        Error.captureStackTrace && Error.captureStackTrace(this, KeyEncryptedError), this.name = "KeyEncryptedError", 
        this.format = format, this.keyName = name, this.message = "The " + format + " format key " + name + " is encrypted (password-protected), and no passphrase was provided in `options`";
    }
    util.inherits(FingerprintFormatError, Error), util.inherits(InvalidAlgorithmError, Error), 
    util.inherits(KeyParseError, Error), util.inherits(SignatureParseError, Error), 
    util.inherits(CertificateParseError, Error), util.inherits(KeyEncryptedError, Error), 
    module.exports = {
        FingerprintFormatError: FingerprintFormatError,
        InvalidAlgorithmError: InvalidAlgorithmError,
        KeyParseError: KeyParseError,
        SignatureParseError: SignatureParseError,
        KeyEncryptedError: KeyEncryptedError,
        CertificateParseError: CertificateParseError
    };
}
