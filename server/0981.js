function(module, exports, __webpack_require__) {
    "use strict";
    var accepts = __webpack_require__(982), deprecate = __webpack_require__(47)("express"), isIP = __webpack_require__(42).isIP, typeis = __webpack_require__(88), http = __webpack_require__(11), fresh = __webpack_require__(462), parseRange = __webpack_require__(159), parse = __webpack_require__(46), proxyaddr = __webpack_require__(463), req = Object.create(http.IncomingMessage.prototype);
    function defineGetter(obj, name, getter) {
        Object.defineProperty(obj, name, {
            configurable: !0,
            enumerable: !0,
            get: getter
        });
    }
    module.exports = req, req.get = req.header = function(name) {
        if (!name) throw new TypeError("name argument is required to req.get");
        if ("string" != typeof name) throw new TypeError("name must be a string to req.get");
        var lc = name.toLowerCase();
        switch (lc) {
          case "referer":
          case "referrer":
            return this.headers.referrer || this.headers.referer;

          default:
            return this.headers[lc];
        }
    }, req.accepts = function() {
        var accept = accepts(this);
        return accept.types.apply(accept, arguments);
    }, req.acceptsEncodings = function() {
        var accept = accepts(this);
        return accept.encodings.apply(accept, arguments);
    }, req.acceptsEncoding = deprecate.function(req.acceptsEncodings, "req.acceptsEncoding: Use acceptsEncodings instead"), 
    req.acceptsCharsets = function() {
        var accept = accepts(this);
        return accept.charsets.apply(accept, arguments);
    }, req.acceptsCharset = deprecate.function(req.acceptsCharsets, "req.acceptsCharset: Use acceptsCharsets instead"), 
    req.acceptsLanguages = function() {
        var accept = accepts(this);
        return accept.languages.apply(accept, arguments);
    }, req.acceptsLanguage = deprecate.function(req.acceptsLanguages, "req.acceptsLanguage: Use acceptsLanguages instead"), 
    req.range = function(size, options) {
        var range = this.get("Range");
        if (range) return parseRange(size, range, options);
    }, req.param = function(name, defaultValue) {
        var params = this.params || {}, body = this.body || {}, query = this.query || {}, args = 1 === arguments.length ? "name" : "name, default";
        return deprecate("req.param(" + args + "): Use req.params, req.body, or req.query instead"), 
        null != params[name] && params.hasOwnProperty(name) ? params[name] : null != body[name] ? body[name] : null != query[name] ? query[name] : defaultValue;
    }, req.is = function(types) {
        var arr = types;
        if (!Array.isArray(types)) {
            arr = new Array(arguments.length);
            for (var i = 0; i < arr.length; i++) arr[i] = arguments[i];
        }
        return typeis(this, arr);
    }, defineGetter(req, "protocol", (function() {
        var proto = this.connection.encrypted ? "https" : "http";
        if (!this.app.get("trust proxy fn")(this.connection.remoteAddress, 0)) return proto;
        var header = this.get("X-Forwarded-Proto") || proto, index = header.indexOf(",");
        return -1 !== index ? header.substring(0, index).trim() : header.trim();
    })), defineGetter(req, "secure", (function() {
        return "https" === this.protocol;
    })), defineGetter(req, "ip", (function() {
        var trust = this.app.get("trust proxy fn");
        return proxyaddr(this, trust);
    })), defineGetter(req, "ips", (function() {
        var trust = this.app.get("trust proxy fn"), addrs = proxyaddr.all(this, trust);
        return addrs.reverse().pop(), addrs;
    })), defineGetter(req, "subdomains", (function() {
        var hostname = this.hostname;
        if (!hostname) return [];
        var offset = this.app.get("subdomain offset");
        return (isIP(hostname) ? [ hostname ] : hostname.split(".").reverse()).slice(offset);
    })), defineGetter(req, "path", (function() {
        return parse(this).pathname;
    })), defineGetter(req, "hostname", (function() {
        var trust = this.app.get("trust proxy fn"), host = this.get("X-Forwarded-Host");
        if (host && trust(this.connection.remoteAddress, 0) ? -1 !== host.indexOf(",") && (host = host.substring(0, host.indexOf(",")).trimRight()) : host = this.get("Host"), 
        host) {
            var offset = "[" === host[0] ? host.indexOf("]") + 1 : 0, index = host.indexOf(":", offset);
            return -1 !== index ? host.substring(0, index) : host;
        }
    })), defineGetter(req, "host", deprecate.function((function() {
        return this.hostname;
    }), "req.host: Use req.hostname instead")), defineGetter(req, "fresh", (function() {
        var method = this.method, res = this.res, status = res.statusCode;
        return ("GET" === method || "HEAD" === method) && (status >= 200 && status < 300 || 304 === status) && fresh(this.headers, {
            etag: res.get("ETag"),
            "last-modified": res.get("Last-Modified")
        });
    })), defineGetter(req, "stale", (function() {
        return !this.fresh;
    })), defineGetter(req, "xhr", (function() {
        return "xmlhttprequest" === (this.get("X-Requested-With") || "").toLowerCase();
    }));
}
