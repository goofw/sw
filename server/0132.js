function(module, exports, __webpack_require__) {
    var path = __webpack_require__(4), fs = __webpack_require__(2), _0777 = parseInt("0777", 8);
    function mkdirP(p, opts, f, made) {
        "function" == typeof opts ? (f = opts, opts = {}) : opts && "object" == typeof opts || (opts = {
            mode: opts
        });
        var mode = opts.mode, xfs = opts.fs || fs;
        void 0 === mode && (mode = _0777), made || (made = null);
        var cb = f || function() {};
        p = path.resolve(p), xfs.mkdir(p, mode, (function(er) {
            if (!er) return cb(null, made = made || p);
            if ("ENOENT" === er.code) {
                if (path.dirname(p) === p) return cb(er);
                mkdirP(path.dirname(p), opts, (function(er, made) {
                    er ? cb(er, made) : mkdirP(p, opts, cb, made);
                }));
            } else xfs.stat(p, (function(er2, stat) {
                er2 || !stat.isDirectory() ? cb(er, made) : cb(null, made);
            }));
        }));
    }
    module.exports = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP, mkdirP.sync = function sync(p, opts, made) {
        opts && "object" == typeof opts || (opts = {
            mode: opts
        });
        var mode = opts.mode, xfs = opts.fs || fs;
        void 0 === mode && (mode = _0777), made || (made = null), p = path.resolve(p);
        try {
            xfs.mkdirSync(p, mode), made = made || p;
        } catch (err0) {
            if ("ENOENT" === err0.code) made = sync(path.dirname(p), opts, made), sync(p, opts, made); else {
                var stat;
                try {
                    stat = xfs.statSync(p);
                } catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
            }
        }
        return made;
    };
}
