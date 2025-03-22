function(module, exports, __webpack_require__) {
    var paths, path = __webpack_require__(4), fs = __webpack_require__(2), locatorapi = module.exports;
    locatorapi.locateExecutable = function(name, searchIn) {
        var sysPaths = process.env.PATH.split(path.delimiter).map((function(dir) {
            return path.join(dir, name);
        }));
        return (searchIn || []).concat(sysPaths).find((function(p) {
            try {
                return fs.accessSync(p, fs.X_OK), !0;
            } catch (e) {
                return !1;
            }
        }));
    }, locatorapi.locateAllExecutables = function(commandsSearchIn) {
        return Object.keys(commandsSearchIn).forEach((function(name) {
            paths[name] = locatorapi.locateExecutable(name, commandsSearchIn[name]) || paths[name];
        })), paths;
    }, locatorapi.init = function(pathsParam) {
        paths = pathsParam;
    };
}
