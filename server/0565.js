function(module, exports, __webpack_require__) {
    __webpack_require__(4);
    var fs = __webpack_require__(2);
    function Mime() {
        this.types = Object.create(null), this.extensions = Object.create(null);
    }
    Mime.prototype.define = function(map) {
        for (var type in map) {
            for (var exts = map[type], i = 0; i < exts.length; i++) process.env.DEBUG_MIME && this.types[exts[i]] && console.warn((this._loading || "define()").replace(/.*\//, ""), 'changes "' + exts[i] + '" extension type from ' + this.types[exts[i]] + " to " + type), 
            this.types[exts[i]] = type;
            this.extensions[type] || (this.extensions[type] = exts[0]);
        }
    }, Mime.prototype.load = function(file) {
        this._loading = file;
        var map = {};
        fs.readFileSync(file, "ascii").split(/[\r\n]+/).forEach((function(line) {
            var fields = line.replace(/\s*#.*|^\s*|\s*$/g, "").split(/\s+/);
            map[fields.shift()] = fields;
        })), this.define(map), this._loading = null;
    }, Mime.prototype.lookup = function(path, fallback) {
        var ext = path.replace(/^.*[\.\/\\]/, "").toLowerCase();
        return this.types[ext] || fallback || this.default_type;
    }, Mime.prototype.extension = function(mimeType) {
        var type = mimeType.match(/^\s*([^;\s]*)(?:;|\s|$)/)[1].toLowerCase();
        return this.extensions[type];
    };
    var mime = new Mime;
    mime.define(__webpack_require__(566)), mime.default_type = mime.lookup("bin"), mime.Mime = Mime, 
    mime.charsets = {
        lookup: function(mimeType, fallback) {
            return /^text\/|^application\/(javascript|json)/.test(mimeType) ? "UTF-8" : fallback;
        }
    }, module.exports = mime;
}
