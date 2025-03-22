function(module, exports, __webpack_require__) {
    module.exports = DirReader;
    var fs = __webpack_require__(59), inherits = __webpack_require__(6), path = __webpack_require__(4), Reader = __webpack_require__(82), assert = __webpack_require__(24).ok;
    function DirReader(props) {
        if (!(this instanceof DirReader)) throw new Error("DirReader must be called as constructor.");
        if ("Directory" !== props.type || !props.Directory) throw new Error("Non-directory type " + props.type);
        this.entries = null, this._index = -1, this._paused = !1, this._length = -1, props.sort && (this.sort = props.sort), 
        Reader.call(this, props);
    }
    inherits(DirReader, Reader), DirReader.prototype._getEntries = function() {
        var self = this;
        self._gotEntries || (self._gotEntries = !0, fs.readdir(self._path, (function(er, entries) {
            if (er) return self.error(er);
            function processEntries() {
                self._length = self.entries.length, "function" == typeof self.sort && (self.entries = self.entries.sort(self.sort.bind(self))), 
                self._read();
            }
            self.entries = entries, self.emit("entries", entries), self._paused ? self.once("resume", processEntries) : processEntries();
        })));
    }, DirReader.prototype._read = function() {
        var self = this;
        if (!self.entries) return self._getEntries();
        if (!(self._paused || self._currentEntry || self._aborted)) if (self._index++, self._index >= self.entries.length) self._ended || (self._ended = !0, 
        self.emit("end"), self.emit("close")); else {
            var p = path.resolve(self._path, self.entries[self._index]);
            assert(p !== self._path), assert(self.entries[self._index]), self._currentEntry = p, 
            fs[self.props.follow ? "stat" : "lstat"](p, (function(er, stat) {
                if (er) return self.error(er);
                var who = self._proxy || self;
                stat.path = p, stat.basename = path.basename(p), stat.dirname = path.dirname(p);
                var childProps = self.getChildProps.call(who, stat);
                childProps.path = p, childProps.basename = path.basename(p), childProps.dirname = path.dirname(p);
                var entry = Reader(childProps, stat);
                self._currentEntry = entry, entry.on("pause", (function(who) {
                    self._paused || entry._disowned || self.pause(who);
                })), entry.on("resume", (function(who) {
                    self._paused && !entry._disowned && self.resume(who);
                })), entry.on("stat", (function(props) {
                    self.emit("_entryStat", entry, props), entry._aborted || (entry._paused ? entry.once("resume", (function() {
                        self.emit("entryStat", entry, props);
                    })) : self.emit("entryStat", entry, props));
                })), entry.on("ready", (function EMITCHILD() {
                    if (self._paused) return entry.pause(self), self.once("resume", EMITCHILD);
                    "Socket" === entry.type ? self.emit("socket", entry) : self.emitEntry(entry);
                }));
                var ended = !1;
                function onend() {
                    ended || (ended = !0, self.emit("childEnd", entry), self.emit("entryEnd", entry), 
                    self._currentEntry = null, self._paused || self._read());
                }
                entry.on("close", onend), entry.on("disown", onend), entry.on("error", (function(er) {
                    entry._swallowErrors ? (self.warn(er), entry.emit("end"), entry.emit("close")) : self.emit("error", er);
                })), [ "child", "childEnd", "warn" ].forEach((function(ev) {
                    entry.on(ev, self.emit.bind(self, ev));
                }));
            }));
        }
    }, DirReader.prototype.disown = function(entry) {
        entry.emit("beforeDisown"), entry._disowned = !0, entry.parent = entry.root = null, 
        entry === this._currentEntry && (this._currentEntry = null), entry.emit("disown");
    }, DirReader.prototype.getChildProps = function() {
        return {
            depth: this.depth + 1,
            root: this.root || this,
            parent: this,
            follow: this.follow,
            filter: this.filter,
            sort: this.props.sort,
            hardlinks: this.props.hardlinks
        };
    }, DirReader.prototype.pause = function(who) {
        this._paused || (who = who || this, this._paused = !0, this._currentEntry && this._currentEntry.pause && this._currentEntry.pause(who), 
        this.emit("pause", who));
    }, DirReader.prototype.resume = function(who) {
        this._paused && (who = who || this, this._paused = !1, this.emit("resume", who), 
        this._paused || (this._currentEntry ? this._currentEntry.resume && this._currentEntry.resume(who) : this._read()));
    }, DirReader.prototype.emitEntry = function(entry) {
        this.emit("entry", entry), this.emit("child", entry);
    };
}
