function(module, exports, __webpack_require__) {
    (function() {
        var XMLNode, XMLStringWriter, XMLStringifier, isPlainObject, hasProp = {}.hasOwnProperty;
        isPlainObject = __webpack_require__(52).isPlainObject, XMLNode = __webpack_require__(36), 
        XMLStringifier = __webpack_require__(280), XMLStringWriter = __webpack_require__(174), 
        module.exports = (function(superClass) {
            function XMLDocument(options) {
                XMLDocument.__super__.constructor.call(this, null), options || (options = {}), options.writer || (options.writer = new XMLStringWriter), 
                this.options = options, this.stringify = new XMLStringifier(options), this.isDocument = !0;
            }
            return (function(child, parent) {
                for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype, child.prototype = new ctor, child.__super__ = parent.prototype;
            })(XMLDocument, superClass), XMLDocument.prototype.end = function(writer) {
                var writerOptions;
                return writer ? isPlainObject(writer) && (writerOptions = writer, writer = this.options.writer.set(writerOptions)) : writer = this.options.writer, 
                writer.document(this);
            }, XMLDocument.prototype.toString = function(options) {
                return this.options.writer.set(options).document(this);
            }, XMLDocument;
        })(XMLNode);
    }).call(this);
}
