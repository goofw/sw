function(module, exports, __webpack_require__) {
    var fs = __webpack_require__(2), path = __webpack_require__(4), crypto = __webpack_require__(9), tmpDir = __webpack_require__(888), _c = process.binding("constants"), _TMP = tmpDir(), RANDOM_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", TEMPLATE_PATTERN = /XXXXXX/, CREATE_FLAGS = (_c.O_CREAT || _c.fs.O_CREAT) | (_c.O_EXCL || _c.fs.O_EXCL) | (_c.O_RDWR || _c.fs.O_RDWR), EBADF = _c.EBADF || _c.os.errno.EBADF, ENOENT = _c.ENOENT || _c.os.errno.ENOENT, _removeObjects = [], _gracefulCleanup = !1, _uncaughtException = !1;
    function _randomChars(howMany) {
        var value = [], rnd = null;
        try {
            rnd = crypto.randomBytes(howMany);
        } catch (e) {
            rnd = crypto.pseudoRandomBytes(howMany);
        }
        for (var i = 0; i < howMany; i++) value.push(RANDOM_CHARS[rnd[i] % RANDOM_CHARS.length]);
        return value.join("");
    }
    function _parseArguments(options, callback) {
        if ("function" == typeof options) {
            var tmp = options;
            options = callback || {}, callback = tmp;
        } else void 0 === options && (options = {});
        return [ options, callback ];
    }
    function _generateTmpName(opts) {
        if (opts.name) return path.join(opts.dir || _TMP, opts.name);
        if (opts.template) return opts.template.replace(TEMPLATE_PATTERN, _randomChars(6));
        var name = [ opts.prefix || "tmp-", process.pid, _randomChars(12), opts.postfix || "" ].join("");
        return path.join(opts.dir || _TMP, name);
    }
    function _getTmpName(options, callback) {
        var args = _parseArguments(options, callback), opts = args[0], cb = args[1], tries = opts.tries || 3;
        return isNaN(tries) || tries < 0 ? cb(new Error("Invalid tries")) : opts.template && !opts.template.match(TEMPLATE_PATTERN) ? cb(new Error("Invalid template provided")) : void (function _getUniqueName() {
            var name = _generateTmpName(opts);
            fs.stat(name, (function(err) {
                if (!err) return tries-- > 0 ? _getUniqueName() : cb(new Error("Could not get a unique tmp filename, max tries reached " + name));
                cb(null, name);
            }));
        })();
    }
    function _getTmpNameSync(options) {
        var opts = _parseArguments(options)[0], tries = opts.tries || 3;
        if (isNaN(tries) || tries < 0) throw new Error("Invalid tries");
        if (opts.template && !opts.template.match(TEMPLATE_PATTERN)) throw new Error("Invalid template provided");
        do {
            var name = _generateTmpName(opts);
            try {
                fs.statSync(name);
            } catch (e) {
                return name;
            }
        } while (tries-- > 0);
        throw new Error("Could not get a unique tmp filename, max tries reached");
    }
    function _rmdirRecursiveSync(root) {
        var dirs = [ root ];
        do {
            for (var dir = dirs.pop(), deferred = !1, files = fs.readdirSync(dir), i = 0, length = files.length; i < length; i++) {
                var file = path.join(dir, files[i]);
                fs.lstatSync(file).isDirectory() ? (deferred || (deferred = !0, dirs.push(dir)), 
                dirs.push(file)) : fs.unlinkSync(file);
            }
            deferred || fs.rmdirSync(dir);
        } while (0 !== dirs.length);
    }
    function _prepareTmpFileRemoveCallback(name, fd, opts) {
        var removeCallback = _prepareRemoveCallback((function(fdPath) {
            try {
                0 <= fdPath[0] && fs.closeSync(fdPath[0]);
            } catch (e) {
                if (e.errno != -EBADF && e.errno != -ENOENT) throw e;
            }
            fs.unlinkSync(fdPath[1]);
        }), [ fd, name ]);
        return opts.keep || _removeObjects.unshift(removeCallback), removeCallback;
    }
    function _prepareTmpDirRemoveCallback(name, opts) {
        var removeCallback = _prepareRemoveCallback(opts.unsafeCleanup ? _rmdirRecursiveSync : fs.rmdirSync.bind(fs), name);
        return opts.keep || _removeObjects.unshift(removeCallback), removeCallback;
    }
    function _prepareRemoveCallback(removeFunction, arg) {
        var called = !1;
        return function _cleanupCallback(next) {
            if (!called) {
                var index = _removeObjects.indexOf(_cleanupCallback);
                index >= 0 && _removeObjects.splice(index, 1), called = !0, removeFunction(arg);
            }
            next && next(null);
        };
    }
    function _garbageCollector() {
        if (!_uncaughtException || _gracefulCleanup) for (;_removeObjects.length; ) try {
            _removeObjects[0].call(null);
        } catch (e) {}
    }
    var version = process.versions.node.split(".").map((function(value) {
        return parseInt(value, 10);
    }));
    0 === version[0] && (version[1] < 9 || 9 === version[1] && version[2] < 5) && process.addListener("uncaughtException", (function(err) {
        throw _uncaughtException = !0, _garbageCollector(), err;
    })), process.addListener("exit", (function(code) {
        code && (_uncaughtException = !0), _garbageCollector();
    })), module.exports.tmpdir = _TMP, module.exports.dir = function(options, callback) {
        var args = _parseArguments(options, callback), opts = args[0], cb = args[1];
        _getTmpName(opts, (function(err, name) {
            if (err) return cb(err);
            fs.mkdir(name, opts.mode || 448, (function(err) {
                if (err) return cb(err);
                cb(null, name, _prepareTmpDirRemoveCallback(name, opts));
            }));
        }));
    }, module.exports.dirSync = function(options) {
        var opts = _parseArguments(options)[0], name = _getTmpNameSync(opts);
        return fs.mkdirSync(name, opts.mode || 448), {
            name: name,
            removeCallback: _prepareTmpDirRemoveCallback(name, opts)
        };
    }, module.exports.file = function(options, callback) {
        var args = _parseArguments(options, callback), opts = args[0], cb = args[1];
        opts.postfix = void 0 === opts.postfix ? ".tmp" : opts.postfix, _getTmpName(opts, (function(err, name) {
            if (err) return cb(err);
            fs.open(name, CREATE_FLAGS, opts.mode || 384, (function(err, fd) {
                return err ? cb(err) : opts.discardDescriptor ? fs.close(fd, (function(err) {
                    if (err) {
                        try {
                            fs.unlinkSync(name);
                        } catch (e) {
                            err = e;
                        }
                        return cb(err);
                    }
                    cb(null, name, void 0, _prepareTmpFileRemoveCallback(name, -1, opts));
                })) : opts.detachDescriptor ? cb(null, name, fd, _prepareTmpFileRemoveCallback(name, -1, opts)) : void cb(null, name, fd, _prepareTmpFileRemoveCallback(name, fd, opts));
            }));
        }));
    }, module.exports.fileSync = function(options) {
        var opts = _parseArguments(options)[0];
        opts.postfix = opts.postfix || ".tmp";
        var name = _getTmpNameSync(opts), fd = fs.openSync(name, CREATE_FLAGS, opts.mode || 384);
        return {
            name: name,
            fd: fd,
            removeCallback: _prepareTmpFileRemoveCallback(name, fd, opts)
        };
    }, module.exports.tmpName = _getTmpName, module.exports.tmpNameSync = _getTmpNameSync, 
    module.exports.setGracefulCleanup = function() {
        _gracefulCleanup = !0;
    };
}
