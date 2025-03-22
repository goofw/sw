function(module, exports, __webpack_require__) {
    (function() {
        var XMLCData, XMLComment, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDeclaration, XMLDocType, XMLElement, XMLProcessingInstruction, XMLRaw, XMLText, XMLWriterBase, hasProp = {}.hasOwnProperty;
        XMLDeclaration = __webpack_require__(121), XMLDocType = __webpack_require__(122), 
        XMLCData = __webpack_require__(119), XMLComment = __webpack_require__(120), XMLElement = __webpack_require__(118), 
        XMLRaw = __webpack_require__(127), XMLText = __webpack_require__(128), XMLProcessingInstruction = __webpack_require__(129), 
        XMLDTDAttList = __webpack_require__(123), XMLDTDElement = __webpack_require__(125), 
        XMLDTDEntity = __webpack_require__(124), XMLDTDNotation = __webpack_require__(126), 
        XMLWriterBase = __webpack_require__(281), module.exports = (function(superClass) {
            function XMLStreamWriter(stream, options) {
                XMLStreamWriter.__super__.constructor.call(this, options), this.stream = stream;
            }
            return (function(child, parent) {
                for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype, child.prototype = new ctor, child.__super__ = parent.prototype;
            })(XMLStreamWriter, superClass), XMLStreamWriter.prototype.document = function(doc) {
                var child, i, j, len, len1, ref, ref1, results;
                for (i = 0, len = (ref = doc.children).length; i < len; i++) (child = ref[i]).isLastRootNode = !1;
                for (doc.children[doc.children.length - 1].isLastRootNode = !0, results = [], j = 0, 
                len1 = (ref1 = doc.children).length; j < len1; j++) switch (child = ref1[j], !1) {
                  case !(child instanceof XMLDeclaration):
                    results.push(this.declaration(child));
                    break;

                  case !(child instanceof XMLDocType):
                    results.push(this.docType(child));
                    break;

                  case !(child instanceof XMLComment):
                    results.push(this.comment(child));
                    break;

                  case !(child instanceof XMLProcessingInstruction):
                    results.push(this.processingInstruction(child));
                    break;

                  default:
                    results.push(this.element(child));
                }
                return results;
            }, XMLStreamWriter.prototype.attribute = function(att) {
                return this.stream.write(" " + att.name + '="' + att.value + '"');
            }, XMLStreamWriter.prototype.cdata = function(node, level) {
                return this.stream.write(this.space(level) + "<![CDATA[" + node.text + "]]>" + this.endline(node));
            }, XMLStreamWriter.prototype.comment = function(node, level) {
                return this.stream.write(this.space(level) + "\x3c!-- " + node.text + " --\x3e" + this.endline(node));
            }, XMLStreamWriter.prototype.declaration = function(node, level) {
                return this.stream.write(this.space(level)), this.stream.write('<?xml version="' + node.version + '"'), 
                null != node.encoding && this.stream.write(' encoding="' + node.encoding + '"'), 
                null != node.standalone && this.stream.write(' standalone="' + node.standalone + '"'), 
                this.stream.write(this.spacebeforeslash + "?>"), this.stream.write(this.endline(node));
            }, XMLStreamWriter.prototype.docType = function(node, level) {
                var child, i, len, ref;
                if (level || (level = 0), this.stream.write(this.space(level)), this.stream.write("<!DOCTYPE " + node.root().name), 
                node.pubID && node.sysID ? this.stream.write(' PUBLIC "' + node.pubID + '" "' + node.sysID + '"') : node.sysID && this.stream.write(' SYSTEM "' + node.sysID + '"'), 
                node.children.length > 0) {
                    for (this.stream.write(" ["), this.stream.write(this.endline(node)), i = 0, len = (ref = node.children).length; i < len; i++) switch (child = ref[i], 
                    !1) {
                      case !(child instanceof XMLDTDAttList):
                        this.dtdAttList(child, level + 1);
                        break;

                      case !(child instanceof XMLDTDElement):
                        this.dtdElement(child, level + 1);
                        break;

                      case !(child instanceof XMLDTDEntity):
                        this.dtdEntity(child, level + 1);
                        break;

                      case !(child instanceof XMLDTDNotation):
                        this.dtdNotation(child, level + 1);
                        break;

                      case !(child instanceof XMLCData):
                        this.cdata(child, level + 1);
                        break;

                      case !(child instanceof XMLComment):
                        this.comment(child, level + 1);
                        break;

                      case !(child instanceof XMLProcessingInstruction):
                        this.processingInstruction(child, level + 1);
                        break;

                      default:
                        throw new Error("Unknown DTD node type: " + child.constructor.name);
                    }
                    this.stream.write("]");
                }
                return this.stream.write(this.spacebeforeslash + ">"), this.stream.write(this.endline(node));
            }, XMLStreamWriter.prototype.element = function(node, level) {
                var att, child, i, len, name, ref, ref1, space;
                for (name in level || (level = 0), space = this.space(level), this.stream.write(space + "<" + node.name), 
                ref = node.attributes) hasProp.call(ref, name) && (att = ref[name], this.attribute(att));
                if (0 === node.children.length || node.children.every((function(e) {
                    return "" === e.value;
                }))) this.allowEmpty ? this.stream.write("></" + node.name + ">") : this.stream.write(this.spacebeforeslash + "/>"); else if (this.pretty && 1 === node.children.length && null != node.children[0].value) this.stream.write(">"), 
                this.stream.write(node.children[0].value), this.stream.write("</" + node.name + ">"); else {
                    for (this.stream.write(">" + this.newline), i = 0, len = (ref1 = node.children).length; i < len; i++) switch (child = ref1[i], 
                    !1) {
                      case !(child instanceof XMLCData):
                        this.cdata(child, level + 1);
                        break;

                      case !(child instanceof XMLComment):
                        this.comment(child, level + 1);
                        break;

                      case !(child instanceof XMLElement):
                        this.element(child, level + 1);
                        break;

                      case !(child instanceof XMLRaw):
                        this.raw(child, level + 1);
                        break;

                      case !(child instanceof XMLText):
                        this.text(child, level + 1);
                        break;

                      case !(child instanceof XMLProcessingInstruction):
                        this.processingInstruction(child, level + 1);
                        break;

                      default:
                        throw new Error("Unknown XML node type: " + child.constructor.name);
                    }
                    this.stream.write(space + "</" + node.name + ">");
                }
                return this.stream.write(this.endline(node));
            }, XMLStreamWriter.prototype.processingInstruction = function(node, level) {
                return this.stream.write(this.space(level) + "<?" + node.target), node.value && this.stream.write(" " + node.value), 
                this.stream.write(this.spacebeforeslash + "?>" + this.endline(node));
            }, XMLStreamWriter.prototype.raw = function(node, level) {
                return this.stream.write(this.space(level) + node.value + this.endline(node));
            }, XMLStreamWriter.prototype.text = function(node, level) {
                return this.stream.write(this.space(level) + node.value + this.endline(node));
            }, XMLStreamWriter.prototype.dtdAttList = function(node, level) {
                return this.stream.write(this.space(level) + "<!ATTLIST " + node.elementName + " " + node.attributeName + " " + node.attributeType), 
                "#DEFAULT" !== node.defaultValueType && this.stream.write(" " + node.defaultValueType), 
                node.defaultValue && this.stream.write(' "' + node.defaultValue + '"'), this.stream.write(this.spacebeforeslash + ">" + this.endline(node));
            }, XMLStreamWriter.prototype.dtdElement = function(node, level) {
                return this.stream.write(this.space(level) + "<!ELEMENT " + node.name + " " + node.value), 
                this.stream.write(this.spacebeforeslash + ">" + this.endline(node));
            }, XMLStreamWriter.prototype.dtdEntity = function(node, level) {
                return this.stream.write(this.space(level) + "<!ENTITY"), node.pe && this.stream.write(" %"), 
                this.stream.write(" " + node.name), node.value ? this.stream.write(' "' + node.value + '"') : (node.pubID && node.sysID ? this.stream.write(' PUBLIC "' + node.pubID + '" "' + node.sysID + '"') : node.sysID && this.stream.write(' SYSTEM "' + node.sysID + '"'), 
                node.nData && this.stream.write(" NDATA " + node.nData)), this.stream.write(this.spacebeforeslash + ">" + this.endline(node));
            }, XMLStreamWriter.prototype.dtdNotation = function(node, level) {
                return this.stream.write(this.space(level) + "<!NOTATION " + node.name), node.pubID && node.sysID ? this.stream.write(' PUBLIC "' + node.pubID + '" "' + node.sysID + '"') : node.pubID ? this.stream.write(' PUBLIC "' + node.pubID + '"') : node.sysID && this.stream.write(' SYSTEM "' + node.sysID + '"'), 
                this.stream.write(this.spacebeforeslash + ">" + this.endline(node));
            }, XMLStreamWriter.prototype.endline = function(node) {
                return node.isLastRootNode ? "" : this.newline;
            }, XMLStreamWriter;
        })(XMLWriterBase);
    }).call(this);
}
