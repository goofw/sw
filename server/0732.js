function(module, exports) {
    module.exports = function(source, encoding) {
        return source.toString(encoding);
    };
}
