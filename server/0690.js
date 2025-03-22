function(module, exports) {
    (function() {
        "use strict";
        exports.stripBOM = function(str) {
            return "\ufeff" === str[0] ? str.substring(1) : str;
        };
    }).call(this);
}
