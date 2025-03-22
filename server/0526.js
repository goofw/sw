function(module, exports, __webpack_require__) {
    "use strict";
    var Buffer = __webpack_require__(14).Buffer;
    function SBCSCodec(codecOptions, iconv) {
        if (!codecOptions) throw new Error("SBCS codec is called without the data.");
        if (!codecOptions.chars || 128 !== codecOptions.chars.length && 256 !== codecOptions.chars.length) throw new Error("Encoding '" + codecOptions.type + "' has incorrect 'chars' (must be of len 128 or 256)");
        if (128 === codecOptions.chars.length) {
            for (var asciiString = "", i = 0; i < 128; i++) asciiString += String.fromCharCode(i);
            codecOptions.chars = asciiString + codecOptions.chars;
        }
        this.decodeBuf = Buffer.from(codecOptions.chars, "ucs2");
        var encodeBuf = Buffer.alloc(65536, iconv.defaultCharSingleByte.charCodeAt(0));
        for (i = 0; i < codecOptions.chars.length; i++) encodeBuf[codecOptions.chars.charCodeAt(i)] = i;
        this.encodeBuf = encodeBuf;
    }
    function SBCSEncoder(options, codec) {
        this.encodeBuf = codec.encodeBuf;
    }
    function SBCSDecoder(options, codec) {
        this.decodeBuf = codec.decodeBuf;
    }
    exports._sbcs = SBCSCodec, SBCSCodec.prototype.encoder = SBCSEncoder, SBCSCodec.prototype.decoder = SBCSDecoder, 
    SBCSEncoder.prototype.write = function(str) {
        for (var buf = Buffer.alloc(str.length), i = 0; i < str.length; i++) buf[i] = this.encodeBuf[str.charCodeAt(i)];
        return buf;
    }, SBCSEncoder.prototype.end = function() {}, SBCSDecoder.prototype.write = function(buf) {
        for (var decodeBuf = this.decodeBuf, newBuf = Buffer.alloc(2 * buf.length), idx1 = 0, idx2 = 0, i = 0; i < buf.length; i++) idx1 = 2 * buf[i], 
        newBuf[idx2 = 2 * i] = decodeBuf[idx1], newBuf[idx2 + 1] = decodeBuf[idx1 + 1];
        return newBuf.toString("ucs2");
    }, SBCSDecoder.prototype.end = function() {};
}
