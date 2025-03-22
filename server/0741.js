function(module, exports, __webpack_require__) {
    var _ = __webpack_require__(372), fs = __webpack_require__(2), path = __webpack_require__(4), opensub = new (__webpack_require__(742)), get = __webpack_require__(376), URL = __webpack_require__(7).URL;
    module.exports = function(args, cb) {
        if ("string" != typeof args.url) return cb(new Error("url required"));
        cb = _.once(cb);
        var fd, res = {}, buf_start = Buffer.alloc(131072), buf_end = Buffer.alloc(131072), buf_pad = Buffer.alloc(65536), file_size = 0, t_chksum = [], ready = function(chksum_part, name) {
            if (fd && fs.close(fd, (function() {})), fd = null, t_chksum.push(chksum_part), 
            3 == t_chksum.length) {
                var chksum = opensub.sumHex64bits(t_chksum[0], t_chksum[1]);
                chksum = (chksum = opensub.sumHex64bits(chksum, t_chksum[2])).substr(-16), res.hash = opensub.padLeft(chksum, "0", 16), 
                cb(null, res);
            }
        };
        if (args.url.startsWith("file:")) {
            var p = decodeURI(new URL(args.url).pathname).replace(/^\/([a-z]+:\/)/i, "$1").replace("/", path.sep);
            return fs.stat(p, (function(err, stat) {
                if (err) return cb(err);
                file_size = res.size = stat.size, ready(file_size.toString(16)), fs.open(p, "r", (function(err, f) {
                    if (fd = f, err) return cb(err);
                    [ {
                        buf: buf_start,
                        offset: 0
                    }, {
                        buf: buf_end,
                        offset: file_size - 65536
                    } ].forEach((function(b) {
                        fs.read(fd, b.buf, 0, 131072, b.offset, (function(err, _, buffer) {
                            if (err) return cb(err);
                            ready(opensub.checksumBuffer(buffer, 16));
                        }));
                    }));
                }));
            }));
        }
        return args.url.match(/^http(s?):/) ? get.concat({
            url: args.url,
            method: "HEAD"
        }, (function(err, resp, body) {
            if (err) return cb(err);
            ready((res.size = file_size = parseInt(resp.headers["content-length"], 10)).toString(16));
            var ranges = [ {
                start: 0,
                end: 65535
            }, {
                start: file_size - 65536,
                end: file_size - 1
            } ];
            function tryRange(range, next) {
                get.concat({
                    url: args.url,
                    headers: {
                        range: "bytes=" + range.start + "-" + range.end,
                        "enginefs-prio": 10
                    }
                }, (function(err, resp, data) {
                    return err ? cb(err) : 200 !== resp.statusCode && 206 !== resp.statusCode ? cb(new Error("non-200/206 (" + resp.statusCode + ") status code returned for range")) : 65536 !== data.length ? cb("response for calculating movie hash is wrong length: " + JSON.stringify(range) + " chunk_size 65536 but received " + data.length) : (ready(opensub.checksumBuffer(Buffer.concat([ data, buf_pad ]), 16)), 
                    void (next && next()));
                }));
            }
            tryRange(ranges[0], (function() {
                tryRange(ranges[1]);
            }));
        })) : cb(new Error("args.url must begin with http or file"));
    };
}
