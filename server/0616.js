function(module, exports) {
    module.exports = function(list) {
        var offset = 0;
        return function() {
            if (offset === list.length) return null;
            var len = list.length - offset, i = Math.random() * len | 0, el = list[offset + i], tmp = list[offset];
            return list[offset] = el, list[offset + i] = tmp, offset++, el;
        };
    };
}
