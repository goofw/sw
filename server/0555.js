function(module, exports) {
    var paramRegExp = /; *([!#$%&'\*\+\-\.0-9A-Z\^_`a-z\|~]+) *= *("(?:[ !\u0023-\u005b\u005d-\u007e\u0080-\u00ff]|\\[\u0020-\u007e])*"|[!#$%&'\*\+\-\.0-9A-Z\^_`a-z\|~]+) */g, textRegExp = /^[\u0020-\u007e\u0080-\u00ff]+$/, tokenRegExp = /^[!#$%&'\*\+\-\.0-9A-Z\^_`a-z\|~]+$/, qescRegExp = /\\([\u0000-\u007f])/g, quoteRegExp = /([\\"])/g, subtypeNameRegExp = /^[A-Za-z0-9][A-Za-z0-9!#$&^_.-]{0,126}$/, typeNameRegExp = /^[A-Za-z0-9][A-Za-z0-9!#$&^_-]{0,126}$/, typeRegExp = /^ *([A-Za-z0-9][A-Za-z0-9!#$&^_-]{0,126})\/([A-Za-z0-9][A-Za-z0-9!#$&^_.+-]{0,126}) *$/;
    function qstring(val) {
        var str = String(val);
        if (tokenRegExp.test(str)) return str;
        if (str.length > 0 && !textRegExp.test(str)) throw new TypeError("invalid parameter value");
        return '"' + str.replace(quoteRegExp, "\\$1") + '"';
    }
    exports.format = function(obj) {
        if (!obj || "object" != typeof obj) throw new TypeError("argument obj is required");
        var parameters = obj.parameters, subtype = obj.subtype, suffix = obj.suffix, type = obj.type;
        if (!type || !typeNameRegExp.test(type)) throw new TypeError("invalid type");
        if (!subtype || !subtypeNameRegExp.test(subtype)) throw new TypeError("invalid subtype");
        var string = type + "/" + subtype;
        if (suffix) {
            if (!typeNameRegExp.test(suffix)) throw new TypeError("invalid suffix");
            string += "+" + suffix;
        }
        if (parameters && "object" == typeof parameters) for (var param, params = Object.keys(parameters).sort(), i = 0; i < params.length; i++) {
            if (param = params[i], !tokenRegExp.test(param)) throw new TypeError("invalid parameter name");
            string += "; " + param + "=" + qstring(parameters[param]);
        }
        return string;
    }, exports.parse = function(string) {
        if (!string) throw new TypeError("argument string is required");
        if ("object" == typeof string && (string = (function(obj) {
            return "function" == typeof obj.getHeader ? obj.getHeader("content-type") : "object" == typeof obj.headers ? obj.headers && obj.headers["content-type"] : void 0;
        })(string)), "string" != typeof string) throw new TypeError("argument string is required to be a string");
        var key, match, value, index = string.indexOf(";"), obj = (function(string) {
            var match = typeRegExp.exec(string.toLowerCase());
            if (!match) throw new TypeError("invalid media type");
            var suffix, type = match[1], subtype = match[2], index = subtype.lastIndexOf("+");
            return -1 !== index && (suffix = subtype.substr(index + 1), subtype = subtype.substr(0, index)), 
            {
                type: type,
                subtype: subtype,
                suffix: suffix
            };
        })(-1 !== index ? string.substr(0, index) : string), params = {};
        for (paramRegExp.lastIndex = index; match = paramRegExp.exec(string); ) {
            if (match.index !== index) throw new TypeError("invalid parameter format");
            index += match[0].length, key = match[1].toLowerCase(), '"' === (value = match[2])[0] && (value = value.substr(1, value.length - 2).replace(qescRegExp, "$1")), 
            params[key] = value;
        }
        if (-1 !== index && index !== string.length) throw new TypeError("invalid parameter format");
        return obj.parameters = params, obj;
    };
}
