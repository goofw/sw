function(module, exports, __webpack_require__) {
    var assert = __webpack_require__(24), Buffer = __webpack_require__(14).Buffer, ASN1 = __webpack_require__(232), newInvalidAsn1Error = __webpack_require__(231).newInvalidAsn1Error, DEFAULT_OPTS = {
        size: 1024,
        growthFactor: 8
    };
    function Writer(options) {
        var from, to;
        from = DEFAULT_OPTS, to = options || {}, assert.ok(from), assert.equal(typeof from, "object"), 
        assert.ok(to), assert.equal(typeof to, "object"), Object.getOwnPropertyNames(from).forEach((function(key) {
            if (!to[key]) {
                var value = Object.getOwnPropertyDescriptor(from, key);
                Object.defineProperty(to, key, value);
            }
        })), options = to, this._buf = Buffer.alloc(options.size || 1024), this._size = this._buf.length, 
        this._offset = 0, this._options = options, this._seq = [];
    }
    Object.defineProperty(Writer.prototype, "buffer", {
        get: function() {
            if (this._seq.length) throw newInvalidAsn1Error(this._seq.length + " unended sequence(s)");
            return this._buf.slice(0, this._offset);
        }
    }), Writer.prototype.writeByte = function(b) {
        if ("number" != typeof b) throw new TypeError("argument must be a Number");
        this._ensure(1), this._buf[this._offset++] = b;
    }, Writer.prototype.writeInt = function(i, tag) {
        if ("number" != typeof i) throw new TypeError("argument must be a Number");
        "number" != typeof tag && (tag = ASN1.Integer);
        for (var sz = 4; (0 == (4286578688 & i) || -8388608 == (4286578688 & i)) && sz > 1; ) sz--, 
        i <<= 8;
        if (sz > 4) throw newInvalidAsn1Error("BER ints cannot be > 0xffffffff");
        for (this._ensure(2 + sz), this._buf[this._offset++] = tag, this._buf[this._offset++] = sz; sz-- > 0; ) this._buf[this._offset++] = (4278190080 & i) >>> 24, 
        i <<= 8;
    }, Writer.prototype.writeNull = function() {
        this.writeByte(ASN1.Null), this.writeByte(0);
    }, Writer.prototype.writeEnumeration = function(i, tag) {
        if ("number" != typeof i) throw new TypeError("argument must be a Number");
        return "number" != typeof tag && (tag = ASN1.Enumeration), this.writeInt(i, tag);
    }, Writer.prototype.writeBoolean = function(b, tag) {
        if ("boolean" != typeof b) throw new TypeError("argument must be a Boolean");
        "number" != typeof tag && (tag = ASN1.Boolean), this._ensure(3), this._buf[this._offset++] = tag, 
        this._buf[this._offset++] = 1, this._buf[this._offset++] = b ? 255 : 0;
    }, Writer.prototype.writeString = function(s, tag) {
        if ("string" != typeof s) throw new TypeError("argument must be a string (was: " + typeof s + ")");
        "number" != typeof tag && (tag = ASN1.OctetString);
        var len = Buffer.byteLength(s);
        this.writeByte(tag), this.writeLength(len), len && (this._ensure(len), this._buf.write(s, this._offset), 
        this._offset += len);
    }, Writer.prototype.writeBuffer = function(buf, tag) {
        if ("number" != typeof tag) throw new TypeError("tag must be a number");
        if (!Buffer.isBuffer(buf)) throw new TypeError("argument must be a buffer");
        this.writeByte(tag), this.writeLength(buf.length), this._ensure(buf.length), buf.copy(this._buf, this._offset, 0, buf.length), 
        this._offset += buf.length;
    }, Writer.prototype.writeStringArray = function(strings) {
        if (!strings instanceof Array) throw new TypeError("argument must be an Array[String]");
        var self = this;
        strings.forEach((function(s) {
            self.writeString(s);
        }));
    }, Writer.prototype.writeOID = function(s, tag) {
        if ("string" != typeof s) throw new TypeError("argument must be a string");
        if ("number" != typeof tag && (tag = ASN1.OID), !/^([0-9]+\.){3,}[0-9]+$/.test(s)) throw new Error("argument is not a valid OID string");
        var tmp = s.split("."), bytes = [];
        bytes.push(40 * parseInt(tmp[0], 10) + parseInt(tmp[1], 10)), tmp.slice(2).forEach((function(b) {
            !(function(bytes, octet) {
                octet < 128 ? bytes.push(octet) : octet < 16384 ? (bytes.push(octet >>> 7 | 128), 
                bytes.push(127 & octet)) : octet < 2097152 ? (bytes.push(octet >>> 14 | 128), bytes.push(255 & (octet >>> 7 | 128)), 
                bytes.push(127 & octet)) : octet < 268435456 ? (bytes.push(octet >>> 21 | 128), 
                bytes.push(255 & (octet >>> 14 | 128)), bytes.push(255 & (octet >>> 7 | 128)), bytes.push(127 & octet)) : (bytes.push(255 & (octet >>> 28 | 128)), 
                bytes.push(255 & (octet >>> 21 | 128)), bytes.push(255 & (octet >>> 14 | 128)), 
                bytes.push(255 & (octet >>> 7 | 128)), bytes.push(127 & octet));
            })(bytes, parseInt(b, 10));
        }));
        var self = this;
        this._ensure(2 + bytes.length), this.writeByte(tag), this.writeLength(bytes.length), 
        bytes.forEach((function(b) {
            self.writeByte(b);
        }));
    }, Writer.prototype.writeLength = function(len) {
        if ("number" != typeof len) throw new TypeError("argument must be a Number");
        if (this._ensure(4), len <= 127) this._buf[this._offset++] = len; else if (len <= 255) this._buf[this._offset++] = 129, 
        this._buf[this._offset++] = len; else if (len <= 65535) this._buf[this._offset++] = 130, 
        this._buf[this._offset++] = len >> 8, this._buf[this._offset++] = len; else {
            if (!(len <= 16777215)) throw newInvalidAsn1Error("Length too long (> 4 bytes)");
            this._buf[this._offset++] = 131, this._buf[this._offset++] = len >> 16, this._buf[this._offset++] = len >> 8, 
            this._buf[this._offset++] = len;
        }
    }, Writer.prototype.startSequence = function(tag) {
        "number" != typeof tag && (tag = ASN1.Sequence | ASN1.Constructor), this.writeByte(tag), 
        this._seq.push(this._offset), this._ensure(3), this._offset += 3;
    }, Writer.prototype.endSequence = function() {
        var seq = this._seq.pop(), start = seq + 3, len = this._offset - start;
        if (len <= 127) this._shift(start, len, -2), this._buf[seq] = len; else if (len <= 255) this._shift(start, len, -1), 
        this._buf[seq] = 129, this._buf[seq + 1] = len; else if (len <= 65535) this._buf[seq] = 130, 
        this._buf[seq + 1] = len >> 8, this._buf[seq + 2] = len; else {
            if (!(len <= 16777215)) throw newInvalidAsn1Error("Sequence too long");
            this._shift(start, len, 1), this._buf[seq] = 131, this._buf[seq + 1] = len >> 16, 
            this._buf[seq + 2] = len >> 8, this._buf[seq + 3] = len;
        }
    }, Writer.prototype._shift = function(start, len, shift) {
        assert.ok(void 0 !== start), assert.ok(void 0 !== len), assert.ok(shift), this._buf.copy(this._buf, start + shift, start, start + len), 
        this._offset += shift;
    }, Writer.prototype._ensure = function(len) {
        if (assert.ok(len), this._size - this._offset < len) {
            var sz = this._size * this._options.growthFactor;
            sz - this._offset < len && (sz += len);
            var buf = Buffer.alloc(sz);
            this._buf.copy(buf, 0, 0, this._offset), this._buf = buf, this._size = sz;
        }
    }, module.exports = Writer;
}
