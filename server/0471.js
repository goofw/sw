function(module, exports, __webpack_require__) {
    "use strict";
    var pathRegexp = __webpack_require__(161), debug = __webpack_require__(8)("router:layer"), hasOwnProperty = Object.prototype.hasOwnProperty;
    function Layer(path, options, fn) {
        if (!(this instanceof Layer)) return new Layer(path, options, fn);
        debug("new %o", path);
        var opts = options || {};
        this.handle = fn, this.name = fn.name || "<anonymous>", this.params = void 0, this.path = void 0, 
        this.regexp = pathRegexp(path, this.keys = [], opts), this.regexp.fast_star = "*" === path, 
        this.regexp.fast_slash = "/" === path && !1 === opts.end;
    }
    function decode_param(val) {
        if ("string" != typeof val || 0 === val.length) return val;
        try {
            return decodeURIComponent(val);
        } catch (err) {
            throw err instanceof URIError && (err.message = "Failed to decode param '" + val + "'", 
            err.status = 400), err;
        }
    }
    module.exports = Layer, Layer.prototype.handle_error = function(error, req, res, next) {
        var fn = this.handle;
        if (4 !== fn.length) return next(error);
        try {
            fn(error, req, res, next);
        } catch (err) {
            next(err);
        }
    }, Layer.prototype.handle_request = function(req, res, next) {
        var fn = this.handle;
        if (fn.length > 3) return next();
        try {
            fn(req, res, next);
        } catch (err) {
            next(err);
        }
    }, Layer.prototype.match = function(path) {
        var match;
        if (null != path) {
            if (this.regexp.fast_slash) return this.params = {}, this.path = "", !0;
            if (this.regexp.fast_star) return this.params = {
                0: decode_param(path)
            }, this.path = path, !0;
            match = this.regexp.exec(path);
        }
        if (!match) return this.params = void 0, this.path = void 0, !1;
        this.params = {}, this.path = match[0];
        for (var keys = this.keys, params = this.params, i = 1; i < match.length; i++) {
            var prop = keys[i - 1].name, val = decode_param(match[i]);
            void 0 === val && hasOwnProperty.call(params, prop) || (params[prop] = val);
        }
        return !0;
    };
}
