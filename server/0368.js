function(module, exports) {
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
    function isPositiveInteger(x) {
        return "[object Number]" === Object.prototype.toString.call(x) && x % 1 == 0 && x > 0;
    }
    module.exports = isPositiveInteger, module.exports.isSafePositiveInteger = function(x) {
        return isPositiveInteger(x) && x <= MAX_SAFE_INTEGER;
    };
}
