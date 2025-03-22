function(module, exports, __webpack_require__) {
    "use strict";
    var ERR_STREAM_PREMATURE_CLOSE = __webpack_require__(65).codes.ERR_STREAM_PREMATURE_CLOSE;
    function noop() {}
    module.exports = function eos(stream, opts, callback) {
        if ("function" == typeof opts) return eos(stream, null, opts);
        opts || (opts = {}), callback = (function(callback) {
            var called = !1;
            return function() {
                if (!called) {
                    called = !0;
                    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
                    callback.apply(this, args);
                }
            };
        })(callback || noop);
        var readable = opts.readable || !1 !== opts.readable && stream.readable, writable = opts.writable || !1 !== opts.writable && stream.writable, onlegacyfinish = function() {
            stream.writable || onfinish();
        }, writableEnded = stream._writableState && stream._writableState.finished, onfinish = function() {
            writable = !1, writableEnded = !0, readable || callback.call(stream);
        }, readableEnded = stream._readableState && stream._readableState.endEmitted, onend = function() {
            readable = !1, readableEnded = !0, writable || callback.call(stream);
        }, onerror = function(err) {
            callback.call(stream, err);
        }, onclose = function() {
            var err;
            return readable && !readableEnded ? (stream._readableState && stream._readableState.ended || (err = new ERR_STREAM_PREMATURE_CLOSE), 
            callback.call(stream, err)) : writable && !writableEnded ? (stream._writableState && stream._writableState.ended || (err = new ERR_STREAM_PREMATURE_CLOSE), 
            callback.call(stream, err)) : void 0;
        }, onrequest = function() {
            stream.req.on("finish", onfinish);
        };
        return (function(stream) {
            return stream.setHeader && "function" == typeof stream.abort;
        })(stream) ? (stream.on("complete", onfinish), stream.on("abort", onclose), stream.req ? onrequest() : stream.on("request", onrequest)) : writable && !stream._writableState && (stream.on("end", onlegacyfinish), 
        stream.on("close", onlegacyfinish)), stream.on("end", onend), stream.on("finish", onfinish), 
        !1 !== opts.error && stream.on("error", onerror), stream.on("close", onclose), function() {
            stream.removeListener("complete", onfinish), stream.removeListener("abort", onclose), 
            stream.removeListener("request", onrequest), stream.req && stream.req.removeListener("finish", onfinish), 
            stream.removeListener("end", onlegacyfinish), stream.removeListener("close", onlegacyfinish), 
            stream.removeListener("finish", onfinish), stream.removeListener("end", onend), 
            stream.removeListener("error", onerror), stream.removeListener("close", onclose);
        };
    };
}
