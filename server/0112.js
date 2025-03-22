function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(a, b) {
        if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) throw new TypeError("Arguments must be Buffers");
        if (a === b) return !0;
        if ("function" == typeof a.equals) return a.equals(b);
        if (a.length !== b.length) return !1;
        for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return !1;
        return !0;
    };
}
