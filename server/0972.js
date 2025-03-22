function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(dest, src, redefine) {
        if (!dest) throw new TypeError("argument dest is required");
        if (!src) throw new TypeError("argument src is required");
        return void 0 === redefine && (redefine = !0), Object.getOwnPropertyNames(src).forEach((function(name) {
            if (redefine || !hasOwnProperty.call(dest, name)) {
                var descriptor = Object.getOwnPropertyDescriptor(src, name);
                Object.defineProperty(dest, name, descriptor);
            }
        })), dest;
    };
    var hasOwnProperty = Object.prototype.hasOwnProperty;
}
