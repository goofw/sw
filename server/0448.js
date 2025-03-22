function(module, exports) {
    exports.items = function(hash, ignored) {
        ignored = ignored || null;
        var k, key, rv = [];
        for (k in hash) !hash.hasOwnProperty(k) || (key = ignored, ignored && 0 !== ignored.length && ignored.indexOf(key)) || rv.push([ k, hash[k] ]);
        return rv;
    }, exports.findall = function(re, str) {
        for (var match, matches = []; match = re.exec(str); ) matches.push(match);
        return matches;
    }, exports.merge = function(a, b) {
        var attrname, c = {};
        for (attrname in a) a.hasOwnProperty(attrname) && (c[attrname] = a[attrname]);
        for (attrname in b) b.hasOwnProperty(attrname) && (c[attrname] = b[attrname]);
        return c;
    };
}
