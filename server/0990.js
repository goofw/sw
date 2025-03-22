function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(obj) {
        if (null === obj || "object" != typeof obj) return obj;
        if (obj instanceof Object) var copy = {
            __proto__: obj.__proto__
        }; else copy = Object.create(null);
        return Object.getOwnPropertyNames(obj).forEach((function(key) {
            Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
        })), copy;
    };
}
