function(module, exports, __webpack_require__) {
    "use strict";
    function emitErrorAndCloseNT(self, err) {
        emitErrorNT(self, err), emitCloseNT(self);
    }
    function emitCloseNT(self) {
        self._writableState && !self._writableState.emitClose || self._readableState && !self._readableState.emitClose || self.emit("close");
    }
    function emitErrorNT(self, err) {
        self.emit("error", err);
    }
    module.exports = {
        destroy: function(err, cb) {
            var _this = this, readableDestroyed = this._readableState && this._readableState.destroyed, writableDestroyed = this._writableState && this._writableState.destroyed;
            return readableDestroyed || writableDestroyed ? (cb ? cb(err) : err && (this._writableState ? this._writableState.errorEmitted || (this._writableState.errorEmitted = !0, 
            process.nextTick(emitErrorNT, this, err)) : process.nextTick(emitErrorNT, this, err)), 
            this) : (this._readableState && (this._readableState.destroyed = !0), this._writableState && (this._writableState.destroyed = !0), 
            this._destroy(err || null, (function(err) {
                !cb && err ? _this._writableState ? _this._writableState.errorEmitted ? process.nextTick(emitCloseNT, _this) : (_this._writableState.errorEmitted = !0, 
                process.nextTick(emitErrorAndCloseNT, _this, err)) : process.nextTick(emitErrorAndCloseNT, _this, err) : cb ? (process.nextTick(emitCloseNT, _this), 
                cb(err)) : process.nextTick(emitCloseNT, _this);
            })), this);
        },
        undestroy: function() {
            this._readableState && (this._readableState.destroyed = !1, this._readableState.reading = !1, 
            this._readableState.ended = !1, this._readableState.endEmitted = !1), this._writableState && (this._writableState.destroyed = !1, 
            this._writableState.ended = !1, this._writableState.ending = !1, this._writableState.finalCalled = !1, 
            this._writableState.prefinished = !1, this._writableState.finished = !1, this._writableState.errorEmitted = !1);
        },
        errorOrDestroy: function(stream, err) {
            var rState = stream._readableState, wState = stream._writableState;
            rState && rState.autoDestroy || wState && wState.autoDestroy ? stream.destroy(err) : stream.emit("error", err);
        }
    };
}
