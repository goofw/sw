function(module, exports) {
    function debug(name) {
        return debug.enabled(name) ? function(fmt) {
            fmt = coerce(fmt);
            var curr = new Date, ms = curr - (debug[name] || curr);
            debug[name] = curr, fmt = name + " " + fmt + " +" + debug.humanize(ms), window.console && console.log && Function.prototype.apply.call(console.log, console, arguments);
        } : function() {};
    }
    function coerce(val) {
        return val instanceof Error ? val.stack || val.message : val;
    }
    module.exports = debug, debug.names = [], debug.skips = [], debug.enable = function(name) {
        try {
            localStorage.debug = name;
        } catch (e) {}
        for (var split = (name || "").split(/[\s,]+/), len = split.length, i = 0; i < len; i++) "-" === (name = split[i].replace("*", ".*?"))[0] ? debug.skips.push(new RegExp("^" + name.substr(1) + "$")) : debug.names.push(new RegExp("^" + name + "$"));
    }, debug.disable = function() {
        debug.enable("");
    }, debug.humanize = function(ms) {
        return ms >= 36e5 ? (ms / 36e5).toFixed(1) + "h" : ms >= 6e4 ? (ms / 6e4).toFixed(1) + "m" : ms >= 1e3 ? (ms / 1e3 | 0) + "s" : ms + "ms";
    }, debug.enabled = function(name) {
        for (var i = 0, len = debug.skips.length; i < len; i++) if (debug.skips[i].test(name)) return !1;
        for (i = 0, len = debug.names.length; i < len; i++) if (debug.names[i].test(name)) return !0;
        return !1;
    };
    try {
        window.localStorage && debug.enable(localStorage.debug);
    } catch (e) {}
}
