function(module, exports, __webpack_require__) {
    (function() {
        var XMLAttribute, XMLNode, isFunction, isObject, ref, hasProp = {}.hasOwnProperty;
        ref = __webpack_require__(52), isObject = ref.isObject, isFunction = ref.isFunction, 
        XMLNode = __webpack_require__(36), XMLAttribute = __webpack_require__(279), module.exports = (function(superClass) {
            function XMLElement(parent, name, attributes) {
                if (XMLElement.__super__.constructor.call(this, parent), null == name) throw new Error("Missing element name");
                this.name = this.stringify.eleName(name), this.attributes = {}, null != attributes && this.attribute(attributes), 
                parent.isDocument && (this.isRoot = !0, this.documentObject = parent, parent.rootObject = this);
            }
            return (function(child, parent) {
                for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype, child.prototype = new ctor, child.__super__ = parent.prototype;
            })(XMLElement, superClass), XMLElement.prototype.clone = function() {
                var att, attName, clonedSelf, ref1;
                for (attName in (clonedSelf = Object.create(this)).isRoot && (clonedSelf.documentObject = null), 
                clonedSelf.attributes = {}, ref1 = this.attributes) hasProp.call(ref1, attName) && (att = ref1[attName], 
                clonedSelf.attributes[attName] = att.clone());
                return clonedSelf.children = [], this.children.forEach((function(child) {
                    var clonedChild;
                    return (clonedChild = child.clone()).parent = clonedSelf, clonedSelf.children.push(clonedChild);
                })), clonedSelf;
            }, XMLElement.prototype.attribute = function(name, value) {
                var attName, attValue;
                if (null != name && (name = name.valueOf()), isObject(name)) for (attName in name) hasProp.call(name, attName) && (attValue = name[attName], 
                this.attribute(attName, attValue)); else isFunction(value) && (value = value.apply()), 
                this.options.skipNullAttributes && null == value || (this.attributes[name] = new XMLAttribute(this, name, value));
                return this;
            }, XMLElement.prototype.removeAttribute = function(name) {
                var attName, i, len;
                if (null == name) throw new Error("Missing attribute name");
                if (name = name.valueOf(), Array.isArray(name)) for (i = 0, len = name.length; i < len; i++) attName = name[i], 
                delete this.attributes[attName]; else delete this.attributes[name];
                return this;
            }, XMLElement.prototype.toString = function(options) {
                return this.options.writer.set(options).element(this);
            }, XMLElement.prototype.att = function(name, value) {
                return this.attribute(name, value);
            }, XMLElement.prototype.a = function(name, value) {
                return this.attribute(name, value);
            }, XMLElement;
        })(XMLNode);
    }).call(this);
}
