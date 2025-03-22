function(module, exports, __webpack_require__) {
    "use strict";
    var Buffer = __webpack_require__(23).Buffer, util = __webpack_require__(0);
    module.exports = (function() {
        function BufferList() {
            !(function(instance, Constructor) {
                if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
            })(this, BufferList), this.head = null, this.tail = null, this.length = 0;
        }
        return BufferList.prototype.push = function(v) {
            var entry = {
                data: v,
                next: null
            };
            this.length > 0 ? this.tail.next = entry : this.head = entry, this.tail = entry, 
            ++this.length;
        }, BufferList.prototype.unshift = function(v) {
            var entry = {
                data: v,
                next: this.head
            };
            0 === this.length && (this.tail = entry), this.head = entry, ++this.length;
        }, BufferList.prototype.shift = function() {
            if (0 !== this.length) {
                var ret = this.head.data;
                return 1 === this.length ? this.head = this.tail = null : this.head = this.head.next, 
                --this.length, ret;
            }
        }, BufferList.prototype.clear = function() {
            this.head = this.tail = null, this.length = 0;
        }, BufferList.prototype.join = function(s) {
            if (0 === this.length) return "";
            for (var p = this.head, ret = "" + p.data; p = p.next; ) ret += s + p.data;
            return ret;
        }, BufferList.prototype.concat = function(n) {
            if (0 === this.length) return Buffer.alloc(0);
            if (1 === this.length) return this.head.data;
            for (var target, offset, ret = Buffer.allocUnsafe(n >>> 0), p = this.head, i = 0; p; ) target = ret, 
            offset = i, p.data.copy(target, offset), i += p.data.length, p = p.next;
            return ret;
        }, BufferList;
    })(), util && util.inspect && util.inspect.custom && (module.exports.prototype[util.inspect.custom] = function() {
        var obj = util.inspect({
            length: this.length
        });
        return this.constructor.name + " " + obj;
    });
}
