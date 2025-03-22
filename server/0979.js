function(module, exports) {
    var s = 1e3, m = 60 * s, h = 60 * m, d = 24 * h;
    function plural(ms, msAbs, n, name) {
        var isPlural = msAbs >= 1.5 * n;
        return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
    module.exports = function(val, options) {
        options = options || {};
        var ms, msAbs, type = typeof val;
        if ("string" === type && val.length > 0) return (function(str) {
            if (!((str = String(str)).length > 100)) {
                var match = /^((?:\d+)?\-?\d?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
                if (match) {
                    var n = parseFloat(match[1]);
                    switch ((match[2] || "ms").toLowerCase()) {
                      case "years":
                      case "year":
                      case "yrs":
                      case "yr":
                      case "y":
                        return 315576e5 * n;

                      case "weeks":
                      case "week":
                      case "w":
                        return 6048e5 * n;

                      case "days":
                      case "day":
                      case "d":
                        return n * d;

                      case "hours":
                      case "hour":
                      case "hrs":
                      case "hr":
                      case "h":
                        return n * h;

                      case "minutes":
                      case "minute":
                      case "mins":
                      case "min":
                      case "m":
                        return n * m;

                      case "seconds":
                      case "second":
                      case "secs":
                      case "sec":
                      case "s":
                        return n * s;

                      case "milliseconds":
                      case "millisecond":
                      case "msecs":
                      case "msec":
                      case "ms":
                        return n;

                      default:
                        return;
                    }
                }
            }
        })(val);
        if ("number" === type && !1 === isNaN(val)) return options.long ? (ms = val, (msAbs = Math.abs(ms)) >= d ? plural(ms, msAbs, d, "day") : msAbs >= h ? plural(ms, msAbs, h, "hour") : msAbs >= m ? plural(ms, msAbs, m, "minute") : msAbs >= s ? plural(ms, msAbs, s, "second") : ms + " ms") : (function(ms) {
            var msAbs = Math.abs(ms);
            return msAbs >= d ? Math.round(ms / d) + "d" : msAbs >= h ? Math.round(ms / h) + "h" : msAbs >= m ? Math.round(ms / m) + "m" : msAbs >= s ? Math.round(ms / s) + "s" : ms + "ms";
        })(val);
        throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
    };
}
