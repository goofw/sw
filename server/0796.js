function(module, exports) {
    var PieceBuffer = function(length) {
        if (!(this instanceof PieceBuffer)) return new PieceBuffer(length);
        this.parts = Math.ceil(length / 16384), this.remainder = length % 16384 || 16384, 
        this.length = length, this.missing = length, this.buffered = 0, this.buffer = null, 
        this.cancellations = null, this.reservations = 0, this.flushed = !1;
    };
    PieceBuffer.BLOCK_SIZE = 16384, PieceBuffer.prototype.size = function(i) {
        return i === this.parts - 1 ? this.remainder : 16384;
    }, PieceBuffer.prototype.offset = function(i) {
        return 16384 * i;
    }, PieceBuffer.prototype.reserve = function() {
        return this.init() ? this.cancellations.length ? this.cancellations.pop() : this.reservations < this.parts ? this.reservations++ : -1 : -1;
    }, PieceBuffer.prototype.cancel = function(i) {
        this.init() && this.cancellations.push(i);
    }, PieceBuffer.prototype.get = function(i) {
        return this.init() ? this.buffer[i] : null;
    }, PieceBuffer.prototype.set = function(i, data) {
        return !!this.init() && (this.buffer[i] || (this.buffered++, this.buffer[i] = data, 
        this.missing -= data.length), this.buffered === this.parts);
    }, PieceBuffer.prototype.flush = function() {
        if (!this.buffer || this.parts !== this.buffered) return null;
        var buffer = Buffer.concat(this.buffer, this.length);
        return this.buffer = null, this.cancellations = null, this.flushed = !0, buffer;
    }, PieceBuffer.prototype.init = function() {
        return !this.flushed && (this.buffer || (this.buffer = new Array(this.parts), this.cancellations = []), 
        !0);
    }, module.exports = PieceBuffer;
}
