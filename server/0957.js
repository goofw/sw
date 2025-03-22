function(module, exports, __webpack_require__) {
    "use strict";
    function Queue(capacity) {
        this._capacity = capacity, this._length = 0, this._front = 0;
    }
    Queue.prototype._willBeOverCapacity = function(size) {
        return this._capacity < size;
    }, Queue.prototype._pushOne = function(arg) {
        var length = this.length();
        this._checkCapacity(length + 1), this[this._front + length & this._capacity - 1] = arg, 
        this._length = length + 1;
    }, Queue.prototype.push = function(fn, receiver, arg) {
        var length = this.length() + 3;
        if (this._willBeOverCapacity(length)) return this._pushOne(fn), this._pushOne(receiver), 
        void this._pushOne(arg);
        var j = this._front + length - 3;
        this._checkCapacity(length);
        var wrapMask = this._capacity - 1;
        this[j + 0 & wrapMask] = fn, this[j + 1 & wrapMask] = receiver, this[j + 2 & wrapMask] = arg, 
        this._length = length;
    }, Queue.prototype.shift = function() {
        var front = this._front, ret = this[front];
        return this[front] = void 0, this._front = front + 1 & this._capacity - 1, this._length--, 
        ret;
    }, Queue.prototype.length = function() {
        return this._length;
    }, Queue.prototype._checkCapacity = function(size) {
        this._capacity < size && this._resizeTo(this._capacity << 1);
    }, Queue.prototype._resizeTo = function(capacity) {
        var oldCapacity = this._capacity;
        this._capacity = capacity, (function(src, srcIndex, dst, dstIndex, len) {
            for (var j = 0; j < len; ++j) dst[j + dstIndex] = src[j + 0], src[j + 0] = void 0;
        })(this, 0, this, oldCapacity, this._front + this._length & oldCapacity - 1);
    }, module.exports = Queue;
}
