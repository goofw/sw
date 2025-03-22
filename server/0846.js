function(module, exports, __webpack_require__) {
    var Stream = __webpack_require__(3);
    "disable" === process.env.READABLE_STREAM && Stream ? (module.exports = Stream.Readable, 
    Object.assign(module.exports, Stream), module.exports.Stream = Stream) : ((exports = module.exports = __webpack_require__(423)).Stream = Stream || exports, 
    exports.Readable = exports, exports.Writable = __webpack_require__(427), exports.Duplex = __webpack_require__(76), 
    exports.Transform = __webpack_require__(428), exports.PassThrough = __webpack_require__(850), 
    exports.finished = __webpack_require__(215), exports.pipeline = __webpack_require__(851));
}
