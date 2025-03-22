function(module, exports) {
    module.exports = function(emitter, name) {
        var next = null;
        return emitter.on(name, (function(data) {
            if (next) {
                var fn = next;
                next = null, fn(data);
            }
        })), function(once) {
            next = once;
        };
    };
}
