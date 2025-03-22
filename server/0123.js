function(module, exports, __webpack_require__) {
    (function() {
        var XMLNode, hasProp = {}.hasOwnProperty;
        XMLNode = __webpack_require__(36), module.exports = (function(superClass) {
            function XMLDTDAttList(parent, elementName, attributeName, attributeType, defaultValueType, defaultValue) {
                if (XMLDTDAttList.__super__.constructor.call(this, parent), null == elementName) throw new Error("Missing DTD element name");
                if (null == attributeName) throw new Error("Missing DTD attribute name");
                if (!attributeType) throw new Error("Missing DTD attribute type");
                if (!defaultValueType) throw new Error("Missing DTD attribute default");
                if (0 !== defaultValueType.indexOf("#") && (defaultValueType = "#" + defaultValueType), 
                !defaultValueType.match(/^(#REQUIRED|#IMPLIED|#FIXED|#DEFAULT)$/)) throw new Error("Invalid default value type; expected: #REQUIRED, #IMPLIED, #FIXED or #DEFAULT");
                if (defaultValue && !defaultValueType.match(/^(#FIXED|#DEFAULT)$/)) throw new Error("Default value only applies to #FIXED or #DEFAULT");
                this.elementName = this.stringify.eleName(elementName), this.attributeName = this.stringify.attName(attributeName), 
                this.attributeType = this.stringify.dtdAttType(attributeType), this.defaultValue = this.stringify.dtdAttDefault(defaultValue), 
                this.defaultValueType = defaultValueType;
            }
            return (function(child, parent) {
                for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype, child.prototype = new ctor, child.__super__ = parent.prototype;
            })(XMLDTDAttList, superClass), XMLDTDAttList.prototype.toString = function(options) {
                return this.options.writer.set(options).dtdAttList(this);
            }, XMLDTDAttList;
        })(XMLNode);
    }).call(this);
}
