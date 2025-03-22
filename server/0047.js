function(module, exports, __webpack_require__) {
    var callSiteToString = __webpack_require__(247).callSiteToString, eventListenerCount = __webpack_require__(247).eventListenerCount, relative = __webpack_require__(4).relative;
    module.exports = depd;
    var basePath = process.cwd();
    function containsNamespace(str, namespace) {
        for (var vals = str.split(/[ ,]+/), ns = String(namespace).toLowerCase(), i = 0; i < vals.length; i++) {
            var val = vals[i];
            if (val && ("*" === val || val.toLowerCase() === ns)) return !0;
        }
        return !1;
    }
    function convertDataDescriptorToAccessor(obj, prop, message) {
        var descriptor = Object.getOwnPropertyDescriptor(obj, prop), value = descriptor.value;
        return descriptor.get = function() {
            return value;
        }, descriptor.writable && (descriptor.set = function(val) {
            return value = val;
        }), delete descriptor.value, delete descriptor.writable, Object.defineProperty(obj, prop, descriptor), 
        descriptor;
    }
    function createArgumentsString(arity) {
        for (var str = "", i = 0; i < arity; i++) str += ", arg" + i;
        return str.substr(2);
    }
    function createStackString(stack) {
        var str = this.name + ": " + this.namespace;
        this.message && (str += " deprecated " + this.message);
        for (var i = 0; i < stack.length; i++) str += "\n    at " + callSiteToString(stack[i]);
        return str;
    }
    function depd(namespace) {
        if (!namespace) throw new TypeError("argument namespace is required");
        var file = callSiteLocation(getStack()[1])[0];
        function deprecate(message) {
            log.call(deprecate, message);
        }
        return deprecate._file = file, deprecate._ignored = isignored(namespace), deprecate._namespace = namespace, 
        deprecate._traced = istraced(namespace), deprecate._warned = Object.create(null), 
        deprecate.function = wrapfunction, deprecate.property = wrapproperty, deprecate;
    }
    function isignored(namespace) {
        return !!process.noDeprecation || containsNamespace(process.env.NO_DEPRECATION || "", namespace);
    }
    function istraced(namespace) {
        return !!process.traceDeprecation || containsNamespace(process.env.TRACE_DEPRECATION || "", namespace);
    }
    function log(message, site) {
        var haslisteners = 0 !== eventListenerCount(process, "deprecation");
        if (haslisteners || !this._ignored) {
            var caller, callFile, callSite, depSite, i = 0, seen = !1, stack = getStack(), file = this._file;
            for (site ? (depSite = site, (callSite = callSiteLocation(stack[1])).name = depSite.name, 
            file = callSite[0]) : callSite = depSite = callSiteLocation(stack[i = 2]); i < stack.length; i++) if ((callFile = (caller = callSiteLocation(stack[i]))[0]) === file) seen = !0; else if (callFile === this._file) file = this._file; else if (seen) break;
            var key = caller ? depSite.join(":") + "__" + caller.join(":") : void 0;
            if (void 0 === key || !(key in this._warned)) {
                this._warned[key] = !0;
                var msg = message;
                if (msg || (msg = callSite !== depSite && callSite.name ? defaultMessage(callSite) : defaultMessage(depSite)), 
                haslisteners) {
                    var err = DeprecationError(this._namespace, msg, stack.slice(i));
                    process.emit("deprecation", err);
                } else {
                    var output = (process.stderr.isTTY ? formatColor : formatPlain).call(this, msg, caller, stack.slice(i));
                    process.stderr.write(output + "\n", "utf8");
                }
            }
        }
    }
    function callSiteLocation(callSite) {
        var file = callSite.getFileName() || "<anonymous>", line = callSite.getLineNumber(), colm = callSite.getColumnNumber();
        callSite.isEval() && (file = callSite.getEvalOrigin() + ", " + file);
        var site = [ file, line, colm ];
        return site.callSite = callSite, site.name = callSite.getFunctionName(), site;
    }
    function defaultMessage(site) {
        var callSite = site.callSite, funcName = site.name;
        funcName || (funcName = "<anonymous@" + formatLocation(site) + ">");
        var context = callSite.getThis(), typeName = context && callSite.getTypeName();
        return "Object" === typeName && (typeName = void 0), "Function" === typeName && (typeName = context.name || typeName), 
        typeName && callSite.getMethodName() ? typeName + "." + funcName : funcName;
    }
    function formatPlain(msg, caller, stack) {
        var formatted = (new Date).toUTCString() + " " + this._namespace + " deprecated " + msg;
        if (this._traced) {
            for (var i = 0; i < stack.length; i++) formatted += "\n    at " + callSiteToString(stack[i]);
            return formatted;
        }
        return caller && (formatted += " at " + formatLocation(caller)), formatted;
    }
    function formatColor(msg, caller, stack) {
        var formatted = "[36;1m" + this._namespace + "[22;39m [33;1mdeprecated[22;39m [0m" + msg + "[39m";
        if (this._traced) {
            for (var i = 0; i < stack.length; i++) formatted += "\n    [36mat " + callSiteToString(stack[i]) + "[39m";
            return formatted;
        }
        return caller && (formatted += " [36m" + formatLocation(caller) + "[39m"), formatted;
    }
    function formatLocation(callSite) {
        return relative(basePath, callSite[0]) + ":" + callSite[1] + ":" + callSite[2];
    }
    function getStack() {
        var limit = Error.stackTraceLimit, obj = {}, prep = Error.prepareStackTrace;
        Error.prepareStackTrace = prepareObjectStackTrace, Error.stackTraceLimit = Math.max(10, limit), 
        Error.captureStackTrace(obj);
        var stack = obj.stack.slice(1);
        return Error.prepareStackTrace = prep, Error.stackTraceLimit = limit, stack;
    }
    function prepareObjectStackTrace(obj, stack) {
        return stack;
    }
    function wrapfunction(fn, message) {
        if ("function" != typeof fn) throw new TypeError("argument fn must be a function");
        var args = createArgumentsString(fn.length), deprecate = this, stack = getStack(), site = callSiteLocation(stack[1]);
        site.name = fn.name;
        var deprecatedfn = eval("(function (" + args + ') {\n"use strict"\nlog.call(deprecate, message, site)\nreturn fn.apply(this, arguments)\n})');
        return deprecatedfn;
    }
    function wrapproperty(obj, prop, message) {
        if (!obj || "object" != typeof obj && "function" != typeof obj) throw new TypeError("argument obj must be object");
        var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
        if (!descriptor) throw new TypeError("must call property on owner object");
        if (!descriptor.configurable) throw new TypeError("property must be configurable");
        var deprecate = this, site = callSiteLocation(getStack()[1]);
        site.name = prop, "value" in descriptor && (descriptor = convertDataDescriptorToAccessor(obj, prop, message));
        var get = descriptor.get, set = descriptor.set;
        "function" == typeof get && (descriptor.get = function() {
            return log.call(deprecate, message, site), get.apply(this, arguments);
        }), "function" == typeof set && (descriptor.set = function() {
            return log.call(deprecate, message, site), set.apply(this, arguments);
        }), Object.defineProperty(obj, prop, descriptor);
    }
    function DeprecationError(namespace, message, stack) {
        var stackString, error = new Error;
        return Object.defineProperty(error, "constructor", {
            value: DeprecationError
        }), Object.defineProperty(error, "message", {
            configurable: !0,
            enumerable: !1,
            value: message,
            writable: !0
        }), Object.defineProperty(error, "name", {
            enumerable: !1,
            configurable: !0,
            value: "DeprecationError",
            writable: !0
        }), Object.defineProperty(error, "namespace", {
            configurable: !0,
            enumerable: !1,
            value: namespace,
            writable: !0
        }), Object.defineProperty(error, "stack", {
            configurable: !0,
            enumerable: !1,
            get: function() {
                return void 0 !== stackString ? stackString : stackString = createStackString.call(this, stack);
            },
            set: function(val) {
                stackString = val;
            }
        }), error;
    }
}
