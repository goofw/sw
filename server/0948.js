function(module, exports) {
    function Buffers(bufs) {
        if (!(this instanceof Buffers)) return new Buffers(bufs);
        this.buffers = bufs || [], this.length = this.buffers.reduce((function(size, buf) {
            return size + buf.length;
        }), 0);
    }
    module.exports = Buffers, Buffers.prototype.push = function() {
        for (var i = 0; i < arguments.length; i++) if (!Buffer.isBuffer(arguments[i])) throw new TypeError("Tried to push a non-buffer");
        for (i = 0; i < arguments.length; i++) {
            var buf = arguments[i];
            this.buffers.push(buf), this.length += buf.length;
        }
        return this.length;
    }, Buffers.prototype.unshift = function() {
        for (var i = 0; i < arguments.length; i++) if (!Buffer.isBuffer(arguments[i])) throw new TypeError("Tried to unshift a non-buffer");
        for (i = 0; i < arguments.length; i++) {
            var buf = arguments[i];
            this.buffers.unshift(buf), this.length += buf.length;
        }
        return this.length;
    }, Buffers.prototype.copy = function(dst, dStart, start, end) {
        return this.slice(start, end).copy(dst, dStart, 0, end - start);
    }, Buffers.prototype.splice = function(i, howMany) {
        var buffers = this.buffers, index = i >= 0 ? i : this.length - i, reps = [].slice.call(arguments, 2);
        for ((void 0 === howMany || howMany > this.length - index) && (howMany = this.length - index), 
        i = 0; i < reps.length; i++) this.length += reps[i].length;
        for (var removed = new Buffers, startBytes = 0, ii = 0; ii < buffers.length && startBytes + buffers[ii].length < index; ii++) startBytes += buffers[ii].length;
        if (index - startBytes > 0) {
            var start = index - startBytes;
            if (start + howMany < buffers[ii].length) {
                removed.push(buffers[ii].slice(start, start + howMany));
                var orig = buffers[ii], buf0 = new Buffer(start);
                for (i = 0; i < start; i++) buf0[i] = orig[i];
                var buf1 = new Buffer(orig.length - start - howMany);
                for (i = start + howMany; i < orig.length; i++) buf1[i - howMany - start] = orig[i];
                if (reps.length > 0) {
                    var reps_ = reps.slice();
                    reps_.unshift(buf0), reps_.push(buf1), buffers.splice.apply(buffers, [ ii, 1 ].concat(reps_)), 
                    ii += reps_.length, reps = [];
                } else buffers.splice(ii, 1, buf0, buf1), ii += 2;
            } else removed.push(buffers[ii].slice(start)), buffers[ii] = buffers[ii].slice(0, start), 
            ii++;
        }
        for (reps.length > 0 && (buffers.splice.apply(buffers, [ ii, 0 ].concat(reps)), 
        ii += reps.length); removed.length < howMany; ) {
            var buf = buffers[ii], len = buf.length, take = Math.min(len, howMany - removed.length);
            take === len ? (removed.push(buf), buffers.splice(ii, 1)) : (removed.push(buf.slice(0, take)), 
            buffers[ii] = buffers[ii].slice(take));
        }
        return this.length -= removed.length, removed;
    }, Buffers.prototype.slice = function(i, j) {
        var buffers = this.buffers;
        void 0 === j && (j = this.length), void 0 === i && (i = 0), j > this.length && (j = this.length);
        for (var startBytes = 0, si = 0; si < buffers.length && startBytes + buffers[si].length <= i; si++) startBytes += buffers[si].length;
        for (var target = new Buffer(j - i), ti = 0, ii = si; ti < j - i && ii < buffers.length; ii++) {
            var len = buffers[ii].length, start = 0 === ti ? i - startBytes : 0, end = ti + len >= j - i ? Math.min(start + (j - i) - ti, len) : len;
            buffers[ii].copy(target, ti, start, end), ti += end - start;
        }
        return target;
    }, Buffers.prototype.pos = function(i) {
        if (i < 0 || i >= this.length) throw new Error("oob");
        for (var l = i, bi = 0, bu = null; ;) {
            if (l < (bu = this.buffers[bi]).length) return {
                buf: bi,
                offset: l
            };
            l -= bu.length, bi++;
        }
    }, Buffers.prototype.get = function(i) {
        var pos = this.pos(i);
        return this.buffers[pos.buf].get(pos.offset);
    }, Buffers.prototype.set = function(i, b) {
        var pos = this.pos(i);
        return this.buffers[pos.buf].set(pos.offset, b);
    }, Buffers.prototype.indexOf = function(needle, offset) {
        if ("string" == typeof needle) needle = new Buffer(needle); else if (!(needle instanceof Buffer)) throw new Error("Invalid type for a search string");
        if (!needle.length) return 0;
        if (!this.length) return -1;
        var mstart, i = 0, j = 0, match = 0, pos = 0;
        if (offset) {
            var p = this.pos(offset);
            i = p.buf, j = p.offset, pos = offset;
        }
        for (;;) {
            for (;j >= this.buffers[i].length; ) if (j = 0, ++i >= this.buffers.length) return -1;
            if (this.buffers[i][j] == needle[match]) {
                if (0 == match && (mstart = {
                    i: i,
                    j: j,
                    pos: pos
                }), ++match == needle.length) return mstart.pos;
            } else 0 != match && (i = mstart.i, j = mstart.j, pos = mstart.pos, match = 0);
            j++, pos++;
        }
    }, Buffers.prototype.toBuffer = function() {
        return this.slice();
    }, Buffers.prototype.toString = function(encoding, start, end) {
        return this.slice(start, end).toString(encoding);
    };
}
