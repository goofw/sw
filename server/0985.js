function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = preferredEncodings, module.exports.preferredEncodings = preferredEncodings;
    var simpleEncodingRegExp = /^\s*([^\s;]+)\s*(?:;(.*))?$/;
    function parseEncoding(str, i) {
        var match = simpleEncodingRegExp.exec(str);
        if (!match) return null;
        var encoding = match[1], q = 1;
        if (match[2]) for (var params = match[2].split(";"), j = 0; j < params.length; j++) {
            var p = params[j].trim().split("=");
            if ("q" === p[0]) {
                q = parseFloat(p[1]);
                break;
            }
        }
        return {
            encoding: encoding,
            q: q,
            i: i
        };
    }
    function specify(encoding, spec, index) {
        var s = 0;
        if (spec.encoding.toLowerCase() === encoding.toLowerCase()) s |= 1; else if ("*" !== spec.encoding) return null;
        return {
            i: index,
            o: spec.i,
            q: spec.q,
            s: s
        };
    }
    function preferredEncodings(accept, provided) {
        var accepts = (function(accept) {
            for (var accepts = accept.split(","), hasIdentity = !1, minQuality = 1, i = 0, j = 0; i < accepts.length; i++) {
                var encoding = parseEncoding(accepts[i].trim(), i);
                encoding && (accepts[j++] = encoding, hasIdentity = hasIdentity || specify("identity", encoding), 
                minQuality = Math.min(minQuality, encoding.q || 1));
            }
            return hasIdentity || (accepts[j++] = {
                encoding: "identity",
                q: minQuality,
                i: i
            }), accepts.length = j, accepts;
        })(accept || "");
        if (!provided) return accepts.filter(isQuality).sort(compareSpecs).map(getFullEncoding);
        var priorities = provided.map((function(type, index) {
            return (function(encoding, accepted, index) {
                for (var priority = {
                    o: -1,
                    q: 0,
                    s: 0
                }, i = 0; i < accepted.length; i++) {
                    var spec = specify(encoding, accepted[i], index);
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
    function getFullEncoding(spec) {
        return spec.encoding;
    }
    function isQuality(spec) {
        return spec.q > 0;
    }
}
