function(module, exports) {
    module.exports = function pathtoRegexp(path, keys, options) {
        keys = keys || [];
        var m, strict = (options = options || {}).strict, end = !1 !== options.end, flags = options.sensitive ? "" : "i", extraOffset = 0, keysOffset = keys.length, i = 0, name = 0;
        if (path instanceof RegExp) {
            for (;m = MATCHING_GROUP_REGEXP.exec(path.source); ) keys.push({
                name: name++,
                optional: !1,
                offset: m.index
            });
            return path;
        }
        if (Array.isArray(path)) return path = path.map((function(value) {
            return pathtoRegexp(value, keys, options).source;
        })), new RegExp("(?:" + path.join("|") + ")", flags);
        for (path = ("^" + path + (strict ? "" : "/" === path[path.length - 1] ? "?" : "/?")).replace(/\/\(/g, "/(?:").replace(/([\/\.])/g, "\\$1").replace(/(\\\/)?(\\\.)?:(\w+)(\(.*?\))?(\*)?(\?)?/g, (function(match, slash, format, key, capture, star, optional, offset) {
            slash = slash || "", format = format || "", capture = capture || "([^\\/" + format + "]+?)", 
            optional = optional || "", keys.push({
                name: key,
                optional: !!optional,
                offset: offset + extraOffset
            });
            var result = (optional ? "" : slash) + "(?:" + format + (optional ? slash : "") + capture + (star ? "((?:[\\/" + format + "].+?)?)" : "") + ")" + optional;
            return extraOffset += result.length - match.length, result;
        })).replace(/\*/g, (function(star, index) {
            for (var len = keys.length; len-- > keysOffset && keys[len].offset > index; ) keys[len].offset += 3;
            return "(.*)";
        })); m = MATCHING_GROUP_REGEXP.exec(path); ) {
            for (var escapeCount = 0, index = m.index; "\\" === path.charAt(--index); ) escapeCount++;
            escapeCount % 2 != 1 && ((keysOffset + i === keys.length || keys[keysOffset + i].offset > m.index) && keys.splice(keysOffset + i, 0, {
                name: name++,
                optional: !1,
                offset: m.index
            }), i++);
        }
        return path += end ? "$" : "/" === path[path.length - 1] ? "" : "(?=\\/|$)", new RegExp(path, flags);
    };
    var MATCHING_GROUP_REGEXP = /\((?!\?)/g;
}
