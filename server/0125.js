function(module, exports, __webpack_require__) {
    (function() {
        var XMLNode, hasProp = {}.hasOwnProperty;
        XMLNode = __webpack_require__(36), module.exports = (function(superClass) {
            function XMLDTDElement(parent, name, value) {
                if (XMLDTDElement.__super__.constructor.call(this, parent), null == name) throw new Error("Missing DTD element name");
                value || (value = "(#PCDATA)"), Array.isArray(value) && (value = "(" + value.join(",") + ")"), 
                this.name = this.stringify.eleName(name), this.value = this.stringify.dtdElementValue(value);
            }
            return (function(child, parent) {
                for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype, child.prototype = new ctor, child.__super__ = parent.prototype;
            })(XMLDTDElement, superClass), XMLDTDElement.prototype.toString = function(options) {
                return this.options.writer.set(options).dtdElement(this);
            }, XMLDTDElement;
        })(XMLNode);
    }).call(this);
}
