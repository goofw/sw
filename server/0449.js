function(module, exports, __webpack_require__) {
    function TreeBuilder(element_factory) {
        this._data = [], this._elem = [], this._last = null, this._tail = null, element_factory || (element_factory = __webpack_require__(223).Element), 
        this._factory = element_factory;
    }
    TreeBuilder.prototype.close = function() {
        return this._last;
    }, TreeBuilder.prototype._flush = function() {
        if (this._data) {
            if (null !== this._last) {
                var text = this._data.join("");
                this._tail ? this._last.tail = text : this._last.text = text;
            }
            this._data = [];
        }
    }, TreeBuilder.prototype.data = function(data) {
        this._data.push(data);
    }, TreeBuilder.prototype.start = function(tag, attrs) {
        this._flush();
        var elem = this._factory(tag, attrs);
        this._last = elem, this._elem.length && this._elem[this._elem.length - 1].append(elem), 
        this._elem.push(elem), this._tail = null;
    }, TreeBuilder.prototype.end = function(tag) {
        if (this._flush(), this._last = this._elem.pop(), this._last.tag !== tag) throw new Error("end tag mismatch");
        return this._tail = 1, this._last;
    }, exports.TreeBuilder = TreeBuilder;
}
