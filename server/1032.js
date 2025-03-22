function(module, exports, __webpack_require__) {
    module.exports = isexe, isexe.sync = function(path, options) {
        return checkStat(fs.statSync(path), options);
    };
    var fs = __webpack_require__(2);
    function isexe(path, options, cb) {
        fs.stat(path, (function(er, stat) {
            cb(er, !er && checkStat(stat, options));
        }));
    }
    function checkStat(stat, options) {
        return stat.isFile() && (function(stat, options) {
            var mod = stat.mode, uid = stat.uid, gid = stat.gid, myUid = void 0 !== options.uid ? options.uid : process.getuid && process.getuid(), myGid = void 0 !== options.gid ? options.gid : process.getgid && process.getgid(), u = parseInt("100", 8), g = parseInt("010", 8);
            return mod & parseInt("001", 8) || mod & g && gid === myGid || mod & u && uid === myUid || mod & (u | g) && 0 === myUid;
        })(stat, options);
    }
}
