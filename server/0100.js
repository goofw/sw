function(module, exports, __webpack_require__) {
    module.exports = SSHBuffer;
    var assert = __webpack_require__(15), Buffer = __webpack_require__(14).Buffer;
    function SSHBuffer(opts) {
        assert.object(opts, "options"), void 0 !== opts.buffer && assert.buffer(opts.buffer, "options.buffer"), 
        this._size = opts.buffer ? opts.buffer.length : 1024, this._buffer = opts.buffer || Buffer.alloc(this._size), 
        this._offset = 0;
    }
    SSHBuffer.prototype.toBuffer = function() {
        return this._buffer.slice(0, this._offset);
    }, SSHBuffer.prototype.atEnd = function() {
        return this._offset >= this._buffer.length;
    }, SSHBuffer.prototype.remainder = function() {
        return this._buffer.slice(this._offset);
    }, SSHBuffer.prototype.skip = function(n) {
        this._offset += n;
    }, SSHBuffer.prototype.expand = function() {
        this._size *= 2;
        var buf = Buffer.alloc(this._size);
        this._buffer.copy(buf, 0), this._buffer = buf;
    }, SSHBuffer.prototype.readPart = function() {
        return {
            data: this.readBuffer()
        };
    }, SSHBuffer.prototype.readBuffer = function() {
        var len = this._buffer.readUInt32BE(this._offset);
        this._offset += 4, assert.ok(this._offset + len <= this._buffer.length, "length out of bounds at +0x" + this._offset.toString(16) + " (data truncated?)");
        var buf = this._buffer.slice(this._offset, this._offset + len);
        return this._offset += len, buf;
    }, SSHBuffer.prototype.readString = function() {
        return this.readBuffer().toString();
    }, SSHBuffer.prototype.readCString = function() {
        for (var offset = this._offset; offset < this._buffer.length && 0 !== this._buffer[offset]; ) offset++;
        assert.ok(offset < this._buffer.length, "c string does not terminate");
        var str = this._buffer.slice(this._offset, offset).toString();
        return this._offset = offset + 1, str;
    }, SSHBuffer.prototype.readInt = function() {
        var v = this._buffer.readUInt32BE(this._offset);
        return this._offset += 4, v;
    }, SSHBuffer.prototype.readInt64 = function() {
        assert.ok(this._offset + 8 < this._buffer.length, "buffer not long enough to read Int64");
        var v = this._buffer.slice(this._offset, this._offset + 8);
        return this._offset += 8, v;
    }, SSHBuffer.prototype.readChar = function() {
        return this._buffer[this._offset++];
    }, SSHBuffer.prototype.writeBuffer = function(buf) {
        for (;this._offset + 4 + buf.length > this._size; ) this.expand();
        this._buffer.writeUInt32BE(buf.length, this._offset), this._offset += 4, buf.copy(this._buffer, this._offset), 
        this._offset += buf.length;
    }, SSHBuffer.prototype.writeString = function(str) {
        this.writeBuffer(Buffer.from(str, "utf8"));
    }, SSHBuffer.prototype.writeCString = function(str) {
        for (;this._offset + 1 + str.length > this._size; ) this.expand();
        this._buffer.write(str, this._offset), this._offset += str.length, this._buffer[this._offset++] = 0;
    }, SSHBuffer.prototype.writeInt = function(v) {
        for (;this._offset + 4 > this._size; ) this.expand();
        this._buffer.writeUInt32BE(v, this._offset), this._offset += 4;
    }, SSHBuffer.prototype.writeInt64 = function(v) {
        if (assert.buffer(v, "value"), v.length > 8) {
            for (var lead = v.slice(0, v.length - 8), i = 0; i < lead.length; ++i) assert.strictEqual(lead[i], 0, "must fit in 64 bits of precision");
            v = v.slice(v.length - 8, v.length);
        }
        for (;this._offset + 8 > this._size; ) this.expand();
        v.copy(this._buffer, this._offset), this._offset += 8;
    }, SSHBuffer.prototype.writeChar = function(v) {
        for (;this._offset + 1 > this._size; ) this.expand();
        this._buffer[this._offset++] = v;
    }, SSHBuffer.prototype.writePart = function(p) {
        this.writeBuffer(p.data);
    }, SSHBuffer.prototype.write = function(buf) {
        for (;this._offset + buf.length > this._size; ) this.expand();
        buf.copy(this._buffer, this._offset), this._offset += buf.length;
    };
}
