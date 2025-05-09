function(module, exports, __webpack_require__) {
    "use strict";
    function _typeof(obj) {
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
            return typeof obj;
        } : function(obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        }, _typeof(obj);
    }
    exports.log = function() {
        var _console;
        return "object" === ("undefined" == typeof console ? "undefined" : _typeof(console)) && console.log && (_console = console).log.apply(_console, arguments);
    }, exports.formatArgs = function(args) {
        if (args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff), 
        this.useColors) {
            var c = "color: " + this.color;
            args.splice(1, 0, c, "color: inherit");
            var index = 0, lastC = 0;
            args[0].replace(/%[a-zA-Z%]/g, (function(match) {
                "%%" !== match && (index++, "%c" === match && (lastC = index));
            })), args.splice(lastC, 0, c);
        }
    }, exports.save = function(namespaces) {
        try {
            namespaces ? exports.storage.setItem("debug", namespaces) : exports.storage.removeItem("debug");
        } catch (error) {}
    }, exports.load = function() {
        var r;
        try {
            r = exports.storage.getItem("debug");
        } catch (error) {}
        return !r && "undefined" != typeof process && "env" in process && (r = process.env.DEBUG), 
        r;
    }, exports.useColors = function() {
        return !("undefined" == typeof window || !window.process || "renderer" !== window.process.type && !window.process.__nwjs) || ("undefined" == typeof navigator || !navigator.userAgent || !navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) && ("undefined" != typeof document && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || "undefined" != typeof window && window.console && (window.console.firebug || window.console.exception && window.console.table) || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
    }, exports.storage = (function() {
        try {
            return localStorage;
        } catch (error) {}
    })(), exports.colors = [ "#0000CC", "#0000FF", "#0033CC", "#0033FF", "#0066CC", "#0066FF", "#0099CC", "#0099FF", "#00CC00", "#00CC33", "#00CC66", "#00CC99", "#00CCCC", "#00CCFF", "#3300CC", "#3300FF", "#3333CC", "#3333FF", "#3366CC", "#3366FF", "#3399CC", "#3399FF", "#33CC00", "#33CC33", "#33CC66", "#33CC99", "#33CCCC", "#33CCFF", "#6600CC", "#6600FF", "#6633CC", "#6633FF", "#66CC00", "#66CC33", "#9900CC", "#9900FF", "#9933CC", "#9933FF", "#99CC00", "#99CC33", "#CC0000", "#CC0033", "#CC0066", "#CC0099", "#CC00CC", "#CC00FF", "#CC3300", "#CC3333", "#CC3366", "#CC3399", "#CC33CC", "#CC33FF", "#CC6600", "#CC6633", "#CC9900", "#CC9933", "#CCCC00", "#CCCC33", "#FF0000", "#FF0033", "#FF0066", "#FF0099", "#FF00CC", "#FF00FF", "#FF3300", "#FF3333", "#FF3366", "#FF3399", "#FF33CC", "#FF33FF", "#FF6600", "#FF6633", "#FF9900", "#FF9933", "#FFCC00", "#FFCC33" ], 
    module.exports = __webpack_require__(398)(exports), module.exports.formatters.j = function(v) {
        try {
            return JSON.stringify(v);
        } catch (error) {
            return "[UnexpectedJSONParseError]: " + error.message;
        }
    };
}
