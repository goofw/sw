function(module, exports, __webpack_require__) {
    var core;
    function isexe(path, options, cb) {
        if ("function" == typeof options && (cb = options, options = {}), !cb) {
            if ("function" != typeof Promise) throw new TypeError("callback not provided");
            return new Promise((function(resolve, reject) {
                isexe(path, options || {}, (function(er, is) {
                    er ? reject(er) : resolve(is);
                }));
            }));
        }
        core(path, options || {}, (function(er, is) {
            er && ("EACCES" === er.code || options && options.ignoreErrors) && (er = null, is = !1), 
            cb(er, is);
        }));
    }
    __webpack_require__(2), core = "win32" === process.platform || global.TESTING_WINDOWS ? __webpack_require__(1031) : __webpack_require__(1032), 
    module.exports = isexe, isexe.sync = function(path, options) {
        try {
            return core.sync(path, options || {});
        } catch (er) {
            if (options && options.ignoreErrors || "EACCES" === er.code) return !1;
            throw er;
        }
    };
}
