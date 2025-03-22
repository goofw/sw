function(module, exports, __webpack_require__) {
    (function() {
        var XMLAttribute, XMLCData, XMLComment, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDeclaration, XMLDocType, XMLElement, XMLProcessingInstruction, XMLRaw, XMLStringWriter, XMLStringifier, XMLText, isFunction, isObject, isPlainObject, ref, hasProp = {}.hasOwnProperty;
        ref = __webpack_require__(52), isObject = ref.isObject, isFunction = ref.isFunction, 
        isPlainObject = ref.isPlainObject, XMLElement = __webpack_require__(118), XMLCData = __webpack_require__(119), 
        XMLComment = __webpack_require__(120), XMLRaw = __webpack_require__(127), XMLText = __webpack_require__(128), 
        XMLProcessingInstruction = __webpack_require__(129), XMLDeclaration = __webpack_require__(121), 
        XMLDocType = __webpack_require__(122), XMLDTDAttList = __webpack_require__(123), 
        XMLDTDEntity = __webpack_require__(124), XMLDTDElement = __webpack_require__(125), 
        XMLDTDNotation = __webpack_require__(126), XMLAttribute = __webpack_require__(279), 
        XMLStringifier = __webpack_require__(280), XMLStringWriter = __webpack_require__(174), 
        module.exports = (function() {
            function XMLDocumentCB(options, onData, onEnd) {
                var writerOptions;
                options || (options = {}), options.writer ? isPlainObject(options.writer) && (writerOptions = options.writer, 
                options.writer = new XMLStringWriter(writerOptions)) : options.writer = new XMLStringWriter(options), 
                this.options = options, this.writer = options.writer, this.stringify = new XMLStringifier(options), 
                this.onDataCallback = onData || function() {}, this.onEndCallback = onEnd || function() {}, 
                this.currentNode = null, this.currentLevel = -1, this.openTags = {}, this.documentStarted = !1, 
                this.documentCompleted = !1, this.root = null;
            }
            return XMLDocumentCB.prototype.node = function(name, attributes, text) {
                var ref1;
                if (null == name) throw new Error("Missing node name");
                if (this.root && -1 === this.currentLevel) throw new Error("Document can only have one root node");
                return this.openCurrent(), name = name.valueOf(), null == attributes && (attributes = {}), 
                attributes = attributes.valueOf(), isObject(attributes) || (text = (ref1 = [ attributes, text ])[0], 
                attributes = ref1[1]), this.currentNode = new XMLElement(this, name, attributes), 
                this.currentNode.children = !1, this.currentLevel++, this.openTags[this.currentLevel] = this.currentNode, 
                null != text && this.text(text), this;
            }, XMLDocumentCB.prototype.element = function(name, attributes, text) {
                return this.currentNode && this.currentNode instanceof XMLDocType ? this.dtdElement.apply(this, arguments) : this.node(name, attributes, text);
            }, XMLDocumentCB.prototype.attribute = function(name, value) {
                var attName, attValue;
                if (!this.currentNode || this.currentNode.children) throw new Error("att() can only be used immediately after an ele() call in callback mode");
                if (null != name && (name = name.valueOf()), isObject(name)) for (attName in name) hasProp.call(name, attName) && (attValue = name[attName], 
                this.attribute(attName, attValue)); else isFunction(value) && (value = value.apply()), 
                this.options.skipNullAttributes && null == value || (this.currentNode.attributes[name] = new XMLAttribute(this, name, value));
                return this;
            }, XMLDocumentCB.prototype.text = function(value) {
                var node;
                return this.openCurrent(), node = new XMLText(this, value), this.onData(this.writer.text(node, this.currentLevel + 1)), 
                this;
            }, XMLDocumentCB.prototype.cdata = function(value) {
                var node;
                return this.openCurrent(), node = new XMLCData(this, value), this.onData(this.writer.cdata(node, this.currentLevel + 1)), 
                this;
            }, XMLDocumentCB.prototype.comment = function(value) {
                var node;
                return this.openCurrent(), node = new XMLComment(this, value), this.onData(this.writer.comment(node, this.currentLevel + 1)), 
                this;
            }, XMLDocumentCB.prototype.raw = function(value) {
                var node;
                return this.openCurrent(), node = new XMLRaw(this, value), this.onData(this.writer.raw(node, this.currentLevel + 1)), 
                this;
            }, XMLDocumentCB.prototype.instruction = function(target, value) {
                var i, insTarget, insValue, len, node;
                if (this.openCurrent(), null != target && (target = target.valueOf()), null != value && (value = value.valueOf()), 
                Array.isArray(target)) for (i = 0, len = target.length; i < len; i++) insTarget = target[i], 
                this.instruction(insTarget); else if (isObject(target)) for (insTarget in target) hasProp.call(target, insTarget) && (insValue = target[insTarget], 
                this.instruction(insTarget, insValue)); else isFunction(value) && (value = value.apply()), 
                node = new XMLProcessingInstruction(this, target, value), this.onData(this.writer.processingInstruction(node, this.currentLevel + 1));
                return this;
            }, XMLDocumentCB.prototype.declaration = function(version, encoding, standalone) {
                var node;
                if (this.openCurrent(), this.documentStarted) throw new Error("declaration() must be the first node");
                return node = new XMLDeclaration(this, version, encoding, standalone), this.onData(this.writer.declaration(node, this.currentLevel + 1)), 
                this;
            }, XMLDocumentCB.prototype.doctype = function(root, pubID, sysID) {
                if (this.openCurrent(), null == root) throw new Error("Missing root node name");
                if (this.root) throw new Error("dtd() must come before the root node");
                return this.currentNode = new XMLDocType(this, pubID, sysID), this.currentNode.rootNodeName = root, 
                this.currentNode.children = !1, this.currentLevel++, this.openTags[this.currentLevel] = this.currentNode, 
                this;
            }, XMLDocumentCB.prototype.dtdElement = function(name, value) {
                var node;
                return this.openCurrent(), node = new XMLDTDElement(this, name, value), this.onData(this.writer.dtdElement(node, this.currentLevel + 1)), 
                this;
            }, XMLDocumentCB.prototype.attList = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
                var node;
                return this.openCurrent(), node = new XMLDTDAttList(this, elementName, attributeName, attributeType, defaultValueType, defaultValue), 
                this.onData(this.writer.dtdAttList(node, this.currentLevel + 1)), this;
            }, XMLDocumentCB.prototype.entity = function(name, value) {
                var node;
                return this.openCurrent(), node = new XMLDTDEntity(this, !1, name, value), this.onData(this.writer.dtdEntity(node, this.currentLevel + 1)), 
                this;
            }, XMLDocumentCB.prototype.pEntity = function(name, value) {
                var node;
                return this.openCurrent(), node = new XMLDTDEntity(this, !0, name, value), this.onData(this.writer.dtdEntity(node, this.currentLevel + 1)), 
                this;
            }, XMLDocumentCB.prototype.notation = function(name, value) {
                var node;
                return this.openCurrent(), node = new XMLDTDNotation(this, name, value), this.onData(this.writer.dtdNotation(node, this.currentLevel + 1)), 
                this;
            }, XMLDocumentCB.prototype.up = function() {
                if (this.currentLevel < 0) throw new Error("The document node has no parent");
                return this.currentNode ? (this.currentNode.children ? this.closeNode(this.currentNode) : this.openNode(this.currentNode), 
                this.currentNode = null) : this.closeNode(this.openTags[this.currentLevel]), delete this.openTags[this.currentLevel], 
                this.currentLevel--, this;
            }, XMLDocumentCB.prototype.end = function() {
                for (;this.currentLevel >= 0; ) this.up();
                return this.onEnd();
            }, XMLDocumentCB.prototype.openCurrent = function() {
                if (this.currentNode) return this.currentNode.children = !0, this.openNode(this.currentNode);
            }, XMLDocumentCB.prototype.openNode = function(node) {
                if (!node.isOpen) return !this.root && 0 === this.currentLevel && node instanceof XMLElement && (this.root = node), 
                this.onData(this.writer.openNode(node, this.currentLevel)), node.isOpen = !0;
            }, XMLDocumentCB.prototype.closeNode = function(node) {
                if (!node.isClosed) return this.onData(this.writer.closeNode(node, this.currentLevel)), 
                node.isClosed = !0;
            }, XMLDocumentCB.prototype.onData = function(chunk) {
                return this.documentStarted = !0, this.onDataCallback(chunk);
            }, XMLDocumentCB.prototype.onEnd = function() {
                return this.documentCompleted = !0, this.onEndCallback();
            }, XMLDocumentCB.prototype.ele = function() {
                return this.element.apply(this, arguments);
            }, XMLDocumentCB.prototype.nod = function(name, attributes, text) {
                return this.node(name, attributes, text);
            }, XMLDocumentCB.prototype.txt = function(value) {
                return this.text(value);
            }, XMLDocumentCB.prototype.dat = function(value) {
                return this.cdata(value);
            }, XMLDocumentCB.prototype.com = function(value) {
                return this.comment(value);
            }, XMLDocumentCB.prototype.ins = function(target, value) {
                return this.instruction(target, value);
            }, XMLDocumentCB.prototype.dec = function(version, encoding, standalone) {
                return this.declaration(version, encoding, standalone);
            }, XMLDocumentCB.prototype.dtd = function(root, pubID, sysID) {
                return this.doctype(root, pubID, sysID);
            }, XMLDocumentCB.prototype.e = function(name, attributes, text) {
                return this.element(name, attributes, text);
            }, XMLDocumentCB.prototype.n = function(name, attributes, text) {
                return this.node(name, attributes, text);
            }, XMLDocumentCB.prototype.t = function(value) {
                return this.text(value);
            }, XMLDocumentCB.prototype.d = function(value) {
                return this.cdata(value);
            }, XMLDocumentCB.prototype.c = function(value) {
                return this.comment(value);
            }, XMLDocumentCB.prototype.r = function(value) {
                return this.raw(value);
            }, XMLDocumentCB.prototype.i = function(target, value) {
                return this.instruction(target, value);
            }, XMLDocumentCB.prototype.att = function() {
                return this.currentNode && this.currentNode instanceof XMLDocType ? this.attList.apply(this, arguments) : this.attribute.apply(this, arguments);
            }, XMLDocumentCB.prototype.a = function() {
                return this.currentNode && this.currentNode instanceof XMLDocType ? this.attList.apply(this, arguments) : this.attribute.apply(this, arguments);
            }, XMLDocumentCB.prototype.ent = function(name, value) {
                return this.entity(name, value);
            }, XMLDocumentCB.prototype.pent = function(name, value) {
                return this.pEntity(name, value);
            }, XMLDocumentCB.prototype.not = function(name, value) {
                return this.notation(name, value);
            }, XMLDocumentCB;
        })();
    }).call(this);
}
