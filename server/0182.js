function(module, exports, __webpack_require__) {
    "use strict";
    function posix(path) {
        return "/" === path.charAt(0);
    }
    function win32(path) {
        var result = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/.exec(path), device = result[1] || "", isUnc = Boolean(device && ":" !== device.charAt(1));
        return Boolean(result[2] || isUnc);
    }
    module.exports = "win32" === process.platform ? win32 : posix, module.exports.posix = posix, 
    module.exports.win32 = win32;
}
