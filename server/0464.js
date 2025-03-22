function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(res, field) {
        if (!res || !res.getHeader || !res.setHeader) throw new TypeError("res argument is required");
        var val = res.getHeader("Vary") || "", header = Array.isArray(val) ? val.join(", ") : String(val);
        (val = append(header, field)) && res.setHeader("Vary", val);
    }, module.exports.append = append;
    var FIELD_NAME_REGEXP = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
    function append(header, field) {
        if ("string" != typeof header) throw new TypeError("header argument is required");
        if (!field) throw new TypeError("field argument is required");
        for (var fields = Array.isArray(field) ? field : parse(String(field)), j = 0; j < fields.length; j++) if (!FIELD_NAME_REGEXP.test(fields[j])) throw new TypeError("field argument contains an invalid header name");
        if ("*" === header) return header;
        var val = header, vals = parse(header.toLowerCase());
        if (-1 !== fields.indexOf("*") || -1 !== vals.indexOf("*")) return "*";
        for (var i = 0; i < fields.length; i++) {
            var fld = fields[i].toLowerCase();
            -1 === vals.indexOf(fld) && (vals.push(fld), val = val ? val + ", " + fields[i] : fields[i]);
        }
        return val;
    }
    function parse(header) {
        for (var end = 0, list = [], start = 0, i = 0, len = header.length; i < len; i++) switch (header.charCodeAt(i)) {
          case 32:
            start === end && (start = end = i + 1);
            break;

          case 44:
            list.push(header.substring(start, end)), start = end = i + 1;
            break;

          default:
            end = i + 1;
        }
        return list.push(header.substring(start, end)), list;
    }
}
