function(module, exports, __webpack_require__) {
    module.exports = Transform;
    var Duplex = __webpack_require__(73), util = __webpack_require__(32);
    function TransformState(options, stream) {
        this.afterTransform = function(er, data) {
            return (function(stream, er, data) {
                var ts = stream._transformState;
                ts.transforming = !1;
                var cb = ts.writecb;
                if (!cb) return stream.emit("error", new Error("no writecb in Transform class"));
                ts.writechunk = null, ts.writecb = null, util.isNullOrUndefined(data) || stream.push(data), 
                cb && cb(er);
                var rs = stream._readableState;
                rs.reading = !1, (rs.needReadable || rs.length < rs.highWaterMark) && stream._read(rs.highWaterMark);
            })(stream, er, data);
        }, this.needTransform = !1, this.transforming = !1, this.writecb = null, this.writechunk = null;
    }
    function Transform(options) {
        if (!(this instanceof Transform)) return new Transform(options);
        Duplex.call(this, options), this._transformState = new TransformState(options, this);
        var stream = this;
        this._readableState.needReadable = !0, this._readableState.sync = !1, this.once("prefinish", (function() {
            util.isFunction(this._flush) ? this._flush((function(er) {
                done(stream, er);
            })) : done(stream);
        }));
    }
    function done(stream, er) {
        if (er) return stream.emit("error", er);
        var ws = stream._writableState, ts = stream._transformState;
        if (ws.length) throw new Error("calling transform done when ws.length != 0");
        if (ts.transforming) throw new Error("calling transform done when still transforming");
        return stream.push(null);
    }
    util.inherits = __webpack_require__(6), util.inherits(Transform, Duplex), Transform.prototype.push = function(chunk, encoding) {
        return this._transformState.needTransform = !1, Duplex.prototype.push.call(this, chunk, encoding);
    }, Transform.prototype._transform = function(chunk, encoding, cb) {
        throw new Error("not implemented");
    }, Transform.prototype._write = function(chunk, encoding, cb) {
        var ts = this._transformState;
        if (ts.writecb = cb, ts.writechunk = chunk, ts.writeencoding = encoding, !ts.transforming) {
            var rs = this._readableState;
            (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) && this._read(rs.highWaterMark);
        }
    }, Transform.prototype._read = function(n) {
        var ts = this._transformState;
        util.isNull(ts.writechunk) || !ts.writecb || ts.transforming ? ts.needTransform = !0 : (ts.transforming = !0, 
        this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform));
    };
}
