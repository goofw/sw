function(module, exports, __webpack_require__) {
    "use strict";
    var Negotiator = __webpack_require__(983), mime = __webpack_require__(89);
    function Accepts(req) {
        if (!(this instanceof Accepts)) return new Accepts(req);
        this.headers = req.headers, this.negotiator = new Negotiator(req);
    }
    function extToMime(type) {
        return -1 === type.indexOf("/") ? mime.lookup(type) : type;
    }
    function validMime(type) {
        return "string" == typeof type;
    }
    module.exports = Accepts, Accepts.prototype.type = Accepts.prototype.types = function(types_) {
        var types = types_;
        if (types && !Array.isArray(types)) {
            types = new Array(arguments.length);
            for (var i = 0; i < types.length; i++) types[i] = arguments[i];
        }
        if (!types || 0 === types.length) return this.negotiator.mediaTypes();
        if (!this.headers.accept) return types[0];
        var mimes = types.map(extToMime), accepts = this.negotiator.mediaTypes(mimes.filter(validMime)), first = accepts[0];
        return !!first && types[mimes.indexOf(first)];
    }, Accepts.prototype.encoding = Accepts.prototype.encodings = function(encodings_) {
        var encodings = encodings_;
        if (encodings && !Array.isArray(encodings)) {
            encodings = new Array(arguments.length);
            for (var i = 0; i < encodings.length; i++) encodings[i] = arguments[i];
        }
        return encodings && 0 !== encodings.length ? this.negotiator.encodings(encodings)[0] || !1 : this.negotiator.encodings();
    }, Accepts.prototype.charset = Accepts.prototype.charsets = function(charsets_) {
        var charsets = charsets_;
        if (charsets && !Array.isArray(charsets)) {
            charsets = new Array(arguments.length);
            for (var i = 0; i < charsets.length; i++) charsets[i] = arguments[i];
        }
        return charsets && 0 !== charsets.length ? this.negotiator.charsets(charsets)[0] || !1 : this.negotiator.charsets();
    }, Accepts.prototype.lang = Accepts.prototype.langs = Accepts.prototype.language = Accepts.prototype.languages = function(languages_) {
        var languages = languages_;
        if (languages && !Array.isArray(languages)) {
            languages = new Array(arguments.length);
            for (var i = 0; i < languages.length; i++) languages[i] = arguments[i];
        }
        return languages && 0 !== languages.length ? this.negotiator.languages(languages)[0] || !1 : this.negotiator.languages();
    };
}
