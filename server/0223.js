function(module, exports, __webpack_require__) {
    var sprintf = __webpack_require__(224).sprintf, utils = __webpack_require__(448), ElementPath = __webpack_require__(954), TreeBuilder = __webpack_require__(449).TreeBuilder, get_parser = __webpack_require__(956).get_parser, constants = __webpack_require__(960), element_ids = 0;
    function Element(tag, attrib) {
        this._id = element_ids++, this.tag = tag, this.attrib = {}, this.text = null, this.tail = null, 
        this._children = [], attrib && (this.attrib = utils.merge(this.attrib, attrib));
    }
    function Comment(text) {
        var element = new Element(Comment);
        return text && (element.text = text), element;
    }
    function CData(text) {
        var element = new Element(CData);
        return text && (element.text = text), element;
    }
    function ProcessingInstruction(target, text) {
        var element = new Element(ProcessingInstruction);
        return element.text = target, text && (element.text = element.text + " " + text), 
        element;
    }
    function QName(text_or_uri, tag) {
        tag && (text_or_uri = sprintf("{%s}%s", text_or_uri, tag)), this.text = text_or_uri;
    }
    function ElementTree(element) {
        this._root = element;
    }
    Element.prototype.toString = function() {
        return sprintf("<Element %s at %s>", this.tag, this._id);
    }, Element.prototype.makeelement = function(tag, attrib) {
        return new Element(tag, attrib);
    }, Element.prototype.len = function() {
        return this._children.length;
    }, Element.prototype.getItem = function(index) {
        return this._children[index];
    }, Element.prototype.setItem = function(index, element) {
        this._children[index] = element;
    }, Element.prototype.delItem = function(index) {
        this._children.splice(index, 1);
    }, Element.prototype.getSlice = function(start, stop) {
        return this._children.slice(start, stop);
    }, Element.prototype.setSlice = function(start, stop, elements) {
        var i, k = 0;
        for (i = start; i < stop; i++, k++) this._children[i] = elements[k];
    }, Element.prototype.delSlice = function(start, stop) {
        this._children.splice(start, stop - start);
    }, Element.prototype.append = function(element) {
        this._children.push(element);
    }, Element.prototype.extend = function(elements) {
        this._children.concat(elements);
    }, Element.prototype.insert = function(index, element) {
        this._children[index] = element;
    }, Element.prototype.remove = function(element) {
        this._children = this._children.filter((function(e) {
            return e._id !== element._id;
        }));
    }, Element.prototype.getchildren = function() {
        return this._children;
    }, Element.prototype.find = function(path) {
        return ElementPath.find(this, path);
    }, Element.prototype.findtext = function(path, defvalue) {
        return ElementPath.findtext(this, path, defvalue);
    }, Element.prototype.findall = function(path, defvalue) {
        return ElementPath.findall(this, path, defvalue);
    }, Element.prototype.clear = function() {
        this.attrib = {}, this._children = [], this.text = null, this.tail = null;
    }, Element.prototype.get = function(key, defvalue) {
        return void 0 !== this.attrib[key] ? this.attrib[key] : defvalue;
    }, Element.prototype.set = function(key, value) {
        this.attrib[key] = value;
    }, Element.prototype.keys = function() {
        return Object.keys(this.attrib);
    }, Element.prototype.items = function() {
        return utils.items(this.attrib);
    }, Element.prototype.iter = function(tag, callback) {
        var i;
        for ("*" === tag && (tag = null), null !== tag && this.tag !== tag || callback(this), 
        i = 0; i < this._children.length; i++) this._children[i].iter(tag, (function(e) {
            callback(e);
        }));
    }, Element.prototype.itertext = function(callback) {
        this.iter(null, (function(e) {
            e.text && callback(e.text), e.tail && callback(e.tail);
        }));
    }, QName.prototype.toString = function() {
        return this.text;
    }, ElementTree.prototype.getroot = function() {
        return this._root;
    }, ElementTree.prototype._setroot = function(element) {
        this._root = element;
    }, ElementTree.prototype.parse = function(source, parser) {
        return parser || (parser = new ((parser = get_parser(constants.DEFAULT_PARSER)).XMLParser)(new TreeBuilder)), 
        parser.feed(source), this._root = parser.close(), this._root;
    }, ElementTree.prototype.iter = function(tag, callback) {
        this._root.iter(tag, callback);
    }, ElementTree.prototype.find = function(path) {
        return this._root.find(path);
    }, ElementTree.prototype.findtext = function(path, defvalue) {
        return this._root.findtext(path, defvalue);
    }, ElementTree.prototype.findall = function(path) {
        return this._root.findall(path);
    }, ElementTree.prototype.write = function(options) {
        var sb = [];
        if (!1 !== (options = utils.merge({
            encoding: "utf-8",
            xml_declaration: null,
            default_namespace: null,
            method: "xml"
        }, options)).xml_declaration && sb.push("<?xml version='1.0' encoding='" + options.encoding + "'?>\n"), 
        "text" === options.method) _serialize_text(sb, self._root, encoding); else {
            var qnames, namespaces, indent, indent_string, x = (function(elem, encoding, default_namespace) {
                var qnames = {}, namespaces = {};
                function add_qname(qname) {
                    if ("{" === qname[0]) {
                        var tmp = qname.substring(1).split("}", 2), uri = tmp[0], tag = tmp[1], prefix = namespaces[uri];
                        void 0 === prefix && (void 0 === (prefix = _namespace_map[uri]) && (prefix = "ns" + Object.keys(namespaces).length), 
                        "xml" !== prefix && (namespaces[uri] = prefix)), qnames[qname] = prefix ? sprintf("%s:%s", prefix, tag) : tag;
                    } else {
                        if (default_namespace) throw new Error("cannot use non-qualified names with default_namespace option");
                        qnames[qname] = qname;
                    }
                }
                return default_namespace && (namespaces[default_namespace] = ""), elem.iter(null, (function(e) {
                    var tag = e.tag, text = e.text, items = e.items();
                    if (tag instanceof QName && void 0 === qnames[tag.text]) add_qname(tag.text); else if ("string" == typeof tag) add_qname(tag); else if (null !== tag && tag !== Comment && tag !== CData && tag !== ProcessingInstruction) throw new Error("Invalid tag type for serialization: " + tag);
                    text instanceof QName && void 0 === qnames[text.text] && add_qname(text.text), items.forEach((function(item) {
                        var key = item[0], value = item[1];
                        key instanceof QName && (key = key.text), void 0 === qnames[key] && add_qname(key), 
                        value instanceof QName && void 0 === qnames[value.text] && add_qname(value.text);
                    }));
                })), [ qnames, namespaces ];
            })(this._root, options.encoding, options.default_namespace);
            if (qnames = x[0], namespaces = x[1], options.hasOwnProperty("indent") ? (indent = 0, 
            indent_string = new Array(options.indent + 1).join(" ")) : indent = !1, "xml" !== options.method) throw new Error("unknown serialization method " + options.method);
            _serialize_xml((function(data) {
                sb.push(data);
            }), this._root, options.encoding, qnames, namespaces, indent, indent_string);
        }
        return sb.join("");
    };
    var _namespace_map = {
        "http://www.w3.org/XML/1998/namespace": "xml",
        "http://www.w3.org/1999/xhtml": "html",
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#": "rdf",
        "http://schemas.xmlsoap.org/wsdl/": "wsdl",
        "http://www.w3.org/2001/XMLSchema": "xs",
        "http://www.w3.org/2001/XMLSchema-instance": "xsi",
        "http://purl.org/dc/elements/1.1/": "dc"
    };
    function _escape(text, encoding, isAttribute, isText) {
        return text && (text = (text = (text = (text = text.toString()).replace(/&/g, "&amp;")).replace(/</g, "&lt;")).replace(/>/g, "&gt;"), 
        isText || (text = (text = text.replace(/\n/g, "&#xA;")).replace(/\r/g, "&#xD;")), 
        isAttribute && (text = text.replace(/"/g, "&quot;"))), text;
    }
    function _escape_attrib(text, encoding) {
        return _escape(text, 0, !0);
    }
    function _escape_cdata(text, encoding) {
        return _escape(text, 0, !1);
    }
    function _escape_text(text, encoding) {
        return _escape(text, 0, !1, !0);
    }
    function _serialize_xml(write, elem, encoding, qnames, namespaces, indent, indent_string) {
        var items, tag = elem.tag, text = elem.text, newlines = indent || 0 === indent;
        write(Array(indent + 1).join(indent_string)), tag === Comment ? write(sprintf("\x3c!--%s--\x3e", _escape_cdata(text))) : tag === ProcessingInstruction ? write(sprintf("<?%s?>", _escape_cdata(text))) : tag === CData ? write(sprintf("<![CDATA[%s]]>", text = text || "")) : void 0 === (tag = qnames[tag]) ? (text && write(_escape_text(text)), 
        elem.iter((function(e) {
            _serialize_xml(write, e, encoding, qnames, null, !!newlines && indent + 1, indent_string);
        }))) : (write("<" + tag), ((items = elem.items()) || namespaces) && (items.sort(), 
        items.forEach((function(item) {
            var k = item[0], v = item[1];
            k instanceof QName && (k = k.text), v = v instanceof QName ? qnames[v.text] : _escape_attrib(v), 
            write(sprintf(' %s="%s"', qnames[k], v));
        })), namespaces && ((items = utils.items(namespaces)).sort((function(a, b) {
            return a[1] < b[1];
        })), items.forEach((function(item) {
            var k = item[1], v = item[0];
            k && (k = ":" + k), write(sprintf(' xmlns%s="%s"', k, _escape_attrib(v)));
        })))), text || elem.len() ? (text && text.toString().match(/^\s*$/) && (text = null), 
        write(">"), !text && newlines && write("\n"), text && write(_escape_text(text)), 
        elem._children.forEach((function(e) {
            _serialize_xml(write, e, encoding, qnames, null, !!newlines && indent + 1, indent_string);
        })), !text && indent && write(Array(indent + 1).join(indent_string)), write("</" + tag + ">")) : write(" />")), 
        newlines && write("\n");
    }
    exports.PI = ProcessingInstruction, exports.Comment = Comment, exports.CData = CData, 
    exports.ProcessingInstruction = ProcessingInstruction, exports.SubElement = function(parent, tag, attrib) {
        var element = parent.makeelement(tag, attrib);
        return parent.append(element), element;
    }, exports.QName = QName, exports.ElementTree = ElementTree, exports.ElementPath = ElementPath, 
    exports.Element = function(tag, attrib) {
        return new Element(tag, attrib);
    }, exports.XML = function(data) {
        return (new ElementTree).parse(data);
    }, exports.parse = function(source, parser) {
        var tree = new ElementTree;
        return tree.parse(source, parser), tree;
    }, exports.register_namespace = function(prefix, uri) {
        if (/ns\d+$/.test(prefix)) throw new Error("Prefix format reserved for internal use");
        _namespace_map.hasOwnProperty(uri) && _namespace_map[uri] === prefix && delete _namespace_map[uri], 
        _namespace_map[uri] = prefix;
    }, exports.tostring = function(element, options) {
        return new ElementTree(element).write(options);
    };
}
