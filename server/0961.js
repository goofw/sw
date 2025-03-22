function(module, exports, __webpack_require__) {
    var Writable = __webpack_require__(77).Writable, inherits = __webpack_require__(6), bufferFrom = __webpack_require__(387);
    if ("undefined" == typeof Uint8Array) var U8 = __webpack_require__(965).Uint8Array; else U8 = Uint8Array;
    function ConcatStream(opts, cb) {
        if (!(this instanceof ConcatStream)) return new ConcatStream(opts, cb);
        "function" == typeof opts && (cb = opts, opts = {}), opts || (opts = {});
        var encoding = opts.encoding, shouldInferEncoding = !1;
        encoding ? "u8" !== (encoding = String(encoding).toLowerCase()) && "uint8" !== encoding || (encoding = "uint8array") : shouldInferEncoding = !0, 
        Writable.call(this, {
            objectMode: !0
        }), this.encoding = encoding, this.shouldInferEncoding = shouldInferEncoding, cb && this.on("finish", (function() {
            cb(this.getBody());
        })), this.body = [];
    }
    function isBufferish(p) {
        return "string" == typeof p || (arr = p, /Array\]$/.test(Object.prototype.toString.call(arr))) || p && "function" == typeof p.subarray;
        var arr;
    }
    module.exports = ConcatStream, inherits(ConcatStream, Writable), ConcatStream.prototype._write = function(chunk, enc, next) {
        this.body.push(chunk), next();
    }, ConcatStream.prototype.inferEncoding = function(buff) {
        var firstBuffer = void 0 === buff ? this.body[0] : buff;
        return Buffer.isBuffer(firstBuffer) ? "buffer" : "undefined" != typeof Uint8Array && firstBuffer instanceof Uint8Array ? "uint8array" : Array.isArray(firstBuffer) ? "array" : "string" == typeof firstBuffer ? "string" : "[object Object]" === Object.prototype.toString.call(firstBuffer) ? "object" : "buffer";
    }, ConcatStream.prototype.getBody = function() {
        return this.encoding || 0 !== this.body.length ? (this.shouldInferEncoding && (this.encoding = this.inferEncoding()), 
        "array" === this.encoding ? (function(parts) {
            for (var res = [], i = 0; i < parts.length; i++) res.push.apply(res, parts[i]);
            return res;
        })(this.body) : "string" === this.encoding ? (function(parts) {
            for (var strings = [], i = 0; i < parts.length; i++) {
                var p = parts[i];
                "string" == typeof p || Buffer.isBuffer(p) ? strings.push(p) : isBufferish(p) ? strings.push(bufferFrom(p)) : strings.push(bufferFrom(String(p)));
            }
            return strings = Buffer.isBuffer(parts[0]) ? (strings = Buffer.concat(strings)).toString("utf8") : strings.join("");
        })(this.body) : "buffer" === this.encoding ? (function(parts) {
            for (var bufs = [], i = 0; i < parts.length; i++) {
                var p = parts[i];
                Buffer.isBuffer(p) ? bufs.push(p) : isBufferish(p) ? bufs.push(bufferFrom(p)) : bufs.push(bufferFrom(String(p)));
            }
            return Buffer.concat(bufs);
        })(this.body) : "uint8array" === this.encoding ? (function(parts) {
            for (var len = 0, i = 0; i < parts.length; i++) "string" == typeof parts[i] && (parts[i] = bufferFrom(parts[i])), 
            len += parts[i].length;
            for (var u8 = new U8(len), offset = (i = 0, 0); i < parts.length; i++) for (var part = parts[i], j = 0; j < part.length; j++) u8[offset++] = part[j];
            return u8;
        })(this.body) : this.body) : [];
    }, Array.isArray;
}
