function(module, exports, __webpack_require__) {
    function ownProp(obj, field) {
        return Object.prototype.hasOwnProperty.call(obj, field);
    }
    exports.setopts = function(self, pattern, options) {
        if (options || (options = {}), options.matchBase && -1 === pattern.indexOf("/")) {
            if (options.noglobstar) throw new Error("base matching requires globstar");
            pattern = "**/" + pattern;
        }
        self.silent = !!options.silent, self.pattern = pattern, self.strict = !1 !== options.strict, 
        self.realpath = !!options.realpath, self.realpathCache = options.realpathCache || Object.create(null), 
        self.follow = !!options.follow, self.dot = !!options.dot, self.mark = !!options.mark, 
        self.nodir = !!options.nodir, self.nodir && (self.mark = !0), self.sync = !!options.sync, 
        self.nounique = !!options.nounique, self.nonull = !!options.nonull, self.nosort = !!options.nosort, 
        self.nocase = !!options.nocase, self.stat = !!options.stat, self.noprocess = !!options.noprocess, 
        self.absolute = !!options.absolute, self.fs = options.fs || fs, self.maxLength = options.maxLength || 1 / 0, 
        self.cache = options.cache || Object.create(null), self.statCache = options.statCache || Object.create(null), 
        self.symlinks = options.symlinks || Object.create(null), (function(self, options) {
            self.ignore = options.ignore || [], Array.isArray(self.ignore) || (self.ignore = [ self.ignore ]), 
            self.ignore.length && (self.ignore = self.ignore.map(ignoreMap));
        })(self, options), self.changedCwd = !1;
        var cwd = process.cwd();
        ownProp(options, "cwd") ? (self.cwd = path.resolve(options.cwd), self.changedCwd = self.cwd !== cwd) : self.cwd = cwd, 
        self.root = options.root || path.resolve(self.cwd, "/"), self.root = path.resolve(self.root), 
        "win32" === process.platform && (self.root = self.root.replace(/\\/g, "/")), self.cwdAbs = isAbsolute(self.cwd) ? self.cwd : makeAbs(self, self.cwd), 
        "win32" === process.platform && (self.cwdAbs = self.cwdAbs.replace(/\\/g, "/")), 
        self.nomount = !!options.nomount, options.nonegate = !0, options.nocomment = !0, 
        self.minimatch = new Minimatch(pattern, options), self.options = self.minimatch.options;
    }, exports.ownProp = ownProp, exports.makeAbs = makeAbs, exports.finish = function(self) {
        for (var nou = self.nounique, all = nou ? [] : Object.create(null), i = 0, l = self.matches.length; i < l; i++) {
            var matches = self.matches[i];
            if (matches && 0 !== Object.keys(matches).length) {
                var m = Object.keys(matches);
                nou ? all.push.apply(all, m) : m.forEach((function(m) {
                    all[m] = !0;
                }));
            } else if (self.nonull) {
                var literal = self.minimatch.globSet[i];
                nou ? all.push(literal) : all[literal] = !0;
            }
        }
        if (nou || (all = Object.keys(all)), self.nosort || (all = all.sort(alphasort)), 
        self.mark) {
            for (i = 0; i < all.length; i++) all[i] = self._mark(all[i]);
            self.nodir && (all = all.filter((function(e) {
                var notDir = !/\/$/.test(e), c = self.cache[e] || self.cache[makeAbs(self, e)];
                return notDir && c && (notDir = "DIR" !== c && !Array.isArray(c)), notDir;
            })));
        }
        self.ignore.length && (all = all.filter((function(m) {
            return !isIgnored(self, m);
        }))), self.found = all;
    }, exports.mark = function(self, p) {
        var abs = makeAbs(self, p), c = self.cache[abs], m = p;
        if (c) {
            var isDir = "DIR" === c || Array.isArray(c), slash = "/" === p.slice(-1);
            if (isDir && !slash ? m += "/" : !isDir && slash && (m = m.slice(0, -1)), m !== p) {
                var mabs = makeAbs(self, m);
                self.statCache[mabs] = self.statCache[abs], self.cache[mabs] = self.cache[abs];
            }
        }
        return m;
    }, exports.isIgnored = isIgnored, exports.childrenIgnored = function(self, path) {
        return !!self.ignore.length && self.ignore.some((function(item) {
            return !(!item.gmatcher || !item.gmatcher.match(path));
        }));
    };
    var fs = __webpack_require__(2), path = __webpack_require__(4), minimatch = __webpack_require__(181), isAbsolute = __webpack_require__(182), Minimatch = minimatch.Minimatch;
    function alphasort(a, b) {
        return a.localeCompare(b, "en");
    }
    function ignoreMap(pattern) {
        var gmatcher = null;
        if ("/**" === pattern.slice(-3)) {
            var gpattern = pattern.replace(/(\/\*\*)+$/, "");
            gmatcher = new Minimatch(gpattern, {
                dot: !0
            });
        }
        return {
            matcher: new Minimatch(pattern, {
                dot: !0
            }),
            gmatcher: gmatcher
        };
    }
    function makeAbs(self, f) {
        var abs = f;
        return abs = "/" === f.charAt(0) ? path.join(self.root, f) : isAbsolute(f) || "" === f ? f : self.changedCwd ? path.resolve(self.cwd, f) : path.resolve(f), 
        "win32" === process.platform && (abs = abs.replace(/\\/g, "/")), abs;
    }
    function isIgnored(self, path) {
        return !!self.ignore.length && self.ignore.some((function(item) {
            return item.matcher.match(path) || !(!item.gmatcher || !item.gmatcher.match(path));
        }));
    }
}
