function(module, exports, __webpack_require__) {
    "use strict";
    var debug = __webpack_require__(8)("express:view"), path = __webpack_require__(4), fs = __webpack_require__(2), dirname = path.dirname, basename = path.basename, extname = path.extname, join = path.join, resolve = path.resolve;
    function View(name, options) {
        var opts = options || {};
        if (this.defaultEngine = opts.defaultEngine, this.ext = extname(name), this.name = name, 
        this.root = opts.root, !this.ext && !this.defaultEngine) throw new Error("No default engine was specified and no extension was provided.");
        var fileName = name;
        if (this.ext || (this.ext = "." !== this.defaultEngine[0] ? "." + this.defaultEngine : this.defaultEngine, 
        fileName += this.ext), !opts.engines[this.ext]) {
            var mod = this.ext.substr(1);
            debug('require "%s"', mod);
            var fn = __webpack_require__(977)(mod).__express;
            if ("function" != typeof fn) throw new Error('Module "' + mod + '" does not provide a view engine.');
            opts.engines[this.ext] = fn;
        }
        this.engine = opts.engines[this.ext], this.path = this.lookup(fileName);
    }
    function tryStat(path) {
        debug('stat "%s"', path);
        try {
            return fs.statSync(path);
        } catch (e) {
            return;
        }
    }
    module.exports = View, View.prototype.lookup = function(name) {
        var path, roots = [].concat(this.root);
        debug('lookup "%s"', name);
        for (var i = 0; i < roots.length && !path; i++) {
            var root = roots[i], loc = resolve(root, name), dir = dirname(loc), file = basename(loc);
            path = this.resolve(dir, file);
        }
        return path;
    }, View.prototype.render = function(options, callback) {
        debug('render "%s"', this.path), this.engine(this.path, options, callback);
    }, View.prototype.resolve = function(dir, file) {
        var ext = this.ext, path = join(dir, file), stat = tryStat(path);
        return stat && stat.isFile() || (stat = tryStat(path = join(dir, basename(file, ext), "index" + ext))) && stat.isFile() ? path : void 0;
    };
}
