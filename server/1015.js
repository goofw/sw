function(module, exports) {
    var toString = Object.prototype.toString;
    exports.build = function stringify(obj, prefix) {
        if (prefix && null == obj) return prefix + "=";
        if ("[object Array]" == toString.call(obj)) return (function(arr, prefix) {
            for (var ret = [], i = 0, len = arr.length; i < len; i++) prefix ? ret.push(stringify(arr[i], prefix + "[" + i + "]")) : ret.push(stringify(arr[i]));
            return ret.join("&");
        })(obj, prefix);
        if ("[object Object]" == toString.call(obj)) return (function(obj, prefix) {
            var ret = [];
            return Object.keys(obj).forEach((function(key) {
                ret.push(stringify(obj[key], prefix ? prefix + "[" + encodeURIComponent(key) + "]" : encodeURIComponent(key)));
            })), ret.join("&");
        })(obj, prefix);
        if ("[object Date]" == toString.call(obj)) return obj.toISOString();
        if (prefix) return prefix + "=" + encodeURIComponent(String(obj));
        if (-1 !== String(obj).indexOf("=")) return String(obj);
        throw new TypeError("Cannot build a querystring out of: " + obj);
    };
}
