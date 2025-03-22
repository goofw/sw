function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(buffer) {
        var result = "";
        return result += String.fromCharCode(buffer[0]), result += String.fromCharCode(buffer[1]), 
        (result += String.fromCharCode(buffer[2])) + String.fromCharCode(buffer[3]);
    };
}
