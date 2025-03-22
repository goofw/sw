function(module, exports, __webpack_require__) {
    var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;
    void 0 === (__WEBPACK_AMD_DEFINE_RESULT__ = "function" == typeof (__WEBPACK_AMD_DEFINE_FACTORY__ = function() {
        "use strict";
        function Long(low, high, unsigned) {
            this.low = 0 | low, this.high = 0 | high, this.unsigned = !!unsigned;
        }
        Long.__isLong__, Object.defineProperty(Long.prototype, "__isLong__", {
            value: !0,
            enumerable: !1,
            configurable: !1
        }), Long.isLong = function(obj) {
            return !0 === (obj && obj.__isLong__);
        };
        var INT_CACHE = {}, UINT_CACHE = {};
        Long.fromInt = function(value, unsigned) {
            var obj, cachedObj;
            return unsigned ? 0 <= (value >>>= 0) && value < 256 && (cachedObj = UINT_CACHE[value]) ? cachedObj : (obj = new Long(value, (0 | value) < 0 ? -1 : 0, !0), 
            0 <= value && value < 256 && (UINT_CACHE[value] = obj), obj) : -128 <= (value |= 0) && value < 128 && (cachedObj = INT_CACHE[value]) ? cachedObj : (obj = new Long(value, value < 0 ? -1 : 0, !1), 
            -128 <= value && value < 128 && (INT_CACHE[value] = obj), obj);
        }, Long.fromNumber = function(value, unsigned) {
            return unsigned = !!unsigned, isNaN(value) || !isFinite(value) ? Long.ZERO : !unsigned && value <= -TWO_PWR_63_DBL ? Long.MIN_VALUE : !unsigned && value + 1 >= TWO_PWR_63_DBL ? Long.MAX_VALUE : unsigned && value >= TWO_PWR_64_DBL ? Long.MAX_UNSIGNED_VALUE : value < 0 ? Long.fromNumber(-value, unsigned).negate() : new Long(value % TWO_PWR_32_DBL | 0, value / TWO_PWR_32_DBL | 0, unsigned);
        }, Long.fromBits = function(lowBits, highBits, unsigned) {
            return new Long(lowBits, highBits, unsigned);
        }, Long.fromString = function(str, unsigned, radix) {
            if (0 === str.length) throw Error("number format error: empty string");
            if ("NaN" === str || "Infinity" === str || "+Infinity" === str || "-Infinity" === str) return Long.ZERO;
            if ("number" == typeof unsigned && (radix = unsigned, unsigned = !1), (radix = radix || 10) < 2 || 36 < radix) throw Error("radix out of range: " + radix);
            var p;
            if ((p = str.indexOf("-")) > 0) throw Error('number format error: interior "-" character: ' + str);
            if (0 === p) return Long.fromString(str.substring(1), unsigned, radix).negate();
            for (var radixToPower = Long.fromNumber(Math.pow(radix, 8)), result = Long.ZERO, i = 0; i < str.length; i += 8) {
                var size = Math.min(8, str.length - i), value = parseInt(str.substring(i, i + size), radix);
                if (size < 8) {
                    var power = Long.fromNumber(Math.pow(radix, size));
                    result = result.multiply(power).add(Long.fromNumber(value));
                } else result = (result = result.multiply(radixToPower)).add(Long.fromNumber(value));
            }
            return result.unsigned = unsigned, result;
        }, Long.fromValue = function(val) {
            return val instanceof Long ? val : "number" == typeof val ? Long.fromNumber(val) : "string" == typeof val ? Long.fromString(val) : new Long(val.low, val.high, val.unsigned);
        };
        var TWO_PWR_32_DBL = 4294967296, TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL, TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2, TWO_PWR_24 = Long.fromInt(1 << 24);
        return Long.ZERO = Long.fromInt(0), Long.UZERO = Long.fromInt(0, !0), Long.ONE = Long.fromInt(1), 
        Long.UONE = Long.fromInt(1, !0), Long.NEG_ONE = Long.fromInt(-1), Long.MAX_VALUE = Long.fromBits(-1, 2147483647, !1), 
        Long.MAX_UNSIGNED_VALUE = Long.fromBits(-1, -1, !0), Long.MIN_VALUE = Long.fromBits(0, -2147483648, !1), 
        Long.prototype.toInt = function() {
            return this.unsigned ? this.low >>> 0 : this.low;
        }, Long.prototype.toNumber = function() {
            return this.unsigned ? (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0) : this.high * TWO_PWR_32_DBL + (this.low >>> 0);
        }, Long.prototype.toString = function(radix) {
            if ((radix = radix || 10) < 2 || 36 < radix) throw RangeError("radix out of range: " + radix);
            if (this.isZero()) return "0";
            var rem;
            if (this.isNegative()) {
                if (this.equals(Long.MIN_VALUE)) {
                    var radixLong = Long.fromNumber(radix), div = this.divide(radixLong);
                    return rem = div.multiply(radixLong).subtract(this), div.toString(radix) + rem.toInt().toString(radix);
                }
                return "-" + this.negate().toString(radix);
            }
            var radixToPower = Long.fromNumber(Math.pow(radix, 6), this.unsigned);
            rem = this;
            for (var result = ""; ;) {
                var remDiv = rem.divide(radixToPower), digits = (rem.subtract(remDiv.multiply(radixToPower)).toInt() >>> 0).toString(radix);
                if ((rem = remDiv).isZero()) return digits + result;
                for (;digits.length < 6; ) digits = "0" + digits;
                result = "" + digits + result;
            }
        }, Long.prototype.getHighBits = function() {
            return this.high;
        }, Long.prototype.getHighBitsUnsigned = function() {
            return this.high >>> 0;
        }, Long.prototype.getLowBits = function() {
            return this.low;
        }, Long.prototype.getLowBitsUnsigned = function() {
            return this.low >>> 0;
        }, Long.prototype.getNumBitsAbs = function() {
            if (this.isNegative()) return this.equals(Long.MIN_VALUE) ? 64 : this.negate().getNumBitsAbs();
            for (var val = 0 != this.high ? this.high : this.low, bit = 31; bit > 0 && 0 == (val & 1 << bit); bit--) ;
            return 0 != this.high ? bit + 33 : bit + 1;
        }, Long.prototype.isZero = function() {
            return 0 === this.high && 0 === this.low;
        }, Long.prototype.isNegative = function() {
            return !this.unsigned && this.high < 0;
        }, Long.prototype.isPositive = function() {
            return this.unsigned || this.high >= 0;
        }, Long.prototype.isOdd = function() {
            return 1 == (1 & this.low);
        }, Long.prototype.isEven = function() {
            return 0 == (1 & this.low);
        }, Long.prototype.equals = function(other) {
            return Long.isLong(other) || (other = Long.fromValue(other)), (this.unsigned === other.unsigned || this.high >>> 31 != 1 || other.high >>> 31 != 1) && this.high === other.high && this.low === other.low;
        }, Long.eq = Long.prototype.equals, Long.prototype.notEquals = function(other) {
            return !this.equals(other);
        }, Long.neq = Long.prototype.notEquals, Long.prototype.lessThan = function(other) {
            return this.compare(other) < 0;
        }, Long.prototype.lt = Long.prototype.lessThan, Long.prototype.lessThanOrEqual = function(other) {
            return this.compare(other) <= 0;
        }, Long.prototype.lte = Long.prototype.lessThanOrEqual, Long.prototype.greaterThan = function(other) {
            return this.compare(other) > 0;
        }, Long.prototype.gt = Long.prototype.greaterThan, Long.prototype.greaterThanOrEqual = function(other) {
            return this.compare(other) >= 0;
        }, Long.prototype.gte = Long.prototype.greaterThanOrEqual, Long.prototype.compare = function(other) {
            if (Long.isLong(other) || (other = Long.fromValue(other)), this.equals(other)) return 0;
            var thisNeg = this.isNegative(), otherNeg = other.isNegative();
            return thisNeg && !otherNeg ? -1 : !thisNeg && otherNeg ? 1 : this.unsigned ? other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1 : this.subtract(other).isNegative() ? -1 : 1;
        }, Long.prototype.negate = function() {
            return !this.unsigned && this.equals(Long.MIN_VALUE) ? Long.MIN_VALUE : this.not().add(Long.ONE);
        }, Long.prototype.neg = Long.prototype.negate, Long.prototype.add = function(addend) {
            Long.isLong(addend) || (addend = Long.fromValue(addend));
            var a48 = this.high >>> 16, a32 = 65535 & this.high, a16 = this.low >>> 16, a00 = 65535 & this.low, b48 = addend.high >>> 16, b32 = 65535 & addend.high, b16 = addend.low >>> 16, c48 = 0, c32 = 0, c16 = 0, c00 = 0;
            return c16 += (c00 += a00 + (65535 & addend.low)) >>> 16, c00 &= 65535, c32 += (c16 += a16 + b16) >>> 16, 
            c16 &= 65535, c48 += (c32 += a32 + b32) >>> 16, c32 &= 65535, c48 += a48 + b48, 
            c48 &= 65535, Long.fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
        }, Long.prototype.subtract = function(subtrahend) {
            return Long.isLong(subtrahend) || (subtrahend = Long.fromValue(subtrahend)), this.add(subtrahend.negate());
        }, Long.prototype.sub = Long.prototype.subtract, Long.prototype.multiply = function(multiplier) {
            if (this.isZero()) return Long.ZERO;
            if (Long.isLong(multiplier) || (multiplier = Long.fromValue(multiplier)), multiplier.isZero()) return Long.ZERO;
            if (this.equals(Long.MIN_VALUE)) return multiplier.isOdd() ? Long.MIN_VALUE : Long.ZERO;
            if (multiplier.equals(Long.MIN_VALUE)) return this.isOdd() ? Long.MIN_VALUE : Long.ZERO;
            if (this.isNegative()) return multiplier.isNegative() ? this.negate().multiply(multiplier.negate()) : this.negate().multiply(multiplier).negate();
            if (multiplier.isNegative()) return this.multiply(multiplier.negate()).negate();
            if (this.lessThan(TWO_PWR_24) && multiplier.lessThan(TWO_PWR_24)) return Long.fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);
            var a48 = this.high >>> 16, a32 = 65535 & this.high, a16 = this.low >>> 16, a00 = 65535 & this.low, b48 = multiplier.high >>> 16, b32 = 65535 & multiplier.high, b16 = multiplier.low >>> 16, b00 = 65535 & multiplier.low, c48 = 0, c32 = 0, c16 = 0, c00 = 0;
            return c16 += (c00 += a00 * b00) >>> 16, c00 &= 65535, c32 += (c16 += a16 * b00) >>> 16, 
            c16 &= 65535, c32 += (c16 += a00 * b16) >>> 16, c16 &= 65535, c48 += (c32 += a32 * b00) >>> 16, 
            c32 &= 65535, c48 += (c32 += a16 * b16) >>> 16, c32 &= 65535, c48 += (c32 += a00 * b32) >>> 16, 
            c32 &= 65535, c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48, c48 &= 65535, 
            Long.fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
        }, Long.prototype.mul = Long.prototype.multiply, Long.prototype.divide = function(divisor) {
            if (Long.isLong(divisor) || (divisor = Long.fromValue(divisor)), divisor.isZero()) throw new Error("division by zero");
            if (this.isZero()) return this.unsigned ? Long.UZERO : Long.ZERO;
            var approx, rem, res;
            if (this.equals(Long.MIN_VALUE)) return divisor.equals(Long.ONE) || divisor.equals(Long.NEG_ONE) ? Long.MIN_VALUE : divisor.equals(Long.MIN_VALUE) ? Long.ONE : (approx = this.shiftRight(1).divide(divisor).shiftLeft(1)).equals(Long.ZERO) ? divisor.isNegative() ? Long.ONE : Long.NEG_ONE : (rem = this.subtract(divisor.multiply(approx)), 
            res = approx.add(rem.divide(divisor)));
            if (divisor.equals(Long.MIN_VALUE)) return this.unsigned ? Long.UZERO : Long.ZERO;
            if (this.isNegative()) return divisor.isNegative() ? this.negate().divide(divisor.negate()) : this.negate().divide(divisor).negate();
            if (divisor.isNegative()) return this.divide(divisor.negate()).negate();
            for (res = Long.ZERO, rem = this; rem.greaterThanOrEqual(divisor); ) {
                approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));
                for (var log2 = Math.ceil(Math.log(approx) / Math.LN2), delta = log2 <= 48 ? 1 : Math.pow(2, log2 - 48), approxRes = Long.fromNumber(approx), approxRem = approxRes.multiply(divisor); approxRem.isNegative() || approxRem.greaterThan(rem); ) approx -= delta, 
                approxRem = (approxRes = Long.fromNumber(approx, this.unsigned)).multiply(divisor);
                approxRes.isZero() && (approxRes = Long.ONE), res = res.add(approxRes), rem = rem.subtract(approxRem);
            }
            return res;
        }, Long.prototype.div = Long.prototype.divide, Long.prototype.modulo = function(divisor) {
            return Long.isLong(divisor) || (divisor = Long.fromValue(divisor)), this.subtract(this.divide(divisor).multiply(divisor));
        }, Long.prototype.mod = Long.prototype.modulo, Long.prototype.not = function() {
            return Long.fromBits(~this.low, ~this.high, this.unsigned);
        }, Long.prototype.and = function(other) {
            return Long.isLong(other) || (other = Long.fromValue(other)), Long.fromBits(this.low & other.low, this.high & other.high, this.unsigned);
        }, Long.prototype.or = function(other) {
            return Long.isLong(other) || (other = Long.fromValue(other)), Long.fromBits(this.low | other.low, this.high | other.high, this.unsigned);
        }, Long.prototype.xor = function(other) {
            return Long.isLong(other) || (other = Long.fromValue(other)), Long.fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
        }, Long.prototype.shiftLeft = function(numBits) {
            return Long.isLong(numBits) && (numBits = numBits.toInt()), 0 == (numBits &= 63) ? this : numBits < 32 ? Long.fromBits(this.low << numBits, this.high << numBits | this.low >>> 32 - numBits, this.unsigned) : Long.fromBits(0, this.low << numBits - 32, this.unsigned);
        }, Long.prototype.shl = Long.prototype.shiftLeft, Long.prototype.shiftRight = function(numBits) {
            return Long.isLong(numBits) && (numBits = numBits.toInt()), 0 == (numBits &= 63) ? this : numBits < 32 ? Long.fromBits(this.low >>> numBits | this.high << 32 - numBits, this.high >> numBits, this.unsigned) : Long.fromBits(this.high >> numBits - 32, this.high >= 0 ? 0 : -1, this.unsigned);
        }, Long.prototype.shr = Long.prototype.shiftRight, Long.prototype.shiftRightUnsigned = function(numBits) {
            if (Long.isLong(numBits) && (numBits = numBits.toInt()), 0 == (numBits &= 63)) return this;
            var high = this.high;
            if (numBits < 32) {
                var low = this.low;
                return Long.fromBits(low >>> numBits | high << 32 - numBits, high >>> numBits, this.unsigned);
            }
            return 32 === numBits ? Long.fromBits(high, 0, this.unsigned) : Long.fromBits(high >>> numBits - 32, 0, this.unsigned);
        }, Long.prototype.shru = Long.prototype.shiftRightUnsigned, Long.prototype.toSigned = function() {
            return this.unsigned ? new Long(this.low, this.high, !1) : this;
        }, Long.prototype.toUnsigned = function() {
            return this.unsigned ? this : new Long(this.low, this.high, !0);
        }, Long;
    }) ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, []) : __WEBPACK_AMD_DEFINE_FACTORY__) || (module.exports = __WEBPACK_AMD_DEFINE_RESULT__);
}
