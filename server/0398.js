function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(env) {
        function selectColor(namespace) {
            for (var hash = 0, i = 0; i < namespace.length; i++) hash = (hash << 5) - hash + namespace.charCodeAt(i), 
            hash |= 0;
            return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
        }
        function createDebug(namespace) {
            var prevTime;
            function debug() {
                if (debug.enabled) {
                    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
                    var self = debug, curr = Number(new Date), ms = curr - (prevTime || curr);
                    self.diff = ms, self.prev = prevTime, self.curr = curr, prevTime = curr, args[0] = createDebug.coerce(args[0]), 
                    "string" != typeof args[0] && args.unshift("%O");
                    var index = 0;
                    args[0] = args[0].replace(/%([a-zA-Z%])/g, (function(match, format) {
                        if ("%%" === match) return match;
                        index++;
                        var formatter = createDebug.formatters[format];
                        if ("function" == typeof formatter) {
                            var val = args[index];
                            match = formatter.call(self, val), args.splice(index, 1), index--;
                        }
                        return match;
                    })), createDebug.formatArgs.call(self, args);
                    var logFn = self.log || createDebug.log;
                    logFn.apply(self, args);
                }
            }
            return debug.namespace = namespace, debug.enabled = createDebug.enabled(namespace), 
            debug.useColors = createDebug.useColors(), debug.color = selectColor(namespace), 
            debug.destroy = destroy, debug.extend = extend, "function" == typeof createDebug.init && createDebug.init(debug), 
            createDebug.instances.push(debug), debug;
        }
        function destroy() {
            var index = createDebug.instances.indexOf(this);
            return -1 !== index && (createDebug.instances.splice(index, 1), !0);
        }
        function extend(namespace, delimiter) {
            return createDebug(this.namespace + (void 0 === delimiter ? ":" : delimiter) + namespace);
        }
        return createDebug.debug = createDebug, createDebug.default = createDebug, createDebug.coerce = function(val) {
            return val instanceof Error ? val.stack || val.message : val;
        }, createDebug.disable = function() {
            createDebug.enable("");
        }, createDebug.enable = function(namespaces) {
            var i;
            createDebug.save(namespaces), createDebug.names = [], createDebug.skips = [];
            var split = ("string" == typeof namespaces ? namespaces : "").split(/[\s,]+/), len = split.length;
            for (i = 0; i < len; i++) split[i] && ("-" === (namespaces = split[i].replace(/\*/g, ".*?"))[0] ? createDebug.skips.push(new RegExp("^" + namespaces.substr(1) + "$")) : createDebug.names.push(new RegExp("^" + namespaces + "$")));
            for (i = 0; i < createDebug.instances.length; i++) {
                var instance = createDebug.instances[i];
                instance.enabled = createDebug.enabled(instance.namespace);
            }
        }, createDebug.enabled = function(name) {
            if ("*" === name[name.length - 1]) return !0;
            var i, len;
            for (i = 0, len = createDebug.skips.length; i < len; i++) if (createDebug.skips[i].test(name)) return !1;
            for (i = 0, len = createDebug.names.length; i < len; i++) if (createDebug.names[i].test(name)) return !0;
            return !1;
        }, createDebug.humanize = __webpack_require__(255), Object.keys(env).forEach((function(key) {
            createDebug[key] = env[key];
        })), createDebug.instances = [], createDebug.names = [], createDebug.skips = [], 
        createDebug.formatters = {}, createDebug.selectColor = selectColor, createDebug.enable(createDebug.load()), 
        createDebug;
    };
}
