function(module, exports, __webpack_require__) {
    module.exports = globSync, globSync.GlobSync = GlobSync;
    var rp = __webpack_require__(389), minimatch = __webpack_require__(181), path = (minimatch.Minimatch, 
    __webpack_require__(180).Glob, __webpack_require__(0), __webpack_require__(4)), assert = __webpack_require__(24), isAbsolute = __webpack_require__(182), common = __webpack_require__(390), setopts = common.setopts, ownProp = common.ownProp, childrenIgnored = common.childrenIgnored, isIgnored = common.isIgnored;
    function globSync(pattern, options) {
        if ("function" == typeof options || 3 === arguments.length) throw new TypeError("callback provided to sync glob\nSee: https://github.com/isaacs/node-glob/issues/167");
        return new GlobSync(pattern, options).found;
    }
    function GlobSync(pattern, options) {
        if (!pattern) throw new Error("must provide pattern");
        if ("function" == typeof options || 3 === arguments.length) throw new TypeError("callback provided to sync glob\nSee: https://github.com/isaacs/node-glob/issues/167");
        if (!(this instanceof GlobSync)) return new GlobSync(pattern, options);
        if (setopts(this, pattern, options), this.noprocess) return this;
        var n = this.minimatch.set.length;
        this.matches = new Array(n);
        for (var i = 0; i < n; i++) this._process(this.minimatch.set[i], i, !1);
        this._finish();
    }
    GlobSync.prototype._finish = function() {
        if (assert(this instanceof GlobSync), this.realpath) {
            var self = this;
            this.matches.forEach((function(matchset, index) {
                var set = self.matches[index] = Object.create(null);
                for (var p in matchset) try {
                    p = self._makeAbs(p), set[rp.realpathSync(p, self.realpathCache)] = !0;
                } catch (er) {
                    if ("stat" !== er.syscall) throw er;
                    set[self._makeAbs(p)] = !0;
                }
            }));
        }
        common.finish(this);
    }, GlobSync.prototype._process = function(pattern, index, inGlobStar) {
        assert(this instanceof GlobSync);
        for (var prefix, n = 0; "string" == typeof pattern[n]; ) n++;
        switch (n) {
          case pattern.length:
            return void this._processSimple(pattern.join("/"), index);

          case 0:
            prefix = null;
            break;

          default:
            prefix = pattern.slice(0, n).join("/");
        }
        var read, remain = pattern.slice(n);
        null === prefix ? read = "." : isAbsolute(prefix) || isAbsolute(pattern.join("/")) ? (prefix && isAbsolute(prefix) || (prefix = "/" + prefix), 
        read = prefix) : read = prefix;
        var abs = this._makeAbs(read);
        childrenIgnored(this, read) || (remain[0] === minimatch.GLOBSTAR ? this._processGlobStar(prefix, read, abs, remain, index, inGlobStar) : this._processReaddir(prefix, read, abs, remain, index, inGlobStar));
    }, GlobSync.prototype._processReaddir = function(prefix, read, abs, remain, index, inGlobStar) {
        var entries = this._readdir(abs, inGlobStar);
        if (entries) {
            for (var pn = remain[0], negate = !!this.minimatch.negate, rawGlob = pn._glob, dotOk = this.dot || "." === rawGlob.charAt(0), matchedEntries = [], i = 0; i < entries.length; i++) ("." !== (e = entries[i]).charAt(0) || dotOk) && (negate && !prefix ? !e.match(pn) : e.match(pn)) && matchedEntries.push(e);
            var len = matchedEntries.length;
            if (0 !== len) if (1 !== remain.length || this.mark || this.stat) for (remain.shift(), 
            i = 0; i < len; i++) {
                var newPattern;
                e = matchedEntries[i], newPattern = prefix ? [ prefix, e ] : [ e ], this._process(newPattern.concat(remain), index, inGlobStar);
            } else {
                this.matches[index] || (this.matches[index] = Object.create(null));
                for (i = 0; i < len; i++) {
                    var e = matchedEntries[i];
                    prefix && (e = "/" !== prefix.slice(-1) ? prefix + "/" + e : prefix + e), "/" !== e.charAt(0) || this.nomount || (e = path.join(this.root, e)), 
                    this._emitMatch(index, e);
                }
            }
        }
    }, GlobSync.prototype._emitMatch = function(index, e) {
        if (!isIgnored(this, e)) {
            var abs = this._makeAbs(e);
            if (this.mark && (e = this._mark(e)), this.absolute && (e = abs), !this.matches[index][e]) {
                if (this.nodir) {
                    var c = this.cache[abs];
                    if ("DIR" === c || Array.isArray(c)) return;
                }
                this.matches[index][e] = !0, this.stat && this._stat(e);
            }
        }
    }, GlobSync.prototype._readdirInGlobStar = function(abs) {
        if (this.follow) return this._readdir(abs, !1);
        var entries, lstat;
        try {
            lstat = this.fs.lstatSync(abs);
        } catch (er) {
            if ("ENOENT" === er.code) return null;
        }
        var isSym = lstat && lstat.isSymbolicLink();
        return this.symlinks[abs] = isSym, isSym || !lstat || lstat.isDirectory() ? entries = this._readdir(abs, !1) : this.cache[abs] = "FILE", 
        entries;
    }, GlobSync.prototype._readdir = function(abs, inGlobStar) {
        if (inGlobStar && !ownProp(this.symlinks, abs)) return this._readdirInGlobStar(abs);
        if (ownProp(this.cache, abs)) {
            var c = this.cache[abs];
            if (!c || "FILE" === c) return null;
            if (Array.isArray(c)) return c;
        }
        try {
            return this._readdirEntries(abs, this.fs.readdirSync(abs));
        } catch (er) {
            return this._readdirError(abs, er), null;
        }
    }, GlobSync.prototype._readdirEntries = function(abs, entries) {
        if (!this.mark && !this.stat) for (var i = 0; i < entries.length; i++) {
            var e = entries[i];
            e = "/" === abs ? abs + e : abs + "/" + e, this.cache[e] = !0;
        }
        return this.cache[abs] = entries, entries;
    }, GlobSync.prototype._readdirError = function(f, er) {
        switch (er.code) {
          case "ENOTSUP":
          case "ENOTDIR":
            var abs = this._makeAbs(f);
            if (this.cache[abs] = "FILE", abs === this.cwdAbs) {
                var error = new Error(er.code + " invalid cwd " + this.cwd);
                throw error.path = this.cwd, error.code = er.code, error;
            }
            break;

          case "ENOENT":
          case "ELOOP":
          case "ENAMETOOLONG":
          case "UNKNOWN":
            this.cache[this._makeAbs(f)] = !1;
            break;

          default:
            if (this.cache[this._makeAbs(f)] = !1, this.strict) throw er;
            this.silent || console.error("glob error", er);
        }
    }, GlobSync.prototype._processGlobStar = function(prefix, read, abs, remain, index, inGlobStar) {
        var entries = this._readdir(abs, inGlobStar);
        if (entries) {
            var remainWithoutGlobStar = remain.slice(1), gspref = prefix ? [ prefix ] : [], noGlobStar = gspref.concat(remainWithoutGlobStar);
            this._process(noGlobStar, index, !1);
            var len = entries.length;
            if (!this.symlinks[abs] || !inGlobStar) for (var i = 0; i < len; i++) if ("." !== entries[i].charAt(0) || this.dot) {
                var instead = gspref.concat(entries[i], remainWithoutGlobStar);
                this._process(instead, index, !0);
                var below = gspref.concat(entries[i], remain);
                this._process(below, index, !0);
            }
        }
    }, GlobSync.prototype._processSimple = function(prefix, index) {
        var exists = this._stat(prefix);
        if (this.matches[index] || (this.matches[index] = Object.create(null)), exists) {
            if (prefix && isAbsolute(prefix) && !this.nomount) {
                var trail = /[\/\\]$/.test(prefix);
                "/" === prefix.charAt(0) ? prefix = path.join(this.root, prefix) : (prefix = path.resolve(this.root, prefix), 
                trail && (prefix += "/"));
            }
            "win32" === process.platform && (prefix = prefix.replace(/\\/g, "/")), this._emitMatch(index, prefix);
        }
    }, GlobSync.prototype._stat = function(f) {
        var abs = this._makeAbs(f), needDir = "/" === f.slice(-1);
        if (f.length > this.maxLength) return !1;
        if (!this.stat && ownProp(this.cache, abs)) {
            var c = this.cache[abs];
            if (Array.isArray(c) && (c = "DIR"), !needDir || "DIR" === c) return c;
            if (needDir && "FILE" === c) return !1;
        }
        var stat = this.statCache[abs];
        if (!stat) {
            var lstat;
            try {
                lstat = this.fs.lstatSync(abs);
            } catch (er) {
                if (er && ("ENOENT" === er.code || "ENOTDIR" === er.code)) return this.statCache[abs] = !1, 
                !1;
            }
            if (lstat && lstat.isSymbolicLink()) try {
                stat = this.fs.statSync(abs);
            } catch (er) {
                stat = lstat;
            } else stat = lstat;
        }
        return this.statCache[abs] = stat, c = !0, stat && (c = stat.isDirectory() ? "DIR" : "FILE"), 
        this.cache[abs] = this.cache[abs] || c, (!needDir || "FILE" !== c) && c;
    }, GlobSync.prototype._mark = function(p) {
        return common.mark(this, p);
    }, GlobSync.prototype._makeAbs = function(f) {
        return common.makeAbs(this, f);
    };
}
