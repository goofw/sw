function(module, exports, __webpack_require__) {
    "use strict";
    var createError = __webpack_require__(87), getBody = __webpack_require__(554), iconv = __webpack_require__(68), onFinished = __webpack_require__(85), zlib = __webpack_require__(45);
    module.exports = function(req, res, next, parse, debug, options) {
        var length, stream, opts = options;
        req._body = !0;
        var encoding = null !== opts.encoding ? opts.encoding : null, verify = opts.verify;
        try {
            stream = (function(req, debug, inflate) {
                var stream, encoding = (req.headers["content-encoding"] || "identity").toLowerCase(), length = req.headers["content-length"];
                if (debug('content-encoding "%s"', encoding), !1 === inflate && "identity" !== encoding) throw createError(415, "content encoding unsupported", {
                    encoding: encoding,
                    type: "encoding.unsupported"
                });
                switch (encoding) {
                  case "deflate":
                    stream = zlib.createInflate(), debug("inflate body"), req.pipe(stream);
                    break;

                  case "gzip":
                    stream = zlib.createGunzip(), debug("gunzip body"), req.pipe(stream);
                    break;

                  case "identity":
                    (stream = req).length = length;
                    break;

                  default:
                    throw createError(415, 'unsupported content encoding "' + encoding + '"', {
                        encoding: encoding,
                        type: "encoding.unsupported"
                    });
                }
                return stream;
            })(req, debug, opts.inflate), length = stream.length, stream.length = void 0;
        } catch (err) {
            return next(err);
        }
        if (opts.length = length, opts.encoding = verify ? null : encoding, null === opts.encoding && null !== encoding && !iconv.encodingExists(encoding)) return next(createError(415, 'unsupported charset "' + encoding.toUpperCase() + '"', {
            charset: encoding.toLowerCase(),
            type: "charset.unsupported"
        }));
        debug("read body"), getBody(stream, opts, (function(error, body) {
            var _error;
            if (error) return _error = "encoding.unsupported" === error.type ? createError(415, 'unsupported charset "' + encoding.toUpperCase() + '"', {
                charset: encoding.toLowerCase(),
                type: "charset.unsupported"
            }) : createError(400, error), stream.resume(), void onFinished(req, (function() {
                next(createError(400, _error));
            }));
            if (verify) try {
                debug("verify body"), verify(req, res, body, encoding);
            } catch (err) {
                return void next(createError(403, err, {
                    body: body,
                    type: err.type || "entity.verify.failed"
                }));
            }
            var str = body;
            try {
                debug("parse body"), str = "string" != typeof body && null !== encoding ? iconv.decode(body, encoding) : body, 
                req.body = parse(str);
            } catch (err) {
                return void next(createError(400, err, {
                    body: str,
                    type: err.type || "entity.parse.failed"
                }));
            }
            next();
        }));
    };
}
