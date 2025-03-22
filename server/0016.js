function(module, exports, __webpack_require__) {
    "use strict";
    var tryCatchTarget, es5 = __webpack_require__(66), canEvaluate = "undefined" == typeof navigator, errorObj = {
        e: {}
    }, globalObject = "undefined" != typeof self ? self : "undefined" != typeof window ? window : "undefined" != typeof global ? global : void 0 !== this ? this : null;
    function tryCatcher() {
        try {
            var target = tryCatchTarget;
            return tryCatchTarget = null, target.apply(this, arguments);
        } catch (e) {
            return errorObj.e = e, errorObj;
        }
    }
    function isPrimitive(val) {
        return null == val || !0 === val || !1 === val || "string" == typeof val || "number" == typeof val;
    }
    function notEnumerableProp(obj, name, value) {
        if (isPrimitive(obj)) return obj;
        var descriptor = {
            value: value,
            configurable: !0,
            enumerable: !1,
            writable: !0
        };
        return es5.defineProperty(obj, name, descriptor), obj;
    }
    var inheritedDataKeys = (function() {
        var excludedPrototypes = [ Array.prototype, Object.prototype, Function.prototype ], isExcludedProto = function(val) {
            for (var i = 0; i < excludedPrototypes.length; ++i) if (excludedPrototypes[i] === val) return !0;
            return !1;
        };
        if (es5.isES5) {
            var getKeys = Object.getOwnPropertyNames;
            return function(obj) {
                for (var ret = [], visitedKeys = Object.create(null); null != obj && !isExcludedProto(obj); ) {
                    var keys;
                    try {
                        keys = getKeys(obj);
                    } catch (e) {
                        return ret;
                    }
                    for (var i = 0; i < keys.length; ++i) {
                        var key = keys[i];
                        if (!visitedKeys[key]) {
                            visitedKeys[key] = !0;
                            var desc = Object.getOwnPropertyDescriptor(obj, key);
                            null != desc && null == desc.get && null == desc.set && ret.push(key);
                        }
                    }
                    obj = es5.getPrototypeOf(obj);
                }
                return ret;
            };
        }
        var hasProp = {}.hasOwnProperty;
        return function(obj) {
            if (isExcludedProto(obj)) return [];
            var ret = [];
            enumeration: for (var key in obj) if (hasProp.call(obj, key)) ret.push(key); else {
                for (var i = 0; i < excludedPrototypes.length; ++i) if (hasProp.call(excludedPrototypes[i], key)) continue enumeration;
                ret.push(key);
            }
            return ret;
        };
    })(), thisAssignmentPattern = /this\s*\.\s*\S+\s*=/;
    var rident = /^[a-z$_][a-z$_0-9]*$/i;
    function safeToString(obj) {
        try {
            return obj + "";
        } catch (e) {
            return "[no string representation]";
        }
    }
    function isError(obj) {
        return obj instanceof Error || null !== obj && "object" == typeof obj && "string" == typeof obj.message && "string" == typeof obj.name;
    }
    function canAttachTrace(obj) {
        return isError(obj) && es5.propertyIsWritable(obj, "stack");
    }
    var ensureErrorObject = "stack" in new Error ? function(value) {
        return canAttachTrace(value) ? value : new Error(safeToString(value));
    } : function(value) {
        if (canAttachTrace(value)) return value;
        try {
            throw new Error(safeToString(value));
        } catch (err) {
            return err;
        }
    };
    function classString(obj) {
        return {}.toString.call(obj);
    }
    var asArray = function(v) {
        return es5.isArray(v) ? v : null;
    };
    if ("undefined" != typeof Symbol && Symbol.iterator) {
        var ArrayFrom = "function" == typeof Array.from ? function(v) {
            return Array.from(v);
        } : function(v) {
            for (var itResult, ret = [], it = v[Symbol.iterator](); !(itResult = it.next()).done; ) ret.push(itResult.value);
            return ret;
        };
        asArray = function(v) {
            return es5.isArray(v) ? v : null != v && "function" == typeof v[Symbol.iterator] ? ArrayFrom(v) : null;
        };
    }
    var isNode = "undefined" != typeof process && "[object process]" === classString(process).toLowerCase(), hasEnvVariables = "undefined" != typeof process && void 0 !== process.env;
    var version, ret = {
        isClass: function(fn) {
            try {
                if ("function" == typeof fn) {
                    var keys = es5.names(fn.prototype), hasMethods = es5.isES5 && keys.length > 1, hasMethodsOtherThanConstructor = keys.length > 0 && !(1 === keys.length && "constructor" === keys[0]), hasThisAssignmentAndStaticMethods = thisAssignmentPattern.test(fn + "") && es5.names(fn).length > 0;
                    if (hasMethods || hasMethodsOtherThanConstructor || hasThisAssignmentAndStaticMethods) return !0;
                }
                return !1;
            } catch (e) {
                return !1;
            }
        },
        isIdentifier: function(str) {
            return rident.test(str);
        },
        inheritedDataKeys: inheritedDataKeys,
        getDataPropertyOrDefault: function(obj, key, defaultValue) {
            if (!es5.isES5) return {}.hasOwnProperty.call(obj, key) ? obj[key] : void 0;
            var desc = Object.getOwnPropertyDescriptor(obj, key);
            return null != desc ? null == desc.get && null == desc.set ? desc.value : defaultValue : void 0;
        },
        thrower: function(r) {
            throw r;
        },
        isArray: es5.isArray,
        asArray: asArray,
        notEnumerableProp: notEnumerableProp,
        isPrimitive: isPrimitive,
        isObject: function(value) {
            return "function" == typeof value || "object" == typeof value && null !== value;
        },
        isError: isError,
        canEvaluate: canEvaluate,
        errorObj: errorObj,
        tryCatch: function(fn) {
            return tryCatchTarget = fn, tryCatcher;
        },
        inherits: function(Child, Parent) {
            var hasProp = {}.hasOwnProperty;
            function T() {
                for (var propertyName in this.constructor = Child, this.constructor$ = Parent, Parent.prototype) hasProp.call(Parent.prototype, propertyName) && "$" !== propertyName.charAt(propertyName.length - 1) && (this[propertyName + "$"] = Parent.prototype[propertyName]);
            }
            return T.prototype = Parent.prototype, Child.prototype = new T, Child.prototype;
        },
        withAppended: function(target, appendee) {
            var i, len = target.length, ret = new Array(len + 1);
            for (i = 0; i < len; ++i) ret[i] = target[i];
            return ret[i] = appendee, ret;
        },
        maybeWrapAsError: function(maybeError) {
            return isPrimitive(maybeError) ? new Error(safeToString(maybeError)) : maybeError;
        },
        toFastProperties: function(obj) {
            function FakeConstructor() {}
            FakeConstructor.prototype = obj;
            var receiver = new FakeConstructor;
            function ic() {
                return typeof receiver.foo;
            }
            return ic(), ic(), obj;
        },
        filledRange: function(count, prefix, suffix) {
            for (var ret = new Array(count), i = 0; i < count; ++i) ret[i] = prefix + i + suffix;
            return ret;
        },
        toString: safeToString,
        canAttachTrace: canAttachTrace,
        ensureErrorObject: ensureErrorObject,
        originatesFromRejection: function(e) {
            return null != e && (e instanceof Error.__BluebirdErrorTypes__.OperationalError || !0 === e.isOperational);
        },
        markAsOriginatingFromRejection: function(e) {
            try {
                notEnumerableProp(e, "isOperational", !0);
            } catch (ignore) {}
        },
        classString: classString,
        copyDescriptors: function(from, to, filter) {
            for (var keys = es5.names(from), i = 0; i < keys.length; ++i) {
                var key = keys[i];
                if (filter(key)) try {
                    es5.defineProperty(to, key, es5.getDescriptor(from, key));
                } catch (ignore) {}
            }
        },
        hasDevTools: "undefined" != typeof chrome && chrome && "function" == typeof chrome.loadTimes,
        isNode: isNode,
        hasEnvVariables: hasEnvVariables,
        env: function(key) {
            return hasEnvVariables ? process.env[key] : void 0;
        },
        global: globalObject,
        getNativePromise: function() {
            if ("function" == typeof Promise) try {
                var promise = new Promise((function() {}));
                if ("[object Promise]" === {}.toString.call(promise)) return Promise;
            } catch (e) {}
        },
        domainBind: function(self, cb) {
            return self.bind(cb);
        }
    };
    ret.isRecentNode = ret.isNode && (process.versions && process.versions.node ? version = process.versions.node.split(".").map(Number) : process.version && (version = process.version.split(".").map(Number)), 
    0 === version[0] && version[1] > 10 || version[0] > 0), ret.isNode && ret.toFastProperties(process);
    try {
        throw new Error;
    } catch (e) {
        ret.lastLineError = e;
    }
    module.exports = ret;
}
