function(module, exports, __webpack_require__) {
    "use strict";
    var schema = __webpack_require__(13), tools = __webpack_require__(75);
    module.exports = {
        addAttribute: function(proto, ebmlName) {
            var ebmlID = schema.byName[ebmlName];
            if (!ebmlID) throw new Error("Invalid ebmlName '" + ebmlName + "'");
            var schemaInfo = schema.byEbmlID[ebmlID], type = schemaInfo.type, name = ebmlName, ret = /^([A-Z])([a-z].*)$/.exec(name);
            ret && (name = ret[1].toLowerCase() + ret[2]), Object.defineProperty(proto, name, {
                iterable: !0,
                get: function() {
                    var child = this.getFirstChildByName(ebmlID);
                    if (child) return "ebmlID" === schemaInfo.type2 ? child.getUInt() : child.getValue();
                },
                set: function(value) {
                    var child = this.getFirstChildByName(ebmlID);
                    if (child || (child = this.ownerDocument.createElement(ebmlID), this.appendChild(child)), 
                    "ebmlID" === schemaInfo.type2) child.setTargetEbmlID(value); else if (schemaInfo.position) child.setTargetPosition(value); else {
                        try {
                            value = tools.validType(type, value);
                        } catch (x) {
                            throw x;
                        }
                        child.setValue(value);
                    }
                    return this;
                }
            }), Object.defineProperty(proto, "$$" + name, {
                iterable: !1,
                get: function() {
                    return this.getFirstChildByName(ebmlID);
                }
            }), proto["get" + ebmlName] = function() {
                var child = this.getFirstChildByName(ebmlID);
                return child || (child = this.ownerDocument.createElement(ebmlID), this.appendChild(child), 
                child);
            };
        },
        addChild: function(proto, ebmlName) {
            var ebmlID = schema.byName[ebmlName];
            if (!ebmlID) throw new Error("Invalid ebmlName '" + ebmlName + "'");
            var name = ebmlName;
            (ret = /^([A-Z])([a-z].*)$/.exec(name)) && (name = ret[1].toLowerCase() + ret[2]);
            var ret, names = name;
            names = (ret = /(.*)y$/.exec(names)) ? ret[1] + "ies" : name + "s", Object.defineProperty(proto, names, {
                iterable: !0,
                get: function() {
                    return this.listChildrenByName(ebmlID);
                }
            }), Object.defineProperty(proto, name, {
                iterable: !0,
                get: function() {
                    return this.getFirstChildByName(ebmlID);
                }
            }), Object.defineProperty(proto, "$" + name, {
                iterable: !0,
                get: function() {
                    var child = this.getFirstChildByName(ebmlID);
                    return child || (child = this.ownerDocument.createElement(ebmlID), this.appendChild(child), 
                    child);
                }
            }), proto["new" + ebmlName] = function() {
                var child = this.ownerDocument.createElement(ebmlID);
                return this.appendChild(child), child;
            }, proto["add" + ebmlName] = function(value) {
                var child = this.ownerDocument.createElement(ebmlID);
                return this.appendChild(child), child.setValue(value), child;
            };
        },
        oneChild: function(proto, ebmlName) {
            var ebmlID = schema.byName[ebmlName];
            if (!ebmlID) throw new Error("Invalid ebmlName '" + ebmlName + "'");
            var name = ebmlName, ret = /^([A-Z])([a-z].*)$/.exec(name);
            ret && (name = ret[1].toLowerCase() + ret[2]), Object.defineProperty(proto, name, {
                iterable: !0,
                get: function() {
                    return this.getFirstChildByName(ebmlID);
                }
            }), Object.defineProperty(proto, "$" + name, {
                iterable: !0,
                get: function() {
                    var child = this.getFirstChildByName(ebmlID);
                    return child || (child = this.ownerDocument.createElement(ebmlID), this.appendChild(child), 
                    child);
                }
            }), proto["set" + ebmlName] = function() {
                var old = this.getFirstChildByName(name);
                old && old.remove();
                var child = this.ownerDocument.createElement(ebmlID);
                return this.appendChild(child), child;
            };
        }
    };
}
