function(module, exports, __webpack_require__) {
    (function() {
        var XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLNode, isObject, hasProp = {}.hasOwnProperty;
        isObject = __webpack_require__(52).isObject, XMLNode = __webpack_require__(36), 
        XMLDTDAttList = __webpack_require__(123), XMLDTDEntity = __webpack_require__(124), 
        XMLDTDElement = __webpack_require__(125), XMLDTDNotation = __webpack_require__(126), 
        module.exports = (function(superClass) {
            function XMLDocType(parent, pubID, sysID) {
                var ref, ref1;
                XMLDocType.__super__.constructor.call(this, parent), this.documentObject = parent, 
                isObject(pubID) && (pubID = (ref = pubID).pubID, sysID = ref.sysID), null == sysID && (sysID = (ref1 = [ pubID, sysID ])[0], 
                pubID = ref1[1]), null != pubID && (this.pubID = this.stringify.dtdPubID(pubID)), 
                null != sysID && (this.sysID = this.stringify.dtdSysID(sysID));
            }
            return (function(child, parent) {
                for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype, child.prototype = new ctor, child.__super__ = parent.prototype;
            })(XMLDocType, superClass), XMLDocType.prototype.element = function(name, value) {
                var child;
                return child = new XMLDTDElement(this, name, value), this.children.push(child), 
                this;
            }, XMLDocType.prototype.attList = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
                var child;
                return child = new XMLDTDAttList(this, elementName, attributeName, attributeType, defaultValueType, defaultValue), 
                this.children.push(child), this;
            }, XMLDocType.prototype.entity = function(name, value) {
                var child;
                return child = new XMLDTDEntity(this, !1, name, value), this.children.push(child), 
                this;
            }, XMLDocType.prototype.pEntity = function(name, value) {
                var child;
                return child = new XMLDTDEntity(this, !0, name, value), this.children.push(child), 
                this;
            }, XMLDocType.prototype.notation = function(name, value) {
                var child;
                return child = new XMLDTDNotation(this, name, value), this.children.push(child), 
                this;
            }, XMLDocType.prototype.toString = function(options) {
                return this.options.writer.set(options).docType(this);
            }, XMLDocType.prototype.ele = function(name, value) {
                return this.element(name, value);
            }, XMLDocType.prototype.att = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
                return this.attList(elementName, attributeName, attributeType, defaultValueType, defaultValue);
            }, XMLDocType.prototype.ent = function(name, value) {
                return this.entity(name, value);
            }, XMLDocType.prototype.pent = function(name, value) {
                return this.pEntity(name, value);
            }, XMLDocType.prototype.not = function(name, value) {
                return this.notation(name, value);
            }, XMLDocType.prototype.up = function() {
                return this.root() || this.documentObject;
            }, XMLDocType;
        })(XMLNode);
    }).call(this);
}
