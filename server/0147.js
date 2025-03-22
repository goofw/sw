function(module, exports, __webpack_require__) {
    "use strict";
    var hasOwn = Object.prototype.hasOwnProperty, toStr = Object.prototype.toString, defineProperty = Object.defineProperty, gOPD = Object.getOwnPropertyDescriptor, isArray = function(arr) {
        return "function" == typeof Array.isArray ? Array.isArray(arr) : "[object Array]" === toStr.call(arr);
    }, isPlainObject = function(obj) {
        if (!obj || "[object Object]" !== toStr.call(obj)) return !1;
        var key, hasOwnConstructor = hasOwn.call(obj, "constructor"), hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, "isPrototypeOf");
        if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) return !1;
        for (key in obj) ;
        return void 0 === key || hasOwn.call(obj, key);
    }, setProperty = function(target, options) {
        defineProperty && "__proto__" === options.name ? defineProperty(target, options.name, {
            enumerable: !0,
            configurable: !0,
            value: options.newValue,
            writable: !0
        }) : target[options.name] = options.newValue;
    }, getProperty = function(obj, name) {
        if ("__proto__" === name) {
            if (!hasOwn.call(obj, name)) return;
            if (gOPD) return gOPD(obj, name).value;
        }
        return obj[name];
    };
    module.exports = function extend() {
        var options, name, src, copy, copyIsArray, clone, target = arguments[0], i = 1, length = arguments.length, deep = !1;
        for ("boolean" == typeof target && (deep = target, target = arguments[1] || {}, 
        i = 2), (null == target || "object" != typeof target && "function" != typeof target) && (target = {}); i < length; ++i) if (null != (options = arguments[i])) for (name in options) src = getProperty(target, name), 
        target !== (copy = getProperty(options, name)) && (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy))) ? (copyIsArray ? (copyIsArray = !1, 
        clone = src && isArray(src) ? src : []) : clone = src && isPlainObject(src) ? src : {}, 
        setProperty(target, {
            name: name,
            newValue: extend(deep, clone, copy)
        })) : void 0 !== copy && setProperty(target, {
            name: name,
            newValue: copy
        }));
        return target;
    };
}
