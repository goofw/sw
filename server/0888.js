function(module, exports, __webpack_require__) {
    "use strict";
    var isWindows = "win32" === process.platform, trailingSlashRe = isWindows ? /[^:]\\$/ : /.\/$/;
    module.exports = function() {
        var path;
        return path = isWindows ? process.env.TEMP || process.env.TMP || (process.env.SystemRoot || process.env.windir) + "\\temp" : process.env.TMPDIR || process.env.TMP || process.env.TEMP || "/tmp", 
        trailingSlashRe.test(path) && (path = path.slice(0, -1)), path;
    };
}
