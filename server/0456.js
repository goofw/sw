function(module, exports, __webpack_require__) {
    "use strict";
    var Route = __webpack_require__(457), Layer = __webpack_require__(458), methods = __webpack_require__(61), mixin = __webpack_require__(60), debug = __webpack_require__(8)("express:router"), deprecate = __webpack_require__(47)("express"), flatten = __webpack_require__(149), parseUrl = __webpack_require__(46), setPrototypeOf = __webpack_require__(108), objectRegExp = /^\[object (\S+)\]$/, slice = Array.prototype.slice, toString = Object.prototype.toString, proto = module.exports = function(options) {
        var opts = options || {};
        function router(req, res, next) {
            router.handle(req, res, next);
        }
        return setPrototypeOf(router, proto), router.params = {}, router._params = [], router.caseSensitive = opts.caseSensitive, 
        router.mergeParams = opts.mergeParams, router.strict = opts.strict, router.stack = [], 
        router;
    };
    function appendMethods(list, addition) {
        for (var i = 0; i < addition.length; i++) {
            var method = addition[i];
            -1 === list.indexOf(method) && list.push(method);
        }
    }
    function gettype(obj) {
        var type = typeof obj;
        return "object" !== type ? type : toString.call(obj).replace(objectRegExp, "$1");
    }
    function matchLayer(layer, path) {
        try {
            return layer.match(path);
        } catch (err) {
            return err;
        }
    }
    proto.param = function(name, fn) {
        if ("function" == typeof name) return deprecate("router.param(fn): Refactor to use path params"), 
        void this._params.push(name);
        var ret, params = this._params, len = params.length;
        ":" === name[0] && (deprecate("router.param(" + JSON.stringify(name) + ", fn): Use router.param(" + JSON.stringify(name.substr(1)) + ", fn) instead"), 
        name = name.substr(1));
        for (var i = 0; i < len; ++i) (ret = params[i](name, fn)) && (fn = ret);
        if ("function" != typeof fn) throw new Error("invalid param() call for " + name + ", got " + fn);
        return (this.params[name] = this.params[name] || []).push(fn), this;
    }, proto.handle = function(req, res, out) {
        var self = this;
        debug("dispatching %s %s", req.method, req.url);
        var old, fn, idx = 0, protohost = (function(url) {
            if ("string" == typeof url && 0 !== url.length && "/" !== url[0]) {
                var searchIndex = url.indexOf("?"), pathLength = -1 !== searchIndex ? searchIndex : url.length, fqdnIndex = url.substr(0, pathLength).indexOf("://");
                return -1 !== fqdnIndex ? url.substr(0, url.indexOf("/", 3 + fqdnIndex)) : void 0;
            }
        })(req.url) || "", removed = "", slashAdded = !1, paramcalled = {}, options = [], stack = self.stack, parentParams = req.params, parentUrl = req.baseUrl || "", done = (function(fn, obj) {
            for (var props = new Array(arguments.length - 2), vals = new Array(arguments.length - 2), i = 0; i < props.length; i++) props[i] = arguments[i + 2], 
            vals[i] = obj[props[i]];
            return function() {
                for (var i = 0; i < props.length; i++) obj[props[i]] = vals[i];
                return fn.apply(this, arguments);
            };
        })(out, req, "baseUrl", "next", "params");
        function next(err) {
            var layerError = "route" === err ? null : err;
            if (slashAdded && (req.url = req.url.substr(1), slashAdded = !1), 0 !== removed.length && (req.baseUrl = parentUrl, 
            req.url = protohost + removed + req.url.substr(protohost.length), removed = ""), 
            "router" !== layerError) if (idx >= stack.length) setImmediate(done, layerError); else {
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
                    has_method || "OPTIONS" !== method || appendMethods(options, route._options()), 
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
                    return err ? next(layerError || err) : route ? layer.handle_request(req, res, next) : void (function(layer, layerError, layerPath, path) {
                        if (0 !== layerPath.length) {
                            var c = path[layerPath.length];
                            if (c && "/" !== c && "." !== c) return next(layerError);
                            debug("trim prefix (%s) from url %s", layerPath, req.url), removed = layerPath, 
                            req.url = protohost + req.url.substr(protohost.length + removed.length), protohost || "/" === req.url[0] || (req.url = "/" + req.url, 
                            slashAdded = !0), req.baseUrl = parentUrl + ("/" === removed[removed.length - 1] ? removed.substring(0, removed.length - 1) : removed);
                        }
                        debug("%s %s : %s", layer.name, layerPath, req.originalUrl), layerError ? layer.handle_error(layerError, req, res, next) : layer.handle_request(req, res, next);
                    })(layer, layerError, layerPath, path);
                }));
            } else setImmediate(done, null);
        }
        req.next = next, "OPTIONS" === req.method && (old = done, fn = function(old, err) {
            if (err || 0 === options.length) return old(err);
            !(function(res, options, next) {
                try {
                    var body = options.join(",");
                    res.set("Allow", body), res.send(body);
                } catch (err) {
                    next(err);
                }
            })(res, options, old);
        }, done = function() {
            var args = new Array(arguments.length + 1);
            args[0] = old;
            for (var i = 0, len = arguments.length; i < len; i++) args[i + 1] = arguments[i];
            fn.apply(this, args);
        }), req.baseUrl = parentUrl, req.originalUrl = req.originalUrl || req.url, next();
    }, proto.process_params = function(layer, called, req, res, done) {
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
    }, proto.use = function(fn) {
        var offset = 0, path = "/";
        if ("function" != typeof fn) {
            for (var arg = fn; Array.isArray(arg) && 0 !== arg.length; ) arg = arg[0];
            "function" != typeof arg && (offset = 1, path = fn);
        }
        var callbacks = flatten(slice.call(arguments, offset));
        if (0 === callbacks.length) throw new TypeError("Router.use() requires a middleware function");
        for (var i = 0; i < callbacks.length; i++) {
            if ("function" != typeof (fn = callbacks[i])) throw new TypeError("Router.use() requires a middleware function but got a " + gettype(fn));
            debug("use %o %s", path, fn.name || "<anonymous>");
            var layer = new Layer(path, {
                sensitive: this.caseSensitive,
                strict: !1,
                end: !1
            }, fn);
            layer.route = void 0, this.stack.push(layer);
        }
        return this;
    }, proto.route = function(path) {
        var route = new Route(path), layer = new Layer(path, {
            sensitive: this.caseSensitive,
            strict: this.strict,
            end: !0
        }, route.dispatch.bind(route));
        return layer.route = route, this.stack.push(layer), route;
    }, methods.concat("all").forEach((function(method) {
        proto[method] = function(path) {
            var route = this.route(path);
            return route[method].apply(route, slice.call(arguments, 1)), this;
        };
    }));
}
