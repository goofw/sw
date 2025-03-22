function(module, exports, __webpack_require__) {
    function BufferPool(initialSize, growStrategy, shrinkStrategy) {
        if (this instanceof BufferPool == 0) throw new TypeError("Classes can't be function-called");
        "function" == typeof initialSize ? (shrinkStrategy = growStrategy, growStrategy = initialSize, 
        initialSize = 0) : void 0 === initialSize && (initialSize = 0), this._growStrategy = (growStrategy || function(db, size) {
            return db.used + size;
        }).bind(null, this), this._shrinkStrategy = (shrinkStrategy || function(db) {
            return initialSize;
        }).bind(null, this), this._buffer = initialSize ? new Buffer(initialSize) : null, 
        this._offset = 0, this._used = 0, this._changeFactor = 0, this.__defineGetter__("size", (function() {
            return null == this._buffer ? 0 : this._buffer.length;
        })), this.__defineGetter__("used", (function() {
            return this._used;
        }));
    }
    __webpack_require__(0), BufferPool.prototype.get = function(length) {
        if (null == this._buffer || this._offset + length > this._buffer.length) {
            var newBuf = new Buffer(this._growStrategy(length));
            this._buffer = newBuf, this._offset = 0;
        }
        this._used += length;
        var buf = this._buffer.slice(this._offset, this._offset + length);
        return this._offset += length, buf;
    }, BufferPool.prototype.reset = function(forceNewBuffer) {
        var len = this._shrinkStrategy();
        len < this.size && (this._changeFactor -= 1), (forceNewBuffer || this._changeFactor < -2) && (this._changeFactor = 0, 
        this._buffer = len ? new Buffer(len) : null), this._offset = 0, this._used = 0;
    }, module.exports = BufferPool;
}
