function(module, exports) {
    module.exports = function(dst, src) {
        return Object.keys(src).forEach((function(prop) {
            dst[prop] = dst[prop] || src[prop];
        })), dst;
    };
}
