function(module, exports) {
    (function() {
        var assign, isArray, isEmpty, isFunction, isObject, isPlainObject, slice = [].slice, hasProp = {}.hasOwnProperty;
        assign = function() {
            var i, key, len, source, sources, target;
            if (target = arguments[0], sources = 2 <= arguments.length ? slice.call(arguments, 1) : [], 
            isFunction(Object.assign)) Object.assign.apply(null, arguments); else for (i = 0, 
            len = sources.length; i < len; i++) if (null != (source = sources[i])) for (key in source) hasProp.call(source, key) && (target[key] = source[key]);
            return target;
        }, isFunction = function(val) {
            return !!val && "[object Function]" === Object.prototype.toString.call(val);
        }, isObject = function(val) {
            var ref;
            return !!val && ("function" == (ref = typeof val) || "object" === ref);
        }, isArray = function(val) {
            return isFunction(Array.isArray) ? Array.isArray(val) : "[object Array]" === Object.prototype.toString.call(val);
        }, isEmpty = function(val) {
            var key;
            if (isArray(val)) return !val.length;
            for (key in val) if (hasProp.call(val, key)) return !1;
            return !0;
        }, isPlainObject = function(val) {
            var ctor, proto;
            return isObject(val) && (proto = Object.getPrototypeOf(val)) && (ctor = proto.constructor) && "function" == typeof ctor && ctor instanceof ctor && Function.prototype.toString.call(ctor) === Function.prototype.toString.call(Object);
        }, module.exports.assign = assign, module.exports.isFunction = isFunction, module.exports.isObject = isObject, 
        module.exports.isArray = isArray, module.exports.isEmpty = isEmpty, module.exports.isPlainObject = isPlainObject;
    }).call(this);
}
