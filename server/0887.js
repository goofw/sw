function(module, exports, __webpack_require__) {
    var fs = __webpack_require__(2), path = __webpack_require__(4), tmp = __webpack_require__(440), child = __webpack_require__(31), fetch = __webpack_require__(33), pump = __webpack_require__(162), URL = (__webpack_require__(889), 
    __webpack_require__(7).URL), castingUtils = __webpack_require__(218), Discovery = __webpack_require__(890), ExternalDiscovery = __webpack_require__(891), MDNSDiscovery = __webpack_require__(896), SSDPDiscovery = __webpack_require__(905), ChromecastClient = __webpack_require__(941), DLNAClient = __webpack_require__(951), Router = __webpack_require__(111), discovery = new Discovery([ SSDPDiscovery, MDNSDiscovery, ExternalDiscovery ]), noop = Function.prototype;
    function Casting(executables) {
        var self = this;
        this.ffmpegErrors = "ignore", this.players = {}, this.executables = executables, 
        this.middleware = Router(), this.middleware.param("devID", (function(req, res, next, devID) {
            if (!discovery.devices[devID]) return console.log(" ^ Device not found!"), res.statusCode = 404, 
            res.setHeader("Content-Type", "text/plain; charset=utf8"), res.end("Device not found");
            var player = self.players[devID];
            switch (discovery.devices[devID].type) {
              case "chromecast":
                player = player || new ChromecastClient(discovery.devices[devID], self.executables);
                break;

              case "tv":
                player = player || new DLNAClient(discovery.devices[devID], self.executables);
                break;

              case "external":
                (player = discovery.devices[devID]).time = 0;
            }
            if (self.players[devID] = player, !player) return next(new Error("Unsupported device " + discovery.devices[devID].type));
            req.player = player, next();
        })), this.middleware.get("/", (function(req, res) {
            res.setHeader("Content-Type", "application/json; charset=utf8"), res.end(JSON.stringify(Object.keys(discovery.devices).map((function(key) {
                return discovery.devices[key];
            }))));
        })), this.middleware.get("/transcode:ext?", this.transcode.bind(this)), this.middleware.get("/convert:ext?", this.transcode.bind(this)), 
        this.middleware.get("/:devID", (function(req, res, next) {
            res.setHeader("Content-Type", "application/json; charset=utf8"), res.end(JSON.stringify(discovery.devices[req.params.devID]));
        })), this.middleware.all("/:devID/player", (function(req, res, next) {
            return req.player.middleware.bind(req.player)(req, res, next);
        }));
    }
    Casting.prototype.makeSubs = function(subsUrl, offset) {
        if (!subsUrl) return Promise.resolve();
        var self = this;
        return fetch("http://127.0.0.1:11470/subtitles.srt?from=" + encodeURIComponent(subsUrl)).then((function(res) {
            return res.text();
        })).then((function(text) {
            return new Promise((function(resolve, reject) {
                tmp.file({
                    prefix: "subs-",
                    postfix: ".srt"
                }, (function(err, path, fd) {
                    if (err) return reject(err);
                    var written = fs.close.bind(fs, fd, resolve.bind(null, path)), subs = Buffer.from(text.replace(/\r/g, ""), "utf8");
                    fs.write(fd, subs, 0, subs.length, 0, written);
                }));
            }));
        })).then((function(sourceSubsFn) {
            return offset ? new Promise((function(resolve, reject) {
                tmp.file({
                    prefix: "subs-",
                    postfix: ".srt",
                    discardDescriptor: !0
                }, (function(err, path) {
                    if (err) return reject(err);
                    var args = [ "-ss", offset, "-i", sourceSubsFn, "-y", path ], procOpts = {
                        detached: !0,
                        stdio: [ "ignore", "ignore", self.ffmpegErrors ]
                    };
                    child.spawn(self.executables.ffmpeg, args, procOpts).once("close", (function(code) {
                        return code ? reject("ffmpeg error " + code + " while subtitles alignment") : (fs.unlink(sourceSubsFn, noop), 
                        resolve(path));
                    }));
                }));
            })) : sourceSubsFn;
        })).catch((function(err) {
            console.log("Subtitles error", err);
        }));
    }, Casting.prototype.transcode = function(req, res) {
        if (!req.query.video) return res.statusCode = 400, void res.end("provide ?video");
        req.once("error", noop);
        var isFMP4 = req.query.fmp4, audioTrack = req.query.audioTrack, offset = parseInt(req.query.time, 10) || 0, subtitlesDelay = parseInt(req.query.subtitlesDelay, 10) || 0;
        Promise.all([ castingUtils.getVideoInfo(this.executables.ffmpeg, req.query.video), castingUtils.getRemoteFileMeta(req.query.video), this.makeSubs(req.query.subtitles, Math.max(0, offset - subtitlesDelay)), this.executables.ffmpeg, this.ffmpegErrors ]).then((function(data) {
            var duration = data[0].duration, length = data[1].length, subtitles = (data[1].type, 
            data[2]), ffmpegPath = data[3], ffmpegErrors = data[4];
            duration && (length -= length * offset / duration, duration -= offset);
            var headers = {
                "Content-Type": isFMP4 ? "video/mp4" : "video/x-mkv",
                "Transfer-Encoding": "chunked",
                "Accept-Ranges": "none",
                Connection: "Close",
                "transferMode.dlna.org": "Streaming",
                "contentFeatures.dlna.org": "DLNA.ORG_OP=01;DLNA.ORG_CI=1;DLNA.ORG_FLAGS=01300000000000000000000000000000"
            };
            if (req.headers["getmediainfo.sec"] && (headers["MediaInfo.sec"] = "SEC_Duration=" + 1e3 * duration + ";"), 
            res.writeHead(200, headers), console.log("RESPONSE HEADERS", res._header), "HEAD" != req.method) {
                var audioStream, copyVideo = !subtitles, copyAudio = !0, videoStream = data[0].streams.find((function(stream) {
                    return "Video" == stream.type && "h264" == stream.codec;
                }));
                videoStream || (copyVideo = !1, videoStream = data[0].streams.find((function(stream) {
                    return "Video" == stream.type;
                }))), (audioStream = audioTrack ? data[0].streams.find((function(stream) {
                    return "Audio" == stream.type && stream.id == audioTrack;
                })) : data[0].streams.find((function(stream) {
                    return "Audio" == stream.type && stream.default;
                }))) && (copyAudio = "aac" == audioStream.codec && "stereo" == audioStream.channels), 
                audioStream && duration || (copyAudio = !1, audioStream = data[0].streams.find((function(stream) {
                    return "Audio" == stream.type;
                })));
                var transmuxing = copyAudio && copyVideo, args = [];
                req.query.flagRe && args.push("-re");
                var videoURL = req.query.video;
                videoURL.startsWith("file:") && (videoURL = decodeURI(new URL(videoURL).pathname).replace(/^\/([a-z]+:\/)/i, "$1").replace("/", path.sep)), 
                args.push("-copyts", "-ss", duration > 0 ? offset : 0, "-i", videoURL), duration > 0 && args.push("-t", duration + offset), 
                videoStream && args.push("-map", videoStream.id), audioStream && args.push("-map", audioStream.id), 
                transmuxing ? args.push("-c", "copy") : (videoStream && (copyVideo ? args.push("-c:v", "copy") : (args.push("-c:v", "libx264", "-preset", "ultrafast", "-tune", "zerolatency", "-pix_fmt", "yuv420p"), 
                subtitles && args.push("-vf", "subtitles=" + subtitles))), audioStream && (copyAudio ? args.push("-c:a", "copy") : args.push("-strict", "-2", "-c:a", "aac", "-ac", "2"))), 
                isFMP4 && args.push("-movflags", "frag_keyframe+empty_moov"), args.push("-f", isFMP4 ? "mp4" : "matroska", "-threads", "0", "pipe:1"), 
                console.log("Arguments " + args.join(" "));
                var procOpts = {
                    detached: !0,
                    stdio: [ "ignore", null, ffmpegErrors ]
                }, transcodingProc = child.spawn(ffmpegPath, args, procOpts);
                pump(transcodingProc.stdout, res, (function(e) {
                    console.log(" ---\x3e CLOSE", e ? e.message : ""), transcodingProc.kill("SIGKILL"), 
                    subtitles && fs.unlink(subtitles, noop);
                }));
            } else res.end();
        })).catch((function(e) {
            console.log("Transcoding error:", e), res.end(e.message);
        }));
    }, module.exports = Casting;
}
