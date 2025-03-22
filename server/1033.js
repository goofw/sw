function(module, exports, __webpack_require__) {
    (function(__dirname) {
        var exec = __webpack_require__(31).exec, path = __webpack_require__(4);
        function escape(s) {
            return s.replace(/"/g, '\\"');
        }
        module.exports = function(target, appName, callback) {
            var opener;
            switch ("function" == typeof appName && (callback = appName, appName = null), process.platform) {
              case "darwin":
                opener = appName ? 'open -a "' + escape(appName) + '"' : "open";
                break;

              case "win32":
                opener = appName ? 'start "" "' + escape(appName) + '"' : 'start ""';
                break;

              default:
                opener = appName ? escape(appName) : path.join(__dirname, "../vendor/xdg-open");
            }
            return process.env.SUDO_USER && (opener = "sudo -u " + process.env.SUDO_USER + " " + opener), 
            exec(opener + ' "' + escape(target) + '"', callback);
        };
    }).call(this, "/");
}
