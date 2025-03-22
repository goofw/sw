function(module, exports, __webpack_require__) {
    module.exports = simpleGet;
    var concat = __webpack_require__(259), http = __webpack_require__(11), https = __webpack_require__(22), once = __webpack_require__(34), querystring = __webpack_require__(28), decompressResponse = __webpack_require__(260), url = __webpack_require__(7);
    function simpleGet(opts, cb) {
        if (opts = "string" == typeof opts ? {
            url: opts
        } : Object.assign({}, opts), cb = once(cb), opts.headers = Object.assign({}, opts.headers), 
        Object.keys(opts.headers).forEach((function(h) {
            h.toLowerCase() !== h && (opts.headers[h.toLowerCase()] = opts.headers[h], delete opts.headers[h]);
        })), opts.url) {
            var loc = url.parse(opts.url);
            loc.hostname && (opts.hostname = loc.hostname), loc.port && (opts.port = loc.port), 
            loc.protocol && (opts.protocol = loc.protocol), loc.auth && (opts.auth = loc.auth), 
            opts.path = loc.path, delete opts.url;
        }
        var body;
        null == opts.maxRedirects && (opts.maxRedirects = 10), opts.method && (opts.method = opts.method.toUpperCase()), 
        opts.body ? body = opts.json && !isStream(opts.body) ? JSON.stringify(opts.body) : opts.body : opts.form && (body = "string" == typeof opts.form ? opts.form : querystring.stringify(opts.form), 
        opts.headers["content-type"] = "application/x-www-form-urlencoded"), delete opts.body, 
        delete opts.form, body && (opts.method || (opts.method = "POST"), isStream(body) || (opts.headers["content-length"] = Buffer.byteLength(body)), 
        opts.json && (opts.headers["content-type"] = "application/json")), opts.json && (opts.headers.accept = "application/json"), 
        opts.headers["accept-encoding"] || (opts.headers["accept-encoding"] = "gzip, deflate");
        var req = ("https:" === opts.protocol ? https : http).request(opts, (function(res) {
            if (res.statusCode >= 300 && res.statusCode < 400 && "location" in res.headers) return opts.url = res.headers.location, 
            delete opts.headers.host, res.resume(), 301 !== res.statusCode && 302 !== res.statusCode || "POST" !== opts.method || (opts.method = "GET", 
            delete opts.headers["content-length"], delete opts.headers["content-type"]), 0 === opts.maxRedirects ? cb(new Error("too many redirects")) : (opts.maxRedirects -= 1, 
            simpleGet(opts, cb));
            var tryUnzip = "function" == typeof decompressResponse && "HEAD" !== opts.method;
            cb(null, tryUnzip ? decompressResponse(res) : res);
        }));
        return req.on("timeout", (function() {
            req.abort(), cb(new Error("Request timed out"));
        })), req.on("error", cb), body && isStream(body) ? body.on("error", cb).pipe(req) : req.end(body), 
        req;
    }
    function isStream(obj) {
        return "function" == typeof obj.pipe;
    }
    simpleGet.concat = function(opts, cb) {
        return simpleGet(opts, (function(err, res) {
            if (err) return cb(err);
            concat(res, (function(err, data) {
                if (err) return cb(err);
                if (opts.json) try {
                    data = JSON.parse(data.toString());
                } catch (err) {
                    return cb(err, res, data);
                }
                cb(null, res, data);
            }));
        }));
    }, [ "get", "post", "put", "patch", "head", "delete" ].forEach((function(method) {
        simpleGet[method] = function(opts, cb) {
            return "string" == typeof opts && (opts = {
                url: opts
            }), opts.method = method.toUpperCase(), simpleGet(opts, cb);
        };
    }));
}
