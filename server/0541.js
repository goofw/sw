function(module, exports, __webpack_require__) {
    function load() {
        var r;
        try {
            r = exports.storage.debug;
        } catch (e) {}
        return !r && "undefined" != typeof process && "env" in process && (r = process.env.DEBUG), 
        r;
    }
    (exports = module.exports = __webpack_require__(246)).log = function() {
        return "object" == typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments);
    }, exports.formatArgs = function(args) {
        var useColors = this.useColors;
        if (args[0] = (useColors ? "%c" : "") + this.namespace + (useColors ? " %c" : " ") + args[0] + (useColors ? "%c " : " ") + "+" + exports.humanize(this.diff), 
        useColors) {
            var c = "color: " + this.color;
            args.splice(1, 0, c, "color: inherit");
            var index = 0, lastC = 0;
            args[0].replace(/%[a-zA-Z%]/g, (function(match) {
                "%%" !== match && (index++, "%c" === match && (lastC = index));
            })), args.splice(lastC, 0, c);
        }
    }, exports.save = function(namespaces) {
        try {
            null == namespaces ? exports.storage.removeItem("debug") : exports.storage.debug = namespaces;
        } catch (e) {}
    }, exports.load = load, exports.useColors = function() {
        return !("undefined" == typeof window || !window.process || "renderer" !== window.process.type) || ("undefined" != typeof document && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || "undefined" != typeof window && window.console && (window.console.firebug || window.console.exception && window.console.table) || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
    }, exports.storage = "undefined" != typeof chrome && void 0 !== chrome.storage ? chrome.storage.local : (function() {
        try {
            return window.localStorage;
        } catch (e) {}
    })(), exports.colors = [ "lightseagreen", "forestgreen", "goldenrod", "dodgerblue", "darkorchid", "crimson" ], 
    exports.formatters.j = function(v) {
        try {
            return JSON.stringify(v);
        } catch (err) {
            return "[UnexpectedJSONParseError]: " + err.message;
        }
    }, exports.enable(load());
}
