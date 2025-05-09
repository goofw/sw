function(module, exports, __webpack_require__) {
    "use strict";
    var qs = __webpack_require__(493), querystring = __webpack_require__(28);
    function Querystring(request) {
        this.request = request, this.lib = null, this.useQuerystring = null, this.parseOptions = null, 
        this.stringifyOptions = null;
    }
    Querystring.prototype.init = function(options) {
        this.lib || (this.useQuerystring = options.useQuerystring, this.lib = this.useQuerystring ? querystring : qs, 
        this.parseOptions = options.qsParseOptions || {}, this.stringifyOptions = options.qsStringifyOptions || {});
    }, Querystring.prototype.stringify = function(obj) {
        return this.useQuerystring ? this.rfc3986(this.lib.stringify(obj, this.stringifyOptions.sep || null, this.stringifyOptions.eq || null, this.stringifyOptions)) : this.lib.stringify(obj, this.stringifyOptions);
    }, Querystring.prototype.parse = function(str) {
        return this.useQuerystring ? this.lib.parse(str, this.parseOptions.sep || null, this.parseOptions.eq || null, this.parseOptions) : this.lib.parse(str, this.parseOptions);
    }, Querystring.prototype.rfc3986 = function(str) {
        return str.replace(/[!'()*]/g, (function(c) {
            return "%" + c.charCodeAt(0).toString(16).toUpperCase();
        }));
    }, Querystring.prototype.unescape = querystring.unescape, exports.Querystring = Querystring;
}
