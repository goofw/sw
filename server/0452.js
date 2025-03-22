function(module, exports, __webpack_require__) {
    "use strict";
    var pna = __webpack_require__(53);
    function emitErrorNT(self, err) {
        self.emit("error", err);
    }
    module.exports = {
        destroy: function(err, cb) {
            var _this = this, readableDestroyed = this._readableState && this._readableState.destroyed, writableDestroyed = this._writableState && this._writableState.destroyed;
            return readableDestroyed || writableDestroyed ? (cb ? cb(err) : !err || this._writableState && this._writableState.errorEmitted || pna.nextTick(emitErrorNT, this, err), 
            this) : (this._readableState && (this._readableState.destroyed = !0), this._writableState && (this._writableState.destroyed = !0), 
            this._destroy(err || null, (function(err) {
                !cb && err ? (pna.nextTick(emitErrorNT, _this, err), _this._writableState && (_this._writableState.errorEmitted = !0)) : cb && cb(err);
            })), this);
        },
        undestroy: function() {
            this._readableState && (this._readableState.destroyed = !1, this._readableState.reading = !1, 
            this._readableState.ended = !1, this._readableState.endEmitted = !1), this._writableState && (this._writableState.destroyed = !1, 
            this._writableState.ended = !1, this._writableState.ending = !1, this._writableState.finished = !1, 
            this._writableState.errorEmitted = !1);
        }
    };
}
