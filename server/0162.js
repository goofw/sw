function(module, exports, __webpack_require__) {
    var once = __webpack_require__(34), eos = __webpack_require__(163), fs = __webpack_require__(2), noop = function() {}, isFn = function(fn) {
        return "function" == typeof fn;
    }, destroyer = function(stream, reading, writing, callback) {
        callback = once(callback);
        var closed = !1;
        stream.on("close", (function() {
            closed = !0;
        })), eos(stream, {
            readable: reading,
            writable: writing
        }, (function(err) {
            if (err) return callback(err);
            closed = !0, callback();
        }));
        var destroyed = !1;
        return function(err) {
            if (!closed && !destroyed) return destroyed = !0, (function(stream) {
                return !!fs && (stream instanceof (fs.ReadStream || noop) || stream instanceof (fs.WriteStream || noop)) && isFn(stream.close);
            })(stream) ? stream.close(noop) : (function(stream) {
                return stream.setHeader && isFn(stream.abort);
            })(stream) ? stream.abort() : isFn(stream.destroy) ? stream.destroy() : void callback(err || new Error("stream was destroyed"));
        };
    }, call = function(fn) {
        fn();
    }, pipe = function(from, to) {
        return from.pipe(to);
    };
    module.exports = function() {
        var error, streams = Array.prototype.slice.call(arguments), callback = isFn(streams[streams.length - 1] || noop) && streams.pop() || noop;
        if (Array.isArray(streams[0]) && (streams = streams[0]), streams.length < 2) throw new Error("pump requires two streams per minimum");
        var destroys = streams.map((function(stream, i) {
            var reading = i < streams.length - 1;
            return destroyer(stream, reading, i > 0, (function(err) {
                error || (error = err), err && destroys.forEach(call), reading || (destroys.forEach(call), 
                callback(error));
            }));
        }));
        return streams.reduce(pipe);
    };
}
