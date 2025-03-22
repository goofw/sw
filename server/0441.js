function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(NEXT_FILTER) {
        var util = __webpack_require__(16), getKeys = __webpack_require__(66).keys, tryCatch = util.tryCatch, errorObj = util.errorObj;
        return function(instances, cb, promise) {
            return function(e) {
                var boundTo = promise._boundValue();
                predicateLoop: for (var i = 0; i < instances.length; ++i) {
                    var item = instances[i];
                    if (item === Error || null != item && item.prototype instanceof Error) {
                        if (e instanceof item) return tryCatch(cb).call(boundTo, e);
                    } else if ("function" == typeof item) {
                        var matchesPredicate = tryCatch(item).call(boundTo, e);
                        if (matchesPredicate === errorObj) return matchesPredicate;
                        if (matchesPredicate) return tryCatch(cb).call(boundTo, e);
                    } else if (util.isObject(e)) {
                        for (var keys = getKeys(item), j = 0; j < keys.length; ++j) {
                            var key = keys[j];
                            if (item[key] != e[key]) continue predicateLoop;
                        }
                        return tryCatch(cb).call(boundTo, e);
                    }
                }
                return NEXT_FILTER;
            };
        };
    };
}
