function(module, exports, __webpack_require__) {
    (function() {
        var XMLNode, hasProp = {}.hasOwnProperty;
        XMLNode = __webpack_require__(36), module.exports = (function(superClass) {
            function XMLDTDNotation(parent, name, value) {
                if (XMLDTDNotation.__super__.constructor.call(this, parent), null == name) throw new Error("Missing notation name");
                if (!value.pubID && !value.sysID) throw new Error("Public or system identifiers are required for an external entity");
                this.name = this.stringify.eleName(name), null != value.pubID && (this.pubID = this.stringify.dtdPubID(value.pubID)), 
                null != value.sysID && (this.sysID = this.stringify.dtdSysID(value.sysID));
            }
            return (function(child, parent) {
                for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype, child.prototype = new ctor, child.__super__ = parent.prototype;
            })(XMLDTDNotation, superClass), XMLDTDNotation.prototype.toString = function(options) {
                return this.options.writer.set(options).dtdNotation(this);
            }, XMLDTDNotation;
        })(XMLNode);
    }).call(this);
}
