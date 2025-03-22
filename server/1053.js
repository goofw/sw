function(module, exports, __webpack_require__) {
    var assert = __webpack_require__(24), Buffer = __webpack_require__(14).Buffer, ASN1 = __webpack_require__(232), newInvalidAsn1Error = __webpack_require__(231).newInvalidAsn1Error;
    function Reader(data) {
        if (!data || !Buffer.isBuffer(data)) throw new TypeError("data must be a node Buffer");
        this._buf = data, this._size = data.length, this._len = 0, this._offset = 0;
    }
    Object.defineProperty(Reader.prototype, "length", {
        enumerable: !0,
        get: function() {
            return this._len;
        }
    }), Object.defineProperty(Reader.prototype, "offset", {
        enumerable: !0,
        get: function() {
            return this._offset;
        }
    }), Object.defineProperty(Reader.prototype, "remain", {
        get: function() {
            return this._size - this._offset;
        }
    }), Object.defineProperty(Reader.prototype, "buffer", {
        get: function() {
            return this._buf.slice(this._offset);
        }
    }), Reader.prototype.readByte = function(peek) {
        if (this._size - this._offset < 1) return null;
        var b = 255 & this._buf[this._offset];
        return peek || (this._offset += 1), b;
    }, Reader.prototype.peek = function() {
        return this.readByte(!0);
    }, Reader.prototype.readLength = function(offset) {
        if (void 0 === offset && (offset = this._offset), offset >= this._size) return null;
        var lenB = 255 & this._buf[offset++];
        if (null === lenB) return null;
        if (128 == (128 & lenB)) {
            if (0 == (lenB &= 127)) throw newInvalidAsn1Error("Indefinite length not supported");
            if (lenB > 4) throw newInvalidAsn1Error("encoding too long");
            if (this._size - offset < lenB) return null;
            this._len = 0;
            for (var i = 0; i < lenB; i++) this._len = (this._len << 8) + (255 & this._buf[offset++]);
        } else this._len = lenB;
        return offset;
    }, Reader.prototype.readSequence = function(tag) {
        var seq = this.peek();
        if (null === seq) return null;
        if (void 0 !== tag && tag !== seq) throw newInvalidAsn1Error("Expected 0x" + tag.toString(16) + ": got 0x" + seq.toString(16));
        var o = this.readLength(this._offset + 1);
        return null === o ? null : (this._offset = o, seq);
    }, Reader.prototype.readInt = function() {
        return this._readTag(ASN1.Integer);
    }, Reader.prototype.readBoolean = function() {
        return 0 !== this._readTag(ASN1.Boolean);
    }, Reader.prototype.readEnumeration = function() {
        return this._readTag(ASN1.Enumeration);
    }, Reader.prototype.readString = function(tag, retbuf) {
        tag || (tag = ASN1.OctetString);
        var b = this.peek();
        if (null === b) return null;
        if (b !== tag) throw newInvalidAsn1Error("Expected 0x" + tag.toString(16) + ": got 0x" + b.toString(16));
        var o = this.readLength(this._offset + 1);
        if (null === o) return null;
        if (this.length > this._size - o) return null;
        if (this._offset = o, 0 === this.length) return retbuf ? Buffer.alloc(0) : "";
        var str = this._buf.slice(this._offset, this._offset + this.length);
        return this._offset += this.length, retbuf ? str : str.toString("utf8");
    }, Reader.prototype.readOID = function(tag) {
        tag || (tag = ASN1.OID);
        var b = this.readString(tag, !0);
        if (null === b) return null;
        for (var values = [], value = 0, i = 0; i < b.length; i++) {
            var byte = 255 & b[i];
            value <<= 7, value += 127 & byte, 0 == (128 & byte) && (values.push(value), value = 0);
        }
        return value = values.shift(), values.unshift(value % 40), values.unshift(value / 40 >> 0), 
        values.join(".");
    }, Reader.prototype._readTag = function(tag) {
        assert.ok(void 0 !== tag);
        var b = this.peek();
        if (null === b) return null;
        if (b !== tag) throw newInvalidAsn1Error("Expected 0x" + tag.toString(16) + ": got 0x" + b.toString(16));
        var o = this.readLength(this._offset + 1);
        if (null === o) return null;
        if (this.length > 4) throw newInvalidAsn1Error("Integer too long: " + this.length);
        if (this.length > this._size - o) return null;
        this._offset = o;
        for (var fb = this._buf[this._offset], value = 0, i = 0; i < this.length; i++) value <<= 8, 
        value |= 255 & this._buf[this._offset++];
        return 128 == (128 & fb) && 4 !== i && (value -= 1 << 8 * i), value >> 0;
    }, module.exports = Reader;
}
