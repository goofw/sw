function(module, exports, __webpack_require__) {
    var Buffer = __webpack_require__(10).Buffer;
    module.exports = function(a, b) {
        if (Buffer.isBuffer(a) && Buffer.isBuffer(b)) {
            if ("function" == typeof a.equals) return a.equals(b);
            if (a.length !== b.length) return !1;
            for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return !1;
            return !0;
        }
    };
}
