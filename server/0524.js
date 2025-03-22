function(module, exports, __webpack_require__) {
    "use strict";
    var Buffer = __webpack_require__(14).Buffer;
    function Utf16BECodec() {}
    function Utf16BEEncoder() {}
    function Utf16BEDecoder() {
        this.overflowByte = -1;
    }
    function Utf16Codec(codecOptions, iconv) {
        this.iconv = iconv;
    }
    function Utf16Encoder(options, codec) {
        void 0 === (options = options || {}).addBOM && (options.addBOM = !0), this.encoder = codec.iconv.getEncoder("utf-16le", options);
    }
    function Utf16Decoder(options, codec) {
        this.decoder = null, this.initialBytes = [], this.initialBytesLen = 0, this.options = options || {}, 
        this.iconv = codec.iconv;
    }
    function detectEncoding(buf, defaultEncoding) {
        var enc = defaultEncoding || "utf-16le";
        if (buf.length >= 2) if (254 == buf[0] && 255 == buf[1]) enc = "utf-16be"; else if (255 == buf[0] && 254 == buf[1]) enc = "utf-16le"; else {
            for (var asciiCharsLE = 0, asciiCharsBE = 0, _len = Math.min(buf.length - buf.length % 2, 64), i = 0; i < _len; i += 2) 0 === buf[i] && 0 !== buf[i + 1] && asciiCharsBE++, 
            0 !== buf[i] && 0 === buf[i + 1] && asciiCharsLE++;
            asciiCharsBE > asciiCharsLE ? enc = "utf-16be" : asciiCharsBE < asciiCharsLE && (enc = "utf-16le");
        }
        return enc;
    }
    exports.utf16be = Utf16BECodec, Utf16BECodec.prototype.encoder = Utf16BEEncoder, 
    Utf16BECodec.prototype.decoder = Utf16BEDecoder, Utf16BECodec.prototype.bomAware = !0, 
    Utf16BEEncoder.prototype.write = function(str) {
        for (var buf = Buffer.from(str, "ucs2"), i = 0; i < buf.length; i += 2) {
            var tmp = buf[i];
            buf[i] = buf[i + 1], buf[i + 1] = tmp;
        }
        return buf;
    }, Utf16BEEncoder.prototype.end = function() {}, Utf16BEDecoder.prototype.write = function(buf) {
        if (0 == buf.length) return "";
        var buf2 = Buffer.alloc(buf.length + 1), i = 0, j = 0;
        for (-1 !== this.overflowByte && (buf2[0] = buf[0], buf2[1] = this.overflowByte, 
        i = 1, j = 2); i < buf.length - 1; i += 2, j += 2) buf2[j] = buf[i + 1], buf2[j + 1] = buf[i];
        return this.overflowByte = i == buf.length - 1 ? buf[buf.length - 1] : -1, buf2.slice(0, j).toString("ucs2");
    }, Utf16BEDecoder.prototype.end = function() {}, exports.utf16 = Utf16Codec, Utf16Codec.prototype.encoder = Utf16Encoder, 
    Utf16Codec.prototype.decoder = Utf16Decoder, Utf16Encoder.prototype.write = function(str) {
        return this.encoder.write(str);
    }, Utf16Encoder.prototype.end = function() {
        return this.encoder.end();
    }, Utf16Decoder.prototype.write = function(buf) {
        if (!this.decoder) {
            if (this.initialBytes.push(buf), this.initialBytesLen += buf.length, this.initialBytesLen < 16) return "";
            var encoding = detectEncoding(buf = Buffer.concat(this.initialBytes), this.options.defaultEncoding);
            this.decoder = this.iconv.getDecoder(encoding, this.options), this.initialBytes.length = this.initialBytesLen = 0;
        }
        return this.decoder.write(buf);
    }, Utf16Decoder.prototype.end = function() {
        if (!this.decoder) {
            var buf = Buffer.concat(this.initialBytes), encoding = detectEncoding(buf, this.options.defaultEncoding);
            this.decoder = this.iconv.getDecoder(encoding, this.options);
            var res = this.decoder.write(buf), trail = this.decoder.end();
            return trail ? res + trail : res;
        }
        return this.decoder.end();
    };
}
