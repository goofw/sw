function(module, exports, __webpack_require__) {
    var once = __webpack_require__(34), noop = function() {}, eos = function(stream, opts, callback) {
        if ("function" == typeof opts) return eos(stream, null, opts);
        opts || (opts = {}), callback = once(callback || noop);
        var ws = stream._writableState, rs = stream._readableState, readable = opts.readable || !1 !== opts.readable && stream.readable, writable = opts.writable || !1 !== opts.writable && stream.writable, cancelled = !1, onlegacyfinish = function() {
            stream.writable || onfinish();
        }, onfinish = function() {
            writable = !1, readable || callback.call(stream);
        }, onend = function() {
            readable = !1, writable || callback.call(stream);
        }, onexit = function(exitCode) {
            callback.call(stream, exitCode ? new Error("exited with error code: " + exitCode) : null);
        }, onerror = function(err) {
            callback.call(stream, err);
        }, onclose = function() {
            process.nextTick(onclosenexttick);
        }, onclosenexttick = function() {
            if (!cancelled) return (!readable || rs && rs.ended && !rs.destroyed) && (!writable || ws && ws.ended && !ws.destroyed) ? void 0 : callback.call(stream, new Error("premature close"));
        }, onrequest = function() {
            stream.req.on("finish", onfinish);
        };
        return (function(stream) {
            return stream.setHeader && "function" == typeof stream.abort;
        })(stream) ? (stream.on("complete", onfinish), stream.on("abort", onclose), stream.req ? onrequest() : stream.on("request", onrequest)) : writable && !ws && (stream.on("end", onlegacyfinish), 
        stream.on("close", onlegacyfinish)), (function(stream) {
            return stream.stdio && Array.isArray(stream.stdio) && 3 === stream.stdio.length;
        })(stream) && stream.on("exit", onexit), stream.on("end", onend), stream.on("finish", onfinish), 
        !1 !== opts.error && stream.on("error", onerror), stream.on("close", onclose), function() {
            cancelled = !0, stream.removeListener("complete", onfinish), stream.removeListener("abort", onclose), 
            stream.removeListener("request", onrequest), stream.req && stream.req.removeListener("finish", onfinish), 
            stream.removeListener("end", onlegacyfinish), stream.removeListener("close", onlegacyfinish), 
            stream.removeListener("finish", onfinish), stream.removeListener("exit", onexit), 
            stream.removeListener("end", onend), stream.removeListener("error", onerror), stream.removeListener("close", onclose);
        };
    };
    module.exports = eos;
}
