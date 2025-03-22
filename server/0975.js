function(module, exports, __webpack_require__) {
    "use strict";
    var setPrototypeOf = __webpack_require__(108);
    exports.init = function(app) {
        return function(req, res, next) {
            app.enabled("x-powered-by") && res.setHeader("X-Powered-By", "Express"), req.res = res, 
            res.req = req, req.next = next, setPrototypeOf(req, app.request), setPrototypeOf(res, app.response), 
            res.locals = res.locals || Object.create(null), next();
        };
    };
}
