function(module, exports, __webpack_require__) {
    module.exports = isexe, isexe.sync = function(path, options) {
        return checkStat(fs.statSync(path), path, options);
    };
    var fs = __webpack_require__(2);
    function checkStat(stat, path, options) {
        return !(!stat.isSymbolicLink() && !stat.isFile()) && (function(path, options) {
            var pathext = void 0 !== options.pathExt ? options.pathExt : process.env.PATHEXT;
            if (!pathext) return !0;
            if (-1 !== (pathext = pathext.split(";")).indexOf("")) return !0;
            for (var i = 0; i < pathext.length; i++) {
                var p = pathext[i].toLowerCase();
                if (p && path.substr(-p.length).toLowerCase() === p) return !0;
            }
            return !1;
        })(path, options);
    }
    function isexe(path, options, cb) {
        fs.stat(path, (function(er, stat) {
            cb(er, !er && checkStat(stat, path, options));
        }));
    }
}
