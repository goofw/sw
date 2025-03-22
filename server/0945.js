function(module, exports, __webpack_require__) {
    (function(module) {
        var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
        !(function(global) {
            "use strict";
            function init(ByteBuffer) {
                var ProtoBuf = {
                    VERSION: "3.8.2",
                    WIRE_TYPES: {}
                };
                return ProtoBuf.WIRE_TYPES.VARINT = 0, ProtoBuf.WIRE_TYPES.BITS64 = 1, ProtoBuf.WIRE_TYPES.LDELIM = 2, 
                ProtoBuf.WIRE_TYPES.STARTGROUP = 3, ProtoBuf.WIRE_TYPES.ENDGROUP = 4, ProtoBuf.WIRE_TYPES.BITS32 = 5, 
                ProtoBuf.PACKABLE_WIRE_TYPES = [ ProtoBuf.WIRE_TYPES.VARINT, ProtoBuf.WIRE_TYPES.BITS64, ProtoBuf.WIRE_TYPES.BITS32 ], 
                ProtoBuf.TYPES = {
                    int32: {
                        name: "int32",
                        wireType: ProtoBuf.WIRE_TYPES.VARINT
                    },
                    uint32: {
                        name: "uint32",
                        wireType: ProtoBuf.WIRE_TYPES.VARINT
                    },
                    sint32: {
                        name: "sint32",
                        wireType: ProtoBuf.WIRE_TYPES.VARINT
                    },
                    int64: {
                        name: "int64",
                        wireType: ProtoBuf.WIRE_TYPES.VARINT
                    },
                    uint64: {
                        name: "uint64",
                        wireType: ProtoBuf.WIRE_TYPES.VARINT
                    },
                    sint64: {
                        name: "sint64",
                        wireType: ProtoBuf.WIRE_TYPES.VARINT
                    },
                    bool: {
                        name: "bool",
                        wireType: ProtoBuf.WIRE_TYPES.VARINT
                    },
                    double: {
                        name: "double",
                        wireType: ProtoBuf.WIRE_TYPES.BITS64
                    },
                    string: {
                        name: "string",
                        wireType: ProtoBuf.WIRE_TYPES.LDELIM
                    },
                    bytes: {
                        name: "bytes",
                        wireType: ProtoBuf.WIRE_TYPES.LDELIM
                    },
                    fixed32: {
                        name: "fixed32",
                        wireType: ProtoBuf.WIRE_TYPES.BITS32
                    },
                    sfixed32: {
                        name: "sfixed32",
                        wireType: ProtoBuf.WIRE_TYPES.BITS32
                    },
                    fixed64: {
                        name: "fixed64",
                        wireType: ProtoBuf.WIRE_TYPES.BITS64
                    },
                    sfixed64: {
                        name: "sfixed64",
                        wireType: ProtoBuf.WIRE_TYPES.BITS64
                    },
                    float: {
                        name: "float",
                        wireType: ProtoBuf.WIRE_TYPES.BITS32
                    },
                    enum: {
                        name: "enum",
                        wireType: ProtoBuf.WIRE_TYPES.VARINT
                    },
                    message: {
                        name: "message",
                        wireType: ProtoBuf.WIRE_TYPES.LDELIM
                    },
                    group: {
                        name: "group",
                        wireType: ProtoBuf.WIRE_TYPES.STARTGROUP
                    }
                }, ProtoBuf.ID_MIN = 1, ProtoBuf.ID_MAX = 536870911, ProtoBuf.ByteBuffer = ByteBuffer, 
                ProtoBuf.Long = ByteBuffer.Long || null, ProtoBuf.convertFieldsToCamelCase = !1, 
                ProtoBuf.populateAccessors = !0, ProtoBuf.Util = (function() {
                    Object.create || (Object.create = function(o) {
                        if (arguments.length > 1) throw Error("Object.create polyfill only accepts the first parameter.");
                        function F() {}
                        return F.prototype = o, new F;
                    });
                    var Util = {
                        IS_NODE: !1
                    };
                    try {
                        Util.IS_NODE = "function" == typeof __webpack_require__(2).readFileSync && "function" == typeof __webpack_require__(4).resolve;
                    } catch (e) {}
                    return Util.XHR = function() {
                        for (var XMLHttpFactories = [ function() {
                            return new XMLHttpRequest;
                        }, function() {
                            return new ActiveXObject("Msxml2.XMLHTTP");
                        }, function() {
                            return new ActiveXObject("Msxml3.XMLHTTP");
                        }, function() {
                            return new ActiveXObject("Microsoft.XMLHTTP");
                        } ], xhr = null, i = 0; i < XMLHttpFactories.length; i++) {
                            try {
                                xhr = XMLHttpFactories[i]();
                            } catch (e) {
                                continue;
                            }
                            break;
                        }
                        if (!xhr) throw Error("XMLHttpRequest is not supported");
                        return xhr;
                    }, Util.fetch = function(path, callback) {
                        if (callback && "function" != typeof callback && (callback = null), Util.IS_NODE) if (callback) __webpack_require__(2).readFile(path, (function(err, data) {
                            callback(err ? null : "" + data);
                        })); else try {
                            return __webpack_require__(2).readFileSync(path);
                        } catch (e) {
                            return null;
                        } else {
                            var xhr = Util.XHR();
                            if (xhr.open("GET", path, !!callback), xhr.setRequestHeader("Accept", "text/plain"), 
                            "function" == typeof xhr.overrideMimeType && xhr.overrideMimeType("text/plain"), 
                            !callback) return xhr.send(null), 200 == xhr.status || 0 == xhr.status && "string" == typeof xhr.responseText ? xhr.responseText : null;
                            if (xhr.onreadystatechange = function() {
                                4 == xhr.readyState && (200 == xhr.status || 0 == xhr.status && "string" == typeof xhr.responseText ? callback(xhr.responseText) : callback(null));
                            }, 4 == xhr.readyState) return;
                            xhr.send(null);
                        }
                    }, Util.isArray = Array.isArray || function(obj) {
                        return "[object Array]" === Object.prototype.toString.call(obj);
                    }, Util;
                })(), ProtoBuf.Lang = {
                    OPEN: "{",
                    CLOSE: "}",
                    OPTOPEN: "[",
                    OPTCLOSE: "]",
                    OPTEND: ",",
                    EQUAL: "=",
                    END: ";",
                    STRINGOPEN: '"',
                    STRINGCLOSE: '"',
                    STRINGOPEN_SQ: "'",
                    STRINGCLOSE_SQ: "'",
                    COPTOPEN: "(",
                    COPTCLOSE: ")",
                    DELIM: /[\s\{\}=;\[\],'"\(\)]/g,
                    RULE: /^(?:required|optional|repeated)$/,
                    TYPE: /^(?:double|float|int32|uint32|sint32|int64|uint64|sint64|fixed32|sfixed32|fixed64|sfixed64|bool|string|bytes)$/,
                    NAME: /^[a-zA-Z_][a-zA-Z_0-9]*$/,
                    TYPEDEF: /^[a-zA-Z][a-zA-Z_0-9]*$/,
                    TYPEREF: /^(?:\.?[a-zA-Z_][a-zA-Z_0-9]*)+$/,
                    FQTYPEREF: /^(?:\.[a-zA-Z][a-zA-Z_0-9]*)+$/,
                    NUMBER: /^-?(?:[1-9][0-9]*|0|0x[0-9a-fA-F]+|0[0-7]+|([0-9]*\.[0-9]+([Ee][+-]?[0-9]+)?))$/,
                    NUMBER_DEC: /^(?:[1-9][0-9]*|0)$/,
                    NUMBER_HEX: /^0x[0-9a-fA-F]+$/,
                    NUMBER_OCT: /^0[0-7]+$/,
                    NUMBER_FLT: /^[0-9]*\.[0-9]+([Ee][+-]?[0-9]+)?$/,
                    ID: /^(?:[1-9][0-9]*|0|0x[0-9a-fA-F]+|0[0-7]+)$/,
                    NEGID: /^\-?(?:[1-9][0-9]*|0|0x[0-9a-fA-F]+|0[0-7]+)$/,
                    WHITESPACE: /\s/,
                    STRING: /(?:"([^"\\]*(?:\\.[^"\\]*)*)")|(?:'([^'\\]*(?:\\.[^'\\]*)*)')/g,
                    BOOL: /^(?:true|false)$/i
                }, ProtoBuf.DotProto = (function(ProtoBuf, Lang) {
                    var DotProto = {}, Tokenizer = function(proto) {
                        this.source = "" + proto, this.index = 0, this.line = 1, this.stack = [], this.readingString = !1, 
                        this.stringEndsWith = Lang.STRINGCLOSE;
                    }, TokenizerPrototype = Tokenizer.prototype;
                    TokenizerPrototype._readString = function() {
                        var match;
                        if (Lang.STRING.lastIndex = this.index - 1, null !== (match = Lang.STRING.exec(this.source))) {
                            var s = void 0 !== match[1] ? match[1] : match[2];
                            return this.index = Lang.STRING.lastIndex, this.stack.push(this.stringEndsWith), 
                            s;
                        }
                        throw Error("Unterminated string at line " + this.line + ", index " + this.index);
                    }, TokenizerPrototype.next = function() {
                        if (this.stack.length > 0) return this.stack.shift();
                        if (this.index >= this.source.length) return null;
                        if (this.readingString) return this.readingString = !1, this._readString();
                        var repeat, last;
                        do {
                            for (repeat = !1; Lang.WHITESPACE.test(last = this.source.charAt(this.index)); ) if (this.index++, 
                            "\n" === last && this.line++, this.index === this.source.length) return null;
                            if ("/" === this.source.charAt(this.index)) if ("/" === this.source.charAt(++this.index)) {
                                for (;"\n" !== this.source.charAt(this.index); ) if (this.index++, this.index == this.source.length) return null;
                                this.index++, this.line++, repeat = !0;
                            } else {
                                if ("*" !== this.source.charAt(this.index)) throw Error("Unterminated comment at line " + this.line + ": /" + this.source.charAt(this.index));
                                for (last = ""; last + (last = this.source.charAt(this.index)) !== "*/"; ) if (this.index++, 
                                "\n" === last && this.line++, this.index === this.source.length) return null;
                                this.index++, repeat = !0;
                            }
                        } while (repeat);
                        if (this.index === this.source.length) return null;
                        var end = this.index;
                        if (Lang.DELIM.lastIndex = 0, Lang.DELIM.test(this.source.charAt(end))) ++end; else for (++end; end < this.source.length && !Lang.DELIM.test(this.source.charAt(end)); ) end++;
                        var token = this.source.substring(this.index, this.index = end);
                        return token === Lang.STRINGOPEN ? (this.readingString = !0, this.stringEndsWith = Lang.STRINGCLOSE) : token === Lang.STRINGOPEN_SQ && (this.readingString = !0, 
                        this.stringEndsWith = Lang.STRINGCLOSE_SQ), token;
                    }, TokenizerPrototype.peek = function() {
                        if (0 === this.stack.length) {
                            var token = this.next();
                            if (null === token) return null;
                            this.stack.push(token);
                        }
                        return this.stack[0];
                    }, TokenizerPrototype.toString = function() {
                        return "Tokenizer(" + this.index + "/" + this.source.length + " at line " + this.line + ")";
                    }, DotProto.Tokenizer = Tokenizer;
                    var Parser = function(proto) {
                        this.tn = new Tokenizer(proto);
                    }, ParserPrototype = Parser.prototype;
                    return ParserPrototype.parse = function() {
                        for (var token, topLevel = {
                            name: "[ROOT]",
                            package: null,
                            messages: [],
                            enums: [],
                            imports: [],
                            options: {},
                            services: []
                        }, head = !0; token = this.tn.next(); ) switch (token) {
                          case "package":
                            if (!head || null !== topLevel.package) throw Error("Unexpected package at line " + this.tn.line);
                            topLevel.package = this._parsePackage(token);
                            break;

                          case "import":
                            if (!head) throw Error("Unexpected import at line " + this.tn.line);
                            topLevel.imports.push(this._parseImport(token));
                            break;

                          case "message":
                            this._parseMessage(topLevel, null, token), head = !1;
                            break;

                          case "enum":
                            this._parseEnum(topLevel, token), head = !1;
                            break;

                          case "option":
                            if (!head) throw Error("Unexpected option at line " + this.tn.line);
                            this._parseOption(topLevel, token);
                            break;

                          case "service":
                            this._parseService(topLevel, token);
                            break;

                          case "extend":
                            this._parseExtend(topLevel, token);
                            break;

                          case "syntax":
                            this._parseIgnoredStatement(topLevel, token);
                            break;

                          default:
                            throw Error("Unexpected token at line " + this.tn.line + ": " + token);
                        }
                        return delete topLevel.name, topLevel;
                    }, ParserPrototype._parseNumber = function(val) {
                        var sign = 1;
                        if ("-" == val.charAt(0) && (sign = -1, val = val.substring(1)), Lang.NUMBER_DEC.test(val)) return sign * parseInt(val, 10);
                        if (Lang.NUMBER_HEX.test(val)) return sign * parseInt(val.substring(2), 16);
                        if (Lang.NUMBER_OCT.test(val)) return sign * parseInt(val.substring(1), 8);
                        if (Lang.NUMBER_FLT.test(val)) return sign * parseFloat(val);
                        throw Error("Illegal number at line " + this.tn.line + ": " + (sign < 0 ? "-" : "") + val);
                    }, ParserPrototype._parseString = function() {
                        var token, value = "";
                        do {
                            if (token = this.tn.next(), value += this.tn.next(), (token = this.tn.next()) !== this.tn.stringEndsWith) throw Error("Illegal end of string at line " + this.tn.line + ": " + token);
                            token = this.tn.peek();
                        } while (token === Lang.STRINGOPEN || token === Lang.STRINGOPEN_SQ);
                        return value;
                    }, ParserPrototype._parseId = function(val, neg) {
                        var id = -1, sign = 1;
                        if ("-" == val.charAt(0) && (sign = -1, val = val.substring(1)), Lang.NUMBER_DEC.test(val)) id = parseInt(val); else if (Lang.NUMBER_HEX.test(val)) id = parseInt(val.substring(2), 16); else {
                            if (!Lang.NUMBER_OCT.test(val)) throw Error("Illegal id at line " + this.tn.line + ": " + (sign < 0 ? "-" : "") + val);
                            id = parseInt(val.substring(1), 8);
                        }
                        if (id = sign * id | 0, !neg && id < 0) throw Error("Illegal id at line " + this.tn.line + ": " + (sign < 0 ? "-" : "") + val);
                        return id;
                    }, ParserPrototype._parsePackage = function(token) {
                        if (token = this.tn.next(), !Lang.TYPEREF.test(token)) throw Error("Illegal package name at line " + this.tn.line + ": " + token);
                        var pkg = token;
                        if ((token = this.tn.next()) != Lang.END) throw Error("Illegal end of package at line " + this.tn.line + ": " + token);
                        return pkg;
                    }, ParserPrototype._parseImport = function(token) {
                        if ("public" === (token = this.tn.peek()) && (this.tn.next(), token = this.tn.peek()), 
                        token !== Lang.STRINGOPEN && token !== Lang.STRINGOPEN_SQ) throw Error("Illegal start of import at line " + this.tn.line + ": " + token);
                        var imported = this._parseString();
                        if ((token = this.tn.next()) !== Lang.END) throw Error("Illegal end of import at line " + this.tn.line + ": " + token);
                        return imported;
                    }, ParserPrototype._parseOption = function(parent, token) {
                        var custom = !1;
                        if ((token = this.tn.next()) == Lang.COPTOPEN && (custom = !0, token = this.tn.next()), 
                        !Lang.TYPEREF.test(token) && !/google\.protobuf\./.test(token)) throw Error("Illegal option name in message " + parent.name + " at line " + this.tn.line + ": " + token);
                        var value, name = token;
                        if (token = this.tn.next(), custom) {
                            if (token !== Lang.COPTCLOSE) throw Error("Illegal end in message " + parent.name + ", option " + name + " at line " + this.tn.line + ": " + token);
                            name = "(" + name + ")", token = this.tn.next(), Lang.FQTYPEREF.test(token) && (name += token, 
                            token = this.tn.next());
                        }
                        if (token !== Lang.EQUAL) throw Error("Illegal operator in message " + parent.name + ", option " + name + " at line " + this.tn.line + ": " + token);
                        if ((token = this.tn.peek()) === Lang.STRINGOPEN || token === Lang.STRINGOPEN_SQ) value = this._parseString(); else if (this.tn.next(), 
                        Lang.NUMBER.test(token)) value = this._parseNumber(token, !0); else if (Lang.BOOL.test(token)) value = "true" === token; else {
                            if (!Lang.TYPEREF.test(token)) throw Error("Illegal option value in message " + parent.name + ", option " + name + " at line " + this.tn.line + ": " + token);
                            value = token;
                        }
                        if ((token = this.tn.next()) !== Lang.END) throw Error("Illegal end of option in message " + parent.name + ", option " + name + " at line " + this.tn.line + ": " + token);
                        parent.options[name] = value;
                    }, ParserPrototype._parseIgnoredStatement = function(parent, keyword) {
                        for (var token; ;) {
                            if (null === (token = this.tn.next())) throw Error("Unexpected EOF in " + parent.name + ", " + keyword + " at line " + this.tn.line);
                            if (token === Lang.END) break;
                        }
                    }, ParserPrototype._parseService = function(parent, token) {
                        if (token = this.tn.next(), !Lang.NAME.test(token)) throw Error("Illegal service name at line " + this.tn.line + ": " + token);
                        var name = token, svc = {
                            name: name,
                            rpc: {},
                            options: {}
                        };
                        if ((token = this.tn.next()) !== Lang.OPEN) throw Error("Illegal start of service " + name + " at line " + this.tn.line + ": " + token);
                        do {
                            if ("option" === (token = this.tn.next())) this._parseOption(svc, token); else if ("rpc" === token) this._parseServiceRPC(svc, token); else if (token !== Lang.CLOSE) throw Error("Illegal type of service " + name + " at line " + this.tn.line + ": " + token);
                        } while (token !== Lang.CLOSE);
                        parent.services.push(svc);
                    }, ParserPrototype._parseServiceRPC = function(svc, token) {
                        var type = token;
                        if (token = this.tn.next(), !Lang.NAME.test(token)) throw Error("Illegal method name in service " + svc.name + " at line " + this.tn.line + ": " + token);
                        var name = token, method = {
                            request: null,
                            response: null,
                            options: {}
                        };
                        if ((token = this.tn.next()) !== Lang.COPTOPEN) throw Error("Illegal start of request type in service " + svc.name + "#" + name + " at line " + this.tn.line + ": " + token);
                        if (token = this.tn.next(), !Lang.TYPEREF.test(token)) throw Error("Illegal request type in service " + svc.name + "#" + name + " at line " + this.tn.line + ": " + token);
                        if (method.request = token, (token = this.tn.next()) != Lang.COPTCLOSE) throw Error("Illegal end of request type in service " + svc.name + "#" + name + " at line " + this.tn.line + ": " + token);
                        if ("returns" !== (token = this.tn.next()).toLowerCase()) throw Error("Illegal delimiter in service " + svc.name + "#" + name + " at line " + this.tn.line + ": " + token);
                        if ((token = this.tn.next()) != Lang.COPTOPEN) throw Error("Illegal start of response type in service " + svc.name + "#" + name + " at line " + this.tn.line + ": " + token);
                        if (token = this.tn.next(), method.response = token, (token = this.tn.next()) !== Lang.COPTCLOSE) throw Error("Illegal end of response type in service " + svc.name + "#" + name + " at line " + this.tn.line + ": " + token);
                        if ((token = this.tn.next()) === Lang.OPEN) {
                            do {
                                if ("option" === (token = this.tn.next())) this._parseOption(method, token); else if (token !== Lang.CLOSE) throw Error("Illegal start of option inservice " + svc.name + "#" + name + " at line " + this.tn.line + ": " + token);
                            } while (token !== Lang.CLOSE);
                            this.tn.peek() === Lang.END && this.tn.next();
                        } else if (token !== Lang.END) throw Error("Illegal delimiter in service " + svc.name + "#" + name + " at line " + this.tn.line + ": " + token);
                        void 0 === svc[type] && (svc[type] = {}), svc[type][name] = method;
                    }, ParserPrototype._parseMessage = function(parent, fld, token) {
                        var msg = {}, isGroup = "group" === token;
                        if (token = this.tn.next(), !Lang.NAME.test(token)) throw Error("Illegal " + (isGroup ? "group" : "message") + " name" + (parent ? " in message " + parent.name : "") + " at line " + this.tn.line + ": " + token);
                        if (msg.name = token, isGroup) {
                            if ((token = this.tn.next()) !== Lang.EQUAL) throw Error("Illegal id assignment after group " + msg.name + " at line " + this.tn.line + ": " + token);
                            token = this.tn.next();
                            try {
                                fld.id = this._parseId(token);
                            } catch (e) {
                                throw Error("Illegal field id value for group " + msg.name + "#" + fld.name + " at line " + this.tn.line + ": " + token);
                            }
                            msg.isGroup = !0;
                        }
                        if (msg.fields = [], msg.enums = [], msg.messages = [], msg.options = {}, msg.oneofs = {}, 
                        (token = this.tn.next()) === Lang.OPTOPEN && fld && (this._parseFieldOptions(msg, fld, token), 
                        token = this.tn.next()), token !== Lang.OPEN) throw Error("Illegal start of " + (isGroup ? "group" : "message") + " " + msg.name + " at line " + this.tn.line + ": " + token);
                        for (;;) {
                            if ((token = this.tn.next()) === Lang.CLOSE) {
                                (token = this.tn.peek()) === Lang.END && this.tn.next();
                                break;
                            }
                            if (Lang.RULE.test(token)) this._parseMessageField(msg, token); else if ("oneof" === token) this._parseMessageOneOf(msg, token); else if ("enum" === token) this._parseEnum(msg, token); else if ("message" === token) this._parseMessage(msg, null, token); else if ("option" === token) this._parseOption(msg, token); else if ("extensions" === token) msg.extensions = this._parseExtensions(msg, token); else {
                                if ("extend" !== token) throw Error("Illegal token in message " + msg.name + " at line " + this.tn.line + ": " + token);
                                this._parseExtend(msg, token);
                            }
                        }
                        return parent.messages.push(msg), msg;
                    }, ParserPrototype._parseMessageField = function(msg, token) {
                        var fld = {}, grp = null;
                        if (fld.rule = token, fld.options = {}, "group" === (token = this.tn.next())) {
                            if (grp = this._parseMessage(msg, fld, token), !/^[A-Z]/.test(grp.name)) throw Error("Group names must start with a capital letter");
                            fld.type = grp.name, fld.name = grp.name.toLowerCase(), (token = this.tn.peek()) === Lang.END && this.tn.next();
                        } else {
                            if (!Lang.TYPE.test(token) && !Lang.TYPEREF.test(token)) throw Error("Illegal field type in message " + msg.name + " at line " + this.tn.line + ": " + token);
                            if (fld.type = token, token = this.tn.next(), !Lang.NAME.test(token)) throw Error("Illegal field name in message " + msg.name + " at line " + this.tn.line + ": " + token);
                            if (fld.name = token, (token = this.tn.next()) !== Lang.EQUAL) throw Error("Illegal token in field " + msg.name + "#" + fld.name + " at line " + this.tn.line + ": " + token);
                            token = this.tn.next();
                            try {
                                fld.id = this._parseId(token);
                            } catch (e) {
                                throw Error("Illegal field id in message " + msg.name + "#" + fld.name + " at line " + this.tn.line + ": " + token);
                            }
                            if ((token = this.tn.next()) === Lang.OPTOPEN && (this._parseFieldOptions(msg, fld, token), 
                            token = this.tn.next()), token !== Lang.END) throw Error("Illegal delimiter in message " + msg.name + "#" + fld.name + " at line " + this.tn.line + ": " + token);
                        }
                        return msg.fields.push(fld), fld;
                    }, ParserPrototype._parseMessageOneOf = function(msg, token) {
                        if (token = this.tn.next(), !Lang.NAME.test(token)) throw Error("Illegal oneof name in message " + msg.name + " at line " + this.tn.line + ": " + token);
                        var fld, name = token, fields = [];
                        if ((token = this.tn.next()) !== Lang.OPEN) throw Error("Illegal start of oneof " + name + " at line " + this.tn.line + ": " + token);
                        for (;this.tn.peek() !== Lang.CLOSE; ) (fld = this._parseMessageField(msg, "optional")).oneof = name, 
                        fields.push(fld.id);
                        this.tn.next(), msg.oneofs[name] = fields;
                    }, ParserPrototype._parseFieldOptions = function(msg, fld, token) {
                        for (var first = !0; (token = this.tn.next()) !== Lang.OPTCLOSE; ) {
                            if (token === Lang.OPTEND) {
                                if (first) throw Error("Illegal start of options in message " + msg.name + "#" + fld.name + " at line " + this.tn.line + ": " + token);
                                token = this.tn.next();
                            }
                            this._parseFieldOption(msg, fld, token), first = !1;
                        }
                    }, ParserPrototype._parseFieldOption = function(msg, fld, token) {
                        var custom = !1;
                        if (token === Lang.COPTOPEN && (token = this.tn.next(), custom = !0), !Lang.TYPEREF.test(token)) throw Error("Illegal field option in " + msg.name + "#" + fld.name + " at line " + this.tn.line + ": " + token);
                        var value, name = token;
                        if (token = this.tn.next(), custom) {
                            if (token !== Lang.COPTCLOSE) throw Error("Illegal delimiter in " + msg.name + "#" + fld.name + " at line " + this.tn.line + ": " + token);
                            name = "(" + name + ")", token = this.tn.next(), Lang.FQTYPEREF.test(token) && (name += token, 
                            token = this.tn.next());
                        }
                        if (token !== Lang.EQUAL) throw Error("Illegal token in " + msg.name + "#" + fld.name + " at line " + this.tn.line + ": " + token);
                        if ((token = this.tn.peek()) === Lang.STRINGOPEN || token === Lang.STRINGOPEN_SQ) value = this._parseString(); else if (Lang.NUMBER.test(token, !0)) value = this._parseNumber(this.tn.next(), !0); else if (Lang.BOOL.test(token)) value = "true" === this.tn.next().toLowerCase(); else {
                            if (!Lang.TYPEREF.test(token)) throw Error("Illegal value in message " + msg.name + "#" + fld.name + ", option " + name + " at line " + this.tn.line + ": " + token);
                            value = this.tn.next();
                        }
                        fld.options[name] = value;
                    }, ParserPrototype._parseEnum = function(msg, token) {
                        var enm = {};
                        if (token = this.tn.next(), !Lang.NAME.test(token)) throw Error("Illegal enum name in message " + msg.name + " at line " + this.tn.line + ": " + token);
                        if (enm.name = token, (token = this.tn.next()) !== Lang.OPEN) throw Error("Illegal start of enum " + enm.name + " at line " + this.tn.line + ": " + token);
                        for (enm.values = [], enm.options = {}; ;) {
                            if ((token = this.tn.next()) === Lang.CLOSE) {
                                (token = this.tn.peek()) === Lang.END && this.tn.next();
                                break;
                            }
                            if ("option" == token) this._parseOption(enm, token); else {
                                if (!Lang.NAME.test(token)) throw Error("Illegal name in enum " + enm.name + " at line " + this.tn.line + ": " + token);
                                this._parseEnumValue(enm, token);
                            }
                        }
                        msg.enums.push(enm);
                    }, ParserPrototype._parseEnumValue = function(enm, token) {
                        var val = {};
                        if (val.name = token, (token = this.tn.next()) !== Lang.EQUAL) throw Error("Illegal token in enum " + enm.name + " at line " + this.tn.line + ": " + token);
                        token = this.tn.next();
                        try {
                            val.id = this._parseId(token, !0);
                        } catch (e) {
                            throw Error("Illegal id in enum " + enm.name + " at line " + this.tn.line + ": " + token);
                        }
                        if (enm.values.push(val), (token = this.tn.next()) === Lang.OPTOPEN && (this._parseFieldOptions(enm, {
                            options: {}
                        }, token), token = this.tn.next()), token !== Lang.END) throw Error("Illegal delimiter in enum " + enm.name + " at line " + this.tn.line + ": " + token);
                    }, ParserPrototype._parseExtensions = function(msg, token) {
                        var range = [];
                        if ("min" === (token = this.tn.next()) ? range.push(ProtoBuf.ID_MIN) : "max" === token ? range.push(ProtoBuf.ID_MAX) : range.push(this._parseNumber(token)), 
                        "to" !== (token = this.tn.next())) throw Error("Illegal extensions delimiter in message " + msg.name + " at line " + this.tn.line + ": " + token);
                        if ("min" === (token = this.tn.next()) ? range.push(ProtoBuf.ID_MIN) : "max" === token ? range.push(ProtoBuf.ID_MAX) : range.push(this._parseNumber(token)), 
                        (token = this.tn.next()) !== Lang.END) throw Error("Illegal extensions delimiter in message " + msg.name + " at line " + this.tn.line + ": " + token);
                        return range;
                    }, ParserPrototype._parseExtend = function(parent, token) {
                        if (token = this.tn.next(), !Lang.TYPEREF.test(token)) throw Error("Illegal message name at line " + this.tn.line + ": " + token);
                        var ext = {};
                        if (ext.ref = token, ext.fields = [], (token = this.tn.next()) !== Lang.OPEN) throw Error("Illegal start of extend " + ext.name + " at line " + this.tn.line + ": " + token);
                        for (;;) {
                            if ((token = this.tn.next()) === Lang.CLOSE) {
                                (token = this.tn.peek()) == Lang.END && this.tn.next();
                                break;
                            }
                            if (!Lang.RULE.test(token)) throw Error("Illegal token in extend " + ext.name + " at line " + this.tn.line + ": " + token);
                            this._parseMessageField(ext, token);
                        }
                        return parent.messages.push(ext), ext;
                    }, ParserPrototype.toString = function() {
                        return "Parser";
                    }, DotProto.Parser = Parser, DotProto;
                })(ProtoBuf, ProtoBuf.Lang), ProtoBuf.Reflect = (function(ProtoBuf) {
                    var Reflect = {}, T = function(builder, parent, name) {
                        this.builder = builder, this.parent = parent, this.name = name, this.className;
                    }, TPrototype = T.prototype;
                    TPrototype.fqn = function() {
                        for (var name = this.name, ptr = this; null != (ptr = ptr.parent); ) name = ptr.name + "." + name;
                        return name;
                    }, TPrototype.toString = function(includeClass) {
                        return (includeClass ? this.className + " " : "") + this.fqn();
                    }, TPrototype.build = function() {
                        throw Error(this.toString(!0) + " cannot be built directly");
                    }, Reflect.T = T;
                    var Namespace = function(builder, parent, name, options) {
                        T.call(this, builder, parent, name), this.className = "Namespace", this.children = [], 
                        this.options = options || {};
                    }, NamespacePrototype = Namespace.prototype = Object.create(T.prototype);
                    NamespacePrototype.getChildren = function(type) {
                        if (null == (type = type || null)) return this.children.slice();
                        for (var children = [], i = 0, k = this.children.length; i < k; ++i) this.children[i] instanceof type && children.push(this.children[i]);
                        return children;
                    }, NamespacePrototype.addChild = function(child) {
                        var other;
                        if (other = this.getChild(child.name)) if (other instanceof Message.Field && other.name !== other.originalName && null === this.getChild(other.originalName)) other.name = other.originalName; else {
                            if (!(child instanceof Message.Field && child.name !== child.originalName && null === this.getChild(child.originalName))) throw Error("Duplicate name in namespace " + this.toString(!0) + ": " + child.name);
                            child.name = child.originalName;
                        }
                        this.children.push(child);
                    }, NamespacePrototype.getChild = function(nameOrId) {
                        for (var key = "number" == typeof nameOrId ? "id" : "name", i = 0, k = this.children.length; i < k; ++i) if (this.children[i][key] === nameOrId) return this.children[i];
                        return null;
                    }, NamespacePrototype.resolve = function(qn, excludeFields) {
                        var child, part = qn.split("."), ptr = this, i = 0;
                        if ("" === part[i]) {
                            for (;null !== ptr.parent; ) ptr = ptr.parent;
                            i++;
                        }
                        do {
                            do {
                                if (!(child = ptr.getChild(part[i])) || !(child instanceof Reflect.T) || excludeFields && child instanceof Reflect.Message.Field) {
                                    ptr = null;
                                    break;
                                }
                                ptr = child, i++;
                            } while (i < part.length);
                            if (null != ptr) break;
                            if (null !== this.parent) return this.parent.resolve(qn, excludeFields);
                        } while (null != ptr);
                        return ptr;
                    }, NamespacePrototype.build = function() {
                        for (var child, ns = {}, children = this.children, i = 0, k = children.length; i < k; ++i) (child = children[i]) instanceof Namespace && (ns[child.name] = child.build());
                        return Object.defineProperty && Object.defineProperty(ns, "$options", {
                            value: this.buildOpt()
                        }), ns;
                    }, NamespacePrototype.buildOpt = function() {
                        for (var opt = {}, keys = Object.keys(this.options), i = 0, k = keys.length; i < k; ++i) {
                            var key = keys[i], val = this.options[keys[i]];
                            opt[key] = val;
                        }
                        return opt;
                    }, NamespacePrototype.getOption = function(name) {
                        return void 0 === name ? this.options : void 0 !== this.options[name] ? this.options[name] : null;
                    }, Reflect.Namespace = Namespace;
                    var Message = function(builder, parent, name, options, isGroup) {
                        Namespace.call(this, builder, parent, name, options), this.className = "Message", 
                        this.extensions = [ ProtoBuf.ID_MIN, ProtoBuf.ID_MAX ], this.clazz = null, this.isGroup = !!isGroup, 
                        this._fields = null, this._fieldsById = null, this._fieldsByName = null;
                    }, MessagePrototype = Message.prototype = Object.create(Namespace.prototype);
                    function skipTillGroupEnd(expectedId, buf) {
                        var tag = buf.readVarint32(), wireType = 7 & tag, id = tag >> 3;
                        switch (wireType) {
                          case ProtoBuf.WIRE_TYPES.VARINT:
                            do {
                                tag = buf.readUint8();
                            } while (128 == (128 & tag));
                            break;

                          case ProtoBuf.WIRE_TYPES.BITS64:
                            buf.offset += 8;
                            break;

                          case ProtoBuf.WIRE_TYPES.LDELIM:
                            tag = buf.readVarint32(), buf.offset += tag;
                            break;

                          case ProtoBuf.WIRE_TYPES.STARTGROUP:
                            skipTillGroupEnd(id, buf);
                            break;

                          case ProtoBuf.WIRE_TYPES.ENDGROUP:
                            if (id === expectedId) return !1;
                            throw Error("Illegal GROUPEND after unknown group: " + id + " (" + expectedId + " expected)");

                          case ProtoBuf.WIRE_TYPES.BITS32:
                            buf.offset += 4;
                            break;

                          default:
                            throw Error("Illegal wire type in unknown group " + expectedId + ": " + wireType);
                        }
                        return !0;
                    }
                    MessagePrototype.build = function(rebuild) {
                        if (this.clazz && !rebuild) return this.clazz;
                        var clazz = (function(ProtoBuf, T) {
                            var fields = T.getChildren(ProtoBuf.Reflect.Message.Field), oneofs = T.getChildren(ProtoBuf.Reflect.Message.OneOf), Message = function(values, var_args) {
                                ProtoBuf.Builder.Message.call(this);
                                for (var i = 0, k = oneofs.length; i < k; ++i) this[oneofs[i].name] = null;
                                for (i = 0, k = fields.length; i < k; ++i) {
                                    var field = fields[i];
                                    this[field.name] = field.repeated ? [] : null, field.required && null !== field.defaultValue && (this[field.name] = field.defaultValue);
                                }
                                if (arguments.length > 0) if (1 !== arguments.length || "object" != typeof values || "function" == typeof values.encode || ProtoBuf.Util.isArray(values) || values instanceof ByteBuffer || values instanceof ArrayBuffer || ProtoBuf.Long && values instanceof ProtoBuf.Long) for (i = 0, 
                                k = arguments.length; i < k; ++i) this.$set(fields[i].name, arguments[i]); else {
                                    var keys = Object.keys(values);
                                    for (i = 0, k = keys.length; i < k; ++i) this.$set(keys[i], values[keys[i]]);
                                }
                            }, MessagePrototype = Message.prototype = Object.create(ProtoBuf.Builder.Message.prototype);
                            MessagePrototype.add = function(key, value, noAssert) {
                                var field = T._fieldsByName[key];
                                if (!noAssert) {
                                    if (!field) throw Error(this + "#" + key + " is undefined");
                                    if (!(field instanceof ProtoBuf.Reflect.Message.Field)) throw Error(this + "#" + key + " is not a field: " + field.toString(!0));
                                    if (!field.repeated) throw Error(this + "#" + key + " is not a repeated field");
                                }
                                null === this[field.name] && (this[field.name] = []), this[field.name].push(noAssert ? value : field.verifyValue(value, !0));
                            }, MessagePrototype.$add = MessagePrototype.add, MessagePrototype.set = function(key, value, noAssert) {
                                if (key && "object" == typeof key) {
                                    for (var i in key) key.hasOwnProperty(i) && this.$set(i, key[i], noAssert);
                                    return this;
                                }
                                var field = T._fieldsByName[key];
                                if (noAssert) this[field.name] = value; else {
                                    if (!field) throw Error(this + "#" + key + " is not a field: undefined");
                                    if (!(field instanceof ProtoBuf.Reflect.Message.Field)) throw Error(this + "#" + key + " is not a field: " + field.toString(!0));
                                    this[field.name] = value = field.verifyValue(value);
                                }
                                return field.oneof && (null !== value ? (null !== this[field.oneof.name] && (this[this[field.oneof.name]] = null), 
                                this[field.oneof.name] = field.name) : field.oneof.name === key && (this[field.oneof.name] = null)), 
                                this;
                            }, MessagePrototype.$set = MessagePrototype.set, MessagePrototype.get = function(key, noAssert) {
                                if (noAssert) return this[key];
                                var field = T._fieldsByName[key];
                                if (!(field && field instanceof ProtoBuf.Reflect.Message.Field)) throw Error(this + "#" + key + " is not a field: undefined");
                                if (!(field instanceof ProtoBuf.Reflect.Message.Field)) throw Error(this + "#" + key + " is not a field: " + field.toString(!0));
                                return this[field.name];
                            }, MessagePrototype.$get = MessagePrototype.get;
                            for (var i = 0; i < fields.length; i++) {
                                var field = fields[i];
                                field instanceof ProtoBuf.Reflect.Message.ExtensionField || T.builder.options.populateAccessors && (function(field) {
                                    var Name = field.originalName.replace(/(_[a-zA-Z])/g, (function(match) {
                                        return match.toUpperCase().replace("_", "");
                                    }));
                                    Name = Name.substring(0, 1).toUpperCase() + Name.substring(1);
                                    var name = field.originalName.replace(/([A-Z])/g, (function(match) {
                                        return "_" + match;
                                    })), setter = function(value, noAssert) {
                                        return this[field.name] = noAssert ? value : field.verifyValue(value), this;
                                    }, getter = function() {
                                        return this[field.name];
                                    };
                                    null === T.getChild("set" + Name) && (MessagePrototype["set" + Name] = setter), 
                                    null === T.getChild("set_" + name) && (MessagePrototype["set_" + name] = setter), 
                                    null === T.getChild("get" + Name) && (MessagePrototype["get" + Name] = getter), 
                                    null === T.getChild("get_" + name) && (MessagePrototype["get_" + name] = getter);
                                })(field);
                            }
                            function cloneRaw(obj, includeBinaryAsBase64) {
                                var clone = {};
                                for (var i in obj) obj.hasOwnProperty(i) && (null === obj[i] || "object" != typeof obj[i] ? clone[i] = obj[i] : obj[i] instanceof ByteBuffer ? includeBinaryAsBase64 && (clone[i] = obj[i].toBase64()) : clone[i] = cloneRaw(obj[i], includeBinaryAsBase64));
                                return clone;
                            }
                            return MessagePrototype.encode = function(buffer, noVerify) {
                                "boolean" == typeof buffer && (noVerify = buffer, buffer = void 0);
                                var isNew = !1;
                                buffer || (buffer = new ByteBuffer, isNew = !0);
                                var le = buffer.littleEndian;
                                try {
                                    return T.encode(this, buffer.LE(), noVerify), (isNew ? buffer.flip() : buffer).LE(le);
                                } catch (e) {
                                    throw buffer.LE(le), e;
                                }
                            }, MessagePrototype.calculate = function() {
                                return T.calculate(this);
                            }, MessagePrototype.encodeDelimited = function(buffer) {
                                var isNew = !1;
                                buffer || (buffer = new ByteBuffer, isNew = !0);
                                var enc = (new ByteBuffer).LE();
                                return T.encode(this, enc).flip(), buffer.writeVarint32(enc.remaining()), buffer.append(enc), 
                                isNew ? buffer.flip() : buffer;
                            }, MessagePrototype.encodeAB = function() {
                                try {
                                    return this.encode().toArrayBuffer();
                                } catch (e) {
                                    throw e.encoded && (e.encoded = e.encoded.toArrayBuffer()), e;
                                }
                            }, MessagePrototype.toArrayBuffer = MessagePrototype.encodeAB, MessagePrototype.encodeNB = function() {
                                try {
                                    return this.encode().toBuffer();
                                } catch (e) {
                                    throw e.encoded && (e.encoded = e.encoded.toBuffer()), e;
                                }
                            }, MessagePrototype.toBuffer = MessagePrototype.encodeNB, MessagePrototype.encode64 = function() {
                                try {
                                    return this.encode().toBase64();
                                } catch (e) {
                                    throw e.encoded && (e.encoded = e.encoded.toBase64()), e;
                                }
                            }, MessagePrototype.toBase64 = MessagePrototype.encode64, MessagePrototype.encodeHex = function() {
                                try {
                                    return this.encode().toHex();
                                } catch (e) {
                                    throw e.encoded && (e.encoded = e.encoded.toHex()), e;
                                }
                            }, MessagePrototype.toHex = MessagePrototype.encodeHex, MessagePrototype.toRaw = function(includeBinaryAsBase64) {
                                return cloneRaw(this, !!includeBinaryAsBase64);
                            }, Message.decode = function(buffer, enc) {
                                "string" == typeof buffer && (buffer = ByteBuffer.wrap(buffer, enc || "base64"));
                                var le = (buffer = buffer instanceof ByteBuffer ? buffer : ByteBuffer.wrap(buffer)).littleEndian;
                                try {
                                    var msg = T.decode(buffer.LE());
                                    return buffer.LE(le), msg;
                                } catch (e) {
                                    throw buffer.LE(le), e;
                                }
                            }, Message.decodeDelimited = function(buffer, enc) {
                                if ("string" == typeof buffer && (buffer = ByteBuffer.wrap(buffer, enc || "base64")), 
                                (buffer = buffer instanceof ByteBuffer ? buffer : ByteBuffer.wrap(buffer)).remaining() < 1) return null;
                                var off = buffer.offset, len = buffer.readVarint32();
                                if (buffer.remaining() < len) return buffer.offset = off, null;
                                try {
                                    var msg = T.decode(buffer.slice(buffer.offset, buffer.offset + len).LE());
                                    return buffer.offset += len, msg;
                                } catch (err) {
                                    throw buffer.offset += len, err;
                                }
                            }, Message.decode64 = function(str) {
                                return Message.decode(str, "base64");
                            }, Message.decodeHex = function(str) {
                                return Message.decode(str, "hex");
                            }, MessagePrototype.toString = function() {
                                return T.toString();
                            }, Object.defineProperty && (Object.defineProperty(Message, "$options", {
                                value: T.buildOpt()
                            }), Object.defineProperty(MessagePrototype, "$type", {
                                get: function() {
                                    return T;
                                }
                            })), Message;
                        })(ProtoBuf, this);
                        this._fields = [], this._fieldsById = {}, this._fieldsByName = {};
                        for (var child, i = 0, k = this.children.length; i < k; i++) if ((child = this.children[i]) instanceof Enum) clazz[child.name] = child.build(); else if (child instanceof Message) clazz[child.name] = child.build(); else if (child instanceof Message.Field) child.build(), 
                        this._fields.push(child), this._fieldsById[child.id] = child, this._fieldsByName[child.name] = child; else if (!(child instanceof Message.OneOf || child instanceof Extension)) throw Error("Illegal reflect child of " + this.toString(!0) + ": " + children[i].toString(!0));
                        return this.clazz = clazz;
                    }, MessagePrototype.encode = function(message, buffer, noVerify) {
                        for (var field, val, fieldMissing = null, i = 0, k = this._fields.length; i < k; ++i) val = message[(field = this._fields[i]).name], 
                        field.required && null === val ? null === fieldMissing && (fieldMissing = field) : field.encode(noVerify ? val : field.verifyValue(val), buffer);
                        if (null !== fieldMissing) {
                            var err = Error("Missing at least one required field for " + this.toString(!0) + ": " + fieldMissing);
                            throw err.encoded = buffer, err;
                        }
                        return buffer;
                    }, MessagePrototype.calculate = function(message) {
                        for (var field, val, n = 0, i = 0, k = this._fields.length; i < k; ++i) {
                            if (val = message[(field = this._fields[i]).name], field.required && null === val) throw Error("Missing at least one required field for " + this.toString(!0) + ": " + field);
                            n += field.calculate(val);
                        }
                        return n;
                    }, MessagePrototype.decode = function(buffer, length, expectedGroupEndId) {
                        length = "number" == typeof length ? length : -1;
                        for (var tag, wireType, id, field, start = buffer.offset, msg = new this.clazz; buffer.offset < start + length || -1 === length && buffer.remaining() > 0; ) {
                            if (id = (tag = buffer.readVarint32()) >> 3, (wireType = 7 & tag) === ProtoBuf.WIRE_TYPES.ENDGROUP) {
                                if (id !== expectedGroupEndId) throw Error("Illegal group end indicator for " + this.toString(!0) + ": " + id + " (" + (expectedGroupEndId ? expectedGroupEndId + " expected" : "not a group") + ")");
                                break;
                            }
                            if (field = this._fieldsById[id]) field.repeated && !field.options.packed ? msg[field.name].push(field.decode(wireType, buffer)) : (msg[field.name] = field.decode(wireType, buffer), 
                            field.oneof && (null !== this[field.oneof.name] && (this[this[field.oneof.name]] = null), 
                            msg[field.oneof.name] = field.name)); else switch (wireType) {
                              case ProtoBuf.WIRE_TYPES.VARINT:
                                buffer.readVarint32();
                                break;

                              case ProtoBuf.WIRE_TYPES.BITS32:
                                buffer.offset += 4;
                                break;

                              case ProtoBuf.WIRE_TYPES.BITS64:
                                buffer.offset += 8;
                                break;

                              case ProtoBuf.WIRE_TYPES.LDELIM:
                                var len = buffer.readVarint32();
                                buffer.offset += len;
                                break;

                              case ProtoBuf.WIRE_TYPES.STARTGROUP:
                                for (;skipTillGroupEnd(id, buffer); ) ;
                                break;

                              default:
                                throw Error("Illegal wire type for unknown field " + id + " in " + this.toString(!0) + "#decode: " + wireType);
                            }
                        }
                        for (var i = 0, k = this._fields.length; i < k; ++i) if (null === msg[(field = this._fields[i]).name]) {
                            if (field.required) {
                                var err = Error("Missing at least one required field for " + this.toString(!0) + ": " + field.name);
                                throw err.decoded = msg, err;
                            }
                            null !== field.defaultValue && (msg[field.name] = field.defaultValue);
                        }
                        return msg;
                    }, Reflect.Message = Message;
                    var Field = function(builder, message, rule, type, name, id, options, oneof) {
                        T.call(this, builder, message, name), this.className = "Message.Field", this.required = "required" === rule, 
                        this.repeated = "repeated" === rule, this.type = type, this.resolvedType = null, 
                        this.id = id, this.options = options || {}, this.defaultValue = null, this.oneof = oneof || null, 
                        this.originalName = this.name, !this.builder.options.convertFieldsToCamelCase || this instanceof Message.ExtensionField || (this.name = Field._toCamelCase(this.name));
                    };
                    Field._toCamelCase = function(name) {
                        return name.replace(/_([a-zA-Z])/g, (function($0, $1) {
                            return $1.toUpperCase();
                        }));
                    };
                    var FieldPrototype = Field.prototype = Object.create(T.prototype);
                    function mkLong(value, unsigned) {
                        if (value && "number" == typeof value.low && "number" == typeof value.high && "boolean" == typeof value.unsigned && value.low == value.low && value.high == value.high) return new ProtoBuf.Long(value.low, value.high, void 0 === unsigned ? value.unsigned : unsigned);
                        if ("string" == typeof value) return ProtoBuf.Long.fromString(value, unsigned || !1, 10);
                        if ("number" == typeof value) return ProtoBuf.Long.fromNumber(value, unsigned || !1);
                        throw Error("not convertible to Long");
                    }
                    FieldPrototype.build = function() {
                        this.defaultValue = void 0 !== this.options.default ? this.verifyValue(this.options.default) : null;
                    }, FieldPrototype.verifyValue = function(value, skipRepeated) {
                        skipRepeated = skipRepeated || !1;
                        var fail = function(val, msg) {
                            throw Error("Illegal value for " + this.toString(!0) + " of type " + this.type.name + ": " + val + " (" + msg + ")");
                        }.bind(this);
                        if (null === value) return this.required && fail(typeof value, "required"), null;
                        if (this.repeated && !skipRepeated) {
                            ProtoBuf.Util.isArray(value) || (value = [ value ]);
                            var res = [];
                            for (i = 0; i < value.length; i++) res.push(this.verifyValue(value[i], !0));
                            return res;
                        }
                        switch (!this.repeated && ProtoBuf.Util.isArray(value) && fail(typeof value, "no array expected"), 
                        this.type) {
                          case ProtoBuf.TYPES.int32:
                          case ProtoBuf.TYPES.sint32:
                          case ProtoBuf.TYPES.sfixed32:
                            return ("number" != typeof value || value == value && value % 1 != 0) && fail(typeof value, "not an integer"), 
                            value > 4294967295 ? 0 | value : value;

                          case ProtoBuf.TYPES.uint32:
                          case ProtoBuf.TYPES.fixed32:
                            return ("number" != typeof value || value == value && value % 1 != 0) && fail(typeof value, "not an integer"), 
                            value < 0 ? value >>> 0 : value;

                          case ProtoBuf.TYPES.int64:
                          case ProtoBuf.TYPES.sint64:
                          case ProtoBuf.TYPES.sfixed64:
                            if (ProtoBuf.Long) try {
                                return mkLong(value, !1);
                            } catch (e) {
                                fail(typeof value, e.message);
                            } else fail(typeof value, "requires Long.js");

                          case ProtoBuf.TYPES.uint64:
                          case ProtoBuf.TYPES.fixed64:
                            if (ProtoBuf.Long) try {
                                return mkLong(value, !0);
                            } catch (e) {
                                fail(typeof value, e.message);
                            } else fail(typeof value, "requires Long.js");

                          case ProtoBuf.TYPES.bool:
                            return "boolean" != typeof value && fail(typeof value, "not a boolean"), value;

                          case ProtoBuf.TYPES.float:
                          case ProtoBuf.TYPES.double:
                            return "number" != typeof value && fail(typeof value, "not a number"), value;

                          case ProtoBuf.TYPES.string:
                            return "string" == typeof value || value && value instanceof String || fail(typeof value, "not a string"), 
                            "" + value;

                          case ProtoBuf.TYPES.bytes:
                            return ByteBuffer.isByteBuffer(value) ? value : ByteBuffer.wrap(value, "base64");

                          case ProtoBuf.TYPES.enum:
                            var values = this.resolvedType.getChildren(Enum.Value);
                            for (i = 0; i < values.length; i++) {
                                if (values[i].name == value) return values[i].id;
                                if (values[i].id == value) return values[i].id;
                            }
                            fail(value, "not a valid enum value");

                          case ProtoBuf.TYPES.group:
                          case ProtoBuf.TYPES.message:
                            if (value && "object" == typeof value || fail(typeof value, "object expected"), 
                            value instanceof this.resolvedType.clazz) return value;
                            if (value instanceof ProtoBuf.Builder.Message) {
                                var obj = {};
                                for (var i in value) value.hasOwnProperty(i) && (obj[i] = value[i]);
                                value = obj;
                            }
                            return new this.resolvedType.clazz(value);
                        }
                        throw Error("[INTERNAL] Illegal value for " + this.toString(!0) + ": " + value + " (undefined type " + this.type + ")");
                    }, FieldPrototype.encode = function(value, buffer) {
                        if (null === this.type || "object" != typeof this.type) throw Error("[INTERNAL] Unresolved type in " + this.toString(!0) + ": " + this.type);
                        if (null === value || this.repeated && 0 == value.length) return buffer;
                        try {
                            var i;
                            if (this.repeated) if (this.options.packed && ProtoBuf.PACKABLE_WIRE_TYPES.indexOf(this.type.wireType) >= 0) {
                                buffer.writeVarint32(this.id << 3 | ProtoBuf.WIRE_TYPES.LDELIM), buffer.ensureCapacity(buffer.offset += 1);
                                var start = buffer.offset;
                                for (i = 0; i < value.length; i++) this.encodeValue(value[i], buffer);
                                var len = buffer.offset - start, varintLen = ByteBuffer.calculateVarint32(len);
                                if (varintLen > 1) {
                                    var contents = buffer.slice(start, buffer.offset);
                                    start += varintLen - 1, buffer.offset = start, buffer.append(contents);
                                }
                                buffer.writeVarint32(len, start - varintLen);
                            } else for (i = 0; i < value.length; i++) buffer.writeVarint32(this.id << 3 | this.type.wireType), 
                            this.encodeValue(value[i], buffer); else buffer.writeVarint32(this.id << 3 | this.type.wireType), 
                            this.encodeValue(value, buffer);
                        } catch (e) {
                            throw Error("Illegal value for " + this.toString(!0) + ": " + value + " (" + e + ")");
                        }
                        return buffer;
                    }, FieldPrototype.encodeValue = function(value, buffer) {
                        if (null === value) return buffer;
                        switch (this.type) {
                          case ProtoBuf.TYPES.int32:
                            value < 0 ? buffer.writeVarint64(value) : buffer.writeVarint32(value);
                            break;

                          case ProtoBuf.TYPES.uint32:
                            buffer.writeVarint32(value);
                            break;

                          case ProtoBuf.TYPES.sint32:
                            buffer.writeVarint32ZigZag(value);
                            break;

                          case ProtoBuf.TYPES.fixed32:
                            buffer.writeUint32(value);
                            break;

                          case ProtoBuf.TYPES.sfixed32:
                            buffer.writeInt32(value);
                            break;

                          case ProtoBuf.TYPES.int64:
                          case ProtoBuf.TYPES.uint64:
                            buffer.writeVarint64(value);
                            break;

                          case ProtoBuf.TYPES.sint64:
                            buffer.writeVarint64ZigZag(value);
                            break;

                          case ProtoBuf.TYPES.fixed64:
                            buffer.writeUint64(value);
                            break;

                          case ProtoBuf.TYPES.sfixed64:
                            buffer.writeInt64(value);
                            break;

                          case ProtoBuf.TYPES.bool:
                            "string" == typeof value ? buffer.writeVarint32("false" === value.toLowerCase() ? 0 : !!value) : buffer.writeVarint32(value ? 1 : 0);
                            break;

                          case ProtoBuf.TYPES.enum:
                            buffer.writeVarint32(value);
                            break;

                          case ProtoBuf.TYPES.float:
                            buffer.writeFloat32(value);
                            break;

                          case ProtoBuf.TYPES.double:
                            buffer.writeFloat64(value);
                            break;

                          case ProtoBuf.TYPES.string:
                            buffer.writeVString(value);
                            break;

                          case ProtoBuf.TYPES.bytes:
                            if (value.remaining() < 0) throw Error("Illegal value for " + this.toString(!0) + ": " + value.remaining() + " bytes remaining");
                            var prevOffset = value.offset;
                            buffer.writeVarint32(value.remaining()), buffer.append(value), value.offset = prevOffset;
                            break;

                          case ProtoBuf.TYPES.message:
                            var bb = (new ByteBuffer).LE();
                            this.resolvedType.encode(value, bb), buffer.writeVarint32(bb.offset), buffer.append(bb.flip());
                            break;

                          case ProtoBuf.TYPES.group:
                            this.resolvedType.encode(value, buffer), buffer.writeVarint32(this.id << 3 | ProtoBuf.WIRE_TYPES.ENDGROUP);
                            break;

                          default:
                            throw Error("[INTERNAL] Illegal value to encode in " + this.toString(!0) + ": " + value + " (unknown type)");
                        }
                        return buffer;
                    }, FieldPrototype.calculate = function(value) {
                        if (value = this.verifyValue(value), null === this.type || "object" != typeof this.type) throw Error("[INTERNAL] Unresolved type in " + this.toString(!0) + ": " + this.type);
                        if (null === value || this.repeated && 0 == value.length) return 0;
                        var n = 0;
                        try {
                            var i, ni;
                            if (this.repeated) if (this.options.packed && ProtoBuf.PACKABLE_WIRE_TYPES.indexOf(this.type.wireType) >= 0) {
                                for (n += ByteBuffer.calculateVarint32(this.id << 3 | ProtoBuf.WIRE_TYPES.LDELIM), 
                                ni = 0, i = 0; i < value.length; i++) ni += this.calculateValue(value[i]);
                                n += ByteBuffer.calculateVarint32(ni), n += ni;
                            } else for (i = 0; i < value.length; i++) n += ByteBuffer.calculateVarint32(this.id << 3 | this.type.wireType), 
                            n += this.calculateValue(value[i]); else n += ByteBuffer.calculateVarint32(this.id << 3 | this.type.wireType), 
                            n += this.calculateValue(value);
                        } catch (e) {
                            throw Error("Illegal value for " + this.toString(!0) + ": " + value + " (" + e + ")");
                        }
                        return n;
                    }, FieldPrototype.calculateValue = function(value) {
                        if (null === value) return 0;
                        var n;
                        switch (this.type) {
                          case ProtoBuf.TYPES.int32:
                            return value < 0 ? ByteBuffer.calculateVarint64(value) : ByteBuffer.calculateVarint32(value);

                          case ProtoBuf.TYPES.uint32:
                            return ByteBuffer.calculateVarint32(value);

                          case ProtoBuf.TYPES.sint32:
                            return ByteBuffer.calculateVarint32(ByteBuffer.zigZagEncode32(value));

                          case ProtoBuf.TYPES.fixed32:
                          case ProtoBuf.TYPES.sfixed32:
                          case ProtoBuf.TYPES.float:
                            return 4;

                          case ProtoBuf.TYPES.int64:
                          case ProtoBuf.TYPES.uint64:
                            return ByteBuffer.calculateVarint64(value);

                          case ProtoBuf.TYPES.sint64:
                            return ByteBuffer.calculateVarint64(ByteBuffer.zigZagEncode64(value));

                          case ProtoBuf.TYPES.fixed64:
                          case ProtoBuf.TYPES.sfixed64:
                            return 8;

                          case ProtoBuf.TYPES.bool:
                            return 1;

                          case ProtoBuf.TYPES.enum:
                            return ByteBuffer.calculateVarint32(value);

                          case ProtoBuf.TYPES.double:
                            return 8;

                          case ProtoBuf.TYPES.string:
                            return n = ByteBuffer.calculateUTF8Bytes(value), ByteBuffer.calculateVarint32(n) + n;

                          case ProtoBuf.TYPES.bytes:
                            if (value.remaining() < 0) throw Error("Illegal value for " + this.toString(!0) + ": " + value.remaining() + " bytes remaining");
                            return ByteBuffer.calculateVarint32(value.remaining()) + value.remaining();

                          case ProtoBuf.TYPES.message:
                            return n = this.resolvedType.calculate(value), ByteBuffer.calculateVarint32(n) + n;

                          case ProtoBuf.TYPES.group:
                            return (n = this.resolvedType.calculate(value)) + ByteBuffer.calculateVarint32(this.id << 3 | ProtoBuf.WIRE_TYPES.ENDGROUP);
                        }
                        throw Error("[INTERNAL] Illegal value to encode in " + this.toString(!0) + ": " + value + " (unknown type)");
                    }, FieldPrototype.decode = function(wireType, buffer, skipRepeated) {
                        var value, nBytes;
                        if (wireType != this.type.wireType && (skipRepeated || wireType != ProtoBuf.WIRE_TYPES.LDELIM || !this.repeated)) throw Error("Illegal wire type for field " + this.toString(!0) + ": " + wireType + " (" + this.type.wireType + " expected)");
                        if (wireType == ProtoBuf.WIRE_TYPES.LDELIM && this.repeated && this.options.packed && ProtoBuf.PACKABLE_WIRE_TYPES.indexOf(this.type.wireType) >= 0 && !skipRepeated) {
                            nBytes = buffer.readVarint32(), nBytes = buffer.offset + nBytes;
                            for (var values = []; buffer.offset < nBytes; ) values.push(this.decode(this.type.wireType, buffer, !0));
                            return values;
                        }
                        switch (this.type) {
                          case ProtoBuf.TYPES.int32:
                            return 0 | buffer.readVarint32();

                          case ProtoBuf.TYPES.uint32:
                            return buffer.readVarint32() >>> 0;

                          case ProtoBuf.TYPES.sint32:
                            return 0 | buffer.readVarint32ZigZag();

                          case ProtoBuf.TYPES.fixed32:
                            return buffer.readUint32() >>> 0;

                          case ProtoBuf.TYPES.sfixed32:
                            return 0 | buffer.readInt32();

                          case ProtoBuf.TYPES.int64:
                            return buffer.readVarint64();

                          case ProtoBuf.TYPES.uint64:
                            return buffer.readVarint64().toUnsigned();

                          case ProtoBuf.TYPES.sint64:
                            return buffer.readVarint64ZigZag();

                          case ProtoBuf.TYPES.fixed64:
                            return buffer.readUint64();

                          case ProtoBuf.TYPES.sfixed64:
                            return buffer.readInt64();

                          case ProtoBuf.TYPES.bool:
                            return !!buffer.readVarint32();

                          case ProtoBuf.TYPES.enum:
                            return buffer.readVarint32();

                          case ProtoBuf.TYPES.float:
                            return buffer.readFloat();

                          case ProtoBuf.TYPES.double:
                            return buffer.readDouble();

                          case ProtoBuf.TYPES.string:
                            return buffer.readVString();

                          case ProtoBuf.TYPES.bytes:
                            if (nBytes = buffer.readVarint32(), buffer.remaining() < nBytes) throw Error("Illegal number of bytes for " + this.toString(!0) + ": " + nBytes + " required but got only " + buffer.remaining());
                            return (value = buffer.clone()).limit = value.offset + nBytes, buffer.offset += nBytes, 
                            value;

                          case ProtoBuf.TYPES.message:
                            return nBytes = buffer.readVarint32(), this.resolvedType.decode(buffer, nBytes);

                          case ProtoBuf.TYPES.group:
                            return this.resolvedType.decode(buffer, -1, this.id);
                        }
                        throw Error("[INTERNAL] Illegal wire type for " + this.toString(!0) + ": " + wireType);
                    }, Reflect.Message.Field = Field;
                    var ExtensionField = function(builder, message, rule, type, name, id, options) {
                        Field.call(this, builder, message, rule, type, name, id, options), this.extension;
                    };
                    ExtensionField.prototype = Object.create(Field.prototype), Reflect.Message.ExtensionField = ExtensionField, 
                    Reflect.Message.OneOf = function(builder, message, name) {
                        T.call(this, builder, message, name), this.fields = [];
                    };
                    var Enum = function(builder, parent, name, options) {
                        Namespace.call(this, builder, parent, name, options), this.className = "Enum", this.object = null;
                    };
                    (Enum.prototype = Object.create(Namespace.prototype)).build = function() {
                        for (var enm = {}, values = this.getChildren(Enum.Value), i = 0, k = values.length; i < k; ++i) enm[values[i].name] = values[i].id;
                        return Object.defineProperty && Object.defineProperty(enm, "$options", {
                            value: this.buildOpt()
                        }), this.object = enm;
                    }, Reflect.Enum = Enum;
                    var Value = function(builder, enm, name, id) {
                        T.call(this, builder, enm, name), this.className = "Enum.Value", this.id = id;
                    };
                    Value.prototype = Object.create(T.prototype), Reflect.Enum.Value = Value;
                    var Extension = function(builder, parent, name, field) {
                        T.call(this, builder, parent, name), this.field = field;
                    };
                    Extension.prototype = Object.create(T.prototype), Reflect.Extension = Extension;
                    var Service = function(builder, root, name, options) {
                        Namespace.call(this, builder, root, name, options), this.className = "Service", 
                        this.clazz = null;
                    };
                    (Service.prototype = Object.create(Namespace.prototype)).build = function(rebuild) {
                        return this.clazz && !rebuild ? this.clazz : this.clazz = (function(ProtoBuf, T) {
                            var Service = function(rpcImpl) {
                                ProtoBuf.Builder.Service.call(this), this.rpcImpl = rpcImpl || function(name, msg, callback) {
                                    setTimeout(callback.bind(this, Error("Not implemented, see: https://github.com/dcodeIO/ProtoBuf.js/wiki/Services")), 0);
                                };
                            }, ServicePrototype = Service.prototype = Object.create(ProtoBuf.Builder.Service.prototype);
                            Object.defineProperty && (Object.defineProperty(Service, "$options", {
                                value: T.buildOpt()
                            }), Object.defineProperty(ServicePrototype, "$options", {
                                value: Service.$options
                            }));
                            for (var rpc = T.getChildren(ProtoBuf.Reflect.Service.RPCMethod), i = 0; i < rpc.length; i++) !(function(method) {
                                ServicePrototype[method.name] = function(req, callback) {
                                    try {
                                        if (!(req && req instanceof method.resolvedRequestType.clazz)) return void setTimeout(callback.bind(this, Error("Illegal request type provided to service method " + T.name + "#" + method.name)), 0);
                                        this.rpcImpl(method.fqn(), req, (function(err, res) {
                                            if (err) callback(err); else {
                                                try {
                                                    res = method.resolvedResponseType.clazz.decode(res);
                                                } catch (notABuffer) {}
                                                res && res instanceof method.resolvedResponseType.clazz ? callback(null, res) : callback(Error("Illegal response type received in service method " + T.name + "#" + method.name));
                                            }
                                        }));
                                    } catch (err) {
                                        setTimeout(callback.bind(this, err), 0);
                                    }
                                }, Service[method.name] = function(rpcImpl, req, callback) {
                                    new Service(rpcImpl)[method.name](req, callback);
                                }, Object.defineProperty && (Object.defineProperty(Service[method.name], "$options", {
                                    value: method.buildOpt()
                                }), Object.defineProperty(ServicePrototype[method.name], "$options", {
                                    value: Service[method.name].$options
                                }));
                            })(rpc[i]);
                            return Service;
                        })(ProtoBuf, this);
                    }, Reflect.Service = Service;
                    var Method = function(builder, svc, name, options) {
                        T.call(this, builder, svc, name), this.className = "Service.Method", this.options = options || {};
                    };
                    (Method.prototype = Object.create(T.prototype)).buildOpt = NamespacePrototype.buildOpt, 
                    Reflect.Service.Method = Method;
                    var RPCMethod = function(builder, svc, name, request, response, options) {
                        Method.call(this, builder, svc, name, options), this.className = "Service.RPCMethod", 
                        this.requestName = request, this.responseName = response, this.resolvedRequestType = null, 
                        this.resolvedResponseType = null;
                    };
                    return RPCMethod.prototype = Object.create(Method.prototype), Reflect.Service.RPCMethod = RPCMethod, 
                    Reflect;
                })(ProtoBuf), ProtoBuf.Builder = (function(ProtoBuf, Lang, Reflect) {
                    var Builder = function(options) {
                        this.ns = new Reflect.Namespace(this, null, ""), this.ptr = this.ns, this.resolved = !1, 
                        this.result = null, this.files = {}, this.importRoot = null, this.options = options || {};
                    }, BuilderPrototype = Builder.prototype;
                    return BuilderPrototype.reset = function() {
                        this.ptr = this.ns;
                    }, BuilderPrototype.define = function(pkg, options) {
                        if ("string" != typeof pkg || !Lang.TYPEREF.test(pkg)) throw Error("Illegal package: " + pkg);
                        var i, part = pkg.split(".");
                        for (i = 0; i < part.length; i++) if (!Lang.NAME.test(part[i])) throw Error("Illegal package: " + part[i]);
                        for (i = 0; i < part.length; i++) null === this.ptr.getChild(part[i]) && this.ptr.addChild(new Reflect.Namespace(this, this.ptr, part[i], options)), 
                        this.ptr = this.ptr.getChild(part[i]);
                        return this;
                    }, Builder.isValidMessage = function(def) {
                        if ("string" != typeof def.name || !Lang.NAME.test(def.name)) return !1;
                        if (void 0 !== def.values || void 0 !== def.rpc) return !1;
                        var i;
                        if (void 0 !== def.fields) {
                            if (!ProtoBuf.Util.isArray(def.fields)) return !1;
                            var id, ids = [];
                            for (i = 0; i < def.fields.length; i++) {
                                if (!Builder.isValidMessageField(def.fields[i])) return !1;
                                if (id = parseInt(def.fields[i].id, 10), ids.indexOf(id) >= 0) return !1;
                                ids.push(id);
                            }
                            ids = null;
                        }
                        if (void 0 !== def.enums) {
                            if (!ProtoBuf.Util.isArray(def.enums)) return !1;
                            for (i = 0; i < def.enums.length; i++) if (!Builder.isValidEnum(def.enums[i])) return !1;
                        }
                        if (void 0 !== def.messages) {
                            if (!ProtoBuf.Util.isArray(def.messages)) return !1;
                            for (i = 0; i < def.messages.length; i++) if (!Builder.isValidMessage(def.messages[i]) && !Builder.isValidExtend(def.messages[i])) return !1;
                        }
                        return !!(void 0 === def.extensions || ProtoBuf.Util.isArray(def.extensions) && 2 === def.extensions.length && "number" == typeof def.extensions[0] && "number" == typeof def.extensions[1]);
                    }, Builder.isValidMessageField = function(def) {
                        if ("string" != typeof def.rule || "string" != typeof def.name || "string" != typeof def.type || void 0 === def.id) return !1;
                        if (!(Lang.RULE.test(def.rule) && Lang.NAME.test(def.name) && Lang.TYPEREF.test(def.type) && Lang.ID.test("" + def.id))) return !1;
                        if (void 0 !== def.options) {
                            if ("object" != typeof def.options) return !1;
                            for (var key, keys = Object.keys(def.options), i = 0; i < keys.length; i++) if ("string" != typeof (key = keys[i]) || "string" != typeof def.options[key] && "number" != typeof def.options[key] && "boolean" != typeof def.options[key]) return !1;
                        }
                        return !0;
                    }, Builder.isValidEnum = function(def) {
                        if ("string" != typeof def.name || !Lang.NAME.test(def.name)) return !1;
                        if (void 0 === def.values || !ProtoBuf.Util.isArray(def.values) || 0 == def.values.length) return !1;
                        for (var i = 0; i < def.values.length; i++) {
                            if ("object" != typeof def.values[i]) return !1;
                            if ("string" != typeof def.values[i].name || void 0 === def.values[i].id) return !1;
                            if (!Lang.NAME.test(def.values[i].name) || !Lang.NEGID.test("" + def.values[i].id)) return !1;
                        }
                        return !0;
                    }, BuilderPrototype.create = function(defs) {
                        if (!defs) return this;
                        if (ProtoBuf.Util.isArray(defs) || (defs = [ defs ]), 0 == defs.length) return this;
                        var stack = [];
                        for (stack.push(defs); stack.length > 0; ) {
                            if (defs = stack.pop(), !ProtoBuf.Util.isArray(defs)) throw Error("Not a valid namespace: " + JSON.stringify(defs));
                            for (;defs.length > 0; ) {
                                var def = defs.shift();
                                if (Builder.isValidMessage(def)) {
                                    var obj = new Reflect.Message(this, this.ptr, def.name, def.options, def.isGroup), oneofs = {};
                                    if (def.oneofs) for (var keys = Object.keys(def.oneofs), i = 0, k = keys.length; i < k; ++i) obj.addChild(oneofs[keys[i]] = new Reflect.Message.OneOf(this, obj, keys[i]));
                                    if (def.fields && def.fields.length > 0) for (i = 0, k = def.fields.length; i < k; ++i) {
                                        var fld = def.fields[i];
                                        if (null !== obj.getChild(fld.id)) throw Error("Duplicate field id in message " + obj.name + ": " + fld.id);
                                        if (fld.options) for (var opts = Object.keys(fld.options), j = 0, l = opts.length; j < l; ++j) {
                                            if ("string" != typeof opts[j]) throw Error("Illegal field option name in message " + obj.name + "#" + fld.name + ": " + opts[j]);
                                            if ("string" != typeof fld.options[opts[j]] && "number" != typeof fld.options[opts[j]] && "boolean" != typeof fld.options[opts[j]]) throw Error("Illegal field option value in message " + obj.name + "#" + fld.name + "#" + opts[j] + ": " + fld.options[opts[j]]);
                                        }
                                        var oneof = null;
                                        if ("string" == typeof fld.oneof && void 0 === (oneof = oneofs[fld.oneof])) throw Error("Illegal oneof in message " + obj.name + "#" + fld.name + ": " + fld.oneof);
                                        fld = new Reflect.Message.Field(this, obj, fld.rule, fld.type, fld.name, fld.id, fld.options, oneof), 
                                        oneof && oneof.fields.push(fld), obj.addChild(fld);
                                    }
                                    var subObj = [];
                                    if (void 0 !== def.enums && def.enums.length > 0) for (i = 0; i < def.enums.length; i++) subObj.push(def.enums[i]);
                                    if (def.messages && def.messages.length > 0) for (i = 0; i < def.messages.length; i++) subObj.push(def.messages[i]);
                                    if (def.extensions && (obj.extensions = def.extensions, obj.extensions[0] < ProtoBuf.ID_MIN && (obj.extensions[0] = ProtoBuf.ID_MIN), 
                                    obj.extensions[1] > ProtoBuf.ID_MAX && (obj.extensions[1] = ProtoBuf.ID_MAX)), this.ptr.addChild(obj), 
                                    subObj.length > 0) {
                                        stack.push(defs), defs = subObj, subObj = null, this.ptr = obj, obj = null;
                                        continue;
                                    }
                                    subObj = null, obj = null;
                                } else if (Builder.isValidEnum(def)) {
                                    for (obj = new Reflect.Enum(this, this.ptr, def.name, def.options), i = 0; i < def.values.length; i++) obj.addChild(new Reflect.Enum.Value(this, obj, def.values[i].name, def.values[i].id));
                                    this.ptr.addChild(obj), obj = null;
                                } else if (Builder.isValidService(def)) {
                                    for (i in obj = new Reflect.Service(this, this.ptr, def.name, def.options), def.rpc) def.rpc.hasOwnProperty(i) && obj.addChild(new Reflect.Service.RPCMethod(this, obj, i, def.rpc[i].request, def.rpc[i].response, def.rpc[i].options));
                                    this.ptr.addChild(obj), obj = null;
                                } else {
                                    if (!Builder.isValidExtend(def)) throw Error("Not a valid definition: " + JSON.stringify(def));
                                    if (obj = this.ptr.resolve(def.ref)) for (i = 0; i < def.fields.length; i++) {
                                        if (null !== obj.getChild(def.fields[i].id)) throw Error("Duplicate extended field id in message " + obj.name + ": " + def.fields[i].id);
                                        if (def.fields[i].id < obj.extensions[0] || def.fields[i].id > obj.extensions[1]) throw Error("Illegal extended field id in message " + obj.name + ": " + def.fields[i].id + " (" + obj.extensions.join(" to ") + " expected)");
                                        var name = def.fields[i].name;
                                        this.options.convertFieldsToCamelCase && (name = Reflect.Message.Field._toCamelCase(def.fields[i].name)), 
                                        fld = new Reflect.Message.ExtensionField(this, obj, def.fields[i].rule, def.fields[i].type, this.ptr.fqn() + "." + name, def.fields[i].id, def.fields[i].options);
                                        var ext = new Reflect.Extension(this, this.ptr, def.fields[i].name, fld);
                                        fld.extension = ext, this.ptr.addChild(ext), obj.addChild(fld);
                                    } else if (!/\.?google\.protobuf\./.test(def.ref)) throw Error("Extended message " + def.ref + " is not defined");
                                }
                                def = null;
                            }
                            defs = null, this.ptr = this.ptr.parent;
                        }
                        return this.resolved = !1, this.result = null, this;
                    }, BuilderPrototype.import = function(json, filename) {
                        if ("string" == typeof filename) {
                            if (ProtoBuf.Util.IS_NODE && (filename = __webpack_require__(4).resolve(filename)), 
                            !0 === this.files[filename]) return this.reset(), this;
                            this.files[filename] = !0;
                        }
                        if (json.imports && json.imports.length > 0) {
                            var importRoot, delim = "/", resetRoot = !1;
                            "object" == typeof filename ? (this.importRoot = filename.root, resetRoot = !0, 
                            importRoot = this.importRoot, filename = filename.file, (importRoot.indexOf("\\") >= 0 || filename.indexOf("\\") >= 0) && (delim = "\\")) : "string" == typeof filename ? this.importRoot ? importRoot = this.importRoot : filename.indexOf("/") >= 0 ? "" === (importRoot = filename.replace(/\/[^\/]*$/, "")) && (importRoot = "/") : filename.indexOf("\\") >= 0 ? (importRoot = filename.replace(/\\[^\\]*$/, ""), 
                            delim = "\\") : importRoot = "." : importRoot = null;
                            for (var i = 0; i < json.imports.length; i++) if ("string" == typeof json.imports[i]) {
                                if (!importRoot) throw Error("Cannot determine import root: File name is unknown");
                                var importFilename = json.imports[i];
                                if (/^google\/protobuf\//.test(importFilename)) continue;
                                if (importFilename = importRoot + delim + importFilename, !0 === this.files[importFilename]) continue;
                                /\.proto$/i.test(importFilename) && !ProtoBuf.DotProto && (importFilename = importFilename.replace(/\.proto$/, ".json"));
                                var contents = ProtoBuf.Util.fetch(importFilename);
                                if (null === contents) throw Error("Failed to import '" + importFilename + "' in '" + filename + "': File not found");
                                /\.json$/i.test(importFilename) ? this.import(JSON.parse(contents + ""), importFilename) : this.import(new ProtoBuf.DotProto.Parser(contents + "").parse(), importFilename);
                            } else filename ? /\.(\w+)$/.test(filename) ? this.import(json.imports[i], filename.replace(/^(.+)\.(\w+)$/, (function($0, $1, $2) {
                                return $1 + "_import" + i + "." + $2;
                            }))) : this.import(json.imports[i], filename + "_import" + i) : this.import(json.imports[i]);
                            resetRoot && (this.importRoot = null);
                        }
                        return json.messages && (json.package && this.define(json.package, json.options), 
                        this.create(json.messages), this.reset()), json.enums && (json.package && this.define(json.package, json.options), 
                        this.create(json.enums), this.reset()), json.services && (json.package && this.define(json.package, json.options), 
                        this.create(json.services), this.reset()), json.extends && (json.package && this.define(json.package, json.options), 
                        this.create(json.extends), this.reset()), this;
                    }, Builder.isValidService = function(def) {
                        return !("string" != typeof def.name || !Lang.NAME.test(def.name) || "object" != typeof def.rpc);
                    }, Builder.isValidExtend = function(def) {
                        if ("string" != typeof def.ref || !Lang.TYPEREF.test(def.ref)) return !1;
                        var i;
                        if (void 0 !== def.fields) {
                            if (!ProtoBuf.Util.isArray(def.fields)) return !1;
                            var id, ids = [];
                            for (i = 0; i < def.fields.length; i++) {
                                if (!Builder.isValidMessageField(def.fields[i])) return !1;
                                if (id = parseInt(def.id, 10), ids.indexOf(id) >= 0) return !1;
                                ids.push(id);
                            }
                            ids = null;
                        }
                        return !0;
                    }, BuilderPrototype.resolveAll = function() {
                        var res;
                        if (null != this.ptr && "object" != typeof this.ptr.type) {
                            if (this.ptr instanceof Reflect.Namespace) for (var children = this.ptr.children, i = 0, k = children.length; i < k; ++i) this.ptr = children[i], 
                            this.resolveAll(); else if (this.ptr instanceof Reflect.Message.Field) if (Lang.TYPE.test(this.ptr.type)) this.ptr.type = ProtoBuf.TYPES[this.ptr.type]; else {
                                if (!Lang.TYPEREF.test(this.ptr.type)) throw Error("Illegal type reference in " + this.ptr.toString(!0) + ": " + this.ptr.type);
                                if (!(res = (this.ptr instanceof Reflect.Message.ExtensionField ? this.ptr.extension.parent : this.ptr.parent).resolve(this.ptr.type, !0))) throw Error("Unresolvable type reference in " + this.ptr.toString(!0) + ": " + this.ptr.type);
                                if (this.ptr.resolvedType = res, res instanceof Reflect.Enum) this.ptr.type = ProtoBuf.TYPES.enum; else {
                                    if (!(res instanceof Reflect.Message)) throw Error("Illegal type reference in " + this.ptr.toString(!0) + ": " + this.ptr.type);
                                    this.ptr.type = res.isGroup ? ProtoBuf.TYPES.group : ProtoBuf.TYPES.message;
                                }
                            } else if (this.ptr instanceof ProtoBuf.Reflect.Enum.Value) ; else if (this.ptr instanceof ProtoBuf.Reflect.Service.Method) {
                                if (!(this.ptr instanceof ProtoBuf.Reflect.Service.RPCMethod)) throw Error("Illegal service type in " + this.ptr.toString(!0));
                                if (!((res = this.ptr.parent.resolve(this.ptr.requestName)) && res instanceof ProtoBuf.Reflect.Message)) throw Error("Illegal type reference in " + this.ptr.toString(!0) + ": " + this.ptr.requestName);
                                if (this.ptr.resolvedRequestType = res, !((res = this.ptr.parent.resolve(this.ptr.responseName)) && res instanceof ProtoBuf.Reflect.Message)) throw Error("Illegal type reference in " + this.ptr.toString(!0) + ": " + this.ptr.responseName);
                                this.ptr.resolvedResponseType = res;
                            } else if (!(this.ptr instanceof ProtoBuf.Reflect.Message.OneOf || this.ptr instanceof ProtoBuf.Reflect.Extension)) throw Error("Illegal object in namespace: " + typeof this.ptr + ":" + this.ptr);
                            this.reset();
                        }
                    }, BuilderPrototype.build = function(path) {
                        if (this.reset(), this.resolved || (this.resolveAll(), this.resolved = !0, this.result = null), 
                        null == this.result && (this.result = this.ns.build()), path) {
                            for (var part = path.split("."), ptr = this.result, i = 0; i < part.length; i++) {
                                if (!ptr[part[i]]) {
                                    ptr = null;
                                    break;
                                }
                                ptr = ptr[part[i]];
                            }
                            return ptr;
                        }
                        return this.result;
                    }, BuilderPrototype.lookup = function(path) {
                        return path ? this.ns.resolve(path) : this.ns;
                    }, BuilderPrototype.toString = function() {
                        return "Builder";
                    }, Builder.Message = function() {}, Builder.Service = function() {}, Builder;
                })(ProtoBuf, ProtoBuf.Lang, ProtoBuf.Reflect), ProtoBuf.loadProto = function(proto, builder, filename) {
                    return ("string" == typeof builder || builder && "string" == typeof builder.file && "string" == typeof builder.root) && (filename = builder, 
                    builder = void 0), ProtoBuf.loadJson(new ProtoBuf.DotProto.Parser(proto).parse(), builder, filename);
                }, ProtoBuf.protoFromString = ProtoBuf.loadProto, ProtoBuf.loadProtoFile = function(filename, callback, builder) {
                    if (callback && "object" == typeof callback ? (builder = callback, callback = null) : callback && "function" == typeof callback || (callback = null), 
                    callback) return ProtoBuf.Util.fetch("string" == typeof filename ? filename : filename.root + "/" + filename.file, (function(contents) {
                        if (null !== contents) try {
                            callback(null, ProtoBuf.loadProto(contents, builder, filename));
                        } catch (e) {
                            callback(e);
                        } else callback(Error("Failed to fetch file"));
                    }));
                    var contents = ProtoBuf.Util.fetch("object" == typeof filename ? filename.root + "/" + filename.file : filename);
                    return null === contents ? null : ProtoBuf.loadProto(contents, builder, filename);
                }, ProtoBuf.protoFromFile = ProtoBuf.loadProtoFile, ProtoBuf.newBuilder = function(options) {
                    return void 0 === (options = options || {}).convertFieldsToCamelCase && (options.convertFieldsToCamelCase = ProtoBuf.convertFieldsToCamelCase), 
                    void 0 === options.populateAccessors && (options.populateAccessors = ProtoBuf.populateAccessors), 
                    new ProtoBuf.Builder(options);
                }, ProtoBuf.loadJson = function(json, builder, filename) {
                    return ("string" == typeof builder || builder && "string" == typeof builder.file && "string" == typeof builder.root) && (filename = builder, 
                    builder = null), builder && "object" == typeof builder || (builder = ProtoBuf.newBuilder()), 
                    "string" == typeof json && (json = JSON.parse(json)), builder.import(json, filename), 
                    builder.resolveAll(), builder;
                }, ProtoBuf.loadJsonFile = function(filename, callback, builder) {
                    if (callback && "object" == typeof callback ? (builder = callback, callback = null) : callback && "function" == typeof callback || (callback = null), 
                    callback) return ProtoBuf.Util.fetch("string" == typeof filename ? filename : filename.root + "/" + filename.file, (function(contents) {
                        if (null !== contents) try {
                            callback(null, ProtoBuf.loadJson(JSON.parse(contents), builder, filename));
                        } catch (e) {
                            callback(e);
                        } else callback(Error("Failed to fetch file"));
                    }));
                    var contents = ProtoBuf.Util.fetch("object" == typeof filename ? filename.root + "/" + filename.file : filename);
                    return null === contents ? null : ProtoBuf.loadJson(JSON.parse(contents), builder, filename);
                }, ProtoBuf;
            }
            module && "object" == typeof exports && exports ? module.exports = init(__webpack_require__(445)) : (__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(445) ], 
            void 0 === (__WEBPACK_AMD_DEFINE_RESULT__ = "function" == typeof (__WEBPACK_AMD_DEFINE_FACTORY__ = init) ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__) || (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
        })();
    }).call(this, __webpack_require__(62)(module));
}
