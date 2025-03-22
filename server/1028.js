function(module, exports, __webpack_require__) {
    const child = __webpack_require__(31), events = __webpack_require__(5), byline = __webpack_require__(93), which = __webpack_require__(1029), cmdLine = [ "-L", process.env.HOME, "-maxdepth", "7", "-not", "-path", "*/\\.*", "-not", "-path", "*/node_modules/*", "-not", "-path", "*/bin/*", "-not", "-path", "*/src/*", "-not", "-path", "*/build/*", "-not", "-path", "*/dist/*", "-type", "f", "(", "-iname", "*.torrent", "-o", "-iname", "*.mp4", "-o", "-iname", "*.mkv", "-o", "-iname", "*.avi", ")" ];
    function startIndexing() {
        var ev = this;
        const findPath = which.sync("find");
        if (findPath) {
            var p = child.spawn(findPath, cmdLine);
            p.on("error", (function(err) {
                ev.emit("err", err);
            })), p.stdout.pipe(byline()).on("data", (function(line) {
                ev.emit("file", line.toString().trim());
            })).on("close", (function() {
                ev.emit("finished");
            }));
        } else ev.emit("err", "find executable not found in PATH");
    }
    module.exports = function() {
        const ev = new events.EventEmitter;
        return setImmediate(startIndexing.bind(ev)), ev;
    };
}
