function(module, exports, __webpack_require__) {
    module.exports = LinkWriter;
    var fs = __webpack_require__(59), Writer = __webpack_require__(104), inherits = __webpack_require__(6), path = __webpack_require__(4), rimraf = __webpack_require__(513);
    function LinkWriter(props) {
        if (!(this instanceof LinkWriter)) throw new Error("LinkWriter must be called as constructor.");
        if (!("Link" === props.type && props.Link || "SymbolicLink" === props.type && props.SymbolicLink)) throw new Error("Non-link type " + props.type);
        "" === props.linkpath && (props.linkpath = "."), props.linkpath || this.error("Need linkpath property to create " + props.type), 
        Writer.call(this, props);
    }
    function clobber(self, lp, link) {
        rimraf(self._path, (function(er) {
            if (er) return self.error(er);
            !(function(self, lp, link) {
                fs[link](lp, self._path, (function(er) {
                    if (er) {
                        if ("ENOENT" !== er.code && "EACCES" !== er.code && "EPERM" !== er.code || "win32" !== process.platform) return self.error(er);
                        self.ready = !0, self.emit("ready"), self.emit("end"), self.emit("close"), self.end = self._finish = function() {};
                    }
                    finish(self);
                }));
            })(self, lp, link);
        }));
    }
    function finish(self) {
        self.ready = !0, self.emit("ready"), self._ended && !self._finished && self._finish();
    }
    inherits(LinkWriter, Writer), LinkWriter.prototype._create = function() {
        var self = this, hard = "Link" === self.type || "win32" === process.platform, link = hard ? "link" : "symlink", lp = hard ? path.resolve(self.dirname, self.linkpath) : self.linkpath;
        if (hard) return clobber(self, lp, link);
        fs.readlink(self._path, (function(er, p) {
            if (p && p === lp) return finish(self);
            clobber(self, lp, link);
        }));
    }, LinkWriter.prototype.end = function() {
        this._ended = !0, this.ready && (this._finished = !0, this._finish());
    };
}
