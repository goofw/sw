function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(filename, options) {
        var opts = options || {}, type = opts.type || "attachment", params = (function(filename, fallback) {
            if (void 0 !== filename) {
                var params = {};
                if ("string" != typeof filename) throw new TypeError("filename must be a string");
                if (void 0 === fallback && (fallback = !0), "string" != typeof fallback && "boolean" != typeof fallback) throw new TypeError("fallback must be a string or boolean");
                if ("string" == typeof fallback && NON_LATIN1_REGEXP.test(fallback)) throw new TypeError("fallback must be ISO-8859-1 string");
                var name = basename(filename), isQuotedString = TEXT_REGEXP.test(name), fallbackName = "string" != typeof fallback ? fallback && getlatin1(name) : basename(fallback), hasFallback = "string" == typeof fallbackName && fallbackName !== name;
                return (hasFallback || !isQuotedString || HEX_ESCAPE_REGEXP.test(name)) && (params["filename*"] = name), 
                (isQuotedString || hasFallback) && (params.filename = hasFallback ? fallbackName : name), 
                params;
            }
        })(filename, opts.fallback);
        return (function(obj) {
            var parameters = obj.parameters, type = obj.type;
            if (!type || "string" != typeof type || !TOKEN_REGEXP.test(type)) throw new TypeError("invalid type");
            var string = String(type).toLowerCase();
            if (parameters && "object" == typeof parameters) for (var param, params = Object.keys(parameters).sort(), i = 0; i < params.length; i++) {
                var val = "*" === (param = params[i]).substr(-1) ? ustring(parameters[param]) : qstring(parameters[param]);
                string += "; " + param + "=" + val;
            }
            return string;
        })(new ContentDisposition(type, params));
    }, module.exports.parse = function(string) {
        if (!string || "string" != typeof string) throw new TypeError("argument string is required");
        var match = DISPOSITION_TYPE_REGEXP.exec(string);
        if (!match) throw new TypeError("invalid type format");
        var key, value, index = match[0].length, type = match[1].toLowerCase(), names = [], params = {};
        for (index = PARAM_REGEXP.lastIndex = ";" === match[0].substr(-1) ? index - 1 : index; match = PARAM_REGEXP.exec(string); ) {
            if (match.index !== index) throw new TypeError("invalid parameter format");
            if (index += match[0].length, key = match[1].toLowerCase(), value = match[2], -1 !== names.indexOf(key)) throw new TypeError("invalid duplicate parameter");
            names.push(key), key.indexOf("*") + 1 !== key.length ? "string" != typeof params[key] && ('"' === value[0] && (value = value.substr(1, value.length - 2).replace(QESC_REGEXP, "$1")), 
            params[key] = value) : (key = key.slice(0, -1), value = decodefield(value), params[key] = value);
        }
        if (-1 !== index && index !== string.length) throw new TypeError("invalid parameter format");
        return new ContentDisposition(type, params);
    };
    var basename = __webpack_require__(4).basename, Buffer = __webpack_require__(23).Buffer, ENCODE_URL_ATTR_CHAR_REGEXP = /[\x00-\x20"'()*,/:;<=>?@[\\\]{}\x7f]/g, HEX_ESCAPE_REGEXP = /%[0-9A-Fa-f]{2}/, HEX_ESCAPE_REPLACE_REGEXP = /%([0-9A-Fa-f]{2})/g, NON_LATIN1_REGEXP = /[^\x20-\x7e\xa0-\xff]/g, QESC_REGEXP = /\\([\u0000-\u007f])/g, QUOTE_REGEXP = /([\\"])/g, PARAM_REGEXP = /;[\x09\x20]*([!#$%&'*+.0-9A-Z^_`a-z|~-]+)[\x09\x20]*=[\x09\x20]*("(?:[\x20!\x23-\x5b\x5d-\x7e\x80-\xff]|\\[\x20-\x7e])*"|[!#$%&'*+.0-9A-Z^_`a-z|~-]+)[\x09\x20]*/g, TEXT_REGEXP = /^[\x20-\x7e\x80-\xff]+$/, TOKEN_REGEXP = /^[!#$%&'*+.0-9A-Z^_`a-z|~-]+$/, EXT_VALUE_REGEXP = /^([A-Za-z0-9!#$%&+\-^_`{}~]+)'(?:[A-Za-z]{2,3}(?:-[A-Za-z]{3}){0,3}|[A-Za-z]{4,8}|)'((?:%[0-9A-Fa-f]{2}|[A-Za-z0-9!#$&+.^_`|~-])+)$/, DISPOSITION_TYPE_REGEXP = /^([!#$%&'*+.0-9A-Z^_`a-z|~-]+)[\x09\x20]*(?:$|;)/;
    function decodefield(str) {
        var match = EXT_VALUE_REGEXP.exec(str);
        if (!match) throw new TypeError("invalid extended field value");
        var value, charset = match[1].toLowerCase(), binary = match[2].replace(HEX_ESCAPE_REPLACE_REGEXP, pdecode);
        switch (charset) {
          case "iso-8859-1":
            value = getlatin1(binary);
            break;

          case "utf-8":
            value = Buffer.from(binary, "binary").toString("utf8");
            break;

          default:
            throw new TypeError("unsupported charset in extended field");
        }
        return value;
    }
    function getlatin1(val) {
        return String(val).replace(NON_LATIN1_REGEXP, "?");
    }
    function pdecode(str, hex) {
        return String.fromCharCode(parseInt(hex, 16));
    }
    function pencode(char) {
        return "%" + String(char).charCodeAt(0).toString(16).toUpperCase();
    }
    function qstring(val) {
        return '"' + String(val).replace(QUOTE_REGEXP, "\\$1") + '"';
    }
    function ustring(val) {
        var str = String(val);
        return "UTF-8''" + encodeURIComponent(str).replace(ENCODE_URL_ATTR_CHAR_REGEXP, pencode);
    }
    function ContentDisposition(type, parameters) {
        this.type = type, this.parameters = parameters;
    }
}
