function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(str) {
        for (var value, length = 0, len = str.length, pos = 0; pos < len; ) length++, (value = str.charCodeAt(pos++)) >= 55296 && value <= 56319 && pos < len && 56320 == (64512 & (value = str.charCodeAt(pos))) && pos++;
        return length;
    };
}
