function(module, exports, __webpack_require__) {
    module.exports = simpleGet;
    const concat = __webpack_require__(259), decompressResponse = __webpack_require__(260), http = __webpack_require__(11), https = __webpack_require__(22), once = __webpack_require__(34), querystring = __webpack_require__(28), url = __webpack_require__(7), isStream = o => null !== o && "object" == typeof o && "function" == typeof o.pipe;
    function simpleGet(opts, cb) {
        if (opts = Object.assign({
            maxRedirects: 10
        }, "string" == typeof opts ? {
            url: opts
        } : opts), cb = once(cb), opts.url) {
            const {hostname: hostname, port: port, protocol: protocol, auth: auth, path: path} = url.parse(opts.url);
            delete opts.url, hostname || port || protocol || auth ? Object.assign(opts, {
                hostname: hostname,
                port: port,
                protocol: protocol,
                auth: auth,
                path: path
            }) : opts.path = path;
        }
        const headers = {
            "accept-encoding": "gzip, deflate"
        };
        let body;
        opts.headers && Object.keys(opts.headers).forEach((k => headers[k.toLowerCase()] = opts.headers[k])), 
        opts.headers = headers, opts.body ? body = opts.json && !isStream(opts.body) ? JSON.stringify(opts.body) : opts.body : opts.form && (body = "string" == typeof opts.form ? opts.form : querystring.stringify(opts.form), 
        opts.headers["content-type"] = "application/x-www-form-urlencoded"), body && (opts.method || (opts.method = "POST"), 
        isStream(body) || (opts.headers["content-length"] = Buffer.byteLength(body)), opts.json && !opts.form && (opts.headers["content-type"] = "application/json")), 
        delete opts.body, delete opts.form, opts.json && (opts.headers.accept = "application/json"), 
        opts.method && (opts.method = opts.method.toUpperCase());
        const req = ("https:" === opts.protocol ? https : http).request(opts, (res => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) return opts.url = res.headers.location, 
            delete opts.headers.host, res.resume(), "POST" === opts.method && [ 301, 302 ].includes(res.statusCode) && (opts.method = "GET", 
            delete opts.headers["content-length"], delete opts.headers["content-type"]), 0 == opts.maxRedirects-- ? cb(new Error("too many redirects")) : simpleGet(opts, cb);
            const tryUnzip = "function" == typeof decompressResponse && "HEAD" !== opts.method;
            cb(null, tryUnzip ? decompressResponse(res) : res);
        }));
        return req.on("timeout", (() => {
            req.abort(), cb(new Error("Request timed out"));
        })), req.on("error", cb), isStream(body) ? body.on("error", cb).pipe(req) : req.end(body), 
        req;
    }
    simpleGet.concat = (opts, cb) => simpleGet(opts, ((err, res) => {
        if (err) return cb(err);
        concat(res, ((err, data) => {
            if (err) return cb(err);
            if (opts.json) try {
                data = JSON.parse(data.toString());
            } catch (err) {
                return cb(err, res, data);
            }
            cb(null, res, data);
        }));
    })), [ "get", "post", "put", "patch", "head", "delete" ].forEach((method => {
        simpleGet[method] = (opts, cb) => ("string" == typeof opts && (opts = {
            url: opts
        }), simpleGet(Object.assign({
            method: method.toUpperCase()
        }, opts), cb));
    }));
}
