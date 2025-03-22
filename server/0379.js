function(module, exports, __webpack_require__) {
    var pkg = __webpack_require__(378), path = __webpack_require__(4), os = __webpack_require__(21);
    if (!(appPath = process.env.APP_PATH)) {
        var appPath = path.join(os.tmpdir(), pkg.name);
        "linux" === process.platform ? appPath = path.join(process.env.HOME, "." + pkg.name) : "darwin" === process.platform ? appPath = path.join(process.env.HOME, "Library", "Application Support", pkg.name) : "win32" === process.platform ? appPath = path.join(process.env.APPDATA, "stremio", pkg.name) : console.error("Unable to determine application path - export 'APP_PATH' instead");
    }
    module.exports = appPath;
}
