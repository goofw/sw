function(module, exports, __webpack_require__) {
    "use strict";
    var getOwnPropertySymbols = Object.getOwnPropertySymbols, hasOwnProperty = Object.prototype.hasOwnProperty, propIsEnumerable = Object.prototype.propertyIsEnumerable;
    function toObject(val) {
        if (null == val) throw new TypeError("Object.assign cannot be called with null or undefined");
        return Object(val);
    }
    module.exports = (function() {
        try {
            if (!Object.assign) return !1;
            var test1 = new String("abc");
            if (test1[5] = "de", "5" === Object.getOwnPropertyNames(test1)[0]) return !1;
            for (var test2 = {}, i = 0; i < 10; i++) test2["_" + String.fromCharCode(i)] = i;
            if ("0123456789" !== Object.getOwnPropertyNames(test2).map((function(n) {
                return test2[n];
            })).join("")) return !1;
            var test3 = {};
            return "abcdefghijklmnopqrst".split("").forEach((function(letter) {
                test3[letter] = letter;
            })), "abcdefghijklmnopqrst" === Object.keys(Object.assign({}, test3)).join("");
        } catch (err) {
            return !1;
        }
    })() ? Object.assign : function(target, source) {
        for (var from, symbols, to = toObject(target), s = 1; s < arguments.length; s++) {
            for (var key in from = Object(arguments[s])) hasOwnProperty.call(from, key) && (to[key] = from[key]);
            if (getOwnPropertySymbols) {
                symbols = getOwnPropertySymbols(from);
                for (var i = 0; i < symbols.length; i++) propIsEnumerable.call(from, symbols[i]) && (to[symbols[i]] = from[symbols[i]]);
            }
        }
        return to;
    };
}
