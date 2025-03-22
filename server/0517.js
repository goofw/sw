function(module, exports, __webpack_require__) {
    module.exports = ProxyWriter;
    var Writer = __webpack_require__(104), getType = __webpack_require__(154), inherits = __webpack_require__(6), collect = __webpack_require__(243), fs = __webpack_require__(2);
    function ProxyWriter(props) {
        if (!(this instanceof ProxyWriter)) throw new Error("ProxyWriter must be called as constructor.");
        this.props = props, this._needDrain = !1, Writer.call(this, props);
    }
    inherits(ProxyWriter, Writer), ProxyWriter.prototype._stat = function() {
        var self = this, props = self.props, stat = props.follow ? "stat" : "lstat";
        fs[stat](props.path, (function(er, current) {
            var type;
            type = er || !current ? "File" : getType(current), props[type] = !0, props.type = self.type = type, 
            self._old = current, self._addProxy(Writer(props, current));
        }));
    }, ProxyWriter.prototype._addProxy = function(proxy) {
        var self = this;
        if (self._proxy) return self.error("proxy already set");
        self._proxy = proxy, [ "ready", "error", "close", "pipe", "drain", "warn" ].forEach((function(ev) {
            proxy.on(ev, self.emit.bind(self, ev));
        })), self.emit("proxy", proxy), self._buffer.forEach((function(c) {
            proxy[c[0]].apply(proxy, c[1]);
        })), self._buffer.length = 0, self._needsDrain && self.emit("drain");
    }, ProxyWriter.prototype.add = function(entry) {
        return collect(entry), this._proxy ? this._proxy.add(entry) : (this._buffer.push([ "add", [ entry ] ]), 
        this._needDrain = !0, !1);
    }, ProxyWriter.prototype.write = function(c) {
        return this._proxy ? this._proxy.write(c) : (this._buffer.push([ "write", [ c ] ]), 
        this._needDrain = !0, !1);
    }, ProxyWriter.prototype.end = function(c) {
        return this._proxy ? this._proxy.end(c) : (this._buffer.push([ "end", [ c ] ]), 
        !1);
    };
}
