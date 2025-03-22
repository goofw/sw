function(module, exports, __webpack_require__) {
    var util = __webpack_require__(0);
    exports.parse = function(value) {
        var extensions = {};
        return (value = value || "").split(",").forEach((function(v) {
            var params = v.split(";"), token = params.shift().trim();
            if (void 0 === extensions[token]) extensions[token] = []; else if (!extensions.hasOwnProperty(token)) return;
            var parsedParams = {};
            params.forEach((function(param) {
                var parts = param.trim().split("="), key = parts[0], value = parts[1];
                void 0 === value ? value = !0 : ('"' === value[0] && (value = value.slice(1)), '"' === value[value.length - 1] && (value = value.slice(0, value.length - 1))), 
                void 0 === parsedParams[key] ? parsedParams[key] = [ value ] : parsedParams.hasOwnProperty(key) && parsedParams[key].push(value);
            })), extensions[token].push(parsedParams);
        })), extensions;
    }, exports.format = function(value) {
        return Object.keys(value).map((function(token) {
            var paramsList = value[token];
            return util.isArray(paramsList) || (paramsList = [ paramsList ]), paramsList.map((function(params) {
                return [ token ].concat(Object.keys(params).map((function(k) {
                    var p = params[k];
                    return util.isArray(p) || (p = [ p ]), p.map((function(v) {
                        return !0 === v ? k : k + "=" + v;
                    })).join("; ");
                }))).join("; ");
            })).join(", ");
        })).join(", ");
    };
}
