function(module, exports, __webpack_require__) {
    (function(module) {
        var __WEBPACK_AMD_DEFINE_RESULT__, bigInt = (function(undefined) {
            "use strict";
            var BASE = 1e7, MAX_INT = 9007199254740992, MAX_INT_ARR = smallToArray(MAX_INT), supportsNativeBigInt = "function" == typeof BigInt;
            function Integer(v, radix, alphabet, caseSensitive) {
                return void 0 === v ? Integer[0] : void 0 === radix || 10 == +radix && !alphabet ? parseValue(v) : parseBase(v, radix, alphabet, caseSensitive);
            }
            function BigInteger(value, sign) {
                this.value = value, this.sign = sign, this.isSmall = !1;
            }
            function SmallInteger(value) {
                this.value = value, this.sign = value < 0, this.isSmall = !0;
            }
            function NativeBigInt(value) {
                this.value = value;
            }
            function isPrecise(n) {
                return -MAX_INT < n && n < MAX_INT;
            }
            function smallToArray(n) {
                return n < 1e7 ? [ n ] : n < 1e14 ? [ n % 1e7, Math.floor(n / 1e7) ] : [ n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14) ];
            }
            function arrayToSmall(arr) {
                trim(arr);
                var length = arr.length;
                if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) switch (length) {
                  case 0:
                    return 0;

                  case 1:
                    return arr[0];

                  case 2:
                    return arr[0] + arr[1] * BASE;

                  default:
                    return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
                }
                return arr;
            }
            function trim(v) {
                for (var i = v.length; 0 === v[--i]; ) ;
                v.length = i + 1;
            }
            function createArray(length) {
                for (var x = new Array(length), i = -1; ++i < length; ) x[i] = 0;
                return x;
            }
            function truncate(n) {
                return n > 0 ? Math.floor(n) : Math.ceil(n);
            }
            function add(a, b) {
                var sum, i, l_a = a.length, l_b = b.length, r = new Array(l_a), carry = 0, base = BASE;
                for (i = 0; i < l_b; i++) carry = (sum = a[i] + b[i] + carry) >= base ? 1 : 0, r[i] = sum - carry * base;
                for (;i < l_a; ) carry = (sum = a[i] + carry) === base ? 1 : 0, r[i++] = sum - carry * base;
                return carry > 0 && r.push(carry), r;
            }
            function addAny(a, b) {
                return a.length >= b.length ? add(a, b) : add(b, a);
            }
            function addSmall(a, carry) {
                var sum, i, l = a.length, r = new Array(l), base = BASE;
                for (i = 0; i < l; i++) sum = a[i] - base + carry, carry = Math.floor(sum / base), 
                r[i] = sum - carry * base, carry += 1;
                for (;carry > 0; ) r[i++] = carry % base, carry = Math.floor(carry / base);
                return r;
            }
            function subtract(a, b) {
                var i, difference, a_l = a.length, b_l = b.length, r = new Array(a_l), borrow = 0;
                for (i = 0; i < b_l; i++) (difference = a[i] - borrow - b[i]) < 0 ? (difference += 1e7, 
                borrow = 1) : borrow = 0, r[i] = difference;
                for (i = b_l; i < a_l; i++) {
                    if (!((difference = a[i] - borrow) < 0)) {
                        r[i++] = difference;
                        break;
                    }
                    difference += 1e7, r[i] = difference;
                }
                for (;i < a_l; i++) r[i] = a[i];
                return trim(r), r;
            }
            function subtractSmall(a, b, sign) {
                var i, difference, l = a.length, r = new Array(l), carry = -b;
                for (i = 0; i < l; i++) difference = a[i] + carry, carry = Math.floor(difference / 1e7), 
                difference %= 1e7, r[i] = difference < 0 ? difference + 1e7 : difference;
                return "number" == typeof (r = arrayToSmall(r)) ? (sign && (r = -r), new SmallInteger(r)) : new BigInteger(r, sign);
            }
            function multiplyLong(a, b) {
                var product, carry, i, a_i, a_l = a.length, b_l = b.length, r = createArray(a_l + b_l);
                for (i = 0; i < a_l; ++i) {
                    a_i = a[i];
                    for (var j = 0; j < b_l; ++j) product = a_i * b[j] + r[i + j], carry = Math.floor(product / 1e7), 
                    r[i + j] = product - 1e7 * carry, r[i + j + 1] += carry;
                }
                return trim(r), r;
            }
            function multiplySmall(a, b) {
                var product, i, l = a.length, r = new Array(l), base = BASE, carry = 0;
                for (i = 0; i < l; i++) product = a[i] * b + carry, carry = Math.floor(product / base), 
                r[i] = product - carry * base;
                for (;carry > 0; ) r[i++] = carry % base, carry = Math.floor(carry / base);
                return r;
            }
            function shiftLeft(x, n) {
                for (var r = []; n-- > 0; ) r.push(0);
                return r.concat(x);
            }
            function multiplyKaratsuba(x, y) {
                var n = Math.max(x.length, y.length);
                if (n <= 30) return multiplyLong(x, y);
                n = Math.ceil(n / 2);
                var b = x.slice(n), a = x.slice(0, n), d = y.slice(n), c = y.slice(0, n), ac = multiplyKaratsuba(a, c), bd = multiplyKaratsuba(b, d), abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d)), product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));
                return trim(product), product;
            }
            function multiplySmallAndArray(a, b, sign) {
                return new BigInteger(a < BASE ? multiplySmall(b, a) : multiplyLong(b, smallToArray(a)), sign);
            }
            function square(a) {
                var product, carry, i, a_i, l = a.length, r = createArray(l + l);
                for (i = 0; i < l; i++) {
                    carry = 0 - (a_i = a[i]) * a_i;
                    for (var j = i; j < l; j++) product = a_i * a[j] * 2 + r[i + j] + carry, carry = Math.floor(product / 1e7), 
                    r[i + j] = product - 1e7 * carry;
                    r[i + l] = carry;
                }
                return trim(r), r;
            }
            function divModSmall(value, lambda) {
                var i, q, remainder, divisor, length = value.length, quotient = createArray(length);
                for (remainder = 0, i = length - 1; i >= 0; --i) remainder = (divisor = 1e7 * remainder + value[i]) - (q = truncate(divisor / lambda)) * lambda, 
                quotient[i] = 0 | q;
                return [ quotient, 0 | remainder ];
            }
            function divModAny(self, v) {
                var value, n = parseValue(v);
                if (supportsNativeBigInt) return [ new NativeBigInt(self.value / n.value), new NativeBigInt(self.value % n.value) ];
                var quotient, a = self.value, b = n.value;
                if (0 === b) throw new Error("Cannot divide by zero");
                if (self.isSmall) return n.isSmall ? [ new SmallInteger(truncate(a / b)), new SmallInteger(a % b) ] : [ Integer[0], self ];
                if (n.isSmall) {
                    if (1 === b) return [ self, Integer[0] ];
                    if (-1 == b) return [ self.negate(), Integer[0] ];
                    var abs = Math.abs(b);
                    if (abs < BASE) {
                        quotient = arrayToSmall((value = divModSmall(a, abs))[0]);
                        var remainder = value[1];
                        return self.sign && (remainder = -remainder), "number" == typeof quotient ? (self.sign !== n.sign && (quotient = -quotient), 
                        [ new SmallInteger(quotient), new SmallInteger(remainder) ]) : [ new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder) ];
                    }
                    b = smallToArray(abs);
                }
                var comparison = compareAbs(a, b);
                if (-1 === comparison) return [ Integer[0], self ];
                if (0 === comparison) return [ Integer[self.sign === n.sign ? 1 : -1], Integer[0] ];
                value = a.length + b.length <= 200 ? (function(a, b) {
                    var quotientDigit, shift, carry, borrow, i, l, q, a_l = a.length, b_l = b.length, base = BASE, result = createArray(b.length), divisorMostSignificantDigit = b[b_l - 1], lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)), remainder = multiplySmall(a, lambda), divisor = multiplySmall(b, lambda);
                    for (remainder.length <= a_l && remainder.push(0), divisor.push(0), divisorMostSignificantDigit = divisor[b_l - 1], 
                    shift = a_l - b_l; shift >= 0; shift--) {
                        for (quotientDigit = base - 1, remainder[shift + b_l] !== divisorMostSignificantDigit && (quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit)), 
                        carry = 0, borrow = 0, l = divisor.length, i = 0; i < l; i++) carry += quotientDigit * divisor[i], 
                        q = Math.floor(carry / base), borrow += remainder[shift + i] - (carry - q * base), 
                        carry = q, borrow < 0 ? (remainder[shift + i] = borrow + base, borrow = -1) : (remainder[shift + i] = borrow, 
                        borrow = 0);
                        for (;0 !== borrow; ) {
                            for (quotientDigit -= 1, carry = 0, i = 0; i < l; i++) (carry += remainder[shift + i] - base + divisor[i]) < 0 ? (remainder[shift + i] = carry + base, 
                            carry = 0) : (remainder[shift + i] = carry, carry = 1);
                            borrow += carry;
                        }
                        result[shift] = quotientDigit;
                    }
                    return remainder = divModSmall(remainder, lambda)[0], [ arrayToSmall(result), arrayToSmall(remainder) ];
                })(a, b) : (function(a, b) {
                    for (var guess, xlen, highx, highy, check, a_l = a.length, b_l = b.length, result = [], part = []; a_l; ) if (part.unshift(a[--a_l]), 
                    trim(part), compareAbs(part, b) < 0) result.push(0); else {
                        highx = 1e7 * part[(xlen = part.length) - 1] + part[xlen - 2], highy = 1e7 * b[b_l - 1] + b[b_l - 2], 
                        xlen > b_l && (highx = 1e7 * (highx + 1)), guess = Math.ceil(highx / highy);
                        do {
                            if (compareAbs(check = multiplySmall(b, guess), part) <= 0) break;
                            guess--;
                        } while (guess);
                        result.push(guess), part = subtract(part, check);
                    }
                    return result.reverse(), [ arrayToSmall(result), arrayToSmall(part) ];
                })(a, b), quotient = value[0];
                var qSign = self.sign !== n.sign, mod = value[1], mSign = self.sign;
                return "number" == typeof quotient ? (qSign && (quotient = -quotient), quotient = new SmallInteger(quotient)) : quotient = new BigInteger(quotient, qSign), 
                "number" == typeof mod ? (mSign && (mod = -mod), mod = new SmallInteger(mod)) : mod = new BigInteger(mod, mSign), 
                [ quotient, mod ];
            }
            function compareAbs(a, b) {
                if (a.length !== b.length) return a.length > b.length ? 1 : -1;
                for (var i = a.length - 1; i >= 0; i--) if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
                return 0;
            }
            function isBasicPrime(v) {
                var n = v.abs();
                return !n.isUnit() && (!!(n.equals(2) || n.equals(3) || n.equals(5)) || !(n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) && (!!n.lesser(49) || void 0));
            }
            function millerRabinTest(n, a) {
                for (var d, i, x, nPrev = n.prev(), b = nPrev, r = 0; b.isEven(); ) b = b.divide(2), 
                r++;
                next: for (i = 0; i < a.length; i++) if (!n.lesser(a[i]) && !(x = bigInt(a[i]).modPow(b, n)).isUnit() && !x.equals(nPrev)) {
                    for (d = r - 1; 0 != d; d--) {
                        if ((x = x.square().mod(n)).isUnit()) return !1;
                        if (x.equals(nPrev)) continue next;
                    }
                    return !1;
                }
                return !0;
            }
            BigInteger.prototype = Object.create(Integer.prototype), SmallInteger.prototype = Object.create(Integer.prototype), 
            NativeBigInt.prototype = Object.create(Integer.prototype), BigInteger.prototype.add = function(v) {
                var n = parseValue(v);
                if (this.sign !== n.sign) return this.subtract(n.negate());
                var a = this.value, b = n.value;
                return n.isSmall ? new BigInteger(addSmall(a, Math.abs(b)), this.sign) : new BigInteger(addAny(a, b), this.sign);
            }, BigInteger.prototype.plus = BigInteger.prototype.add, SmallInteger.prototype.add = function(v) {
                var n = parseValue(v), a = this.value;
                if (a < 0 !== n.sign) return this.subtract(n.negate());
                var b = n.value;
                if (n.isSmall) {
                    if (isPrecise(a + b)) return new SmallInteger(a + b);
                    b = smallToArray(Math.abs(b));
                }
                return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
            }, SmallInteger.prototype.plus = SmallInteger.prototype.add, NativeBigInt.prototype.add = function(v) {
                return new NativeBigInt(this.value + parseValue(v).value);
            }, NativeBigInt.prototype.plus = NativeBigInt.prototype.add, BigInteger.prototype.subtract = function(v) {
                var n = parseValue(v);
                if (this.sign !== n.sign) return this.add(n.negate());
                var a = this.value, b = n.value;
                return n.isSmall ? subtractSmall(a, Math.abs(b), this.sign) : (function(a, b, sign) {
                    var value;
                    return compareAbs(a, b) >= 0 ? value = subtract(a, b) : (value = subtract(b, a), 
                    sign = !sign), "number" == typeof (value = arrayToSmall(value)) ? (sign && (value = -value), 
                    new SmallInteger(value)) : new BigInteger(value, sign);
                })(a, b, this.sign);
            }, BigInteger.prototype.minus = BigInteger.prototype.subtract, SmallInteger.prototype.subtract = function(v) {
                var n = parseValue(v), a = this.value;
                if (a < 0 !== n.sign) return this.add(n.negate());
                var b = n.value;
                return n.isSmall ? new SmallInteger(a - b) : subtractSmall(b, Math.abs(a), a >= 0);
            }, SmallInteger.prototype.minus = SmallInteger.prototype.subtract, NativeBigInt.prototype.subtract = function(v) {
                return new NativeBigInt(this.value - parseValue(v).value);
            }, NativeBigInt.prototype.minus = NativeBigInt.prototype.subtract, BigInteger.prototype.negate = function() {
                return new BigInteger(this.value, !this.sign);
            }, SmallInteger.prototype.negate = function() {
                var sign = this.sign, small = new SmallInteger(-this.value);
                return small.sign = !sign, small;
            }, NativeBigInt.prototype.negate = function() {
                return new NativeBigInt(-this.value);
            }, BigInteger.prototype.abs = function() {
                return new BigInteger(this.value, !1);
            }, SmallInteger.prototype.abs = function() {
                return new SmallInteger(Math.abs(this.value));
            }, NativeBigInt.prototype.abs = function() {
                return new NativeBigInt(this.value >= 0 ? this.value : -this.value);
            }, BigInteger.prototype.multiply = function(v) {
                var abs, l1, l2, n = parseValue(v), a = this.value, b = n.value, sign = this.sign !== n.sign;
                if (n.isSmall) {
                    if (0 === b) return Integer[0];
                    if (1 === b) return this;
                    if (-1 === b) return this.negate();
                    if ((abs = Math.abs(b)) < BASE) return new BigInteger(multiplySmall(a, abs), sign);
                    b = smallToArray(abs);
                }
                return new BigInteger(-.012 * (l1 = a.length) - .012 * (l2 = b.length) + 15e-6 * l1 * l2 > 0 ? multiplyKaratsuba(a, b) : multiplyLong(a, b), sign);
            }, BigInteger.prototype.times = BigInteger.prototype.multiply, SmallInteger.prototype._multiplyBySmall = function(a) {
                return isPrecise(a.value * this.value) ? new SmallInteger(a.value * this.value) : multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
            }, BigInteger.prototype._multiplyBySmall = function(a) {
                return 0 === a.value ? Integer[0] : 1 === a.value ? this : -1 === a.value ? this.negate() : multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
            }, SmallInteger.prototype.multiply = function(v) {
                return parseValue(v)._multiplyBySmall(this);
            }, SmallInteger.prototype.times = SmallInteger.prototype.multiply, NativeBigInt.prototype.multiply = function(v) {
                return new NativeBigInt(this.value * parseValue(v).value);
            }, NativeBigInt.prototype.times = NativeBigInt.prototype.multiply, BigInteger.prototype.square = function() {
                return new BigInteger(square(this.value), !1);
            }, SmallInteger.prototype.square = function() {
                var value = this.value * this.value;
                return isPrecise(value) ? new SmallInteger(value) : new BigInteger(square(smallToArray(Math.abs(this.value))), !1);
            }, NativeBigInt.prototype.square = function(v) {
                return new NativeBigInt(this.value * this.value);
            }, BigInteger.prototype.divmod = function(v) {
                var result = divModAny(this, v);
                return {
                    quotient: result[0],
                    remainder: result[1]
                };
            }, NativeBigInt.prototype.divmod = SmallInteger.prototype.divmod = BigInteger.prototype.divmod, 
            BigInteger.prototype.divide = function(v) {
                return divModAny(this, v)[0];
            }, NativeBigInt.prototype.over = NativeBigInt.prototype.divide = function(v) {
                return new NativeBigInt(this.value / parseValue(v).value);
            }, SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide, 
            BigInteger.prototype.mod = function(v) {
                return divModAny(this, v)[1];
            }, NativeBigInt.prototype.mod = NativeBigInt.prototype.remainder = function(v) {
                return new NativeBigInt(this.value % parseValue(v).value);
            }, SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod, 
            BigInteger.prototype.pow = function(v) {
                var value, x, y, n = parseValue(v), a = this.value, b = n.value;
                if (0 === b) return Integer[1];
                if (0 === a) return Integer[0];
                if (1 === a) return Integer[1];
                if (-1 === a) return n.isEven() ? Integer[1] : Integer[-1];
                if (n.sign) return Integer[0];
                if (!n.isSmall) throw new Error("The exponent " + n.toString() + " is too large.");
                if (this.isSmall && isPrecise(value = Math.pow(a, b))) return new SmallInteger(truncate(value));
                for (x = this, y = Integer[1]; !0 & b && (y = y.times(x), --b), 0 !== b; ) b /= 2, 
                x = x.square();
                return y;
            }, SmallInteger.prototype.pow = BigInteger.prototype.pow, NativeBigInt.prototype.pow = function(v) {
                var n = parseValue(v), a = this.value, b = n.value, _0 = BigInt(0), _1 = BigInt(1), _2 = BigInt(2);
                if (b === _0) return Integer[1];
                if (a === _0) return Integer[0];
                if (a === _1) return Integer[1];
                if (a === BigInt(-1)) return n.isEven() ? Integer[1] : Integer[-1];
                if (n.isNegative()) return new NativeBigInt(_0);
                for (var x = this, y = Integer[1]; (b & _1) === _1 && (y = y.times(x), --b), b !== _0; ) b /= _2, 
                x = x.square();
                return y;
            }, BigInteger.prototype.modPow = function(exp, mod) {
                if (exp = parseValue(exp), (mod = parseValue(mod)).isZero()) throw new Error("Cannot take modPow with modulus 0");
                var r = Integer[1], base = this.mod(mod);
                for (exp.isNegative() && (exp = exp.multiply(Integer[-1]), base = base.modInv(mod)); exp.isPositive(); ) {
                    if (base.isZero()) return Integer[0];
                    exp.isOdd() && (r = r.multiply(base).mod(mod)), exp = exp.divide(2), base = base.square().mod(mod);
                }
                return r;
            }, NativeBigInt.prototype.modPow = SmallInteger.prototype.modPow = BigInteger.prototype.modPow, 
            BigInteger.prototype.compareAbs = function(v) {
                var n = parseValue(v), a = this.value, b = n.value;
                return n.isSmall ? 1 : compareAbs(a, b);
            }, SmallInteger.prototype.compareAbs = function(v) {
                var n = parseValue(v), a = Math.abs(this.value), b = n.value;
                return n.isSmall ? a === (b = Math.abs(b)) ? 0 : a > b ? 1 : -1 : -1;
            }, NativeBigInt.prototype.compareAbs = function(v) {
                var a = this.value, b = parseValue(v).value;
                return (a = a >= 0 ? a : -a) === (b = b >= 0 ? b : -b) ? 0 : a > b ? 1 : -1;
            }, BigInteger.prototype.compare = function(v) {
                if (v === 1 / 0) return -1;
                if (v === -1 / 0) return 1;
                var n = parseValue(v), a = this.value, b = n.value;
                return this.sign !== n.sign ? n.sign ? 1 : -1 : n.isSmall ? this.sign ? -1 : 1 : compareAbs(a, b) * (this.sign ? -1 : 1);
            }, BigInteger.prototype.compareTo = BigInteger.prototype.compare, SmallInteger.prototype.compare = function(v) {
                if (v === 1 / 0) return -1;
                if (v === -1 / 0) return 1;
                var n = parseValue(v), a = this.value, b = n.value;
                return n.isSmall ? a == b ? 0 : a > b ? 1 : -1 : a < 0 !== n.sign ? a < 0 ? -1 : 1 : a < 0 ? 1 : -1;
            }, SmallInteger.prototype.compareTo = SmallInteger.prototype.compare, NativeBigInt.prototype.compare = function(v) {
                if (v === 1 / 0) return -1;
                if (v === -1 / 0) return 1;
                var a = this.value, b = parseValue(v).value;
                return a === b ? 0 : a > b ? 1 : -1;
            }, NativeBigInt.prototype.compareTo = NativeBigInt.prototype.compare, BigInteger.prototype.equals = function(v) {
                return 0 === this.compare(v);
            }, NativeBigInt.prototype.eq = NativeBigInt.prototype.equals = SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals, 
            BigInteger.prototype.notEquals = function(v) {
                return 0 !== this.compare(v);
            }, NativeBigInt.prototype.neq = NativeBigInt.prototype.notEquals = SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals, 
            BigInteger.prototype.greater = function(v) {
                return this.compare(v) > 0;
            }, NativeBigInt.prototype.gt = NativeBigInt.prototype.greater = SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater, 
            BigInteger.prototype.lesser = function(v) {
                return this.compare(v) < 0;
            }, NativeBigInt.prototype.lt = NativeBigInt.prototype.lesser = SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser, 
            BigInteger.prototype.greaterOrEquals = function(v) {
                return this.compare(v) >= 0;
            }, NativeBigInt.prototype.geq = NativeBigInt.prototype.greaterOrEquals = SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals, 
            BigInteger.prototype.lesserOrEquals = function(v) {
                return this.compare(v) <= 0;
            }, NativeBigInt.prototype.leq = NativeBigInt.prototype.lesserOrEquals = SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals, 
            BigInteger.prototype.isEven = function() {
                return 0 == (1 & this.value[0]);
            }, SmallInteger.prototype.isEven = function() {
                return 0 == (1 & this.value);
            }, NativeBigInt.prototype.isEven = function() {
                return (this.value & BigInt(1)) === BigInt(0);
            }, BigInteger.prototype.isOdd = function() {
                return 1 == (1 & this.value[0]);
            }, SmallInteger.prototype.isOdd = function() {
                return 1 == (1 & this.value);
            }, NativeBigInt.prototype.isOdd = function() {
                return (this.value & BigInt(1)) === BigInt(1);
            }, BigInteger.prototype.isPositive = function() {
                return !this.sign;
            }, SmallInteger.prototype.isPositive = function() {
                return this.value > 0;
            }, NativeBigInt.prototype.isPositive = SmallInteger.prototype.isPositive, BigInteger.prototype.isNegative = function() {
                return this.sign;
            }, SmallInteger.prototype.isNegative = function() {
                return this.value < 0;
            }, NativeBigInt.prototype.isNegative = SmallInteger.prototype.isNegative, BigInteger.prototype.isUnit = function() {
                return !1;
            }, SmallInteger.prototype.isUnit = function() {
                return 1 === Math.abs(this.value);
            }, NativeBigInt.prototype.isUnit = function() {
                return this.abs().value === BigInt(1);
            }, BigInteger.prototype.isZero = function() {
                return !1;
            }, SmallInteger.prototype.isZero = function() {
                return 0 === this.value;
            }, NativeBigInt.prototype.isZero = function() {
                return this.value === BigInt(0);
            }, BigInteger.prototype.isDivisibleBy = function(v) {
                var n = parseValue(v);
                return !n.isZero() && (!!n.isUnit() || (0 === n.compareAbs(2) ? this.isEven() : this.mod(n).isZero()));
            }, NativeBigInt.prototype.isDivisibleBy = SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy, 
            BigInteger.prototype.isPrime = function(strict) {
                var isPrime = isBasicPrime(this);
                if (undefined !== isPrime) return isPrime;
                var n = this.abs(), bits = n.bitLength();
                if (bits <= 64) return millerRabinTest(n, [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37 ]);
                for (var logN = Math.log(2) * bits.toJSNumber(), t = Math.ceil(!0 === strict ? 2 * Math.pow(logN, 2) : logN), a = [], i = 0; i < t; i++) a.push(bigInt(i + 2));
                return millerRabinTest(n, a);
            }, NativeBigInt.prototype.isPrime = SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime, 
            BigInteger.prototype.isProbablePrime = function(iterations, rng) {
                var isPrime = isBasicPrime(this);
                if (undefined !== isPrime) return isPrime;
                for (var n = this.abs(), t = undefined === iterations ? 5 : iterations, a = [], i = 0; i < t; i++) a.push(bigInt.randBetween(2, n.minus(2), rng));
                return millerRabinTest(n, a);
            }, NativeBigInt.prototype.isProbablePrime = SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime, 
            BigInteger.prototype.modInv = function(n) {
                for (var q, lastT, lastR, t = bigInt.zero, newT = bigInt.one, r = parseValue(n), newR = this.abs(); !newR.isZero(); ) q = r.divide(newR), 
                lastT = t, lastR = r, t = newT, r = newR, newT = lastT.subtract(q.multiply(newT)), 
                newR = lastR.subtract(q.multiply(newR));
                if (!r.isUnit()) throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");
                return -1 === t.compare(0) && (t = t.add(n)), this.isNegative() ? t.negate() : t;
            }, NativeBigInt.prototype.modInv = SmallInteger.prototype.modInv = BigInteger.prototype.modInv, 
            BigInteger.prototype.next = function() {
                var value = this.value;
                return this.sign ? subtractSmall(value, 1, this.sign) : new BigInteger(addSmall(value, 1), this.sign);
            }, SmallInteger.prototype.next = function() {
                var value = this.value;
                return value + 1 < MAX_INT ? new SmallInteger(value + 1) : new BigInteger(MAX_INT_ARR, !1);
            }, NativeBigInt.prototype.next = function() {
                return new NativeBigInt(this.value + BigInt(1));
            }, BigInteger.prototype.prev = function() {
                var value = this.value;
                return this.sign ? new BigInteger(addSmall(value, 1), !0) : subtractSmall(value, 1, this.sign);
            }, SmallInteger.prototype.prev = function() {
                var value = this.value;
                return value - 1 > -MAX_INT ? new SmallInteger(value - 1) : new BigInteger(MAX_INT_ARR, !0);
            }, NativeBigInt.prototype.prev = function() {
                return new NativeBigInt(this.value - BigInt(1));
            };
            for (var powersOfTwo = [ 1 ]; 2 * powersOfTwo[powersOfTwo.length - 1] <= BASE; ) powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
            var powers2Length = powersOfTwo.length, highestPower2 = powersOfTwo[powers2Length - 1];
            function shift_isSmall(n) {
                return Math.abs(n) <= BASE;
            }
            function bitwise(x, y, fn) {
                y = parseValue(y);
                for (var xSign = x.isNegative(), ySign = y.isNegative(), xRem = xSign ? x.not() : x, yRem = ySign ? y.not() : y, xDigit = 0, yDigit = 0, xDivMod = null, yDivMod = null, result = []; !xRem.isZero() || !yRem.isZero(); ) xDigit = (xDivMod = divModAny(xRem, highestPower2))[1].toJSNumber(), 
                xSign && (xDigit = highestPower2 - 1 - xDigit), yDigit = (yDivMod = divModAny(yRem, highestPower2))[1].toJSNumber(), 
                ySign && (yDigit = highestPower2 - 1 - yDigit), xRem = xDivMod[0], yRem = yDivMod[0], 
                result.push(fn(xDigit, yDigit));
                for (var sum = 0 !== fn(xSign ? 1 : 0, ySign ? 1 : 0) ? bigInt(-1) : bigInt(0), i = result.length - 1; i >= 0; i -= 1) sum = sum.multiply(highestPower2).add(bigInt(result[i]));
                return sum;
            }
            function roughLOB(n) {
                var v = n.value, x = "number" == typeof v ? 1073741824 | v : "bigint" == typeof v ? v | BigInt(1073741824) : v[0] + v[1] * BASE | 1073758208;
                return x & -x;
            }
            function integerLogarithm(value, base) {
                if (base.compareTo(value) <= 0) {
                    var tmp = integerLogarithm(value, base.square(base)), p = tmp.p, e = tmp.e, t = p.multiply(base);
                    return t.compareTo(value) <= 0 ? {
                        p: t,
                        e: 2 * e + 1
                    } : {
                        p: p,
                        e: 2 * e
                    };
                }
                return {
                    p: bigInt(1),
                    e: 0
                };
            }
            function max(a, b) {
                return a = parseValue(a), b = parseValue(b), a.greater(b) ? a : b;
            }
            function min(a, b) {
                return a = parseValue(a), b = parseValue(b), a.lesser(b) ? a : b;
            }
            function gcd(a, b) {
                if (a = parseValue(a).abs(), b = parseValue(b).abs(), a.equals(b)) return a;
                if (a.isZero()) return b;
                if (b.isZero()) return a;
                for (var d, t, c = Integer[1]; a.isEven() && b.isEven(); ) d = min(roughLOB(a), roughLOB(b)), 
                a = a.divide(d), b = b.divide(d), c = c.multiply(d);
                for (;a.isEven(); ) a = a.divide(roughLOB(a));
                do {
                    for (;b.isEven(); ) b = b.divide(roughLOB(b));
                    a.greater(b) && (t = b, b = a, a = t), b = b.subtract(a);
                } while (!b.isZero());
                return c.isUnit() ? a : a.multiply(c);
            }
            BigInteger.prototype.shiftLeft = function(v) {
                var n = parseValue(v).toJSNumber();
                if (!shift_isSmall(n)) throw new Error(String(n) + " is too large for shifting.");
                if (n < 0) return this.shiftRight(-n);
                var result = this;
                if (result.isZero()) return result;
                for (;n >= powers2Length; ) result = result.multiply(highestPower2), n -= powers2Length - 1;
                return result.multiply(powersOfTwo[n]);
            }, NativeBigInt.prototype.shiftLeft = SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft, 
            BigInteger.prototype.shiftRight = function(v) {
                var remQuo, n = parseValue(v).toJSNumber();
                if (!shift_isSmall(n)) throw new Error(String(n) + " is too large for shifting.");
                if (n < 0) return this.shiftLeft(-n);
                for (var result = this; n >= powers2Length; ) {
                    if (result.isZero() || result.isNegative() && result.isUnit()) return result;
                    result = (remQuo = divModAny(result, highestPower2))[1].isNegative() ? remQuo[0].prev() : remQuo[0], 
                    n -= powers2Length - 1;
                }
                return (remQuo = divModAny(result, powersOfTwo[n]))[1].isNegative() ? remQuo[0].prev() : remQuo[0];
            }, NativeBigInt.prototype.shiftRight = SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight, 
            BigInteger.prototype.not = function() {
                return this.negate().prev();
            }, NativeBigInt.prototype.not = SmallInteger.prototype.not = BigInteger.prototype.not, 
            BigInteger.prototype.and = function(n) {
                return bitwise(this, n, (function(a, b) {
                    return a & b;
                }));
            }, NativeBigInt.prototype.and = SmallInteger.prototype.and = BigInteger.prototype.and, 
            BigInteger.prototype.or = function(n) {
                return bitwise(this, n, (function(a, b) {
                    return a | b;
                }));
            }, NativeBigInt.prototype.or = SmallInteger.prototype.or = BigInteger.prototype.or, 
            BigInteger.prototype.xor = function(n) {
                return bitwise(this, n, (function(a, b) {
                    return a ^ b;
                }));
            }, NativeBigInt.prototype.xor = SmallInteger.prototype.xor = BigInteger.prototype.xor, 
            BigInteger.prototype.bitLength = function() {
                var n = this;
                return n.compareTo(bigInt(0)) < 0 && (n = n.negate().subtract(bigInt(1))), 0 === n.compareTo(bigInt(0)) ? bigInt(0) : bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
            }, NativeBigInt.prototype.bitLength = SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;
            var parseBase = function(text, base, alphabet, caseSensitive) {
                alphabet = alphabet || "0123456789abcdefghijklmnopqrstuvwxyz", text = String(text), 
                caseSensitive || (text = text.toLowerCase(), alphabet = alphabet.toLowerCase());
                var i, length = text.length, absBase = Math.abs(base), alphabetValues = {};
                for (i = 0; i < alphabet.length; i++) alphabetValues[alphabet[i]] = i;
                for (i = 0; i < length; i++) if ("-" !== (c = text[i]) && c in alphabetValues && alphabetValues[c] >= absBase) {
                    if ("1" === c && 1 === absBase) continue;
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                }
                base = parseValue(base);
                var digits = [], isNegative = "-" === text[0];
                for (i = isNegative ? 1 : 0; i < text.length; i++) {
                    var c;
                    if ((c = text[i]) in alphabetValues) digits.push(parseValue(alphabetValues[c])); else {
                        if ("<" !== c) throw new Error(c + " is not a valid character");
                        var start = i;
                        do {
                            i++;
                        } while (">" !== text[i] && i < text.length);
                        digits.push(parseValue(text.slice(start + 1, i)));
                    }
                }
                return parseBaseFromArray(digits, base, isNegative);
            };
            function parseBaseFromArray(digits, base, isNegative) {
                var i, val = Integer[0], pow = Integer[1];
                for (i = digits.length - 1; i >= 0; i--) val = val.add(digits[i].times(pow)), pow = pow.times(base);
                return isNegative ? val.negate() : val;
            }
            function toBase(n, base) {
                if ((base = bigInt(base)).isZero()) {
                    if (n.isZero()) return {
                        value: [ 0 ],
                        isNegative: !1
                    };
                    throw new Error("Cannot convert nonzero numbers to base 0.");
                }
                if (base.equals(-1)) {
                    if (n.isZero()) return {
                        value: [ 0 ],
                        isNegative: !1
                    };
                    if (n.isNegative()) return {
                        value: [].concat.apply([], Array.apply(null, Array(-n.toJSNumber())).map(Array.prototype.valueOf, [ 1, 0 ])),
                        isNegative: !1
                    };
                    var arr = Array.apply(null, Array(n.toJSNumber() - 1)).map(Array.prototype.valueOf, [ 0, 1 ]);
                    return arr.unshift([ 1 ]), {
                        value: [].concat.apply([], arr),
                        isNegative: !1
                    };
                }
                var neg = !1;
                if (n.isNegative() && base.isPositive() && (neg = !0, n = n.abs()), base.isUnit()) return n.isZero() ? {
                    value: [ 0 ],
                    isNegative: !1
                } : {
                    value: Array.apply(null, Array(n.toJSNumber())).map(Number.prototype.valueOf, 1),
                    isNegative: neg
                };
                for (var divmod, out = [], left = n; left.isNegative() || left.compareAbs(base) >= 0; ) {
                    divmod = left.divmod(base), left = divmod.quotient;
                    var digit = divmod.remainder;
                    digit.isNegative() && (digit = base.minus(digit).abs(), left = left.next()), out.push(digit.toJSNumber());
                }
                return out.push(left.toJSNumber()), {
                    value: out.reverse(),
                    isNegative: neg
                };
            }
            function toBaseString(n, base, alphabet) {
                var arr = toBase(n, base);
                return (arr.isNegative ? "-" : "") + arr.value.map((function(x) {
                    return (function(digit, alphabet) {
                        return digit < (alphabet = alphabet || "0123456789abcdefghijklmnopqrstuvwxyz").length ? alphabet[digit] : "<" + digit + ">";
                    })(x, alphabet);
                })).join("");
            }
            function parseStringValue(v) {
                if (isPrecise(+v)) {
                    var x = +v;
                    if (x === truncate(x)) return supportsNativeBigInt ? new NativeBigInt(BigInt(x)) : new SmallInteger(x);
                    throw new Error("Invalid integer: " + v);
                }
                var sign = "-" === v[0];
                sign && (v = v.slice(1));
                var split = v.split(/e/i);
                if (split.length > 2) throw new Error("Invalid integer: " + split.join("e"));
                if (2 === split.length) {
                    var exp = split[1];
                    if ("+" === exp[0] && (exp = exp.slice(1)), (exp = +exp) !== truncate(exp) || !isPrecise(exp)) throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
                    var text = split[0], decimalPlace = text.indexOf(".");
                    if (decimalPlace >= 0 && (exp -= text.length - decimalPlace - 1, text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1)), 
                    exp < 0) throw new Error("Cannot include negative exponent part for integers");
                    v = text += new Array(exp + 1).join("0");
                }
                if (!/^([0-9][0-9]*)$/.test(v)) throw new Error("Invalid integer: " + v);
                if (supportsNativeBigInt) return new NativeBigInt(BigInt(sign ? "-" + v : v));
                for (var r = [], max = v.length, min = max - 7; max > 0; ) r.push(+v.slice(min, max)), 
                (min -= 7) < 0 && (min = 0), max -= 7;
                return trim(r), new BigInteger(r, sign);
            }
            function parseValue(v) {
                return "number" == typeof v ? (function(v) {
                    if (supportsNativeBigInt) return new NativeBigInt(BigInt(v));
                    if (isPrecise(v)) {
                        if (v !== truncate(v)) throw new Error(v + " is not an integer.");
                        return new SmallInteger(v);
                    }
                    return parseStringValue(v.toString());
                })(v) : "string" == typeof v ? parseStringValue(v) : "bigint" == typeof v ? new NativeBigInt(v) : v;
            }
            BigInteger.prototype.toArray = function(radix) {
                return toBase(this, radix);
            }, SmallInteger.prototype.toArray = function(radix) {
                return toBase(this, radix);
            }, NativeBigInt.prototype.toArray = function(radix) {
                return toBase(this, radix);
            }, BigInteger.prototype.toString = function(radix, alphabet) {
                if (undefined === radix && (radix = 10), 10 !== radix || alphabet) return toBaseString(this, radix, alphabet);
                for (var digit, v = this.value, l = v.length, str = String(v[--l]); --l >= 0; ) digit = String(v[l]), 
                str += "0000000".slice(digit.length) + digit;
                return (this.sign ? "-" : "") + str;
            }, SmallInteger.prototype.toString = function(radix, alphabet) {
                return undefined === radix && (radix = 10), 10 != radix || alphabet ? toBaseString(this, radix, alphabet) : String(this.value);
            }, NativeBigInt.prototype.toString = SmallInteger.prototype.toString, NativeBigInt.prototype.toJSON = BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function() {
                return this.toString();
            }, BigInteger.prototype.valueOf = function() {
                return parseInt(this.toString(), 10);
            }, BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf, SmallInteger.prototype.valueOf = function() {
                return this.value;
            }, SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf, NativeBigInt.prototype.valueOf = NativeBigInt.prototype.toJSNumber = function() {
                return parseInt(this.toString(), 10);
            };
            for (var i = 0; i < 1e3; i++) Integer[i] = parseValue(i), i > 0 && (Integer[-i] = parseValue(-i));
            return Integer.one = Integer[1], Integer.zero = Integer[0], Integer.minusOne = Integer[-1], 
            Integer.max = max, Integer.min = min, Integer.gcd = gcd, Integer.lcm = function(a, b) {
                return a = parseValue(a).abs(), b = parseValue(b).abs(), a.divide(gcd(a, b)).multiply(b);
            }, Integer.isInstance = function(x) {
                return x instanceof BigInteger || x instanceof SmallInteger || x instanceof NativeBigInt;
            }, Integer.randBetween = function(a, b, rng) {
                a = parseValue(a), b = parseValue(b);
                var usedRNG = rng || Math.random, low = min(a, b), range = max(a, b).subtract(low).add(1);
                if (range.isSmall) return low.add(Math.floor(usedRNG() * range));
                for (var digits = toBase(range, BASE).value, result = [], restricted = !0, i = 0; i < digits.length; i++) {
                    var top = restricted ? digits[i] + (i + 1 < digits.length ? digits[i + 1] / BASE : 0) : BASE, digit = truncate(usedRNG() * top);
                    result.push(digit), digit < digits[i] && (restricted = !1);
                }
                return low.add(Integer.fromArray(result, BASE, !1));
            }, Integer.fromArray = function(digits, base, isNegative) {
                return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
            }, Integer;
        })();
        module.hasOwnProperty("exports") && (module.exports = bigInt), void 0 === (__WEBPACK_AMD_DEFINE_RESULT__ = function() {
            return bigInt;
        }.call(exports, __webpack_require__, exports, module)) || (module.exports = __WEBPACK_AMD_DEFINE_RESULT__);
    }).call(this, __webpack_require__(62)(module));
}
