function(module, exports, __webpack_require__) {
    "use strict";
    var Buffer = __webpack_require__(14).Buffer, bomHandling = __webpack_require__(521), iconv = module.exports;
    iconv.encodings = null, iconv.defaultCharUnicode = "�", iconv.defaultCharSingleByte = "?", 
    iconv.encode = function(str, encoding, options) {
        str = "" + (str || "");
        var encoder = iconv.getEncoder(encoding, options), res = encoder.write(str), trail = encoder.end();
        return trail && trail.length > 0 ? Buffer.concat([ res, trail ]) : res;
    }, iconv.decode = function(buf, encoding, options) {
        "string" == typeof buf && (iconv.skipDecodeWarning || (console.error("Iconv-lite warning: decode()-ing strings is deprecated. Refer to https://github.com/ashtuchkin/iconv-lite/wiki/Use-Buffers-when-decoding"), 
        iconv.skipDecodeWarning = !0), buf = Buffer.from("" + (buf || ""), "binary"));
        var decoder = iconv.getDecoder(encoding, options), res = decoder.write(buf), trail = decoder.end();
        return trail ? res + trail : res;
    }, iconv.encodingExists = function(enc) {
        try {
            return iconv.getCodec(enc), !0;
        } catch (e) {
            return !1;
        }
    }, iconv.toEncoding = iconv.encode, iconv.fromEncoding = iconv.decode, iconv._codecDataCache = {}, 
    iconv.getCodec = function(encoding) {
        iconv.encodings || (iconv.encodings = __webpack_require__(522));
        for (var enc = iconv._canonicalizeEncoding(encoding), codecOptions = {}; ;) {
            var codec = iconv._codecDataCache[enc];
            if (codec) return codec;
            var codecDef = iconv.encodings[enc];
            switch (typeof codecDef) {
              case "string":
                enc = codecDef;
                break;

              case "object":
                for (var key in codecDef) codecOptions[key] = codecDef[key];
                codecOptions.encodingName || (codecOptions.encodingName = enc), enc = codecDef.type;
                break;

              case "function":
                return codecOptions.encodingName || (codecOptions.encodingName = enc), codec = new codecDef(codecOptions, iconv), 
                iconv._codecDataCache[codecOptions.encodingName] = codec, codec;

              default:
                throw new Error("Encoding not recognized: '" + encoding + "' (searched as: '" + enc + "')");
            }
        }
    }, iconv._canonicalizeEncoding = function(encoding) {
        return ("" + encoding).toLowerCase().replace(/:\d{4}$|[^0-9a-z]/g, "");
    }, iconv.getEncoder = function(encoding, options) {
        var codec = iconv.getCodec(encoding), encoder = new codec.encoder(options, codec);
        return codec.bomAware && options && options.addBOM && (encoder = new bomHandling.PrependBOM(encoder, options)), 
        encoder;
    }, iconv.getDecoder = function(encoding, options) {
        var codec = iconv.getCodec(encoding), decoder = new codec.decoder(options, codec);
        return !codec.bomAware || options && !1 === options.stripBOM || (decoder = new bomHandling.StripBOM(decoder, options)), 
        decoder;
    };
    var nodeVer = "undefined" != typeof process && process.versions && process.versions.node;
    if (nodeVer) {
        var nodeVerArr = nodeVer.split(".").map(Number);
        (nodeVerArr[0] > 0 || nodeVerArr[1] >= 10) && __webpack_require__(536)(iconv), __webpack_require__(537)(iconv);
    }
}
