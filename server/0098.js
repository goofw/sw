function(module, exports, __webpack_require__) {
    (function() {
        var dbits;
        function BigInteger(a, b, c) {
            null != a && ("number" == typeof a ? this.fromNumber(a, b, c) : null == b && "string" != typeof a ? this.fromString(a, 256) : this.fromString(a, b));
        }
        function nbi() {
            return new BigInteger(null);
        }
        var inBrowser = "undefined" != typeof navigator;
        inBrowser && "Microsoft Internet Explorer" == navigator.appName ? (BigInteger.prototype.am = function(i, x, w, j, c, n) {
            for (var xl = 32767 & x, xh = x >> 15; --n >= 0; ) {
                var l = 32767 & this[i], h = this[i++] >> 15, m = xh * l + h * xl;
                c = ((l = xl * l + ((32767 & m) << 15) + w[j] + (1073741823 & c)) >>> 30) + (m >>> 15) + xh * h + (c >>> 30), 
                w[j++] = 1073741823 & l;
            }
            return c;
        }, dbits = 30) : inBrowser && "Netscape" != navigator.appName ? (BigInteger.prototype.am = function(i, x, w, j, c, n) {
            for (;--n >= 0; ) {
                var v = x * this[i++] + w[j] + c;
                c = Math.floor(v / 67108864), w[j++] = 67108863 & v;
            }
            return c;
        }, dbits = 26) : (BigInteger.prototype.am = function(i, x, w, j, c, n) {
            for (var xl = 16383 & x, xh = x >> 14; --n >= 0; ) {
                var l = 16383 & this[i], h = this[i++] >> 14, m = xh * l + h * xl;
                c = ((l = xl * l + ((16383 & m) << 14) + w[j] + c) >> 28) + (m >> 14) + xh * h, 
                w[j++] = 268435455 & l;
            }
            return c;
        }, dbits = 28), BigInteger.prototype.DB = dbits, BigInteger.prototype.DM = (1 << dbits) - 1, 
        BigInteger.prototype.DV = 1 << dbits, BigInteger.prototype.FV = Math.pow(2, 52), 
        BigInteger.prototype.F1 = 52 - dbits, BigInteger.prototype.F2 = 2 * dbits - 52;
        var rr, vv, BI_RC = new Array;
        for (rr = "0".charCodeAt(0), vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
        for (rr = "a".charCodeAt(0), vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
        for (rr = "A".charCodeAt(0), vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
        function int2char(n) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(n);
        }
        function intAt(s, i) {
            var c = BI_RC[s.charCodeAt(i)];
            return null == c ? -1 : c;
        }
        function nbv(i) {
            var r = nbi();
            return r.fromInt(i), r;
        }
        function nbits(x) {
            var t, r = 1;
            return 0 != (t = x >>> 16) && (x = t, r += 16), 0 != (t = x >> 8) && (x = t, r += 8), 
            0 != (t = x >> 4) && (x = t, r += 4), 0 != (t = x >> 2) && (x = t, r += 2), 0 != (t = x >> 1) && (x = t, 
            r += 1), r;
        }
        function Classic(m) {
            this.m = m;
        }
        function Montgomery(m) {
            this.m = m, this.mp = m.invDigit(), this.mpl = 32767 & this.mp, this.mph = this.mp >> 15, 
            this.um = (1 << m.DB - 15) - 1, this.mt2 = 2 * m.t;
        }
        function op_and(x, y) {
            return x & y;
        }
        function op_or(x, y) {
            return x | y;
        }
        function op_xor(x, y) {
            return x ^ y;
        }
        function op_andnot(x, y) {
            return x & ~y;
        }
        function lbit(x) {
            if (0 == x) return -1;
            var r = 0;
            return 0 == (65535 & x) && (x >>= 16, r += 16), 0 == (255 & x) && (x >>= 8, r += 8), 
            0 == (15 & x) && (x >>= 4, r += 4), 0 == (3 & x) && (x >>= 2, r += 2), 0 == (1 & x) && ++r, 
            r;
        }
        function cbit(x) {
            for (var r = 0; 0 != x; ) x &= x - 1, ++r;
            return r;
        }
        function NullExp() {}
        function nNop(x) {
            return x;
        }
        function Barrett(m) {
            this.r2 = nbi(), this.q3 = nbi(), BigInteger.ONE.dlShiftTo(2 * m.t, this.r2), this.mu = this.r2.divide(m), 
            this.m = m;
        }
        Classic.prototype.convert = function(x) {
            return x.s < 0 || x.compareTo(this.m) >= 0 ? x.mod(this.m) : x;
        }, Classic.prototype.revert = function(x) {
            return x;
        }, Classic.prototype.reduce = function(x) {
            x.divRemTo(this.m, null, x);
        }, Classic.prototype.mulTo = function(x, y, r) {
            x.multiplyTo(y, r), this.reduce(r);
        }, Classic.prototype.sqrTo = function(x, r) {
            x.squareTo(r), this.reduce(r);
        }, Montgomery.prototype.convert = function(x) {
            var r = nbi();
            return x.abs().dlShiftTo(this.m.t, r), r.divRemTo(this.m, null, r), x.s < 0 && r.compareTo(BigInteger.ZERO) > 0 && this.m.subTo(r, r), 
            r;
        }, Montgomery.prototype.revert = function(x) {
            var r = nbi();
            return x.copyTo(r), this.reduce(r), r;
        }, Montgomery.prototype.reduce = function(x) {
            for (;x.t <= this.mt2; ) x[x.t++] = 0;
            for (var i = 0; i < this.m.t; ++i) {
                var j = 32767 & x[i], u0 = j * this.mpl + ((j * this.mph + (x[i] >> 15) * this.mpl & this.um) << 15) & x.DM;
                for (x[j = i + this.m.t] += this.m.am(0, u0, x, i, 0, this.m.t); x[j] >= x.DV; ) x[j] -= x.DV, 
                x[++j]++;
            }
            x.clamp(), x.drShiftTo(this.m.t, x), x.compareTo(this.m) >= 0 && x.subTo(this.m, x);
        }, Montgomery.prototype.mulTo = function(x, y, r) {
            x.multiplyTo(y, r), this.reduce(r);
        }, Montgomery.prototype.sqrTo = function(x, r) {
            x.squareTo(r), this.reduce(r);
        }, BigInteger.prototype.copyTo = function(r) {
            for (var i = this.t - 1; i >= 0; --i) r[i] = this[i];
            r.t = this.t, r.s = this.s;
        }, BigInteger.prototype.fromInt = function(x) {
            this.t = 1, this.s = x < 0 ? -1 : 0, x > 0 ? this[0] = x : x < -1 ? this[0] = x + this.DV : this.t = 0;
        }, BigInteger.prototype.fromString = function(s, b) {
            var k;
            if (16 == b) k = 4; else if (8 == b) k = 3; else if (256 == b) k = 8; else if (2 == b) k = 1; else if (32 == b) k = 5; else {
                if (4 != b) return void this.fromRadix(s, b);
                k = 2;
            }
            this.t = 0, this.s = 0;
            for (var i = s.length, mi = !1, sh = 0; --i >= 0; ) {
                var x = 8 == k ? 255 & s[i] : intAt(s, i);
                x < 0 ? "-" == s.charAt(i) && (mi = !0) : (mi = !1, 0 == sh ? this[this.t++] = x : sh + k > this.DB ? (this[this.t - 1] |= (x & (1 << this.DB - sh) - 1) << sh, 
                this[this.t++] = x >> this.DB - sh) : this[this.t - 1] |= x << sh, (sh += k) >= this.DB && (sh -= this.DB));
            }
            8 == k && 0 != (128 & s[0]) && (this.s = -1, sh > 0 && (this[this.t - 1] |= (1 << this.DB - sh) - 1 << sh)), 
            this.clamp(), mi && BigInteger.ZERO.subTo(this, this);
        }, BigInteger.prototype.clamp = function() {
            for (var c = this.s & this.DM; this.t > 0 && this[this.t - 1] == c; ) --this.t;
        }, BigInteger.prototype.dlShiftTo = function(n, r) {
            var i;
            for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
            for (i = n - 1; i >= 0; --i) r[i] = 0;
            r.t = this.t + n, r.s = this.s;
        }, BigInteger.prototype.drShiftTo = function(n, r) {
            for (var i = n; i < this.t; ++i) r[i - n] = this[i];
            r.t = Math.max(this.t - n, 0), r.s = this.s;
        }, BigInteger.prototype.lShiftTo = function(n, r) {
            var i, bs = n % this.DB, cbs = this.DB - bs, bm = (1 << cbs) - 1, ds = Math.floor(n / this.DB), c = this.s << bs & this.DM;
            for (i = this.t - 1; i >= 0; --i) r[i + ds + 1] = this[i] >> cbs | c, c = (this[i] & bm) << bs;
            for (i = ds - 1; i >= 0; --i) r[i] = 0;
            r[ds] = c, r.t = this.t + ds + 1, r.s = this.s, r.clamp();
        }, BigInteger.prototype.rShiftTo = function(n, r) {
            r.s = this.s;
            var ds = Math.floor(n / this.DB);
            if (ds >= this.t) r.t = 0; else {
                var bs = n % this.DB, cbs = this.DB - bs, bm = (1 << bs) - 1;
                r[0] = this[ds] >> bs;
                for (var i = ds + 1; i < this.t; ++i) r[i - ds - 1] |= (this[i] & bm) << cbs, r[i - ds] = this[i] >> bs;
                bs > 0 && (r[this.t - ds - 1] |= (this.s & bm) << cbs), r.t = this.t - ds, r.clamp();
            }
        }, BigInteger.prototype.subTo = function(a, r) {
            for (var i = 0, c = 0, m = Math.min(a.t, this.t); i < m; ) c += this[i] - a[i], 
            r[i++] = c & this.DM, c >>= this.DB;
            if (a.t < this.t) {
                for (c -= a.s; i < this.t; ) c += this[i], r[i++] = c & this.DM, c >>= this.DB;
                c += this.s;
            } else {
                for (c += this.s; i < a.t; ) c -= a[i], r[i++] = c & this.DM, c >>= this.DB;
                c -= a.s;
            }
            r.s = c < 0 ? -1 : 0, c < -1 ? r[i++] = this.DV + c : c > 0 && (r[i++] = c), r.t = i, 
            r.clamp();
        }, BigInteger.prototype.multiplyTo = function(a, r) {
            var x = this.abs(), y = a.abs(), i = x.t;
            for (r.t = i + y.t; --i >= 0; ) r[i] = 0;
            for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
            r.s = 0, r.clamp(), this.s != a.s && BigInteger.ZERO.subTo(r, r);
        }, BigInteger.prototype.squareTo = function(r) {
            for (var x = this.abs(), i = r.t = 2 * x.t; --i >= 0; ) r[i] = 0;
            for (i = 0; i < x.t - 1; ++i) {
                var c = x.am(i, x[i], r, 2 * i, 0, 1);
                (r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV && (r[i + x.t] -= x.DV, 
                r[i + x.t + 1] = 1);
            }
            r.t > 0 && (r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1)), r.s = 0, r.clamp();
        }, BigInteger.prototype.divRemTo = function(m, q, r) {
            var pm = m.abs();
            if (!(pm.t <= 0)) {
                var pt = this.abs();
                if (pt.t < pm.t) return null != q && q.fromInt(0), void (null != r && this.copyTo(r));
                null == r && (r = nbi());
                var y = nbi(), ts = this.s, ms = m.s, nsh = this.DB - nbits(pm[pm.t - 1]);
                nsh > 0 ? (pm.lShiftTo(nsh, y), pt.lShiftTo(nsh, r)) : (pm.copyTo(y), pt.copyTo(r));
                var ys = y.t, y0 = y[ys - 1];
                if (0 != y0) {
                    var yt = y0 * (1 << this.F1) + (ys > 1 ? y[ys - 2] >> this.F2 : 0), d1 = this.FV / yt, d2 = (1 << this.F1) / yt, e = 1 << this.F2, i = r.t, j = i - ys, t = null == q ? nbi() : q;
                    for (y.dlShiftTo(j, t), r.compareTo(t) >= 0 && (r[r.t++] = 1, r.subTo(t, r)), BigInteger.ONE.dlShiftTo(ys, t), 
                    t.subTo(y, y); y.t < ys; ) y[y.t++] = 0;
                    for (;--j >= 0; ) {
                        var qd = r[--i] == y0 ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
                        if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) for (y.dlShiftTo(j, t), r.subTo(t, r); r[i] < --qd; ) r.subTo(t, r);
                    }
                    null != q && (r.drShiftTo(ys, q), ts != ms && BigInteger.ZERO.subTo(q, q)), r.t = ys, 
                    r.clamp(), nsh > 0 && r.rShiftTo(nsh, r), ts < 0 && BigInteger.ZERO.subTo(r, r);
                }
            }
        }, BigInteger.prototype.invDigit = function() {
            if (this.t < 1) return 0;
            var x = this[0];
            if (0 == (1 & x)) return 0;
            var y = 3 & x;
            return (y = (y = (y = (y = y * (2 - (15 & x) * y) & 15) * (2 - (255 & x) * y) & 255) * (2 - ((65535 & x) * y & 65535)) & 65535) * (2 - x * y % this.DV) % this.DV) > 0 ? this.DV - y : -y;
        }, BigInteger.prototype.isEven = function() {
            return 0 == (this.t > 0 ? 1 & this[0] : this.s);
        }, BigInteger.prototype.exp = function(e, z) {
            if (e > 4294967295 || e < 1) return BigInteger.ONE;
            var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e) - 1;
            for (g.copyTo(r); --i >= 0; ) if (z.sqrTo(r, r2), (e & 1 << i) > 0) z.mulTo(r2, g, r); else {
                var t = r;
                r = r2, r2 = t;
            }
            return z.revert(r);
        }, BigInteger.prototype.toString = function(b) {
            if (this.s < 0) return "-" + this.negate().toString(b);
            var k;
            if (16 == b) k = 4; else if (8 == b) k = 3; else if (2 == b) k = 1; else if (32 == b) k = 5; else {
                if (4 != b) return this.toRadix(b);
                k = 2;
            }
            var d, km = (1 << k) - 1, m = !1, r = "", i = this.t, p = this.DB - i * this.DB % k;
            if (i-- > 0) for (p < this.DB && (d = this[i] >> p) > 0 && (m = !0, r = int2char(d)); i >= 0; ) p < k ? (d = (this[i] & (1 << p) - 1) << k - p, 
            d |= this[--i] >> (p += this.DB - k)) : (d = this[i] >> (p -= k) & km, p <= 0 && (p += this.DB, 
            --i)), d > 0 && (m = !0), m && (r += int2char(d));
            return m ? r : "0";
        }, BigInteger.prototype.negate = function() {
            var r = nbi();
            return BigInteger.ZERO.subTo(this, r), r;
        }, BigInteger.prototype.abs = function() {
            return this.s < 0 ? this.negate() : this;
        }, BigInteger.prototype.compareTo = function(a) {
            var r = this.s - a.s;
            if (0 != r) return r;
            var i = this.t;
            if (0 != (r = i - a.t)) return this.s < 0 ? -r : r;
            for (;--i >= 0; ) if (0 != (r = this[i] - a[i])) return r;
            return 0;
        }, BigInteger.prototype.bitLength = function() {
            return this.t <= 0 ? 0 : this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ this.s & this.DM);
        }, BigInteger.prototype.mod = function(a) {
            var r = nbi();
            return this.abs().divRemTo(a, null, r), this.s < 0 && r.compareTo(BigInteger.ZERO) > 0 && a.subTo(r, r), 
            r;
        }, BigInteger.prototype.modPowInt = function(e, m) {
            var z;
            return z = e < 256 || m.isEven() ? new Classic(m) : new Montgomery(m), this.exp(e, z);
        }, BigInteger.ZERO = nbv(0), BigInteger.ONE = nbv(1), NullExp.prototype.convert = nNop, 
        NullExp.prototype.revert = nNop, NullExp.prototype.mulTo = function(x, y, r) {
            x.multiplyTo(y, r);
        }, NullExp.prototype.sqrTo = function(x, r) {
            x.squareTo(r);
        }, Barrett.prototype.convert = function(x) {
            if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m);
            if (x.compareTo(this.m) < 0) return x;
            var r = nbi();
            return x.copyTo(r), this.reduce(r), r;
        }, Barrett.prototype.revert = function(x) {
            return x;
        }, Barrett.prototype.reduce = function(x) {
            for (x.drShiftTo(this.m.t - 1, this.r2), x.t > this.m.t + 1 && (x.t = this.m.t + 1, 
            x.clamp()), this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3), this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2); x.compareTo(this.r2) < 0; ) x.dAddOffset(1, this.m.t + 1);
            for (x.subTo(this.r2, x); x.compareTo(this.m) >= 0; ) x.subTo(this.m, x);
        }, Barrett.prototype.mulTo = function(x, y, r) {
            x.multiplyTo(y, r), this.reduce(r);
        }, Barrett.prototype.sqrTo = function(x, r) {
            x.squareTo(r), this.reduce(r);
        };
        var rng_state, rng_pool, rng_pptr, lowprimes = [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997 ], lplim = (1 << 26) / lowprimes[lowprimes.length - 1];
        function rng_seed_time() {
            var x;
            x = (new Date).getTime(), rng_pool[rng_pptr++] ^= 255 & x, rng_pool[rng_pptr++] ^= x >> 8 & 255, 
            rng_pool[rng_pptr++] ^= x >> 16 & 255, rng_pool[rng_pptr++] ^= x >> 24 & 255, rng_pptr >= rng_psize && (rng_pptr -= rng_psize);
        }
        if (BigInteger.prototype.chunkSize = function(r) {
            return Math.floor(Math.LN2 * this.DB / Math.log(r));
        }, BigInteger.prototype.toRadix = function(b) {
            if (null == b && (b = 10), 0 == this.signum() || b < 2 || b > 36) return "0";
            var cs = this.chunkSize(b), a = Math.pow(b, cs), d = nbv(a), y = nbi(), z = nbi(), r = "";
            for (this.divRemTo(d, y, z); y.signum() > 0; ) r = (a + z.intValue()).toString(b).substr(1) + r, 
            y.divRemTo(d, y, z);
            return z.intValue().toString(b) + r;
        }, BigInteger.prototype.fromRadix = function(s, b) {
            this.fromInt(0), null == b && (b = 10);
            for (var cs = this.chunkSize(b), d = Math.pow(b, cs), mi = !1, j = 0, w = 0, i = 0; i < s.length; ++i) {
                var x = intAt(s, i);
                x < 0 ? "-" == s.charAt(i) && 0 == this.signum() && (mi = !0) : (w = b * w + x, 
                ++j >= cs && (this.dMultiply(d), this.dAddOffset(w, 0), j = 0, w = 0));
            }
            j > 0 && (this.dMultiply(Math.pow(b, j)), this.dAddOffset(w, 0)), mi && BigInteger.ZERO.subTo(this, this);
        }, BigInteger.prototype.fromNumber = function(a, b, c) {
            if ("number" == typeof b) if (a < 2) this.fromInt(1); else for (this.fromNumber(a, c), 
            this.testBit(a - 1) || this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, this), 
            this.isEven() && this.dAddOffset(1, 0); !this.isProbablePrime(b); ) this.dAddOffset(2, 0), 
            this.bitLength() > a && this.subTo(BigInteger.ONE.shiftLeft(a - 1), this); else {
                var x = new Array, t = 7 & a;
                x.length = 1 + (a >> 3), b.nextBytes(x), t > 0 ? x[0] &= (1 << t) - 1 : x[0] = 0, 
                this.fromString(x, 256);
            }
        }, BigInteger.prototype.bitwiseTo = function(a, op, r) {
            var i, f, m = Math.min(a.t, this.t);
            for (i = 0; i < m; ++i) r[i] = op(this[i], a[i]);
            if (a.t < this.t) {
                for (f = a.s & this.DM, i = m; i < this.t; ++i) r[i] = op(this[i], f);
                r.t = this.t;
            } else {
                for (f = this.s & this.DM, i = m; i < a.t; ++i) r[i] = op(f, a[i]);
                r.t = a.t;
            }
            r.s = op(this.s, a.s), r.clamp();
        }, BigInteger.prototype.changeBit = function(n, op) {
            var r = BigInteger.ONE.shiftLeft(n);
            return this.bitwiseTo(r, op, r), r;
        }, BigInteger.prototype.addTo = function(a, r) {
            for (var i = 0, c = 0, m = Math.min(a.t, this.t); i < m; ) c += this[i] + a[i], 
            r[i++] = c & this.DM, c >>= this.DB;
            if (a.t < this.t) {
                for (c += a.s; i < this.t; ) c += this[i], r[i++] = c & this.DM, c >>= this.DB;
                c += this.s;
            } else {
                for (c += this.s; i < a.t; ) c += a[i], r[i++] = c & this.DM, c >>= this.DB;
                c += a.s;
            }
            r.s = c < 0 ? -1 : 0, c > 0 ? r[i++] = c : c < -1 && (r[i++] = this.DV + c), r.t = i, 
            r.clamp();
        }, BigInteger.prototype.dMultiply = function(n) {
            this[this.t] = this.am(0, n - 1, this, 0, 0, this.t), ++this.t, this.clamp();
        }, BigInteger.prototype.dAddOffset = function(n, w) {
            if (0 != n) {
                for (;this.t <= w; ) this[this.t++] = 0;
                for (this[w] += n; this[w] >= this.DV; ) this[w] -= this.DV, ++w >= this.t && (this[this.t++] = 0), 
                ++this[w];
            }
        }, BigInteger.prototype.multiplyLowerTo = function(a, n, r) {
            var j, i = Math.min(this.t + a.t, n);
            for (r.s = 0, r.t = i; i > 0; ) r[--i] = 0;
            for (j = r.t - this.t; i < j; ++i) r[i + this.t] = this.am(0, a[i], r, i, 0, this.t);
            for (j = Math.min(a.t, n); i < j; ++i) this.am(0, a[i], r, i, 0, n - i);
            r.clamp();
        }, BigInteger.prototype.multiplyUpperTo = function(a, n, r) {
            --n;
            var i = r.t = this.t + a.t - n;
            for (r.s = 0; --i >= 0; ) r[i] = 0;
            for (i = Math.max(n - this.t, 0); i < a.t; ++i) r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n);
            r.clamp(), r.drShiftTo(1, r);
        }, BigInteger.prototype.modInt = function(n) {
            if (n <= 0) return 0;
            var d = this.DV % n, r = this.s < 0 ? n - 1 : 0;
            if (this.t > 0) if (0 == d) r = this[0] % n; else for (var i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % n;
            return r;
        }, BigInteger.prototype.millerRabin = function(t) {
            var n1 = this.subtract(BigInteger.ONE), k = n1.getLowestSetBit();
            if (k <= 0) return !1;
            var r = n1.shiftRight(k);
            (t = t + 1 >> 1) > lowprimes.length && (t = lowprimes.length);
            for (var a = nbi(), i = 0; i < t; ++i) {
                a.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]);
                var y = a.modPow(r, this);
                if (0 != y.compareTo(BigInteger.ONE) && 0 != y.compareTo(n1)) {
                    for (var j = 1; j++ < k && 0 != y.compareTo(n1); ) if (0 == (y = y.modPowInt(2, this)).compareTo(BigInteger.ONE)) return !1;
                    if (0 != y.compareTo(n1)) return !1;
                }
            }
            return !0;
        }, BigInteger.prototype.clone = function() {
            var r = nbi();
            return this.copyTo(r), r;
        }, BigInteger.prototype.intValue = function() {
            if (this.s < 0) {
                if (1 == this.t) return this[0] - this.DV;
                if (0 == this.t) return -1;
            } else {
                if (1 == this.t) return this[0];
                if (0 == this.t) return 0;
            }
            return (this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0];
        }, BigInteger.prototype.byteValue = function() {
            return 0 == this.t ? this.s : this[0] << 24 >> 24;
        }, BigInteger.prototype.shortValue = function() {
            return 0 == this.t ? this.s : this[0] << 16 >> 16;
        }, BigInteger.prototype.signum = function() {
            return this.s < 0 ? -1 : this.t <= 0 || 1 == this.t && this[0] <= 0 ? 0 : 1;
        }, BigInteger.prototype.toByteArray = function() {
            var i = this.t, r = new Array;
            r[0] = this.s;
            var d, p = this.DB - i * this.DB % 8, k = 0;
            if (i-- > 0) for (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p && (r[k++] = d | this.s << this.DB - p); i >= 0; ) p < 8 ? (d = (this[i] & (1 << p) - 1) << 8 - p, 
            d |= this[--i] >> (p += this.DB - 8)) : (d = this[i] >> (p -= 8) & 255, p <= 0 && (p += this.DB, 
            --i)), 0 != (128 & d) && (d |= -256), 0 == k && (128 & this.s) != (128 & d) && ++k, 
            (k > 0 || d != this.s) && (r[k++] = d);
            return r;
        }, BigInteger.prototype.equals = function(a) {
            return 0 == this.compareTo(a);
        }, BigInteger.prototype.min = function(a) {
            return this.compareTo(a) < 0 ? this : a;
        }, BigInteger.prototype.max = function(a) {
            return this.compareTo(a) > 0 ? this : a;
        }, BigInteger.prototype.and = function(a) {
            var r = nbi();
            return this.bitwiseTo(a, op_and, r), r;
        }, BigInteger.prototype.or = function(a) {
            var r = nbi();
            return this.bitwiseTo(a, op_or, r), r;
        }, BigInteger.prototype.xor = function(a) {
            var r = nbi();
            return this.bitwiseTo(a, op_xor, r), r;
        }, BigInteger.prototype.andNot = function(a) {
            var r = nbi();
            return this.bitwiseTo(a, op_andnot, r), r;
        }, BigInteger.prototype.not = function() {
            for (var r = nbi(), i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i];
            return r.t = this.t, r.s = ~this.s, r;
        }, BigInteger.prototype.shiftLeft = function(n) {
            var r = nbi();
            return n < 0 ? this.rShiftTo(-n, r) : this.lShiftTo(n, r), r;
        }, BigInteger.prototype.shiftRight = function(n) {
            var r = nbi();
            return n < 0 ? this.lShiftTo(-n, r) : this.rShiftTo(n, r), r;
        }, BigInteger.prototype.getLowestSetBit = function() {
            for (var i = 0; i < this.t; ++i) if (0 != this[i]) return i * this.DB + lbit(this[i]);
            return this.s < 0 ? this.t * this.DB : -1;
        }, BigInteger.prototype.bitCount = function() {
            for (var r = 0, x = this.s & this.DM, i = 0; i < this.t; ++i) r += cbit(this[i] ^ x);
            return r;
        }, BigInteger.prototype.testBit = function(n) {
            var j = Math.floor(n / this.DB);
            return j >= this.t ? 0 != this.s : 0 != (this[j] & 1 << n % this.DB);
        }, BigInteger.prototype.setBit = function(n) {
            return this.changeBit(n, op_or);
        }, BigInteger.prototype.clearBit = function(n) {
            return this.changeBit(n, op_andnot);
        }, BigInteger.prototype.flipBit = function(n) {
            return this.changeBit(n, op_xor);
        }, BigInteger.prototype.add = function(a) {
            var r = nbi();
            return this.addTo(a, r), r;
        }, BigInteger.prototype.subtract = function(a) {
            var r = nbi();
            return this.subTo(a, r), r;
        }, BigInteger.prototype.multiply = function(a) {
            var r = nbi();
            return this.multiplyTo(a, r), r;
        }, BigInteger.prototype.divide = function(a) {
            var r = nbi();
            return this.divRemTo(a, r, null), r;
        }, BigInteger.prototype.remainder = function(a) {
            var r = nbi();
            return this.divRemTo(a, null, r), r;
        }, BigInteger.prototype.divideAndRemainder = function(a) {
            var q = nbi(), r = nbi();
            return this.divRemTo(a, q, r), new Array(q, r);
        }, BigInteger.prototype.modPow = function(e, m) {
            var k, z, i = e.bitLength(), r = nbv(1);
            if (i <= 0) return r;
            k = i < 18 ? 1 : i < 48 ? 3 : i < 144 ? 4 : i < 768 ? 5 : 6, z = i < 8 ? new Classic(m) : m.isEven() ? new Barrett(m) : new Montgomery(m);
            var g = new Array, n = 3, k1 = k - 1, km = (1 << k) - 1;
            if (g[1] = z.convert(this), k > 1) {
                var g2 = nbi();
                for (z.sqrTo(g[1], g2); n <= km; ) g[n] = nbi(), z.mulTo(g2, g[n - 2], g[n]), n += 2;
            }
            var w, t, j = e.t - 1, is1 = !0, r2 = nbi();
            for (i = nbits(e[j]) - 1; j >= 0; ) {
                for (i >= k1 ? w = e[j] >> i - k1 & km : (w = (e[j] & (1 << i + 1) - 1) << k1 - i, 
                j > 0 && (w |= e[j - 1] >> this.DB + i - k1)), n = k; 0 == (1 & w); ) w >>= 1, --n;
                if ((i -= n) < 0 && (i += this.DB, --j), is1) g[w].copyTo(r), is1 = !1; else {
                    for (;n > 1; ) z.sqrTo(r, r2), z.sqrTo(r2, r), n -= 2;
                    n > 0 ? z.sqrTo(r, r2) : (t = r, r = r2, r2 = t), z.mulTo(r2, g[w], r);
                }
                for (;j >= 0 && 0 == (e[j] & 1 << i); ) z.sqrTo(r, r2), t = r, r = r2, r2 = t, --i < 0 && (i = this.DB - 1, 
                --j);
            }
            return z.revert(r);
        }, BigInteger.prototype.modInverse = function(m) {
            var ac = m.isEven();
            if (this.isEven() && ac || 0 == m.signum()) return BigInteger.ZERO;
            for (var u = m.clone(), v = this.clone(), a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1); 0 != u.signum(); ) {
                for (;u.isEven(); ) u.rShiftTo(1, u), ac ? (a.isEven() && b.isEven() || (a.addTo(this, a), 
                b.subTo(m, b)), a.rShiftTo(1, a)) : b.isEven() || b.subTo(m, b), b.rShiftTo(1, b);
                for (;v.isEven(); ) v.rShiftTo(1, v), ac ? (c.isEven() && d.isEven() || (c.addTo(this, c), 
                d.subTo(m, d)), c.rShiftTo(1, c)) : d.isEven() || d.subTo(m, d), d.rShiftTo(1, d);
                u.compareTo(v) >= 0 ? (u.subTo(v, u), ac && a.subTo(c, a), b.subTo(d, b)) : (v.subTo(u, v), 
                ac && c.subTo(a, c), d.subTo(b, d));
            }
            return 0 != v.compareTo(BigInteger.ONE) ? BigInteger.ZERO : d.compareTo(m) >= 0 ? d.subtract(m) : d.signum() < 0 ? (d.addTo(m, d), 
            d.signum() < 0 ? d.add(m) : d) : d;
        }, BigInteger.prototype.pow = function(e) {
            return this.exp(e, new NullExp);
        }, BigInteger.prototype.gcd = function(a) {
            var x = this.s < 0 ? this.negate() : this.clone(), y = a.s < 0 ? a.negate() : a.clone();
            if (x.compareTo(y) < 0) {
                var t = x;
                x = y, y = t;
            }
            var i = x.getLowestSetBit(), g = y.getLowestSetBit();
            if (g < 0) return x;
            for (i < g && (g = i), g > 0 && (x.rShiftTo(g, x), y.rShiftTo(g, y)); x.signum() > 0; ) (i = x.getLowestSetBit()) > 0 && x.rShiftTo(i, x), 
            (i = y.getLowestSetBit()) > 0 && y.rShiftTo(i, y), x.compareTo(y) >= 0 ? (x.subTo(y, x), 
            x.rShiftTo(1, x)) : (y.subTo(x, y), y.rShiftTo(1, y));
            return g > 0 && y.lShiftTo(g, y), y;
        }, BigInteger.prototype.isProbablePrime = function(t) {
            var i, x = this.abs();
            if (1 == x.t && x[0] <= lowprimes[lowprimes.length - 1]) {
                for (i = 0; i < lowprimes.length; ++i) if (x[0] == lowprimes[i]) return !0;
                return !1;
            }
            if (x.isEven()) return !1;
            for (i = 1; i < lowprimes.length; ) {
                for (var m = lowprimes[i], j = i + 1; j < lowprimes.length && m < lplim; ) m *= lowprimes[j++];
                for (m = x.modInt(m); i < j; ) if (m % lowprimes[i++] == 0) return !1;
            }
            return x.millerRabin(t);
        }, BigInteger.prototype.square = function() {
            var r = nbi();
            return this.squareTo(r), r;
        }, BigInteger.prototype.Barrett = Barrett, null == rng_pool) {
            var t;
            if (rng_pool = new Array, rng_pptr = 0, "undefined" != typeof window && window.crypto) if (window.crypto.getRandomValues) {
                var ua = new Uint8Array(32);
                for (window.crypto.getRandomValues(ua), t = 0; t < 32; ++t) rng_pool[rng_pptr++] = ua[t];
            } else if ("Netscape" == navigator.appName && navigator.appVersion < "5") {
                var z = window.crypto.random(32);
                for (t = 0; t < z.length; ++t) rng_pool[rng_pptr++] = 255 & z.charCodeAt(t);
            }
            for (;rng_pptr < rng_psize; ) t = Math.floor(65536 * Math.random()), rng_pool[rng_pptr++] = t >>> 8, 
            rng_pool[rng_pptr++] = 255 & t;
            rng_pptr = 0, rng_seed_time();
        }
        function rng_get_byte() {
            if (null == rng_state) {
                for (rng_seed_time(), (rng_state = new Arcfour).init(rng_pool), rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr) rng_pool[rng_pptr] = 0;
                rng_pptr = 0;
            }
            return rng_state.next();
        }
        function SecureRandom() {}
        function Arcfour() {
            this.i = 0, this.j = 0, this.S = new Array;
        }
        SecureRandom.prototype.nextBytes = function(ba) {
            var i;
            for (i = 0; i < ba.length; ++i) ba[i] = rng_get_byte();
        }, Arcfour.prototype.init = function(key) {
            var i, j, t;
            for (i = 0; i < 256; ++i) this.S[i] = i;
            for (j = 0, i = 0; i < 256; ++i) j = j + this.S[i] + key[i % key.length] & 255, 
            t = this.S[i], this.S[i] = this.S[j], this.S[j] = t;
            this.i = 0, this.j = 0;
        }, Arcfour.prototype.next = function() {
            var t;
            return this.i = this.i + 1 & 255, this.j = this.j + this.S[this.i] & 255, t = this.S[this.i], 
            this.S[this.i] = this.S[this.j], this.S[this.j] = t, this.S[t + this.S[this.i] & 255];
        };
        var rng_psize = 256;
        BigInteger.SecureRandom = SecureRandom, BigInteger.BigInteger = BigInteger, module.exports = BigInteger;
    }).call(this);
}
