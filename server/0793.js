function(module, exports, __webpack_require__) {
    var Stream = __webpack_require__(3);
    "disable" === process.env.READABLE_STREAM && Stream ? (module.exports = Stream, 
    (exports = module.exports = Stream.Readable).Readable = Stream.Readable, exports.Writable = Stream.Writable, 
    exports.Duplex = Stream.Duplex, exports.Transform = Stream.Transform, exports.PassThrough = Stream.PassThrough, 
    exports.Stream = Stream) : ((exports = module.exports = __webpack_require__(391)).Stream = Stream || exports, 
    exports.Readable = exports, exports.Writable = __webpack_require__(395), exports.Duplex = __webpack_require__(74), 
    exports.Transform = __webpack_require__(396), exports.PassThrough = __webpack_require__(795));
}
