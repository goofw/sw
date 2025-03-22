function(module, exports, __webpack_require__) {
    "use strict";
    var Buffer = __webpack_require__(23).Buffer, contentDisposition = __webpack_require__(460), deprecate = __webpack_require__(47)("express"), encodeUrl = __webpack_require__(83), escapeHtml = __webpack_require__(84), http = __webpack_require__(11), isAbsolute = __webpack_require__(67).isAbsolute, onFinished = __webpack_require__(85), path = __webpack_require__(4), statuses = __webpack_require__(109), merge = __webpack_require__(60), sign = __webpack_require__(989).sign, normalizeType = __webpack_require__(67).normalizeType, normalizeTypes = __webpack_require__(67).normalizeTypes, setCharset = __webpack_require__(67).setCharset, cookie = __webpack_require__(990), send = __webpack_require__(225), extname = path.extname, mime = send.mime, resolve = path.resolve, vary = __webpack_require__(464), res = Object.create(http.ServerResponse.prototype);
    module.exports = res;
    var charsetRegExp = /;\s*charset\s*=/;
    function sendfile(res, file, options, callback) {
        var streaming, done = !1;
        function onaborted() {
            if (!done) {
                done = !0;
                var err = new Error("Request aborted");
                err.code = "ECONNABORTED", callback(err);
            }
        }
        function onerror(err) {
            done || (done = !0, callback(err));
        }
        file.on("directory", (function() {
            if (!done) {
                done = !0;
                var err = new Error("EISDIR, read");
                err.code = "EISDIR", callback(err);
            }
        })), file.on("end", (function() {
            done || (done = !0, callback());
        })), file.on("error", onerror), file.on("file", (function() {
            streaming = !1;
        })), file.on("stream", (function() {
            streaming = !0;
        })), onFinished(res, (function(err) {
            return err && "ECONNRESET" === err.code ? onaborted() : err ? onerror(err) : void (done || setImmediate((function() {
                !1 === streaming || done ? done || (done = !0, callback()) : onaborted();
            })));
        })), options.headers && file.on("headers", (function(res) {
            for (var obj = options.headers, keys = Object.keys(obj), i = 0; i < keys.length; i++) {
                var k = keys[i];
                res.setHeader(k, obj[k]);
            }
        })), file.pipe(res);
    }
    function stringify(value, replacer, spaces, escape) {
        var json = replacer || spaces ? JSON.stringify(value, replacer, spaces) : JSON.stringify(value);
        return escape && (json = json.replace(/[<>&]/g, (function(c) {
            switch (c.charCodeAt(0)) {
              case 60:
                return "\\u003c";

              case 62:
                return "\\u003e";

              case 38:
                return "\\u0026";

              default:
                return c;
            }
        }))), json;
    }
    res.status = function(code) {
        return this.statusCode = code, this;
    }, res.links = function(links) {
        var link = this.get("Link") || "";
        return link && (link += ", "), this.set("Link", link + Object.keys(links).map((function(rel) {
            return "<" + links[rel] + '>; rel="' + rel + '"';
        })).join(", "));
    }, res.send = function(body) {
        var encoding, type, chunk = body, req = this.req, app = this.app;
        switch (2 === arguments.length && ("number" != typeof arguments[0] && "number" == typeof arguments[1] ? (deprecate("res.send(body, status): Use res.status(status).send(body) instead"), 
        this.statusCode = arguments[1]) : (deprecate("res.send(status, body): Use res.status(status).send(body) instead"), 
        this.statusCode = arguments[0], chunk = arguments[1])), "number" == typeof chunk && 1 === arguments.length && (this.get("Content-Type") || this.type("txt"), 
        deprecate("res.send(status): Use res.sendStatus(status) instead"), this.statusCode = chunk, 
        chunk = statuses[chunk]), typeof chunk) {
          case "string":
            this.get("Content-Type") || this.type("html");
            break;

          case "boolean":
          case "number":
          case "object":
            if (null === chunk) chunk = ""; else {
                if (!Buffer.isBuffer(chunk)) return this.json(chunk);
                this.get("Content-Type") || this.type("bin");
            }
        }
        "string" == typeof chunk && (encoding = "utf8", "string" == typeof (type = this.get("Content-Type")) && this.set("Content-Type", setCharset(type, "utf-8")));
        var len, etag, etagFn = app.get("etag fn"), generateETag = !this.get("ETag") && "function" == typeof etagFn;
        return void 0 !== chunk && (Buffer.isBuffer(chunk) ? len = chunk.length : !generateETag && chunk.length < 1e3 ? len = Buffer.byteLength(chunk, encoding) : (chunk = Buffer.from(chunk, encoding), 
        encoding = void 0, len = chunk.length), this.set("Content-Length", len)), generateETag && void 0 !== len && (etag = etagFn(chunk, encoding)) && this.set("ETag", etag), 
        req.fresh && (this.statusCode = 304), 204 !== this.statusCode && 304 !== this.statusCode || (this.removeHeader("Content-Type"), 
        this.removeHeader("Content-Length"), this.removeHeader("Transfer-Encoding"), chunk = ""), 
        "HEAD" === req.method ? this.end() : this.end(chunk, encoding), this;
    }, res.json = function(obj) {
        var val = obj;
        2 === arguments.length && ("number" == typeof arguments[1] ? (deprecate("res.json(obj, status): Use res.status(status).json(obj) instead"), 
        this.statusCode = arguments[1]) : (deprecate("res.json(status, obj): Use res.status(status).json(obj) instead"), 
        this.statusCode = arguments[0], val = arguments[1]));
        var app = this.app, escape = app.get("json escape"), replacer = app.get("json replacer"), spaces = app.get("json spaces"), body = stringify(val, replacer, spaces, escape);
        return this.get("Content-Type") || this.set("Content-Type", "application/json"), 
        this.send(body);
    }, res.jsonp = function(obj) {
        var val = obj;
        2 === arguments.length && ("number" == typeof arguments[1] ? (deprecate("res.jsonp(obj, status): Use res.status(status).json(obj) instead"), 
        this.statusCode = arguments[1]) : (deprecate("res.jsonp(status, obj): Use res.status(status).jsonp(obj) instead"), 
        this.statusCode = arguments[0], val = arguments[1]));
        var app = this.app, escape = app.get("json escape"), replacer = app.get("json replacer"), spaces = app.get("json spaces"), body = stringify(val, replacer, spaces, escape), callback = this.req.query[app.get("jsonp callback name")];
        return this.get("Content-Type") || (this.set("X-Content-Type-Options", "nosniff"), 
        this.set("Content-Type", "application/json")), Array.isArray(callback) && (callback = callback[0]), 
        "string" == typeof callback && 0 !== callback.length && (this.set("X-Content-Type-Options", "nosniff"), 
        this.set("Content-Type", "text/javascript"), body = "/**/ typeof " + (callback = callback.replace(/[^\[\]\w$.]/g, "")) + " === 'function' && " + callback + "(" + (body = body.replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029")) + ");"), 
        this.send(body);
    }, res.sendStatus = function(statusCode) {
        var body = statuses[statusCode] || String(statusCode);
        return this.statusCode = statusCode, this.type("txt"), this.send(body);
    }, res.sendFile = function(path, options, callback) {
        var done = callback, req = this.req, next = req.next, opts = options || {};
        if (!path) throw new TypeError("path argument is required to res.sendFile");
        if ("string" != typeof path) throw new TypeError("path must be a string to res.sendFile");
        if ("function" == typeof options && (done = options, opts = {}), !opts.root && !isAbsolute(path)) throw new TypeError("path must be absolute or specify root to res.sendFile");
        var pathname = encodeURI(path);
        sendfile(this, send(req, pathname, opts), opts, (function(err) {
            return done ? done(err) : err && "EISDIR" === err.code ? next() : void (err && "ECONNABORTED" !== err.code && "write" !== err.syscall && next(err));
        }));
    }, res.sendfile = function(path, options, callback) {
        var done = callback, req = this.req, next = req.next, opts = options || {};
        "function" == typeof options && (done = options, opts = {}), sendfile(this, send(req, path, opts), opts, (function(err) {
            return done ? done(err) : err && "EISDIR" === err.code ? next() : void (err && "ECONNABORTED" !== err.code && "write" !== err.syscall && next(err));
        }));
    }, res.sendfile = deprecate.function(res.sendfile, "res.sendfile: Use res.sendFile instead"), 
    res.download = function(path, filename, options, callback) {
        var done = callback, name = filename, opts = options || null;
        "function" == typeof filename ? (done = filename, name = null, opts = null) : "function" == typeof options && (done = options, 
        opts = null);
        var headers = {
            "Content-Disposition": contentDisposition(name || path)
        };
        if (opts && opts.headers) for (var keys = Object.keys(opts.headers), i = 0; i < keys.length; i++) {
            var key = keys[i];
            "content-disposition" !== key.toLowerCase() && (headers[key] = opts.headers[key]);
        }
        (opts = Object.create(opts)).headers = headers;
        var fullPath = resolve(path);
        return this.sendFile(fullPath, opts, done);
    }, res.contentType = res.type = function(type) {
        var ct = -1 === type.indexOf("/") ? mime.lookup(type) : type;
        return this.set("Content-Type", ct);
    }, res.format = function(obj) {
        var req = this.req, next = req.next, fn = obj.default;
        fn && delete obj.default;
        var keys = Object.keys(obj), key = keys.length > 0 && req.accepts(keys);
        if (this.vary("Accept"), key) this.set("Content-Type", normalizeType(key).value), 
        obj[key](req, this, next); else if (fn) fn(); else {
            var err = new Error("Not Acceptable");
            err.status = err.statusCode = 406, err.types = normalizeTypes(keys).map((function(o) {
                return o.value;
            })), next(err);
        }
        return this;
    }, res.attachment = function(filename) {
        return filename && this.type(extname(filename)), this.set("Content-Disposition", contentDisposition(filename)), 
        this;
    }, res.append = function(field, val) {
        var prev = this.get(field), value = val;
        return prev && (value = Array.isArray(prev) ? prev.concat(val) : Array.isArray(val) ? [ prev ].concat(val) : [ prev, val ]), 
        this.set(field, value);
    }, res.set = res.header = function(field, val) {
        if (2 === arguments.length) {
            var value = Array.isArray(val) ? val.map(String) : String(val);
            if ("content-type" === field.toLowerCase()) {
                if (Array.isArray(value)) throw new TypeError("Content-Type cannot be set to an Array");
                if (!charsetRegExp.test(value)) {
                    var charset = mime.charsets.lookup(value.split(";")[0]);
                    charset && (value += "; charset=" + charset.toLowerCase());
                }
            }
            this.setHeader(field, value);
        } else for (var key in field) this.set(key, field[key]);
        return this;
    }, res.get = function(field) {
        return this.getHeader(field);
    }, res.clearCookie = function(name, options) {
        var opts = merge({
            expires: new Date(1),
            path: "/"
        }, options);
        return this.cookie(name, "", opts);
    }, res.cookie = function(name, value, options) {
        var opts = merge({}, options), secret = this.req.secret, signed = opts.signed;
        if (signed && !secret) throw new Error('cookieParser("secret") required for signed cookies');
        var val = "object" == typeof value ? "j:" + JSON.stringify(value) : String(value);
        return signed && (val = "s:" + sign(val, secret)), "maxAge" in opts && (opts.expires = new Date(Date.now() + opts.maxAge), 
        opts.maxAge /= 1e3), null == opts.path && (opts.path = "/"), this.append("Set-Cookie", cookie.serialize(name, String(val), opts)), 
        this;
    }, res.location = function(url) {
        var loc = url;
        return "back" === url && (loc = this.req.get("Referrer") || "/"), this.set("Location", encodeUrl(loc));
    }, res.redirect = function(url) {
        var body, address = url, status = 302;
        2 === arguments.length && ("number" == typeof arguments[0] ? (status = arguments[0], 
        address = arguments[1]) : (deprecate("res.redirect(url, status): Use res.redirect(status, url) instead"), 
        status = arguments[1])), address = this.location(address).get("Location"), this.format({
            text: function() {
                body = statuses[status] + ". Redirecting to " + address;
            },
            html: function() {
                var u = escapeHtml(address);
                body = "<p>" + statuses[status] + '. Redirecting to <a href="' + u + '">' + u + "</a></p>";
            },
            default: function() {
                body = "";
            }
        }), this.statusCode = status, this.set("Content-Length", Buffer.byteLength(body)), 
        "HEAD" === this.req.method ? this.end() : this.end(body);
    }, res.vary = function(field) {
        return !field || Array.isArray(field) && !field.length ? (deprecate("res.vary(): Provide a field name"), 
        this) : (vary(this, field), this);
    }, res.render = function(view, options, callback) {
        var app = this.req.app, done = callback, opts = options || {}, req = this.req, self = this;
        "function" == typeof options && (done = options, opts = {}), opts._locals = self.locals, 
        done = done || function(err, str) {
            if (err) return req.next(err);
            self.send(str);
        }, app.render(view, opts, done);
    };
}
