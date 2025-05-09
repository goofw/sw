function(module, exports, __webpack_require__) {
    (function(module) {
        !(function(module, exports) {
            "use strict";
            function assert(val, msg) {
                if (!val) throw new Error(msg || "Assertion failed");
            }
            function inherits(ctor, superCtor) {
                ctor.super_ = superCtor;
                var TempCtor = function() {};
                TempCtor.prototype = superCtor.prototype, ctor.prototype = new TempCtor, ctor.prototype.constructor = ctor;
            }
            function BN(number, base, endian) {
                if (BN.isBN(number)) return number;
                this.negative = 0, this.words = null, this.length = 0, this.red = null, null !== number && ("le" !== base && "be" !== base || (endian = base, 
                base = 10), this._init(number || 0, base || 10, endian || "be"));
            }
            var Buffer;
            "object" == typeof module ? module.exports = BN : exports.BN = BN, BN.BN = BN, BN.wordSize = 26;
            try {
                Buffer = __webpack_require__(10).Buffer;
            } catch (e) {}
            function parseHex(str, start, end) {
                for (var r = 0, len = Math.min(str.length, end), i = start; i < len; i++) {
                    var c = str.charCodeAt(i) - 48;
                    r <<= 4, r |= c >= 49 && c <= 54 ? c - 49 + 10 : c >= 17 && c <= 22 ? c - 17 + 10 : 15 & c;
                }
                return r;
            }
            function parseBase(str, start, end, mul) {
                for (var r = 0, len = Math.min(str.length, end), i = start; i < len; i++) {
                    var c = str.charCodeAt(i) - 48;
                    r *= mul, r += c >= 49 ? c - 49 + 10 : c >= 17 ? c - 17 + 10 : c;
                }
                return r;
            }
            BN.isBN = function(num) {
                return num instanceof BN || null !== num && "object" == typeof num && num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
            }, BN.max = function(left, right) {
                return left.cmp(right) > 0 ? left : right;
            }, BN.min = function(left, right) {
                return left.cmp(right) < 0 ? left : right;
            }, BN.prototype._init = function(number, base, endian) {
                if ("number" == typeof number) return this._initNumber(number, base, endian);
                if ("object" == typeof number) return this._initArray(number, base, endian);
                "hex" === base && (base = 16), assert(base === (0 | base) && base >= 2 && base <= 36);
                var start = 0;
                "-" === (number = number.toString().replace(/\s+/g, ""))[0] && start++, 16 === base ? this._parseHex(number, start) : this._parseBase(number, base, start), 
                "-" === number[0] && (this.negative = 1), this.strip(), "le" === endian && this._initArray(this.toArray(), base, endian);
            }, BN.prototype._initNumber = function(number, base, endian) {
                number < 0 && (this.negative = 1, number = -number), number < 67108864 ? (this.words = [ 67108863 & number ], 
                this.length = 1) : number < 4503599627370496 ? (this.words = [ 67108863 & number, number / 67108864 & 67108863 ], 
                this.length = 2) : (assert(number < 9007199254740992), this.words = [ 67108863 & number, number / 67108864 & 67108863, 1 ], 
                this.length = 3), "le" === endian && this._initArray(this.toArray(), base, endian);
            }, BN.prototype._initArray = function(number, base, endian) {
                if (assert("number" == typeof number.length), number.length <= 0) return this.words = [ 0 ], 
                this.length = 1, this;
                this.length = Math.ceil(number.length / 3), this.words = new Array(this.length);
                for (var i = 0; i < this.length; i++) this.words[i] = 0;
                var j, w, off = 0;
                if ("be" === endian) for (i = number.length - 1, j = 0; i >= 0; i -= 3) w = number[i] | number[i - 1] << 8 | number[i - 2] << 16, 
                this.words[j] |= w << off & 67108863, this.words[j + 1] = w >>> 26 - off & 67108863, 
                (off += 24) >= 26 && (off -= 26, j++); else if ("le" === endian) for (i = 0, j = 0; i < number.length; i += 3) w = number[i] | number[i + 1] << 8 | number[i + 2] << 16, 
                this.words[j] |= w << off & 67108863, this.words[j + 1] = w >>> 26 - off & 67108863, 
                (off += 24) >= 26 && (off -= 26, j++);
                return this.strip();
            }, BN.prototype._parseHex = function(number, start) {
                this.length = Math.ceil((number.length - start) / 6), this.words = new Array(this.length);
                for (var i = 0; i < this.length; i++) this.words[i] = 0;
                var j, w, off = 0;
                for (i = number.length - 6, j = 0; i >= start; i -= 6) w = parseHex(number, i, i + 6), 
                this.words[j] |= w << off & 67108863, this.words[j + 1] |= w >>> 26 - off & 4194303, 
                (off += 24) >= 26 && (off -= 26, j++);
                i + 6 !== start && (w = parseHex(number, start, i + 6), this.words[j] |= w << off & 67108863, 
                this.words[j + 1] |= w >>> 26 - off & 4194303), this.strip();
            }, BN.prototype._parseBase = function(number, base, start) {
                this.words = [ 0 ], this.length = 1;
                for (var limbLen = 0, limbPow = 1; limbPow <= 67108863; limbPow *= base) limbLen++;
                limbLen--, limbPow = limbPow / base | 0;
                for (var total = number.length - start, mod = total % limbLen, end = Math.min(total, total - mod) + start, word = 0, i = start; i < end; i += limbLen) word = parseBase(number, i, i + limbLen, base), 
                this.imuln(limbPow), this.words[0] + word < 67108864 ? this.words[0] += word : this._iaddn(word);
                if (0 !== mod) {
                    var pow = 1;
                    for (word = parseBase(number, i, number.length, base), i = 0; i < mod; i++) pow *= base;
                    this.imuln(pow), this.words[0] + word < 67108864 ? this.words[0] += word : this._iaddn(word);
                }
            }, BN.prototype.copy = function(dest) {
                dest.words = new Array(this.length);
                for (var i = 0; i < this.length; i++) dest.words[i] = this.words[i];
                dest.length = this.length, dest.negative = this.negative, dest.red = this.red;
            }, BN.prototype.clone = function() {
                var r = new BN(null);
                return this.copy(r), r;
            }, BN.prototype._expand = function(size) {
                for (;this.length < size; ) this.words[this.length++] = 0;
                return this;
            }, BN.prototype.strip = function() {
                for (;this.length > 1 && 0 === this.words[this.length - 1]; ) this.length--;
                return this._normSign();
            }, BN.prototype._normSign = function() {
                return 1 === this.length && 0 === this.words[0] && (this.negative = 0), this;
            }, BN.prototype.inspect = function() {
                return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
            };
            var zeros = [ "", "0", "00", "000", "0000", "00000", "000000", "0000000", "00000000", "000000000", "0000000000", "00000000000", "000000000000", "0000000000000", "00000000000000", "000000000000000", "0000000000000000", "00000000000000000", "000000000000000000", "0000000000000000000", "00000000000000000000", "000000000000000000000", "0000000000000000000000", "00000000000000000000000", "000000000000000000000000", "0000000000000000000000000" ], groupSizes = [ 0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5 ], groupBases = [ 0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216, 43046721, 1e7, 19487171, 35831808, 62748517, 7529536, 11390625, 16777216, 24137569, 34012224, 47045881, 64e6, 4084101, 5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149, 243e5, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176 ];
            function smallMulTo(self, num, out) {
                out.negative = num.negative ^ self.negative;
                var len = self.length + num.length | 0;
                out.length = len, len = len - 1 | 0;
                var a = 0 | self.words[0], b = 0 | num.words[0], r = a * b, lo = 67108863 & r, carry = r / 67108864 | 0;
                out.words[0] = lo;
                for (var k = 1; k < len; k++) {
                    for (var ncarry = carry >>> 26, rword = 67108863 & carry, maxJ = Math.min(k, num.length - 1), j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
                        var i = k - j | 0;
                        ncarry += (r = (a = 0 | self.words[i]) * (b = 0 | num.words[j]) + rword) / 67108864 | 0, 
                        rword = 67108863 & r;
                    }
                    out.words[k] = 0 | rword, carry = 0 | ncarry;
                }
                return 0 !== carry ? out.words[k] = 0 | carry : out.length--, out.strip();
            }
            BN.prototype.toString = function(base, padding) {
                var out;
                if (padding = 0 | padding || 1, 16 === (base = base || 10) || "hex" === base) {
                    out = "";
                    for (var off = 0, carry = 0, i = 0; i < this.length; i++) {
                        var w = this.words[i], word = (16777215 & (w << off | carry)).toString(16);
                        out = 0 != (carry = w >>> 24 - off & 16777215) || i !== this.length - 1 ? zeros[6 - word.length] + word + out : word + out, 
                        (off += 2) >= 26 && (off -= 26, i--);
                    }
                    for (0 !== carry && (out = carry.toString(16) + out); out.length % padding != 0; ) out = "0" + out;
                    return 0 !== this.negative && (out = "-" + out), out;
                }
                if (base === (0 | base) && base >= 2 && base <= 36) {
                    var groupSize = groupSizes[base], groupBase = groupBases[base];
                    out = "";
                    var c = this.clone();
                    for (c.negative = 0; !c.isZero(); ) {
                        var r = c.modn(groupBase).toString(base);
                        out = (c = c.idivn(groupBase)).isZero() ? r + out : zeros[groupSize - r.length] + r + out;
                    }
                    for (this.isZero() && (out = "0" + out); out.length % padding != 0; ) out = "0" + out;
                    return 0 !== this.negative && (out = "-" + out), out;
                }
                assert(!1, "Base should be between 2 and 36");
            }, BN.prototype.toNumber = function() {
                var ret = this.words[0];
                return 2 === this.length ? ret += 67108864 * this.words[1] : 3 === this.length && 1 === this.words[2] ? ret += 4503599627370496 + 67108864 * this.words[1] : this.length > 2 && assert(!1, "Number can only safely store up to 53 bits"), 
                0 !== this.negative ? -ret : ret;
            }, BN.prototype.toJSON = function() {
                return this.toString(16);
            }, BN.prototype.toBuffer = function(endian, length) {
                return assert(void 0 !== Buffer), this.toArrayLike(Buffer, endian, length);
            }, BN.prototype.toArray = function(endian, length) {
                return this.toArrayLike(Array, endian, length);
            }, BN.prototype.toArrayLike = function(ArrayType, endian, length) {
                var byteLength = this.byteLength(), reqLength = length || Math.max(1, byteLength);
                assert(byteLength <= reqLength, "byte array longer than desired length"), assert(reqLength > 0, "Requested array length <= 0"), 
                this.strip();
                var b, i, littleEndian = "le" === endian, res = new ArrayType(reqLength), q = this.clone();
                if (littleEndian) {
                    for (i = 0; !q.isZero(); i++) b = q.andln(255), q.iushrn(8), res[i] = b;
                    for (;i < reqLength; i++) res[i] = 0;
                } else {
                    for (i = 0; i < reqLength - byteLength; i++) res[i] = 0;
                    for (i = 0; !q.isZero(); i++) b = q.andln(255), q.iushrn(8), res[reqLength - i - 1] = b;
                }
                return res;
            }, Math.clz32 ? BN.prototype._countBits = function(w) {
                return 32 - Math.clz32(w);
            } : BN.prototype._countBits = function(w) {
                var t = w, r = 0;
                return t >= 4096 && (r += 13, t >>>= 13), t >= 64 && (r += 7, t >>>= 7), t >= 8 && (r += 4, 
                t >>>= 4), t >= 2 && (r += 2, t >>>= 2), r + t;
            }, BN.prototype._zeroBits = function(w) {
                if (0 === w) return 26;
                var t = w, r = 0;
                return 0 == (8191 & t) && (r += 13, t >>>= 13), 0 == (127 & t) && (r += 7, t >>>= 7), 
                0 == (15 & t) && (r += 4, t >>>= 4), 0 == (3 & t) && (r += 2, t >>>= 2), 0 == (1 & t) && r++, 
                r;
            }, BN.prototype.bitLength = function() {
                var w = this.words[this.length - 1], hi = this._countBits(w);
                return 26 * (this.length - 1) + hi;
            }, BN.prototype.zeroBits = function() {
                if (this.isZero()) return 0;
                for (var r = 0, i = 0; i < this.length; i++) {
                    var b = this._zeroBits(this.words[i]);
                    if (r += b, 26 !== b) break;
                }
                return r;
            }, BN.prototype.byteLength = function() {
                return Math.ceil(this.bitLength() / 8);
            }, BN.prototype.toTwos = function(width) {
                return 0 !== this.negative ? this.abs().inotn(width).iaddn(1) : this.clone();
            }, BN.prototype.fromTwos = function(width) {
                return this.testn(width - 1) ? this.notn(width).iaddn(1).ineg() : this.clone();
            }, BN.prototype.isNeg = function() {
                return 0 !== this.negative;
            }, BN.prototype.neg = function() {
                return this.clone().ineg();
            }, BN.prototype.ineg = function() {
                return this.isZero() || (this.negative ^= 1), this;
            }, BN.prototype.iuor = function(num) {
                for (;this.length < num.length; ) this.words[this.length++] = 0;
                for (var i = 0; i < num.length; i++) this.words[i] = this.words[i] | num.words[i];
                return this.strip();
            }, BN.prototype.ior = function(num) {
                return assert(0 == (this.negative | num.negative)), this.iuor(num);
            }, BN.prototype.or = function(num) {
                return this.length > num.length ? this.clone().ior(num) : num.clone().ior(this);
            }, BN.prototype.uor = function(num) {
                return this.length > num.length ? this.clone().iuor(num) : num.clone().iuor(this);
            }, BN.prototype.iuand = function(num) {
                var b;
                b = this.length > num.length ? num : this;
                for (var i = 0; i < b.length; i++) this.words[i] = this.words[i] & num.words[i];
                return this.length = b.length, this.strip();
            }, BN.prototype.iand = function(num) {
                return assert(0 == (this.negative | num.negative)), this.iuand(num);
            }, BN.prototype.and = function(num) {
                return this.length > num.length ? this.clone().iand(num) : num.clone().iand(this);
            }, BN.prototype.uand = function(num) {
                return this.length > num.length ? this.clone().iuand(num) : num.clone().iuand(this);
            }, BN.prototype.iuxor = function(num) {
                var a, b;
                this.length > num.length ? (a = this, b = num) : (a = num, b = this);
                for (var i = 0; i < b.length; i++) this.words[i] = a.words[i] ^ b.words[i];
                if (this !== a) for (;i < a.length; i++) this.words[i] = a.words[i];
                return this.length = a.length, this.strip();
            }, BN.prototype.ixor = function(num) {
                return assert(0 == (this.negative | num.negative)), this.iuxor(num);
            }, BN.prototype.xor = function(num) {
                return this.length > num.length ? this.clone().ixor(num) : num.clone().ixor(this);
            }, BN.prototype.uxor = function(num) {
                return this.length > num.length ? this.clone().iuxor(num) : num.clone().iuxor(this);
            }, BN.prototype.inotn = function(width) {
                assert("number" == typeof width && width >= 0);
                var bytesNeeded = 0 | Math.ceil(width / 26), bitsLeft = width % 26;
                this._expand(bytesNeeded), bitsLeft > 0 && bytesNeeded--;
                for (var i = 0; i < bytesNeeded; i++) this.words[i] = 67108863 & ~this.words[i];
                return bitsLeft > 0 && (this.words[i] = ~this.words[i] & 67108863 >> 26 - bitsLeft), 
                this.strip();
            }, BN.prototype.notn = function(width) {
                return this.clone().inotn(width);
            }, BN.prototype.setn = function(bit, val) {
                assert("number" == typeof bit && bit >= 0);
                var off = bit / 26 | 0, wbit = bit % 26;
                return this._expand(off + 1), this.words[off] = val ? this.words[off] | 1 << wbit : this.words[off] & ~(1 << wbit), 
                this.strip();
            }, BN.prototype.iadd = function(num) {
                var r, a, b;
                if (0 !== this.negative && 0 === num.negative) return this.negative = 0, r = this.isub(num), 
                this.negative ^= 1, this._normSign();
                if (0 === this.negative && 0 !== num.negative) return num.negative = 0, r = this.isub(num), 
                num.negative = 1, r._normSign();
                this.length > num.length ? (a = this, b = num) : (a = num, b = this);
                for (var carry = 0, i = 0; i < b.length; i++) r = (0 | a.words[i]) + (0 | b.words[i]) + carry, 
                this.words[i] = 67108863 & r, carry = r >>> 26;
                for (;0 !== carry && i < a.length; i++) r = (0 | a.words[i]) + carry, this.words[i] = 67108863 & r, 
                carry = r >>> 26;
                if (this.length = a.length, 0 !== carry) this.words[this.length] = carry, this.length++; else if (a !== this) for (;i < a.length; i++) this.words[i] = a.words[i];
                return this;
            }, BN.prototype.add = function(num) {
                var res;
                return 0 !== num.negative && 0 === this.negative ? (num.negative = 0, res = this.sub(num), 
                num.negative ^= 1, res) : 0 === num.negative && 0 !== this.negative ? (this.negative = 0, 
                res = num.sub(this), this.negative = 1, res) : this.length > num.length ? this.clone().iadd(num) : num.clone().iadd(this);
            }, BN.prototype.isub = function(num) {
                if (0 !== num.negative) {
                    num.negative = 0;
                    var r = this.iadd(num);
                    return num.negative = 1, r._normSign();
                }
                if (0 !== this.negative) return this.negative = 0, this.iadd(num), this.negative = 1, 
                this._normSign();
                var a, b, cmp = this.cmp(num);
                if (0 === cmp) return this.negative = 0, this.length = 1, this.words[0] = 0, this;
                cmp > 0 ? (a = this, b = num) : (a = num, b = this);
                for (var carry = 0, i = 0; i < b.length; i++) carry = (r = (0 | a.words[i]) - (0 | b.words[i]) + carry) >> 26, 
                this.words[i] = 67108863 & r;
                for (;0 !== carry && i < a.length; i++) carry = (r = (0 | a.words[i]) + carry) >> 26, 
                this.words[i] = 67108863 & r;
                if (0 === carry && i < a.length && a !== this) for (;i < a.length; i++) this.words[i] = a.words[i];
                return this.length = Math.max(this.length, i), a !== this && (this.negative = 1), 
                this.strip();
            }, BN.prototype.sub = function(num) {
                return this.clone().isub(num);
            };
            var comb10MulTo = function(self, num, out) {
                var lo, mid, hi, a = self.words, b = num.words, o = out.words, c = 0, a0 = 0 | a[0], al0 = 8191 & a0, ah0 = a0 >>> 13, a1 = 0 | a[1], al1 = 8191 & a1, ah1 = a1 >>> 13, a2 = 0 | a[2], al2 = 8191 & a2, ah2 = a2 >>> 13, a3 = 0 | a[3], al3 = 8191 & a3, ah3 = a3 >>> 13, a4 = 0 | a[4], al4 = 8191 & a4, ah4 = a4 >>> 13, a5 = 0 | a[5], al5 = 8191 & a5, ah5 = a5 >>> 13, a6 = 0 | a[6], al6 = 8191 & a6, ah6 = a6 >>> 13, a7 = 0 | a[7], al7 = 8191 & a7, ah7 = a7 >>> 13, a8 = 0 | a[8], al8 = 8191 & a8, ah8 = a8 >>> 13, a9 = 0 | a[9], al9 = 8191 & a9, ah9 = a9 >>> 13, b0 = 0 | b[0], bl0 = 8191 & b0, bh0 = b0 >>> 13, b1 = 0 | b[1], bl1 = 8191 & b1, bh1 = b1 >>> 13, b2 = 0 | b[2], bl2 = 8191 & b2, bh2 = b2 >>> 13, b3 = 0 | b[3], bl3 = 8191 & b3, bh3 = b3 >>> 13, b4 = 0 | b[4], bl4 = 8191 & b4, bh4 = b4 >>> 13, b5 = 0 | b[5], bl5 = 8191 & b5, bh5 = b5 >>> 13, b6 = 0 | b[6], bl6 = 8191 & b6, bh6 = b6 >>> 13, b7 = 0 | b[7], bl7 = 8191 & b7, bh7 = b7 >>> 13, b8 = 0 | b[8], bl8 = 8191 & b8, bh8 = b8 >>> 13, b9 = 0 | b[9], bl9 = 8191 & b9, bh9 = b9 >>> 13;
                out.negative = self.negative ^ num.negative, out.length = 19;
                var w0 = (c + (lo = Math.imul(al0, bl0)) | 0) + ((8191 & (mid = (mid = Math.imul(al0, bh0)) + Math.imul(ah0, bl0) | 0)) << 13) | 0;
                c = ((hi = Math.imul(ah0, bh0)) + (mid >>> 13) | 0) + (w0 >>> 26) | 0, w0 &= 67108863, 
                lo = Math.imul(al1, bl0), mid = (mid = Math.imul(al1, bh0)) + Math.imul(ah1, bl0) | 0, 
                hi = Math.imul(ah1, bh0);
                var w1 = (c + (lo = lo + Math.imul(al0, bl1) | 0) | 0) + ((8191 & (mid = (mid = mid + Math.imul(al0, bh1) | 0) + Math.imul(ah0, bl1) | 0)) << 13) | 0;
                c = ((hi = hi + Math.imul(ah0, bh1) | 0) + (mid >>> 13) | 0) + (w1 >>> 26) | 0, 
                w1 &= 67108863, lo = Math.imul(al2, bl0), mid = (mid = Math.imul(al2, bh0)) + Math.imul(ah2, bl0) | 0, 
                hi = Math.imul(ah2, bh0), lo = lo + Math.imul(al1, bl1) | 0, mid = (mid = mid + Math.imul(al1, bh1) | 0) + Math.imul(ah1, bl1) | 0, 
                hi = hi + Math.imul(ah1, bh1) | 0;
                var w2 = (c + (lo = lo + Math.imul(al0, bl2) | 0) | 0) + ((8191 & (mid = (mid = mid + Math.imul(al0, bh2) | 0) + Math.imul(ah0, bl2) | 0)) << 13) | 0;
                c = ((hi = hi + Math.imul(ah0, bh2) | 0) + (mid >>> 13) | 0) + (w2 >>> 26) | 0, 
                w2 &= 67108863, lo = Math.imul(al3, bl0), mid = (mid = Math.imul(al3, bh0)) + Math.imul(ah3, bl0) | 0, 
                hi = Math.imul(ah3, bh0), lo = lo + Math.imul(al2, bl1) | 0, mid = (mid = mid + Math.imul(al2, bh1) | 0) + Math.imul(ah2, bl1) | 0, 
                hi = hi + Math.imul(ah2, bh1) | 0, lo = lo + Math.imul(al1, bl2) | 0, mid = (mid = mid + Math.imul(al1, bh2) | 0) + Math.imul(ah1, bl2) | 0, 
                hi = hi + Math.imul(ah1, bh2) | 0;
                var w3 = (c + (lo = lo + Math.imul(al0, bl3) | 0) | 0) + ((8191 & (mid = (mid = mid + Math.imul(al0, bh3) | 0) + Math.imul(ah0, bl3) | 0)) << 13) | 0;
                c = ((hi = hi + Math.imul(ah0, bh3) | 0) + (mid >>> 13) | 0) + (w3 >>> 26) | 0, 
                w3 &= 67108863, lo = Math.imul(al4, bl0), mid = (mid = Math.imul(al4, bh0)) + Math.imul(ah4, bl0) | 0, 
                hi = Math.imul(ah4, bh0), lo = lo + Math.imul(al3, bl1) | 0, mid = (mid = mid + Math.imul(al3, bh1) | 0) + Math.imul(ah3, bl1) | 0, 
                hi = hi + Math.imul(ah3, bh1) | 0, lo = lo + Math.imul(al2, bl2) | 0, mid = (mid = mid + Math.imul(al2, bh2) | 0) + Math.imul(ah2, bl2) | 0, 
                hi = hi + Math.imul(ah2, bh2) | 0, lo = lo + Math.imul(al1, bl3) | 0, mid = (mid = mid + Math.imul(al1, bh3) | 0) + Math.imul(ah1, bl3) | 0, 
                hi = hi + Math.imul(ah1, bh3) | 0;
                var w4 = (c + (lo = lo + Math.imul(al0, bl4) | 0) | 0) + ((8191 & (mid = (mid = mid + Math.imul(al0, bh4) | 0) + Math.imul(ah0, bl4) | 0)) << 13) | 0;
                c = ((hi = hi + Math.imul(ah0, bh4) | 0) + (mid >>> 13) | 0) + (w4 >>> 26) | 0, 
                w4 &= 67108863, lo = Math.imul(al5, bl0), mid = (mid = Math.imul(al5, bh0)) + Math.imul(ah5, bl0) | 0, 
                hi = Math.imul(ah5, bh0), lo = lo + Math.imul(al4, bl1) | 0, mid = (mid = mid + Math.imul(al4, bh1) | 0) + Math.imul(ah4, bl1) | 0, 
                hi = hi + Math.imul(ah4, bh1) | 0, lo = lo + Math.imul(al3, bl2) | 0, mid = (mid = mid + Math.imul(al3, bh2) | 0) + Math.imul(ah3, bl2) | 0, 
                hi = hi + Math.imul(ah3, bh2) | 0, lo = lo + Math.imul(al2, bl3) | 0, mid = (mid = mid + Math.imul(al2, bh3) | 0) + Math.imul(ah2, bl3) | 0, 
                hi = hi + Math.imul(ah2, bh3) | 0, lo = lo + Math.imul(al1, bl4) | 0, mid = (mid = mid + Math.imul(al1, bh4) | 0) + Math.imul(ah1, bl4) | 0, 
                hi = hi + Math.imul(ah1, bh4) | 0;
                var w5 = (c + (lo = lo + Math.imul(al0, bl5) | 0) | 0) + ((8191 & (mid = (mid = mid + Math.imul(al0, bh5) | 0) + Math.imul(ah0, bl5) | 0)) << 13) | 0;
                c = ((hi = hi + Math.imul(ah0, bh5) | 0) + (mid >>> 13) | 0) + (w5 >>> 26) | 0, 
                w5 &= 67108863, lo = Math.imul(al6, bl0), mid = (mid = Math.imul(al6, bh0)) + Math.imul(ah6, bl0) | 0, 
                hi = Math.imul(ah6, bh0), lo = lo + Math.imul(al5, bl1) | 0, mid = (mid = mid + Math.imul(al5, bh1) | 0) + Math.imul(ah5, bl1) | 0, 
                hi = hi + Math.imul(ah5, bh1) | 0, lo = lo + Math.imul(al4, bl2) | 0, mid = (mid = mid + Math.imul(al4, bh2) | 0) + Math.imul(ah4, bl2) | 0, 
                hi = hi + Math.imul(ah4, bh2) | 0, lo = lo + Math.imul(al3, bl3) | 0, mid = (mid = mid + Math.imul(al3, bh3) | 0) + Math.imul(ah3, bl3) | 0, 
                hi = hi + Math.imul(ah3, bh3) | 0, lo = lo + Math.imul(al2, bl4) | 0, mid = (mid = mid + Math.imul(al2, bh4) | 0) + Math.imul(ah2, bl4) | 0, 
                hi = hi + Math.imul(ah2, bh4) | 0, lo = lo + Math.imul(al1, bl5) | 0, mid = (mid = mid + Math.imul(al1, bh5) | 0) + Math.imul(ah1, bl5) | 0, 
                hi = hi + Math.imul(ah1, bh5) | 0;
                var w6 = (c + (lo = lo + Math.imul(al0, bl6) | 0) | 0) + ((8191 & (mid = (mid = mid + Math.imul(al0, bh6) | 0) + Math.imul(ah0, bl6) | 0)) << 13) | 0;
                c = ((hi = hi + Math.imul(ah0, bh6) | 0) + (mid >>> 13) | 0) + (w6 >>> 26) | 0, 
                w6 &= 67108863, lo = Math.imul(al7, bl0), mid = (mid = Math.imul(al7, bh0)) + Math.imul(ah7, bl0) | 0, 
                hi = Math.imul(ah7, bh0), lo = lo + Math.imul(al6, bl1) | 0, mid = (mid = mid + Math.imul(al6, bh1) | 0) + Math.imul(ah6, bl1) | 0, 
                hi = hi + Math.imul(ah6, bh1) | 0, lo = lo + Math.imul(al5, bl2) | 0, mid = (mid = mid + Math.imul(al5, bh2) | 0) + Math.imul(ah5, bl2) | 0, 
                hi = hi + Math.imul(ah5, bh2) | 0, lo = lo + Math.imul(al4, bl3) | 0, mid = (mid = mid + Math.imul(al4, bh3) | 0) + Math.imul(ah4, bl3) | 0, 
                hi = hi + Math.imul(ah4, bh3) | 0, lo = lo + Math.imul(al3, bl4) | 0, mid = (mid = mid + Math.imul(al3, bh4) | 0) + Math.imul(ah3, bl4) | 0, 
                hi = hi + Math.imul(ah3, bh4) | 0, lo = lo + Math.imul(al2, bl5) | 0, mid = (mid = mid + Math.imul(al2, bh5) | 0) + Math.imul(ah2, bl5) | 0, 
                hi = hi + Math.imul(ah2, bh5) | 0, lo = lo + Math.imul(al1, bl6) | 0, mid = (mid = mid + Math.imul(al1, bh6) | 0) + Math.imul(ah1, bl6) | 0, 
                hi = hi + Math.imul(ah1, bh6) | 0;
                var w7 = (c + (lo = lo + Math.imul(al0, bl7) | 0) | 0) + ((8191 & (mid = (mid = mid + Math.imul(al0, bh7) | 0) + Math.imul(ah0, bl7) | 0)) << 13) | 0;
                c = ((hi = hi + Math.imul(ah0, bh7) | 0) + (mid >>> 13) | 0) + (w7 >>> 26) | 0, 
                w7 &= 67108863, lo = Math.imul(al8, bl0), mid = (mid = Math.imul(al8, bh0)) + Math.imul(ah8, bl0) | 0, 
                hi = Math.imul(ah8, bh0), lo = lo + Math.imul(al7, bl1) | 0, mid = (mid = mid + Math.imul(al7, bh1) | 0) + Math.imul(ah7, bl1) | 0, 
                hi = hi + Math.imul(ah7, bh1) | 0, lo = lo + Math.imul(al6, bl2) | 0, mid = (mid = mid + Math.imul(al6, bh2) | 0) + Math.imul(ah6, bl2) | 0, 
                hi = hi + Math.imul(ah6, bh2) | 0, lo = lo + Math.imul(al5, bl3) | 0, mid = (mid = mid + Math.imul(al5, bh3) | 0) + Math.imul(ah5, bl3) | 0, 
                hi = hi + Math.imul(ah5, bh3) | 0, lo = lo + Math.imul(al4, bl4) | 0, mid = (mid = mid + Math.imul(al4, bh4) | 0) + Math.imul(ah4, bl4) | 0, 
                hi = hi + Math.imul(ah4, bh4) | 0, lo = lo + Math.imul(al3, bl5) | 0, mid = (mid = mid + Math.imul(al3, bh5) | 0) + Math.imul(ah3, bl5) | 0, 
                hi = hi + Math.imul(ah3, bh5) | 0, lo = lo + Math.imul(al2, bl6) | 0, mid = (mid = mid + Math.imul(al2, bh6) | 0) + Math.imul(ah2, bl6) | 0, 
                hi = hi + Math.imul(ah2, bh6) | 0, lo = lo + Math.imul(al1, bl7) | 0, mid = (mid = mid + Math.imul(al1, bh7) | 0) + Math.imul(ah1, bl7) | 0, 
                hi = hi + Math.imul(ah1, bh7) | 0;
                var w8 = (c + (lo = lo + Math.imul(al0, bl8) | 0) | 0) + ((8191 & (mid = (mid = mid + Math.imul(al0, bh8) | 0) + Math.imul(ah0, bl8) | 0)) << 13) | 0;
                c = ((hi = hi + Math.imul(ah0, bh8) | 0) + (mid >>> 13) | 0) + (w8 >>> 26) | 0, 
                w8 &= 67108863, lo = Math.imul(al9, bl0), mid = (mid = Math.imul(al9, bh0)) + Math.imul(ah9, bl0) | 0, 
                hi = Math.imul(ah9, bh0), lo = lo + Math.imul(al8, bl1) | 0, mid = (mid = mid + Math.imul(al8, bh1) | 0) + Math.imul(ah8, bl1) | 0, 
                hi = hi + Math.imul(ah8, bh1) | 0, lo = lo + Math.imul(al7, bl2) | 0, mid = (mid = mid + Math.imul(al7, bh2) | 0) + Math.imul(ah7, bl2) | 0, 
                hi = hi + Math.imul(ah7, bh2) | 0, lo = lo + Math.imul(al6, bl3) | 0, mid = (mid = mid + Math.imul(al6, bh3) | 0) + Math.imul(ah6, bl3) | 0, 
                hi = hi + Math.imul(ah6, bh3) | 0, lo = lo + Math.imul(al5, bl4) | 0, mid = (mid = mid + Math.imul(al5, bh4) | 0) + Math.imul(ah5, bl4) | 0, 
                hi = hi + Math.imul(ah5, bh4) | 0, lo = lo + Math.imul(al4, bl5) | 0, mid = (mid = mid + Math.imul(al4, bh5) | 0) + Math.imul(ah4, bl5) | 0, 
                hi = hi + Math.imul(ah4, bh5) | 0, lo = lo + Math.imul(al3, bl6) | 0, mid = (mid = mid + Math.imul(al3, bh6) | 0) + Math.imul(ah3, bl6) | 0, 
                hi = hi + Math.imul(ah3, bh6) | 0, lo = lo + Math.imul(al2, bl7) | 0, mid = (mid = mid + Math.imul(al2, bh7) | 0) + Math.imul(ah2, bl7) | 0, 
                hi = hi + Math.imul(ah2, bh7) | 0, lo = lo + Math.imul(al1, bl8) | 0, mid = (mid = mid + Math.imul(al1, bh8) | 0) + Math.imul(ah1, bl8) | 0, 
                hi = hi + Math.imul(ah1, bh8) | 0;
                var w9 = (c + (lo = lo + Math.imul(al0, bl9) | 0) | 0) + ((8191 & (mid = (mid = mid + Math.imul(al0, bh9) | 0) + Math.imul(ah0, bl9) | 0)) << 13) | 0;
                c = ((hi = hi + Math.imul(ah0, bh9) | 0) + (mid >>> 13) | 0) + (w9 >>> 26) | 0, 
                w9 &= 67108863, lo = Math.imul(al9, bl1), mid = (mid = Math.imul(al9, bh1)) + Math.imul(ah9, bl1) | 0, 
                hi = Math.imul(ah9, bh1), lo = lo + Math.imul(al8, bl2) | 0, mid = (mid = mid + Math.imul(al8, bh2) | 0) + Math.imul(ah8, bl2) | 0, 
                hi = hi + Math.imul(ah8, bh2) | 0, lo = lo + Math.imul(al7, bl3) | 0, mid = (mid = mid + Math.imul(al7, bh3) | 0) + Math.imul(ah7, bl3) | 0, 
                hi = hi + Math.imul(ah7, bh3) | 0, lo = lo + Math.imul(al6, bl4) | 0, mid = (mid = mid + Math.imul(al6, bh4) | 0) + Math.imul(ah6, bl4) | 0, 
                hi = hi + Math.imul(ah6, bh4) | 0, lo = lo + Math.imul(al5, bl5) | 0, mid = (mid = mid + Math.imul(al5, bh5) | 0) + Math.imul(ah5, bl5) | 0, 
                hi = hi + Math.imul(ah5, bh5) | 0, lo = lo + Math.imul(al4, bl6) | 0, mid = (mid = mid + Math.imul(al4, bh6) | 0) + Math.imul(ah4, bl6) | 0, 
                hi = hi + Math.imul(ah4, bh6) | 0, lo = lo + Math.imul(al3, bl7) | 0, mid = (mid = mid + Math.imul(al3, bh7) | 0) + Math.imul(ah3, bl7) | 0, 
                hi = hi + Math.imul(ah3, bh7) | 0, lo = lo + Math.imul(al2, bl8) | 0, mid = (mid = mid + Math.imul(al2, bh8) | 0) + Math.imul(ah2, bl8) | 0, 
                hi = hi + Math.imul(ah2, bh8) | 0;
                var w10 = (c + (lo = lo + Math.imul(al1, bl9) | 0) | 0) + ((8191 & (mid = (mid = mid + Math.imul(al1, bh9) | 0) + Math.imul(ah1, bl9) | 0)) << 13) | 0;
                c = ((hi = hi + Math.imul(ah1, bh9) | 0) + (mid >>> 13) | 0) + (w10 >>> 26) | 0, 
                w10 &= 67108863, lo = Math.imul(al9, bl2), mid = (mid = Math.imul(al9, bh2)) + Math.imul(ah9, bl2) | 0, 
                hi = Math.imul(ah9, bh2), lo = lo + Math.imul(al8, bl3) | 0, mid = (mid = mid + Math.imul(al8, bh3) | 0) + Math.imul(ah8, bl3) | 0, 
                hi = hi + Math.imul(ah8, bh3) | 0, lo = lo + Math.imul(al7, bl4) | 0, mid = (mid = mid + Math.imul(al7, bh4) | 0) + Math.imul(ah7, bl4) | 0, 
                hi = hi + Math.imul(ah7, bh4) | 0, lo = lo + Math.imul(al6, bl5) | 0, mid = (mid = mid + Math.imul(al6, bh5) | 0) + Math.imul(ah6, bl5) | 0, 
                hi = hi + Math.imul(ah6, bh5) | 0, lo = lo + Math.imul(al5, bl6) | 0, mid = (mid = mid + Math.imul(al5, bh6) | 0) + Math.imul(ah5, bl6) | 0, 
                hi = hi + Math.imul(ah5, bh6) | 0, lo = lo + Math.imul(al4, bl7) | 0, mid = (mid = mid + Math.imul(al4, bh7) | 0) + Math.imul(ah4, bl7) | 0, 
                hi = hi + Math.imul(ah4, bh7) | 0, lo = lo + Math.imul(al3, bl8) | 0, mid = (mid = mid + Math.imul(al3, bh8) | 0) + Math.imul(ah3, bl8) | 0, 
                hi = hi + Math.imul(ah3, bh8) | 0;
                var w11 = (c + (lo = lo + Math.imul(al2, bl9) | 0) | 0) + ((8191 & (mid = (mid = mid + Math.imul(al2, bh9) | 0) + Math.imul(ah2, bl9) | 0)) << 13) | 0;
                c = ((hi = hi + Math.imul(ah2, bh9) | 0) + (mid >>> 13) | 0) + (w11 >>> 26) | 0, 
                w11 &= 67108863, lo = Math.imul(al9, bl3), mid = (mid = Math.imul(al9, bh3)) + Math.imul(ah9, bl3) | 0, 
                hi = Math.imul(ah9, bh3), lo = lo + Math.imul(al8, bl4) | 0, mid = (mid = mid + Math.imul(al8, bh4) | 0) + Math.imul(ah8, bl4) | 0, 
                hi = hi + Math.imul(ah8, bh4) | 0, lo = lo + Math.imul(al7, bl5) | 0, mid = (mid = mid + Math.imul(al7, bh5) | 0) + Math.imul(ah7, bl5) | 0, 
                hi = hi + Math.imul(ah7, bh5) | 0, lo = lo + Math.imul(al6, bl6) | 0, mid = (mid = mid + Math.imul(al6, bh6) | 0) + Math.imul(ah6, bl6) | 0, 
                hi = hi + Math.imul(ah6, bh6) | 0, lo = lo + Math.imul(al5, bl7) | 0, mid = (mid = mid + Math.imul(al5, bh7) | 0) + Math.imul(ah5, bl7) | 0, 
                hi = hi + Math.imul(ah5, bh7) | 0, lo = lo + Math.imul(al4, bl8) | 0, mid = (mid = mid + Math.imul(al4, bh8) | 0) + Math.imul(ah4, bl8) | 0, 
                hi = hi + Math.imul(ah4, bh8) | 0;
                var w12 = (c + (lo = lo + Math.imul(al3, bl9) | 0) | 0) + ((8191 & (mid = (mid = mid + Math.imul(al3, bh9) | 0) + Math.imul(ah3, bl9) | 0)) << 13) | 0;
                c = ((hi = hi + Math.imul(ah3, bh9) | 0) + (mid >>> 13) | 0) + (w12 >>> 26) | 0, 
                w12 &= 67108863, lo = Math.imul(al9, bl4), mid = (mid = Math.imul(al9, bh4)) + Math.imul(ah9, bl4) | 0, 
                hi = Math.imul(ah9, bh4), lo = lo + Math.imul(al8, bl5) | 0, mid = (mid = mid + Math.imul(al8, bh5) | 0) + Math.imul(ah8, bl5) | 0, 
                hi = hi + Math.imul(ah8, bh5) | 0, lo = lo + Math.imul(al7, bl6) | 0, mid = (mid = mid + Math.imul(al7, bh6) | 0) + Math.imul(ah7, bl6) | 0, 
                hi = hi + Math.imul(ah7, bh6) | 0, lo = lo + Math.imul(al6, bl7) | 0, mid = (mid = mid + Math.imul(al6, bh7) | 0) + Math.imul(ah6, bl7) | 0, 
                hi = hi + Math.imul(ah6, bh7) | 0, lo = lo + Math.imul(al5, bl8) | 0, mid = (mid = mid + Math.imul(al5, bh8) | 0) + Math.imul(ah5, bl8) | 0, 
                hi = hi + Math.imul(ah5, bh8) | 0;
                var w13 = (c + (lo = lo + Math.imul(al4, bl9) | 0) | 0) + ((8191 & (mid = (mid = mid + Math.imul(al4, bh9) | 0) + Math.imul(ah4, bl9) | 0)) << 13) | 0;
                c = ((hi = hi + Math.imul(ah4, bh9) | 0) + (mid >>> 13) | 0) + (w13 >>> 26) | 0, 
                w13 &= 67108863, lo = Math.imul(al9, bl5), mid = (mid = Math.imul(al9, bh5)) + Math.imul(ah9, bl5) | 0, 
                hi = Math.imul(ah9, bh5), lo = lo + Math.imul(al8, bl6) | 0, mid = (mid = mid + Math.imul(al8, bh6) | 0) + Math.imul(ah8, bl6) | 0, 
                hi = hi + Math.imul(ah8, bh6) | 0, lo = lo + Math.imul(al7, bl7) | 0, mid = (mid = mid + Math.imul(al7, bh7) | 0) + Math.imul(ah7, bl7) | 0, 
                hi = hi + Math.imul(ah7, bh7) | 0, lo = lo + Math.imul(al6, bl8) | 0, mid = (mid = mid + Math.imul(al6, bh8) | 0) + Math.imul(ah6, bl8) | 0, 
                hi = hi + Math.imul(ah6, bh8) | 0;
                var w14 = (c + (lo = lo + Math.imul(al5, bl9) | 0) | 0) + ((8191 & (mid = (mid = mid + Math.imul(al5, bh9) | 0) + Math.imul(ah5, bl9) | 0)) << 13) | 0;
                c = ((hi = hi + Math.imul(ah5, bh9) | 0) + (mid >>> 13) | 0) + (w14 >>> 26) | 0, 
                w14 &= 67108863, lo = Math.imul(al9, bl6), mid = (mid = Math.imul(al9, bh6)) + Math.imul(ah9, bl6) | 0, 
                hi = Math.imul(ah9, bh6), lo = lo + Math.imul(al8, bl7) | 0, mid = (mid = mid + Math.imul(al8, bh7) | 0) + Math.imul(ah8, bl7) | 0, 
                hi = hi + Math.imul(ah8, bh7) | 0, lo = lo + Math.imul(al7, bl8) | 0, mid = (mid = mid + Math.imul(al7, bh8) | 0) + Math.imul(ah7, bl8) | 0, 
                hi = hi + Math.imul(ah7, bh8) | 0;
                var w15 = (c + (lo = lo + Math.imul(al6, bl9) | 0) | 0) + ((8191 & (mid = (mid = mid + Math.imul(al6, bh9) | 0) + Math.imul(ah6, bl9) | 0)) << 13) | 0;
                c = ((hi = hi + Math.imul(ah6, bh9) | 0) + (mid >>> 13) | 0) + (w15 >>> 26) | 0, 
                w15 &= 67108863, lo = Math.imul(al9, bl7), mid = (mid = Math.imul(al9, bh7)) + Math.imul(ah9, bl7) | 0, 
                hi = Math.imul(ah9, bh7), lo = lo + Math.imul(al8, bl8) | 0, mid = (mid = mid + Math.imul(al8, bh8) | 0) + Math.imul(ah8, bl8) | 0, 
                hi = hi + Math.imul(ah8, bh8) | 0;
                var w16 = (c + (lo = lo + Math.imul(al7, bl9) | 0) | 0) + ((8191 & (mid = (mid = mid + Math.imul(al7, bh9) | 0) + Math.imul(ah7, bl9) | 0)) << 13) | 0;
                c = ((hi = hi + Math.imul(ah7, bh9) | 0) + (mid >>> 13) | 0) + (w16 >>> 26) | 0, 
                w16 &= 67108863, lo = Math.imul(al9, bl8), mid = (mid = Math.imul(al9, bh8)) + Math.imul(ah9, bl8) | 0, 
                hi = Math.imul(ah9, bh8);
                var w17 = (c + (lo = lo + Math.imul(al8, bl9) | 0) | 0) + ((8191 & (mid = (mid = mid + Math.imul(al8, bh9) | 0) + Math.imul(ah8, bl9) | 0)) << 13) | 0;
                c = ((hi = hi + Math.imul(ah8, bh9) | 0) + (mid >>> 13) | 0) + (w17 >>> 26) | 0, 
                w17 &= 67108863;
                var w18 = (c + (lo = Math.imul(al9, bl9)) | 0) + ((8191 & (mid = (mid = Math.imul(al9, bh9)) + Math.imul(ah9, bl9) | 0)) << 13) | 0;
                return c = ((hi = Math.imul(ah9, bh9)) + (mid >>> 13) | 0) + (w18 >>> 26) | 0, w18 &= 67108863, 
                o[0] = w0, o[1] = w1, o[2] = w2, o[3] = w3, o[4] = w4, o[5] = w5, o[6] = w6, o[7] = w7, 
                o[8] = w8, o[9] = w9, o[10] = w10, o[11] = w11, o[12] = w12, o[13] = w13, o[14] = w14, 
                o[15] = w15, o[16] = w16, o[17] = w17, o[18] = w18, 0 !== c && (o[19] = c, out.length++), 
                out;
            };
            function jumboMulTo(self, num, out) {
                return (new FFTM).mulp(self, num, out);
            }
            function FFTM(x, y) {
                this.x = x, this.y = y;
            }
            Math.imul || (comb10MulTo = smallMulTo), BN.prototype.mulTo = function(num, out) {
                var res, len = this.length + num.length;
                return res = 10 === this.length && 10 === num.length ? comb10MulTo(this, num, out) : len < 63 ? smallMulTo(this, num, out) : len < 1024 ? (function(self, num, out) {
                    out.negative = num.negative ^ self.negative, out.length = self.length + num.length;
                    for (var carry = 0, hncarry = 0, k = 0; k < out.length - 1; k++) {
                        var ncarry = hncarry;
                        hncarry = 0;
                        for (var rword = 67108863 & carry, maxJ = Math.min(k, num.length - 1), j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
                            var i = k - j, r = (0 | self.words[i]) * (0 | num.words[j]), lo = 67108863 & r;
                            rword = 67108863 & (lo = lo + rword | 0), hncarry += (ncarry = (ncarry = ncarry + (r / 67108864 | 0) | 0) + (lo >>> 26) | 0) >>> 26, 
                            ncarry &= 67108863;
                        }
                        out.words[k] = rword, carry = ncarry, ncarry = hncarry;
                    }
                    return 0 !== carry ? out.words[k] = carry : out.length--, out.strip();
                })(this, num, out) : jumboMulTo(this, num, out), res;
            }, FFTM.prototype.makeRBT = function(N) {
                for (var t = new Array(N), l = BN.prototype._countBits(N) - 1, i = 0; i < N; i++) t[i] = this.revBin(i, l, N);
                return t;
            }, FFTM.prototype.revBin = function(x, l, N) {
                if (0 === x || x === N - 1) return x;
                for (var rb = 0, i = 0; i < l; i++) rb |= (1 & x) << l - i - 1, x >>= 1;
                return rb;
            }, FFTM.prototype.permute = function(rbt, rws, iws, rtws, itws, N) {
                for (var i = 0; i < N; i++) rtws[i] = rws[rbt[i]], itws[i] = iws[rbt[i]];
            }, FFTM.prototype.transform = function(rws, iws, rtws, itws, N, rbt) {
                this.permute(rbt, rws, iws, rtws, itws, N);
                for (var s = 1; s < N; s <<= 1) for (var l = s << 1, rtwdf = Math.cos(2 * Math.PI / l), itwdf = Math.sin(2 * Math.PI / l), p = 0; p < N; p += l) for (var rtwdf_ = rtwdf, itwdf_ = itwdf, j = 0; j < s; j++) {
                    var re = rtws[p + j], ie = itws[p + j], ro = rtws[p + j + s], io = itws[p + j + s], rx = rtwdf_ * ro - itwdf_ * io;
                    io = rtwdf_ * io + itwdf_ * ro, ro = rx, rtws[p + j] = re + ro, itws[p + j] = ie + io, 
                    rtws[p + j + s] = re - ro, itws[p + j + s] = ie - io, j !== l && (rx = rtwdf * rtwdf_ - itwdf * itwdf_, 
                    itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_, rtwdf_ = rx);
                }
            }, FFTM.prototype.guessLen13b = function(n, m) {
                var N = 1 | Math.max(m, n), odd = 1 & N, i = 0;
                for (N = N / 2 | 0; N; N >>>= 1) i++;
                return 1 << i + 1 + odd;
            }, FFTM.prototype.conjugate = function(rws, iws, N) {
                if (!(N <= 1)) for (var i = 0; i < N / 2; i++) {
                    var t = rws[i];
                    rws[i] = rws[N - i - 1], rws[N - i - 1] = t, t = iws[i], iws[i] = -iws[N - i - 1], 
                    iws[N - i - 1] = -t;
                }
            }, FFTM.prototype.normalize13b = function(ws, N) {
                for (var carry = 0, i = 0; i < N / 2; i++) {
                    var w = 8192 * Math.round(ws[2 * i + 1] / N) + Math.round(ws[2 * i] / N) + carry;
                    ws[i] = 67108863 & w, carry = w < 67108864 ? 0 : w / 67108864 | 0;
                }
                return ws;
            }, FFTM.prototype.convert13b = function(ws, len, rws, N) {
                for (var carry = 0, i = 0; i < len; i++) carry += 0 | ws[i], rws[2 * i] = 8191 & carry, 
                carry >>>= 13, rws[2 * i + 1] = 8191 & carry, carry >>>= 13;
                for (i = 2 * len; i < N; ++i) rws[i] = 0;
                assert(0 === carry), assert(0 == (-8192 & carry));
            }, FFTM.prototype.stub = function(N) {
                for (var ph = new Array(N), i = 0; i < N; i++) ph[i] = 0;
                return ph;
            }, FFTM.prototype.mulp = function(x, y, out) {
                var N = 2 * this.guessLen13b(x.length, y.length), rbt = this.makeRBT(N), _ = this.stub(N), rws = new Array(N), rwst = new Array(N), iwst = new Array(N), nrws = new Array(N), nrwst = new Array(N), niwst = new Array(N), rmws = out.words;
                rmws.length = N, this.convert13b(x.words, x.length, rws, N), this.convert13b(y.words, y.length, nrws, N), 
                this.transform(rws, _, rwst, iwst, N, rbt), this.transform(nrws, _, nrwst, niwst, N, rbt);
                for (var i = 0; i < N; i++) {
                    var rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i];
                    iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i], rwst[i] = rx;
                }
                return this.conjugate(rwst, iwst, N), this.transform(rwst, iwst, rmws, _, N, rbt), 
                this.conjugate(rmws, _, N), this.normalize13b(rmws, N), out.negative = x.negative ^ y.negative, 
                out.length = x.length + y.length, out.strip();
            }, BN.prototype.mul = function(num) {
                var out = new BN(null);
                return out.words = new Array(this.length + num.length), this.mulTo(num, out);
            }, BN.prototype.mulf = function(num) {
                var out = new BN(null);
                return out.words = new Array(this.length + num.length), jumboMulTo(this, num, out);
            }, BN.prototype.imul = function(num) {
                return this.clone().mulTo(num, this);
            }, BN.prototype.imuln = function(num) {
                assert("number" == typeof num), assert(num < 67108864);
                for (var carry = 0, i = 0; i < this.length; i++) {
                    var w = (0 | this.words[i]) * num, lo = (67108863 & w) + (67108863 & carry);
                    carry >>= 26, carry += w / 67108864 | 0, carry += lo >>> 26, this.words[i] = 67108863 & lo;
                }
                return 0 !== carry && (this.words[i] = carry, this.length++), this;
            }, BN.prototype.muln = function(num) {
                return this.clone().imuln(num);
            }, BN.prototype.sqr = function() {
                return this.mul(this);
            }, BN.prototype.isqr = function() {
                return this.imul(this.clone());
            }, BN.prototype.pow = function(num) {
                var w = (function(num) {
                    for (var w = new Array(num.bitLength()), bit = 0; bit < w.length; bit++) {
                        var off = bit / 26 | 0, wbit = bit % 26;
                        w[bit] = (num.words[off] & 1 << wbit) >>> wbit;
                    }
                    return w;
                })(num);
                if (0 === w.length) return new BN(1);
                for (var res = this, i = 0; i < w.length && 0 === w[i]; i++, res = res.sqr()) ;
                if (++i < w.length) for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) 0 !== w[i] && (res = res.mul(q));
                return res;
            }, BN.prototype.iushln = function(bits) {
                assert("number" == typeof bits && bits >= 0);
                var i, r = bits % 26, s = (bits - r) / 26, carryMask = 67108863 >>> 26 - r << 26 - r;
                if (0 !== r) {
                    var carry = 0;
                    for (i = 0; i < this.length; i++) {
                        var newCarry = this.words[i] & carryMask, c = (0 | this.words[i]) - newCarry << r;
                        this.words[i] = c | carry, carry = newCarry >>> 26 - r;
                    }
                    carry && (this.words[i] = carry, this.length++);
                }
                if (0 !== s) {
                    for (i = this.length - 1; i >= 0; i--) this.words[i + s] = this.words[i];
                    for (i = 0; i < s; i++) this.words[i] = 0;
                    this.length += s;
                }
                return this.strip();
            }, BN.prototype.ishln = function(bits) {
                return assert(0 === this.negative), this.iushln(bits);
            }, BN.prototype.iushrn = function(bits, hint, extended) {
                var h;
                assert("number" == typeof bits && bits >= 0), h = hint ? (hint - hint % 26) / 26 : 0;
                var r = bits % 26, s = Math.min((bits - r) / 26, this.length), mask = 67108863 ^ 67108863 >>> r << r, maskedWords = extended;
                if (h -= s, h = Math.max(0, h), maskedWords) {
                    for (var i = 0; i < s; i++) maskedWords.words[i] = this.words[i];
                    maskedWords.length = s;
                }
                if (0 === s) ; else if (this.length > s) for (this.length -= s, i = 0; i < this.length; i++) this.words[i] = this.words[i + s]; else this.words[0] = 0, 
                this.length = 1;
                var carry = 0;
                for (i = this.length - 1; i >= 0 && (0 !== carry || i >= h); i--) {
                    var word = 0 | this.words[i];
                    this.words[i] = carry << 26 - r | word >>> r, carry = word & mask;
                }
                return maskedWords && 0 !== carry && (maskedWords.words[maskedWords.length++] = carry), 
                0 === this.length && (this.words[0] = 0, this.length = 1), this.strip();
            }, BN.prototype.ishrn = function(bits, hint, extended) {
                return assert(0 === this.negative), this.iushrn(bits, hint, extended);
            }, BN.prototype.shln = function(bits) {
                return this.clone().ishln(bits);
            }, BN.prototype.ushln = function(bits) {
                return this.clone().iushln(bits);
            }, BN.prototype.shrn = function(bits) {
                return this.clone().ishrn(bits);
            }, BN.prototype.ushrn = function(bits) {
                return this.clone().iushrn(bits);
            }, BN.prototype.testn = function(bit) {
                assert("number" == typeof bit && bit >= 0);
                var r = bit % 26, s = (bit - r) / 26, q = 1 << r;
                return !(this.length <= s || !(this.words[s] & q));
            }, BN.prototype.imaskn = function(bits) {
                assert("number" == typeof bits && bits >= 0);
                var r = bits % 26, s = (bits - r) / 26;
                if (assert(0 === this.negative, "imaskn works only with positive numbers"), this.length <= s) return this;
                if (0 !== r && s++, this.length = Math.min(s, this.length), 0 !== r) {
                    var mask = 67108863 ^ 67108863 >>> r << r;
                    this.words[this.length - 1] &= mask;
                }
                return this.strip();
            }, BN.prototype.maskn = function(bits) {
                return this.clone().imaskn(bits);
            }, BN.prototype.iaddn = function(num) {
                return assert("number" == typeof num), assert(num < 67108864), num < 0 ? this.isubn(-num) : 0 !== this.negative ? 1 === this.length && (0 | this.words[0]) < num ? (this.words[0] = num - (0 | this.words[0]), 
                this.negative = 0, this) : (this.negative = 0, this.isubn(num), this.negative = 1, 
                this) : this._iaddn(num);
            }, BN.prototype._iaddn = function(num) {
                this.words[0] += num;
                for (var i = 0; i < this.length && this.words[i] >= 67108864; i++) this.words[i] -= 67108864, 
                i === this.length - 1 ? this.words[i + 1] = 1 : this.words[i + 1]++;
                return this.length = Math.max(this.length, i + 1), this;
            }, BN.prototype.isubn = function(num) {
                if (assert("number" == typeof num), assert(num < 67108864), num < 0) return this.iaddn(-num);
                if (0 !== this.negative) return this.negative = 0, this.iaddn(num), this.negative = 1, 
                this;
                if (this.words[0] -= num, 1 === this.length && this.words[0] < 0) this.words[0] = -this.words[0], 
                this.negative = 1; else for (var i = 0; i < this.length && this.words[i] < 0; i++) this.words[i] += 67108864, 
                this.words[i + 1] -= 1;
                return this.strip();
            }, BN.prototype.addn = function(num) {
                return this.clone().iaddn(num);
            }, BN.prototype.subn = function(num) {
                return this.clone().isubn(num);
            }, BN.prototype.iabs = function() {
                return this.negative = 0, this;
            }, BN.prototype.abs = function() {
                return this.clone().iabs();
            }, BN.prototype._ishlnsubmul = function(num, mul, shift) {
                var i, w, len = num.length + shift;
                this._expand(len);
                var carry = 0;
                for (i = 0; i < num.length; i++) {
                    w = (0 | this.words[i + shift]) + carry;
                    var right = (0 | num.words[i]) * mul;
                    carry = ((w -= 67108863 & right) >> 26) - (right / 67108864 | 0), this.words[i + shift] = 67108863 & w;
                }
                for (;i < this.length - shift; i++) carry = (w = (0 | this.words[i + shift]) + carry) >> 26, 
                this.words[i + shift] = 67108863 & w;
                if (0 === carry) return this.strip();
                for (assert(-1 === carry), carry = 0, i = 0; i < this.length; i++) carry = (w = -(0 | this.words[i]) + carry) >> 26, 
                this.words[i] = 67108863 & w;
                return this.negative = 1, this.strip();
            }, BN.prototype._wordDiv = function(num, mode) {
                var shift = (this.length, num.length), a = this.clone(), b = num, bhi = 0 | b.words[b.length - 1];
                0 != (shift = 26 - this._countBits(bhi)) && (b = b.ushln(shift), a.iushln(shift), 
                bhi = 0 | b.words[b.length - 1]);
                var q, m = a.length - b.length;
                if ("mod" !== mode) {
                    (q = new BN(null)).length = m + 1, q.words = new Array(q.length);
                    for (var i = 0; i < q.length; i++) q.words[i] = 0;
                }
                var diff = a.clone()._ishlnsubmul(b, 1, m);
                0 === diff.negative && (a = diff, q && (q.words[m] = 1));
                for (var j = m - 1; j >= 0; j--) {
                    var qj = 67108864 * (0 | a.words[b.length + j]) + (0 | a.words[b.length + j - 1]);
                    for (qj = Math.min(qj / bhi | 0, 67108863), a._ishlnsubmul(b, qj, j); 0 !== a.negative; ) qj--, 
                    a.negative = 0, a._ishlnsubmul(b, 1, j), a.isZero() || (a.negative ^= 1);
                    q && (q.words[j] = qj);
                }
                return q && q.strip(), a.strip(), "div" !== mode && 0 !== shift && a.iushrn(shift), 
                {
                    div: q || null,
                    mod: a
                };
            }, BN.prototype.divmod = function(num, mode, positive) {
                return assert(!num.isZero()), this.isZero() ? {
                    div: new BN(0),
                    mod: new BN(0)
                } : 0 !== this.negative && 0 === num.negative ? (res = this.neg().divmod(num, mode), 
                "mod" !== mode && (div = res.div.neg()), "div" !== mode && (mod = res.mod.neg(), 
                positive && 0 !== mod.negative && mod.iadd(num)), {
                    div: div,
                    mod: mod
                }) : 0 === this.negative && 0 !== num.negative ? (res = this.divmod(num.neg(), mode), 
                "mod" !== mode && (div = res.div.neg()), {
                    div: div,
                    mod: res.mod
                }) : 0 != (this.negative & num.negative) ? (res = this.neg().divmod(num.neg(), mode), 
                "div" !== mode && (mod = res.mod.neg(), positive && 0 !== mod.negative && mod.isub(num)), 
                {
                    div: res.div,
                    mod: mod
                }) : num.length > this.length || this.cmp(num) < 0 ? {
                    div: new BN(0),
                    mod: this
                } : 1 === num.length ? "div" === mode ? {
                    div: this.divn(num.words[0]),
                    mod: null
                } : "mod" === mode ? {
                    div: null,
                    mod: new BN(this.modn(num.words[0]))
                } : {
                    div: this.divn(num.words[0]),
                    mod: new BN(this.modn(num.words[0]))
                } : this._wordDiv(num, mode);
                var div, mod, res;
            }, BN.prototype.div = function(num) {
                return this.divmod(num, "div", !1).div;
            }, BN.prototype.mod = function(num) {
                return this.divmod(num, "mod", !1).mod;
            }, BN.prototype.umod = function(num) {
                return this.divmod(num, "mod", !0).mod;
            }, BN.prototype.divRound = function(num) {
                var dm = this.divmod(num);
                if (dm.mod.isZero()) return dm.div;
                var mod = 0 !== dm.div.negative ? dm.mod.isub(num) : dm.mod, half = num.ushrn(1), r2 = num.andln(1), cmp = mod.cmp(half);
                return cmp < 0 || 1 === r2 && 0 === cmp ? dm.div : 0 !== dm.div.negative ? dm.div.isubn(1) : dm.div.iaddn(1);
            }, BN.prototype.modn = function(num) {
                assert(num <= 67108863);
                for (var p = (1 << 26) % num, acc = 0, i = this.length - 1; i >= 0; i--) acc = (p * acc + (0 | this.words[i])) % num;
                return acc;
            }, BN.prototype.idivn = function(num) {
                assert(num <= 67108863);
                for (var carry = 0, i = this.length - 1; i >= 0; i--) {
                    var w = (0 | this.words[i]) + 67108864 * carry;
                    this.words[i] = w / num | 0, carry = w % num;
                }
                return this.strip();
            }, BN.prototype.divn = function(num) {
                return this.clone().idivn(num);
            }, BN.prototype.egcd = function(p) {
                assert(0 === p.negative), assert(!p.isZero());
                var x = this, y = p.clone();
                x = 0 !== x.negative ? x.umod(p) : x.clone();
                for (var A = new BN(1), B = new BN(0), C = new BN(0), D = new BN(1), g = 0; x.isEven() && y.isEven(); ) x.iushrn(1), 
                y.iushrn(1), ++g;
                for (var yp = y.clone(), xp = x.clone(); !x.isZero(); ) {
                    for (var i = 0, im = 1; 0 == (x.words[0] & im) && i < 26; ++i, im <<= 1) ;
                    if (i > 0) for (x.iushrn(i); i-- > 0; ) (A.isOdd() || B.isOdd()) && (A.iadd(yp), 
                    B.isub(xp)), A.iushrn(1), B.iushrn(1);
                    for (var j = 0, jm = 1; 0 == (y.words[0] & jm) && j < 26; ++j, jm <<= 1) ;
                    if (j > 0) for (y.iushrn(j); j-- > 0; ) (C.isOdd() || D.isOdd()) && (C.iadd(yp), 
                    D.isub(xp)), C.iushrn(1), D.iushrn(1);
                    x.cmp(y) >= 0 ? (x.isub(y), A.isub(C), B.isub(D)) : (y.isub(x), C.isub(A), D.isub(B));
                }
                return {
                    a: C,
                    b: D,
                    gcd: y.iushln(g)
                };
            }, BN.prototype._invmp = function(p) {
                assert(0 === p.negative), assert(!p.isZero());
                var a = this, b = p.clone();
                a = 0 !== a.negative ? a.umod(p) : a.clone();
                for (var res, x1 = new BN(1), x2 = new BN(0), delta = b.clone(); a.cmpn(1) > 0 && b.cmpn(1) > 0; ) {
                    for (var i = 0, im = 1; 0 == (a.words[0] & im) && i < 26; ++i, im <<= 1) ;
                    if (i > 0) for (a.iushrn(i); i-- > 0; ) x1.isOdd() && x1.iadd(delta), x1.iushrn(1);
                    for (var j = 0, jm = 1; 0 == (b.words[0] & jm) && j < 26; ++j, jm <<= 1) ;
                    if (j > 0) for (b.iushrn(j); j-- > 0; ) x2.isOdd() && x2.iadd(delta), x2.iushrn(1);
                    a.cmp(b) >= 0 ? (a.isub(b), x1.isub(x2)) : (b.isub(a), x2.isub(x1));
                }
                return (res = 0 === a.cmpn(1) ? x1 : x2).cmpn(0) < 0 && res.iadd(p), res;
            }, BN.prototype.gcd = function(num) {
                if (this.isZero()) return num.abs();
                if (num.isZero()) return this.abs();
                var a = this.clone(), b = num.clone();
                a.negative = 0, b.negative = 0;
                for (var shift = 0; a.isEven() && b.isEven(); shift++) a.iushrn(1), b.iushrn(1);
                for (;;) {
                    for (;a.isEven(); ) a.iushrn(1);
                    for (;b.isEven(); ) b.iushrn(1);
                    var r = a.cmp(b);
                    if (r < 0) {
                        var t = a;
                        a = b, b = t;
                    } else if (0 === r || 0 === b.cmpn(1)) break;
                    a.isub(b);
                }
                return b.iushln(shift);
            }, BN.prototype.invm = function(num) {
                return this.egcd(num).a.umod(num);
            }, BN.prototype.isEven = function() {
                return 0 == (1 & this.words[0]);
            }, BN.prototype.isOdd = function() {
                return 1 == (1 & this.words[0]);
            }, BN.prototype.andln = function(num) {
                return this.words[0] & num;
            }, BN.prototype.bincn = function(bit) {
                assert("number" == typeof bit);
                var r = bit % 26, s = (bit - r) / 26, q = 1 << r;
                if (this.length <= s) return this._expand(s + 1), this.words[s] |= q, this;
                for (var carry = q, i = s; 0 !== carry && i < this.length; i++) {
                    var w = 0 | this.words[i];
                    carry = (w += carry) >>> 26, w &= 67108863, this.words[i] = w;
                }
                return 0 !== carry && (this.words[i] = carry, this.length++), this;
            }, BN.prototype.isZero = function() {
                return 1 === this.length && 0 === this.words[0];
            }, BN.prototype.cmpn = function(num) {
                var res, negative = num < 0;
                if (0 !== this.negative && !negative) return -1;
                if (0 === this.negative && negative) return 1;
                if (this.strip(), this.length > 1) res = 1; else {
                    negative && (num = -num), assert(num <= 67108863, "Number is too big");
                    var w = 0 | this.words[0];
                    res = w === num ? 0 : w < num ? -1 : 1;
                }
                return 0 !== this.negative ? 0 | -res : res;
            }, BN.prototype.cmp = function(num) {
                if (0 !== this.negative && 0 === num.negative) return -1;
                if (0 === this.negative && 0 !== num.negative) return 1;
                var res = this.ucmp(num);
                return 0 !== this.negative ? 0 | -res : res;
            }, BN.prototype.ucmp = function(num) {
                if (this.length > num.length) return 1;
                if (this.length < num.length) return -1;
                for (var res = 0, i = this.length - 1; i >= 0; i--) {
                    var a = 0 | this.words[i], b = 0 | num.words[i];
                    if (a !== b) {
                        a < b ? res = -1 : a > b && (res = 1);
                        break;
                    }
                }
                return res;
            }, BN.prototype.gtn = function(num) {
                return 1 === this.cmpn(num);
            }, BN.prototype.gt = function(num) {
                return 1 === this.cmp(num);
            }, BN.prototype.gten = function(num) {
                return this.cmpn(num) >= 0;
            }, BN.prototype.gte = function(num) {
                return this.cmp(num) >= 0;
            }, BN.prototype.ltn = function(num) {
                return -1 === this.cmpn(num);
            }, BN.prototype.lt = function(num) {
                return -1 === this.cmp(num);
            }, BN.prototype.lten = function(num) {
                return this.cmpn(num) <= 0;
            }, BN.prototype.lte = function(num) {
                return this.cmp(num) <= 0;
            }, BN.prototype.eqn = function(num) {
                return 0 === this.cmpn(num);
            }, BN.prototype.eq = function(num) {
                return 0 === this.cmp(num);
            }, BN.red = function(num) {
                return new Red(num);
            }, BN.prototype.toRed = function(ctx) {
                return assert(!this.red, "Already a number in reduction context"), assert(0 === this.negative, "red works only with positives"), 
                ctx.convertTo(this)._forceRed(ctx);
            }, BN.prototype.fromRed = function() {
                return assert(this.red, "fromRed works only with numbers in reduction context"), 
                this.red.convertFrom(this);
            }, BN.prototype._forceRed = function(ctx) {
                return this.red = ctx, this;
            }, BN.prototype.forceRed = function(ctx) {
                return assert(!this.red, "Already a number in reduction context"), this._forceRed(ctx);
            }, BN.prototype.redAdd = function(num) {
                return assert(this.red, "redAdd works only with red numbers"), this.red.add(this, num);
            }, BN.prototype.redIAdd = function(num) {
                return assert(this.red, "redIAdd works only with red numbers"), this.red.iadd(this, num);
            }, BN.prototype.redSub = function(num) {
                return assert(this.red, "redSub works only with red numbers"), this.red.sub(this, num);
            }, BN.prototype.redISub = function(num) {
                return assert(this.red, "redISub works only with red numbers"), this.red.isub(this, num);
            }, BN.prototype.redShl = function(num) {
                return assert(this.red, "redShl works only with red numbers"), this.red.shl(this, num);
            }, BN.prototype.redMul = function(num) {
                return assert(this.red, "redMul works only with red numbers"), this.red._verify2(this, num), 
                this.red.mul(this, num);
            }, BN.prototype.redIMul = function(num) {
                return assert(this.red, "redMul works only with red numbers"), this.red._verify2(this, num), 
                this.red.imul(this, num);
            }, BN.prototype.redSqr = function() {
                return assert(this.red, "redSqr works only with red numbers"), this.red._verify1(this), 
                this.red.sqr(this);
            }, BN.prototype.redISqr = function() {
                return assert(this.red, "redISqr works only with red numbers"), this.red._verify1(this), 
                this.red.isqr(this);
            }, BN.prototype.redSqrt = function() {
                return assert(this.red, "redSqrt works only with red numbers"), this.red._verify1(this), 
                this.red.sqrt(this);
            }, BN.prototype.redInvm = function() {
                return assert(this.red, "redInvm works only with red numbers"), this.red._verify1(this), 
                this.red.invm(this);
            }, BN.prototype.redNeg = function() {
                return assert(this.red, "redNeg works only with red numbers"), this.red._verify1(this), 
                this.red.neg(this);
            }, BN.prototype.redPow = function(num) {
                return assert(this.red && !num.red, "redPow(normalNum)"), this.red._verify1(this), 
                this.red.pow(this, num);
            };
            var primes = {
                k256: null,
                p224: null,
                p192: null,
                p25519: null
            };
            function MPrime(name, p) {
                this.name = name, this.p = new BN(p, 16), this.n = this.p.bitLength(), this.k = new BN(1).iushln(this.n).isub(this.p), 
                this.tmp = this._tmp();
            }
            function K256() {
                MPrime.call(this, "k256", "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f");
            }
            function P224() {
                MPrime.call(this, "p224", "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001");
            }
            function P192() {
                MPrime.call(this, "p192", "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff");
            }
            function P25519() {
                MPrime.call(this, "25519", "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed");
            }
            function Red(m) {
                if ("string" == typeof m) {
                    var prime = BN._prime(m);
                    this.m = prime.p, this.prime = prime;
                } else assert(m.gtn(1), "modulus must be greater than 1"), this.m = m, this.prime = null;
            }
            function Mont(m) {
                Red.call(this, m), this.shift = this.m.bitLength(), this.shift % 26 != 0 && (this.shift += 26 - this.shift % 26), 
                this.r = new BN(1).iushln(this.shift), this.r2 = this.imod(this.r.sqr()), this.rinv = this.r._invmp(this.m), 
                this.minv = this.rinv.mul(this.r).isubn(1).div(this.m), this.minv = this.minv.umod(this.r), 
                this.minv = this.r.sub(this.minv);
            }
            MPrime.prototype._tmp = function() {
                var tmp = new BN(null);
                return tmp.words = new Array(Math.ceil(this.n / 13)), tmp;
            }, MPrime.prototype.ireduce = function(num) {
                var rlen, r = num;
                do {
                    this.split(r, this.tmp), rlen = (r = (r = this.imulK(r)).iadd(this.tmp)).bitLength();
                } while (rlen > this.n);
                var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
                return 0 === cmp ? (r.words[0] = 0, r.length = 1) : cmp > 0 ? r.isub(this.p) : r.strip(), 
                r;
            }, MPrime.prototype.split = function(input, out) {
                input.iushrn(this.n, 0, out);
            }, MPrime.prototype.imulK = function(num) {
                return num.imul(this.k);
            }, inherits(K256, MPrime), K256.prototype.split = function(input, output) {
                for (var outLen = Math.min(input.length, 9), i = 0; i < outLen; i++) output.words[i] = input.words[i];
                if (output.length = outLen, input.length <= 9) return input.words[0] = 0, void (input.length = 1);
                var prev = input.words[9];
                for (output.words[output.length++] = 4194303 & prev, i = 10; i < input.length; i++) {
                    var next = 0 | input.words[i];
                    input.words[i - 10] = (4194303 & next) << 4 | prev >>> 22, prev = next;
                }
                prev >>>= 22, input.words[i - 10] = prev, 0 === prev && input.length > 10 ? input.length -= 10 : input.length -= 9;
            }, K256.prototype.imulK = function(num) {
                num.words[num.length] = 0, num.words[num.length + 1] = 0, num.length += 2;
                for (var lo = 0, i = 0; i < num.length; i++) {
                    var w = 0 | num.words[i];
                    lo += 977 * w, num.words[i] = 67108863 & lo, lo = 64 * w + (lo / 67108864 | 0);
                }
                return 0 === num.words[num.length - 1] && (num.length--, 0 === num.words[num.length - 1] && num.length--), 
                num;
            }, inherits(P224, MPrime), inherits(P192, MPrime), inherits(P25519, MPrime), P25519.prototype.imulK = function(num) {
                for (var carry = 0, i = 0; i < num.length; i++) {
                    var hi = 19 * (0 | num.words[i]) + carry, lo = 67108863 & hi;
                    hi >>>= 26, num.words[i] = lo, carry = hi;
                }
                return 0 !== carry && (num.words[num.length++] = carry), num;
            }, BN._prime = function(name) {
                if (primes[name]) return primes[name];
                var prime;
                if ("k256" === name) prime = new K256; else if ("p224" === name) prime = new P224; else if ("p192" === name) prime = new P192; else {
                    if ("p25519" !== name) throw new Error("Unknown prime " + name);
                    prime = new P25519;
                }
                return primes[name] = prime, prime;
            }, Red.prototype._verify1 = function(a) {
                assert(0 === a.negative, "red works only with positives"), assert(a.red, "red works only with red numbers");
            }, Red.prototype._verify2 = function(a, b) {
                assert(0 == (a.negative | b.negative), "red works only with positives"), assert(a.red && a.red === b.red, "red works only with red numbers");
            }, Red.prototype.imod = function(a) {
                return this.prime ? this.prime.ireduce(a)._forceRed(this) : a.umod(this.m)._forceRed(this);
            }, Red.prototype.neg = function(a) {
                return a.isZero() ? a.clone() : this.m.sub(a)._forceRed(this);
            }, Red.prototype.add = function(a, b) {
                this._verify2(a, b);
                var res = a.add(b);
                return res.cmp(this.m) >= 0 && res.isub(this.m), res._forceRed(this);
            }, Red.prototype.iadd = function(a, b) {
                this._verify2(a, b);
                var res = a.iadd(b);
                return res.cmp(this.m) >= 0 && res.isub(this.m), res;
            }, Red.prototype.sub = function(a, b) {
                this._verify2(a, b);
                var res = a.sub(b);
                return res.cmpn(0) < 0 && res.iadd(this.m), res._forceRed(this);
            }, Red.prototype.isub = function(a, b) {
                this._verify2(a, b);
                var res = a.isub(b);
                return res.cmpn(0) < 0 && res.iadd(this.m), res;
            }, Red.prototype.shl = function(a, num) {
                return this._verify1(a), this.imod(a.ushln(num));
            }, Red.prototype.imul = function(a, b) {
                return this._verify2(a, b), this.imod(a.imul(b));
            }, Red.prototype.mul = function(a, b) {
                return this._verify2(a, b), this.imod(a.mul(b));
            }, Red.prototype.isqr = function(a) {
                return this.imul(a, a.clone());
            }, Red.prototype.sqr = function(a) {
                return this.mul(a, a);
            }, Red.prototype.sqrt = function(a) {
                if (a.isZero()) return a.clone();
                var mod3 = this.m.andln(3);
                if (assert(mod3 % 2 == 1), 3 === mod3) {
                    var pow = this.m.add(new BN(1)).iushrn(2);
                    return this.pow(a, pow);
                }
                for (var q = this.m.subn(1), s = 0; !q.isZero() && 0 === q.andln(1); ) s++, q.iushrn(1);
                assert(!q.isZero());
                var one = new BN(1).toRed(this), nOne = one.redNeg(), lpow = this.m.subn(1).iushrn(1), z = this.m.bitLength();
                for (z = new BN(2 * z * z).toRed(this); 0 !== this.pow(z, lpow).cmp(nOne); ) z.redIAdd(nOne);
                for (var c = this.pow(z, q), r = this.pow(a, q.addn(1).iushrn(1)), t = this.pow(a, q), m = s; 0 !== t.cmp(one); ) {
                    for (var tmp = t, i = 0; 0 !== tmp.cmp(one); i++) tmp = tmp.redSqr();
                    assert(i < m);
                    var b = this.pow(c, new BN(1).iushln(m - i - 1));
                    r = r.redMul(b), c = b.redSqr(), t = t.redMul(c), m = i;
                }
                return r;
            }, Red.prototype.invm = function(a) {
                var inv = a._invmp(this.m);
                return 0 !== inv.negative ? (inv.negative = 0, this.imod(inv).redNeg()) : this.imod(inv);
            }, Red.prototype.pow = function(a, num) {
                if (num.isZero()) return new BN(1).toRed(this);
                if (0 === num.cmpn(1)) return a.clone();
                var wnd = new Array(16);
                wnd[0] = new BN(1).toRed(this), wnd[1] = a;
                for (var i = 2; i < wnd.length; i++) wnd[i] = this.mul(wnd[i - 1], a);
                var res = wnd[0], current = 0, currentLen = 0, start = num.bitLength() % 26;
                for (0 === start && (start = 26), i = num.length - 1; i >= 0; i--) {
                    for (var word = num.words[i], j = start - 1; j >= 0; j--) {
                        var bit = word >> j & 1;
                        res !== wnd[0] && (res = this.sqr(res)), 0 !== bit || 0 !== current ? (current <<= 1, 
                        current |= bit, (4 == ++currentLen || 0 === i && 0 === j) && (res = this.mul(res, wnd[current]), 
                        currentLen = 0, current = 0)) : currentLen = 0;
                    }
                    start = 26;
                }
                return res;
            }, Red.prototype.convertTo = function(num) {
                var r = num.umod(this.m);
                return r === num ? r.clone() : r;
            }, Red.prototype.convertFrom = function(num) {
                var res = num.clone();
                return res.red = null, res;
            }, BN.mont = function(num) {
                return new Mont(num);
            }, inherits(Mont, Red), Mont.prototype.convertTo = function(num) {
                return this.imod(num.ushln(this.shift));
            }, Mont.prototype.convertFrom = function(num) {
                var r = this.imod(num.mul(this.rinv));
                return r.red = null, r;
            }, Mont.prototype.imul = function(a, b) {
                if (a.isZero() || b.isZero()) return a.words[0] = 0, a.length = 1, a;
                var t = a.imul(b), c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m), u = t.isub(c).iushrn(this.shift), res = u;
                return u.cmp(this.m) >= 0 ? res = u.isub(this.m) : u.cmpn(0) < 0 && (res = u.iadd(this.m)), 
                res._forceRed(this);
            }, Mont.prototype.mul = function(a, b) {
                if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this);
                var t = a.mul(b), c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m), u = t.isub(c).iushrn(this.shift), res = u;
                return u.cmp(this.m) >= 0 ? res = u.isub(this.m) : u.cmpn(0) < 0 && (res = u.iadd(this.m)), 
                res._forceRed(this);
            }, Mont.prototype.invm = function(a) {
                return this.imod(a._invmp(this.m).mul(this.r2))._forceRed(this);
            };
        })(module, this);
    }).call(this, __webpack_require__(62)(module));
}
