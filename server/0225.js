function(module, exports, __webpack_require__) {
    "use strict";
    var createError = __webpack_require__(87), debug = __webpack_require__(8)("send"), deprecate = __webpack_require__(47)("send"), destroy = __webpack_require__(978), encodeUrl = __webpack_require__(83), escapeHtml = __webpack_require__(84), etag = __webpack_require__(461), fresh = __webpack_require__(462), fs = __webpack_require__(2), mime = __webpack_require__(63), ms = __webpack_require__(979), onFinished = __webpack_require__(85), parseRange = __webpack_require__(159), path = __webpack_require__(4), statuses = __webpack_require__(109), Stream = __webpack_require__(3), util = __webpack_require__(0), extname = path.extname, join = path.join, normalize = path.normalize, resolve = path.resolve, sep = path.sep, BYTES_RANGE_REGEXP = /^ *bytes=/, UP_PATH_REGEXP = /(?:^|[\\/])\.\.(?:[\\/]|$)/;
    function SendStream(req, path, options) {
        Stream.call(this);
        var opts = options || {};
        if (this.options = opts, this.path = path, this.req = req, this._acceptRanges = void 0 === opts.acceptRanges || Boolean(opts.acceptRanges), 
        this._cacheControl = void 0 === opts.cacheControl || Boolean(opts.cacheControl), 
        this._etag = void 0 === opts.etag || Boolean(opts.etag), this._dotfiles = void 0 !== opts.dotfiles ? opts.dotfiles : "ignore", 
        "ignore" !== this._dotfiles && "allow" !== this._dotfiles && "deny" !== this._dotfiles) throw new TypeError('dotfiles option must be "allow", "deny", or "ignore"');
        this._hidden = Boolean(opts.hidden), void 0 !== opts.hidden && deprecate("hidden: use dotfiles: '" + (this._hidden ? "allow" : "ignore") + "' instead"), 
        void 0 === opts.dotfiles && (this._dotfiles = void 0), this._extensions = void 0 !== opts.extensions ? normalizeList(opts.extensions, "extensions option") : [], 
        this._immutable = void 0 !== opts.immutable && Boolean(opts.immutable), this._index = void 0 !== opts.index ? normalizeList(opts.index, "index option") : [ "index.html" ], 
        this._lastModified = void 0 === opts.lastModified || Boolean(opts.lastModified), 
        this._maxage = opts.maxAge || opts.maxage, this._maxage = "string" == typeof this._maxage ? ms(this._maxage) : Number(this._maxage), 
        this._maxage = isNaN(this._maxage) ? 0 : Math.min(Math.max(0, this._maxage), 31536e6), 
        this._root = opts.root ? resolve(opts.root) : null, !this._root && opts.from && this.from(opts.from);
    }
    function contentRange(type, size, range) {
        return type + " " + (range ? range.start + "-" + range.end : "*") + "/" + size;
    }
    function createHtmlDocument(title, body) {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>' + title + "</title>\n</head>\n<body>\n<pre>" + body + "</pre>\n</body>\n</html>\n";
    }
    function getHeaderNames(res) {
        return "function" != typeof res.getHeaderNames ? Object.keys(res._headers || {}) : res.getHeaderNames();
    }
    function hasListeners(emitter, type) {
        return ("function" != typeof emitter.listenerCount ? emitter.listeners(type).length : emitter.listenerCount(type)) > 0;
    }
    function normalizeList(val, name) {
        for (var list = [].concat(val || []), i = 0; i < list.length; i++) if ("string" != typeof list[i]) throw new TypeError(name + " must be array of strings or false");
        return list;
    }
    function parseHttpDate(date) {
        var timestamp = date && Date.parse(date);
        return "number" == typeof timestamp ? timestamp : NaN;
    }
    module.exports = function(req, path, options) {
        return new SendStream(req, path, options);
    }, module.exports.mime = mime, util.inherits(SendStream, Stream), SendStream.prototype.etag = deprecate.function((function(val) {
        return this._etag = Boolean(val), debug("etag %s", this._etag), this;
    }), "send.etag: pass etag as option"), SendStream.prototype.hidden = deprecate.function((function(val) {
        return this._hidden = Boolean(val), this._dotfiles = void 0, debug("hidden %s", this._hidden), 
        this;
    }), "send.hidden: use dotfiles option"), SendStream.prototype.index = deprecate.function((function(paths) {
        var index = paths ? normalizeList(paths, "paths argument") : [];
        return debug("index %o", paths), this._index = index, this;
    }), "send.index: pass index as option"), SendStream.prototype.root = function(path) {
        return this._root = resolve(String(path)), debug("root %s", this._root), this;
    }, SendStream.prototype.from = deprecate.function(SendStream.prototype.root, "send.from: pass root as option"), 
    SendStream.prototype.root = deprecate.function(SendStream.prototype.root, "send.root: pass root as option"), 
    SendStream.prototype.maxage = deprecate.function((function(maxAge) {
        return this._maxage = "string" == typeof maxAge ? ms(maxAge) : Number(maxAge), this._maxage = isNaN(this._maxage) ? 0 : Math.min(Math.max(0, this._maxage), 31536e6), 
        debug("max-age %d", this._maxage), this;
    }), "send.maxage: pass maxAge as option"), SendStream.prototype.error = function(status, err) {
        if (hasListeners(this, "error")) return this.emit("error", createError(status, err, {
            expose: !1
        }));
        var res = this.res, msg = statuses[status] || String(status), doc = createHtmlDocument("Error", escapeHtml(msg));
        !(function(res) {
            for (var headers = getHeaderNames(res), i = 0; i < headers.length; i++) res.removeHeader(headers[i]);
        })(res), err && err.headers && (function(res, headers) {
            for (var keys = Object.keys(headers), i = 0; i < keys.length; i++) {
                var key = keys[i];
                res.setHeader(key, headers[key]);
            }
        })(res, err.headers), res.statusCode = status, res.setHeader("Content-Type", "text/html; charset=UTF-8"), 
        res.setHeader("Content-Length", Buffer.byteLength(doc)), res.setHeader("Content-Security-Policy", "default-src 'none'"), 
        res.setHeader("X-Content-Type-Options", "nosniff"), res.end(doc);
    }, SendStream.prototype.hasTrailingSlash = function() {
        return "/" === this.path[this.path.length - 1];
    }, SendStream.prototype.isConditionalGET = function() {
        return this.req.headers["if-match"] || this.req.headers["if-unmodified-since"] || this.req.headers["if-none-match"] || this.req.headers["if-modified-since"];
    }, SendStream.prototype.isPreconditionFailure = function() {
        var req = this.req, res = this.res, match = req.headers["if-match"];
        if (match) {
            var etag = res.getHeader("ETag");
            return !etag || "*" !== match && (function(str) {
                for (var end = 0, list = [], start = 0, i = 0, len = str.length; i < len; i++) switch (str.charCodeAt(i)) {
                  case 32:
                    start === end && (start = end = i + 1);
                    break;

                  case 44:
                    list.push(str.substring(start, end)), start = end = i + 1;
                    break;

                  default:
                    end = i + 1;
                }
                return list.push(str.substring(start, end)), list;
            })(match).every((function(match) {
                return match !== etag && match !== "W/" + etag && "W/" + match !== etag;
            }));
        }
        var unmodifiedSince = parseHttpDate(req.headers["if-unmodified-since"]);
        if (!isNaN(unmodifiedSince)) {
            var lastModified = parseHttpDate(res.getHeader("Last-Modified"));
            return isNaN(lastModified) || lastModified > unmodifiedSince;
        }
        return !1;
    }, SendStream.prototype.removeContentHeaderFields = function() {
        for (var res = this.res, headers = getHeaderNames(res), i = 0; i < headers.length; i++) {
            var header = headers[i];
            "content-" === header.substr(0, 8) && "content-location" !== header && res.removeHeader(header);
        }
    }, SendStream.prototype.notModified = function() {
        var res = this.res;
        debug("not modified"), this.removeContentHeaderFields(), res.statusCode = 304, res.end();
    }, SendStream.prototype.headersAlreadySent = function() {
        var err = new Error("Can't set headers after they are sent.");
        debug("headers already sent"), this.error(500, err);
    }, SendStream.prototype.isCachable = function() {
        var statusCode = this.res.statusCode;
        return statusCode >= 200 && statusCode < 300 || 304 === statusCode;
    }, SendStream.prototype.onStatError = function(error) {
        switch (error.code) {
          case "ENAMETOOLONG":
          case "ENOENT":
          case "ENOTDIR":
            this.error(404, error);
            break;

          default:
            this.error(500, error);
        }
    }, SendStream.prototype.isFresh = function() {
        return fresh(this.req.headers, {
            etag: this.res.getHeader("ETag"),
            "last-modified": this.res.getHeader("Last-Modified")
        });
    }, SendStream.prototype.isRangeFresh = function() {
        var ifRange = this.req.headers["if-range"];
        if (!ifRange) return !0;
        if (-1 !== ifRange.indexOf('"')) {
            var etag = this.res.getHeader("ETag");
            return Boolean(etag && -1 !== ifRange.indexOf(etag));
        }
        return parseHttpDate(this.res.getHeader("Last-Modified")) <= parseHttpDate(ifRange);
    }, SendStream.prototype.redirect = function(path) {
        var res = this.res;
        if (hasListeners(this, "directory")) this.emit("directory", res, path); else if (this.hasTrailingSlash()) this.error(403); else {
            var loc = encodeUrl((function(str) {
                for (var i = 0; i < str.length && "/" === str[i]; i++) ;
                return i > 1 ? "/" + str.substr(i) : str;
            })(this.path + "/")), doc = createHtmlDocument("Redirecting", 'Redirecting to <a href="' + escapeHtml(loc) + '">' + escapeHtml(loc) + "</a>");
            res.statusCode = 301, res.setHeader("Content-Type", "text/html; charset=UTF-8"), 
            res.setHeader("Content-Length", Buffer.byteLength(doc)), res.setHeader("Content-Security-Policy", "default-src 'none'"), 
            res.setHeader("X-Content-Type-Options", "nosniff"), res.setHeader("Location", loc), 
            res.end(doc);
        }
    }, SendStream.prototype.pipe = function(res) {
        var root = this._root;
        this.res = res;
        var parts, path = (function(path) {
            try {
                return decodeURIComponent(path);
            } catch (err) {
                return -1;
            }
        })(this.path);
        if (-1 === path) return this.error(400), res;
        if (~path.indexOf("\0")) return this.error(400), res;
        if (null !== root) {
            if (path && (path = normalize("." + sep + path)), UP_PATH_REGEXP.test(path)) return debug('malicious path "%s"', path), 
            this.error(403), res;
            parts = path.split(sep), path = normalize(join(root, path));
        } else {
            if (UP_PATH_REGEXP.test(path)) return debug('malicious path "%s"', path), this.error(403), 
            res;
            parts = normalize(path).split(sep), path = resolve(path);
        }
        if ((function(parts) {
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                if (part.length > 1 && "." === part[0]) return !0;
            }
            return !1;
        })(parts)) {
            var access = this._dotfiles;
            switch (void 0 === access && (access = "." === parts[parts.length - 1][0] ? this._hidden ? "allow" : "ignore" : "allow"), 
            debug('%s dotfile "%s"', access, path), access) {
              case "allow":
                break;

              case "deny":
                return this.error(403), res;

              default:
                return this.error(404), res;
            }
        }
        return this._index.length && this.hasTrailingSlash() ? (this.sendIndex(path), res) : (this.sendFile(path), 
        res);
    }, SendStream.prototype.send = function(path, stat) {
        var len = stat.size, options = this.options, opts = {}, res = this.res, req = this.req, ranges = req.headers.range, offset = options.start || 0;
        if ((function(res) {
            return "boolean" != typeof res.headersSent ? Boolean(res._header) : res.headersSent;
        })(res)) this.headersAlreadySent(); else {
            if (debug('pipe "%s"', path), this.setHeader(path, stat), this.type(path), this.isConditionalGET()) {
                if (this.isPreconditionFailure()) return void this.error(412);
                if (this.isCachable() && this.isFresh()) return void this.notModified();
            }
            if (len = Math.max(0, len - offset), void 0 !== options.end) {
                var bytes = options.end - offset + 1;
                len > bytes && (len = bytes);
            }
            if (this._acceptRanges && BYTES_RANGE_REGEXP.test(ranges)) {
                if (ranges = parseRange(len, ranges, {
                    combine: !0
                }), this.isRangeFresh() || (debug("range stale"), ranges = -2), -1 === ranges) return debug("range unsatisfiable"), 
                res.setHeader("Content-Range", contentRange("bytes", len)), this.error(416, {
                    headers: {
                        "Content-Range": res.getHeader("Content-Range")
                    }
                });
                -2 !== ranges && 1 === ranges.length && (debug("range %j", ranges), res.statusCode = 206, 
                res.setHeader("Content-Range", contentRange("bytes", len, ranges[0])), offset += ranges[0].start, 
                len = ranges[0].end - ranges[0].start + 1);
            }
            for (var prop in options) opts[prop] = options[prop];
            opts.start = offset, opts.end = Math.max(offset, offset + len - 1), res.setHeader("Content-Length", len), 
            "HEAD" !== req.method ? this.stream(path, opts) : res.end();
        }
    }, SendStream.prototype.sendFile = function(path) {
        var i = 0, self = this;
        function next(err) {
            if (self._extensions.length <= i) return err ? self.onStatError(err) : self.error(404);
            var p = path + "." + self._extensions[i++];
            debug('stat "%s"', p), fs.stat(p, (function(err, stat) {
                return err ? next(err) : stat.isDirectory() ? next() : (self.emit("file", p, stat), 
                void self.send(p, stat));
            }));
        }
        debug('stat "%s"', path), fs.stat(path, (function(err, stat) {
            return err && "ENOENT" === err.code && !extname(path) && path[path.length - 1] !== sep ? next(err) : err ? self.onStatError(err) : stat.isDirectory() ? self.redirect(path) : (self.emit("file", path, stat), 
            void self.send(path, stat));
        }));
    }, SendStream.prototype.sendIndex = function(path) {
        var i = -1, self = this;
        !(function next(err) {
            if (++i >= self._index.length) return err ? self.onStatError(err) : self.error(404);
            var p = join(path, self._index[i]);
            debug('stat "%s"', p), fs.stat(p, (function(err, stat) {
                return err ? next(err) : stat.isDirectory() ? next() : (self.emit("file", p, stat), 
                void self.send(p, stat));
            }));
        })();
    }, SendStream.prototype.stream = function(path, options) {
        var finished = !1, self = this, res = this.res, stream = fs.createReadStream(path, options);
        this.emit("stream", stream), stream.pipe(res), onFinished(res, (function() {
            finished = !0, destroy(stream);
        })), stream.on("error", (function(err) {
            finished || (finished = !0, destroy(stream), self.onStatError(err));
        })), stream.on("end", (function() {
            self.emit("end");
        }));
    }, SendStream.prototype.type = function(path) {
        var res = this.res;
        if (!res.getHeader("Content-Type")) {
            var type = mime.lookup(path);
            if (type) {
                var charset = mime.charsets.lookup(type);
                debug("content-type %s", type), res.setHeader("Content-Type", type + (charset ? "; charset=" + charset : ""));
            } else debug("no content-type");
        }
    }, SendStream.prototype.setHeader = function(path, stat) {
        var res = this.res;
        if (this.emit("headers", res, path, stat), this._acceptRanges && !res.getHeader("Accept-Ranges") && (debug("accept ranges"), 
        res.setHeader("Accept-Ranges", "bytes")), this._cacheControl && !res.getHeader("Cache-Control")) {
            var cacheControl = "public, max-age=" + Math.floor(this._maxage / 1e3);
            this._immutable && (cacheControl += ", immutable"), debug("cache-control %s", cacheControl), 
            res.setHeader("Cache-Control", cacheControl);
        }
        if (this._lastModified && !res.getHeader("Last-Modified")) {
            var modified = stat.mtime.toUTCString();
            debug("modified %s", modified), res.setHeader("Last-Modified", modified);
        }
        if (this._etag && !res.getHeader("ETag")) {
            var val = etag(stat);
            debug("etag %s", val), res.setHeader("ETag", val);
        }
    };
}
