function(module, exports, __webpack_require__) {
    "use strict";
    var Buffer = __webpack_require__(10).Buffer;
    module.exports = function(iconv) {
        var original = void 0;
        iconv.supportsNodeEncodingsExtension = !(Buffer.from || new Buffer(0) instanceof Uint8Array), 
        iconv.extendNodeEncodings = function() {
            if (!original) {
                if (original = {}, !iconv.supportsNodeEncodingsExtension) return console.error("ACTION NEEDED: require('iconv-lite').extendNodeEncodings() is not supported in your version of Node"), 
                void console.error("See more info at https://github.com/ashtuchkin/iconv-lite/wiki/Node-v4-compatibility");
                var nodeNativeEncodings = {
                    hex: !0,
                    utf8: !0,
                    "utf-8": !0,
                    ascii: !0,
                    binary: !0,
                    base64: !0,
                    ucs2: !0,
                    "ucs-2": !0,
                    utf16le: !0,
                    "utf-16le": !0
                };
                Buffer.isNativeEncoding = function(enc) {
                    return enc && nodeNativeEncodings[enc.toLowerCase()];
                };
                var SlowBuffer = __webpack_require__(10).SlowBuffer;
                if (original.SlowBufferToString = SlowBuffer.prototype.toString, SlowBuffer.prototype.toString = function(encoding, start, end) {
                    return encoding = String(encoding || "utf8").toLowerCase(), Buffer.isNativeEncoding(encoding) ? original.SlowBufferToString.call(this, encoding, start, end) : (void 0 === start && (start = 0), 
                    void 0 === end && (end = this.length), iconv.decode(this.slice(start, end), encoding));
                }, original.SlowBufferWrite = SlowBuffer.prototype.write, SlowBuffer.prototype.write = function(string, offset, length, encoding) {
                    if (isFinite(offset)) isFinite(length) || (encoding = length, length = void 0); else {
                        var swap = encoding;
                        encoding = offset, offset = length, length = swap;
                    }
                    offset = +offset || 0;
                    var remaining = this.length - offset;
                    if (length ? (length = +length) > remaining && (length = remaining) : length = remaining, 
                    encoding = String(encoding || "utf8").toLowerCase(), Buffer.isNativeEncoding(encoding)) return original.SlowBufferWrite.call(this, string, offset, length, encoding);
                    if (string.length > 0 && (length < 0 || offset < 0)) throw new RangeError("attempt to write beyond buffer bounds");
                    var buf = iconv.encode(string, encoding);
                    return buf.length < length && (length = buf.length), buf.copy(this, offset, 0, length), 
                    length;
                }, original.BufferIsEncoding = Buffer.isEncoding, Buffer.isEncoding = function(encoding) {
                    return Buffer.isNativeEncoding(encoding) || iconv.encodingExists(encoding);
                }, original.BufferByteLength = Buffer.byteLength, Buffer.byteLength = SlowBuffer.byteLength = function(str, encoding) {
                    return encoding = String(encoding || "utf8").toLowerCase(), Buffer.isNativeEncoding(encoding) ? original.BufferByteLength.call(this, str, encoding) : iconv.encode(str, encoding).length;
                }, original.BufferToString = Buffer.prototype.toString, Buffer.prototype.toString = function(encoding, start, end) {
                    return encoding = String(encoding || "utf8").toLowerCase(), Buffer.isNativeEncoding(encoding) ? original.BufferToString.call(this, encoding, start, end) : (void 0 === start && (start = 0), 
                    void 0 === end && (end = this.length), iconv.decode(this.slice(start, end), encoding));
                }, original.BufferWrite = Buffer.prototype.write, Buffer.prototype.write = function(string, offset, length, encoding) {
                    var _offset = offset, _length = length, _encoding = encoding;
                    if (isFinite(offset)) isFinite(length) || (encoding = length, length = void 0); else {
                        var swap = encoding;
                        encoding = offset, offset = length, length = swap;
                    }
                    if (encoding = String(encoding || "utf8").toLowerCase(), Buffer.isNativeEncoding(encoding)) return original.BufferWrite.call(this, string, _offset, _length, _encoding);
                    offset = +offset || 0;
                    var remaining = this.length - offset;
                    if (length ? (length = +length) > remaining && (length = remaining) : length = remaining, 
                    string.length > 0 && (length < 0 || offset < 0)) throw new RangeError("attempt to write beyond buffer bounds");
                    var buf = iconv.encode(string, encoding);
                    return buf.length < length && (length = buf.length), buf.copy(this, offset, 0, length), 
                    length;
                }, iconv.supportsStreams) {
                    var Readable = __webpack_require__(3).Readable;
                    original.ReadableSetEncoding = Readable.prototype.setEncoding, Readable.prototype.setEncoding = function(enc, options) {
                        this._readableState.decoder = iconv.getDecoder(enc, options), this._readableState.encoding = enc;
                    }, Readable.prototype.collect = iconv._collect;
                }
            }
        }, iconv.undoExtendNodeEncodings = function() {
            if (iconv.supportsNodeEncodingsExtension) {
                if (!original) throw new Error("require('iconv-lite').undoExtendNodeEncodings(): Nothing to undo; extendNodeEncodings() is not called.");
                delete Buffer.isNativeEncoding;
                var SlowBuffer = __webpack_require__(10).SlowBuffer;
                if (SlowBuffer.prototype.toString = original.SlowBufferToString, SlowBuffer.prototype.write = original.SlowBufferWrite, 
                Buffer.isEncoding = original.BufferIsEncoding, Buffer.byteLength = original.BufferByteLength, 
                Buffer.prototype.toString = original.BufferToString, Buffer.prototype.write = original.BufferWrite, 
                iconv.supportsStreams) {
                    var Readable = __webpack_require__(3).Readable;
                    Readable.prototype.setEncoding = original.ReadableSetEncoding, delete Readable.prototype.collect;
                }
                original = void 0;
            }
        };
    };
}
