function(module, exports) {
    module.exports = function(source, from, to) {
        return 2 === arguments.length ? source.slice(from) : source.slice(from, to);
    };
}
