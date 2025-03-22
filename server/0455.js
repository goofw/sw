function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = Transform;
    var Duplex = __webpack_require__(78), util = __webpack_require__(32);
    function afterTransform(er, data) {
        var ts = this._transformState;
        ts.transforming = !1;
        var cb = ts.writecb;
        if (!cb) return this.emit("error", new Error("write callback called multiple times"));
        ts.writechunk = null, ts.writecb = null, null != data && this.push(data), cb(er);
        var rs = this._readableState;
        rs.reading = !1, (rs.needReadable || rs.length < rs.highWaterMark) && this._read(rs.highWaterMark);
    }
    function Transform(options) {
        if (!(this instanceof Transform)) return new Transform(options);
        Duplex.call(this, options), this._transformState = {
            afterTransform: afterTransform.bind(this),
            needTransform: !1,
            transforming: !1,
            writecb: null,
            writechunk: null,
            writeencoding: null
        }, this._readableState.needReadable = !0, this._readableState.sync = !1, options && ("function" == typeof options.transform && (this._transform = options.transform), 
        "function" == typeof options.flush && (this._flush = options.flush)), this.on("prefinish", prefinish);
    }
    function prefinish() {
        var _this = this;
        "function" == typeof this._flush ? this._flush((function(er, data) {
            done(_this, er, data);
        })) : done(this, null, null);
    }
    function done(stream, er, data) {
        if (er) return stream.emit("error", er);
        if (null != data && stream.push(data), stream._writableState.length) throw new Error("Calling transform done when ws.length != 0");
        if (stream._transformState.transforming) throw new Error("Calling transform done when still transforming");
        return stream.push(null);
    }
    util.inherits = __webpack_require__(96), util.inherits(Transform, Duplex), Transform.prototype.push = function(chunk, encoding) {
        return this._transformState.needTransform = !1, Duplex.prototype.push.call(this, chunk, encoding);
    }, Transform.prototype._transform = function(chunk, encoding, cb) {
        throw new Error("_transform() is not implemented");
    }, Transform.prototype._write = function(chunk, encoding, cb) {
        var ts = this._transformState;
        if (ts.writecb = cb, ts.writechunk = chunk, ts.writeencoding = encoding, !ts.transforming) {
            var rs = this._readableState;
            (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) && this._read(rs.highWaterMark);
        }
    }, Transform.prototype._read = function(n) {
        var ts = this._transformState;
        null !== ts.writechunk && ts.writecb && !ts.transforming ? (ts.transforming = !0, 
        this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform)) : ts.needTransform = !0;
    }, Transform.prototype._destroy = function(err, cb) {
        var _this2 = this;
        Duplex.prototype._destroy.call(this, err, (function(err2) {
            cb(err2), _this2.emit("close");
        }));
    };
}
