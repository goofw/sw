function(module, exports) {
    function serializer(replacer, cycleReplacer) {
        var stack = [], keys = [];
        return null == cycleReplacer && (cycleReplacer = function(key, value) {
            return stack[0] === value ? "[Circular ~]" : "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]";
        }), function(key, value) {
            if (stack.length > 0) {
                var thisPos = stack.indexOf(this);
                ~thisPos ? stack.splice(thisPos + 1) : stack.push(this), ~thisPos ? keys.splice(thisPos, 1 / 0, key) : keys.push(key), 
                ~stack.indexOf(value) && (value = cycleReplacer.call(this, key, value));
            } else stack.push(value);
            return null == replacer ? value : replacer.call(this, key, value);
        };
    }
    (module.exports = function(obj, replacer, spaces, cycleReplacer) {
        return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces);
    }).getSerialize = serializer;
}
