function(module, exports, __webpack_require__) {
    "use strict";
    var debug = __webpack_require__(8)("router"), flatten = __webpack_require__(470).flatten, Layer = __webpack_require__(471), methods = __webpack_require__(61), mixin = __webpack_require__(60), parseUrl = __webpack_require__(46), Route = __webpack_require__(1036), setPrototypeOf = __webpack_require__(1037), slice = Array.prototype.slice, defer = "function" == typeof setImmediate ? setImmediate : function(fn) {
        process.nextTick(fn.bind.apply(fn, arguments));
    };
    function Router(options) {
        if (!(this instanceof Router)) return new Router(options);
        var opts = options || {};
        function router(req, res, next) {
            router.handle(req, res, next);
        }
        return setPrototypeOf(router, this), router.caseSensitive = opts.caseSensitive, 
        router.mergeParams = opts.mergeParams, router.params = {}, router.strict = opts.strict, 
        router.stack = [], router;
    }
    function matchLayer(layer, path) {
        try {
            return layer.match(path);
        } catch (err) {
            return err;
        }
    }
    module.exports = Router, module.exports.Route = Route, Router.prototype = function() {}, 
    Router.prototype.param = function(name, fn) {
        if (!name) throw new TypeError("argument name is required");
        if ("string" != typeof name) throw new TypeError("argument name must be a string");
        if (!fn) throw new TypeError("argument fn is required");
        if ("function" != typeof fn) throw new TypeError("argument fn must be a function");
        var params = this.params[name];
        return params || (params = this.params[name] = []), params.push(fn), this;
    }, Router.prototype.handle = function(req, res, callback) {
        if (!callback) throw new TypeError("argument callback is required");
        debug("dispatching %s %s", req.method, req.url);
        var methods, old, fn, idx = 0, protohost = (function(url) {
            if ("string" == typeof url && 0 !== url.length && "/" !== url[0]) {
                var searchIndex = url.indexOf("?"), pathLength = -1 !== searchIndex ? searchIndex : url.length, fqdnIndex = url.substring(0, pathLength).indexOf("://");
                return -1 !== fqdnIndex ? url.substring(0, url.indexOf("/", 3 + fqdnIndex)) : void 0;
            }
        })(req.url) || "", removed = "", self = this, slashAdded = !1, sync = 0, paramcalled = {}, stack = this.stack, parentParams = req.params, parentUrl = req.baseUrl || "", done = (function(fn, obj) {
            for (var props = new Array(arguments.length - 2), vals = new Array(arguments.length - 2), i = 0; i < props.length; i++) props[i] = arguments[i + 2], 
            vals[i] = obj[props[i]];
            return function() {
                for (var i = 0; i < props.length; i++) obj[props[i]] = vals[i];
                return fn.apply(this, arguments);
            };
        })(callback, req, "baseUrl", "next", "params");
        function next(err) {
            var layerError = "route" === err ? null : err;
            if (slashAdded && (req.url = req.url.slice(1), slashAdded = !1), 0 !== removed.length && (req.baseUrl = parentUrl, 
            req.url = protohost + removed + req.url.slice(protohost.length), removed = ""), 
            "router" !== layerError) if (idx >= stack.length) defer(done, layerError); else {
                if (++sync > 100) return defer(next, err);
                var layer, match, route, path = (function(req) {
                    try {
                        return parseUrl(req).pathname;
                    } catch (err) {
                        return;
                    }
                })(req);
                if (null == path) return done(layerError);
                for (;!0 !== match && idx < stack.length; ) if (match = matchLayer(layer = stack[idx++], path), 
                route = layer.route, "boolean" != typeof match && (layerError = layerError || match), 
                !0 === match && route) if (layerError) match = !1; else {
                    var method = req.method, has_method = route._handles_method(method);
                    !has_method && "OPTIONS" === method && methods && methods.push.apply(methods, route._methods()), 
                    has_method || "HEAD" === method || (match = !1);
                }
                if (!0 !== match) return done(layerError);
                route && (req.route = route), req.params = self.mergeParams ? (function(params, parent) {
                    if ("object" != typeof parent || !parent) return params;
                    var obj = mixin({}, parent);
                    if (!(0 in params) || !(0 in parent)) return mixin(obj, params);
                    for (var i = 0, o = 0; i in params; ) i++;
                    for (;o in parent; ) o++;
                    for (i--; i >= 0; i--) params[i + o] = params[i], i < o && delete params[i];
                    return mixin(obj, params);
                })(layer.params, parentParams) : layer.params;
                var layerPath = layer.path;
                self.process_params(layer, paramcalled, req, res, (function(err) {
                    err ? next(layerError || err) : route ? layer.handle_request(req, res, next) : (function(layer, layerError, layerPath, path) {
                        if (0 !== layerPath.length) {
                            if (layerPath !== path.substring(0, layerPath.length)) return void next(layerError);
                            var c = path[layerPath.length];
                            if (c && "/" !== c) return void next(layerError);
                            debug("trim prefix (%s) from url %s", layerPath, req.url), removed = layerPath, 
                            req.url = protohost + req.url.slice(protohost.length + removed.length), protohost || "/" === req.url[0] || (req.url = "/" + req.url, 
                            slashAdded = !0), req.baseUrl = parentUrl + ("/" === removed[removed.length - 1] ? removed.substring(0, removed.length - 1) : removed);
                        }
                        debug("%s %s : %s", layer.name, layerPath, req.originalUrl), layerError ? layer.handle_error(layerError, req, res, next) : layer.handle_request(req, res, next);
                    })(layer, layerError, layerPath, path), sync = 0;
                }));
            } else defer(done, null);
        }
        req.next = next, "OPTIONS" === req.method && (old = done, fn = (function(res, methods) {
            return function(fn, err) {
                if (err || 0 === methods.length) return fn(err);
                !(function(res, methods, next) {
                    try {
                        !(function(res, methods) {
                            for (var options = Object.create(null), i = 0; i < methods.length; i++) options[methods[i]] = !0;
                            var allow = Object.keys(options).sort().join(", ");
                            res.setHeader("Allow", allow), res.setHeader("Content-Length", Buffer.byteLength(allow)), 
                            res.setHeader("Content-Type", "text/plain"), res.setHeader("X-Content-Type-Options", "nosniff"), 
                            res.end(allow);
                        })(res, methods);
                    } catch (err) {
                        next(err);
                    }
                })(res, methods, fn);
            };
        })(res, methods = []), done = function() {
            var args = new Array(arguments.length + 1);
            args[0] = old;
            for (var i = 0, len = arguments.length; i < len; i++) args[i + 1] = arguments[i];
            fn.apply(this, args);
        }), req.baseUrl = parentUrl, req.originalUrl = req.originalUrl || req.url, next();
    }, Router.prototype.process_params = function(layer, called, req, res, done) {
        var params = this.params, keys = layer.keys;
        if (!keys || 0 === keys.length) return done();
        var name, key, paramVal, paramCallbacks, paramCalled, i = 0, paramIndex = 0;
        function param(err) {
            return err ? done(err) : i >= keys.length ? done() : (paramIndex = 0, key = keys[i++], 
            name = key.name, paramVal = req.params[name], paramCallbacks = params[name], paramCalled = called[name], 
            void 0 !== paramVal && paramCallbacks ? paramCalled && (paramCalled.match === paramVal || paramCalled.error && "route" !== paramCalled.error) ? (req.params[name] = paramCalled.value, 
            param(paramCalled.error)) : (called[name] = paramCalled = {
                error: null,
                match: paramVal,
                value: paramVal
            }, void paramCallback()) : param());
        }
        function paramCallback(err) {
            var fn = paramCallbacks[paramIndex++];
            if (paramCalled.value = req.params[key.name], err) return paramCalled.error = err, 
            void param(err);
            if (!fn) return param();
            try {
                fn(req, res, paramCallback, paramVal, key.name);
            } catch (e) {
                paramCallback(e);
            }
        }
        param();
    }, Router.prototype.use = function(handler) {
        var offset = 0, path = "/";
        if ("function" != typeof handler) {
            for (var arg = handler; Array.isArray(arg) && 0 !== arg.length; ) arg = arg[0];
            "function" != typeof arg && (offset = 1, path = handler);
        }
        var callbacks = flatten(slice.call(arguments, offset));
        if (0 === callbacks.length) throw new TypeError("argument handler is required");
        for (var i = 0; i < callbacks.length; i++) {
            var fn = callbacks[i];
            if ("function" != typeof fn) throw new TypeError("argument handler must be a function");
            debug("use %o %s", path, fn.name || "<anonymous>");
            var layer = new Layer(path, {
                sensitive: this.caseSensitive,
                strict: !1,
                end: !1
            }, fn);
            layer.route = void 0, this.stack.push(layer);
        }
        return this;
    }, Router.prototype.route = function(path) {
        var route = new Route(path), layer = new Layer(path, {
            sensitive: this.caseSensitive,
            strict: this.strict,
            end: !0
        }, (function(req, res, next) {
            route.dispatch(req, res, next);
        }));
        return layer.route = route, this.stack.push(layer), route;
    }, methods.concat("all").forEach((function(method) {
        Router.prototype[method] = function(path) {
            var route = this.route(path);
            return route[method].apply(route, slice.call(arguments, 1)), this;
        };
    }));
}
