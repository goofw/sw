function(module, exports, __webpack_require__) {
    module.exports = Duplex;
    var objectKeys = Object.keys || function(obj) {
        var keys = [];
        for (var key in obj) keys.push(key);
        return keys;
    }, util = __webpack_require__(32);
    util.inherits = __webpack_require__(6);
    var Readable = __webpack_require__(383), Writable = __webpack_require__(384);
    function Duplex(options) {
        if (!(this instanceof Duplex)) return new Duplex(options);
        Readable.call(this, options), Writable.call(this, options), options && !1 === options.readable && (this.readable = !1), 
        options && !1 === options.writable && (this.writable = !1), this.allowHalfOpen = !0, 
        options && !1 === options.allowHalfOpen && (this.allowHalfOpen = !1), this.once("end", onend);
    }
    function onend() {
        this.allowHalfOpen || this._writableState.ended || process.nextTick(this.end.bind(this));
    }
    util.inherits(Duplex, Readable), (function(xs, f) {
        for (var i = 0, l = xs.length; i < l; i++) method = xs[i], Duplex.prototype[method] || (Duplex.prototype[method] = Writable.prototype[method]);
        var method;
    })(objectKeys(Writable.prototype));
}
