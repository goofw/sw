function(module, exports, __webpack_require__) {
    module.exports = Reader;
    var fs = __webpack_require__(59), Stream = __webpack_require__(3).Stream, inherits = __webpack_require__(6), path = __webpack_require__(4), getType = __webpack_require__(154), hardLinks = Reader.hardLinks = {}, Abstract = __webpack_require__(242);
    inherits(Reader, Abstract);
    var LinkReader = __webpack_require__(509);
    function Reader(props, currentStat) {
        var type, ClassType;
        if (!(this instanceof Reader)) return new Reader(props, currentStat);
        switch ("string" == typeof props && (props = {
            path: props
        }), props.type && "function" == typeof props.type ? ClassType = type = props.type : (type = getType(props), 
        ClassType = Reader), currentStat && !type && (props[type = getType(currentStat)] = !0, 
        props.type = type), type) {
          case "Directory":
            ClassType = __webpack_require__(510);
            break;

          case "Link":
          case "File":
            ClassType = __webpack_require__(511);
            break;

          case "SymbolicLink":
            ClassType = LinkReader;
            break;

          case "Socket":
            ClassType = __webpack_require__(1197);
            break;

          case null:
            ClassType = __webpack_require__(512);
        }
        if (!(this instanceof ClassType)) return new ClassType(props);
        Abstract.call(this), props.path || this.error("Must provide a path", null, !0), 
        this.readable = !0, this.writable = !1, this.type = type, this.props = props, this.depth = props.depth = props.depth || 0, 
        this.parent = props.parent || null, this.root = props.root || props.parent && props.parent.root || this, 
        this._path = this.path = path.resolve(props.path), "win32" === process.platform && (this.path = this._path = this.path.replace(/\?/g, "_"), 
        this._path.length >= 260 && (this._swallowErrors = !0, this._path = "\\\\?\\" + this.path.replace(/\//g, "\\"))), 
        this.basename = props.basename = path.basename(this.path), this.dirname = props.dirname = path.dirname(this.path), 
        props.parent = props.root = null, this.size = props.size, this.filter = "function" == typeof props.filter ? props.filter : null, 
        "alpha" === props.sort && (props.sort = alphasort), this._stat(currentStat);
    }
    function alphasort(a, b) {
        return a === b ? 0 : a.toLowerCase() > b.toLowerCase() ? 1 : a.toLowerCase() < b.toLowerCase() ? -1 : a > b ? 1 : -1;
    }
    Reader.prototype._stat = function(currentStat) {
        var self = this, props = self.props, stat = props.follow ? "stat" : "lstat";
        function statCb(er, props_) {
            if (er) return self.error(er);
            if (Object.keys(props_).forEach((function(k) {
                props[k] = props_[k];
            })), void 0 !== self.size && props.size !== self.size) return self.error("incorrect size");
            self.size = props.size;
            var type = getType(props);
            if (!1 !== props.hardlinks && "Directory" !== type && props.nlink && props.nlink > 1) {
                var k = props.dev + ":" + props.ino;
                hardLinks[k] !== self._path && hardLinks[k] ? (type = self.type = self.props.type = "Link", 
                self.Link = self.props.Link = !0, self.linkpath = self.props.linkpath = hardLinks[k], 
                self._stat = self._read = LinkReader.prototype._read) : hardLinks[k] = self._path;
            }
            if (self.type && self.type !== type && self.error("Unexpected type: " + type), self.filter) {
                var who = self._proxy || self;
                if (!self.filter.call(who, who, props)) return void (self._disowned || (self.abort(), 
                self.emit("end"), self.emit("close")));
            }
            var events = [ "_stat", "stat", "ready" ], e = 0;
            !(function go() {
                if (self._aborted) return self.emit("end"), void self.emit("close");
                if (self._paused && "Directory" !== self.type) self.once("resume", go); else {
                    var ev = events[e++];
                    if (!ev) return self._read();
                    self.emit(ev, props), go();
                }
            })();
        }
        currentStat ? process.nextTick(statCb.bind(null, null, currentStat)) : fs[stat](self._path, statCb);
    }, Reader.prototype.pipe = function(dest) {
        var self = this;
        return "function" == typeof dest.add && self.on("entry", (function(entry) {
            !1 === dest.add(entry) && self.pause();
        })), Stream.prototype.pipe.apply(this, arguments);
    }, Reader.prototype.pause = function(who) {
        this._paused = !0, who = who || this, this.emit("pause", who), this._stream && this._stream.pause(who);
    }, Reader.prototype.resume = function(who) {
        this._paused = !1, who = who || this, this.emit("resume", who), this._stream && this._stream.resume(who), 
        this._read();
    }, Reader.prototype._read = function() {
        this.error("Cannot read unknown type: " + this.type);
    };
}
