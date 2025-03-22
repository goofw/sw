function(module, exports, __webpack_require__) {
    "use strict";
    var toUnsigned = __webpack_require__(141).toUnsigned, parseType = __webpack_require__(209);
    module.exports = function findBox(data, path) {
        var i, size, type, end, subresults, results = [];
        if (!path.length) return null;
        for (i = 0; i < data.byteLength; ) size = toUnsigned(data[i] << 24 | data[i + 1] << 16 | data[i + 2] << 8 | data[i + 3]), 
        type = parseType(data.subarray(i + 4, i + 8)), end = size > 1 ? i + size : data.byteLength, 
        type === path[0] && (1 === path.length ? results.push(data.subarray(i + 8, end)) : (subresults = findBox(data.subarray(i + 8, end), path.slice(1))).length && (results = results.concat(subresults))), 
        i = end;
        return results;
    };
}
