function(module, exports, __webpack_require__) {
    (function() {
        var XMLBuilder, XMLFragment, __hasProp = Object.prototype.hasOwnProperty;
        XMLFragment = __webpack_require__(748), XMLBuilder = (function() {
            function XMLBuilder() {
                XMLBuilder.__super__.constructor.call(this, null, "", {}, ""), this.isDoc = !0;
            }
            return (function(child, parent) {
                for (var key in parent) __hasProp.call(parent, key) && (child[key] = parent[key]);
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype, child.prototype = new ctor, child.__super__ = parent.prototype;
            })(XMLBuilder, XMLFragment), XMLBuilder.prototype.begin = function(name, xmldec, doctype, options) {
                var att, child, root;
                if (null == name) throw new Error("Root element needs a name");
                if (this.children = [], name = "" + name || "", null != xmldec && null == xmldec.version) throw new Error("Version number is required");
                if (null != xmldec) {
                    if (xmldec.version = "" + xmldec.version || "", !xmldec.version.match(/1\.[0-9]+/)) throw new Error("Invalid version number: " + xmldec.version);
                    if (att = {
                        version: xmldec.version
                    }, null != xmldec.encoding) {
                        if (xmldec.encoding = "" + xmldec.encoding || "", !xmldec.encoding.match(/[A-Za-z](?:[A-Za-z0-9._-]|-)*/)) throw new Error("Invalid encoding: " + xmldec.encoding);
                        att.encoding = xmldec.encoding;
                    }
                    null != xmldec.standalone && (att.standalone = xmldec.standalone ? "yes" : "no"), 
                    child = new XMLFragment(this, "?xml", att), this.children.push(child);
                }
                return null != doctype && (att = {
                    name: name
                }, null != doctype.ext && (doctype.ext = "" + doctype.ext || "", att.ext = doctype.ext), 
                child = new XMLFragment(this, "!DOCTYPE", att), this.children.push(child)), (root = new XMLFragment(this, name, {})).isRoot = !0, 
                this.children.push(root), root;
            }, XMLBuilder.prototype.toString = function(options) {
                var r, _i, _len, _ref;
                for (r = "", _i = 0, _len = (_ref = this.children).length; _i < _len; _i++) r += _ref[_i].toString(options);
                return r;
            }, XMLBuilder;
        })(), module.exports = XMLBuilder;
    }).call(this);
}
