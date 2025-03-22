function(module, exports, __webpack_require__) {
    (function() {
        var XMLNode, hasProp = {}.hasOwnProperty;
        XMLNode = __webpack_require__(36), module.exports = (function(superClass) {
            function XMLText(parent, text) {
                if (XMLText.__super__.constructor.call(this, parent), null == text) throw new Error("Missing element text");
                this.value = this.stringify.eleText(text);
            }
            return (function(child, parent) {
                for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype, child.prototype = new ctor, child.__super__ = parent.prototype;
            })(XMLText, superClass), XMLText.prototype.clone = function() {
                return Object.create(this);
            }, XMLText.prototype.toString = function(options) {
                return this.options.writer.set(options).text(this);
            }, XMLText;
        })(XMLNode);
    }).call(this);
}
