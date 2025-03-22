function(module, exports) {
    module.exports = function(source, target, target_start, source_start, source_end) {
        return source.copy(target, target_start, source_start, source_end);
    };
}
