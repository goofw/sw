function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(value, options) {
        return "string" == typeof value ? parse(value) : "number" == typeof value ? format(value, options) : null;
    }, module.exports.format = format, module.exports.parse = parse;
    var formatThousandsRegExp = /\B(?=(\d{3})+(?!\d))/g, formatDecimalsRegExp = /(?:\.0*|(\.[^0]+)0+)$/, map = {
        b: 1,
        kb: 1024,
        mb: 1 << 20,
        gb: 1 << 30,
        tb: Math.pow(1024, 4),
        pb: Math.pow(1024, 5)
    }, parseRegExp = /^((-|\+)?(\d+(?:\.\d+)?)) *(kb|mb|gb|tb|pb)$/i;
    function format(value, options) {
        if (!Number.isFinite(value)) return null;
        var mag = Math.abs(value), thousandsSeparator = options && options.thousandsSeparator || "", unitSeparator = options && options.unitSeparator || "", decimalPlaces = options && void 0 !== options.decimalPlaces ? options.decimalPlaces : 2, fixedDecimals = Boolean(options && options.fixedDecimals), unit = options && options.unit || "";
        unit && map[unit.toLowerCase()] || (unit = mag >= map.pb ? "PB" : mag >= map.tb ? "TB" : mag >= map.gb ? "GB" : mag >= map.mb ? "MB" : mag >= map.kb ? "KB" : "B");
        var str = (value / map[unit.toLowerCase()]).toFixed(decimalPlaces);
        return fixedDecimals || (str = str.replace(formatDecimalsRegExp, "$1")), thousandsSeparator && (str = str.replace(formatThousandsRegExp, thousandsSeparator)), 
        str + unitSeparator + unit;
    }
    function parse(val) {
        if ("number" == typeof val && !isNaN(val)) return val;
        if ("string" != typeof val) return null;
        var floatValue, results = parseRegExp.exec(val), unit = "b";
        return results ? (floatValue = parseFloat(results[1]), unit = results[4].toLowerCase()) : (floatValue = parseInt(val, 10), 
        unit = "b"), Math.floor(map[unit] * floatValue);
    }
}
