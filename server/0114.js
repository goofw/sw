function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(list, compare, sorted) {
        return 0 === list.length ? list : compare ? (sorted || list.sort(compare), (function(list, compare) {
            for (var ptr = 1, len = list.length, a = list[0], b = list[0], i = 1; i < len; ++i) if (b = a, 
            compare(a = list[i], b)) {
                if (i === ptr) {
                    ptr++;
                    continue;
                }
                list[ptr++] = a;
            }
            return list.length = ptr, list;
        })(list, compare)) : (sorted || list.sort(), (function(list) {
            for (var ptr = 1, len = list.length, a = list[0], b = list[0], i = 1; i < len; ++i, 
            b = a) if (b = a, (a = list[i]) !== b) {
                if (i === ptr) {
                    ptr++;
                    continue;
                }
                list[ptr++] = a;
            }
            return list.length = ptr, list;
        })(list));
    };
}
