function(module, exports, __webpack_require__) {
    "use strict";
    var isArray = Array.isArray, keyList = Object.keys, hasProp = Object.prototype.hasOwnProperty;
    module.exports = function equal(a, b) {
        if (a === b) return !0;
        if (a && b && "object" == typeof a && "object" == typeof b) {
            var i, length, key, arrA = isArray(a), arrB = isArray(b);
            if (arrA && arrB) {
                if ((length = a.length) != b.length) return !1;
                for (i = length; 0 != i--; ) if (!equal(a[i], b[i])) return !1;
                return !0;
            }
            if (arrA != arrB) return !1;
            var dateA = a instanceof Date, dateB = b instanceof Date;
            if (dateA != dateB) return !1;
            if (dateA && dateB) return a.getTime() == b.getTime();
            var regexpA = a instanceof RegExp, regexpB = b instanceof RegExp;
            if (regexpA != regexpB) return !1;
            if (regexpA && regexpB) return a.toString() == b.toString();
            var keys = keyList(a);
            if ((length = keys.length) !== keyList(b).length) return !1;
            for (i = length; 0 != i--; ) if (!hasProp.call(b, keys[i])) return !1;
            for (i = length; 0 != i--; ) if (!equal(a[key = keys[i]], b[key])) return !1;
            return !0;
        }
        return a != a && b != b;
    };
}
