function(module, exports, __webpack_require__) {
    "use strict";
    var typer = __webpack_require__(555), mime = __webpack_require__(89);
    function typeis(value, types_) {
        var i, type, types = types_, val = tryNormalizeType(value);
        if (!val) return !1;
        if (types && !Array.isArray(types)) for (types = new Array(arguments.length - 1), 
        i = 0; i < types.length; i++) types[i] = arguments[i + 1];
        if (!types || !types.length) return val;
        for (i = 0; i < types.length; i++) if (mimeMatch(normalize(type = types[i]), val)) return "+" === type[0] || -1 !== type.indexOf("*") ? val : type;
        return !1;
    }
    function hasbody(req) {
        return void 0 !== req.headers["transfer-encoding"] || !isNaN(req.headers["content-length"]);
    }
    function normalize(type) {
        if ("string" != typeof type) return !1;
        switch (type) {
          case "urlencoded":
            return "application/x-www-form-urlencoded";

          case "multipart":
            return "multipart/*";
        }
        return "+" === type[0] ? "*/*" + type : -1 === type.indexOf("/") ? mime.lookup(type) : type;
    }
    function mimeMatch(expected, actual) {
        if (!1 === expected) return !1;
        var actualParts = actual.split("/"), expectedParts = expected.split("/");
        return 2 === actualParts.length && 2 === expectedParts.length && ("*" === expectedParts[0] || expectedParts[0] === actualParts[0]) && ("*+" === expectedParts[1].substr(0, 2) ? expectedParts[1].length <= actualParts[1].length + 1 && expectedParts[1].substr(1) === actualParts[1].substr(1 - expectedParts[1].length) : "*" === expectedParts[1] || expectedParts[1] === actualParts[1]);
    }
    function tryNormalizeType(value) {
        if (!value) return null;
        try {
            return (function(value) {
                var type = typer.parse(value);
                return type.parameters = void 0, typer.format(type);
            })(value);
        } catch (err) {
            return null;
        }
    }
    module.exports = function(req, types_) {
        var types = types_;
        if (!hasbody(req)) return null;
        if (arguments.length > 2) {
            types = new Array(arguments.length - 1);
            for (var i = 0; i < types.length; i++) types[i] = arguments[i + 1];
        }
        var value = req.headers["content-type"];
        return typeis(value, types);
    }, module.exports.is = typeis, module.exports.hasBody = hasbody, module.exports.normalize = normalize, 
    module.exports.match = mimeMatch;
}
