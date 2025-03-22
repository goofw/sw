function(module, exports, __webpack_require__) {
    (function() {
        "use strict";
        var builder, defaults, escapeCDATA, requiresCDATA, wrapCDATA, hasProp = {}.hasOwnProperty;
        builder = __webpack_require__(685), defaults = __webpack_require__(173).defaults, 
        requiresCDATA = function(entry) {
            return "string" == typeof entry && (entry.indexOf("&") >= 0 || entry.indexOf(">") >= 0 || entry.indexOf("<") >= 0);
        }, wrapCDATA = function(entry) {
            return "<![CDATA[" + escapeCDATA(entry) + "]]>";
        }, escapeCDATA = function(entry) {
            return entry.replace("]]>", "]]]]><![CDATA[>");
        }, exports.Builder = (function() {
            function Builder(opts) {
                var key, ref, value;
                for (key in this.options = {}, ref = defaults[.2]) hasProp.call(ref, key) && (value = ref[key], 
                this.options[key] = value);
                for (key in opts) hasProp.call(opts, key) && (value = opts[key], this.options[key] = value);
            }
            return Builder.prototype.buildObject = function(rootObj) {
                var attrkey, charkey, render, rootElement, rootName, _this;
                return attrkey = this.options.attrkey, charkey = this.options.charkey, 1 === Object.keys(rootObj).length && this.options.rootName === defaults[.2].rootName ? rootObj = rootObj[rootName = Object.keys(rootObj)[0]] : rootName = this.options.rootName, 
                _this = this, render = function(element, obj) {
                    var attr, child, entry, index, key, value;
                    if ("object" != typeof obj) _this.options.cdata && requiresCDATA(obj) ? element.raw(wrapCDATA(obj)) : element.txt(obj); else if (Array.isArray(obj)) {
                        for (index in obj) if (hasProp.call(obj, index)) for (key in child = obj[index]) entry = child[key], 
                        element = render(element.ele(key), entry).up();
                    } else for (key in obj) if (hasProp.call(obj, key)) if (child = obj[key], key === attrkey) {
                        if ("object" == typeof child) for (attr in child) value = child[attr], element = element.att(attr, value);
                    } else if (key === charkey) element = _this.options.cdata && requiresCDATA(child) ? element.raw(wrapCDATA(child)) : element.txt(child); else if (Array.isArray(child)) for (index in child) hasProp.call(child, index) && (element = "string" == typeof (entry = child[index]) ? _this.options.cdata && requiresCDATA(entry) ? element.ele(key).raw(wrapCDATA(entry)).up() : element.ele(key, entry).up() : render(element.ele(key), entry).up()); else "object" == typeof child ? element = render(element.ele(key), child).up() : "string" == typeof child && _this.options.cdata && requiresCDATA(child) ? element = element.ele(key).raw(wrapCDATA(child)).up() : (null == child && (child = ""), 
                    element = element.ele(key, child.toString()).up());
                    return element;
                }, rootElement = builder.create(rootName, this.options.xmldec, this.options.doctype, {
                    headless: this.options.headless,
                    allowSurrogateChars: this.options.allowSurrogateChars
                }), render(rootElement, rootObj).end(this.options.renderOpts);
            }, Builder;
        })();
    }).call(this);
}
