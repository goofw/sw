function(module, exports, __webpack_require__) {
    (function() {
        var XMLNode, hasProp = {}.hasOwnProperty;
        XMLNode = __webpack_require__(36), module.exports = (function(superClass) {
            function XMLCData(parent, text) {
                if (XMLCData.__super__.constructor.call(this, parent), null == text) throw new Error("Missing CDATA text");
                this.text = this.stringify.cdata(text);
            }
            return (function(child, parent) {
                for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype, child.prototype = new ctor, child.__super__ = parent.prototype;
            })(XMLCData, superClass), XMLCData.prototype.clone = function() {
                return Object.create(this);
            }, XMLCData.prototype.toString = function(options) {
                return this.options.writer.set(options).cdata(this);
            }, XMLCData;
        })(XMLNode);
    }).call(this);
}
