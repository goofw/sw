function(module, exports, __webpack_require__) {
    "use strict";
    var PARAM_REGEXP = /; *([!#$%&'*+.^_`|~0-9A-Za-z-]+) *= *("(?:[\u000b\u0020\u0021\u0023-\u005b\u005d-\u007e\u0080-\u00ff]|\\[\u000b\u0020-\u00ff])*"|[!#$%&'*+.^_`|~0-9A-Za-z-]+) */g, TEXT_REGEXP = /^[\u000b\u0020-\u007e\u0080-\u00ff]+$/, TOKEN_REGEXP = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/, QESC_REGEXP = /\\([\u000b\u0020-\u00ff])/g, QUOTE_REGEXP = /([\\"])/g, TYPE_REGEXP = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+\/[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
    function qstring(val) {
        var str = String(val);
        if (TOKEN_REGEXP.test(str)) return str;
        if (str.length > 0 && !TEXT_REGEXP.test(str)) throw new TypeError("invalid parameter value");
        return '"' + str.replace(QUOTE_REGEXP, "\\$1") + '"';
    }
    function ContentType(type) {
        this.parameters = Object.create(null), this.type = type;
    }
    exports.format = function(obj) {
        if (!obj || "object" != typeof obj) throw new TypeError("argument obj is required");
        var parameters = obj.parameters, type = obj.type;
        if (!type || !TYPE_REGEXP.test(type)) throw new TypeError("invalid type");
        var string = type;
        if (parameters && "object" == typeof parameters) for (var param, params = Object.keys(parameters).sort(), i = 0; i < params.length; i++) {
            if (param = params[i], !TOKEN_REGEXP.test(param)) throw new TypeError("invalid parameter name");
            string += "; " + param + "=" + qstring(parameters[param]);
        }
        return string;
    }, exports.parse = function(string) {
        if (!string) throw new TypeError("argument string is required");
        var header = "object" == typeof string ? (function(obj) {
            var header;
            if ("function" == typeof obj.getHeader ? header = obj.getHeader("content-type") : "object" == typeof obj.headers && (header = obj.headers && obj.headers["content-type"]), 
            "string" != typeof header) throw new TypeError("content-type header is missing from object");
            return header;
        })(string) : string;
        if ("string" != typeof header) throw new TypeError("argument string is required to be a string");
        var index = header.indexOf(";"), type = -1 !== index ? header.substr(0, index).trim() : header.trim();
        if (!TYPE_REGEXP.test(type)) throw new TypeError("invalid media type");
        var obj = new ContentType(type.toLowerCase());
        if (-1 !== index) {
            var key, match, value;
            for (PARAM_REGEXP.lastIndex = index; match = PARAM_REGEXP.exec(header); ) {
                if (match.index !== index) throw new TypeError("invalid parameter format");
                index += match[0].length, key = match[1].toLowerCase(), '"' === (value = match[2])[0] && (value = value.substr(1, value.length - 2).replace(QESC_REGEXP, "$1")), 
                obj.parameters[key] = value;
            }
            if (index !== header.length) throw new TypeError("invalid parameter format");
        }
        return obj;
    };
}
