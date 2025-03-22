function(module, exports, __webpack_require__) {
    "use strict";
    var Buffer = __webpack_require__(14).Buffer;
    function Utf7Codec(codecOptions, iconv) {
        this.iconv = iconv;
    }
    exports.utf7 = Utf7Codec, exports.unicode11utf7 = "utf7", Utf7Codec.prototype.encoder = Utf7Encoder, 
    Utf7Codec.prototype.decoder = Utf7Decoder, Utf7Codec.prototype.bomAware = !0;
    var nonDirectChars = /[^A-Za-z0-9'\(\),-\.\/:\? \n\r\t]+/g;
    function Utf7Encoder(options, codec) {
        this.iconv = codec.iconv;
    }
    function Utf7Decoder(options, codec) {
        this.iconv = codec.iconv, this.inBase64 = !1, this.base64Accum = "";
    }
    Utf7Encoder.prototype.write = function(str) {
        return Buffer.from(str.replace(nonDirectChars, function(chunk) {
            return "+" + ("+" === chunk ? "" : this.iconv.encode(chunk, "utf16-be").toString("base64").replace(/=+$/, "")) + "-";
        }.bind(this)));
    }, Utf7Encoder.prototype.end = function() {};
    for (var base64Regex = /[A-Za-z0-9\/+]/, base64Chars = [], i = 0; i < 256; i++) base64Chars[i] = base64Regex.test(String.fromCharCode(i));
    var plusChar = "+".charCodeAt(0), minusChar = "-".charCodeAt(0), andChar = "&".charCodeAt(0);
    function Utf7IMAPCodec(codecOptions, iconv) {
        this.iconv = iconv;
    }
    function Utf7IMAPEncoder(options, codec) {
        this.iconv = codec.iconv, this.inBase64 = !1, this.base64Accum = Buffer.alloc(6), 
        this.base64AccumIdx = 0;
    }
    function Utf7IMAPDecoder(options, codec) {
        this.iconv = codec.iconv, this.inBase64 = !1, this.base64Accum = "";
    }
    Utf7Decoder.prototype.write = function(buf) {
        for (var res = "", lastI = 0, inBase64 = this.inBase64, base64Accum = this.base64Accum, i = 0; i < buf.length; i++) if (inBase64) {
            if (!base64Chars[buf[i]]) {
                if (i == lastI && buf[i] == minusChar) res += "+"; else {
                    var b64str = base64Accum + buf.slice(lastI, i).toString();
                    res += this.iconv.decode(Buffer.from(b64str, "base64"), "utf16-be");
                }
                buf[i] != minusChar && i--, lastI = i + 1, inBase64 = !1, base64Accum = "";
            }
        } else buf[i] == plusChar && (res += this.iconv.decode(buf.slice(lastI, i), "ascii"), 
        lastI = i + 1, inBase64 = !0);
        if (inBase64) {
            var canBeDecoded = (b64str = base64Accum + buf.slice(lastI).toString()).length - b64str.length % 8;
            base64Accum = b64str.slice(canBeDecoded), b64str = b64str.slice(0, canBeDecoded), 
            res += this.iconv.decode(Buffer.from(b64str, "base64"), "utf16-be");
        } else res += this.iconv.decode(buf.slice(lastI), "ascii");
        return this.inBase64 = inBase64, this.base64Accum = base64Accum, res;
    }, Utf7Decoder.prototype.end = function() {
        var res = "";
        return this.inBase64 && this.base64Accum.length > 0 && (res = this.iconv.decode(Buffer.from(this.base64Accum, "base64"), "utf16-be")), 
        this.inBase64 = !1, this.base64Accum = "", res;
    }, exports.utf7imap = Utf7IMAPCodec, Utf7IMAPCodec.prototype.encoder = Utf7IMAPEncoder, 
    Utf7IMAPCodec.prototype.decoder = Utf7IMAPDecoder, Utf7IMAPCodec.prototype.bomAware = !0, 
    Utf7IMAPEncoder.prototype.write = function(str) {
        for (var inBase64 = this.inBase64, base64Accum = this.base64Accum, base64AccumIdx = this.base64AccumIdx, buf = Buffer.alloc(5 * str.length + 10), bufIdx = 0, i = 0; i < str.length; i++) {
            var uChar = str.charCodeAt(i);
            32 <= uChar && uChar <= 126 ? (inBase64 && (base64AccumIdx > 0 && (bufIdx += buf.write(base64Accum.slice(0, base64AccumIdx).toString("base64").replace(/\//g, ",").replace(/=+$/, ""), bufIdx), 
            base64AccumIdx = 0), buf[bufIdx++] = minusChar, inBase64 = !1), inBase64 || (buf[bufIdx++] = uChar, 
            uChar === andChar && (buf[bufIdx++] = minusChar))) : (inBase64 || (buf[bufIdx++] = andChar, 
            inBase64 = !0), inBase64 && (base64Accum[base64AccumIdx++] = uChar >> 8, base64Accum[base64AccumIdx++] = 255 & uChar, 
            base64AccumIdx == base64Accum.length && (bufIdx += buf.write(base64Accum.toString("base64").replace(/\//g, ","), bufIdx), 
            base64AccumIdx = 0)));
        }
        return this.inBase64 = inBase64, this.base64AccumIdx = base64AccumIdx, buf.slice(0, bufIdx);
    }, Utf7IMAPEncoder.prototype.end = function() {
        var buf = Buffer.alloc(10), bufIdx = 0;
        return this.inBase64 && (this.base64AccumIdx > 0 && (bufIdx += buf.write(this.base64Accum.slice(0, this.base64AccumIdx).toString("base64").replace(/\//g, ",").replace(/=+$/, ""), bufIdx), 
        this.base64AccumIdx = 0), buf[bufIdx++] = minusChar, this.inBase64 = !1), buf.slice(0, bufIdx);
    };
    var base64IMAPChars = base64Chars.slice();
    base64IMAPChars[",".charCodeAt(0)] = !0, Utf7IMAPDecoder.prototype.write = function(buf) {
        for (var res = "", lastI = 0, inBase64 = this.inBase64, base64Accum = this.base64Accum, i = 0; i < buf.length; i++) if (inBase64) {
            if (!base64IMAPChars[buf[i]]) {
                if (i == lastI && buf[i] == minusChar) res += "&"; else {
                    var b64str = base64Accum + buf.slice(lastI, i).toString().replace(/,/g, "/");
                    res += this.iconv.decode(Buffer.from(b64str, "base64"), "utf16-be");
                }
                buf[i] != minusChar && i--, lastI = i + 1, inBase64 = !1, base64Accum = "";
            }
        } else buf[i] == andChar && (res += this.iconv.decode(buf.slice(lastI, i), "ascii"), 
        lastI = i + 1, inBase64 = !0);
        if (inBase64) {
            var canBeDecoded = (b64str = base64Accum + buf.slice(lastI).toString().replace(/,/g, "/")).length - b64str.length % 8;
            base64Accum = b64str.slice(canBeDecoded), b64str = b64str.slice(0, canBeDecoded), 
            res += this.iconv.decode(Buffer.from(b64str, "base64"), "utf16-be");
        } else res += this.iconv.decode(buf.slice(lastI), "ascii");
        return this.inBase64 = inBase64, this.base64Accum = base64Accum, res;
    }, Utf7IMAPDecoder.prototype.end = function() {
        var res = "";
        return this.inBase64 && this.base64Accum.length > 0 && (res = this.iconv.decode(Buffer.from(this.base64Accum, "base64"), "utf16-be")), 
        this.inBase64 = !1, this.base64Accum = "", res;
    };
}
