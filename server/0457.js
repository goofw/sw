function(module, exports, __webpack_require__) {
    "use strict";
    var debug = __webpack_require__(8)("express:router:route"), flatten = __webpack_require__(149), Layer = __webpack_require__(458), methods = __webpack_require__(61), slice = Array.prototype.slice, toString = Object.prototype.toString;
    function Route(path) {
        this.path = path, this.stack = [], debug("new %o", path), this.methods = {};
    }
    module.exports = Route, Route.prototype._handles_method = function(method) {
        if (this.methods._all) return !0;
        var name = method.toLowerCase();
        return "head" !== name || this.methods.head || (name = "get"), Boolean(this.methods[name]);
    }, Route.prototype._options = function() {
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
            var layer = stack[idx++];
            return layer ? layer.method && layer.method !== method ? next(err) : void (err ? layer.handle_error(err, req, res, next) : layer.handle_request(req, res, next)) : done(err);
        })();
    }, Route.prototype.all = function() {
        for (var handles = flatten(slice.call(arguments)), i = 0; i < handles.length; i++) {
            var handle = handles[i];
            if ("function" != typeof handle) {
                var type = toString.call(handle), msg = "Route.all() requires a callback function but got a " + type;
                throw new TypeError(msg);
            }
            var layer = Layer("/", {}, handle);
            layer.method = void 0, this.methods._all = !0, this.stack.push(layer);
        }
        return this;
    }, methods.forEach((function(method) {
        Route.prototype[method] = function() {
            for (var handles = flatten(slice.call(arguments)), i = 0; i < handles.length; i++) {
                var handle = handles[i];
                if ("function" != typeof handle) {
                    var type = toString.call(handle), msg = "Route." + method + "() requires a callback function but got a " + type;
                    throw new Error(msg);
                }
                debug("%s %o", method, this.path);
                var layer = Layer("/", {}, handle);
                layer.method = method, this.methods[method] = !0, this.stack.push(layer);
            }
            return this;
        };
    }));
}
