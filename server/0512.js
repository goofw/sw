function(module, exports, __webpack_require__) {
    module.exports = ProxyReader;
    var Reader = __webpack_require__(82), getType = __webpack_require__(154), inherits = __webpack_require__(6), fs = __webpack_require__(59);
    function ProxyReader(props) {
        if (!(this instanceof ProxyReader)) throw new Error("ProxyReader must be called as constructor.");
        this.props = props, this._buffer = [], this.ready = !1, Reader.call(this, props);
    }
    inherits(ProxyReader, Reader), ProxyReader.prototype._stat = function() {
        var self = this, props = self.props, stat = props.follow ? "stat" : "lstat";
        fs[stat](props.path, (function(er, current) {
            var type;
            type = er || !current ? "File" : getType(current), props[type] = !0, props.type = self.type = type, 
            self._old = current, self._addProxy(Reader(props, current));
        }));
    }, ProxyReader.prototype._addProxy = function(proxy) {
        var self = this;
        if (self._proxyTarget) return self.error("proxy already set");
        self._proxyTarget = proxy, proxy._proxy = self, [ "error", "data", "end", "close", "linkpath", "entry", "entryEnd", "child", "childEnd", "warn", "stat" ].forEach((function(ev) {
            proxy.on(ev, self.emit.bind(self, ev));
        })), self.emit("proxy", proxy), proxy.on("ready", (function() {
            self.ready = !0, self.emit("ready");
        }));
        var calls = self._buffer;
        self._buffer.length = 0, calls.forEach((function(c) {
            proxy[c[0]].apply(proxy, c[1]);
        }));
    }, ProxyReader.prototype.pause = function() {
        return !!this._proxyTarget && this._proxyTarget.pause();
    }, ProxyReader.prototype.resume = function() {
        return !!this._proxyTarget && this._proxyTarget.resume();
    };
}
