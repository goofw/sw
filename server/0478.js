function(module, exports, __webpack_require__) {
    "use strict";
    exports.pathMatch = function(reqPath, cookiePath) {
        if (cookiePath === reqPath) return !0;
        if (0 === reqPath.indexOf(cookiePath)) {
            if ("/" === cookiePath.substr(-1)) return !0;
            if ("/" === reqPath.substr(cookiePath.length, 1)) return !0;
        }
        return !1;
    };
}
