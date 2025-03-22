function(module, exports, __webpack_require__) {
    "use strict";
    var finalhandler = __webpack_require__(974), Router = __webpack_require__(456), methods = __webpack_require__(61), middleware = __webpack_require__(975), query = __webpack_require__(459), debug = __webpack_require__(8)("express:application"), View = __webpack_require__(976), http = __webpack_require__(11), compileETag = __webpack_require__(67).compileETag, compileQueryParser = __webpack_require__(67).compileQueryParser, compileTrust = __webpack_require__(67).compileTrust, deprecate = __webpack_require__(47)("express"), flatten = __webpack_require__(149), merge = __webpack_require__(60), resolve = __webpack_require__(4).resolve, setPrototypeOf = __webpack_require__(108), slice = Array.prototype.slice, app = module.exports = {};
    function logerror(err) {
        "test" !== this.get("env") && console.error(err.stack || err.toString());
    }
    app.init = function() {
        this.cache = {}, this.engines = {}, this.settings = {}, this.defaultConfiguration();
    }, app.defaultConfiguration = function() {
        var env = "production";
        this.enable("x-powered-by"), this.set("etag", "weak"), this.set("env", env), this.set("query parser", "extended"), 
        this.set("subdomain offset", 2), this.set("trust proxy", !1), Object.defineProperty(this.settings, "@@symbol:trust_proxy_default", {
            configurable: !0,
            value: !0
        }), debug("booting in %s mode", env), this.on("mount", (function(parent) {
            !0 === this.settings["@@symbol:trust_proxy_default"] && "function" == typeof parent.settings["trust proxy fn"] && (delete this.settings["trust proxy"], 
            delete this.settings["trust proxy fn"]), setPrototypeOf(this.request, parent.request), 
            setPrototypeOf(this.response, parent.response), setPrototypeOf(this.engines, parent.engines), 
            setPrototypeOf(this.settings, parent.settings);
        })), this.locals = Object.create(null), this.mountpath = "/", this.locals.settings = this.settings, 
        this.set("view", View), this.set("views", resolve("views")), this.set("jsonp callback name", "callback"), 
        this.enable("view cache"), Object.defineProperty(this, "router", {
            get: function() {
                throw new Error("'app.router' is deprecated!\nPlease see the 3.x to 4.x migration guide for details on how to update your app.");
            }
        });
    }, app.lazyrouter = function() {
        this._router || (this._router = new Router({
            caseSensitive: this.enabled("case sensitive routing"),
            strict: this.enabled("strict routing")
        }), this._router.use(query(this.get("query parser fn"))), this._router.use(middleware.init(this)));
    }, app.handle = function(req, res, callback) {
        var router = this._router, done = callback || finalhandler(req, res, {
            env: this.get("env"),
            onerror: logerror.bind(this)
        });
        if (!router) return debug("no routes defined on app"), void done();
        router.handle(req, res, done);
    }, app.use = function(fn) {
        var offset = 0, path = "/";
        if ("function" != typeof fn) {
            for (var arg = fn; Array.isArray(arg) && 0 !== arg.length; ) arg = arg[0];
            "function" != typeof arg && (offset = 1, path = fn);
        }
        var fns = flatten(slice.call(arguments, offset));
        if (0 === fns.length) throw new TypeError("app.use() requires a middleware function");
        this.lazyrouter();
        var router = this._router;
        return fns.forEach((function(fn) {
            if (!fn || !fn.handle || !fn.set) return router.use(path, fn);
            debug(".use app under %s", path), fn.mountpath = path, fn.parent = this, router.use(path, (function(req, res, next) {
                var orig = req.app;
                fn.handle(req, res, (function(err) {
                    setPrototypeOf(req, orig.request), setPrototypeOf(res, orig.response), next(err);
                }));
            })), fn.emit("mount", this);
        }), this), this;
    }, app.route = function(path) {
        return this.lazyrouter(), this._router.route(path);
    }, app.engine = function(ext, fn) {
        if ("function" != typeof fn) throw new Error("callback function required");
        var extension = "." !== ext[0] ? "." + ext : ext;
        return this.engines[extension] = fn, this;
    }, app.param = function(name, fn) {
        if (this.lazyrouter(), Array.isArray(name)) {
            for (var i = 0; i < name.length; i++) this.param(name[i], fn);
            return this;
        }
        return this._router.param(name, fn), this;
    }, app.set = function(setting, val) {
        if (1 === arguments.length) return this.settings[setting];
        switch (debug('set "%s" to %o', setting, val), this.settings[setting] = val, setting) {
          case "etag":
            this.set("etag fn", compileETag(val));
            break;

          case "query parser":
            this.set("query parser fn", compileQueryParser(val));
            break;

          case "trust proxy":
            this.set("trust proxy fn", compileTrust(val)), Object.defineProperty(this.settings, "@@symbol:trust_proxy_default", {
                configurable: !0,
                value: !1
            });
        }
        return this;
    }, app.path = function() {
        return this.parent ? this.parent.path() + this.mountpath : "";
    }, app.enabled = function(setting) {
        return Boolean(this.set(setting));
    }, app.disabled = function(setting) {
        return !this.set(setting);
    }, app.enable = function(setting) {
        return this.set(setting, !0);
    }, app.disable = function(setting) {
        return this.set(setting, !1);
    }, methods.forEach((function(method) {
        app[method] = function(path) {
            if ("get" === method && 1 === arguments.length) return this.set(path);
            this.lazyrouter();
            var route = this._router.route(path);
            return route[method].apply(route, slice.call(arguments, 1)), this;
        };
    })), app.all = function(path) {
        this.lazyrouter();
        for (var route = this._router.route(path), args = slice.call(arguments, 1), i = 0; i < methods.length; i++) route[methods[i]].apply(route, args);
        return this;
    }, app.del = deprecate.function(app.delete, "app.del: Use app.delete instead"), 
    app.render = function(name, options, callback) {
        var view, cache = this.cache, done = callback, engines = this.engines, opts = options, renderOptions = {};
        if ("function" == typeof options && (done = options, opts = {}), merge(renderOptions, this.locals), 
        opts._locals && merge(renderOptions, opts._locals), merge(renderOptions, opts), 
        null == renderOptions.cache && (renderOptions.cache = this.enabled("view cache")), 
        renderOptions.cache && (view = cache[name]), !view) {
            if (!(view = new (this.get("view"))(name, {
                defaultEngine: this.get("view engine"),
                root: this.get("views"),
                engines: engines
            })).path) {
                var dirs = Array.isArray(view.root) && view.root.length > 1 ? 'directories "' + view.root.slice(0, -1).join('", "') + '" or "' + view.root[view.root.length - 1] + '"' : 'directory "' + view.root + '"', err = new Error('Failed to lookup view "' + name + '" in views ' + dirs);
                return err.view = view, done(err);
            }
            renderOptions.cache && (cache[name] = view);
        }
        !(function(view, options, callback) {
            try {
                view.render(options, callback);
            } catch (err) {
                callback(err);
            }
        })(view, renderOptions, done);
    }, app.listen = function() {
        var server = http.createServer(this);
        return server.listen.apply(server, arguments);
    };
}
