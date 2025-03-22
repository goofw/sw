function(module, exports, __webpack_require__) {
    var concatMap = __webpack_require__(780), balanced = __webpack_require__(781);
    module.exports = function(str) {
        return str ? ("{}" === str.substr(0, 2) && (str = "\\{\\}" + str.substr(2)), expand((function(str) {
            return str.split("\\\\").join(escSlash).split("\\{").join(escOpen).split("\\}").join(escClose).split("\\,").join(escComma).split("\\.").join(escPeriod);
        })(str), !0).map(unescapeBraces)) : [];
    };
    var escSlash = "\0SLASH" + Math.random() + "\0", escOpen = "\0OPEN" + Math.random() + "\0", escClose = "\0CLOSE" + Math.random() + "\0", escComma = "\0COMMA" + Math.random() + "\0", escPeriod = "\0PERIOD" + Math.random() + "\0";
    function numeric(str) {
        return parseInt(str, 10) == str ? parseInt(str, 10) : str.charCodeAt(0);
    }
    function unescapeBraces(str) {
        return str.split(escSlash).join("\\").split(escOpen).join("{").split(escClose).join("}").split(escComma).join(",").split(escPeriod).join(".");
    }
    function parseCommaParts(str) {
        if (!str) return [ "" ];
        var parts = [], m = balanced("{", "}", str);
        if (!m) return str.split(",");
        var pre = m.pre, body = m.body, post = m.post, p = pre.split(",");
        p[p.length - 1] += "{" + body + "}";
        var postParts = parseCommaParts(post);
        return post.length && (p[p.length - 1] += postParts.shift(), p.push.apply(p, postParts)), 
        parts.push.apply(parts, p), parts;
    }
    function embrace(str) {
        return "{" + str + "}";
    }
    function isPadded(el) {
        return /^-?0\d/.test(el);
    }
    function lte(i, y) {
        return i <= y;
    }
    function gte(i, y) {
        return i >= y;
    }
    function expand(str, isTop) {
        var expansions = [], m = balanced("{", "}", str);
        if (!m || /\$$/.test(m.pre)) return [ str ];
        var n, isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body), isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body), isSequence = isNumericSequence || isAlphaSequence, isOptions = m.body.indexOf(",") >= 0;
        if (!isSequence && !isOptions) return m.post.match(/,.*\}/) ? expand(str = m.pre + "{" + m.body + escClose + m.post) : [ str ];
        if (isSequence) n = m.body.split(/\.\./); else if (1 === (n = parseCommaParts(m.body)).length && 1 === (n = expand(n[0], !1).map(embrace)).length) return (post = m.post.length ? expand(m.post, !1) : [ "" ]).map((function(p) {
            return m.pre + n[0] + p;
        }));
        var N, pre = m.pre, post = m.post.length ? expand(m.post, !1) : [ "" ];
        if (isSequence) {
            var x = numeric(n[0]), y = numeric(n[1]), width = Math.max(n[0].length, n[1].length), incr = 3 == n.length ? Math.abs(numeric(n[2])) : 1, test = lte;
            y < x && (incr *= -1, test = gte);
            var pad = n.some(isPadded);
            N = [];
            for (var i = x; test(i, y); i += incr) {
                var c;
                if (isAlphaSequence) "\\" === (c = String.fromCharCode(i)) && (c = ""); else if (c = String(i), 
                pad) {
                    var need = width - c.length;
                    if (need > 0) {
                        var z = new Array(need + 1).join("0");
                        c = i < 0 ? "-" + z + c.slice(1) : z + c;
                    }
                }
                N.push(c);
            }
        } else N = concatMap(n, (function(el) {
            return expand(el, !1);
        }));
        for (var j = 0; j < N.length; j++) for (var k = 0; k < post.length; k++) {
            var expansion = pre + N[j] + post[k];
            (!isTop || isSequence || expansion) && expansions.push(expansion);
        }
        return expansions;
    }
}
