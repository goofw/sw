function(module, exports, __webpack_require__) {
    module.exports = glob;
    var rp = __webpack_require__(389), minimatch = __webpack_require__(181), inherits = (minimatch.Minimatch, 
    __webpack_require__(6)), EE = __webpack_require__(5).EventEmitter, path = __webpack_require__(4), assert = __webpack_require__(24), isAbsolute = __webpack_require__(182), globSync = __webpack_require__(782), common = __webpack_require__(390), setopts = common.setopts, ownProp = common.ownProp, inflight = __webpack_require__(783), childrenIgnored = (__webpack_require__(0), 
    common.childrenIgnored), isIgnored = common.isIgnored, once = __webpack_require__(34);
    function glob(pattern, options, cb) {
        if ("function" == typeof options && (cb = options, options = {}), options || (options = {}), 
        options.sync) {
            if (cb) throw new TypeError("callback provided to sync glob");
            return globSync(pattern, options);
        }
        return new Glob(pattern, options, cb);
    }
    glob.sync = globSync;
    var GlobSync = glob.GlobSync = globSync.GlobSync;
    function Glob(pattern, options, cb) {
        if ("function" == typeof options && (cb = options, options = null), options && options.sync) {
            if (cb) throw new TypeError("callback provided to sync glob");
            return new GlobSync(pattern, options);
        }
        if (!(this instanceof Glob)) return new Glob(pattern, options, cb);
        setopts(this, pattern, options), this._didRealPath = !1;
        var n = this.minimatch.set.length;
        this.matches = new Array(n), "function" == typeof cb && (cb = once(cb), this.on("error", cb), 
        this.on("end", (function(matches) {
            cb(null, matches);
        })));
        var self = this;
        if (this._processing = 0, this._emitQueue = [], this._processQueue = [], this.paused = !1, 
        this.noprocess) return this;
        if (0 === n) return done();
        for (var i = 0; i < n; i++) this._process(this.minimatch.set[i], i, !1, done);
        function done() {
            --self._processing, self._processing <= 0 && self._finish();
        }
    }
    glob.glob = glob, glob.hasMagic = function(pattern, options_) {
        var options = (function(origin, add) {
            if (null === add || "object" != typeof add) return origin;
            for (var keys = Object.keys(add), i = keys.length; i--; ) origin[keys[i]] = add[keys[i]];
            return origin;
        })({}, options_);
        options.noprocess = !0;
        var set = new Glob(pattern, options).minimatch.set;
        if (!pattern) return !1;
        if (set.length > 1) return !0;
        for (var j = 0; j < set[0].length; j++) if ("string" != typeof set[0][j]) return !0;
        return !1;
    }, glob.Glob = Glob, inherits(Glob, EE), Glob.prototype._finish = function() {
        if (assert(this instanceof Glob), !this.aborted) {
            if (this.realpath && !this._didRealpath) return this._realpath();
            common.finish(this), this.emit("end", this.found);
        }
    }, Glob.prototype._realpath = function() {
        if (!this._didRealpath) {
            this._didRealpath = !0;
            var n = this.matches.length;
            if (0 === n) return this._finish();
            for (var self = this, i = 0; i < this.matches.length; i++) this._realpathSet(i, next);
        }
        function next() {
            0 == --n && self._finish();
        }
    }, Glob.prototype._realpathSet = function(index, cb) {
        var matchset = this.matches[index];
        if (!matchset) return cb();
        var found = Object.keys(matchset), self = this, n = found.length;
        if (0 === n) return cb();
        var set = this.matches[index] = Object.create(null);
        found.forEach((function(p, i) {
            p = self._makeAbs(p), rp.realpath(p, self.realpathCache, (function(er, real) {
                er ? "stat" === er.syscall ? set[p] = !0 : self.emit("error", er) : set[real] = !0, 
                0 == --n && (self.matches[index] = set, cb());
            }));
        }));
    }, Glob.prototype._mark = function(p) {
        return common.mark(this, p);
    }, Glob.prototype._makeAbs = function(f) {
        return common.makeAbs(this, f);
    }, Glob.prototype.abort = function() {
        this.aborted = !0, this.emit("abort");
    }, Glob.prototype.pause = function() {
        this.paused || (this.paused = !0, this.emit("pause"));
    }, Glob.prototype.resume = function() {
        if (this.paused) {
            if (this.emit("resume"), this.paused = !1, this._emitQueue.length) {
                var eq = this._emitQueue.slice(0);
                this._emitQueue.length = 0;
                for (var i = 0; i < eq.length; i++) {
                    var e = eq[i];
                    this._emitMatch(e[0], e[1]);
                }
            }
            if (this._processQueue.length) {
                var pq = this._processQueue.slice(0);
                for (this._processQueue.length = 0, i = 0; i < pq.length; i++) {
                    var p = pq[i];
                    this._processing--, this._process(p[0], p[1], p[2], p[3]);
                }
            }
        }
    }, Glob.prototype._process = function(pattern, index, inGlobStar, cb) {
        if (assert(this instanceof Glob), assert("function" == typeof cb), !this.aborted) if (this._processing++, 
        this.paused) this._processQueue.push([ pattern, index, inGlobStar, cb ]); else {
            for (var prefix, n = 0; "string" == typeof pattern[n]; ) n++;
            switch (n) {
              case pattern.length:
                return void this._processSimple(pattern.join("/"), index, cb);

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
            if (childrenIgnored(this, read)) return cb();
            remain[0] === minimatch.GLOBSTAR ? this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb) : this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb);
        }
    }, Glob.prototype._processReaddir = function(prefix, read, abs, remain, index, inGlobStar, cb) {
        var self = this;
        this._readdir(abs, inGlobStar, (function(er, entries) {
            return self._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
        }));
    }, Glob.prototype._processReaddir2 = function(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
        if (!entries) return cb();
        for (var pn = remain[0], negate = !!this.minimatch.negate, rawGlob = pn._glob, dotOk = this.dot || "." === rawGlob.charAt(0), matchedEntries = [], i = 0; i < entries.length; i++) ("." !== (e = entries[i]).charAt(0) || dotOk) && (negate && !prefix ? !e.match(pn) : e.match(pn)) && matchedEntries.push(e);
        var len = matchedEntries.length;
        if (0 === len) return cb();
        if (1 === remain.length && !this.mark && !this.stat) {
            for (this.matches[index] || (this.matches[index] = Object.create(null)), i = 0; i < len; i++) {
                var e = matchedEntries[i];
                prefix && (e = "/" !== prefix ? prefix + "/" + e : prefix + e), "/" !== e.charAt(0) || this.nomount || (e = path.join(this.root, e)), 
                this._emitMatch(index, e);
            }
            return cb();
        }
        for (remain.shift(), i = 0; i < len; i++) e = matchedEntries[i], prefix && (e = "/" !== prefix ? prefix + "/" + e : prefix + e), 
        this._process([ e ].concat(remain), index, inGlobStar, cb);
        cb();
    }, Glob.prototype._emitMatch = function(index, e) {
        if (!this.aborted && !isIgnored(this, e)) if (this.paused) this._emitQueue.push([ index, e ]); else {
            var abs = isAbsolute(e) ? e : this._makeAbs(e);
            if (this.mark && (e = this._mark(e)), this.absolute && (e = abs), !this.matches[index][e]) {
                if (this.nodir) {
                    var c = this.cache[abs];
                    if ("DIR" === c || Array.isArray(c)) return;
                }
                this.matches[index][e] = !0;
                var st = this.statCache[abs];
                st && this.emit("stat", e, st), this.emit("match", e);
            }
        }
    }, Glob.prototype._readdirInGlobStar = function(abs, cb) {
        if (!this.aborted) {
            if (this.follow) return this._readdir(abs, !1, cb);
            var self = this, lstatcb = inflight("lstat\0" + abs, (function(er, lstat) {
                if (er && "ENOENT" === er.code) return cb();
                var isSym = lstat && lstat.isSymbolicLink();
                self.symlinks[abs] = isSym, isSym || !lstat || lstat.isDirectory() ? self._readdir(abs, !1, cb) : (self.cache[abs] = "FILE", 
                cb());
            }));
            lstatcb && self.fs.lstat(abs, lstatcb);
        }
    }, Glob.prototype._readdir = function(abs, inGlobStar, cb) {
        if (!this.aborted && (cb = inflight("readdir\0" + abs + "\0" + inGlobStar, cb))) {
            if (inGlobStar && !ownProp(this.symlinks, abs)) return this._readdirInGlobStar(abs, cb);
            if (ownProp(this.cache, abs)) {
                var c = this.cache[abs];
                if (!c || "FILE" === c) return cb();
                if (Array.isArray(c)) return cb(null, c);
            }
            this.fs.readdir(abs, (function(self, abs, cb) {
                return function(er, entries) {
                    er ? self._readdirError(abs, er, cb) : self._readdirEntries(abs, entries, cb);
                };
            })(this, abs, cb));
        }
    }, Glob.prototype._readdirEntries = function(abs, entries, cb) {
        if (!this.aborted) {
            if (!this.mark && !this.stat) for (var i = 0; i < entries.length; i++) {
                var e = entries[i];
                e = "/" === abs ? abs + e : abs + "/" + e, this.cache[e] = !0;
            }
            return this.cache[abs] = entries, cb(null, entries);
        }
    }, Glob.prototype._readdirError = function(f, er, cb) {
        if (!this.aborted) {
            switch (er.code) {
              case "ENOTSUP":
              case "ENOTDIR":
                var abs = this._makeAbs(f);
                if (this.cache[abs] = "FILE", abs === this.cwdAbs) {
                    var error = new Error(er.code + " invalid cwd " + this.cwd);
                    error.path = this.cwd, error.code = er.code, this.emit("error", error), this.abort();
                }
                break;

              case "ENOENT":
              case "ELOOP":
              case "ENAMETOOLONG":
              case "UNKNOWN":
                this.cache[this._makeAbs(f)] = !1;
                break;

              default:
                this.cache[this._makeAbs(f)] = !1, this.strict && (this.emit("error", er), this.abort()), 
                this.silent || console.error("glob error", er);
            }
            return cb();
        }
    }, Glob.prototype._processGlobStar = function(prefix, read, abs, remain, index, inGlobStar, cb) {
        var self = this;
        this._readdir(abs, inGlobStar, (function(er, entries) {
            self._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
        }));
    }, Glob.prototype._processGlobStar2 = function(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
        if (!entries) return cb();
        var remainWithoutGlobStar = remain.slice(1), gspref = prefix ? [ prefix ] : [], noGlobStar = gspref.concat(remainWithoutGlobStar);
        this._process(noGlobStar, index, !1, cb);
        var isSym = this.symlinks[abs], len = entries.length;
        if (isSym && inGlobStar) return cb();
        for (var i = 0; i < len; i++) if ("." !== entries[i].charAt(0) || this.dot) {
            var instead = gspref.concat(entries[i], remainWithoutGlobStar);
            this._process(instead, index, !0, cb);
            var below = gspref.concat(entries[i], remain);
            this._process(below, index, !0, cb);
        }
        cb();
    }, Glob.prototype._processSimple = function(prefix, index, cb) {
        var self = this;
        this._stat(prefix, (function(er, exists) {
            self._processSimple2(prefix, index, er, exists, cb);
        }));
    }, Glob.prototype._processSimple2 = function(prefix, index, er, exists, cb) {
        if (this.matches[index] || (this.matches[index] = Object.create(null)), !exists) return cb();
        if (prefix && isAbsolute(prefix) && !this.nomount) {
            var trail = /[\/\\]$/.test(prefix);
            "/" === prefix.charAt(0) ? prefix = path.join(this.root, prefix) : (prefix = path.resolve(this.root, prefix), 
            trail && (prefix += "/"));
        }
        "win32" === process.platform && (prefix = prefix.replace(/\\/g, "/")), this._emitMatch(index, prefix), 
        cb();
    }, Glob.prototype._stat = function(f, cb) {
        var abs = this._makeAbs(f), needDir = "/" === f.slice(-1);
        if (f.length > this.maxLength) return cb();
        if (!this.stat && ownProp(this.cache, abs)) {
            var c = this.cache[abs];
            if (Array.isArray(c) && (c = "DIR"), !needDir || "DIR" === c) return cb(null, c);
            if (needDir && "FILE" === c) return cb();
        }
        var stat = this.statCache[abs];
        if (void 0 !== stat) {
            if (!1 === stat) return cb(null, stat);
            var type = stat.isDirectory() ? "DIR" : "FILE";
            return needDir && "FILE" === type ? cb() : cb(null, type, stat);
        }
        var self = this, statcb = inflight("stat\0" + abs, (function(er, lstat) {
            if (lstat && lstat.isSymbolicLink()) return self.fs.stat(abs, (function(er, stat) {
                er ? self._stat2(f, abs, null, lstat, cb) : self._stat2(f, abs, er, stat, cb);
            }));
            self._stat2(f, abs, er, lstat, cb);
        }));
        statcb && self.fs.lstat(abs, statcb);
    }, Glob.prototype._stat2 = function(f, abs, er, stat, cb) {
        if (er && ("ENOENT" === er.code || "ENOTDIR" === er.code)) return this.statCache[abs] = !1, 
        cb();
        var needDir = "/" === f.slice(-1);
        if (this.statCache[abs] = stat, "/" === abs.slice(-1) && stat && !stat.isDirectory()) return cb(null, !1, stat);
        var c = !0;
        return stat && (c = stat.isDirectory() ? "DIR" : "FILE"), this.cache[abs] = this.cache[abs] || c, 
        needDir && "FILE" === c ? cb() : cb(null, c, stat);
    };
}
