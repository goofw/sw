function(module, exports, __webpack_require__) {
    "use strict";
    var ExpGolomb;
    ExpGolomb = function(workingData) {
        var workingBytesAvailable = workingData.byteLength, workingWord = 0, workingBitsAvailable = 0;
        this.length = function() {
            return 8 * workingBytesAvailable;
        }, this.bitsAvailable = function() {
            return 8 * workingBytesAvailable + workingBitsAvailable;
        }, this.loadWord = function() {
            var position = workingData.byteLength - workingBytesAvailable, workingBytes = new Uint8Array(4), availableBytes = Math.min(4, workingBytesAvailable);
            if (0 === availableBytes) throw new Error("no bytes available");
            workingBytes.set(workingData.subarray(position, position + availableBytes)), workingWord = new DataView(workingBytes.buffer).getUint32(0), 
            workingBitsAvailable = 8 * availableBytes, workingBytesAvailable -= availableBytes;
        }, this.skipBits = function(count) {
            var skipBytes;
            workingBitsAvailable > count ? (workingWord <<= count, workingBitsAvailable -= count) : (count -= workingBitsAvailable, 
            count -= 8 * (skipBytes = Math.floor(count / 8)), workingBytesAvailable -= skipBytes, 
            this.loadWord(), workingWord <<= count, workingBitsAvailable -= count);
        }, this.readBits = function(size) {
            var bits = Math.min(workingBitsAvailable, size), valu = workingWord >>> 32 - bits;
            return (workingBitsAvailable -= bits) > 0 ? workingWord <<= bits : workingBytesAvailable > 0 && this.loadWord(), 
            (bits = size - bits) > 0 ? valu << bits | this.readBits(bits) : valu;
        }, this.skipLeadingZeros = function() {
            var leadingZeroCount;
            for (leadingZeroCount = 0; leadingZeroCount < workingBitsAvailable; ++leadingZeroCount) if (0 != (workingWord & 2147483648 >>> leadingZeroCount)) return workingWord <<= leadingZeroCount, 
            workingBitsAvailable -= leadingZeroCount, leadingZeroCount;
            return this.loadWord(), leadingZeroCount + this.skipLeadingZeros();
        }, this.skipUnsignedExpGolomb = function() {
            this.skipBits(1 + this.skipLeadingZeros());
        }, this.skipExpGolomb = function() {
            this.skipBits(1 + this.skipLeadingZeros());
        }, this.readUnsignedExpGolomb = function() {
            var clz = this.skipLeadingZeros();
            return this.readBits(clz + 1) - 1;
        }, this.readExpGolomb = function() {
            var valu = this.readUnsignedExpGolomb();
            return 1 & valu ? 1 + valu >>> 1 : -1 * (valu >>> 1);
        }, this.readBoolean = function() {
            return 1 === this.readBits(1);
        }, this.readUnsignedByte = function() {
            return this.readBits(8);
        }, this.loadWord();
    }, module.exports = ExpGolomb;
}
