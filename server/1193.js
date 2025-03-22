function(module, exports, __webpack_require__) {
    var constants = __webpack_require__(1194), origCwd = process.cwd, cwd = null, platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
    process.cwd = function() {
        return cwd || (cwd = origCwd.call(process)), cwd;
    };
    try {
        process.cwd();
    } catch (er) {}
    var chdir = process.chdir;
    process.chdir = function(d) {
        cwd = null, chdir.call(process, d);
    }, module.exports = function(fs) {
        var fs$rename, fs$readSync, fs$read;
        function chmodFix(orig) {
            return orig ? function(target, mode, cb) {
                return orig.call(fs, target, mode, (function(er) {
                    chownErOk(er) && (er = null), cb && cb.apply(this, arguments);
                }));
            } : orig;
        }
        function chmodFixSync(orig) {
            return orig ? function(target, mode) {
                try {
                    return orig.call(fs, target, mode);
                } catch (er) {
                    if (!chownErOk(er)) throw er;
                }
            } : orig;
        }
        function chownFix(orig) {
            return orig ? function(target, uid, gid, cb) {
                return orig.call(fs, target, uid, gid, (function(er) {
                    chownErOk(er) && (er = null), cb && cb.apply(this, arguments);
                }));
            } : orig;
        }
        function chownFixSync(orig) {
            return orig ? function(target, uid, gid) {
                try {
                    return orig.call(fs, target, uid, gid);
                } catch (er) {
                    if (!chownErOk(er)) throw er;
                }
            } : orig;
        }
        function statFix(orig) {
            return orig ? function(target, cb) {
                return orig.call(fs, target, (function(er, stats) {
                    if (!stats) return cb.apply(this, arguments);
                    stats.uid < 0 && (stats.uid += 4294967296), stats.gid < 0 && (stats.gid += 4294967296), 
                    cb && cb.apply(this, arguments);
                }));
            } : orig;
        }
        function statFixSync(orig) {
            return orig ? function(target) {
                var stats = orig.call(fs, target);
                return stats.uid < 0 && (stats.uid += 4294967296), stats.gid < 0 && (stats.gid += 4294967296), 
                stats;
            } : orig;
        }
        function chownErOk(er) {
            return !er || "ENOSYS" === er.code || !(process.getuid && 0 === process.getuid() || "EINVAL" !== er.code && "EPERM" !== er.code);
        }
        constants.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && (function(fs) {
            fs.lchmod = function(path, mode, callback) {
                fs.open(path, constants.O_WRONLY | constants.O_SYMLINK, mode, (function(err, fd) {
                    err ? callback && callback(err) : fs.fchmod(fd, mode, (function(err) {
                        fs.close(fd, (function(err2) {
                            callback && callback(err || err2);
                        }));
                    }));
                }));
            }, fs.lchmodSync = function(path, mode) {
                var ret, fd = fs.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode), threw = !0;
                try {
                    ret = fs.fchmodSync(fd, mode), threw = !1;
                } finally {
                    if (threw) try {
                        fs.closeSync(fd);
                    } catch (er) {} else fs.closeSync(fd);
                }
                return ret;
            };
        })(fs), fs.lutimes || (function(fs) {
            constants.hasOwnProperty("O_SYMLINK") ? (fs.lutimes = function(path, at, mt, cb) {
                fs.open(path, constants.O_SYMLINK, (function(er, fd) {
                    er ? cb && cb(er) : fs.futimes(fd, at, mt, (function(er) {
                        fs.close(fd, (function(er2) {
                            cb && cb(er || er2);
                        }));
                    }));
                }));
            }, fs.lutimesSync = function(path, at, mt) {
                var ret, fd = fs.openSync(path, constants.O_SYMLINK), threw = !0;
                try {
                    ret = fs.futimesSync(fd, at, mt), threw = !1;
                } finally {
                    if (threw) try {
                        fs.closeSync(fd);
                    } catch (er) {} else fs.closeSync(fd);
                }
                return ret;
            }) : (fs.lutimes = function(_a, _b, _c, cb) {
                cb && process.nextTick(cb);
            }, fs.lutimesSync = function() {});
        })(fs), fs.chown = chownFix(fs.chown), fs.fchown = chownFix(fs.fchown), fs.lchown = chownFix(fs.lchown), 
        fs.chmod = chmodFix(fs.chmod), fs.fchmod = chmodFix(fs.fchmod), fs.lchmod = chmodFix(fs.lchmod), 
        fs.chownSync = chownFixSync(fs.chownSync), fs.fchownSync = chownFixSync(fs.fchownSync), 
        fs.lchownSync = chownFixSync(fs.lchownSync), fs.chmodSync = chmodFixSync(fs.chmodSync), 
        fs.fchmodSync = chmodFixSync(fs.fchmodSync), fs.lchmodSync = chmodFixSync(fs.lchmodSync), 
        fs.stat = statFix(fs.stat), fs.fstat = statFix(fs.fstat), fs.lstat = statFix(fs.lstat), 
        fs.statSync = statFixSync(fs.statSync), fs.fstatSync = statFixSync(fs.fstatSync), 
        fs.lstatSync = statFixSync(fs.lstatSync), fs.lchmod || (fs.lchmod = function(path, mode, cb) {
            cb && process.nextTick(cb);
        }, fs.lchmodSync = function() {}), fs.lchown || (fs.lchown = function(path, uid, gid, cb) {
            cb && process.nextTick(cb);
        }, fs.lchownSync = function() {}), "win32" === platform && (fs.rename = (fs$rename = fs.rename, 
        function(from, to, cb) {
            var start = Date.now(), backoff = 0;
            fs$rename(from, to, (function CB(er) {
                if (er && ("EACCES" === er.code || "EPERM" === er.code) && Date.now() - start < 6e4) return setTimeout((function() {
                    fs.stat(to, (function(stater, st) {
                        stater && "ENOENT" === stater.code ? fs$rename(from, to, CB) : cb(er);
                    }));
                }), backoff), void (backoff < 100 && (backoff += 10));
                cb && cb(er);
            }));
        })), fs.read = (fs$read = fs.read, function(fd, buffer, offset, length, position, callback_) {
            var callback;
            if (callback_ && "function" == typeof callback_) {
                var eagCounter = 0;
                callback = function(er, _, __) {
                    if (er && "EAGAIN" === er.code && eagCounter < 10) return eagCounter++, fs$read.call(fs, fd, buffer, offset, length, position, callback);
                    callback_.apply(this, arguments);
                };
            }
            return fs$read.call(fs, fd, buffer, offset, length, position, callback);
        }), fs.readSync = (fs$readSync = fs.readSync, function(fd, buffer, offset, length, position) {
            for (var eagCounter = 0; ;) try {
                return fs$readSync.call(fs, fd, buffer, offset, length, position);
            } catch (er) {
                if ("EAGAIN" === er.code && eagCounter < 10) {
                    eagCounter++;
                    continue;
                }
                throw er;
            }
        });
    };
}
