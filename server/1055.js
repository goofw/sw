function(module, exports, __webpack_require__) {
    var crypto = __webpack_require__(9), BigInteger = __webpack_require__(98).BigInteger, Buffer = (__webpack_require__(151).ECPointFp, 
    __webpack_require__(14).Buffer);
    function unstupid(hex, len) {
        return hex.length >= len ? hex : unstupid("0" + hex, len);
    }
    exports.ECCurves = __webpack_require__(1056), exports.ECKey = function(curve, key, isPublic) {
        var priv, c = curve(), n = c.getN(), bytes = Math.floor(n.bitLength() / 8);
        if (key) if (isPublic) curve = c.getCurve(), this.P = curve.decodePointHex(key.toString("hex")); else {
            if (key.length != bytes) return !1;
            priv = new BigInteger(key.toString("hex"), 16);
        } else {
            var n1 = n.subtract(BigInteger.ONE), r = new BigInteger(crypto.randomBytes(n.bitLength()));
            priv = r.mod(n1).add(BigInteger.ONE), this.P = c.getG().multiply(priv);
        }
        this.P && (this.PublicKey = Buffer.from(c.getCurve().encodeCompressedPointHex(this.P), "hex")), 
        priv && (this.PrivateKey = Buffer.from(unstupid(priv.toString(16), 2 * bytes), "hex"), 
        this.deriveSharedSecret = function(key) {
            if (!key || !key.P) return !1;
            var S = key.P.multiply(priv);
            return Buffer.from(unstupid(S.getX().toBigInteger().toString(16), 2 * bytes), "hex");
        });
    };
}
