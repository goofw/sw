function(module, exports, __webpack_require__) {
    module.exports = Writer;
    var fs = __webpack_require__(59), inherits = __webpack_require__(6), rimraf = __webpack_require__(513), mkdir = __webpack_require__(170), path = __webpack_require__(4), umask = "win32" === process.platform ? 0 : process.umask(), getType = __webpack_require__(154), Abstract = __webpack_require__(242);
    inherits(Writer, Abstract), Writer.dirmode = parseInt("0777", 8) & ~umask, Writer.filemode = parseInt("0666", 8) & ~umask;
    var DirWriter = __webpack_require__(514), LinkWriter = __webpack_require__(515), FileWriter = __webpack_require__(516), ProxyWriter = __webpack_require__(517);
    function Writer(props, current) {
        "string" == typeof props && (props = {
            path: props
        });
        var ClassType = Writer;
        switch (getType(props)) {
          case "Directory":
            ClassType = DirWriter;
            break;

          case "File":
            ClassType = FileWriter;
            break;

          case "Link":
          case "SymbolicLink":
            ClassType = LinkWriter;
            break;

          default:
            ClassType = ProxyWriter;
        }
        if (!(this instanceof ClassType)) return new ClassType(props);
        Abstract.call(this), props.path || this.error("Must provide a path", null, !0), 
        this.type = props.type, this.props = props, this.depth = props.depth || 0, this.clobber = !1 !== props.clobber || props.clobber, 
        this.parent = props.parent || null, this.root = props.root || props.parent && props.parent.root || this, 
        this._path = this.path = path.resolve(props.path), "win32" === process.platform && (this.path = this._path = this.path.replace(/\?/g, "_"), 
        this._path.length >= 260 && (this._swallowErrors = !0, this._path = "\\\\?\\" + this.path.replace(/\//g, "\\"))), 
        this.basename = path.basename(props.path), this.dirname = path.dirname(props.path), 
        this.linkpath = props.linkpath || null, props.parent = props.root = null, this.size = props.size, 
        "string" == typeof props.mode && (props.mode = parseInt(props.mode, 8)), this.readable = !1, 
        this.writable = !0, this._buffer = [], this.ready = !1, this.filter = "function" == typeof props.filter ? props.filter : null, 
        this._stat(current);
    }
    function create(self) {
        mkdir(path.dirname(self._path), Writer.dirmode, (function(er, made) {
            return er ? self.error(er) : (self._madeDir = made, self._create());
        }));
    }
    function endChmod(self, want, current, path, cb) {
        var wantMode = want.mode, chmod = want.follow || "SymbolicLink" !== self.type ? "chmod" : "lchmod";
        if (!fs[chmod]) return cb();
        if ("number" != typeof wantMode) return cb();
        var curMode = current.mode & parseInt("0777", 8);
        if ((wantMode &= parseInt("0777", 8)) === curMode) return cb();
        fs[chmod](path, wantMode, cb);
    }
    function endChown(self, want, current, path, cb) {
        if ("win32" === process.platform) return cb();
        if (!process.getuid || 0 !== process.getuid()) return cb();
        if ("number" != typeof want.uid && "number" != typeof want.gid) return cb();
        if (current.uid === want.uid && current.gid === want.gid) return cb();
        var chown = self.props.follow || "SymbolicLink" !== self.type ? "chown" : "lchown";
        if (!fs[chown]) return cb();
        "number" != typeof want.uid && (want.uid = current.uid), "number" != typeof want.gid && (want.gid = current.gid), 
        fs[chown](path, want.uid, want.gid, cb);
    }
    function endUtimes(self, want, current, path, cb) {
        if (!fs.utimes || "win32" === process.platform) return cb();
        var utimes = want.follow || "SymbolicLink" !== self.type ? "utimes" : "lutimes";
        if ("lutimes" !== utimes || fs[utimes] || (utimes = "utimes"), !fs[utimes]) return cb();
        var curA = current.atime, curM = current.mtime, meA = want.atime, meM = want.mtime;
        if (void 0 === meA && (meA = curA), void 0 === meM && (meM = curM), isDate(meA) || (meA = new Date(meA)), 
        isDate(meM) || (meA = new Date(meM)), meA.getTime() === curA.getTime() && meM.getTime() === curM.getTime()) return cb();
        fs[utimes](path, meA, meM, cb);
    }
    function endMadeDir(self, p, cb) {
        var made = self._madeDir, d = path.dirname(p);
        !(function(self, p, cb) {
            var dirProps = {};
            Object.keys(self.props).forEach((function(k) {
                dirProps[k] = self.props[k], "mode" === k && "Directory" !== self.type && (dirProps[k] = dirProps[k] | parseInt("0111", 8));
            }));
            var todo = 3, errState = null;
            function next(er) {
                if (!errState) return er ? cb(errState = er) : 0 == --todo ? cb() : void 0;
            }
            fs.stat(p, (function(er, current) {
                if (er) return cb(errState = er);
                endChmod(self, dirProps, current, p, next), endChown(self, dirProps, current, p, next), 
                endUtimes(self, dirProps, current, p, next);
            }));
        })(self, d, (function(er) {
            return er ? cb(er) : d === made ? cb() : void endMadeDir(self, d, cb);
        }));
    }
    function isDate(d) {
        return "object" == typeof d && "[object Date]" === (function(d) {
            return Object.prototype.toString.call(d);
        })(d);
    }
    Writer.prototype._create = function() {
        var self = this;
        fs[self.props.follow ? "stat" : "lstat"](self._path, (function(er) {
            if (er) return self.warn("Cannot create " + self._path + "\nUnsupported type: " + self.type, "ENOTSUP");
            self._finish();
        }));
    }, Writer.prototype._stat = function(current) {
        var self = this, stat = self.props.follow ? "stat" : "lstat", who = self._proxy || self;
        function statCb(er, current) {
            return self.filter && !self.filter.call(who, who, current) ? (self._aborted = !0, 
            self.emit("end"), void self.emit("close")) : er || !current ? create(self) : (self._old = current, 
            getType(current) !== self.type || "File" === self.type && current.nlink > 1 ? rimraf(self._path, (function(er) {
                if (er) return self.error(er);
                self._old = null, create(self);
            })) : void create(self));
        }
        current ? statCb(null, current) : fs[stat](self._path, statCb);
    }, Writer.prototype._finish = function() {
        var self = this;
        if (self._finishing) ; else {
            self._finishing = !0;
            var todo = 0, errState = null, done = !1;
            if (self._old) self._old.atime = new Date(0), self._old.mtime = new Date(0), setProps(self._old); else {
                var stat = self.props.follow ? "stat" : "lstat";
                fs[stat](self._path, (function(er, current) {
                    if (er) return "ENOENT" !== er.code || "Link" !== self.type && "SymbolicLink" !== self.type || "win32" !== process.platform ? self.error(er) : (self.ready = !0, 
                    self.emit("ready"), self.emit("end"), self.emit("close"), void (self.end = self._finish = function() {}));
                    setProps(self._old = current);
                }));
            }
        }
        function setProps(current) {
            todo += 3, endChmod(self, self.props, current, self._path, next("chmod")), endChown(self, self.props, current, self._path, next("chown")), 
            endUtimes(self, self.props, current, self._path, next("utimes"));
        }
        function next(what) {
            return function(er) {
                if (!errState) {
                    if (er) return er.fstream_finish_call = what, self.error(errState = er);
                    if (!(--todo > 0 || done)) {
                        if (done = !0, !self._madeDir) return end();
                        endMadeDir(self, self._path, end);
                    }
                }
                function end(er) {
                    if (er) return er.fstream_finish_call = "setupMadeDir", self.error(er);
                    self.emit("end"), self.emit("close");
                }
            };
        }
    }, Writer.prototype.pipe = function() {
        this.error("Can't pipe from writable stream");
    }, Writer.prototype.add = function() {
        this.error("Can't add to non-Directory type");
    }, Writer.prototype.write = function() {
        return !0;
    };
}
