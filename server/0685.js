function(module, exports, __webpack_require__) {
    (function() {
        var XMLDocument, XMLDocumentCB, XMLStreamWriter, XMLStringWriter, assign, isFunction, ref;
        ref = __webpack_require__(52), assign = ref.assign, isFunction = ref.isFunction, 
        XMLDocument = __webpack_require__(686), XMLDocumentCB = __webpack_require__(687), 
        XMLStringWriter = __webpack_require__(174), XMLStreamWriter = __webpack_require__(688), 
        module.exports.create = function(name, xmldec, doctype, options) {
            var doc, root;
            if (null == name) throw new Error("Root element needs a name");
            return options = assign({}, xmldec, doctype, options), root = (doc = new XMLDocument(options)).element(name), 
            options.headless || (doc.declaration(options), null == options.pubID && null == options.sysID || doc.doctype(options)), 
            root;
        }, module.exports.begin = function(options, onData, onEnd) {
            var ref1;
            return isFunction(options) && (onData = (ref1 = [ options, onData ])[0], onEnd = ref1[1], 
            options = {}), onData ? new XMLDocumentCB(options, onData, onEnd) : new XMLDocument(options);
        }, module.exports.stringWriter = function(options) {
            return new XMLStringWriter(options);
        }, module.exports.streamWriter = function(stream, options) {
            return new XMLStreamWriter(stream, options);
        };
    }).call(this);
}
