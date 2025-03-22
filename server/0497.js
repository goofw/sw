function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(data, opts) {
        opts || (opts = {}), "function" == typeof opts && (opts = {
            cmp: opts
        });
        var f, cycles = "boolean" == typeof opts.cycles && opts.cycles, cmp = opts.cmp && (f = opts.cmp, 
        function(node) {
            return function(a, b) {
                var aobj = {
                    key: a,
                    value: node[a]
                }, bobj = {
                    key: b,
                    value: node[b]
                };
                return f(aobj, bobj);
            };
        }), seen = [];
        return (function stringify(node) {
            if (node && node.toJSON && "function" == typeof node.toJSON && (node = node.toJSON()), 
            void 0 !== node) {
                if ("number" == typeof node) return isFinite(node) ? "" + node : "null";
                if ("object" != typeof node) return JSON.stringify(node);
                var i, out;
                if (Array.isArray(node)) {
                    for (out = "[", i = 0; i < node.length; i++) i && (out += ","), out += stringify(node[i]) || "null";
                    return out + "]";
                }
                if (null === node) return "null";
                if (-1 !== seen.indexOf(node)) {
                    if (cycles) return JSON.stringify("__cycle__");
                    throw new TypeError("Converting circular structure to JSON");
                }
                var seenIndex = seen.push(node) - 1, keys = Object.keys(node).sort(cmp && cmp(node));
                for (out = "", i = 0; i < keys.length; i++) {
                    var key = keys[i], value = stringify(node[key]);
                    value && (out && (out += ","), out += JSON.stringify(key) + ":" + value);
                }
                return seen.splice(seenIndex, 1), "{" + out + "}";
            }
        })(data);
    };
}
