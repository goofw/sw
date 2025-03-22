function(module, exports, __webpack_require__) {
    module.exports = realpath, realpath.realpath = realpath, realpath.sync = realpathSync, 
    realpath.realpathSync = realpathSync, realpath.monkeypatch = function() {
        fs.realpath = realpath, fs.realpathSync = realpathSync;
    }, realpath.unmonkeypatch = function() {
        fs.realpath = origRealpath, fs.realpathSync = origRealpathSync;
    };
    var fs = __webpack_require__(2), origRealpath = fs.realpath, origRealpathSync = fs.realpathSync, version = process.version, ok = /^v[0-5]\./.test(version), old = __webpack_require__(778);
    function newError(er) {
        return er && "realpath" === er.syscall && ("ELOOP" === er.code || "ENOMEM" === er.code || "ENAMETOOLONG" === er.code);
    }
    function realpath(p, cache, cb) {
        if (ok) return origRealpath(p, cache, cb);
        "function" == typeof cache && (cb = cache, cache = null), origRealpath(p, cache, (function(er, result) {
            newError(er) ? old.realpath(p, cache, cb) : cb(er, result);
        }));
    }
    function realpathSync(p, cache) {
        if (ok) return origRealpathSync(p, cache);
        try {
            return origRealpathSync(p, cache);
        } catch (er) {
            if (newError(er)) return old.realpathSync(p, cache);
            throw er;
        }
    }
}
