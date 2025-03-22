function(module, exports, __webpack_require__) {
    "use strict";
    var modules = Object.create(null);
    function Negotiator(request) {
        if (!(this instanceof Negotiator)) return new Negotiator(request);
        this.request = request;
    }
    function loadModule(moduleName) {
        var module = modules[moduleName];
        if (void 0 !== module) return module;
        switch (moduleName) {
          case "charset":
            module = __webpack_require__(984);
            break;

          case "encoding":
            module = __webpack_require__(985);
            break;

          case "language":
            module = __webpack_require__(986);
            break;

          case "mediaType":
            module = __webpack_require__(987);
            break;

          default:
            throw new Error("Cannot find module '" + moduleName + "'");
        }
        return modules[moduleName] = module, module;
    }
    module.exports = Negotiator, module.exports.Negotiator = Negotiator, Negotiator.prototype.charset = function(available) {
        var set = this.charsets(available);
        return set && set[0];
    }, Negotiator.prototype.charsets = function(available) {
        return (0, loadModule("charset").preferredCharsets)(this.request.headers["accept-charset"], available);
    }, Negotiator.prototype.encoding = function(available) {
        var set = this.encodings(available);
        return set && set[0];
    }, Negotiator.prototype.encodings = function(available) {
        return (0, loadModule("encoding").preferredEncodings)(this.request.headers["accept-encoding"], available);
    }, Negotiator.prototype.language = function(available) {
        var set = this.languages(available);
        return set && set[0];
    }, Negotiator.prototype.languages = function(available) {
        return (0, loadModule("language").preferredLanguages)(this.request.headers["accept-language"], available);
    }, Negotiator.prototype.mediaType = function(available) {
        var set = this.mediaTypes(available);
        return set && set[0];
    }, Negotiator.prototype.mediaTypes = function(available) {
        return (0, loadModule("mediaType").preferredMediaTypes)(this.request.headers.accept, available);
    }, Negotiator.prototype.preferredCharset = Negotiator.prototype.charset, Negotiator.prototype.preferredCharsets = Negotiator.prototype.charsets, 
    Negotiator.prototype.preferredEncoding = Negotiator.prototype.encoding, Negotiator.prototype.preferredEncodings = Negotiator.prototype.encodings, 
    Negotiator.prototype.preferredLanguage = Negotiator.prototype.language, Negotiator.prototype.preferredLanguages = Negotiator.prototype.languages, 
    Negotiator.prototype.preferredMediaType = Negotiator.prototype.mediaType, Negotiator.prototype.preferredMediaTypes = Negotiator.prototype.mediaTypes;
}
