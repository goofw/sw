function(module, exports) {
    (function() {
        var hasProp = {}.hasOwnProperty;
        module.exports = (function() {
            function XMLStringifier(options) {
                var fn, me, key, ref, value;
                for (key in this.assertLegalChar = (fn = this.assertLegalChar, me = this, function() {
                    return fn.apply(me, arguments);
                }), options || (options = {}), this.noDoubleEncoding = options.noDoubleEncoding, 
                ref = options.stringify || {}) hasProp.call(ref, key) && (value = ref[key], this[key] = value);
            }
            return XMLStringifier.prototype.eleName = function(val) {
                return val = "" + val || "", this.assertLegalChar(val);
            }, XMLStringifier.prototype.eleText = function(val) {
                return val = "" + val || "", this.assertLegalChar(this.elEscape(val));
            }, XMLStringifier.prototype.cdata = function(val) {
                return val = (val = "" + val || "").replace("]]>", "]]]]><![CDATA[>"), this.assertLegalChar(val);
            }, XMLStringifier.prototype.comment = function(val) {
                if ((val = "" + val || "").match(/--/)) throw new Error("Comment text cannot contain double-hypen: " + val);
                return this.assertLegalChar(val);
            }, XMLStringifier.prototype.raw = function(val) {
                return "" + val || "";
            }, XMLStringifier.prototype.attName = function(val) {
                return "" + val || "";
            }, XMLStringifier.prototype.attValue = function(val) {
                return val = "" + val || "", this.attEscape(val);
            }, XMLStringifier.prototype.insTarget = function(val) {
                return "" + val || "";
            }, XMLStringifier.prototype.insValue = function(val) {
                if ((val = "" + val || "").match(/\?>/)) throw new Error("Invalid processing instruction value: " + val);
                return val;
            }, XMLStringifier.prototype.xmlVersion = function(val) {
                if (!(val = "" + val || "").match(/1\.[0-9]+/)) throw new Error("Invalid version number: " + val);
                return val;
            }, XMLStringifier.prototype.xmlEncoding = function(val) {
                if (!(val = "" + val || "").match(/^[A-Za-z](?:[A-Za-z0-9._-])*$/)) throw new Error("Invalid encoding: " + val);
                return val;
            }, XMLStringifier.prototype.xmlStandalone = function(val) {
                return val ? "yes" : "no";
            }, XMLStringifier.prototype.dtdPubID = function(val) {
                return "" + val || "";
            }, XMLStringifier.prototype.dtdSysID = function(val) {
                return "" + val || "";
            }, XMLStringifier.prototype.dtdElementValue = function(val) {
                return "" + val || "";
            }, XMLStringifier.prototype.dtdAttType = function(val) {
                return "" + val || "";
            }, XMLStringifier.prototype.dtdAttDefault = function(val) {
                return null != val ? "" + val || "" : val;
            }, XMLStringifier.prototype.dtdEntityValue = function(val) {
                return "" + val || "";
            }, XMLStringifier.prototype.dtdNData = function(val) {
                return "" + val || "";
            }, XMLStringifier.prototype.convertAttKey = "@", XMLStringifier.prototype.convertPIKey = "?", 
            XMLStringifier.prototype.convertTextKey = "#text", XMLStringifier.prototype.convertCDataKey = "#cdata", 
            XMLStringifier.prototype.convertCommentKey = "#comment", XMLStringifier.prototype.convertRawKey = "#raw", 
            XMLStringifier.prototype.assertLegalChar = function(str) {
                var res;
                if (res = str.match(/[\0\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/)) throw new Error("Invalid character in string: " + str + " at index " + res.index);
                return str;
            }, XMLStringifier.prototype.elEscape = function(str) {
                var ampregex;
                return ampregex = this.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g, str.replace(ampregex, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r/g, "&#xD;");
            }, XMLStringifier.prototype.attEscape = function(str) {
                var ampregex;
                return ampregex = this.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g, str.replace(ampregex, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/\t/g, "&#x9;").replace(/\n/g, "&#xA;").replace(/\r/g, "&#xD;");
            }, XMLStringifier;
        })();
    }).call(this);
}
