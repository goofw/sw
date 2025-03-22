function(module, exports, __webpack_require__) {
    "use strict";
    function balanced(a, b, str) {
        a instanceof RegExp && (a = maybeMatch(a, str)), b instanceof RegExp && (b = maybeMatch(b, str));
        var r = range(a, b, str);
        return r && {
            start: r[0],
            end: r[1],
            pre: str.slice(0, r[0]),
            body: str.slice(r[0] + a.length, r[1]),
            post: str.slice(r[1] + b.length)
        };
    }
    function maybeMatch(reg, str) {
        var m = str.match(reg);
        return m ? m[0] : null;
    }
    function range(a, b, str) {
        var begs, beg, left, right, result, ai = str.indexOf(a), bi = str.indexOf(b, ai + 1), i = ai;
        if (ai >= 0 && bi > 0) {
            if (a === b) return [ ai, bi ];
            for (begs = [], left = str.length; i >= 0 && !result; ) i == ai ? (begs.push(i), 
            ai = str.indexOf(a, i + 1)) : 1 == begs.length ? result = [ begs.pop(), bi ] : ((beg = begs.pop()) < left && (left = beg, 
            right = bi), bi = str.indexOf(b, i + 1)), i = ai < bi && ai >= 0 ? ai : bi;
            begs.length && (result = [ left, right ]);
        }
        return result;
    }
    module.exports = balanced, balanced.range = range;
}
