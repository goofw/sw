function(module, exports, __webpack_require__) {
    (exports = module.exports = __webpack_require__(383)).Stream = __webpack_require__(3), 
    exports.Readable = exports, exports.Writable = __webpack_require__(384), exports.Duplex = __webpack_require__(73), 
    exports.Transform = __webpack_require__(386), exports.PassThrough = __webpack_require__(771), 
    process.browser || "disable" !== process.env.READABLE_STREAM || (module.exports = __webpack_require__(3));
}
