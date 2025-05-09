function(module, exports, __webpack_require__) {
    !(function(sax) {
        sax.parser = function(strict, opt) {
            return new SAXParser(strict, opt);
        }, sax.SAXParser = SAXParser, sax.SAXStream = SAXStream, sax.createStream = function(strict, opt) {
            return new SAXStream(strict, opt);
        }, sax.MAX_BUFFER_LENGTH = 65536;
        var Stream, buffers = [ "comment", "sgmlDecl", "textNode", "tagName", "doctype", "procInstName", "procInstBody", "entity", "attribName", "attribValue", "cdata", "script" ];
        function SAXParser(strict, opt) {
            if (!(this instanceof SAXParser)) return new SAXParser(strict, opt);
            !(function(parser) {
                for (var i = 0, l = buffers.length; i < l; i++) parser[buffers[i]] = "";
            })(this), this.q = this.c = "", this.bufferCheckPosition = sax.MAX_BUFFER_LENGTH, 
            this.opt = opt || {}, this.opt.lowercase = this.opt.lowercase || this.opt.lowercasetags, 
            this.looseCase = this.opt.lowercase ? "toLowerCase" : "toUpperCase", this.tags = [], 
            this.closed = this.closedRoot = this.sawRoot = !1, this.tag = this.error = null, 
            this.strict = !!strict, this.noscript = !(!strict && !this.opt.noscript), this.state = S.BEGIN, 
            this.strictEntities = this.opt.strictEntities, this.ENTITIES = this.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES), 
            this.attribList = [], this.opt.xmlns && (this.ns = Object.create(rootNS)), this.trackPosition = !1 !== this.opt.position, 
            this.trackPosition && (this.position = this.line = this.column = 0), emit(this, "onready");
        }
        sax.EVENTS = [ "text", "processinginstruction", "sgmldeclaration", "doctype", "comment", "opentagstart", "attribute", "opentag", "closetag", "opencdata", "cdata", "closecdata", "error", "end", "ready", "script", "opennamespace", "closenamespace" ], 
        Object.create || (Object.create = function(o) {
            function F() {}
            return F.prototype = o, new F;
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
                "object" == typeof chunk && (chunk = chunk.toString());
                for (var parser, num, entity, entityLC, numStr, i = 0, c = ""; c = charAt(chunk, i++), 
                this.c = c, c; ) switch (this.trackPosition && (this.position++, "\n" === c ? (this.line++, 
                this.column = 0) : this.column++), this.state) {
                  case S.BEGIN:
                    if (this.state = S.BEGIN_WHITESPACE, "\ufeff" === c) continue;
                    beginWhiteSpace(this, c);
                    continue;

                  case S.BEGIN_WHITESPACE:
                    beginWhiteSpace(this, c);
                    continue;

                  case S.TEXT:
                    if (this.sawRoot && !this.closedRoot) {
                        for (var starti = i - 1; c && "<" !== c && "&" !== c; ) (c = charAt(chunk, i++)) && this.trackPosition && (this.position++, 
                        "\n" === c ? (this.line++, this.column = 0) : this.column++);
                        this.textNode += chunk.substring(starti, i - 1);
                    }
                    "<" !== c || this.sawRoot && this.closedRoot && !this.strict ? (isWhitespace(c) || this.sawRoot && !this.closedRoot || strictFail(this, "Text data outside of root node."), 
                    "&" === c ? this.state = S.TEXT_ENTITY : this.textNode += c) : (this.state = S.OPEN_WAKA, 
                    this.startTagPosition = this.position);
                    continue;

                  case S.SCRIPT:
                    "<" === c ? this.state = S.SCRIPT_ENDING : this.script += c;
                    continue;

                  case S.SCRIPT_ENDING:
                    "/" === c ? this.state = S.CLOSE_TAG : (this.script += "<" + c, this.state = S.SCRIPT);
                    continue;

                  case S.OPEN_WAKA:
                    if ("!" === c) this.state = S.SGML_DECL, this.sgmlDecl = ""; else if (isWhitespace(c)) ; else if (isMatch(nameStart, c)) this.state = S.OPEN_TAG, 
                    this.tagName = c; else if ("/" === c) this.state = S.CLOSE_TAG, this.tagName = ""; else if ("?" === c) this.state = S.PROC_INST, 
                    this.procInstName = this.procInstBody = ""; else {
                        if (strictFail(this, "Unencoded <"), this.startTagPosition + 1 < this.position) {
                            var pad = this.position - this.startTagPosition;
                            c = new Array(pad).join(" ") + c;
                        }
                        this.textNode += "<" + c, this.state = S.TEXT;
                    }
                    continue;

                  case S.SGML_DECL:
                    "[CDATA[" === (this.sgmlDecl + c).toUpperCase() ? (emitNode(this, "onopencdata"), 
                    this.state = S.CDATA, this.sgmlDecl = "", this.cdata = "") : this.sgmlDecl + c === "--" ? (this.state = S.COMMENT, 
                    this.comment = "", this.sgmlDecl = "") : "DOCTYPE" === (this.sgmlDecl + c).toUpperCase() ? (this.state = S.DOCTYPE, 
                    (this.doctype || this.sawRoot) && strictFail(this, "Inappropriately located doctype declaration"), 
                    this.doctype = "", this.sgmlDecl = "") : ">" === c ? (emitNode(this, "onsgmldeclaration", this.sgmlDecl), 
                    this.sgmlDecl = "", this.state = S.TEXT) : isQuote(c) ? (this.state = S.SGML_DECL_QUOTED, 
                    this.sgmlDecl += c) : this.sgmlDecl += c;
                    continue;

                  case S.SGML_DECL_QUOTED:
                    c === this.q && (this.state = S.SGML_DECL, this.q = ""), this.sgmlDecl += c;
                    continue;

                  case S.DOCTYPE:
                    ">" === c ? (this.state = S.TEXT, emitNode(this, "ondoctype", this.doctype), this.doctype = !0) : (this.doctype += c, 
                    "[" === c ? this.state = S.DOCTYPE_DTD : isQuote(c) && (this.state = S.DOCTYPE_QUOTED, 
                    this.q = c));
                    continue;

                  case S.DOCTYPE_QUOTED:
                    this.doctype += c, c === this.q && (this.q = "", this.state = S.DOCTYPE);
                    continue;

                  case S.DOCTYPE_DTD:
                    this.doctype += c, "]" === c ? this.state = S.DOCTYPE : isQuote(c) && (this.state = S.DOCTYPE_DTD_QUOTED, 
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
                    "?" === c ? this.state = S.PROC_INST_ENDING : isWhitespace(c) ? this.state = S.PROC_INST_BODY : this.procInstName += c;
                    continue;

                  case S.PROC_INST_BODY:
                    if (!this.procInstBody && isWhitespace(c)) continue;
                    "?" === c ? this.state = S.PROC_INST_ENDING : this.procInstBody += c;
                    continue;

                  case S.PROC_INST_ENDING:
                    ">" === c ? (emitNode(this, "onprocessinginstruction", {
                        name: this.procInstName,
                        body: this.procInstBody
                    }), this.procInstName = this.procInstBody = "", this.state = S.TEXT) : (this.procInstBody += "?" + c, 
                    this.state = S.PROC_INST_BODY);
                    continue;

                  case S.OPEN_TAG:
                    isMatch(nameBody, c) ? this.tagName += c : (newTag(this), ">" === c ? openTag(this) : "/" === c ? this.state = S.OPEN_TAG_SLASH : (isWhitespace(c) || strictFail(this, "Invalid character in tag name"), 
                    this.state = S.ATTRIB));
                    continue;

                  case S.OPEN_TAG_SLASH:
                    ">" === c ? (openTag(this, !0), closeTag(this)) : (strictFail(this, "Forward-slash in opening tag not followed by >"), 
                    this.state = S.ATTRIB);
                    continue;

                  case S.ATTRIB:
                    if (isWhitespace(c)) continue;
                    ">" === c ? openTag(this) : "/" === c ? this.state = S.OPEN_TAG_SLASH : isMatch(nameStart, c) ? (this.attribName = c, 
                    this.attribValue = "", this.state = S.ATTRIB_NAME) : strictFail(this, "Invalid attribute name");
                    continue;

                  case S.ATTRIB_NAME:
                    "=" === c ? this.state = S.ATTRIB_VALUE : ">" === c ? (strictFail(this, "Attribute without value"), 
                    this.attribValue = this.attribName, attrib(this), openTag(this)) : isWhitespace(c) ? this.state = S.ATTRIB_NAME_SAW_WHITE : isMatch(nameBody, c) ? this.attribName += c : strictFail(this, "Invalid attribute name");
                    continue;

                  case S.ATTRIB_NAME_SAW_WHITE:
                    if ("=" === c) this.state = S.ATTRIB_VALUE; else {
                        if (isWhitespace(c)) continue;
                        strictFail(this, "Attribute without value"), this.tag.attributes[this.attribName] = "", 
                        this.attribValue = "", emitNode(this, "onattribute", {
                            name: this.attribName,
                            value: ""
                        }), this.attribName = "", ">" === c ? openTag(this) : isMatch(nameStart, c) ? (this.attribName = c, 
                        this.state = S.ATTRIB_NAME) : (strictFail(this, "Invalid attribute name"), this.state = S.ATTRIB);
                    }
                    continue;

                  case S.ATTRIB_VALUE:
                    if (isWhitespace(c)) continue;
                    isQuote(c) ? (this.q = c, this.state = S.ATTRIB_VALUE_QUOTED) : (strictFail(this, "Unquoted attribute value"), 
                    this.state = S.ATTRIB_VALUE_UNQUOTED, this.attribValue = c);
                    continue;

                  case S.ATTRIB_VALUE_QUOTED:
                    if (c !== this.q) {
                        "&" === c ? this.state = S.ATTRIB_VALUE_ENTITY_Q : this.attribValue += c;
                        continue;
                    }
                    attrib(this), this.q = "", this.state = S.ATTRIB_VALUE_CLOSED;
                    continue;

                  case S.ATTRIB_VALUE_CLOSED:
                    isWhitespace(c) ? this.state = S.ATTRIB : ">" === c ? openTag(this) : "/" === c ? this.state = S.OPEN_TAG_SLASH : isMatch(nameStart, c) ? (strictFail(this, "No whitespace between attributes"), 
                    this.attribName = c, this.attribValue = "", this.state = S.ATTRIB_NAME) : strictFail(this, "Invalid attribute name");
                    continue;

                  case S.ATTRIB_VALUE_UNQUOTED:
                    if (!isAttribEnd(c)) {
                        "&" === c ? this.state = S.ATTRIB_VALUE_ENTITY_U : this.attribValue += c;
                        continue;
                    }
                    attrib(this), ">" === c ? openTag(this) : this.state = S.ATTRIB;
                    continue;

                  case S.CLOSE_TAG:
                    if (this.tagName) ">" === c ? closeTag(this) : isMatch(nameBody, c) ? this.tagName += c : this.script ? (this.script += "</" + this.tagName, 
                    this.tagName = "", this.state = S.SCRIPT) : (isWhitespace(c) || strictFail(this, "Invalid tagname in closing tag"), 
                    this.state = S.CLOSE_TAG_SAW_WHITE); else {
                        if (isWhitespace(c)) continue;
                        notMatch(nameStart, c) ? this.script ? (this.script += "</" + c, this.state = S.SCRIPT) : strictFail(this, "Invalid tagname in closing tag.") : this.tagName = c;
                    }
                    continue;

                  case S.CLOSE_TAG_SAW_WHITE:
                    if (isWhitespace(c)) continue;
                    ">" === c ? closeTag(this) : strictFail(this, "Invalid characters in closing tag");
                    continue;

                  case S.TEXT_ENTITY:
                  case S.ATTRIB_VALUE_ENTITY_Q:
                  case S.ATTRIB_VALUE_ENTITY_U:
                    var returnState, buffer;
                    switch (this.state) {
                      case S.TEXT_ENTITY:
                        returnState = S.TEXT, buffer = "textNode";
                        break;

                      case S.ATTRIB_VALUE_ENTITY_Q:
                        returnState = S.ATTRIB_VALUE_QUOTED, buffer = "attribValue";
                        break;

                      case S.ATTRIB_VALUE_ENTITY_U:
                        returnState = S.ATTRIB_VALUE_UNQUOTED, buffer = "attribValue";
                    }
                    ";" === c ? (this[buffer] += (num = void 0, entity = void 0, entityLC = void 0, 
                    numStr = void 0, entity = (parser = this).entity, entityLC = entity.toLowerCase(), 
                    numStr = "", parser.ENTITIES[entity] ? parser.ENTITIES[entity] : parser.ENTITIES[entityLC] ? parser.ENTITIES[entityLC] : ("#" === (entity = entityLC).charAt(0) && ("x" === entity.charAt(1) ? (entity = entity.slice(2), 
                    numStr = (num = parseInt(entity, 16)).toString(16)) : (entity = entity.slice(1), 
                    numStr = (num = parseInt(entity, 10)).toString(10))), entity = entity.replace(/^0+/, ""), 
                    isNaN(num) || numStr.toLowerCase() !== entity ? (strictFail(parser, "Invalid character entity"), 
                    "&" + parser.entity + ";") : String.fromCodePoint(num))), this.entity = "", this.state = returnState) : isMatch(this.entity.length ? entityBody : entityStart, c) ? this.entity += c : (strictFail(this, "Invalid character in entity name"), 
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
                    var m = sax.MAX_BUFFER_LENGTH - maxActual;
                    parser.bufferCheckPosition = m + parser.position;
                })(this), this;
            },
            resume: function() {
                return this.error = null, this;
            },
            close: function() {
                return this.write(null);
            },
            flush: function() {
                closeText(this), "" !== this.cdata && (emitNode(this, "oncdata", this.cdata), this.cdata = ""), 
                "" !== this.script && (emitNode(this, "onscript", this.script), this.script = "");
            }
        };
        try {
            Stream = __webpack_require__(3).Stream;
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
            }, this._decoder = null, streamWraps.forEach((function(ev) {
                Object.defineProperty(me, "on" + ev, {
                    get: function() {
                        return me._parser["on" + ev];
                    },
                    set: function(h) {
                        if (!h) return me.removeAllListeners(ev), me._parser["on" + ev] = h, h;
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
            if ("function" == typeof Buffer && "function" == typeof Buffer.isBuffer && Buffer.isBuffer(data)) {
                if (!this._decoder) {
                    var SD = __webpack_require__(156).StringDecoder;
                    this._decoder = new SD("utf8");
                }
                data = this._decoder.write(data);
            }
            return this._parser.write(data.toString()), this.emit("data", data), !0;
        }, SAXStream.prototype.end = function(chunk) {
            return chunk && chunk.length && this.write(chunk), this._parser.end(), !0;
        }, SAXStream.prototype.on = function(ev, handler) {
            var me = this;
            return me._parser["on" + ev] || -1 === streamWraps.indexOf(ev) || (me._parser["on" + ev] = function() {
                var args = 1 === arguments.length ? [ arguments[0] ] : Array.apply(null, arguments);
                args.splice(0, 0, ev), me.emit.apply(me, args);
            }), Stream.prototype.on.call(me, ev, handler);
        };
        var XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace", rootNS = {
            xml: XML_NAMESPACE,
            xmlns: "http://www.w3.org/2000/xmlns/"
        }, nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
        function isWhitespace(c) {
            return " " === c || "\n" === c || "\r" === c || "\t" === c;
        }
        function isQuote(c) {
            return '"' === c || "'" === c;
        }
        function isAttribEnd(c) {
            return ">" === c || isWhitespace(c);
        }
        function isMatch(regex, c) {
            return regex.test(c);
        }
        function notMatch(regex, c) {
            return !isMatch(regex, c);
        }
        var stringFromCharCode, floor, fromCodePoint, S = 0;
        for (var s in sax.STATE = {
            BEGIN: S++,
            BEGIN_WHITESPACE: S++,
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
            PROC_INST_ENDING: S++,
            OPEN_TAG: S++,
            OPEN_TAG_SLASH: S++,
            ATTRIB: S++,
            ATTRIB_NAME: S++,
            ATTRIB_NAME_SAW_WHITE: S++,
            ATTRIB_VALUE: S++,
            ATTRIB_VALUE_QUOTED: S++,
            ATTRIB_VALUE_CLOSED: S++,
            ATTRIB_VALUE_UNQUOTED: S++,
            ATTRIB_VALUE_ENTITY_Q: S++,
            ATTRIB_VALUE_ENTITY_U: S++,
            CLOSE_TAG: S++,
            CLOSE_TAG_SAW_WHITE: S++,
            SCRIPT: S++,
            SCRIPT_ENDING: S++
        }, sax.XML_ENTITIES = {
            amp: "&",
            gt: ">",
            lt: "<",
            quot: '"',
            apos: "'"
        }, sax.ENTITIES = {
            amp: "&",
            gt: ">",
            lt: "<",
            quot: '"',
            apos: "'",
            AElig: 198,
            Aacute: 193,
            Acirc: 194,
            Agrave: 192,
            Aring: 197,
            Atilde: 195,
            Auml: 196,
            Ccedil: 199,
            ETH: 208,
            Eacute: 201,
            Ecirc: 202,
            Egrave: 200,
            Euml: 203,
            Iacute: 205,
            Icirc: 206,
            Igrave: 204,
            Iuml: 207,
            Ntilde: 209,
            Oacute: 211,
            Ocirc: 212,
            Ograve: 210,
            Oslash: 216,
            Otilde: 213,
            Ouml: 214,
            THORN: 222,
            Uacute: 218,
            Ucirc: 219,
            Ugrave: 217,
            Uuml: 220,
            Yacute: 221,
            aacute: 225,
            acirc: 226,
            aelig: 230,
            agrave: 224,
            aring: 229,
            atilde: 227,
            auml: 228,
            ccedil: 231,
            eacute: 233,
            ecirc: 234,
            egrave: 232,
            eth: 240,
            euml: 235,
            iacute: 237,
            icirc: 238,
            igrave: 236,
            iuml: 239,
            ntilde: 241,
            oacute: 243,
            ocirc: 244,
            ograve: 242,
            oslash: 248,
            otilde: 245,
            ouml: 246,
            szlig: 223,
            thorn: 254,
            uacute: 250,
            ucirc: 251,
            ugrave: 249,
            uuml: 252,
            yacute: 253,
            yuml: 255,
            copy: 169,
            reg: 174,
            nbsp: 160,
            iexcl: 161,
            cent: 162,
            pound: 163,
            curren: 164,
            yen: 165,
            brvbar: 166,
            sect: 167,
            uml: 168,
            ordf: 170,
            laquo: 171,
            not: 172,
            shy: 173,
            macr: 175,
            deg: 176,
            plusmn: 177,
            sup1: 185,
            sup2: 178,
            sup3: 179,
            acute: 180,
            micro: 181,
            para: 182,
            middot: 183,
            cedil: 184,
            ordm: 186,
            raquo: 187,
            frac14: 188,
            frac12: 189,
            frac34: 190,
            iquest: 191,
            times: 215,
            divide: 247,
            OElig: 338,
            oelig: 339,
            Scaron: 352,
            scaron: 353,
            Yuml: 376,
            fnof: 402,
            circ: 710,
            tilde: 732,
            Alpha: 913,
            Beta: 914,
            Gamma: 915,
            Delta: 916,
            Epsilon: 917,
            Zeta: 918,
            Eta: 919,
            Theta: 920,
            Iota: 921,
            Kappa: 922,
            Lambda: 923,
            Mu: 924,
            Nu: 925,
            Xi: 926,
            Omicron: 927,
            Pi: 928,
            Rho: 929,
            Sigma: 931,
            Tau: 932,
            Upsilon: 933,
            Phi: 934,
            Chi: 935,
            Psi: 936,
            Omega: 937,
            alpha: 945,
            beta: 946,
            gamma: 947,
            delta: 948,
            epsilon: 949,
            zeta: 950,
            eta: 951,
            theta: 952,
            iota: 953,
            kappa: 954,
            lambda: 955,
            mu: 956,
            nu: 957,
            xi: 958,
            omicron: 959,
            pi: 960,
            rho: 961,
            sigmaf: 962,
            sigma: 963,
            tau: 964,
            upsilon: 965,
            phi: 966,
            chi: 967,
            psi: 968,
            omega: 969,
            thetasym: 977,
            upsih: 978,
            piv: 982,
            ensp: 8194,
            emsp: 8195,
            thinsp: 8201,
            zwnj: 8204,
            zwj: 8205,
            lrm: 8206,
            rlm: 8207,
            ndash: 8211,
            mdash: 8212,
            lsquo: 8216,
            rsquo: 8217,
            sbquo: 8218,
            ldquo: 8220,
            rdquo: 8221,
            bdquo: 8222,
            dagger: 8224,
            Dagger: 8225,
            bull: 8226,
            hellip: 8230,
            permil: 8240,
            prime: 8242,
            Prime: 8243,
            lsaquo: 8249,
            rsaquo: 8250,
            oline: 8254,
            frasl: 8260,
            euro: 8364,
            image: 8465,
            weierp: 8472,
            real: 8476,
            trade: 8482,
            alefsym: 8501,
            larr: 8592,
            uarr: 8593,
            rarr: 8594,
            darr: 8595,
            harr: 8596,
            crarr: 8629,
            lArr: 8656,
            uArr: 8657,
            rArr: 8658,
            dArr: 8659,
            hArr: 8660,
            forall: 8704,
            part: 8706,
            exist: 8707,
            empty: 8709,
            nabla: 8711,
            isin: 8712,
            notin: 8713,
            ni: 8715,
            prod: 8719,
            sum: 8721,
            minus: 8722,
            lowast: 8727,
            radic: 8730,
            prop: 8733,
            infin: 8734,
            ang: 8736,
            and: 8743,
            or: 8744,
            cap: 8745,
            cup: 8746,
            int: 8747,
            there4: 8756,
            sim: 8764,
            cong: 8773,
            asymp: 8776,
            ne: 8800,
            equiv: 8801,
            le: 8804,
            ge: 8805,
            sub: 8834,
            sup: 8835,
            nsub: 8836,
            sube: 8838,
            supe: 8839,
            oplus: 8853,
            otimes: 8855,
            perp: 8869,
            sdot: 8901,
            lceil: 8968,
            rceil: 8969,
            lfloor: 8970,
            rfloor: 8971,
            lang: 9001,
            rang: 9002,
            loz: 9674,
            spades: 9824,
            clubs: 9827,
            hearts: 9829,
            diams: 9830
        }, Object.keys(sax.ENTITIES).forEach((function(key) {
            var e = sax.ENTITIES[key], s = "number" == typeof e ? String.fromCharCode(e) : e;
            sax.ENTITIES[key] = s;
        })), sax.STATE) sax.STATE[sax.STATE[s]] = s;
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
            return parser.sawRoot && !parser.closedRoot && strictFail(parser, "Unclosed root tag"), 
            parser.state !== S.BEGIN && parser.state !== S.BEGIN_WHITESPACE && parser.state !== S.TEXT && error(parser, "Unexpected end"), 
            closeText(parser), parser.c = "", parser.closed = !0, emit(parser, "onend"), SAXParser.call(parser, parser.strict, parser.opt), 
            parser;
        }
        function strictFail(parser, message) {
            if ("object" != typeof parser || !(parser instanceof SAXParser)) throw new Error("bad call to strictFail");
            parser.strict && error(parser, message);
        }
        function newTag(parser) {
            parser.strict || (parser.tagName = parser.tagName[parser.looseCase]());
            var parent = parser.tags[parser.tags.length - 1] || parser, tag = parser.tag = {
                name: parser.tagName,
                attributes: {}
            };
            parser.opt.xmlns && (tag.ns = parent.ns), parser.attribList.length = 0, emitNode(parser, "onopentagstart", tag);
        }
        function qname(name, attribute) {
            var qualName = name.indexOf(":") < 0 ? [ "", name ] : name.split(":"), prefix = qualName[0], local = qualName[1];
            return attribute && "xmlns" === name && (prefix = "xmlns", local = ""), {
                prefix: prefix,
                local: local
            };
        }
        function attrib(parser) {
            if (parser.strict || (parser.attribName = parser.attribName[parser.looseCase]()), 
            -1 !== parser.attribList.indexOf(parser.attribName) || parser.tag.attributes.hasOwnProperty(parser.attribName)) parser.attribName = parser.attribValue = ""; else {
                if (parser.opt.xmlns) {
                    var qn = qname(parser.attribName, !0), prefix = qn.prefix, local = qn.local;
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
        }
        function openTag(parser, selfClosing) {
            if (parser.opt.xmlns) {
                var tag = parser.tag, qn = qname(parser.tagName);
                tag.prefix = qn.prefix, tag.local = qn.local, tag.uri = tag.ns[qn.prefix] || "", 
                tag.prefix && !tag.uri && (strictFail(parser, "Unbound namespace prefix: " + JSON.stringify(parser.tagName)), 
                tag.uri = qn.prefix);
                var parent = parser.tags[parser.tags.length - 1] || parser;
                tag.ns && parent.ns !== tag.ns && Object.keys(tag.ns).forEach((function(p) {
                    emitNode(parser, "onopennamespace", {
                        prefix: p,
                        uri: tag.ns[p]
                    });
                }));
                for (var i = 0, l = parser.attribList.length; i < l; i++) {
                    var nv = parser.attribList[i], name = nv[0], value = nv[1], qualName = qname(name, !0), prefix = qualName.prefix, local = qualName.local, uri = "" === prefix ? "" : tag.ns[prefix] || "", a = {
                        name: name,
                        value: value,
                        prefix: prefix,
                        local: local,
                        uri: uri
                    };
                    prefix && "xmlns" !== prefix && !uri && (strictFail(parser, "Unbound namespace prefix: " + JSON.stringify(prefix)), 
                    a.uri = prefix), parser.tag.attributes[name] = a, emitNode(parser, "onattribute", a);
                }
                parser.attribList.length = 0;
            }
            parser.tag.isSelfClosing = !!selfClosing, parser.sawRoot = !0, parser.tags.push(parser.tag), 
            emitNode(parser, "onopentag", parser.tag), selfClosing || (parser.noscript || "script" !== parser.tagName.toLowerCase() ? parser.state = S.TEXT : parser.state = S.SCRIPT, 
            parser.tag = null, parser.tagName = ""), parser.attribName = parser.attribValue = "", 
            parser.attribList.length = 0;
        }
        function closeTag(parser) {
            if (!parser.tagName) return strictFail(parser, "Weird empty close tag."), parser.textNode += "</>", 
            void (parser.state = S.TEXT);
            if (parser.script) {
                if ("script" !== parser.tagName) return parser.script += "</" + parser.tagName + ">", 
                parser.tagName = "", void (parser.state = S.SCRIPT);
                emitNode(parser, "onscript", parser.script), parser.script = "";
            }
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
        function beginWhiteSpace(parser, c) {
            "<" === c ? (parser.state = S.OPEN_WAKA, parser.startTagPosition = parser.position) : isWhitespace(c) || (strictFail(parser, "Non-whitespace before first tag."), 
            parser.textNode = c, parser.state = S.TEXT);
        }
        function charAt(chunk, i) {
            var result = "";
            return i < chunk.length && (result = chunk.charAt(i)), result;
        }
        S = sax.STATE, String.fromCodePoint || (stringFromCharCode = String.fromCharCode, 
        floor = Math.floor, fromCodePoint = function() {
            var highSurrogate, lowSurrogate, MAX_SIZE = 16384, codeUnits = [], index = -1, length = arguments.length;
            if (!length) return "";
            for (var result = ""; ++index < length; ) {
                var codePoint = Number(arguments[index]);
                if (!isFinite(codePoint) || codePoint < 0 || codePoint > 1114111 || floor(codePoint) !== codePoint) throw RangeError("Invalid code point: " + codePoint);
                codePoint <= 65535 ? codeUnits.push(codePoint) : (highSurrogate = 55296 + ((codePoint -= 65536) >> 10), 
                lowSurrogate = codePoint % 1024 + 56320, codeUnits.push(highSurrogate, lowSurrogate)), 
                (index + 1 === length || codeUnits.length > MAX_SIZE) && (result += stringFromCharCode.apply(null, codeUnits), 
                codeUnits.length = 0);
            }
            return result;
        }, Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
            value: fromCodePoint,
            configurable: !0,
            writable: !0
        }) : String.fromCodePoint = fromCodePoint);
    })(exports);
}
