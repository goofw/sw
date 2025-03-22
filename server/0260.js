function(module, exports, __webpack_require__) {
    "use strict";
    const PassThrough = __webpack_require__(3).PassThrough, zlib = __webpack_require__(45), mimicResponse = __webpack_require__(594);
    module.exports = response => {
        if (-1 === [ "gzip", "deflate" ].indexOf(response.headers["content-encoding"])) return response;
        const unzip = zlib.createUnzip(), stream = new PassThrough;
        return mimicResponse(response, stream), unzip.on("error", (err => {
            "Z_BUF_ERROR" !== err.code ? stream.emit("error", err) : stream.end();
        })), response.pipe(unzip).pipe(stream), stream;
    };
}
