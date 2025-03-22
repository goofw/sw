function(module, exports, __webpack_require__) {
    const child = __webpack_require__(31), byline = __webpack_require__(93), events = __webpack_require__(5);
    module.exports = function() {
        const ev = new events.EventEmitter;
        var p = child.exec("mdfind '(kMDItemFSName=*.avi || kMDItemFSName=*.mp4 || kMDItemFSName=*.mkv || kMDItemFSName=*.torrent)'");
        return p.on("error", (function(err) {
            ev.emit("err", err);
        })), p.stdout.pipe(byline()).on("data", (function(line) {
            ev.emit("file", line.toString().trim());
        })), ev;
    };
}
