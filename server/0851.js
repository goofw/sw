function(module, exports, __webpack_require__) {
    "use strict";
    var eos, _require$codes = __webpack_require__(65).codes, ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS, ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
    function noop(err) {
        if (err) throw err;
    }
    function destroyer(stream, reading, writing, callback) {
        callback = (function(callback) {
            var called = !1;
            return function() {
                called || (called = !0, callback.apply(void 0, arguments));
            };
        })(callback);
        var closed = !1;
        stream.on("close", (function() {
            closed = !0;
        })), void 0 === eos && (eos = __webpack_require__(215)), eos(stream, {
            readable: reading,
            writable: writing
        }, (function(err) {
            if (err) return callback(err);
            closed = !0, callback();
        }));
        var destroyed = !1;
        return function(err) {
            if (!closed && !destroyed) return destroyed = !0, (function(stream) {
                return stream.setHeader && "function" == typeof stream.abort;
            })(stream) ? stream.abort() : "function" == typeof stream.destroy ? stream.destroy() : void callback(err || new ERR_STREAM_DESTROYED("pipe"));
        };
    }
    function call(fn) {
        fn();
    }
    function pipe(from, to) {
        return from.pipe(to);
    }
    function popCallback(streams) {
        return streams.length ? "function" != typeof streams[streams.length - 1] ? noop : streams.pop() : noop;
    }
    module.exports = function() {
        for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) streams[_key] = arguments[_key];
        var error, callback = popCallback(streams);
        if (Array.isArray(streams[0]) && (streams = streams[0]), streams.length < 2) throw new ERR_MISSING_ARGS("streams");
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
