function(module, exports, __webpack_require__) {
    "use strict";
    var ReadStream = __webpack_require__(2).ReadStream, Stream = __webpack_require__(3);
    function onOpenClose() {
        "number" == typeof this.fd && this.close();
    }
    module.exports = function(stream) {
        return stream instanceof ReadStream ? (function(stream) {
            return stream.destroy(), "function" == typeof stream.close && stream.on("open", onOpenClose), 
            stream;
        })(stream) : stream instanceof Stream ? ("function" == typeof stream.destroy && stream.destroy(), 
        stream) : stream;
    };
}
