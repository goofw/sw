function(module, exports, __webpack_require__) {
    exports.Abstract = __webpack_require__(242), exports.Reader = __webpack_require__(82), 
    exports.Writer = __webpack_require__(104), exports.File = {
        Reader: __webpack_require__(511),
        Writer: __webpack_require__(516)
    }, exports.Dir = {
        Reader: __webpack_require__(510),
        Writer: __webpack_require__(514)
    }, exports.Link = {
        Reader: __webpack_require__(509),
        Writer: __webpack_require__(515)
    }, exports.Proxy = {
        Reader: __webpack_require__(512),
        Writer: __webpack_require__(517)
    }, exports.Reader.Dir = exports.DirReader = exports.Dir.Reader, exports.Reader.File = exports.FileReader = exports.File.Reader, 
    exports.Reader.Link = exports.LinkReader = exports.Link.Reader, exports.Reader.Proxy = exports.ProxyReader = exports.Proxy.Reader, 
    exports.Writer.Dir = exports.DirWriter = exports.Dir.Writer, exports.Writer.File = exports.FileWriter = exports.File.Writer, 
    exports.Writer.Link = exports.LinkWriter = exports.Link.Writer, exports.Writer.Proxy = exports.ProxyWriter = exports.Proxy.Writer, 
    exports.collect = __webpack_require__(243);
}
