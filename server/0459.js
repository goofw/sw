function(module, exports, __webpack_require__) {
    "use strict";
    var merge = __webpack_require__(60), parseUrl = __webpack_require__(46), qs = __webpack_require__(160);
    module.exports = function(options) {
        var opts = merge({}, options), queryparse = qs.parse;
        return "function" == typeof options && (queryparse = options, opts = void 0), void 0 !== opts && void 0 === opts.allowPrototypes && (opts.allowPrototypes = !0), 
        function(req, res, next) {
            if (!req.query) {
                var val = parseUrl(req).query;
                req.query = queryparse(val, opts);
            }
            next();
        };
    };
}
