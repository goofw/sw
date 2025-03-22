function(module, exports) {
    (function() {
        module.exports = (function() {
            function XMLAttribute(parent, name, value) {
                if (this.options = parent.options, this.stringify = parent.stringify, null == name) throw new Error("Missing attribute name of element " + parent.name);
                if (null == value) throw new Error("Missing attribute value for attribute " + name + " of element " + parent.name);
                this.name = this.stringify.attName(name), this.value = this.stringify.attValue(value);
            }
            return XMLAttribute.prototype.clone = function() {
                return Object.create(this);
            }, XMLAttribute.prototype.toString = function(options) {
                return this.options.writer.set(options).attribute(this);
            }, XMLAttribute;
        })();
    }).call(this);
}
