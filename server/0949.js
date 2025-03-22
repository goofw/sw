function(module, exports) {
    module.exports = function(store) {
        function getset(name, value) {
            var node = vars.store, keys = name.split(".");
            keys.slice(0, -1).forEach((function(k) {
                void 0 === node[k] && (node[k] = {}), node = node[k];
            }));
            var key = keys[keys.length - 1];
            return 1 == arguments.length ? node[key] : node[key] = value;
        }
        var vars = {
            get: function(name) {
                return getset(name);
            },
            set: function(name, value) {
                return getset(name, value);
            },
            store: store || {}
        };
        return vars;
    };
}
