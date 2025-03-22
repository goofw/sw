function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = preferredCharsets, module.exports.preferredCharsets = preferredCharsets;
    var simpleCharsetRegExp = /^\s*([^\s;]+)\s*(?:;(.*))?$/;
    function parseCharset(str, i) {
        var match = simpleCharsetRegExp.exec(str);
        if (!match) return null;
        var charset = match[1], q = 1;
        if (match[2]) for (var params = match[2].split(";"), j = 0; j < params.length; j++) {
            var p = params[j].trim().split("=");
            if ("q" === p[0]) {
                q = parseFloat(p[1]);
                break;
            }
        }
        return {
            charset: charset,
            q: q,
            i: i
        };
    }
    function specify(charset, spec, index) {
        var s = 0;
        if (spec.charset.toLowerCase() === charset.toLowerCase()) s |= 1; else if ("*" !== spec.charset) return null;
        return {
            i: index,
            o: spec.i,
            q: spec.q,
            s: s
        };
    }
    function preferredCharsets(accept, provided) {
        var accepts = (function(accept) {
            for (var accepts = accept.split(","), i = 0, j = 0; i < accepts.length; i++) {
                var charset = parseCharset(accepts[i].trim(), i);
                charset && (accepts[j++] = charset);
            }
            return accepts.length = j, accepts;
        })(void 0 === accept ? "*" : accept || "");
        if (!provided) return accepts.filter(isQuality).sort(compareSpecs).map(getFullCharset);
        var priorities = provided.map((function(type, index) {
            return (function(charset, accepted, index) {
                for (var priority = {
                    o: -1,
                    q: 0,
                    s: 0
                }, i = 0; i < accepted.length; i++) {
                    var spec = specify(charset, accepted[i], index);
                    spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0 && (priority = spec);
                }
                return priority;
            })(type, accepts, index);
        }));
        return priorities.filter(isQuality).sort(compareSpecs).map((function(priority) {
            return provided[priorities.indexOf(priority)];
        }));
    }
    function compareSpecs(a, b) {
        return b.q - a.q || b.s - a.s || a.o - b.o || a.i - b.i || 0;
    }
    function getFullCharset(spec) {
        return spec.charset;
    }
    function isQuality(spec) {
        return spec.q > 0;
    }
}
