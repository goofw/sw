function(module, exports, __webpack_require__) {
    module.exports = DirWriter;
    var Writer = __webpack_require__(104), inherits = __webpack_require__(6), mkdir = __webpack_require__(170), path = __webpack_require__(4), collect = __webpack_require__(243);
    function DirWriter(props) {
        this instanceof DirWriter || this.error("DirWriter must be called as constructor.", null, !0), 
        "Directory" === props.type && props.Directory || this.error("Non-directory type " + props.type + " " + JSON.stringify(props), null, !0), 
        Writer.call(this, props);
    }
    inherits(DirWriter, Writer), DirWriter.prototype._create = function() {
        var self = this;
        mkdir(self._path, Writer.dirmode, (function(er) {
            if (er) return self.error(er);
            self.ready = !0, self.emit("ready"), self._process();
        }));
    }, DirWriter.prototype.write = function() {
        return !0;
    }, DirWriter.prototype.end = function() {
        this._ended = !0, this._process();
    }, DirWriter.prototype.add = function(entry) {
        return collect(entry), !this.ready || this._currentEntry ? (this._buffer.push(entry), 
        !1) : this._ended ? this.error("add after end") : (this._buffer.push(entry), this._process(), 
        0 === this._buffer.length);
    }, DirWriter.prototype._process = function() {
        var self = this;
        if (!self._processing) {
            var entry = self._buffer.shift();
            if (!entry) return self.emit("drain"), void (self._ended && self._finish());
            self._processing = !0, self.emit("entry", entry);
            var pp, p = entry;
            do {
                if ((pp = p._path || p.path) === self.root._path || pp === self._path || pp && 0 === pp.indexOf(self._path)) return self._processing = !1, 
                entry._collected && entry.pipe(), self._process();
                p = p.parent;
            } while (p);
            var props = {
                parent: self,
                root: self.root || self,
                type: entry.type,
                depth: self.depth + 1
            };
            pp = entry._path || entry.path || entry.props.path, entry.parent && (pp = pp.substr(entry.parent._path.length + 1)), 
            props.path = path.join(self.path, path.join("/", pp)), props.filter = self.filter, 
            Object.keys(entry.props).forEach((function(k) {
                props.hasOwnProperty(k) || (props[k] = entry.props[k]);
            }));
            var child = self._currentChild = new Writer(props);
            child.on("ready", (function() {
                entry.pipe(child), entry.resume();
            })), child.on("error", (function(er) {
                child._swallowErrors ? (self.warn(er), child.emit("end"), child.emit("close")) : self.emit("error", er);
            })), child.on("close", (function() {
                ended || (ended = !0, self._currentChild = null, self._processing = !1, self._process());
            }));
            var ended = !1;
        }
    };
}
