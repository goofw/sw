function(module, exports, __webpack_require__) {
    "use strict";
    var codes = __webpack_require__(547);
    function status(code) {
        if ("number" == typeof code) {
            if (!status[code]) throw new Error("invalid status code: " + code);
            return code;
        }
        if ("string" != typeof code) throw new TypeError("code must be a number or string");
        var n = parseInt(code, 10);
        if (!isNaN(n)) {
            if (!status[n]) throw new Error("invalid status code: " + n);
            return n;
        }
        if (!(n = status[code.toLowerCase()])) throw new Error('invalid status message: "' + code + '"');
        return n;
    }
    module.exports = status, status.codes = (function(statuses, codes) {
        var arr = [];
        return Object.keys(codes).forEach((function(code) {
            var message = codes[code], status = Number(code);
            statuses[status] = message, statuses[message] = status, statuses[message.toLowerCase()] = status, 
            arr.push(status);
        })), arr;
    })(status, codes), status.redirect = {
        300: !0,
        301: !0,
        302: !0,
        303: !0,
        305: !0,
        307: !0,
        308: !0
    }, status.empty = {
        204: !0,
        205: !0,
        304: !0
    }, status.retry = {
        502: !0,
        503: !0,
        504: !0
    };
}
