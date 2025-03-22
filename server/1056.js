function(module, exports, __webpack_require__) {
    var BigInteger = __webpack_require__(98).BigInteger, ECCurveFp = __webpack_require__(151).ECCurveFp;
    function X9ECParameters(curve, g, n, h) {
        this.curve = curve, this.g = g, this.n = n, this.h = h;
    }
    function fromHex(s) {
        return new BigInteger(s, 16);
    }
    X9ECParameters.prototype.getCurve = function() {
        return this.curve;
    }, X9ECParameters.prototype.getG = function() {
        return this.g;
    }, X9ECParameters.prototype.getN = function() {
        return this.n;
    }, X9ECParameters.prototype.getH = function() {
        return this.h;
    }, module.exports = {
        secp128r1: function() {
            var p = fromHex("FFFFFFFDFFFFFFFFFFFFFFFFFFFFFFFF"), a = fromHex("FFFFFFFDFFFFFFFFFFFFFFFFFFFFFFFC"), b = fromHex("E87579C11079F43DD824993C2CEE5ED3"), n = fromHex("FFFFFFFE0000000075A30D1B9038A115"), h = BigInteger.ONE, curve = new ECCurveFp(p, a, b), G = curve.decodePointHex("04161FF7528B899B2D0C28607CA52C5B86CF5AC8395BAFEB13C02DA292DDED7A83");
            return new X9ECParameters(curve, G, n, h);
        },
        secp160k1: function() {
            var p = fromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFAC73"), a = BigInteger.ZERO, b = fromHex("7"), n = fromHex("0100000000000000000001B8FA16DFAB9ACA16B6B3"), h = BigInteger.ONE, curve = new ECCurveFp(p, a, b), G = curve.decodePointHex("043B4C382CE37AA192A4019E763036F4F5DD4D7EBB938CF935318FDCED6BC28286531733C3F03C4FEE");
            return new X9ECParameters(curve, G, n, h);
        },
        secp160r1: function() {
            var p = fromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFF"), a = fromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFC"), b = fromHex("1C97BEFC54BD7A8B65ACF89F81D4D4ADC565FA45"), n = fromHex("0100000000000000000001F4C8F927AED3CA752257"), h = BigInteger.ONE, curve = new ECCurveFp(p, a, b), G = curve.decodePointHex("044A96B5688EF573284664698968C38BB913CBFC8223A628553168947D59DCC912042351377AC5FB32");
            return new X9ECParameters(curve, G, n, h);
        },
        secp192k1: function() {
            var p = fromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFEE37"), a = BigInteger.ZERO, b = fromHex("3"), n = fromHex("FFFFFFFFFFFFFFFFFFFFFFFE26F2FC170F69466A74DEFD8D"), h = BigInteger.ONE, curve = new ECCurveFp(p, a, b), G = curve.decodePointHex("04DB4FF10EC057E9AE26B07D0280B7F4341DA5D1B1EAE06C7D9B2F2F6D9C5628A7844163D015BE86344082AA88D95E2F9D");
            return new X9ECParameters(curve, G, n, h);
        },
        secp192r1: function() {
            var p = fromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFF"), a = fromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFC"), b = fromHex("64210519E59C80E70FA7E9AB72243049FEB8DEECC146B9B1"), n = fromHex("FFFFFFFFFFFFFFFFFFFFFFFF99DEF836146BC9B1B4D22831"), h = BigInteger.ONE, curve = new ECCurveFp(p, a, b), G = curve.decodePointHex("04188DA80EB03090F67CBF20EB43A18800F4FF0AFD82FF101207192B95FFC8DA78631011ED6B24CDD573F977A11E794811");
            return new X9ECParameters(curve, G, n, h);
        },
        secp224r1: function() {
            var p = fromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000001"), a = fromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFE"), b = fromHex("B4050A850C04B3ABF54132565044B0B7D7BFD8BA270B39432355FFB4"), n = fromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFF16A2E0B8F03E13DD29455C5C2A3D"), h = BigInteger.ONE, curve = new ECCurveFp(p, a, b), G = curve.decodePointHex("04B70E0CBD6BB4BF7F321390B94A03C1D356C21122343280D6115C1D21BD376388B5F723FB4C22DFE6CD4375A05A07476444D5819985007E34");
            return new X9ECParameters(curve, G, n, h);
        },
        secp256r1: function() {
            var p = fromHex("FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF"), a = fromHex("FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC"), b = fromHex("5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B"), n = fromHex("FFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551"), h = BigInteger.ONE, curve = new ECCurveFp(p, a, b), G = curve.decodePointHex("046B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C2964FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5");
            return new X9ECParameters(curve, G, n, h);
        }
    };
}
