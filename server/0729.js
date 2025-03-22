function(module, exports, __webpack_require__) {
    var BufferIO = __webpack_require__(730).BufferIO, bops = __webpack_require__(177);
    exports.inflate = function(input) {
        var slide, wp, fixed_td, fixed_bl, bit_buf, bit_len, method, eof, copy_leng, copy_dist, tl, td, bl, bd, inflate_data, inflate_pos, fixed_tl = null, MASK_BITS = [ 0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191, 16383, 32767, 65535 ], cplens = [ 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0 ], cplext = [ 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 99, 99 ], cpdist = [ 1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577 ], cpdext = [ 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13 ], border = [ 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15 ];
        function HuftList() {
            this.next = null, this.list = null;
        }
        function HuftNode() {
            this.e = 0, this.b = 0, this.n = 0, this.t = null;
        }
        function HuftBuild(b, n, s, d, e, mm) {
            this.BMAX = 16, this.N_MAX = 288, this.status = 0, this.root = null, this.m = 0;
            var a, el, f, g, h, i, j, k, p, pidx, q, w, xp, y, z, o, tail, c = new Array(this.BMAX + 1), lx = new Array(this.BMAX + 1), r = new HuftNode, u = new Array(this.BMAX), v = new Array(this.N_MAX), x = new Array(this.BMAX + 1);
            for (tail = this.root = null, i = 0; i < c.length; i++) c[i] = 0;
            for (i = 0; i < lx.length; i++) lx[i] = 0;
            for (i = 0; i < u.length; i++) u[i] = null;
            for (i = 0; i < v.length; i++) v[i] = 0;
            for (i = 0; i < x.length; i++) x[i] = 0;
            el = n > 256 ? b[256] : this.BMAX, p = b, pidx = 0, i = n;
            do {
                c[p[pidx]]++, pidx++;
            } while (--i > 0);
            if (c[0] == n) return this.root = null, this.m = 0, void (this.status = 0);
            for (j = 1; j <= this.BMAX && 0 == c[j]; j++) ;
            for (k = j, mm < j && (mm = j), i = this.BMAX; 0 != i && 0 == c[i]; i--) ;
            for (g = i, mm > i && (mm = i), y = 1 << j; j < i; j++, y <<= 1) if ((y -= c[j]) < 0) return this.status = 2, 
            void (this.m = mm);
            if ((y -= c[i]) < 0) return this.status = 2, void (this.m = mm);
            for (c[i] += y, x[1] = j = 0, p = c, pidx = 1, xp = 2; --i > 0; ) x[xp++] = j += p[pidx++];
            p = b, pidx = 0, i = 0;
            do {
                0 != (j = p[pidx++]) && (v[x[j]++] = i);
            } while (++i < n);
            for (n = x[g], x[0] = i = 0, p = v, pidx = 0, h = -1, w = lx[0] = 0, q = null, z = 0; k <= g; k++) for (a = c[k]; a-- > 0; ) {
                for (;k > w + lx[1 + h]; ) {
                    if (w += lx[1 + h], h++, z = (z = g - w) > mm ? mm : z, (f = 1 << (j = k - w)) > a + 1) for (f -= a + 1, 
                    xp = k; ++j < z && !((f <<= 1) <= c[++xp]); ) f -= c[xp];
                    for (w + j > el && w < el && (j = el - w), z = 1 << j, lx[1 + h] = j, q = new Array(z), 
                    o = 0; o < z; o++) q[o] = new HuftNode;
                    (tail = null == tail ? this.root = new HuftList : tail.next = new HuftList).next = null, 
                    tail.list = q, u[h] = q, h > 0 && (x[h] = i, r.b = lx[h], r.e = 16 + j, r.t = q, 
                    j = (i & (1 << w) - 1) >> w - lx[h], u[h - 1][j].e = r.e, u[h - 1][j].b = r.b, u[h - 1][j].n = r.n, 
                    u[h - 1][j].t = r.t);
                }
                for (r.b = k - w, pidx >= n ? r.e = 99 : p[pidx] < s ? (r.e = p[pidx] < 256 ? 16 : 15, 
                r.n = p[pidx++]) : (r.e = e[p[pidx] - s], r.n = d[p[pidx++] - s]), f = 1 << k - w, 
                j = i >> w; j < z; j += f) q[j].e = r.e, q[j].b = r.b, q[j].n = r.n, q[j].t = r.t;
                for (j = 1 << k - 1; 0 != (i & j); j >>= 1) i ^= j;
                for (i ^= j; (i & (1 << w) - 1) != x[h]; ) w -= lx[h], h--;
            }
            this.m = lx[1], this.status = 0 != y && 1 != g ? 1 : 0;
        }
        function NEEDBITS(n) {
            for (;bit_len < n; ) bit_buf |= (inflate_data.length == inflate_pos ? -1 : bops.readUInt8(inflate_data, inflate_pos++)) << bit_len, 
            bit_len += 8;
        }
        function GETBITS(n) {
            return bit_buf & MASK_BITS[n];
        }
        function DUMPBITS(n) {
            bit_buf >>= n, bit_len -= n;
        }
        function inflate_codes(buff, off, size) {
            var e, t, n;
            if (0 == size) return 0;
            for (n = 0; ;) {
                for (NEEDBITS(bl), e = (t = tl.list[GETBITS(bl)]).e; e > 16; ) {
                    if (99 == e) return -1;
                    DUMPBITS(t.b), NEEDBITS(e -= 16), e = (t = t.t[GETBITS(e)]).e;
                }
                if (DUMPBITS(t.b), 16 != e) {
                    if (15 == e) break;
                    for (NEEDBITS(e), copy_leng = t.n + GETBITS(e), DUMPBITS(e), NEEDBITS(bd), e = (t = td.list[GETBITS(bd)]).e; e > 16; ) {
                        if (99 == e) return -1;
                        DUMPBITS(t.b), NEEDBITS(e -= 16), e = (t = t.t[GETBITS(e)]).e;
                    }
                    for (DUMPBITS(t.b), NEEDBITS(e), copy_dist = wp - t.n - GETBITS(e), DUMPBITS(e); copy_leng > 0 && n < size; ) copy_leng--, 
                    copy_dist &= 32767, wp &= 32767, buff[off + n++] = slide[wp++] = slide[copy_dist++];
                    if (n == size) return size;
                } else if (wp &= 32767, buff[off + n++] = slide[wp++] = t.n, n == size) return size;
            }
            return method = -1, n;
        }
        function inflate_stored(buff, off, size) {
            var n;
            if (DUMPBITS(n = 7 & bit_len), NEEDBITS(16), n = GETBITS(16), DUMPBITS(16), NEEDBITS(16), 
            n != (65535 & ~bit_buf)) return -1;
            for (DUMPBITS(16), copy_leng = n, n = 0; copy_leng > 0 && n < size; ) copy_leng--, 
            wp &= 32767, NEEDBITS(8), buff[off + n++] = slide[wp++] = GETBITS(8), DUMPBITS(8);
            return 0 == copy_leng && (method = -1), n;
        }
        function inflate_fixed(buff, off, size) {
            if (null == fixed_tl) {
                var i, h, l = new Array(288);
                for (i = 0; i < 144; i++) l[i] = 8;
                for (;i < 256; i++) l[i] = 9;
                for (;i < 280; i++) l[i] = 7;
                for (;i < 288; i++) l[i] = 8;
                if (0 != (h = new HuftBuild(l, 288, 257, cplens, cplext, fixed_bl = 7)).status) return alert("HufBuild error: " + h.status), 
                -1;
                for (fixed_tl = h.root, fixed_bl = h.m, i = 0; i < 30; i++) l[i] = 5;
                var fixed_bd = 5;
                if ((h = new HuftBuild(l, 30, 0, cpdist, cpdext, fixed_bd)).status > 1) return fixed_tl = null, 
                alert("HufBuild error: " + h.status), -1;
                fixed_td = h.root, fixed_bd = h.m;
            }
            return tl = fixed_tl, td = fixed_td, bl = fixed_bl, bd = fixed_bd, inflate_codes(buff, off, size);
        }
        function inflate_dynamic(buff, off, size) {
            var i, j, l, n, t, nb, nl, nd, h, ll = new Array(316);
            for (i = 0; i < ll.length; i++) ll[i] = 0;
            if (NEEDBITS(5), nl = 257 + GETBITS(5), DUMPBITS(5), NEEDBITS(5), nd = 1 + GETBITS(5), 
            DUMPBITS(5), NEEDBITS(4), nb = 4 + GETBITS(4), DUMPBITS(4), nl > 286 || nd > 30) return -1;
            for (j = 0; j < nb; j++) NEEDBITS(3), ll[border[j]] = GETBITS(3), DUMPBITS(3);
            for (;j < 19; j++) ll[border[j]] = 0;
            if (0 != (h = new HuftBuild(ll, 19, 19, null, null, bl = 7)).status) return -1;
            for (tl = h.root, bl = h.m, n = nl + nd, i = l = 0; i < n; ) if (NEEDBITS(bl), DUMPBITS(j = (t = tl.list[GETBITS(bl)]).b), 
            (j = t.n) < 16) ll[i++] = l = j; else if (16 == j) {
                if (NEEDBITS(2), j = 3 + GETBITS(2), DUMPBITS(2), i + j > n) return -1;
                for (;j-- > 0; ) ll[i++] = l;
            } else if (17 == j) {
                if (NEEDBITS(3), j = 3 + GETBITS(3), DUMPBITS(3), i + j > n) return -1;
                for (;j-- > 0; ) ll[i++] = 0;
                l = 0;
            } else {
                if (NEEDBITS(7), j = 11 + GETBITS(7), DUMPBITS(7), i + j > n) return -1;
                for (;j-- > 0; ) ll[i++] = 0;
                l = 0;
            }
            if (h = new HuftBuild(ll, nl, 257, cplens, cplext, bl = 9), 0 == bl && (h.status = 1), 
            0 != h.status) return h.status, -1;
            for (tl = h.root, bl = h.m, i = 0; i < nd; i++) ll[i] = ll[i + nl];
            return h = new HuftBuild(ll, nd, 0, cpdist, cpdext, bd = 6), td = h.root, 0 == (bd = h.m) && nl > 257 ? -1 : (h.status, 
            0 != h.status ? -1 : inflate_codes(buff, off, size));
        }
        function inflate_internal(buff, off, size) {
            var n, i;
            for (n = 0; n < size; ) {
                if (eof && -1 == method) return n;
                if (copy_leng > 0) {
                    if (0 != method) for (;copy_leng > 0 && n < size; ) copy_leng--, copy_dist &= 32767, 
                    wp &= 32767, buff[off + n++] = slide[wp++] = slide[copy_dist++]; else {
                        for (;copy_leng > 0 && n < size; ) copy_leng--, wp &= 32767, NEEDBITS(8), buff[off + n++] = slide[wp++] = GETBITS(8), 
                        DUMPBITS(8);
                        0 == copy_leng && (method = -1);
                    }
                    if (n == size) return n;
                }
                if (-1 == method) {
                    if (eof) break;
                    NEEDBITS(1), 0 != GETBITS(1) && (eof = !0), DUMPBITS(1), NEEDBITS(2), method = GETBITS(2), 
                    DUMPBITS(2), tl = null, copy_leng = 0;
                }
                switch (method) {
                  case 0:
                    i = inflate_stored(buff, off + n, size - n);
                    break;

                  case 1:
                    i = null != tl ? inflate_codes(buff, off + n, size - n) : inflate_fixed(buff, off + n, size - n);
                    break;

                  case 2:
                    i = null != tl ? inflate_codes(buff, off + n, size - n) : inflate_dynamic(buff, off + n, size - n);
                    break;

                  default:
                    i = -1;
                }
                if (-1 == i) return eof ? 0 : -1;
                n += i;
            }
            return n;
        }
        return (function(bytes) {
            var out, buff, i;
            for (null == slide && (slide = new Array(65536)), wp = 0, bit_buf = 0, bit_len = 0, 
            method = -1, eof = !1, copy_leng = copy_dist = 0, tl = null, inflate_data = bytes, 
            inflate_pos = 0, buff = new Array(1024), out = new BufferIO; (i = inflate_internal(buff, 0, buff.length)) > 0; ) out.write(buff.slice(0, i));
            return inflate_data = void 0, out.toBuffer();
        })(input);
    };
}
