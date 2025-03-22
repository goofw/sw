function(module, exports) {
    (function() {
        var hasProp = {}.hasOwnProperty;
        module.exports = (function() {
            function XMLWriterBase(options) {
                var key, ref, ref1, ref2, ref3, ref4, ref5, ref6, value;
                for (key in options || (options = {}), this.pretty = options.pretty || !1, this.allowEmpty = null != (ref = options.allowEmpty) && ref, 
                this.pretty ? (this.indent = null != (ref1 = options.indent) ? ref1 : "  ", this.newline = null != (ref2 = options.newline) ? ref2 : "\n", 
                this.offset = null != (ref3 = options.offset) ? ref3 : 0, this.dontprettytextnodes = null != (ref4 = options.dontprettytextnodes) ? ref4 : 0) : (this.indent = "", 
                this.newline = "", this.offset = 0, this.dontprettytextnodes = 0), this.spacebeforeslash = null != (ref5 = options.spacebeforeslash) ? ref5 : "", 
                !0 === this.spacebeforeslash && (this.spacebeforeslash = " "), this.newlinedefault = this.newline, 
                this.prettydefault = this.pretty, ref6 = options.writer || {}) hasProp.call(ref6, key) && (value = ref6[key], 
                this[key] = value);
            }
            return XMLWriterBase.prototype.set = function(options) {
                var key, ref, value;
                for (key in options || (options = {}), "pretty" in options && (this.pretty = options.pretty), 
                "allowEmpty" in options && (this.allowEmpty = options.allowEmpty), this.pretty ? (this.indent = "indent" in options ? options.indent : "  ", 
                this.newline = "newline" in options ? options.newline : "\n", this.offset = "offset" in options ? options.offset : 0, 
                this.dontprettytextnodes = "dontprettytextnodes" in options ? options.dontprettytextnodes : 0) : (this.indent = "", 
                this.newline = "", this.offset = 0, this.dontprettytextnodes = 0), this.spacebeforeslash = "spacebeforeslash" in options ? options.spacebeforeslash : "", 
                !0 === this.spacebeforeslash && (this.spacebeforeslash = " "), this.newlinedefault = this.newline, 
                this.prettydefault = this.pretty, ref = options.writer || {}) hasProp.call(ref, key) && (value = ref[key], 
                this[key] = value);
                return this;
            }, XMLWriterBase.prototype.space = function(level) {
                var indent;
                return this.pretty && (indent = (level || 0) + this.offset + 1) > 0 ? new Array(indent).join(this.indent) : "";
            }, XMLWriterBase;
        })();
    }).call(this);
}
