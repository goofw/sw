function(module, exports, __webpack_require__) {
    var child = __webpack_require__(31), fetch = __webpack_require__(33), mime = __webpack_require__(89), fs = __webpack_require__(2), path = __webpack_require__(4), URL = __webpack_require__(7).URL, castingUtils = {
        getMime: function(mimeURL) {
            var type = mime.lookup(mimeURL);
            return type ? Promise.resolve(type) : fetch(mimeURL, {
                method: "HEAD"
            }).then((function(res) {
                return res.headers.get("content-type");
            }));
        },
        getRemoteFileMeta: function(metaURL) {
            if (console.log(metaURL), metaURL.startsWith("file://")) {
                var metaPath = decodeURI(new URL(metaURL).pathname).replace(/^\/([a-z]+:\/)/i, "$1").replace("/", path.sep);
                return new Promise((function(resolve, reject) {
                    fs.stat(metaPath, (function(err, stats) {
                        err ? reject(err) : resolve({
                            type: mime.lookup(metaPath),
                            lenght: stats.size
                        });
                    }));
                }));
            }
            return fetch(metaURL, {
                method: "HEAD",
                timeout: 5e3
            }).then((function(fres) {
                return {
                    type: fres.headers.get("content-type"),
                    length: fres.headers.get("content-length")
                };
            }));
        },
        getVideoInfo: function(ffmpegPath, videoURL) {
            return new Promise((function(resolve, reject) {
                videoURL.startsWith("file://") && (videoURL = decodeURI(new URL(videoURL).pathname).replace(/^\/([a-z]+:\/)/i, "$1").replace("/", path.sep));
                var data = "", propsProc = child.spawn(ffmpegPath, [ "-i", videoURL ]);
                propsProc.stderr.on("data", (function(chunk) {
                    data += chunk;
                })), propsProc.stderr.on("end", (function() {
                    if (!data) return reject(new Error("No data"));
                    var matches = data.match(/duration: (\d+:\d+:\d+.\d+)/i), duration = 0;
                    matches && (duration = castingUtils.HMSToSec(matches[1]));
                    var streams = data.split("\n").filter((function(line) {
                        return line.trim().startsWith("Stream");
                    })).map((function(line) {
                        var codec = line.match(/#(\d+:\d+)(?:\((\w{3})\)|):\s(\w+):\s(\w+)(?:\s([^,]+),\s(\w+\([^)]+\)|[^,]+),\s([^,]+),\s(.*?)(?:\s(\(default\)))?$)?/m);
                        if (!codec) return console.log('castingUtils: Cannot parse stream "' + line + '"'), 
                        null;
                        const stream = {
                            id: codec[1],
                            lang: codec[2] || "und",
                            type: codec[3],
                            codec: codec[4],
                            default: !!codec[9],
                            misc: codec[8]
                        };
                        switch (stream.type) {
                          case "Video":
                            stream.pixfmt = codec[6], stream.vidfmt = codec[7];
                            break;

                          case "Audio":
                            stream.frequency = codec[6], stream.channels = codec[7];
                        }
                        return stream;
                    })).filter((function(stream) {
                        return null !== stream;
                    }));
                    resolve({
                        duration: duration,
                        streams: streams
                    });
                }));
            }));
        },
        secToHMS: function(s) {
            var h = Math.floor(s / 3600);
            s -= 3600 * h;
            var m = Math.floor(s / 60);
            return s -= 60 * m, [ h, m, s = Math.floor(s) ].map((function() {
                return ("0" + v).slice(-2);
            })).join(":");
        },
        HMSToSec: function(hms) {
            var matches = hms.match(/(\d+):(\d+):(\d+)(?:.(\d+))?/i);
            return matches ? 3600 * parseInt(matches[1], 10) + 60 * parseInt(matches[2], 10) + parseInt(matches[3], 10) + parseInt(matches[4] || 0, 10) / 100 : -1;
        }
    };
    module.exports = castingUtils;
}
