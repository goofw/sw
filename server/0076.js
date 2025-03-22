function(module, exports, __webpack_require__) {
    "use strict";
    var objectKeys = Object.keys || function(obj) {
        var keys = [];
        for (var key in obj) keys.push(key);
        return keys;
    };
    module.exports = Duplex;
    var Readable = __webpack_require__(423), Writable = __webpack_require__(427);
    __webpack_require__(6)(Duplex, Readable);
    for (var keys = objectKeys(Writable.prototype), v = 0; v < keys.length; v++) {
        var method = keys[v];
        Duplex.prototype[method] || (Duplex.prototype[method] = Writable.prototype[method]);
    }
    function Duplex(options) {
        if (!(this instanceof Duplex)) return new Duplex(options);
        Readable.call(this, options), Writable.call(this, options), this.allowHalfOpen = !0, 
        options && (!1 === options.readable && (this.readable = !1), !1 === options.writable && (this.writable = !1), 
        !1 === options.allowHalfOpen && (this.allowHalfOpen = !1, this.once("end", onend)));
    }
    function onend() {
        this._writableState.ended || process.nextTick(onEndNT, this);
    }
    function onEndNT(self) {
        self.end();
    }
    Object.defineProperty(Duplex.prototype, "writableHighWaterMark", {
        enumerable: !1,
        get: function() {
            return this._writableState.highWaterMark;
        }
    }), Object.defineProperty(Duplex.prototype, "writableBuffer", {
        enumerable: !1,
        get: function() {
            return this._writableState && this._writableState.getBuffer();
        }
    }), Object.defineProperty(Duplex.prototype, "writableLength", {
        enumerable: !1,
        get: function() {
            return this._writableState.length;
        }
    }), Object.defineProperty(Duplex.prototype, "destroyed", {
        enumerable: !1,
        get: function() {
            return void 0 !== this._readableState && void 0 !== this._writableState && this._readableState.destroyed && this._writableState.destroyed;
        },
        set: function(value) {
            void 0 !== this._readableState && void 0 !== this._writableState && (this._readableState.destroyed = value, 
            this._writableState.destroyed = value);
        }
    });
}
