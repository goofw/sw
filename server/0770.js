function(module, exports) {
    module.exports = Array.isArray || function(arr) {
        return "[object Array]" == Object.prototype.toString.call(arr);
    };
}
