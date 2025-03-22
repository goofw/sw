function(module, exports, __webpack_require__) {
    "use strict";
    var debug = __webpack_require__(8)("connect:dispatcher"), EventEmitter = __webpack_require__(5).EventEmitter, finalhandler = __webpack_require__(544), http = __webpack_require__(11), merge = __webpack_require__(60), parseUrl = __webpack_require__(46);
    module.exports = function() {
        function app(req, res, next) {
            app.handle(req, res, next);
        }
        return merge(app, proto), merge(app, EventEmitter.prototype), app.route = "/", app.stack = [], 
        app;
    };
    var proto = {}, defer = "function" == typeof setImmediate ? setImmediate : function(fn) {
        process.nextTick(fn.bind.apply(fn, arguments));
    };
    function logerror(err) {
        console.error(err.stack || err.toString());
    }
    proto.use = function(route, fn) {
        var handle = fn, path = route;
        if ("string" != typeof route && (handle = route, path = "/"), "function" == typeof handle.handle) {
            var server = handle;
            server.route = path, handle = function(req, res, next) {
                server.handle(req, res, next);
            };
        }
        return handle instanceof http.Server && (handle = handle.listeners("request")[0]), 
        "/" === path[path.length - 1] && (path = path.slice(0, -1)), debug("use %s %s", path || "/", handle.name || "anonymous"), 
        this.stack.push({
            route: path,
            handle: handle
        }), this;
    }, proto.handle = function(req, res, out) {
        var index = 0, protohost = (function(url) {
            if (0 !== url.length && "/" !== url[0]) {
                var searchIndex = url.indexOf("?"), pathLength = -1 !== searchIndex ? searchIndex : url.length, fqdnIndex = url.substr(0, pathLength).indexOf("://");
                return -1 !== fqdnIndex ? url.substr(0, url.indexOf("/", 3 + fqdnIndex)) : void 0;
            }
        })(req.url) || "", removed = "", slashAdded = !1, stack = this.stack, done = out || finalhandler(req, res, {
            env: "production",
            onerror: logerror
        });
        req.originalUrl = req.originalUrl || req.url, (function next(err) {
            slashAdded && (req.url = req.url.substr(1), slashAdded = !1), 0 !== removed.length && (req.url = protohost + removed + req.url.substr(protohost.length), 
            removed = "");
            var layer = stack[index++];
            if (layer) {
                var path = parseUrl(req).pathname || "/", route = layer.route;
                if (path.toLowerCase().substr(0, route.length) !== route.toLowerCase()) return next(err);
                var c = path.length > route.length && path[route.length];
                if (c && "/" !== c && "." !== c) return next(err);
                0 !== route.length && "/" !== route && (removed = route, req.url = protohost + req.url.substr(protohost.length + removed.length), 
                protohost || "/" === req.url[0] || (req.url = "/" + req.url, slashAdded = !0)), 
                (function(handle, route, err, req, res, next) {
                    var arity = handle.length, error = err, hasError = Boolean(err);
                    debug("%s %s : %s", handle.name || "<anonymous>", route, req.originalUrl);
                    try {
                        if (hasError && 4 === arity) return void handle(err, req, res, next);
                        if (!hasError && arity < 4) return void handle(req, res, next);
                    } catch (e) {
                        error = e;
                    }
                    next(error);
                })(layer.handle, route, err, req, res, next);
            } else defer(done, err);
        })();
    }, proto.listen = function() {
        var server = http.createServer(this);
        return server.listen.apply(server, arguments);
    };
}
