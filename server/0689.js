function(module, exports, __webpack_require__) {
    (function() {
        "use strict";
        var bom, defaults, events, isEmpty, processItem, processors, sax, setImmediate, bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        }, hasProp = {}.hasOwnProperty;
        sax = __webpack_require__(175), events = __webpack_require__(5), bom = __webpack_require__(690), 
        processors = __webpack_require__(282), setImmediate = __webpack_require__(117).setImmediate, 
        defaults = __webpack_require__(173).defaults, isEmpty = function(thing) {
            return "object" == typeof thing && null != thing && 0 === Object.keys(thing).length;
        }, processItem = function(processors, item, key) {
            var i, len;
            for (i = 0, len = processors.length; i < len; i++) item = (0, processors[i])(item, key);
            return item;
        }, exports.Parser = (function(superClass) {
            function Parser(opts) {
                var key, ref, value;
                if (this.parseString = bind(this.parseString, this), this.reset = bind(this.reset, this), 
                this.assignOrPush = bind(this.assignOrPush, this), this.processAsync = bind(this.processAsync, this), 
                !(this instanceof exports.Parser)) return new exports.Parser(opts);
                for (key in this.options = {}, ref = defaults[.2]) hasProp.call(ref, key) && (value = ref[key], 
                this.options[key] = value);
                for (key in opts) hasProp.call(opts, key) && (value = opts[key], this.options[key] = value);
                this.options.xmlns && (this.options.xmlnskey = this.options.attrkey + "ns"), this.options.normalizeTags && (this.options.tagNameProcessors || (this.options.tagNameProcessors = []), 
                this.options.tagNameProcessors.unshift(processors.normalize)), this.reset();
            }
            return (function(child, parent) {
                for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype, child.prototype = new ctor, child.__super__ = parent.prototype;
            })(Parser, superClass), Parser.prototype.processAsync = function() {
                var chunk, err;
                try {
                    return this.remaining.length <= this.options.chunkSize ? (chunk = this.remaining, 
                    this.remaining = "", this.saxParser = this.saxParser.write(chunk), this.saxParser.close()) : (chunk = this.remaining.substr(0, this.options.chunkSize), 
                    this.remaining = this.remaining.substr(this.options.chunkSize, this.remaining.length), 
                    this.saxParser = this.saxParser.write(chunk), setImmediate(this.processAsync));
                } catch (error1) {
                    if (err = error1, !this.saxParser.errThrown) return this.saxParser.errThrown = !0, 
                    this.emit(err);
                }
            }, Parser.prototype.assignOrPush = function(obj, key, newValue) {
                return key in obj ? (obj[key] instanceof Array || (obj[key] = [ obj[key] ]), obj[key].push(newValue)) : this.options.explicitArray ? obj[key] = [ newValue ] : obj[key] = newValue;
            }, Parser.prototype.reset = function() {
                var attrkey, charkey, ontext, stack, _this;
                return this.removeAllListeners(), this.saxParser = sax.parser(this.options.strict, {
                    trim: !1,
                    normalize: !1,
                    xmlns: this.options.xmlns
                }), this.saxParser.errThrown = !1, this.saxParser.onerror = (_this = this, function(error) {
                    if (_this.saxParser.resume(), !_this.saxParser.errThrown) return _this.saxParser.errThrown = !0, 
                    _this.emit("error", error);
                }), this.saxParser.onend = (function(_this) {
                    return function() {
                        if (!_this.saxParser.ended) return _this.saxParser.ended = !0, _this.emit("end", _this.resultObject);
                    };
                })(this), this.saxParser.ended = !1, this.EXPLICIT_CHARKEY = this.options.explicitCharkey, 
                this.resultObject = null, stack = [], attrkey = this.options.attrkey, charkey = this.options.charkey, 
                this.saxParser.onopentag = (function(_this) {
                    return function(node) {
                        var key, newValue, obj, processedKey, ref;
                        if ((obj = {})[charkey] = "", !_this.options.ignoreAttrs) for (key in ref = node.attributes) hasProp.call(ref, key) && (attrkey in obj || _this.options.mergeAttrs || (obj[attrkey] = {}), 
                        newValue = _this.options.attrValueProcessors ? processItem(_this.options.attrValueProcessors, node.attributes[key], key) : node.attributes[key], 
                        processedKey = _this.options.attrNameProcessors ? processItem(_this.options.attrNameProcessors, key) : key, 
                        _this.options.mergeAttrs ? _this.assignOrPush(obj, processedKey, newValue) : obj[attrkey][processedKey] = newValue);
                        return obj["#name"] = _this.options.tagNameProcessors ? processItem(_this.options.tagNameProcessors, node.name) : node.name, 
                        _this.options.xmlns && (obj[_this.options.xmlnskey] = {
                            uri: node.uri,
                            local: node.local
                        }), stack.push(obj);
                    };
                })(this), this.saxParser.onclosetag = (function(_this) {
                    return function() {
                        var cdata, emptyStr, key, node, nodeName, obj, objClone, old, s, xpath;
                        if (obj = stack.pop(), nodeName = obj["#name"], _this.options.explicitChildren && _this.options.preserveChildrenOrder || delete obj["#name"], 
                        !0 === obj.cdata && (cdata = obj.cdata, delete obj.cdata), s = stack[stack.length - 1], 
                        obj[charkey].match(/^\s*$/) && !cdata ? (emptyStr = obj[charkey], delete obj[charkey]) : (_this.options.trim && (obj[charkey] = obj[charkey].trim()), 
                        _this.options.normalize && (obj[charkey] = obj[charkey].replace(/\s{2,}/g, " ").trim()), 
                        obj[charkey] = _this.options.valueProcessors ? processItem(_this.options.valueProcessors, obj[charkey], nodeName) : obj[charkey], 
                        1 === Object.keys(obj).length && charkey in obj && !_this.EXPLICIT_CHARKEY && (obj = obj[charkey])), 
                        isEmpty(obj) && (obj = "" !== _this.options.emptyTag ? _this.options.emptyTag : emptyStr), 
                        null != _this.options.validator && (xpath = "/" + (function() {
                            var i, len, results;
                            for (results = [], i = 0, len = stack.length; i < len; i++) node = stack[i], results.push(node["#name"]);
                            return results;
                        })().concat(nodeName).join("/"), (function() {
                            var err;
                            try {
                                obj = _this.options.validator(xpath, s && s[nodeName], obj);
                            } catch (error1) {
                                return err = error1, _this.emit("error", err);
                            }
                        })()), _this.options.explicitChildren && !_this.options.mergeAttrs && "object" == typeof obj) if (_this.options.preserveChildrenOrder) {
                            if (s) {
                                for (key in s[_this.options.childkey] = s[_this.options.childkey] || [], objClone = {}, 
                                obj) hasProp.call(obj, key) && (objClone[key] = obj[key]);
                                s[_this.options.childkey].push(objClone), delete obj["#name"], 1 === Object.keys(obj).length && charkey in obj && !_this.EXPLICIT_CHARKEY && (obj = obj[charkey]);
                            }
                        } else node = {}, _this.options.attrkey in obj && (node[_this.options.attrkey] = obj[_this.options.attrkey], 
                        delete obj[_this.options.attrkey]), !_this.options.charsAsChildren && _this.options.charkey in obj && (node[_this.options.charkey] = obj[_this.options.charkey], 
                        delete obj[_this.options.charkey]), Object.getOwnPropertyNames(obj).length > 0 && (node[_this.options.childkey] = obj), 
                        obj = node;
                        return stack.length > 0 ? _this.assignOrPush(s, nodeName, obj) : (_this.options.explicitRoot && (old = obj, 
                        (obj = {})[nodeName] = old), _this.resultObject = obj, _this.saxParser.ended = !0, 
                        _this.emit("end", _this.resultObject));
                    };
                })(this), ontext = (function(_this) {
                    return function(text) {
                        var charChild, s;
                        if (s = stack[stack.length - 1]) return s[charkey] += text, _this.options.explicitChildren && _this.options.preserveChildrenOrder && _this.options.charsAsChildren && (_this.options.includeWhiteChars || "" !== text.replace(/\\n/g, "").trim()) && (s[_this.options.childkey] = s[_this.options.childkey] || [], 
                        (charChild = {
                            "#name": "__text__"
                        })[charkey] = text, _this.options.normalize && (charChild[charkey] = charChild[charkey].replace(/\s{2,}/g, " ").trim()), 
                        s[_this.options.childkey].push(charChild)), s;
                    };
                })(this), this.saxParser.ontext = ontext, this.saxParser.oncdata = function(text) {
                    var s;
                    if (s = ontext(text)) return s.cdata = !0;
                };
            }, Parser.prototype.parseString = function(str, cb) {
                var err;
                null != cb && "function" == typeof cb && (this.on("end", (function(result) {
                    return this.reset(), cb(null, result);
                })), this.on("error", (function(err) {
                    return this.reset(), cb(err);
                })));
                try {
                    return "" === (str = str.toString()).trim() ? (this.emit("end", null), !0) : (str = bom.stripBOM(str), 
                    this.options.async ? (this.remaining = str, setImmediate(this.processAsync), this.saxParser) : this.saxParser.write(str).close());
                } catch (error1) {
                    if (err = error1, !this.saxParser.errThrown && !this.saxParser.ended) return this.emit("error", err), 
                    this.saxParser.errThrown = !0;
                    if (this.saxParser.ended) throw err;
                }
            }, Parser;
        })(events.EventEmitter), exports.parseString = function(str, a, b) {
            var cb, options;
            return null != b ? ("function" == typeof b && (cb = b), "object" == typeof a && (options = a)) : ("function" == typeof a && (cb = a), 
            options = {}), new exports.Parser(options).parseString(str, cb);
        };
    }).call(this);
}
