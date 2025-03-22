function(module, exports) {
    (function() {
        var XMLFragment, __hasProp = Object.prototype.hasOwnProperty;
        XMLFragment = (function() {
            function XMLFragment(parent, name, attributes, text) {
                this.isDoc = !1, this.isRoot = !1, this.parent = parent, this.name = name, this.attributes = attributes, 
                this.value = text, this.children = [];
            }
            return XMLFragment.prototype.element = function(name, attributes, text) {
                var child, key, val, _ref, _ref2;
                if (null == name) throw new Error("Missing element name");
                for (key in name = "" + name || "", this.assertLegalChar(name), null != attributes || (attributes = {}), 
                this.is(attributes, "String") && this.is(text, "Object") ? (attributes = (_ref = [ text, attributes ])[0], 
                text = _ref[1]) : this.is(attributes, "String") && (attributes = (_ref2 = [ {}, attributes ])[0], 
                text = _ref2[1]), attributes) __hasProp.call(attributes, key) && (val = "" + (val = attributes[key]) || "", 
                attributes[key] = this.escape(val));
                return child = new XMLFragment(this, name, attributes), null != text && (text = "" + text || "", 
                text = this.escape(text), this.assertLegalChar(text), child.text(text)), this.children.push(child), 
                child;
            }, XMLFragment.prototype.insertBefore = function(name, attributes, text) {
                var child, i, key, val, _ref, _ref2;
                if (this.isRoot || this.isDoc) throw new Error("Cannot insert elements at root level");
                if (null == name) throw new Error("Missing element name");
                for (key in name = "" + name || "", this.assertLegalChar(name), null != attributes || (attributes = {}), 
                this.is(attributes, "String") && this.is(text, "Object") ? (attributes = (_ref = [ text, attributes ])[0], 
                text = _ref[1]) : this.is(attributes, "String") && (attributes = (_ref2 = [ {}, attributes ])[0], 
                text = _ref2[1]), attributes) __hasProp.call(attributes, key) && (val = "" + (val = attributes[key]) || "", 
                attributes[key] = this.escape(val));
                return child = new XMLFragment(this.parent, name, attributes), null != text && (text = "" + text || "", 
                text = this.escape(text), this.assertLegalChar(text), child.text(text)), i = this.parent.children.indexOf(this), 
                this.parent.children.splice(i, 0, child), child;
            }, XMLFragment.prototype.insertAfter = function(name, attributes, text) {
                var child, i, key, val, _ref, _ref2;
                if (this.isRoot || this.isDoc) throw new Error("Cannot insert elements at root level");
                if (null == name) throw new Error("Missing element name");
                for (key in name = "" + name || "", this.assertLegalChar(name), null != attributes || (attributes = {}), 
                this.is(attributes, "String") && this.is(text, "Object") ? (attributes = (_ref = [ text, attributes ])[0], 
                text = _ref[1]) : this.is(attributes, "String") && (attributes = (_ref2 = [ {}, attributes ])[0], 
                text = _ref2[1]), attributes) __hasProp.call(attributes, key) && (val = "" + (val = attributes[key]) || "", 
                attributes[key] = this.escape(val));
                return child = new XMLFragment(this.parent, name, attributes), null != text && (text = "" + text || "", 
                text = this.escape(text), this.assertLegalChar(text), child.text(text)), i = this.parent.children.indexOf(this), 
                this.parent.children.splice(i + 1, 0, child), child;
            }, XMLFragment.prototype.remove = function() {
                var i;
                if (this.isRoot || this.isDoc) throw new Error("Cannot remove the root element");
                return i = this.parent.children.indexOf(this), [].splice.apply(this.parent.children, [ i, i - i + 1 ].concat([])), 
                this.parent;
            }, XMLFragment.prototype.text = function(value) {
                var child;
                if (null == value) throw new Error("Missing element text");
                return value = "" + value || "", value = this.escape(value), this.assertLegalChar(value), 
                child = new XMLFragment(this, "", {}, value), this.children.push(child), this;
            }, XMLFragment.prototype.cdata = function(value) {
                var child;
                if (null == value) throw new Error("Missing CDATA text");
                if (value = "" + value || "", this.assertLegalChar(value), value.match(/]]>/)) throw new Error("Invalid CDATA text: " + value);
                return child = new XMLFragment(this, "", {}, "<![CDATA[" + value + "]]>"), this.children.push(child), 
                this;
            }, XMLFragment.prototype.comment = function(value) {
                var child;
                if (null == value) throw new Error("Missing comment text");
                if (value = "" + value || "", value = this.escape(value), this.assertLegalChar(value), 
                value.match(/--/)) throw new Error("Comment text cannot contain double-hypen: " + value);
                return child = new XMLFragment(this, "", {}, "\x3c!-- " + value + " --\x3e"), this.children.push(child), 
                this;
            }, XMLFragment.prototype.raw = function(value) {
                var child;
                if (null == value) throw new Error("Missing raw text");
                return child = new XMLFragment(this, "", {}, value = "" + value || ""), this.children.push(child), 
                this;
            }, XMLFragment.prototype.up = function() {
                if (this.isRoot) throw new Error("This node has no parent. Use doc() if you need to get the document object.");
                return this.parent;
            }, XMLFragment.prototype.root = function() {
                var child;
                if (this.isRoot) return this;
                for (child = this.parent; !child.isRoot; ) child = child.parent;
                return child;
            }, XMLFragment.prototype.document = function() {
                var child;
                if (this.isDoc) return this;
                for (child = this.parent; !child.isDoc; ) child = child.parent;
                return child;
            }, XMLFragment.prototype.prev = function() {
                var i;
                if (this.isRoot || this.isDoc) throw new Error("Root node has no siblings");
                if ((i = this.parent.children.indexOf(this)) < 1) throw new Error("Already at the first node");
                return this.parent.children[i - 1];
            }, XMLFragment.prototype.next = function() {
                var i;
                if (this.isRoot || this.isDoc) throw new Error("Root node has no siblings");
                if (-1 === (i = this.parent.children.indexOf(this)) || i === this.parent.children.length - 1) throw new Error("Already at the last node");
                return this.parent.children[i + 1];
            }, XMLFragment.prototype.attribute = function(name, value) {
                if (null == name) throw new Error("Missing attribute name");
                if (null == value) throw new Error("Missing attribute value");
                return name = "" + name || "", value = "" + value || "", null != this.attributes || (this.attributes = {}), 
                this.attributes[name] = this.escape(value), this;
            }, XMLFragment.prototype.removeAttribute = function(name) {
                if (null == name) throw new Error("Missing attribute name");
                return name = "" + name || "", delete this.attributes[name], this;
            }, XMLFragment.prototype.toString = function(options, level) {
                var attName, attValue, indent, newline, pretty, r, space, _i, _len, _ref, _ref2;
                for (attName in pretty = null != options && options.pretty || !1, indent = null != options && options.indent || "  ", 
                newline = null != options && options.newline || "\n", level || (level = 0), space = new Array(level + 1).join(indent), 
                r = "", pretty && (r += space), this.value ? r += "" + this.value : r += "<" + this.name, 
                _ref = this.attributes) attValue = _ref[attName], "!DOCTYPE" === this.name ? r += " " + attValue : r += " " + attName + '="' + attValue + '"';
                if (0 === this.children.length) this.value || (r += "?xml" === this.name ? "?>" : "!DOCTYPE" === this.name ? ">" : "/>"), 
                pretty && (r += newline); else if (pretty && 1 === this.children.length && this.children[0].value) r += ">", 
                r += this.children[0].value, r += "</" + this.name + ">", r += newline; else {
                    for (r += ">", pretty && (r += newline), _i = 0, _len = (_ref2 = this.children).length; _i < _len; _i++) r += _ref2[_i].toString(options, level + 1);
                    pretty && (r += space), r += "</" + this.name + ">", pretty && (r += newline);
                }
                return r;
            }, XMLFragment.prototype.escape = function(str) {
                return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&apos;").replace(/"/g, "&quot;");
            }, XMLFragment.prototype.assertLegalChar = function(str) {
                var chars, chr;
                if (chars = /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE-\uFFFF]/, 
                chr = str.match(chars)) throw new Error("Invalid character (" + chr + ") in string: " + str);
            }, XMLFragment.prototype.is = function(obj, type) {
                var clas;
                return clas = Object.prototype.toString.call(obj).slice(8, -1), null != obj && clas === type;
            }, XMLFragment.prototype.ele = function(name, attributes, text) {
                return this.element(name, attributes, text);
            }, XMLFragment.prototype.txt = function(value) {
                return this.text(value);
            }, XMLFragment.prototype.dat = function(value) {
                return this.cdata(value);
            }, XMLFragment.prototype.att = function(name, value) {
                return this.attribute(name, value);
            }, XMLFragment.prototype.com = function(value) {
                return this.comment(value);
            }, XMLFragment.prototype.doc = function() {
                return this.document();
            }, XMLFragment.prototype.e = function(name, attributes, text) {
                return this.element(name, attributes, text);
            }, XMLFragment.prototype.t = function(value) {
                return this.text(value);
            }, XMLFragment.prototype.d = function(value) {
                return this.cdata(value);
            }, XMLFragment.prototype.a = function(name, value) {
                return this.attribute(name, value);
            }, XMLFragment.prototype.c = function(value) {
                return this.comment(value);
            }, XMLFragment.prototype.r = function(value) {
                return this.raw(value);
            }, XMLFragment.prototype.u = function() {
                return this.up();
            }, XMLFragment;
        })(), module.exports = XMLFragment;
    }).call(this);
}
