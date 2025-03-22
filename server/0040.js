function(module, exports, __webpack_require__) {
    var tty = __webpack_require__(105);
    module.exports = function(name) {
        function disabled() {}
        disabled.enabled = !1;
        var match = skips.some((function(re) {
            return re.test(name);
        }));
        if (match) return disabled;
        if (!(match = names.some((function(re) {
            return re.test(name);
        })))) return disabled;
        var c = colors[prevColor++ % colors.length];
        function colored(fmt) {
            fmt = coerce(fmt);
            var curr = new Date, ms = curr - (prev[name] || curr);
            prev[name] = curr, fmt = "  [9" + c + "m" + name + " [3" + c + "m[90m" + fmt + "[3" + c + "m +" + humanize(ms) + "[0m", 
            console.error.apply(this, arguments);
        }
        function plain(fmt) {
            fmt = coerce(fmt), fmt = (new Date).toUTCString() + " " + name + " " + fmt, console.error.apply(this, arguments);
        }
        return colored.enabled = plain.enabled = !0, isatty || process.env.DEBUG_COLORS ? colored : plain;
    };
    var names = [], skips = [];
    (process.env.DEBUG || "").split(/[\s,]+/).forEach((function(name) {
        "-" === (name = name.replace("*", ".*?"))[0] ? skips.push(new RegExp("^" + name.substr(1) + "$")) : names.push(new RegExp("^" + name + "$"));
    }));
    var colors = [ 6, 2, 3, 4, 5, 1 ], prev = {}, prevColor = 0, isatty = tty.isatty(2);
    function humanize(ms) {
        return ms >= 36e5 ? (ms / 36e5).toFixed(1) + "h" : ms >= 6e4 ? (ms / 6e4).toFixed(1) + "m" : ms >= 1e3 ? (ms / 1e3 | 0) + "s" : ms + "ms";
    }
    function coerce(val) {
        return val instanceof Error ? val.stack || val.message : val;
    }
}
