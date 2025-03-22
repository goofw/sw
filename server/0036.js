function(module, exports, __webpack_require__) {
    (function() {
        var XMLCData, XMLComment, XMLDeclaration, XMLDocType, XMLElement, XMLProcessingInstruction, XMLRaw, XMLText, isEmpty, isFunction, isObject, ref, hasProp = {}.hasOwnProperty;
        ref = __webpack_require__(52), isObject = ref.isObject, isFunction = ref.isFunction, 
        isEmpty = ref.isEmpty, XMLElement = null, XMLCData = null, XMLComment = null, XMLDeclaration = null, 
        XMLDocType = null, XMLRaw = null, XMLText = null, XMLProcessingInstruction = null, 
        module.exports = (function() {
            function XMLNode(parent) {
                this.parent = parent, this.parent && (this.options = this.parent.options, this.stringify = this.parent.stringify), 
                this.children = [], XMLElement || (XMLElement = __webpack_require__(118), XMLCData = __webpack_require__(119), 
                XMLComment = __webpack_require__(120), XMLDeclaration = __webpack_require__(121), 
                XMLDocType = __webpack_require__(122), XMLRaw = __webpack_require__(127), XMLText = __webpack_require__(128), 
                XMLProcessingInstruction = __webpack_require__(129));
            }
            return XMLNode.prototype.element = function(name, attributes, text) {
                var childNode, item, j, k, key, lastChild, len, len1, ref1, val;
                if (lastChild = null, null == attributes && (attributes = {}), attributes = attributes.valueOf(), 
                isObject(attributes) || (text = (ref1 = [ attributes, text ])[0], attributes = ref1[1]), 
                null != name && (name = name.valueOf()), Array.isArray(name)) for (j = 0, len = name.length; j < len; j++) item = name[j], 
                lastChild = this.element(item); else if (isFunction(name)) lastChild = this.element(name.apply()); else if (isObject(name)) {
                    for (key in name) if (hasProp.call(name, key)) if (val = name[key], isFunction(val) && (val = val.apply()), 
                    isObject(val) && isEmpty(val) && (val = null), !this.options.ignoreDecorators && this.stringify.convertAttKey && 0 === key.indexOf(this.stringify.convertAttKey)) lastChild = this.attribute(key.substr(this.stringify.convertAttKey.length), val); else if (!this.options.separateArrayItems && Array.isArray(val)) for (k = 0, 
                    len1 = val.length; k < len1; k++) item = val[k], (childNode = {})[key] = item, lastChild = this.element(childNode); else isObject(val) ? (lastChild = this.element(key)).element(val) : lastChild = this.element(key, val);
                } else lastChild = !this.options.ignoreDecorators && this.stringify.convertTextKey && 0 === name.indexOf(this.stringify.convertTextKey) ? this.text(text) : !this.options.ignoreDecorators && this.stringify.convertCDataKey && 0 === name.indexOf(this.stringify.convertCDataKey) ? this.cdata(text) : !this.options.ignoreDecorators && this.stringify.convertCommentKey && 0 === name.indexOf(this.stringify.convertCommentKey) ? this.comment(text) : !this.options.ignoreDecorators && this.stringify.convertRawKey && 0 === name.indexOf(this.stringify.convertRawKey) ? this.raw(text) : !this.options.ignoreDecorators && this.stringify.convertPIKey && 0 === name.indexOf(this.stringify.convertPIKey) ? this.instruction(name.substr(this.stringify.convertPIKey.length), text) : this.node(name, attributes, text);
                if (null == lastChild) throw new Error("Could not create any elements with: " + name);
                return lastChild;
            }, XMLNode.prototype.insertBefore = function(name, attributes, text) {
                var child, i, removed;
                if (this.isRoot) throw new Error("Cannot insert elements at root level");
                return i = this.parent.children.indexOf(this), removed = this.parent.children.splice(i), 
                child = this.parent.element(name, attributes, text), Array.prototype.push.apply(this.parent.children, removed), 
                child;
            }, XMLNode.prototype.insertAfter = function(name, attributes, text) {
                var child, i, removed;
                if (this.isRoot) throw new Error("Cannot insert elements at root level");
                return i = this.parent.children.indexOf(this), removed = this.parent.children.splice(i + 1), 
                child = this.parent.element(name, attributes, text), Array.prototype.push.apply(this.parent.children, removed), 
                child;
            }, XMLNode.prototype.remove = function() {
                var i;
                if (this.isRoot) throw new Error("Cannot remove the root element");
                return i = this.parent.children.indexOf(this), [].splice.apply(this.parent.children, [ i, i - i + 1 ].concat([])), 
                this.parent;
            }, XMLNode.prototype.node = function(name, attributes, text) {
                var child, ref1;
                return null != name && (name = name.valueOf()), attributes || (attributes = {}), 
                attributes = attributes.valueOf(), isObject(attributes) || (text = (ref1 = [ attributes, text ])[0], 
                attributes = ref1[1]), child = new XMLElement(this, name, attributes), null != text && child.text(text), 
                this.children.push(child), child;
            }, XMLNode.prototype.text = function(value) {
                var child;
                return child = new XMLText(this, value), this.children.push(child), this;
            }, XMLNode.prototype.cdata = function(value) {
                var child;
                return child = new XMLCData(this, value), this.children.push(child), this;
            }, XMLNode.prototype.comment = function(value) {
                var child;
                return child = new XMLComment(this, value), this.children.push(child), this;
            }, XMLNode.prototype.commentBefore = function(value) {
                var i, removed;
                return i = this.parent.children.indexOf(this), removed = this.parent.children.splice(i), 
                this.parent.comment(value), Array.prototype.push.apply(this.parent.children, removed), 
                this;
            }, XMLNode.prototype.commentAfter = function(value) {
                var i, removed;
                return i = this.parent.children.indexOf(this), removed = this.parent.children.splice(i + 1), 
                this.parent.comment(value), Array.prototype.push.apply(this.parent.children, removed), 
                this;
            }, XMLNode.prototype.raw = function(value) {
                var child;
                return child = new XMLRaw(this, value), this.children.push(child), this;
            }, XMLNode.prototype.instruction = function(target, value) {
                var insTarget, insValue, instruction, j, len;
                if (null != target && (target = target.valueOf()), null != value && (value = value.valueOf()), 
                Array.isArray(target)) for (j = 0, len = target.length; j < len; j++) insTarget = target[j], 
                this.instruction(insTarget); else if (isObject(target)) for (insTarget in target) hasProp.call(target, insTarget) && (insValue = target[insTarget], 
                this.instruction(insTarget, insValue)); else isFunction(value) && (value = value.apply()), 
                instruction = new XMLProcessingInstruction(this, target, value), this.children.push(instruction);
                return this;
            }, XMLNode.prototype.instructionBefore = function(target, value) {
                var i, removed;
                return i = this.parent.children.indexOf(this), removed = this.parent.children.splice(i), 
                this.parent.instruction(target, value), Array.prototype.push.apply(this.parent.children, removed), 
                this;
            }, XMLNode.prototype.instructionAfter = function(target, value) {
                var i, removed;
                return i = this.parent.children.indexOf(this), removed = this.parent.children.splice(i + 1), 
                this.parent.instruction(target, value), Array.prototype.push.apply(this.parent.children, removed), 
                this;
            }, XMLNode.prototype.declaration = function(version, encoding, standalone) {
                var doc, xmldec;
                return doc = this.document(), xmldec = new XMLDeclaration(doc, version, encoding, standalone), 
                doc.children[0] instanceof XMLDeclaration ? doc.children[0] = xmldec : doc.children.unshift(xmldec), 
                doc.root() || doc;
            }, XMLNode.prototype.doctype = function(pubID, sysID) {
                var doc, doctype, i, j, k, len, len1, ref1, ref2;
                for (doc = this.document(), doctype = new XMLDocType(doc, pubID, sysID), i = j = 0, 
                len = (ref1 = doc.children).length; j < len; i = ++j) if (ref1[i] instanceof XMLDocType) return doc.children[i] = doctype, 
                doctype;
                for (i = k = 0, len1 = (ref2 = doc.children).length; k < len1; i = ++k) if (ref2[i].isRoot) return doc.children.splice(i, 0, doctype), 
                doctype;
                return doc.children.push(doctype), doctype;
            }, XMLNode.prototype.up = function() {
                if (this.isRoot) throw new Error("The root node has no parent. Use doc() if you need to get the document object.");
                return this.parent;
            }, XMLNode.prototype.root = function() {
                var node;
                for (node = this; node; ) {
                    if (node.isDocument) return node.rootObject;
                    if (node.isRoot) return node;
                    node = node.parent;
                }
            }, XMLNode.prototype.document = function() {
                var node;
                for (node = this; node; ) {
                    if (node.isDocument) return node;
                    node = node.parent;
                }
            }, XMLNode.prototype.end = function(options) {
                return this.document().end(options);
            }, XMLNode.prototype.prev = function() {
                var i;
                if ((i = this.parent.children.indexOf(this)) < 1) throw new Error("Already at the first node");
                return this.parent.children[i - 1];
            }, XMLNode.prototype.next = function() {
                var i;
                if (-1 === (i = this.parent.children.indexOf(this)) || i === this.parent.children.length - 1) throw new Error("Already at the last node");
                return this.parent.children[i + 1];
            }, XMLNode.prototype.importDocument = function(doc) {
                var clonedRoot;
                return (clonedRoot = doc.root().clone()).parent = this, clonedRoot.isRoot = !1, 
                this.children.push(clonedRoot), this;
            }, XMLNode.prototype.ele = function(name, attributes, text) {
                return this.element(name, attributes, text);
            }, XMLNode.prototype.nod = function(name, attributes, text) {
                return this.node(name, attributes, text);
            }, XMLNode.prototype.txt = function(value) {
                return this.text(value);
            }, XMLNode.prototype.dat = function(value) {
                return this.cdata(value);
            }, XMLNode.prototype.com = function(value) {
                return this.comment(value);
            }, XMLNode.prototype.ins = function(target, value) {
                return this.instruction(target, value);
            }, XMLNode.prototype.doc = function() {
                return this.document();
            }, XMLNode.prototype.dec = function(version, encoding, standalone) {
                return this.declaration(version, encoding, standalone);
            }, XMLNode.prototype.dtd = function(pubID, sysID) {
                return this.doctype(pubID, sysID);
            }, XMLNode.prototype.e = function(name, attributes, text) {
                return this.element(name, attributes, text);
            }, XMLNode.prototype.n = function(name, attributes, text) {
                return this.node(name, attributes, text);
            }, XMLNode.prototype.t = function(value) {
                return this.text(value);
            }, XMLNode.prototype.d = function(value) {
                return this.cdata(value);
            }, XMLNode.prototype.c = function(value) {
                return this.comment(value);
            }, XMLNode.prototype.r = function(value) {
                return this.raw(value);
            }, XMLNode.prototype.i = function(target, value) {
                return this.instruction(target, value);
            }, XMLNode.prototype.u = function() {
                return this.up();
            }, XMLNode.prototype.importXMLBuilder = function(doc) {
                return this.importDocument(doc);
            }, XMLNode;
        })();
    }).call(this);
}
