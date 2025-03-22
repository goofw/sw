function(module, exports) {
    var toString = {}.toString;
    module.exports = Array.isArray || function(arr) {
        return "[object Array]" == toString.call(arr);
    };
}
