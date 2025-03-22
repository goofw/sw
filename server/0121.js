function(module, exports, __webpack_require__) {
    (function() {
        var XMLNode, isObject, hasProp = {}.hasOwnProperty;
        isObject = __webpack_require__(52).isObject, XMLNode = __webpack_require__(36), 
        module.exports = (function(superClass) {
            function XMLDeclaration(parent, version, encoding, standalone) {
                var ref;
                XMLDeclaration.__super__.constructor.call(this, parent), isObject(version) && (version = (ref = version).version, 
                encoding = ref.encoding, standalone = ref.standalone), version || (version = "1.0"), 
                this.version = this.stringify.xmlVersion(version), null != encoding && (this.encoding = this.stringify.xmlEncoding(encoding)), 
                null != standalone && (this.standalone = this.stringify.xmlStandalone(standalone));
            }
            return (function(child, parent) {
                for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype, child.prototype = new ctor, child.__super__ = parent.prototype;
            })(XMLDeclaration, superClass), XMLDeclaration.prototype.toString = function(options) {
                return this.options.writer.set(options).declaration(this);
            }, XMLDeclaration;
        })(XMLNode);
    }).call(this);
}
