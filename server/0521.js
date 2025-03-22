function(module, exports, __webpack_require__) {
    "use strict";
    function PrependBOMWrapper(encoder, options) {
        this.encoder = encoder, this.addBOM = !0;
    }
    function StripBOMWrapper(decoder, options) {
        this.decoder = decoder, this.pass = !1, this.options = options || {};
    }
    exports.PrependBOM = PrependBOMWrapper, PrependBOMWrapper.prototype.write = function(str) {
        return this.addBOM && (str = "\ufeff" + str, this.addBOM = !1), this.encoder.write(str);
    }, PrependBOMWrapper.prototype.end = function() {
        return this.encoder.end();
    }, exports.StripBOM = StripBOMWrapper, StripBOMWrapper.prototype.write = function(buf) {
        var res = this.decoder.write(buf);
        return this.pass || !res || ("\ufeff" === res[0] && (res = res.slice(1), "function" == typeof this.options.stripBOM && this.options.stripBOM()), 
        this.pass = !0), res;
    }, StripBOMWrapper.prototype.end = function() {
        return this.decoder.end();
    };
}
