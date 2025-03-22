function(module, exports) {
    function objectToString(o) {
        return Object.prototype.toString.call(o);
    }
    exports.isArray = function(arg) {
        return Array.isArray ? Array.isArray(arg) : "[object Array]" === objectToString(arg);
    }, exports.isBoolean = function(arg) {
        return "boolean" == typeof arg;
    }, exports.isNull = function(arg) {
        return null === arg;
    }, exports.isNullOrUndefined = function(arg) {
        return null == arg;
    }, exports.isNumber = function(arg) {
        return "number" == typeof arg;
    }, exports.isString = function(arg) {
        return "string" == typeof arg;
    }, exports.isSymbol = function(arg) {
        return "symbol" == typeof arg;
    }, exports.isUndefined = function(arg) {
        return void 0 === arg;
    }, exports.isRegExp = function(re) {
        return "[object RegExp]" === objectToString(re);
    }, exports.isObject = function(arg) {
        return "object" == typeof arg && null !== arg;
    }, exports.isDate = function(d) {
        return "[object Date]" === objectToString(d);
    }, exports.isError = function(e) {
        return "[object Error]" === objectToString(e) || e instanceof Error;
    }, exports.isFunction = function(arg) {
        return "function" == typeof arg;
    }, exports.isPrimitive = function(arg) {
        return null === arg || "boolean" == typeof arg || "number" == typeof arg || "string" == typeof arg || "symbol" == typeof arg || void 0 === arg;
    }, exports.isBuffer = Buffer.isBuffer;
}
