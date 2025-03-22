function(module, exports, __webpack_require__) {
    module.exports = LinkReader;
    var fs = __webpack_require__(59), inherits = __webpack_require__(6), Reader = __webpack_require__(82);
    function LinkReader(props) {
        if (!(this instanceof LinkReader)) throw new Error("LinkReader must be called as constructor.");
        if (!("Link" === props.type && props.Link || "SymbolicLink" === props.type && props.SymbolicLink)) throw new Error("Non-link type " + props.type);
        Reader.call(this, props);
    }
    inherits(LinkReader, Reader), LinkReader.prototype._stat = function(currentStat) {
        var self = this;
        fs.readlink(self._path, (function(er, linkpath) {
            if (er) return self.error(er);
            self.linkpath = self.props.linkpath = linkpath, self.emit("linkpath", linkpath), 
            Reader.prototype._stat.call(self, currentStat);
        }));
    }, LinkReader.prototype._read = function() {
        this._paused || this._ended || (this.emit("end"), this.emit("close"), this._ended = !0);
    };
}
