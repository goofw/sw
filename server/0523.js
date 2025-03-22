function(module, exports, __webpack_require__) {
    "use strict";
    var Buffer = __webpack_require__(14).Buffer;
    function InternalCodec(codecOptions, iconv) {
        this.enc = codecOptions.encodingName, this.bomAware = codecOptions.bomAware, "base64" === this.enc ? this.encoder = InternalEncoderBase64 : "cesu8" === this.enc && (this.enc = "utf8", 
        this.encoder = InternalEncoderCesu8, "💩" !== Buffer.from("eda0bdedb2a9", "hex").toString() && (this.decoder = InternalDecoderCesu8, 
        this.defaultCharUnicode = iconv.defaultCharUnicode));
    }
    module.exports = {
        utf8: {
            type: "_internal",
            bomAware: !0
        },
        cesu8: {
            type: "_internal",
            bomAware: !0
        },
        unicode11utf8: "utf8",
        ucs2: {
            type: "_internal",
            bomAware: !0
        },
        utf16le: "ucs2",
        binary: {
            type: "_internal"
        },
        base64: {
            type: "_internal"
        },
        hex: {
            type: "_internal"
        },
        _internal: InternalCodec
    }, InternalCodec.prototype.encoder = InternalEncoder, InternalCodec.prototype.decoder = InternalDecoder;
    var StringDecoder = __webpack_require__(156).StringDecoder;
    function InternalDecoder(options, codec) {
        StringDecoder.call(this, codec.enc);
    }
    function InternalEncoder(options, codec) {
        this.enc = codec.enc;
    }
    function InternalEncoderBase64(options, codec) {
        this.prevStr = "";
    }
    function InternalEncoderCesu8(options, codec) {}
    function InternalDecoderCesu8(options, codec) {
        this.acc = 0, this.contBytes = 0, this.accBytes = 0, this.defaultCharUnicode = codec.defaultCharUnicode;
    }
    StringDecoder.prototype.end || (StringDecoder.prototype.end = function() {}), InternalDecoder.prototype = StringDecoder.prototype, 
    InternalEncoder.prototype.write = function(str) {
        return Buffer.from(str, this.enc);
    }, InternalEncoder.prototype.end = function() {}, InternalEncoderBase64.prototype.write = function(str) {
        var completeQuads = (str = this.prevStr + str).length - str.length % 4;
        return this.prevStr = str.slice(completeQuads), str = str.slice(0, completeQuads), 
        Buffer.from(str, "base64");
    }, InternalEncoderBase64.prototype.end = function() {
        return Buffer.from(this.prevStr, "base64");
    }, InternalEncoderCesu8.prototype.write = function(str) {
        for (var buf = Buffer.alloc(3 * str.length), bufIdx = 0, i = 0; i < str.length; i++) {
            var charCode = str.charCodeAt(i);
            charCode < 128 ? buf[bufIdx++] = charCode : charCode < 2048 ? (buf[bufIdx++] = 192 + (charCode >>> 6), 
            buf[bufIdx++] = 128 + (63 & charCode)) : (buf[bufIdx++] = 224 + (charCode >>> 12), 
            buf[bufIdx++] = 128 + (charCode >>> 6 & 63), buf[bufIdx++] = 128 + (63 & charCode));
        }
        return buf.slice(0, bufIdx);
    }, InternalEncoderCesu8.prototype.end = function() {}, InternalDecoderCesu8.prototype.write = function(buf) {
        for (var acc = this.acc, contBytes = this.contBytes, accBytes = this.accBytes, res = "", i = 0; i < buf.length; i++) {
            var curByte = buf[i];
            128 != (192 & curByte) ? (contBytes > 0 && (res += this.defaultCharUnicode, contBytes = 0), 
            curByte < 128 ? res += String.fromCharCode(curByte) : curByte < 224 ? (acc = 31 & curByte, 
            contBytes = 1, accBytes = 1) : curByte < 240 ? (acc = 15 & curByte, contBytes = 2, 
            accBytes = 1) : res += this.defaultCharUnicode) : contBytes > 0 ? (acc = acc << 6 | 63 & curByte, 
            accBytes++, 0 == --contBytes && (res += 2 === accBytes && acc < 128 && acc > 0 || 3 === accBytes && acc < 2048 ? this.defaultCharUnicode : String.fromCharCode(acc))) : res += this.defaultCharUnicode;
        }
        return this.acc = acc, this.contBytes = contBytes, this.accBytes = accBytes, res;
    }, InternalDecoderCesu8.prototype.end = function() {
        var res = 0;
        return this.contBytes > 0 && (res += this.defaultCharUnicode), res;
    };
}
