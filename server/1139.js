function(module, exports, __webpack_require__) {
    "use strict";
    var uuid = __webpack_require__(148), CombinedStream = __webpack_require__(485), isstream = __webpack_require__(492), Buffer = __webpack_require__(23).Buffer;
    function Multipart(request) {
        this.request = request, this.boundary = uuid(), this.chunked = !1, this.body = null;
    }
    Multipart.prototype.isChunked = function(options) {
        var self = this, chunked = !1, parts = options.data || options;
        return parts.forEach || self.request.emit("error", new Error("Argument error, options.multipart.")), 
        void 0 !== options.chunked && (chunked = options.chunked), "chunked" === self.request.getHeader("transfer-encoding") && (chunked = !0), 
        chunked || parts.forEach((function(part) {
            void 0 === part.body && self.request.emit("error", new Error("Body attribute missing in multipart.")), 
            isstream(part.body) && (chunked = !0);
        })), chunked;
    }, Multipart.prototype.setHeaders = function(chunked) {
        chunked && !this.request.hasHeader("transfer-encoding") && this.request.setHeader("transfer-encoding", "chunked");
        var header = this.request.getHeader("content-type");
        header && -1 !== header.indexOf("multipart") ? -1 !== header.indexOf("boundary") ? this.boundary = header.replace(/.*boundary=([^\s;]+).*/, "$1") : this.request.setHeader("content-type", header + "; boundary=" + this.boundary) : this.request.setHeader("content-type", "multipart/related; boundary=" + this.boundary);
    }, Multipart.prototype.build = function(parts, chunked) {
        var self = this, body = chunked ? new CombinedStream : [];
        function add(part) {
            return "number" == typeof part && (part = part.toString()), chunked ? body.append(part) : body.push(Buffer.from(part));
        }
        return self.request.preambleCRLF && add("\r\n"), parts.forEach((function(part) {
            var preamble = "--" + self.boundary + "\r\n";
            Object.keys(part).forEach((function(key) {
                "body" !== key && (preamble += key + ": " + part[key] + "\r\n");
            })), add(preamble += "\r\n"), add(part.body), add("\r\n");
        })), add("--" + self.boundary + "--"), self.request.postambleCRLF && add("\r\n"), 
        body;
    }, Multipart.prototype.onRequest = function(options) {
        var chunked = this.isChunked(options), parts = options.data || options;
        this.setHeaders(chunked), this.chunked = chunked, this.body = this.build(parts, chunked);
    }, exports.Multipart = Multipart;
}
