function(module, exports, __webpack_require__) {
    module.exports = rimraf, rimraf.sync = rimrafSync;
    var assert = __webpack_require__(24), path = __webpack_require__(4), fs = __webpack_require__(2), glob = __webpack_require__(180), _0666 = parseInt("666", 8), defaultGlobOpts = {
        nosort: !0,
        silent: !0
    }, timeout = 0, isWindows = "win32" === process.platform;
    function defaults(options) {
        [ "unlink", "chmod", "stat", "lstat", "rmdir", "readdir" ].forEach((function(m) {
            options[m] = options[m] || fs[m], options[m += "Sync"] = options[m] || fs[m];
        })), options.maxBusyTries = options.maxBusyTries || 3, options.emfileWait = options.emfileWait || 1e3, 
        !1 === options.glob && (options.disableGlob = !0), options.disableGlob = options.disableGlob || !1, 
        options.glob = options.glob || defaultGlobOpts;
    }
    function rimraf(p, options, cb) {
        "function" == typeof options && (cb = options, options = {}), assert(p, "rimraf: missing path"), 
        assert.equal(typeof p, "string", "rimraf: path should be a string"), assert.equal(typeof cb, "function", "rimraf: callback function required"), 
        assert(options, "rimraf: invalid options argument provided"), assert.equal(typeof options, "object", "rimraf: options should be object"), 
        defaults(options);
        var busyTries = 0, errState = null, n = 0;
        if (options.disableGlob || !glob.hasMagic(p)) return afterGlob(null, [ p ]);
        function afterGlob(er, results) {
            return er ? cb(er) : 0 === (n = results.length) ? cb() : void results.forEach((function(p) {
                rimraf_(p, options, (function CB(er) {
                    if (er) {
                        if (("EBUSY" === er.code || "ENOTEMPTY" === er.code || "EPERM" === er.code) && busyTries < options.maxBusyTries) return busyTries++, 
                        setTimeout((function() {
                            rimraf_(p, options, CB);
                        }), 100 * busyTries);
                        if ("EMFILE" === er.code && timeout < options.emfileWait) return setTimeout((function() {
                            rimraf_(p, options, CB);
                        }), timeout++);
                        "ENOENT" === er.code && (er = null);
                    }
                    timeout = 0, (function(er) {
                        errState = errState || er, 0 == --n && cb(errState);
                    })(er);
                }));
            }));
        }
        options.lstat(p, (function(er, stat) {
            if (!er) return afterGlob(null, [ p ]);
            glob(p, options.glob, afterGlob);
        }));
    }
    function rimraf_(p, options, cb) {
        assert(p), assert(options), assert("function" == typeof cb), options.lstat(p, (function(er, st) {
            return er && "ENOENT" === er.code ? cb(null) : (er && "EPERM" === er.code && isWindows && fixWinEPERM(p, options, er, cb), 
            st && st.isDirectory() ? rmdir(p, options, er, cb) : void options.unlink(p, (function(er) {
                if (er) {
                    if ("ENOENT" === er.code) return cb(null);
                    if ("EPERM" === er.code) return isWindows ? fixWinEPERM(p, options, er, cb) : rmdir(p, options, er, cb);
                    if ("EISDIR" === er.code) return rmdir(p, options, er, cb);
                }
                return cb(er);
            })));
        }));
    }
    function fixWinEPERM(p, options, er, cb) {
        assert(p), assert(options), assert("function" == typeof cb), er && assert(er instanceof Error), 
        options.chmod(p, _0666, (function(er2) {
            er2 ? cb("ENOENT" === er2.code ? null : er) : options.stat(p, (function(er3, stats) {
                er3 ? cb("ENOENT" === er3.code ? null : er) : stats.isDirectory() ? rmdir(p, options, er, cb) : options.unlink(p, cb);
            }));
        }));
    }
    function fixWinEPERMSync(p, options, er) {
        assert(p), assert(options), er && assert(er instanceof Error);
        try {
            options.chmodSync(p, _0666);
        } catch (er2) {
            if ("ENOENT" === er2.code) return;
            throw er;
        }
        try {
            var stats = options.statSync(p);
        } catch (er3) {
            if ("ENOENT" === er3.code) return;
            throw er;
        }
        stats.isDirectory() ? rmdirSync(p, options, er) : options.unlinkSync(p);
    }
    function rmdir(p, options, originalEr, cb) {
        assert(p), assert(options), originalEr && assert(originalEr instanceof Error), assert("function" == typeof cb), 
        options.rmdir(p, (function(er) {
            !er || "ENOTEMPTY" !== er.code && "EEXIST" !== er.code && "EPERM" !== er.code ? er && "ENOTDIR" === er.code ? cb(originalEr) : cb(er) : (function(p, options, cb) {
                assert(p), assert(options), assert("function" == typeof cb), options.readdir(p, (function(er, files) {
                    if (er) return cb(er);
                    var errState, n = files.length;
                    if (0 === n) return options.rmdir(p, cb);
                    files.forEach((function(f) {
                        rimraf(path.join(p, f), options, (function(er) {
                            if (!errState) return er ? cb(errState = er) : void (0 == --n && options.rmdir(p, cb));
                        }));
                    }));
                }));
            })(p, options, cb);
        }));
    }
    function rimrafSync(p, options) {
        var results;
        if (defaults(options = options || {}), assert(p, "rimraf: missing path"), assert.equal(typeof p, "string", "rimraf: path should be a string"), 
        assert(options, "rimraf: missing options"), assert.equal(typeof options, "object", "rimraf: options should be object"), 
        options.disableGlob || !glob.hasMagic(p)) results = [ p ]; else try {
            options.lstatSync(p), results = [ p ];
        } catch (er) {
            results = glob.sync(p, options.glob);
        }
        if (results.length) for (var i = 0; i < results.length; i++) {
            p = results[i];
            try {
                var st = options.lstatSync(p);
            } catch (er) {
                if ("ENOENT" === er.code) return;
                "EPERM" === er.code && isWindows && fixWinEPERMSync(p, options, er);
            }
            try {
                st && st.isDirectory() ? rmdirSync(p, options, null) : options.unlinkSync(p);
            } catch (er) {
                if ("ENOENT" === er.code) return;
                if ("EPERM" === er.code) return isWindows ? fixWinEPERMSync(p, options, er) : rmdirSync(p, options, er);
                if ("EISDIR" !== er.code) throw er;
                rmdirSync(p, options, er);
            }
        }
    }
    function rmdirSync(p, options, originalEr) {
        assert(p), assert(options), originalEr && assert(originalEr instanceof Error);
        try {
            options.rmdirSync(p);
        } catch (er) {
            if ("ENOENT" === er.code) return;
            if ("ENOTDIR" === er.code) throw originalEr;
            "ENOTEMPTY" !== er.code && "EEXIST" !== er.code && "EPERM" !== er.code || (function(p, options) {
                assert(p), assert(options), options.readdirSync(p).forEach((function(f) {
                    rimrafSync(path.join(p, f), options);
                }));
                for (var retries = isWindows ? 100 : 1, i = 0; ;) {
                    var threw = !0;
                    try {
                        var ret = options.rmdirSync(p, options);
                        return threw = !1, ret;
                    } finally {
                        if (++i < retries && threw) continue;
                    }
                }
            })(p, options);
        }
    }
}
