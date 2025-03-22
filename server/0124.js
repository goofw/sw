function(module, exports, __webpack_require__) {
    (function() {
        var XMLNode, isObject, hasProp = {}.hasOwnProperty;
        isObject = __webpack_require__(52).isObject, XMLNode = __webpack_require__(36), 
        module.exports = (function(superClass) {
            function XMLDTDEntity(parent, pe, name, value) {
                if (XMLDTDEntity.__super__.constructor.call(this, parent), null == name) throw new Error("Missing entity name");
                if (null == value) throw new Error("Missing entity value");
                if (this.pe = !!pe, this.name = this.stringify.eleName(name), isObject(value)) {
                    if (!value.pubID && !value.sysID) throw new Error("Public and/or system identifiers are required for an external entity");
                    if (value.pubID && !value.sysID) throw new Error("System identifier is required for a public external entity");
                    if (null != value.pubID && (this.pubID = this.stringify.dtdPubID(value.pubID)), 
                    null != value.sysID && (this.sysID = this.stringify.dtdSysID(value.sysID)), null != value.nData && (this.nData = this.stringify.dtdNData(value.nData)), 
                    this.pe && this.nData) throw new Error("Notation declaration is not allowed in a parameter entity");
                } else this.value = this.stringify.dtdEntityValue(value);
            }
            return (function(child, parent) {
                for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype, child.prototype = new ctor, child.__super__ = parent.prototype;
            })(XMLDTDEntity, superClass), XMLDTDEntity.prototype.toString = function(options) {
                return this.options.writer.set(options).dtdEntity(this);
            }, XMLDTDEntity;
        })(XMLNode);
    }).call(this);
}
