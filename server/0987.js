function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = preferredMediaTypes, module.exports.preferredMediaTypes = preferredMediaTypes;
    var simpleMediaTypeRegExp = /^\s*([^\s\/;]+)\/([^;\s]+)\s*(?:;(.*))?$/;
    function parseMediaType(str, i) {
        var match = simpleMediaTypeRegExp.exec(str);
        if (!match) return null;
        var params = Object.create(null), q = 1, subtype = match[2], type = match[1];
        if (match[3]) for (var kvps = (function(str) {
            for (var parameters = str.split(";"), i = 1, j = 0; i < parameters.length; i++) quoteCount(parameters[j]) % 2 == 0 ? parameters[++j] = parameters[i] : parameters[j] += ";" + parameters[i];
            for (parameters.length = j + 1, i = 0; i < parameters.length; i++) parameters[i] = parameters[i].trim();
            return parameters;
        })(match[3]).map(splitKeyValuePair), j = 0; j < kvps.length; j++) {
            var pair = kvps[j], key = pair[0].toLowerCase(), val = pair[1], value = val && '"' === val[0] && '"' === val[val.length - 1] ? val.substr(1, val.length - 2) : val;
            if ("q" === key) {
                q = parseFloat(value);
                break;
            }
            params[key] = value;
        }
        return {
            type: type,
            subtype: subtype,
            params: params,
            q: q,
            i: i
        };
    }
    function specify(type, spec, index) {
        var p = parseMediaType(type), s = 0;
        if (!p) return null;
        if (spec.type.toLowerCase() == p.type.toLowerCase()) s |= 4; else if ("*" != spec.type) return null;
        if (spec.subtype.toLowerCase() == p.subtype.toLowerCase()) s |= 2; else if ("*" != spec.subtype) return null;
        var keys = Object.keys(spec.params);
        if (keys.length > 0) {
            if (!keys.every((function(k) {
                return "*" == spec.params[k] || (spec.params[k] || "").toLowerCase() == (p.params[k] || "").toLowerCase();
            }))) return null;
            s |= 1;
        }
        return {
            i: index,
            o: spec.i,
            q: spec.q,
            s: s
        };
    }
    function preferredMediaTypes(accept, provided) {
        var accepts = (function(accept) {
            for (var accepts = (function(accept) {
                for (var accepts = accept.split(","), i = 1, j = 0; i < accepts.length; i++) quoteCount(accepts[j]) % 2 == 0 ? accepts[++j] = accepts[i] : accepts[j] += "," + accepts[i];
                return accepts.length = j + 1, accepts;
            })(accept), i = 0, j = 0; i < accepts.length; i++) {
                var mediaType = parseMediaType(accepts[i].trim(), i);
                mediaType && (accepts[j++] = mediaType);
            }
            return accepts.length = j, accepts;
        })(void 0 === accept ? "*/*" : accept || "");
        if (!provided) return accepts.filter(isQuality).sort(compareSpecs).map(getFullType);
        var priorities = provided.map((function(type, index) {
            return (function(type, accepted, index) {
                for (var priority = {
                    o: -1,
                    q: 0,
                    s: 0
                }, i = 0; i < accepted.length; i++) {
                    var spec = specify(type, accepted[i], index);
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
    function getFullType(spec) {
        return spec.type + "/" + spec.subtype;
    }
    function isQuality(spec) {
        return spec.q > 0;
    }
    function quoteCount(string) {
        for (var count = 0, index = 0; -1 !== (index = string.indexOf('"', index)); ) count++, 
        index++;
        return count;
    }
    function splitKeyValuePair(str) {
        var key, val, index = str.indexOf("=");
        return -1 === index ? key = str : (key = str.substr(0, index), val = str.substr(index + 1)), 
        [ key, val ];
    }
}
