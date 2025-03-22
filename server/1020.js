function(module, exports, __webpack_require__) {
    var iconv, inherits = __webpack_require__(0).inherits, stream = __webpack_require__(3), regex = /(?:charset|encoding)\s*=\s*['"]? *([\w\-]+)/i;
    function StreamDecoder(charset) {
        if (!(this instanceof StreamDecoder)) return new StreamDecoder(charset);
        stream.Transform.call(this, charset), this.charset = charset, this.parsed_chunk = !1;
    }
    inherits(StreamDecoder, stream.Transform), StreamDecoder.prototype._transform = function(chunk, encoding, done) {
        var res, found;
        if ("iso-8859-1" == this.charset && !this.parsed_chunk) {
            this.parsed_chunk = !0;
            var matches = regex.exec(chunk.toString());
            matches && (found = matches[1].toLowerCase(), this.charset = "utf-8" == found ? "utf8" : found);
        }
        try {
            res = iconv.decode(chunk, this.charset);
        } catch (e) {
            res = chunk;
        }
        this.push(res), done();
    }, module.exports = function(charset) {
        try {
            iconv || (iconv = __webpack_require__(68));
        } catch (e) {}
        return iconv ? new StreamDecoder(charset) : new stream.PassThrough;
    };
}
