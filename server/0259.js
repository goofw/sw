function(module, exports) {
    module.exports = function(stream, cb) {
        var chunks = [];
        stream.on("data", (function(chunk) {
            chunks.push(chunk);
        })), stream.once("end", (function() {
            cb && cb(null, Buffer.concat(chunks)), cb = null;
        })), stream.once("error", (function(err) {
            cb && cb(err), cb = null;
        }));
    };
}
