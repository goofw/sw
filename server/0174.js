function(module, exports, __webpack_require__) {
    (function() {
        var XMLCData, XMLComment, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDeclaration, XMLDocType, XMLElement, XMLProcessingInstruction, XMLRaw, XMLText, XMLWriterBase, hasProp = {}.hasOwnProperty;
        XMLDeclaration = __webpack_require__(121), XMLDocType = __webpack_require__(122), 
        XMLCData = __webpack_require__(119), XMLComment = __webpack_require__(120), XMLElement = __webpack_require__(118), 
        XMLRaw = __webpack_require__(127), XMLText = __webpack_require__(128), XMLProcessingInstruction = __webpack_require__(129), 
        XMLDTDAttList = __webpack_require__(123), XMLDTDElement = __webpack_require__(125), 
        XMLDTDEntity = __webpack_require__(124), XMLDTDNotation = __webpack_require__(126), 
        XMLWriterBase = __webpack_require__(281), module.exports = (function(superClass) {
            function XMLStringWriter(options) {
                XMLStringWriter.__super__.constructor.call(this, options);
            }
            return (function(child, parent) {
                for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype, child.prototype = new ctor, child.__super__ = parent.prototype;
            })(XMLStringWriter, superClass), XMLStringWriter.prototype.document = function(doc) {
                var child, i, len, r, ref;
                for (this.textispresent = !1, r = "", i = 0, len = (ref = doc.children).length; i < len; i++) child = ref[i], 
                r += function() {
                    switch (!1) {
                      case !(child instanceof XMLDeclaration):
                        return this.declaration(child);

                      case !(child instanceof XMLDocType):
                        return this.docType(child);

                      case !(child instanceof XMLComment):
                        return this.comment(child);

                      case !(child instanceof XMLProcessingInstruction):
                        return this.processingInstruction(child);

                      default:
                        return this.element(child, 0);
                    }
                }.call(this);
                return this.pretty && r.slice(-this.newline.length) === this.newline && (r = r.slice(0, -this.newline.length)), 
                r;
            }, XMLStringWriter.prototype.attribute = function(att) {
                return " " + att.name + '="' + att.value + '"';
            }, XMLStringWriter.prototype.cdata = function(node, level) {
                return this.space(level) + "<![CDATA[" + node.text + "]]>" + this.newline;
            }, XMLStringWriter.prototype.comment = function(node, level) {
                return this.space(level) + "\x3c!-- " + node.text + " --\x3e" + this.newline;
            }, XMLStringWriter.prototype.declaration = function(node, level) {
                var r;
                return r = this.space(level), r += '<?xml version="' + node.version + '"', null != node.encoding && (r += ' encoding="' + node.encoding + '"'), 
                null != node.standalone && (r += ' standalone="' + node.standalone + '"'), (r += this.spacebeforeslash + "?>") + this.newline;
            }, XMLStringWriter.prototype.docType = function(node, level) {
                var child, i, len, r, ref;
                if (level || (level = 0), r = this.space(level), r += "<!DOCTYPE " + node.root().name, 
                node.pubID && node.sysID ? r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"' : node.sysID && (r += ' SYSTEM "' + node.sysID + '"'), 
                node.children.length > 0) {
                    for (r += " [", r += this.newline, i = 0, len = (ref = node.children).length; i < len; i++) child = ref[i], 
                    r += function() {
                        switch (!1) {
                          case !(child instanceof XMLDTDAttList):
                            return this.dtdAttList(child, level + 1);

                          case !(child instanceof XMLDTDElement):
                            return this.dtdElement(child, level + 1);

                          case !(child instanceof XMLDTDEntity):
                            return this.dtdEntity(child, level + 1);

                          case !(child instanceof XMLDTDNotation):
                            return this.dtdNotation(child, level + 1);

                          case !(child instanceof XMLCData):
                            return this.cdata(child, level + 1);

                          case !(child instanceof XMLComment):
                            return this.comment(child, level + 1);

                          case !(child instanceof XMLProcessingInstruction):
                            return this.processingInstruction(child, level + 1);

                          default:
                            throw new Error("Unknown DTD node type: " + child.constructor.name);
                        }
                    }.call(this);
                    r += "]";
                }
                return (r += this.spacebeforeslash + ">") + this.newline;
            }, XMLStringWriter.prototype.element = function(node, level) {
                var att, child, i, j, len, len1, name, r, ref, ref1, ref2, space, textispresentwasset;
                for (name in level || (level = 0), textispresentwasset = !1, this.textispresent ? (this.newline = "", 
                this.pretty = !1) : (this.newline = this.newlinedefault, this.pretty = this.prettydefault), 
                r = "", r += (space = this.space(level)) + "<" + node.name, ref = node.attributes) hasProp.call(ref, name) && (att = ref[name], 
                r += this.attribute(att));
                if (0 === node.children.length || node.children.every((function(e) {
                    return "" === e.value;
                }))) this.allowEmpty ? r += "></" + node.name + ">" + this.newline : r += this.spacebeforeslash + "/>" + this.newline; else if (this.pretty && 1 === node.children.length && null != node.children[0].value) r += ">", 
                r += node.children[0].value, r += "</" + node.name + ">" + this.newline; else {
                    if (this.dontprettytextnodes) for (i = 0, len = (ref1 = node.children).length; i < len; i++) if (null != (child = ref1[i]).value) {
                        this.textispresent++, textispresentwasset = !0;
                        break;
                    }
                    for (this.textispresent && (this.newline = "", this.pretty = !1, space = this.space(level)), 
                    r += ">" + this.newline, j = 0, len1 = (ref2 = node.children).length; j < len1; j++) child = ref2[j], 
                    r += function() {
                        switch (!1) {
                          case !(child instanceof XMLCData):
                            return this.cdata(child, level + 1);

                          case !(child instanceof XMLComment):
                            return this.comment(child, level + 1);

                          case !(child instanceof XMLElement):
                            return this.element(child, level + 1);

                          case !(child instanceof XMLRaw):
                            return this.raw(child, level + 1);

                          case !(child instanceof XMLText):
                            return this.text(child, level + 1);

                          case !(child instanceof XMLProcessingInstruction):
                            return this.processingInstruction(child, level + 1);

                          default:
                            throw new Error("Unknown XML node type: " + child.constructor.name);
                        }
                    }.call(this);
                    textispresentwasset && this.textispresent--, this.textispresent || (this.newline = this.newlinedefault, 
                    this.pretty = this.prettydefault), r += space + "</" + node.name + ">" + this.newline;
                }
                return r;
            }, XMLStringWriter.prototype.processingInstruction = function(node, level) {
                var r;
                return r = this.space(level) + "<?" + node.target, node.value && (r += " " + node.value), 
                r + (this.spacebeforeslash + "?>") + this.newline;
            }, XMLStringWriter.prototype.raw = function(node, level) {
                return this.space(level) + node.value + this.newline;
            }, XMLStringWriter.prototype.text = function(node, level) {
                return this.space(level) + node.value + this.newline;
            }, XMLStringWriter.prototype.dtdAttList = function(node, level) {
                var r;
                return r = this.space(level) + "<!ATTLIST " + node.elementName + " " + node.attributeName + " " + node.attributeType, 
                "#DEFAULT" !== node.defaultValueType && (r += " " + node.defaultValueType), node.defaultValue && (r += ' "' + node.defaultValue + '"'), 
                r + (this.spacebeforeslash + ">") + this.newline;
            }, XMLStringWriter.prototype.dtdElement = function(node, level) {
                return this.space(level) + "<!ELEMENT " + node.name + " " + node.value + this.spacebeforeslash + ">" + this.newline;
            }, XMLStringWriter.prototype.dtdEntity = function(node, level) {
                var r;
                return r = this.space(level) + "<!ENTITY", node.pe && (r += " %"), r += " " + node.name, 
                node.value ? r += ' "' + node.value + '"' : (node.pubID && node.sysID ? r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"' : node.sysID && (r += ' SYSTEM "' + node.sysID + '"'), 
                node.nData && (r += " NDATA " + node.nData)), r + (this.spacebeforeslash + ">") + this.newline;
            }, XMLStringWriter.prototype.dtdNotation = function(node, level) {
                var r;
                return r = this.space(level) + "<!NOTATION " + node.name, node.pubID && node.sysID ? r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"' : node.pubID ? r += ' PUBLIC "' + node.pubID + '"' : node.sysID && (r += ' SYSTEM "' + node.sysID + '"'), 
                r + (this.spacebeforeslash + ">") + this.newline;
            }, XMLStringWriter.prototype.openNode = function(node, level) {
                var att, name, r, ref;
                if (level || (level = 0), node instanceof XMLElement) {
                    for (name in r = this.space(level) + "<" + node.name, ref = node.attributes) hasProp.call(ref, name) && (att = ref[name], 
                    r += this.attribute(att));
                    return r + (node.children ? ">" : "/>") + this.newline;
                }
                return r = this.space(level) + "<!DOCTYPE " + node.rootNodeName, node.pubID && node.sysID ? r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"' : node.sysID && (r += ' SYSTEM "' + node.sysID + '"'), 
                r + (node.children ? " [" : ">") + this.newline;
            }, XMLStringWriter.prototype.closeNode = function(node, level) {
                switch (level || (level = 0), !1) {
                  case !(node instanceof XMLElement):
                    return this.space(level) + "</" + node.name + ">" + this.newline;

                  case !(node instanceof XMLDocType):
                    return this.space(level) + "]>" + this.newline;
                }
            }, XMLStringWriter;
        })(XMLWriterBase);
    }).call(this);
}
