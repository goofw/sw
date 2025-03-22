function(module, exports) {
    var isES5 = (function() {
        "use strict";
        return void 0 === this;
    })();
    if (isES5) module.exports = {
        freeze: Object.freeze,
        defineProperty: Object.defineProperty,
        getDescriptor: Object.getOwnPropertyDescriptor,
        keys: Object.keys,
        names: Object.getOwnPropertyNames,
        getPrototypeOf: Object.getPrototypeOf,
        isArray: Array.isArray,
        isES5: isES5,
        propertyIsWritable: function(obj, prop) {
            var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
            return !(descriptor && !descriptor.writable && !descriptor.set);
        }
    }; else {
        var has = {}.hasOwnProperty, str = {}.toString, proto = {}.constructor.prototype, ObjectKeys = function(o) {
            var ret = [];
            for (var key in o) has.call(o, key) && ret.push(key);
            return ret;
        };
        module.exports = {
            isArray: function(obj) {
                try {
                    return "[object Array]" === str.call(obj);
                } catch (e) {
                    return !1;
                }
            },
            keys: ObjectKeys,
            names: ObjectKeys,
            defineProperty: function(o, key, desc) {
                return o[key] = desc.value, o;
            },
            getDescriptor: function(o, key) {
                return {
                    value: o[key]
                };
            },
            freeze: function(obj) {
                return obj;
            },
            getPrototypeOf: function(obj) {
                try {
                    return Object(obj).constructor.prototype;
                } catch (e) {
                    return proto;
                }
            },
            isES5: isES5,
            propertyIsWritable: function() {
                return !0;
            }
        };
    }
}
