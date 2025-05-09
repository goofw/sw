function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = preferredLanguages, module.exports.preferredLanguages = preferredLanguages;
    var simpleLanguageRegExp = /^\s*([^\s\-;]+)(?:-([^\s;]+))?\s*(?:;(.*))?$/;
    function parseLanguage(str, i) {
        var match = simpleLanguageRegExp.exec(str);
        if (!match) return null;
        var prefix = match[1], suffix = match[2], full = prefix;
        suffix && (full += "-" + suffix);
        var q = 1;
        if (match[3]) for (var params = match[3].split(";"), j = 0; j < params.length; j++) {
            var p = params[j].split("=");
            "q" === p[0] && (q = parseFloat(p[1]));
        }
        return {
            prefix: prefix,
            suffix: suffix,
            q: q,
            i: i,
            full: full
        };
    }
    function specify(language, spec, index) {
        var p = parseLanguage(language);
        if (!p) return null;
        var s = 0;
        if (spec.full.toLowerCase() === p.full.toLowerCase()) s |= 4; else if (spec.prefix.toLowerCase() === p.full.toLowerCase()) s |= 2; else if (spec.full.toLowerCase() === p.prefix.toLowerCase()) s |= 1; else if ("*" !== spec.full) return null;
        return {
            i: index,
            o: spec.i,
            q: spec.q,
            s: s
        };
    }
    function preferredLanguages(accept, provided) {
        var accepts = (function(accept) {
            for (var accepts = accept.split(","), i = 0, j = 0; i < accepts.length; i++) {
                var language = parseLanguage(accepts[i].trim(), i);
                language && (accepts[j++] = language);
            }
            return accepts.length = j, accepts;
        })(void 0 === accept ? "*" : accept || "");
        if (!provided) return accepts.filter(isQuality).sort(compareSpecs).map(getFullLanguage);
        var priorities = provided.map((function(type, index) {
            return (function(language, accepted, index) {
                for (var priority = {
                    o: -1,
                    q: 0,
                    s: 0
                }, i = 0; i < accepted.length; i++) {
                    var spec = specify(language, accepted[i], index);
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
    function getFullLanguage(spec) {
        return spec.full;
    }
    function isQuality(spec) {
        return spec.q > 0;
    }
}
