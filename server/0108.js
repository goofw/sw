function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = Object.setPrototypeOf || ({
        __proto__: []
    } instanceof Array ? function(obj, proto) {
        return obj.__proto__ = proto, obj;
    } : function(obj, proto) {
        for (var prop in proto) obj.hasOwnProperty(prop) || (obj[prop] = proto[prop]);
        return obj;
    });
}
