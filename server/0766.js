function(module, exports) {
    var Cyclist = function(size) {
        if (!(this instanceof Cyclist)) return new Cyclist(size);
        this.mask = 0, this.values = [], this.indexes = [], size && this.fit(size);
    };
    Cyclist.prototype.__defineGetter__("size", (function() {
        return this.mask + 1;
    })), Cyclist.prototype.put = function(index, val) {
        var pos = index & this.mask;
        this.indexes[pos] = index, this.values[pos] = val;
    }, Cyclist.prototype.get = function(index) {
        return this.values[index & this.mask];
    }, Cyclist.prototype.del = function(index) {
        var pos = index & this.mask, val = this.values[pos];
        return this.indexes[pos] = this.values[pos] = void 0, val;
    }, Cyclist.prototype.fit = function(size) {
        if (!(size <= this.size)) {
            for (;this.size < size; ) this.mask = 2 * (this.mask + 1) - 1;
            var values = this.values, indexes = this.indexes;
            this.values = new Array(this.size), this.indexes = new Array(this.size);
            for (var i = 0; i < indexes.length; i++) void 0 !== indexes[i] && this.put(indexes[i], values[i]);
        }
    }, module.exports = Cyclist;
}
