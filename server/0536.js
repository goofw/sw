function(module, exports, __webpack_require__) {
    "use strict";
    var Buffer = __webpack_require__(10).Buffer, Transform = __webpack_require__(3).Transform;
    function IconvLiteEncoderStream(conv, options) {
        this.conv = conv, (options = options || {}).decodeStrings = !1, Transform.call(this, options);
    }
    function IconvLiteDecoderStream(conv, options) {
        this.conv = conv, (options = options || {}).encoding = this.encoding = "utf8", Transform.call(this, options);
    }
    module.exports = function(iconv) {
        iconv.encodeStream = function(encoding, options) {
            return new IconvLiteEncoderStream(iconv.getEncoder(encoding, options), options);
        }, iconv.decodeStream = function(encoding, options) {
            return new IconvLiteDecoderStream(iconv.getDecoder(encoding, options), options);
        }, iconv.supportsStreams = !0, iconv.IconvLiteEncoderStream = IconvLiteEncoderStream, 
        iconv.IconvLiteDecoderStream = IconvLiteDecoderStream, iconv._collect = IconvLiteDecoderStream.prototype.collect;
    }, IconvLiteEncoderStream.prototype = Object.create(Transform.prototype, {
        constructor: {
            value: IconvLiteEncoderStream
        }
    }), IconvLiteEncoderStream.prototype._transform = function(chunk, encoding, done) {
        if ("string" != typeof chunk) return done(new Error("Iconv encoding stream needs strings as its input."));
        try {
            var res = this.conv.write(chunk);
            res && res.length && this.push(res), done();
        } catch (e) {
            done(e);
        }
    }, IconvLiteEncoderStream.prototype._flush = function(done) {
        try {
            var res = this.conv.end();
            res && res.length && this.push(res), done();
        } catch (e) {
            done(e);
        }
    }, IconvLiteEncoderStream.prototype.collect = function(cb) {
        var chunks = [];
        return this.on("error", cb), this.on("data", (function(chunk) {
            chunks.push(chunk);
        })), this.on("end", (function() {
            cb(null, Buffer.concat(chunks));
        })), this;
    }, IconvLiteDecoderStream.prototype = Object.create(Transform.prototype, {
        constructor: {
            value: IconvLiteDecoderStream
        }
    }), IconvLiteDecoderStream.prototype._transform = function(chunk, encoding, done) {
        if (!Buffer.isBuffer(chunk)) return done(new Error("Iconv decoding stream needs buffers as its input."));
        try {
            var res = this.conv.write(chunk);
            res && res.length && this.push(res, this.encoding), done();
        } catch (e) {
            done(e);
        }
    }, IconvLiteDecoderStream.prototype._flush = function(done) {
        try {
            var res = this.conv.end();
            res && res.length && this.push(res, this.encoding), done();
        } catch (e) {
            done(e);
        }
    }, IconvLiteDecoderStream.prototype.collect = function(cb) {
        var res = "";
        return this.on("error", cb), this.on("data", (function(chunk) {
            res += chunk;
        })), this.on("end", (function() {
            cb(null, res);
        })), this;
    };
}
