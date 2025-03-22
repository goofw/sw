function(module, exports, __webpack_require__) {
    "use strict";
    var cr = Object.create;
    if (cr) {
        var callerCache = cr(null), getterCache = cr(null);
        callerCache[" size"] = getterCache[" size"] = 0;
    }
    module.exports = function(Promise) {
        var getMethodCaller, getGetter, util = __webpack_require__(17), canEvaluate = util.canEvaluate, isIdentifier = util.isIdentifier, makeMethodCaller = function(methodName) {
            return new Function("ensureMethod", "                                    \n        return function(obj) {                                               \n            'use strict'                                                     \n            var len = this.length;                                           \n            ensureMethod(obj, 'methodName');                                 \n            switch(len) {                                                    \n                case 1: return obj.methodName(this[0]);                      \n                case 2: return obj.methodName(this[0], this[1]);             \n                case 3: return obj.methodName(this[0], this[1], this[2]);    \n                case 0: return obj.methodName();                             \n                default:                                                     \n                    return obj.methodName.apply(obj, this);                  \n            }                                                                \n        };                                                                   \n        ".replace(/methodName/g, methodName))(ensureMethod);
        }, makeGetter = function(propertyName) {
            return new Function("obj", "                                             \n        'use strict';                                                        \n        return obj.propertyName;                                             \n        ".replace("propertyName", propertyName));
        }, getCompiled = function(name, compiler, cache) {
            var ret = cache[name];
            if ("function" != typeof ret) {
                if (!isIdentifier(name)) return null;
                if (ret = compiler(name), cache[name] = ret, cache[" size"]++, cache[" size"] > 512) {
                    for (var keys = Object.keys(cache), i = 0; i < 256; ++i) delete cache[keys[i]];
                    cache[" size"] = keys.length - 256;
                }
            }
            return ret;
        };
        function ensureMethod(obj, methodName) {
            var fn;
            if (null != obj && (fn = obj[methodName]), "function" != typeof fn) {
                var message = "Object " + util.classString(obj) + " has no method '" + util.toString(methodName) + "'";
                throw new Promise.TypeError(message);
            }
            return fn;
        }
        function caller(obj) {
            return ensureMethod(obj, this.pop()).apply(obj, this);
        }
        function namedGetter(obj) {
            return obj[this];
        }
        function indexedGetter(obj) {
            var index = +this;
            return index < 0 && (index = Math.max(0, index + obj.length)), obj[index];
        }
        getMethodCaller = function(name) {
            return getCompiled(name, makeMethodCaller, callerCache);
        }, getGetter = function(name) {
            return getCompiled(name, makeGetter, getterCache);
        }, Promise.prototype.call = function(methodName) {
            for (var $_len = arguments.length, args = new Array(Math.max($_len - 1, 0)), $_i = 1; $_i < $_len; ++$_i) args[$_i - 1] = arguments[$_i];
            if (canEvaluate) {
                var maybeCaller = getMethodCaller(methodName);
                if (null !== maybeCaller) return this._then(maybeCaller, void 0, void 0, args, void 0);
            }
            return args.push(methodName), this._then(caller, void 0, void 0, args, void 0);
        }, Promise.prototype.get = function(propertyName) {
            var getter;
            if ("number" == typeof propertyName) getter = indexedGetter; else if (canEvaluate) {
                var maybeGetter = getGetter(propertyName);
                getter = null !== maybeGetter ? maybeGetter : namedGetter;
            } else getter = namedGetter;
            return this._then(getter, void 0, void 0, propertyName, void 0);
        };
    };
}
