function(module, exports, __webpack_require__) {
    var stream = __webpack_require__(3), needle = __webpack_require__(278), fs = __webpack_require__(2), iconv = __webpack_require__(68), charsetDetector = __webpack_require__(697), zlib = __webpack_require__(45), zip = __webpack_require__(728), _ = __webpack_require__(372);
    function streamFromPath(path, agent) {
        return path instanceof stream.Readable ? path : path.match("^http") ? needle.get(path, {
            agent: agent,
            follow_max: 12
        }) : fs.createReadStream(path);
    }
    module.exports = {
        streamFromPath: streamFromPath,
        retrieveSrt: function retrieveSrt(path, cb, options) {
            var callback = _.once((function(err, res) {
                if (err && options && options.agent) return retrieveSrt(path, cb);
                cb(err, res);
            }));
            if ((stream = streamFromPath(path, options && options.agent)).on("error", (function(err) {
                callback(err);
            })), path.match("zip$")) {
                var foundSrt = !1, bufs = [], zipbufs = [];
                stream.on("data", (function(b) {
                    zipbufs.push(b);
                })), stream.on("end", (function() {
                    try {
                        zip.Reader(Buffer.concat(zipbufs)).forEach((function(entry) {
                            entry.getName().match("srt$") && !foundSrt && (foundSrt = !0, bufs.push(entry.getData()));
                        }));
                    } catch (e) {
                        return callback(e);
                    }
                    if (!foundSrt) return callback(new Error("no srt found in zip file " + path));
                    onDownloaded();
                }));
            } else {
                if (path.match("gz$")) var stream = stream.pipe(zlib.createUnzip());
                bufs = [], stream.on("data", (function(dat) {
                    bufs.push(dat);
                })), stream.on("end", onDownloaded), stream.on("error", (function(e) {
                    callback(e);
                }));
            }
            function onDownloaded() {
                var charset, buf = Buffer.concat(bufs);
                try {
                    charset = "ISO-8859-8-I" == (charset = options && options.charset && "auto" != options.charset ? options.charset : charsetDetector(buf)[0].charsetName) ? "ISO-8859-8" : charset, 
                    buf = iconv.decode(buf, charset);
                } catch (e) {
                    return void callback(e);
                }
                callback(null, buf);
            }
        }
    };
}
