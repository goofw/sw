function(module, exports, __webpack_require__) {
    var fs = __webpack_require__(2);
    function parseString(stringData) {
        return (stringData || "").replace(/\r+/g, "").split("\n\n").reduce(createSrtData, []);
    }
    function createSrtData(memo, string) {
        for (var lines = string.split("\n"); lines.length > 2 && !lines[0].match(" --\x3e "); ) lines.shift();
        if (lines.length < 2) return memo;
        var times = lines[0].split(" "), startTime = parseTime(times[0]), endTime = parseTime(times[2]), text = lines.slice(1).join("\n");
        return startTime === 1 / 0 || endTime === 1 / 0 || 0 === text.length || memo.push({
            number: memo.length,
            startTime: startTime,
            endTime: endTime,
            text: text
        }), memo;
    }
    function parseTime(timeString) {
        if (!timeString) return 1 / 0;
        var chunks = timeString.split(":");
        if (3 != chunks.length) return 1 / 0;
        var secondChunks = chunks[2].split(/,|\./);
        return 36e5 * parseInt(chunks[0], 10) + 6e4 * parseInt(chunks[1], 10) + 1e3 * parseInt(secondChunks[0], 10) + parseInt(secondChunks[1], 10);
    }
    module.exports = {
        parseString: parseString,
        parseFile: function(path, cb) {
            fs.readFile(path, (function(err, buf) {
                if (err) return cb(err);
                try {
                    cb(null, parseString(buf.toString()));
                } catch (e) {
                    cb(e);
                }
            }));
        }
    };
}
