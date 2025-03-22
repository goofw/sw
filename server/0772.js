function(module, exports, __webpack_require__) {
    var Container = "undefined" != typeof Buffer ? Buffer : "undefined" != typeof Int8Array ? Int8Array : function(l) {
        for (var a = new Array(l), i = 0; i < l; i++) a[i] = 0;
    };
    function BitField(data) {
        if (!(this instanceof BitField)) return new BitField(data);
        "number" == typeof data && (data % 8 != 0 && (data += 8), (data = new Container(data >> 3)).fill && data.fill(0)), 
        this.buffer = data;
    }
    BitField.prototype.get = function(i) {
        return !!(this.buffer[i >> 3] & 128 >> i % 8);
    }, BitField.prototype.set = function(i, b) {
        b || 1 === arguments.length ? this.buffer[i >> 3] |= 128 >> i % 8 : this.buffer[i >> 3] &= ~(128 >> i % 8);
    }, module.exports = BitField;
}
