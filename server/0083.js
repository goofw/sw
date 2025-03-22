function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(url) {
        return String(url).replace(UNMATCHED_SURROGATE_PAIR_REGEXP, "$1�$2").replace(ENCODE_CHARS_REGEXP, encodeURI);
    };
    var ENCODE_CHARS_REGEXP = /(?:[^\x21\x25\x26-\x3B\x3D\x3F-\x5B\x5D\x5F\x61-\x7A\x7E]|%(?:[^0-9A-Fa-f]|[0-9A-Fa-f][^0-9A-Fa-f]|$))+/g, UNMATCHED_SURROGATE_PAIR_REGEXP = /(^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]|[\uD800-\uDBFF]([^\uDC00-\uDFFF]|$)/g;
}
