function(module, exports, __webpack_require__) {
    module.exports = Abstract;
    var Stream = __webpack_require__(3).Stream;
    function Abstract() {
        Stream.call(this);
    }
    function decorate(er, code, self) {
        return er instanceof Error || (er = new Error(er)), er.code = er.code || code, er.path = er.path || self.path, 
        er.fstream_type = er.fstream_type || self.type, er.fstream_path = er.fstream_path || self.path, 
        self._path !== self.path && (er.fstream_unc_path = er.fstream_unc_path || self._path), 
        self.linkpath && (er.fstream_linkpath = er.fstream_linkpath || self.linkpath), er.fstream_class = er.fstream_class || self.constructor.name, 
        er.fstream_stack = er.fstream_stack || (new Error).stack.split(/\n/).slice(3).map((function(s) {
            return s.replace(/^ {4}at /, "");
        })), er;
    }
    __webpack_require__(6)(Abstract, Stream), Abstract.prototype.on = function(ev, fn) {
        return "ready" === ev && this.ready ? process.nextTick(fn.bind(this)) : Stream.prototype.on.call(this, ev, fn), 
        this;
    }, Abstract.prototype.abort = function() {
        this._aborted = !0, this.emit("abort");
    }, Abstract.prototype.destroy = function() {}, Abstract.prototype.warn = function(msg, code) {
        var er = decorate(msg, code, this);
        this.listeners("warn") ? this.emit("warn", er) : console.error("%s %s\npath = %s\nsyscall = %s\nfstream_type = %s\nfstream_path = %s\nfstream_unc_path = %s\nfstream_class = %s\nfstream_stack =\n%s\n", code || "UNKNOWN", er.stack, er.path, er.syscall, er.fstream_type, er.fstream_path, er.fstream_unc_path, er.fstream_class, er.fstream_stack.join("\n"));
    }, Abstract.prototype.info = function(msg, code) {
        this.emit("info", msg, code);
    }, Abstract.prototype.error = function(msg, code, th) {
        var er = decorate(msg, code, this);
        if (th) throw er;
        this.emit("error", er);
    };
}
