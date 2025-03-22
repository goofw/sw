function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise, INTERNAL) {
        var THIS = {}, util = __webpack_require__(17), nodebackForPromise = __webpack_require__(508), withAppended = util.withAppended, maybeWrapAsError = util.maybeWrapAsError, canEvaluate = util.canEvaluate, TypeError = __webpack_require__(58).TypeError, defaultPromisified = {
            __isPromisified__: !0
        }, noCopyPropsPattern = new RegExp("^(?:" + [ "arity", "length", "name", "arguments", "caller", "callee", "prototype", "__isPromisified__" ].join("|") + ")$"), defaultFilter = function(name) {
            return util.isIdentifier(name) && "_" !== name.charAt(0) && "constructor" !== name;
        };
        function propsFilter(key) {
            return !noCopyPropsPattern.test(key);
        }
        function isPromisified(fn) {
            try {
                return !0 === fn.__isPromisified__;
            } catch (e) {
                return !1;
            }
        }
        function hasPromisified(obj, key, suffix) {
            var val = util.getDataPropertyOrDefault(obj, key + suffix, defaultPromisified);
            return !!val && isPromisified(val);
        }
        var makeNodePromisified = canEvaluate ? function(callback, receiver, originalName, fn, _, multiArgs) {
            var newParameterCount = Math.max(0, (function(fn) {
                return "number" == typeof fn.length ? Math.max(Math.min(fn.length, 1024), 0) : 0;
            })(fn) - 1), argumentOrder = (function(likelyArgumentCount) {
                for (var ret = [ likelyArgumentCount ], min = Math.max(0, likelyArgumentCount - 1 - 3), i = likelyArgumentCount - 1; i >= min; --i) ret.push(i);
                for (i = likelyArgumentCount + 1; i <= 3; ++i) ret.push(i);
                return ret;
            })(newParameterCount), shouldProxyThis = "string" == typeof callback || receiver === THIS;
            var parameterCount, getFunctionCode = "string" == typeof callback ? "this != null ? this['" + callback + "'] : fn" : "fn", body = "'use strict';                                                \n        var ret = function (Parameters) {                                    \n            'use strict';                                                    \n            var len = arguments.length;                                      \n            var promise = new Promise(INTERNAL);                             \n            promise._captureStackTrace();                                    \n            var nodeback = nodebackForPromise(promise, " + multiArgs + ");   \n            var ret;                                                         \n            var callback = tryCatch([GetFunctionCode]);                      \n            switch(len) {                                                    \n                [CodeForSwitchCase]                                          \n            }                                                                \n            if (ret === errorObj) {                                          \n                promise._rejectCallback(maybeWrapAsError(ret.e), true, true);\n            }                                                                \n            if (!promise._isFateSealed()) promise._setAsyncGuaranteed();     \n            return promise;                                                  \n        };                                                                   \n        notEnumerableProp(ret, '__isPromisified__', true);                   \n        return ret;                                                          \n    ".replace("[CodeForSwitchCase]", (function() {
                for (var ret = "", i = 0; i < argumentOrder.length; ++i) ret += "case " + argumentOrder[i] + ":" + (count = argumentOrder[i], 
                argumentCount = void 0, args = void 0, comma = void 0, args = (argumentCount = count, 
                util.filledRange(argumentCount, "_arg", "")).join(", "), comma = count > 0 ? ", " : "", 
                (shouldProxyThis ? "ret = callback.call(this, {{args}}, nodeback); break;\n" : void 0 === receiver ? "ret = callback({{args}}, nodeback); break;\n" : "ret = callback.call(receiver, {{args}}, nodeback); break;\n").replace("{{args}}", args).replace(", ", comma));
                var count, argumentCount, args, comma;
                return ret + "                                                             \n        default:                                                             \n            var args = new Array(len + 1);                                   \n            var i = 0;                                                       \n            for (var i = 0; i < len; ++i) {                                  \n               args[i] = arguments[i];                                       \n            }                                                                \n            args[i] = nodeback;                                              \n            [CodeForCall]                                                    \n            break;                                                           \n        ".replace("[CodeForCall]", shouldProxyThis ? "ret = callback.apply(this, args);\n" : "ret = callback.apply(receiver, args);\n");
            })()).replace("[GetFunctionCode]", getFunctionCode);
            return body = body.replace("Parameters", (parameterCount = newParameterCount, util.filledRange(Math.max(parameterCount, 3), "_arg", ""))), 
            new Function("Promise", "fn", "receiver", "withAppended", "maybeWrapAsError", "nodebackForPromise", "tryCatch", "errorObj", "notEnumerableProp", "INTERNAL", body)(Promise, fn, receiver, withAppended, maybeWrapAsError, nodebackForPromise, util.tryCatch, util.errorObj, util.notEnumerableProp, INTERNAL);
        } : function(callback, receiver, _, fn, __, multiArgs) {
            var defaultThis = (function() {
                return this;
            })(), method = callback;
            function promisified() {
                var _receiver = receiver;
                receiver === THIS && (_receiver = this);
                var promise = new Promise(INTERNAL);
                promise._captureStackTrace();
                var cb = "string" == typeof method && this !== defaultThis ? this[method] : callback, fn = nodebackForPromise(promise, multiArgs);
                try {
                    cb.apply(_receiver, withAppended(arguments, fn));
                } catch (e) {
                    promise._rejectCallback(maybeWrapAsError(e), !0, !0);
                }
                return promise._isFateSealed() || promise._setAsyncGuaranteed(), promise;
            }
            return "string" == typeof method && (callback = fn), util.notEnumerableProp(promisified, "__isPromisified__", !0), 
            promisified;
        };
        function promisifyAll(obj, suffix, filter, promisifier, multiArgs) {
            for (var suffixRegexp = new RegExp(suffix.replace(/([$])/, "\\$") + "$"), methods = (function(obj, suffix, suffixRegexp, filter) {
                for (var keys = util.inheritedDataKeys(obj), ret = [], i = 0; i < keys.length; ++i) {
                    var key = keys[i], value = obj[key], passesDefaultFilter = filter === defaultFilter || defaultFilter(key);
                    "function" != typeof value || isPromisified(value) || hasPromisified(obj, key, suffix) || !filter(key, value, obj, passesDefaultFilter) || ret.push(key, value);
                }
                return (function(ret, suffix, suffixRegexp) {
                    for (var i = 0; i < ret.length; i += 2) {
                        var key = ret[i];
                        if (suffixRegexp.test(key)) for (var keyWithoutAsyncSuffix = key.replace(suffixRegexp, ""), j = 0; j < ret.length; j += 2) if (ret[j] === keyWithoutAsyncSuffix) throw new TypeError("Cannot promisify an API that has normal methods with '%s'-suffix\n\n    See http://goo.gl/MqrFmX\n".replace("%s", suffix));
                    }
                })(ret, suffix, suffixRegexp), ret;
            })(obj, suffix, suffixRegexp, filter), i = 0, len = methods.length; i < len; i += 2) {
                var key = methods[i], fn = methods[i + 1], promisifiedKey = key + suffix;
                if (promisifier === makeNodePromisified) obj[promisifiedKey] = makeNodePromisified(key, THIS, key, fn, suffix, multiArgs); else {
                    var promisified = promisifier(fn, (function() {
                        return makeNodePromisified(key, THIS, key, fn, suffix, multiArgs);
                    }));
                    util.notEnumerableProp(promisified, "__isPromisified__", !0), obj[promisifiedKey] = promisified;
                }
            }
            return util.toFastProperties(obj), obj;
        }
        Promise.promisify = function(fn, options) {
            if ("function" != typeof fn) throw new TypeError("expecting a function but got " + util.classString(fn));
            if (isPromisified(fn)) return fn;
            var callback, receiver, multiArgs, ret = (callback = fn, receiver = void 0 === (options = Object(options)).context ? THIS : options.context, 
            multiArgs = !!options.multiArgs, makeNodePromisified(callback, receiver, void 0, callback, null, multiArgs));
            return util.copyDescriptors(fn, ret, propsFilter), ret;
        }, Promise.promisifyAll = function(target, options) {
            if ("function" != typeof target && "object" != typeof target) throw new TypeError("the target of promisifyAll must be an object or a function\n\n    See http://goo.gl/MqrFmX\n");
            var multiArgs = !!(options = Object(options)).multiArgs, suffix = options.suffix;
            "string" != typeof suffix && (suffix = "Async");
            var filter = options.filter;
            "function" != typeof filter && (filter = defaultFilter);
            var promisifier = options.promisifier;
            if ("function" != typeof promisifier && (promisifier = makeNodePromisified), !util.isIdentifier(suffix)) throw new RangeError("suffix must be a valid identifier\n\n    See http://goo.gl/MqrFmX\n");
            for (var keys = util.inheritedDataKeys(target), i = 0; i < keys.length; ++i) {
                var value = target[keys[i]];
                "constructor" !== keys[i] && util.isClass(value) && (promisifyAll(value.prototype, suffix, filter, promisifier, multiArgs), 
                promisifyAll(value, suffix, filter, promisifier, multiArgs));
            }
            return promisifyAll(target, suffix, filter, promisifier, multiArgs);
        };
    };
}
