function(module, exports, __webpack_require__) {
    "use strict";
    var tty = __webpack_require__(105), util = __webpack_require__(0);
    exports.init = function(debug) {
        debug.inspectOpts = {};
        for (var keys = Object.keys(exports.inspectOpts), i = 0; i < keys.length; i++) debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
    }, exports.log = function() {
        return process.stderr.write(util.format.apply(util, arguments) + "\n");
    }, exports.formatArgs = function(args) {
        var name = this.namespace;
        if (this.useColors) {
            var c = this.color, colorCode = "[3" + (c < 8 ? c : "8;5;" + c), prefix = "  ".concat(colorCode, ";1m").concat(name, " [0m");
            args[0] = prefix + args[0].split("\n").join("\n" + prefix), args.push(colorCode + "m+" + module.exports.humanize(this.diff) + "[0m");
        } else args[0] = (exports.inspectOpts.hideDate ? "" : (new Date).toISOString() + " ") + name + " " + args[0];
    }, exports.save = function(namespaces) {
        namespaces ? process.env.DEBUG = namespaces : delete process.env.DEBUG;
    }, exports.load = function() {
        return process.env.DEBUG;
    }, exports.useColors = function() {
        return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
    }, exports.colors = [ 6, 2, 3, 4, 5, 1 ];
    try {
        var supportsColor = __webpack_require__(256);
        supportsColor && (supportsColor.stderr || supportsColor).level >= 2 && (exports.colors = [ 20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62, 63, 68, 69, 74, 75, 76, 77, 78, 79, 80, 81, 92, 93, 98, 99, 112, 113, 128, 129, 134, 135, 148, 149, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 178, 179, 184, 185, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 214, 215, 220, 221 ]);
    } catch (error) {}
    exports.inspectOpts = Object.keys(process.env).filter((function(key) {
        return /^debug_/i.test(key);
    })).reduce((function(obj, key) {
        var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (function(_, k) {
            return k.toUpperCase();
        })), val = process.env[key];
        return val = !!/^(yes|on|true|enabled)$/i.test(val) || !/^(no|off|false|disabled)$/i.test(val) && ("null" === val ? null : Number(val)), 
        obj[prop] = val, obj;
    }), {}), module.exports = __webpack_require__(398)(exports);
    var formatters = module.exports.formatters;
    formatters.o = function(v) {
        return this.inspectOpts.colors = this.useColors, util.inspect(v, this.inspectOpts).split("\n").map((function(str) {
            return str.trim();
        })).join(" ");
    }, formatters.O = function(v) {
        return this.inspectOpts.colors = this.useColors, util.inspect(v, this.inspectOpts);
    };
}
