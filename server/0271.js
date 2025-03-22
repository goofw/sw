function(module, exports, __webpack_require__) {
    __webpack_require__(70);
    var paths, once = __webpack_require__(34), child = __webpack_require__(31), byline = __webpack_require__(93), retrieveKeyframes = __webpack_require__(637).get, SUPPORTED_QUALITIES = [ 320, 480, 720 ], instances = {}, videoApi = module.exports;
    videoApi.probeVideo = function(mri, cb) {
        if (!paths.ffmpeg) return cb(new Error("no ffmpeg found; call HLS.locateExecutables()"));
        var res = {
            streams: []
        }, err = null, p = child.spawn(paths.ffmpeg, [ "-i", mri ]), probeTimeout = setTimeout((function() {
            err = {
                message: "cannot probe within 20000",
                httpCode: 504
            }, ready(), p.kill("SIGKILL");
        }), 2e4), ready = once((function() {
            clearTimeout(probeTimeout), cb(err, err ? null : res);
        }));
        process.env.FFMPEG_DEBUG && p.stderr.pipe(process.stderr);
        var parsing = !1;
        byline.createStream(p.stderr).on("data", (function(line) {
            if ((line = line.toString()).match("Input #0")) {
                parsing = !0;
                var containers = line.toLowerCase().split(/\s*,\s*/).slice(1, -1);
                containers.indexOf("mp4") >= 0 ? res.container = "mp4" : containers.indexOf("matroska") >= 0 ? res.container = "matroska" : res.container = containers[0];
            } else if (parsing && " " != line[0]) parsing = !1; else if (parsing) {
                var durMatch = line.match(/Duration: (\d\d):(\d\d):(\d\d(\.\d\d)?)/i);
                durMatch && (res.duration = 60 * parseFloat(durMatch[1]) * 60 * 1e3 + 60 * parseFloat(durMatch[2]) * 1e3 + 1e3 * parseFloat(durMatch[3]), 
                (bitrateMatch = line.match(/bitrate: (\d+)/i)) && (res.bitrate = 1e3 * parseInt(bitrateMatch[1], 10)));
                var streamMatch = line.match(/Stream #0:(\d\d?)(?:\((\w+)\))?/);
                if (streamMatch) {
                    var streamParts = line.split(/\s*:\s*/), codecParts = streamParts[3].split(/ |,/), dimParts = streamParts[3].match(/([0-9]{3,4})x([0-9]{3,4})/), fpsMatch = line.match(/([0-9]{2})(\.)?([0-9]{2})? fps/), bitrateMatch = line.match(/([0-9]{3,4}) kb\/s/);
                    res.streams[streamMatch[1]] = {
                        codec_type: streamParts[2].toLowerCase(),
                        codec_name: codecParts[0].toLowerCase(),
                        size: dimParts ? [ parseInt(dimParts[1], 10), parseInt(dimParts[2], 10) ] : null,
                        stream: parseInt(streamMatch[1]),
                        default: codecParts.indexOf("(default)") >= 0,
                        bitrate: bitrateMatch ? 1e3 * parseInt(bitrateMatch[0], 10) : null,
                        fps: fpsMatch ? parseFloat(fpsMatch[0]) : null,
                        lang: streamMatch[2]
                    };
                }
            }
        })).on("finish", (function() {
            res.duration && (err = null), process.env.FFMPEG_DEBUG && console.log(err, res), 
            ready();
        })), p.on("exit", (function(code) {
            0 !== code && (err = {
                code: code,
                message: "process exited with bad code: " + code
            });
        })), p.on("error", (function(e) {
            err = e;
        }));
    }, videoApi.prepare = function(task, cb) {
        if (!paths.ffmpeg) return cb(new Error("no ffmpeg found; call HLS.locateExecutables()"));
        var segmentsUniform, segmentsByFrame, src = task.from, opts = task.opts || {};
        if (instances[src]) return cb(null, instances[src]);
        var instance = null;
        function doneWithVideo() {
            if (!instance) return cb(new Error("internal error - no video instanceo"));
            instance.segmentsByFrame = segmentsByFrame, instance.segmentsUniform = segmentsUniform, 
            opts.waitForSubs ? (once(cb), setTimeout(doneWithSubs, 12e3), allSubs[opts.waitForSubs] ? doneWithSubs() : evs.once("subtitles:" + opts.waitForSubs, doneWithSubs)) : doneWithSubs();
        }
        function doneWithSubs() {
            instances[src] = instance, cb(null, instances[src]);
        }
        videoApi.probeVideo(src, (function(err, res) {
            if (err) return cb(err);
            if ((instance = res).from = src, instance.videoStream = instance.streams.find((function(x) {
                return "video" == x.codec_type;
            })), !instance.videoStream) return cb({
                message: "no video stream found",
                httpCode: 415
            });
            if (!instance.duration) return cb({
                message: "no video stream duration",
                httpCode: 415
            });
            var qualities = SUPPORTED_QUALITIES.filter((function(x) {
                return x <= instance.videoStream.size[1] + 0;
            }));
            qualities.length || (qualities = [ instance.videoStream.size[1] ]), instance.qualities = qualities, 
            segmentsUniform = [];
            for (var i = 0; i != Math.ceil(instance.duration / 6e3); i++) {
                var at = 6e3 * i;
                segmentsUniform.push({
                    at: at,
                    duration: at + 6e3 > instance.duration ? instance.duration - at : 6e3
                });
            }
            instance.container && instance.container.match(/matroska|mp4/) ? (function(src, container, cb) {
                cb = once(cb);
                var t = setTimeout((function() {
                    cb({
                        message: "retrieveKeyframes timed out",
                        httpCode: 504
                    });
                }), 1e4);
                retrieveKeyframes(src, container, (function(err, res) {
                    clearTimeout(t), cb(err, res);
                }));
            })(src, instance.container, (function(err, keyframes) {
                if (err) return cb({
                    httpCode: 500,
                    message: err.message || err.toString()
                });
                keyframes && (segmentsByFrame = [], keyframes.forEach((function(frame, i) {
                    frame.timestamp = frame.dts, keyframes[i + 1] && (keyframes[i + 1].timestamp = keyframes[i + 1].dts);
                    var dur = (keyframes[i + 1] ? keyframes[i + 1].timestamp : instance.duration) - frame.timestamp, lastSeg = segmentsByFrame[segmentsByFrame.length - 1];
                    lastSeg && lastSeg.duration < 1 ? lastSeg.duration += dur : segmentsByFrame.push({
                        at: Math.floor(frame.timestamp),
                        dts: frame.dts,
                        duration: Math.floor(dur)
                    });
                }))), doneWithVideo();
            })) : doneWithVideo();
        }));
    }, videoApi.init = function(pathsParam, prepareQueueParam) {
        paths = pathsParam;
    };
}
