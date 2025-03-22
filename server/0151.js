function(module, exports, __webpack_require__) {
    var BigInteger = __webpack_require__(98).BigInteger, Barrett = BigInteger.prototype.Barrett;
    function ECFieldElementFp(q, x) {
        this.x = x, this.q = q;
    }
    function ECPointFp(curve, x, y, z) {
        this.curve = curve, this.x = x, this.y = y, this.z = null == z ? BigInteger.ONE : z, 
        this.zinv = null;
    }
    function ECCurveFp(q, a, b) {
        this.q = q, this.a = this.fromBigInteger(a), this.b = this.fromBigInteger(b), this.infinity = new ECPointFp(this, null, null), 
        this.reducer = new Barrett(this.q);
    }
    ECFieldElementFp.prototype.equals = function(other) {
        return other == this || this.q.equals(other.q) && this.x.equals(other.x);
    }, ECFieldElementFp.prototype.toBigInteger = function() {
        return this.x;
    }, ECFieldElementFp.prototype.negate = function() {
        return new ECFieldElementFp(this.q, this.x.negate().mod(this.q));
    }, ECFieldElementFp.prototype.add = function(b) {
        return new ECFieldElementFp(this.q, this.x.add(b.toBigInteger()).mod(this.q));
    }, ECFieldElementFp.prototype.subtract = function(b) {
        return new ECFieldElementFp(this.q, this.x.subtract(b.toBigInteger()).mod(this.q));
    }, ECFieldElementFp.prototype.multiply = function(b) {
        return new ECFieldElementFp(this.q, this.x.multiply(b.toBigInteger()).mod(this.q));
    }, ECFieldElementFp.prototype.square = function() {
        return new ECFieldElementFp(this.q, this.x.square().mod(this.q));
    }, ECFieldElementFp.prototype.divide = function(b) {
        return new ECFieldElementFp(this.q, this.x.multiply(b.toBigInteger().modInverse(this.q)).mod(this.q));
    }, ECPointFp.prototype.getX = function() {
        null == this.zinv && (this.zinv = this.z.modInverse(this.curve.q));
        var r = this.x.toBigInteger().multiply(this.zinv);
        return this.curve.reduce(r), this.curve.fromBigInteger(r);
    }, ECPointFp.prototype.getY = function() {
        null == this.zinv && (this.zinv = this.z.modInverse(this.curve.q));
        var r = this.y.toBigInteger().multiply(this.zinv);
        return this.curve.reduce(r), this.curve.fromBigInteger(r);
    }, ECPointFp.prototype.equals = function(other) {
        return other == this || (this.isInfinity() ? other.isInfinity() : other.isInfinity() ? this.isInfinity() : !!other.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(other.z)).mod(this.curve.q).equals(BigInteger.ZERO) && other.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(other.z)).mod(this.curve.q).equals(BigInteger.ZERO));
    }, ECPointFp.prototype.isInfinity = function() {
        return null == this.x && null == this.y || this.z.equals(BigInteger.ZERO) && !this.y.toBigInteger().equals(BigInteger.ZERO);
    }, ECPointFp.prototype.negate = function() {
        return new ECPointFp(this.curve, this.x, this.y.negate(), this.z);
    }, ECPointFp.prototype.add = function(b) {
        if (this.isInfinity()) return b;
        if (b.isInfinity()) return this;
        var u = b.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(b.z)).mod(this.curve.q), v = b.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(b.z)).mod(this.curve.q);
        if (BigInteger.ZERO.equals(v)) return BigInteger.ZERO.equals(u) ? this.twice() : this.curve.getInfinity();
        var THREE = new BigInteger("3"), x1 = this.x.toBigInteger(), y1 = this.y.toBigInteger(), v2 = (b.x.toBigInteger(), 
        b.y.toBigInteger(), v.square()), v3 = v2.multiply(v), x1v2 = x1.multiply(v2), zu2 = u.square().multiply(this.z), x3 = zu2.subtract(x1v2.shiftLeft(1)).multiply(b.z).subtract(v3).multiply(v).mod(this.curve.q), y3 = x1v2.multiply(THREE).multiply(u).subtract(y1.multiply(v3)).subtract(zu2.multiply(u)).multiply(b.z).add(u.multiply(v3)).mod(this.curve.q), z3 = v3.multiply(this.z).multiply(b.z).mod(this.curve.q);
        return new ECPointFp(this.curve, this.curve.fromBigInteger(x3), this.curve.fromBigInteger(y3), z3);
    }, ECPointFp.prototype.twice = function() {
        if (this.isInfinity()) return this;
        if (0 == this.y.toBigInteger().signum()) return this.curve.getInfinity();
        var THREE = new BigInteger("3"), x1 = this.x.toBigInteger(), y1 = this.y.toBigInteger(), y1z1 = y1.multiply(this.z), y1sqz1 = y1z1.multiply(y1).mod(this.curve.q), a = this.curve.a.toBigInteger(), w = x1.square().multiply(THREE);
        BigInteger.ZERO.equals(a) || (w = w.add(this.z.square().multiply(a)));
        var x3 = (w = w.mod(this.curve.q)).square().subtract(x1.shiftLeft(3).multiply(y1sqz1)).shiftLeft(1).multiply(y1z1).mod(this.curve.q), y3 = w.multiply(THREE).multiply(x1).subtract(y1sqz1.shiftLeft(1)).shiftLeft(2).multiply(y1sqz1).subtract(w.square().multiply(w)).mod(this.curve.q), z3 = y1z1.square().multiply(y1z1).shiftLeft(3).mod(this.curve.q);
        return new ECPointFp(this.curve, this.curve.fromBigInteger(x3), this.curve.fromBigInteger(y3), z3);
    }, ECPointFp.prototype.multiply = function(k) {
        if (this.isInfinity()) return this;
        if (0 == k.signum()) return this.curve.getInfinity();
        var i, e = k, h = e.multiply(new BigInteger("3")), neg = this.negate(), R = this;
        for (i = h.bitLength() - 2; i > 0; --i) {
            R = R.twice();
            var hBit = h.testBit(i);
            hBit != e.testBit(i) && (R = R.add(hBit ? this : neg));
        }
        return R;
    }, ECPointFp.prototype.multiplyTwo = function(j, x, k) {
        var i;
        i = j.bitLength() > k.bitLength() ? j.bitLength() - 1 : k.bitLength() - 1;
        for (var R = this.curve.getInfinity(), both = this.add(x); i >= 0; ) R = R.twice(), 
        j.testBit(i) ? R = k.testBit(i) ? R.add(both) : R.add(this) : k.testBit(i) && (R = R.add(x)), 
        --i;
        return R;
    }, ECCurveFp.prototype.getQ = function() {
        return this.q;
    }, ECCurveFp.prototype.getA = function() {
        return this.a;
    }, ECCurveFp.prototype.getB = function() {
        return this.b;
    }, ECCurveFp.prototype.equals = function(other) {
        return other == this || this.q.equals(other.q) && this.a.equals(other.a) && this.b.equals(other.b);
    }, ECCurveFp.prototype.getInfinity = function() {
        return this.infinity;
    }, ECCurveFp.prototype.fromBigInteger = function(x) {
        return new ECFieldElementFp(this.q, x);
    }, ECCurveFp.prototype.reduce = function(x) {
        this.reducer.reduce(x);
    }, ECCurveFp.prototype.encodePointHex = function(p) {
        if (p.isInfinity()) return "00";
        var xHex = p.getX().toBigInteger().toString(16), yHex = p.getY().toBigInteger().toString(16), oLen = this.getQ().toString(16).length;
        for (oLen % 2 != 0 && oLen++; xHex.length < oLen; ) xHex = "0" + xHex;
        for (;yHex.length < oLen; ) yHex = "0" + yHex;
        return "04" + xHex + yHex;
    }, ECCurveFp.prototype.decodePointHex = function(s) {
        var yIsEven;
        switch (parseInt(s.substr(0, 2), 16)) {
          case 0:
            return this.infinity;

          case 2:
            yIsEven = !1;

          case 3:
            null == yIsEven && (yIsEven = !0);
            var len = s.length - 2, xHex = s.substr(2, len), x = this.fromBigInteger(new BigInteger(xHex, 16)), beta = x.multiply(x.square().add(this.getA())).add(this.getB()).sqrt();
            if (null == beta) throw "Invalid point compression";
            var betaValue = beta.toBigInteger();
            return betaValue.testBit(0) != yIsEven && (beta = this.fromBigInteger(this.getQ().subtract(betaValue))), 
            new ECPointFp(this, x, beta);

          case 4:
          case 6:
          case 7:
            len = (s.length - 2) / 2, xHex = s.substr(2, len);
            var yHex = s.substr(len + 2, len);
            return new ECPointFp(this, this.fromBigInteger(new BigInteger(xHex, 16)), this.fromBigInteger(new BigInteger(yHex, 16)));

          default:
            return null;
        }
    }, ECCurveFp.prototype.encodeCompressedPointHex = function(p) {
        if (p.isInfinity()) return "00";
        var xHex = p.getX().toBigInteger().toString(16), oLen = this.getQ().toString(16).length;
        for (oLen % 2 != 0 && oLen++; xHex.length < oLen; ) xHex = "0" + xHex;
        return (p.getY().toBigInteger().isEven() ? "02" : "03") + xHex;
    }, ECFieldElementFp.prototype.getR = function() {
        if (null != this.r) return this.r;
        this.r = null;
        var bitLength = this.q.bitLength();
        return bitLength > 128 && -1 == this.q.shiftRight(bitLength - 64).intValue() && (this.r = BigInteger.ONE.shiftLeft(bitLength).subtract(this.q)), 
        this.r;
    }, ECFieldElementFp.prototype.modMult = function(x1, x2) {
        return this.modReduce(x1.multiply(x2));
    }, ECFieldElementFp.prototype.modReduce = function(x) {
        if (null != this.getR()) {
            for (var qLen = q.bitLength(); x.bitLength() > qLen + 1; ) {
                var u = x.shiftRight(qLen), v = x.subtract(u.shiftLeft(qLen));
                this.getR().equals(BigInteger.ONE) || (u = u.multiply(this.getR())), x = u.add(v);
            }
            for (;x.compareTo(q) >= 0; ) x = x.subtract(q);
        } else x = x.mod(q);
        return x;
    }, ECFieldElementFp.prototype.sqrt = function() {
        if (!this.q.testBit(0)) throw "unsupported";
        if (this.q.testBit(1)) {
            var z = new ECFieldElementFp(this.q, this.x.modPow(this.q.shiftRight(2).add(BigInteger.ONE), this.q));
            return z.square().equals(this) ? z : null;
        }
        var qMinusOne = this.q.subtract(BigInteger.ONE), legendreExponent = qMinusOne.shiftRight(1);
        if (!this.x.modPow(legendreExponent, this.q).equals(BigInteger.ONE)) return null;
        var U, V, k = qMinusOne.shiftRight(2).shiftLeft(1).add(BigInteger.ONE), Q = this.x, fourQ = modDouble(modDouble(Q));
        do {
            var P;
            do {
                P = new BigInteger(this.q.bitLength(), new SecureRandom);
            } while (P.compareTo(this.q) >= 0 || !P.multiply(P).subtract(fourQ).modPow(legendreExponent, this.q).equals(qMinusOne));
            var result = this.lucasSequence(P, Q, k);
            if (U = result[0], V = result[1], this.modMult(V, V).equals(fourQ)) return V.testBit(0) && (V = V.add(q)), 
            V = V.shiftRight(1), new ECFieldElementFp(q, V);
        } while (U.equals(BigInteger.ONE) || U.equals(qMinusOne));
        return null;
    }, ECFieldElementFp.prototype.lucasSequence = function(P, Q, k) {
        for (var n = k.bitLength(), s = k.getLowestSetBit(), Uh = BigInteger.ONE, Vl = BigInteger.TWO, Vh = P, Ql = BigInteger.ONE, Qh = BigInteger.ONE, j = n - 1; j >= s + 1; --j) Ql = this.modMult(Ql, Qh), 
        k.testBit(j) ? (Qh = this.modMult(Ql, Q), Uh = this.modMult(Uh, Vh), Vl = this.modReduce(Vh.multiply(Vl).subtract(P.multiply(Ql))), 
        Vh = this.modReduce(Vh.multiply(Vh).subtract(Qh.shiftLeft(1)))) : (Qh = Ql, Uh = this.modReduce(Uh.multiply(Vl).subtract(Ql)), 
        Vh = this.modReduce(Vh.multiply(Vl).subtract(P.multiply(Ql))), Vl = this.modReduce(Vl.multiply(Vl).subtract(Ql.shiftLeft(1))));
        for (Ql = this.modMult(Ql, Qh), Qh = this.modMult(Ql, Q), Uh = this.modReduce(Uh.multiply(Vl).subtract(Ql)), 
        Vl = this.modReduce(Vh.multiply(Vl).subtract(P.multiply(Ql))), Ql = this.modMult(Ql, Qh), 
        j = 1; j <= s; ++j) Uh = this.modMult(Uh, Vl), Vl = this.modReduce(Vl.multiply(Vl).subtract(Ql.shiftLeft(1))), 
        Ql = this.modMult(Ql, Ql);
        return [ Uh, Vl ];
    }, exports = {
        ECCurveFp: ECCurveFp,
        ECPointFp: ECPointFp,
        ECFieldElementFp: ECFieldElementFp
    }, module.exports = exports;
}
