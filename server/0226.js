function(module, exports, __webpack_require__) {
    var helpers = {
        yearSimilar: function(parsedYear, altYear) {
            return !parsedYear || !altYear || (parsedYear = parseInt(parsedYear), (altYear = parseInt(altYear)) >= parsedYear - 1 && altYear <= parsedYear + 1);
        },
        levenshteinDistance: function(s1, s2) {
            var longer = s1, shorter = s2;
            s1.length < s2.length && (longer = s2, shorter = s1);
            var longerLength = longer.length;
            return 0 == longerLength ? 1 : (longerLength - (function(s1, s2) {
                s1 = s1.toLowerCase(), s2 = s2.toLowerCase();
                for (var costs = new Array, i = 0; i <= s1.length; i++) {
                    for (var lastValue = i, j = 0; j <= s2.length; j++) if (0 == i) costs[j] = j; else if (j > 0) {
                        var newValue = costs[j - 1];
                        s1.charAt(i - 1) != s2.charAt(j - 1) && (newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1), 
                        costs[j - 1] = lastValue, lastValue = newValue;
                    }
                    i > 0 && (costs[s2.length] = lastValue);
                }
                return costs[s2.length];
            })(longer, shorter)) / parseFloat(longerLength);
        },
        sanitizeName: function(name) {
            return name.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase().replace("the ", "").replace(/\s+/g, " ").trim();
        },
        nameSimilar: function(parsedName, altName) {
            return parsedName && altName ? (parsedName = helpers.sanitizeName(parsedName)) == (altName = helpers.sanitizeName(altName)) ? 1 : helpers.levenshteinDistance(parsedName, altName) : 0;
        },
        nameAlmostSimilar: function(parsedName, altName) {
            return !!(parsedName && altName && (parsedName = helpers.sanitizeName(parsedName), 
            altName = helpers.sanitizeName(altName), parsedName.startsWith(altName) || parsedName.endsWith(altName) || altName.startsWith(parsedName) || altName.endsWith(parsedName)));
        },
        simplifyName: function(args) {
            if (!args || !args.name) return null;
            var name = args.name.toLowerCase().trim().replace(/\([^\(]+\)$/, "").replace(/&/g, "and").replace(/[^0-9a-z ]+/g, " ").split(" ").filter((function(r) {
                return r;
            })).join(" ");
            return args.year && name.endsWith(" " + args.year) && (name = name.replace(new RegExp(" " + args.year + "$", "i"), "")), 
            name;
        },
        parseSearchTerm: function(searchTerm) {
            return searchTerm && "string" == typeof searchTerm ? (0, __webpack_require__(1011).remove)(searchTerm.replace(/[^\u0000-\u036F][ \t]*/gm, "")) : null;
        }
    };
    module.exports = helpers;
}
