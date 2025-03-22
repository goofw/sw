function(module, exports, __webpack_require__) {
    "use strict";
    var bytes = __webpack_require__(86), createError = __webpack_require__(87), iconv = __webpack_require__(68), unpipe = __webpack_require__(158);
    module.exports = function(stream, options, callback) {
        var done = callback, opts = options || {};
        if (!0 !== options && "string" != typeof options || (opts = {
            encoding: options
        }), "function" == typeof options && (done = options, opts = {}), void 0 !== done && "function" != typeof done) throw new TypeError("argument callback must be a function");
        if (!done && !global.Promise) throw new TypeError("argument callback is required");
        var encoding = !0 !== opts.encoding ? opts.encoding : "utf-8", limit = bytes.parse(opts.limit), length = null == opts.length || isNaN(opts.length) ? null : parseInt(opts.length, 10);
        return done ? readStream(stream, encoding, length, limit, done) : new Promise((function(resolve, reject) {
            readStream(stream, encoding, length, limit, (function(err, buf) {
                if (err) return reject(err);
                resolve(buf);
            }));
        }));
    };
    var ICONV_ENCODING_MESSAGE_REGEXP = /^Encoding not recognized: /;
    function halt(stream) {
        unpipe(stream), "function" == typeof stream.pause && stream.pause();
    }
    function readStream(stream, encoding, length, limit, callback) {
        var complete = !1;
        if (null !== limit && null !== length && length > limit) return done(createError(413, "request entity too large", {
            expected: length,
            length: length,
            limit: limit,
            type: "entity.too.large"
        }));
        var state = stream._readableState;
        if (stream._decoder || state && (state.encoding || state.decoder)) return done(createError(500, "stream encoding should not be set", {
            type: "stream.encoding.set"
        }));
        var decoder, received = 0;
        try {
            decoder = (function(encoding) {
                if (!encoding) return null;
                try {
                    return iconv.getDecoder(encoding);
                } catch (e) {
                    if (!ICONV_ENCODING_MESSAGE_REGEXP.test(e.message)) throw e;
                    throw createError(415, "specified encoding unsupported", {
                        encoding: encoding,
                        type: "encoding.unsupported"
                    });
                }
            })(encoding);
        } catch (err) {
            return done(err);
        }
        var buffer = decoder ? "" : [];
        function done() {
            for (var args = new Array(arguments.length), i = 0; i < args.length; i++) args[i] = arguments[i];
            function invokeCallback() {
                cleanup(), args[0] && halt(stream), callback.apply(null, args);
            }
            complete = !0, invokeCallback();
        }
        function onAborted() {
            complete || done(createError(400, "request aborted", {
                code: "ECONNABORTED",
                expected: length,
                length: length,
                received: received,
                type: "request.aborted"
            }));
        }
        function onData(chunk) {
            complete || (received += chunk.length, null !== limit && received > limit ? done(createError(413, "request entity too large", {
                limit: limit,
                received: received,
                type: "entity.too.large"
            })) : decoder ? buffer += decoder.write(chunk) : buffer.push(chunk));
        }
        function onEnd(err) {
            if (!complete) {
                if (err) return done(err);
                null !== length && received !== length ? done(createError(400, "request size did not match content length", {
                    expected: length,
                    length: length,
                    received: received,
                    type: "request.size.invalid"
                })) : done(null, decoder ? buffer + (decoder.end() || "") : Buffer.concat(buffer));
            }
        }
        function cleanup() {
            buffer = null, stream.removeListener("aborted", onAborted), stream.removeListener("data", onData), 
            stream.removeListener("end", onEnd), stream.removeListener("error", onEnd), stream.removeListener("close", cleanup);
        }
        stream.on("aborted", onAborted), stream.on("close", cleanup), stream.on("data", onData), 
        stream.on("end", onEnd), stream.on("error", onEnd);
    }
}
