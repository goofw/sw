function(module, exports, __webpack_require__) {
    "use strict";
    var debug = __webpack_require__(8)("router:route"), flatten = __webpack_require__(250), Layer = __webpack_require__(251), methods = __webpack_require__(61), slice = Array.prototype.slice;
    function Route(path) {
        debug("new %o", path), this.path = path, this.stack = [], this.methods = {};
    }
    module.exports = Route, Route.prototype._handles_method = function(method) {
        if (this.methods._all) return !0;
        var name = method.toLowerCase();
        return "head" !== name || this.methods.head || (name = "get"), Boolean(this.methods[name]);
    }, Route.prototype._methods = function() {
        var methods = Object.keys(this.methods);
        this.methods.get && !this.methods.head && methods.push("head");
        for (var i = 0; i < methods.length; i++) methods[i] = methods[i].toUpperCase();
        return methods;
    }, Route.prototype.dispatch = function(req, res, done) {
        var idx = 0, stack = this.stack;
        if (0 === stack.length) return done();
        var method = req.method.toLowerCase();
        "head" !== method || this.methods.head || (method = "get"), req.route = this, (function next(err) {
            if (err && "route" === err) return done();
            if (err && "router" === err) return done(err);
            if (idx >= stack.length) return done(err);
            for (var layer, match; !0 !== match && idx < stack.length; ) match = !(layer = stack[idx++]).method || layer.method === method;
            if (!0 !== match) return done(err);
            err ? layer.handle_error(err, req, res, next) : layer.handle_request(req, res, next);
        })();
    }, Route.prototype.all = function(handler) {
        var callbacks = flatten(slice.call(arguments));
        if (0 === callbacks.length) throw new TypeError("argument handler is required");
        for (var i = 0; i < callbacks.length; i++) {
            var fn = callbacks[i];
            if ("function" != typeof fn) throw new TypeError("argument handler must be a function");
            var layer = Layer("/", {}, fn);
            layer.method = void 0, this.methods._all = !0, this.stack.push(layer);
        }
        return this;
    }, methods.forEach((function(method) {
        Route.prototype[method] = function(handler) {
            var callbacks = flatten(slice.call(arguments));
            if (0 === callbacks.length) throw new TypeError("argument handler is required");
            for (var i = 0; i < callbacks.length; i++) {
                var fn = callbacks[i];
                if ("function" != typeof fn) throw new TypeError("argument handler must be a function");
                debug("%s %s", method, this.path);
                var layer = Layer("/", {}, fn);
                layer.method = method, this.methods[method] = !0, this.stack.push(layer);
            }
            return this;
        };
    }));
}
