function(module, exports) {
    module.exports = function(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            for (var key in source) hasOwnProperty.call(source, key) && (target[key] = source[key]);
        }
        return target;
    };
    var hasOwnProperty = Object.prototype.hasOwnProperty;
}
