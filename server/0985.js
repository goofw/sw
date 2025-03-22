function(module, exports, __webpack_require__) {
    var Stream = __webpack_require__(3), Buffer = __webpack_require__(153);
    Stream.Writable && Stream.Writable.prototype.destroy || (Stream = __webpack_require__(77)), 
    module.exports = function(entry) {
        return new Promise((function(resolve, reject) {
            var chunks = [], bufferStream = Stream.Transform().on("finish", (function() {
                resolve(Buffer.concat(chunks));
            })).on("error", reject);
            bufferStream._transform = function(d, e, cb) {
                chunks.push(d), cb();
            }, entry.on("error", reject).pipe(bufferStream);
        }));
    };
}
