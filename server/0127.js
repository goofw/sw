function(module, exports, __webpack_require__) {
    (function() {
        var XMLNode, hasProp = {}.hasOwnProperty;
        XMLNode = __webpack_require__(36), module.exports = (function(superClass) {
            function XMLRaw(parent, text) {
                if (XMLRaw.__super__.constructor.call(this, parent), null == text) throw new Error("Missing raw text");
                this.value = this.stringify.raw(text);
            }
            return (function(child, parent) {
                for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype, child.prototype = new ctor, child.__super__ = parent.prototype;
            })(XMLRaw, superClass), XMLRaw.prototype.clone = function() {
                return Object.create(this);
            }, XMLRaw.prototype.toString = function(options) {
                return this.options.writer.set(options).raw(this);
            }, XMLRaw;
        })(XMLNode);
    }).call(this);
}
