function(module, exports, __webpack_require__) {
    var prevTime;
    function createDebug(namespace) {
        function debug() {
            if (debug.enabled) {
                var self = debug, curr = +new Date, ms = curr - (prevTime || curr);
                self.diff = ms, self.prev = prevTime, self.curr = curr, prevTime = curr;
                for (var args = new Array(arguments.length), i = 0; i < args.length; i++) args[i] = arguments[i];
                args[0] = exports.coerce(args[0]), "string" != typeof args[0] && args.unshift("%O");
                var index = 0;
                args[0] = args[0].replace(/%([a-zA-Z%])/g, (function(match, format) {
                    if ("%%" === match) return match;
                    index++;
                    var formatter = exports.formatters[format];
                    if ("function" == typeof formatter) {
                        var val = args[index];
                        match = formatter.call(self, val), args.splice(index, 1), index--;
                    }
                    return match;
                })), exports.formatArgs.call(self, args);
                var logFn = debug.log || exports.log || console.log.bind(console);
                logFn.apply(self, args);
            }
        }
        return debug.namespace = namespace, debug.enabled = exports.enabled(namespace), 
        debug.useColors = exports.useColors(), debug.color = (function(namespace) {
            var i, hash = 0;
            for (i in namespace) hash = (hash << 5) - hash + namespace.charCodeAt(i), hash |= 0;
            return exports.colors[Math.abs(hash) % exports.colors.length];
        })(namespace), "function" == typeof exports.init && exports.init(debug), debug;
    }
    (exports = module.exports = createDebug.debug = createDebug.default = createDebug).coerce = function(val) {
        return val instanceof Error ? val.stack || val.message : val;
    }, exports.disable = function() {
        exports.enable("");
    }, exports.enable = function(namespaces) {
        exports.save(namespaces), exports.names = [], exports.skips = [];
        for (var split = ("string" == typeof namespaces ? namespaces : "").split(/[\s,]+/), len = split.length, i = 0; i < len; i++) split[i] && ("-" === (namespaces = split[i].replace(/\*/g, ".*?"))[0] ? exports.skips.push(new RegExp("^" + namespaces.substr(1) + "$")) : exports.names.push(new RegExp("^" + namespaces + "$")));
    }, exports.enabled = function(name) {
        var i, len;
        for (i = 0, len = exports.skips.length; i < len; i++) if (exports.skips[i].test(name)) return !1;
        for (i = 0, len = exports.names.length; i < len; i++) if (exports.names[i].test(name)) return !0;
        return !1;
    }, exports.humanize = __webpack_require__(542), exports.names = [], exports.skips = [], 
    exports.formatters = {};
}
