function(module, exports, __webpack_require__) {
    !(function(sax) {
        sax.parser = function(strict, opt) {
            return new SAXParser(strict, opt);
        }, sax.SAXParser = SAXParser, sax.SAXStream = SAXStream, sax.createStream = function(strict, opt) {
            return new SAXStream(strict, opt);
        }, sax.MAX_BUFFER_LENGTH = 65536;
        var buffers = [ "comment", "sgmlDecl", "textNode", "tagName", "doctype", "procInstName", "procInstBody", "entity", "attribName", "attribValue", "cdata", "script" ];
        function SAXParser(strict, opt) {
            if (!(this instanceof SAXParser)) return new SAXParser(strict, opt);
            !(function(parser) {
                for (var i = 0, l = buffers.length; i < l; i++) parser[buffers[i]] = "";
            })(this), this.q = this.c = "", this.bufferCheckPosition = sax.MAX_BUFFER_LENGTH, 
            this.opt = opt || {}, this.opt.lowercase = this.opt.lowercase || this.opt.lowercasetags, 
            this.looseCase = this.opt.lowercase ? "toLowerCase" : "toUpperCase", this.tags = [], 
            this.closed = this.closedRoot = this.sawRoot = !1, this.tag = this.error = null, 
            this.strict = !!strict, this.noscript = !(!strict && !this.opt.noscript), this.state = S.BEGIN, 
            this.ENTITIES = Object.create(sax.ENTITIES), this.attribList = [], this.opt.xmlns && (this.ns = Object.create(rootNS)), 
            this.trackPosition = !1 !== this.opt.position, this.trackPosition && (this.position = this.line = this.column = 0), 
            emit(this, "onready");
        }
        sax.EVENTS = [ "text", "processinginstruction", "sgmldeclaration", "doctype", "comment", "attribute", "opentag", "closetag", "opencdata", "cdata", "closecdata", "error", "end", "ready", "script", "opennamespace", "closenamespace" ], 
        Object.create || (Object.create = function(o) {
            function f() {
                this.__proto__ = o;
            }
            return f.prototype = o, new f;
        }), Object.getPrototypeOf || (Object.getPrototypeOf = function(o) {
            return o.__proto__;
        }), Object.keys || (Object.keys = function(o) {
            var a = [];
            for (var i in o) o.hasOwnProperty(i) && a.push(i);
            return a;
        }), SAXParser.prototype = {
            end: function() {
                end(this);
            },
            write: function(chunk) {
                if (this.error) throw this.error;
                if (this.closed) return error(this, "Cannot write after close. Assign an onready handler.");
                if (null === chunk) return end(this);
                for (var i = 0, c = ""; this.c = c = chunk.charAt(i++); ) switch (this.trackPosition && (this.position++, 
                "\n" === c ? (this.line++, this.column = 0) : this.column++), this.state) {
                  case S.BEGIN:
                    "<" === c ? this.state = S.OPEN_WAKA : not(whitespace, c) && (strictFail(this, "Non-whitespace before first tag."), 
                    this.textNode = c, this.state = S.TEXT);
                    continue;

                  case S.TEXT:
                    if (this.sawRoot && !this.closedRoot) {
                        for (var starti = i - 1; c && "<" !== c && "&" !== c; ) (c = chunk.charAt(i++)) && this.trackPosition && (this.position++, 
                        "\n" === c ? (this.line++, this.column = 0) : this.column++);
                        this.textNode += chunk.substring(starti, i - 1);
                    }
                    "<" === c ? this.state = S.OPEN_WAKA : (!not(whitespace, c) || this.sawRoot && !this.closedRoot || strictFail("Text data outside of root node."), 
                    "&" === c ? this.state = S.TEXT_ENTITY : this.textNode += c);
                    continue;

                  case S.SCRIPT:
                    "<" === c ? this.state = S.SCRIPT_ENDING : this.script += c;
                    continue;

                  case S.SCRIPT_ENDING:
                    "/" === c ? (emitNode(this, "onscript", this.script), this.state = S.CLOSE_TAG, 
                    this.script = "", this.tagName = "") : (this.script += "<" + c, this.state = S.SCRIPT);
                    continue;

                  case S.OPEN_WAKA:
                    "!" === c ? (this.state = S.SGML_DECL, this.sgmlDecl = "") : is(whitespace, c) || (is(nameStart, c) ? (this.startTagPosition = this.position - 1, 
                    this.state = S.OPEN_TAG, this.tagName = c) : "/" === c ? (this.startTagPosition = this.position - 1, 
                    this.state = S.CLOSE_TAG, this.tagName = "") : "?" === c ? (this.state = S.PROC_INST, 
                    this.procInstName = this.procInstBody = "") : (strictFail(this, "Unencoded <"), 
                    this.textNode += "<" + c, this.state = S.TEXT));
                    continue;

                  case S.SGML_DECL:
                    "[CDATA[" === (this.sgmlDecl + c).toUpperCase() ? (emitNode(this, "onopencdata"), 
                    this.state = S.CDATA, this.sgmlDecl = "", this.cdata = "") : this.sgmlDecl + c === "--" ? (this.state = S.COMMENT, 
                    this.comment = "", this.sgmlDecl = "") : "DOCTYPE" === (this.sgmlDecl + c).toUpperCase() ? (this.state = S.DOCTYPE, 
                    (this.doctype || this.sawRoot) && strictFail(this, "Inappropriately located doctype declaration"), 
                    this.doctype = "", this.sgmlDecl = "") : ">" === c ? (emitNode(this, "onsgmldeclaration", this.sgmlDecl), 
                    this.sgmlDecl = "", this.state = S.TEXT) : is(quote, c) ? (this.state = S.SGML_DECL_QUOTED, 
                    this.sgmlDecl += c) : this.sgmlDecl += c;
                    continue;

                  case S.SGML_DECL_QUOTED:
                    c === this.q && (this.state = S.SGML_DECL, this.q = ""), this.sgmlDecl += c;
                    continue;

                  case S.DOCTYPE:
                    ">" === c ? (this.state = S.TEXT, emitNode(this, "ondoctype", this.doctype), this.doctype = !0) : (this.doctype += c, 
                    "[" === c ? this.state = S.DOCTYPE_DTD : is(quote, c) && (this.state = S.DOCTYPE_QUOTED, 
                    this.q = c));
                    continue;

                  case S.DOCTYPE_QUOTED:
                    this.doctype += c, c === this.q && (this.q = "", this.state = S.DOCTYPE);
                    continue;

                  case S.DOCTYPE_DTD:
                    this.doctype += c, "]" === c ? this.state = S.DOCTYPE : is(quote, c) && (this.state = S.DOCTYPE_DTD_QUOTED, 
                    this.q = c);
                    continue;

                  case S.DOCTYPE_DTD_QUOTED:
                    this.doctype += c, c === this.q && (this.state = S.DOCTYPE_DTD, this.q = "");
                    continue;

                  case S.COMMENT:
                    "-" === c ? this.state = S.COMMENT_ENDING : this.comment += c;
                    continue;

                  case S.COMMENT_ENDING:
                    "-" === c ? (this.state = S.COMMENT_ENDED, this.comment = textopts(this.opt, this.comment), 
                    this.comment && emitNode(this, "oncomment", this.comment), this.comment = "") : (this.comment += "-" + c, 
                    this.state = S.COMMENT);
                    continue;

                  case S.COMMENT_ENDED:
                    ">" !== c ? (strictFail(this, "Malformed comment"), this.comment += "--" + c, this.state = S.COMMENT) : this.state = S.TEXT;
                    continue;

                  case S.CDATA:
                    "]" === c ? this.state = S.CDATA_ENDING : this.cdata += c;
                    continue;

                  case S.CDATA_ENDING:
                    "]" === c ? this.state = S.CDATA_ENDING_2 : (this.cdata += "]" + c, this.state = S.CDATA);
                    continue;

                  case S.CDATA_ENDING_2:
                    ">" === c ? (this.cdata && emitNode(this, "oncdata", this.cdata), emitNode(this, "onclosecdata"), 
                    this.cdata = "", this.state = S.TEXT) : "]" === c ? this.cdata += "]" : (this.cdata += "]]" + c, 
                    this.state = S.CDATA);
                    continue;

                  case S.PROC_INST:
                    "?" === c ? this.state = S.PROC_INST_ENDING : is(whitespace, c) ? this.state = S.PROC_INST_BODY : this.procInstName += c;
                    continue;

                  case S.PROC_INST_BODY:
                    if (!this.procInstBody && is(whitespace, c)) continue;
                    "?" === c ? this.state = S.PROC_INST_ENDING : is(quote, c) ? (this.state = S.PROC_INST_QUOTED, 
                    this.q = c, this.procInstBody += c) : this.procInstBody += c;
                    continue;

                  case S.PROC_INST_ENDING:
                    ">" === c ? (emitNode(this, "onprocessinginstruction", {
                        name: this.procInstName,
                        body: this.procInstBody
                    }), this.procInstName = this.procInstBody = "", this.state = S.TEXT) : (this.procInstBody += "?" + c, 
                    this.state = S.PROC_INST_BODY);
                    continue;

                  case S.PROC_INST_QUOTED:
                    this.procInstBody += c, c === this.q && (this.state = S.PROC_INST_BODY, this.q = "");
                    continue;

                  case S.OPEN_TAG:
                    is(nameBody, c) ? this.tagName += c : (newTag(this), ">" === c ? openTag(this) : "/" === c ? this.state = S.OPEN_TAG_SLASH : (not(whitespace, c) && strictFail(this, "Invalid character in tag name"), 
                    this.state = S.ATTRIB));
                    continue;

                  case S.OPEN_TAG_SLASH:
                    ">" === c ? (openTag(this, !0), closeTag(this)) : (strictFail(this, "Forward-slash in opening tag not followed by >"), 
                    this.state = S.ATTRIB);
                    continue;

                  case S.ATTRIB:
                    if (is(whitespace, c)) continue;
                    ">" === c ? openTag(this) : "/" === c ? this.state = S.OPEN_TAG_SLASH : is(nameStart, c) ? (this.attribName = c, 
                    this.attribValue = "", this.state = S.ATTRIB_NAME) : strictFail(this, "Invalid attribute name");
                    continue;

                  case S.ATTRIB_NAME:
                    "=" === c ? this.state = S.ATTRIB_VALUE : is(whitespace, c) ? this.state = S.ATTRIB_NAME_SAW_WHITE : is(nameBody, c) ? this.attribName += c : strictFail(this, "Invalid attribute name");
                    continue;

                  case S.ATTRIB_NAME_SAW_WHITE:
                    if ("=" === c) this.state = S.ATTRIB_VALUE; else {
                        if (is(whitespace, c)) continue;
                        strictFail(this, "Attribute without value"), this.tag.attributes[this.attribName] = "", 
                        this.attribValue = "", emitNode(this, "onattribute", {
                            name: this.attribName,
                            value: ""
                        }), this.attribName = "", ">" === c ? openTag(this) : is(nameStart, c) ? (this.attribName = c, 
                        this.state = S.ATTRIB_NAME) : (strictFail(this, "Invalid attribute name"), this.state = S.ATTRIB);
                    }
                    continue;

                  case S.ATTRIB_VALUE:
                    if (is(whitespace, c)) continue;
                    is(quote, c) ? (this.q = c, this.state = S.ATTRIB_VALUE_QUOTED) : (strictFail(this, "Unquoted attribute value"), 
                    this.state = S.ATTRIB_VALUE_UNQUOTED, this.attribValue = c);
                    continue;

                  case S.ATTRIB_VALUE_QUOTED:
                    if (c !== this.q) {
                        "&" === c ? this.state = S.ATTRIB_VALUE_ENTITY_Q : this.attribValue += c;
                        continue;
                    }
                    attrib(this), this.q = "", this.state = S.ATTRIB;
                    continue;

                  case S.ATTRIB_VALUE_UNQUOTED:
                    if (not(attribEnd, c)) {
                        "&" === c ? this.state = S.ATTRIB_VALUE_ENTITY_U : this.attribValue += c;
                        continue;
                    }
                    attrib(this), ">" === c ? openTag(this) : this.state = S.ATTRIB;
                    continue;

                  case S.CLOSE_TAG:
                    if (this.tagName) ">" === c ? closeTag(this) : is(nameBody, c) ? this.tagName += c : (not(whitespace, c) && strictFail(this, "Invalid tagname in closing tag"), 
                    this.state = S.CLOSE_TAG_SAW_WHITE); else {
                        if (is(whitespace, c)) continue;
                        not(nameStart, c) ? strictFail(this, "Invalid tagname in closing tag.") : this.tagName = c;
                    }
                    continue;

                  case S.CLOSE_TAG_SAW_WHITE:
                    if (is(whitespace, c)) continue;
                    ">" === c ? closeTag(this) : strictFail("Invalid characters in closing tag");
                    continue;

                  case S.TEXT_ENTITY:
                  case S.ATTRIB_VALUE_ENTITY_Q:
                  case S.ATTRIB_VALUE_ENTITY_U:
                    switch (this.state) {
                      case S.TEXT_ENTITY:
                        var returnState = S.TEXT, buffer = "textNode";
                        break;

                      case S.ATTRIB_VALUE_ENTITY_Q:
                        returnState = S.ATTRIB_VALUE_QUOTED, buffer = "attribValue";
                        break;

                      case S.ATTRIB_VALUE_ENTITY_U:
                        returnState = S.ATTRIB_VALUE_UNQUOTED, buffer = "attribValue";
                    }
                    ";" === c ? (this[buffer] += parseEntity(this), this.entity = "", this.state = returnState) : is(entity, c) ? this.entity += c : (strictFail("Invalid character entity"), 
                    this[buffer] += "&" + this.entity + c, this.entity = "", this.state = returnState);
                    continue;

                  default:
                    throw new Error(this, "Unknown state: " + this.state);
                }
                return this.position >= this.bufferCheckPosition && (function(parser) {
                    for (var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10), maxActual = 0, i = 0, l = buffers.length; i < l; i++) {
                        var len = parser[buffers[i]].length;
                        if (len > maxAllowed) switch (buffers[i]) {
                          case "textNode":
                            closeText(parser);
                            break;

                          case "cdata":
                            emitNode(parser, "oncdata", parser.cdata), parser.cdata = "";
                            break;

                          case "script":
                            emitNode(parser, "onscript", parser.script), parser.script = "";
                            break;

                          default:
                            error(parser, "Max buffer length exceeded: " + buffers[i]);
                        }
                        maxActual = Math.max(maxActual, len);
                    }
                    parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH - maxActual + parser.position;
                })(this), this;
            },
            resume: function() {
                return this.error = null, this;
            },
            close: function() {
                return this.write(null);
            }
        };
        try {
            var Stream = __webpack_require__(3).Stream;
        } catch (ex) {
            Stream = function() {};
        }
        var streamWraps = sax.EVENTS.filter((function(ev) {
            return "error" !== ev && "end" !== ev;
        }));
        function SAXStream(strict, opt) {
            if (!(this instanceof SAXStream)) return new SAXStream(strict, opt);
            Stream.apply(this), this._parser = new SAXParser(strict, opt), this.writable = !0, 
            this.readable = !0;
            var me = this;
            this._parser.onend = function() {
                me.emit("end");
            }, this._parser.onerror = function(er) {
                me.emit("error", er), me._parser.error = null;
            }, streamWraps.forEach((function(ev) {
                Object.defineProperty(me, "on" + ev, {
                    get: function() {
                        return me._parser["on" + ev];
                    },
                    set: function(h) {
                        if (!h) return me.removeAllListeners(ev), me._parser["on" + ev] = h;
                        me.on(ev, h);
                    },
                    enumerable: !0,
                    configurable: !1
                });
            }));
        }
        SAXStream.prototype = Object.create(Stream.prototype, {
            constructor: {
                value: SAXStream
            }
        }), SAXStream.prototype.write = function(data) {
            return this._parser.write(data.toString()), this.emit("data", data), !0;
        }, SAXStream.prototype.end = function(chunk) {
            return chunk && chunk.length && this._parser.write(chunk.toString()), this._parser.end(), 
            !0;
        }, SAXStream.prototype.on = function(ev, handler) {
            var me = this;
            return me._parser["on" + ev] || -1 === streamWraps.indexOf(ev) || (me._parser["on" + ev] = function() {
                var args = 1 === arguments.length ? [ arguments[0] ] : Array.apply(null, arguments);
                args.splice(0, 0, ev), me.emit.apply(me, args);
            }), Stream.prototype.on.call(me, ev, handler);
        };
        var whitespace = "\r\n\t ", number = "0124356789", letter = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", nameStart = letter + "_:", nameBody = nameStart + number + "-.", quote = "'\"", entity = number + letter + "#", attribEnd = whitespace + ">", XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace", rootNS = {
            xml: XML_NAMESPACE,
            xmlns: "http://www.w3.org/2000/xmlns/"
        };
        function charClass(str) {
            return str.split("").reduce((function(s, c) {
                return s[c] = !0, s;
            }), {});
        }
        function is(charclass, c) {
            return charclass[c];
        }
        function not(charclass, c) {
            return !charclass[c];
        }
        whitespace = charClass(whitespace), number = charClass(number), letter = charClass(letter), 
        nameStart = charClass(nameStart), nameBody = charClass(nameBody), quote = charClass(quote), 
        entity = charClass(entity), attribEnd = charClass(attribEnd);
        var S = 0;
        for (var S in sax.STATE = {
            BEGIN: S++,
            TEXT: S++,
            TEXT_ENTITY: S++,
            OPEN_WAKA: S++,
            SGML_DECL: S++,
            SGML_DECL_QUOTED: S++,
            DOCTYPE: S++,
            DOCTYPE_QUOTED: S++,
            DOCTYPE_DTD: S++,
            DOCTYPE_DTD_QUOTED: S++,
            COMMENT_STARTING: S++,
            COMMENT: S++,
            COMMENT_ENDING: S++,
            COMMENT_ENDED: S++,
            CDATA: S++,
            CDATA_ENDING: S++,
            CDATA_ENDING_2: S++,
            PROC_INST: S++,
            PROC_INST_BODY: S++,
            PROC_INST_QUOTED: S++,
            PROC_INST_ENDING: S++,
            OPEN_TAG: S++,
            OPEN_TAG_SLASH: S++,
            ATTRIB: S++,
            ATTRIB_NAME: S++,
            ATTRIB_NAME_SAW_WHITE: S++,
            ATTRIB_VALUE: S++,
            ATTRIB_VALUE_QUOTED: S++,
            ATTRIB_VALUE_UNQUOTED: S++,
            ATTRIB_VALUE_ENTITY_Q: S++,
            ATTRIB_VALUE_ENTITY_U: S++,
            CLOSE_TAG: S++,
            CLOSE_TAG_SAW_WHITE: S++,
            SCRIPT: S++,
            SCRIPT_ENDING: S++
        }, sax.ENTITIES = {
            apos: "'",
            quot: '"',
            amp: "&",
            gt: ">",
            lt: "<"
        }, sax.STATE) sax.STATE[sax.STATE[S]] = S;
        function emit(parser, event, data) {
            parser[event] && parser[event](data);
        }
        function emitNode(parser, nodeType, data) {
            parser.textNode && closeText(parser), emit(parser, nodeType, data);
        }
        function closeText(parser) {
            parser.textNode = textopts(parser.opt, parser.textNode), parser.textNode && emit(parser, "ontext", parser.textNode), 
            parser.textNode = "";
        }
        function textopts(opt, text) {
            return opt.trim && (text = text.trim()), opt.normalize && (text = text.replace(/\s+/g, " ")), 
            text;
        }
        function error(parser, er) {
            return closeText(parser), parser.trackPosition && (er += "\nLine: " + parser.line + "\nColumn: " + parser.column + "\nChar: " + parser.c), 
            er = new Error(er), parser.error = er, emit(parser, "onerror", er), parser;
        }
        function end(parser) {
            return parser.state !== S.TEXT && error(parser, "Unexpected end"), closeText(parser), 
            parser.c = "", parser.closed = !0, emit(parser, "onend"), SAXParser.call(parser, parser.strict, parser.opt), 
            parser;
        }
        function strictFail(parser, message) {
            parser.strict && error(parser, message);
        }
        function newTag(parser) {
            parser.strict || (parser.tagName = parser.tagName[parser.looseCase]());
            var parent = parser.tags[parser.tags.length - 1] || parser, tag = parser.tag = {
                name: parser.tagName,
                attributes: {}
            };
            parser.opt.xmlns && (tag.ns = parent.ns), parser.attribList.length = 0;
        }
        function qname(name) {
            var qualName = name.indexOf(":") < 0 ? [ "", name ] : name.split(":"), prefix = qualName[0], local = qualName[1];
            return "xmlns" === name && (prefix = "xmlns", local = ""), {
                prefix: prefix,
                local: local
            };
        }
        function attrib(parser) {
            if (parser.strict || (parser.attribName = parser.attribName[parser.looseCase]()), 
            parser.opt.xmlns) {
                var qn = qname(parser.attribName), prefix = qn.prefix, local = qn.local;
                if ("xmlns" === prefix) if ("xml" === local && parser.attribValue !== XML_NAMESPACE) strictFail(parser, "xml: prefix must be bound to " + XML_NAMESPACE + "\nActual: " + parser.attribValue); else if ("xmlns" === local && "http://www.w3.org/2000/xmlns/" !== parser.attribValue) strictFail(parser, "xmlns: prefix must be bound to http://www.w3.org/2000/xmlns/\nActual: " + parser.attribValue); else {
                    var tag = parser.tag, parent = parser.tags[parser.tags.length - 1] || parser;
                    tag.ns === parent.ns && (tag.ns = Object.create(parent.ns)), tag.ns[local] = parser.attribValue;
                }
                parser.attribList.push([ parser.attribName, parser.attribValue ]);
            } else parser.tag.attributes[parser.attribName] = parser.attribValue, emitNode(parser, "onattribute", {
                name: parser.attribName,
                value: parser.attribValue
            });
            parser.attribName = parser.attribValue = "";
        }
        function openTag(parser, selfClosing) {
            if (parser.opt.xmlns) {
                var tag = parser.tag, qn = qname(parser.tagName);
                tag.prefix = qn.prefix, tag.local = qn.local, tag.uri = tag.ns[qn.prefix] || qn.prefix, 
                tag.prefix && !tag.uri && strictFail(parser, "Unbound namespace prefix: " + JSON.stringify(parser.tagName));
                var parent = parser.tags[parser.tags.length - 1] || parser;
                tag.ns && parent.ns !== tag.ns && Object.keys(tag.ns).forEach((function(p) {
                    emitNode(parser, "onopennamespace", {
                        prefix: p,
                        uri: tag.ns[p]
                    });
                }));
                for (var i = 0, l = parser.attribList.length; i < l; i++) {
                    var nv = parser.attribList[i], name = nv[0], value = nv[1], qualName = qname(name), prefix = qualName.prefix, local = qualName.local, uri = "" == prefix ? "" : tag.ns[prefix] || "", a = {
                        name: name,
                        value: value,
                        prefix: prefix,
                        local: local,
                        uri: uri
                    };
                    prefix && "xmlns" != prefix && !uri && (strictFail(parser, "Unbound namespace prefix: " + JSON.stringify(prefix)), 
                    a.uri = prefix), parser.tag.attributes[name] = a, emitNode(parser, "onattribute", a);
                }
                parser.attribList.length = 0;
            }
            parser.sawRoot = !0, parser.tags.push(parser.tag), emitNode(parser, "onopentag", parser.tag), 
            selfClosing || (parser.noscript || "script" !== parser.tagName.toLowerCase() ? parser.state = S.TEXT : parser.state = S.SCRIPT, 
            parser.tag = null, parser.tagName = ""), parser.attribName = parser.attribValue = "", 
            parser.attribList.length = 0;
        }
        function closeTag(parser) {
            if (!parser.tagName) return strictFail(parser, "Weird empty close tag."), parser.textNode += "</>", 
            void (parser.state = S.TEXT);
            var t = parser.tags.length, tagName = parser.tagName;
            parser.strict || (tagName = tagName[parser.looseCase]());
            for (var closeTo = tagName; t-- && parser.tags[t].name !== closeTo; ) strictFail(parser, "Unexpected close tag");
            if (t < 0) return strictFail(parser, "Unmatched closing tag: " + parser.tagName), 
            parser.textNode += "</" + parser.tagName + ">", void (parser.state = S.TEXT);
            parser.tagName = tagName;
            for (var s = parser.tags.length; s-- > t; ) {
                var tag = parser.tag = parser.tags.pop();
                parser.tagName = parser.tag.name, emitNode(parser, "onclosetag", parser.tagName);
                var x = {};
                for (var i in tag.ns) x[i] = tag.ns[i];
                var parent = parser.tags[parser.tags.length - 1] || parser;
                parser.opt.xmlns && tag.ns !== parent.ns && Object.keys(tag.ns).forEach((function(p) {
                    var n = tag.ns[p];
                    emitNode(parser, "onclosenamespace", {
                        prefix: p,
                        uri: n
                    });
                }));
            }
            0 === t && (parser.closedRoot = !0), parser.tagName = parser.attribValue = parser.attribName = "", 
            parser.attribList.length = 0, parser.state = S.TEXT;
        }
        function parseEntity(parser) {
            var num, entity = parser.entity.toLowerCase(), numStr = "";
            return parser.ENTITIES[entity] ? parser.ENTITIES[entity] : ("#" === entity.charAt(0) && ("x" === entity.charAt(1) ? (entity = entity.slice(2), 
            numStr = (num = parseInt(entity, 16)).toString(16)) : (entity = entity.slice(1), 
            numStr = (num = parseInt(entity, 10)).toString(10))), entity = entity.replace(/^0+/, ""), 
            numStr.toLowerCase() !== entity ? (strictFail(parser, "Invalid character entity"), 
            "&" + parser.entity + ";") : String.fromCharCode(num));
        }
        S = sax.STATE;
    })(exports);
}
