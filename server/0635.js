function(module, exports, __webpack_require__) {
    var prepareQueue, paths, convertQueue, common = __webpack_require__(70), once = __webpack_require__(34), child = __webpack_require__(31), ffmpegArgs = __webpack_require__(636), segmentApi = module.exports, headerMap = {
        audio: 'audio/mp2t; codecs="mp4a.40.5"',
        video: 'video/mp2t; codecs="avc1.42E01F"',
        other: "video/mp2t"
    };
    segmentApi.segmentMiddleware = function(req, res, next) {
        prepareQueue.push({
            id: req.params.from,
            from: req.params.from,
            opts: req.query
        }, (function(err, instance) {
            if (err) common.handleErr(err, res); else {
                if (req.params.quality = req.params.quality || (instance.segmentsByFrame ? "o" : 720), 
                !isNaN(req.params.quality)) return setTimeout((function() {
                    segmentApi.segmentTranscodeMiddleware(req, res, next);
                }), 0);
                var segment = instance.segmentsByFrame[parseInt(req.params.seg, 10)];
                if (segment) {
                    var transcode = {
                        video: !1,
                        audio: !1
                    }, selectedStream = instance.streams[req.params.stream], splitArgs = [ req.params.from, segment.at, segment.duration ];
                    if (selectedStream ? (splitArgs.push(selectedStream.stream), transcode[selectedStream.codec_type] = transcode[selectedStream.codec_type] || !common.streamShouldTransmux(selectedStream)) : (splitArgs.push(-1), 
                    transcode = instance.streams.reduce((function(ret, s) {
                        return ret[s.codec_type] = ret[s.codec_type] || !common.streamShouldTransmux(s), 
                        ret;
                    }), transcode)), transcode.video) return setTimeout((function() {
                        segmentApi.segmentTranscodeMiddleware(req, res, next);
                    }), 0);
                    !(function(res, splitArgs) {
                        convertQueue.push((function(cb) {
                            var next = once(cb);
                            !(function(res, selectedParam) {
                                var selected = "other";
                                res.setHeader("Content-Type", headerMap[selected]);
                            })(res), res.setHeader("X-HLS-Flow", "splitter"), process.env.FFMPEG_DEBUG && console.log("\n --\x3e RUN " + paths.ffsplit + " " + splitArgs.join(" "));
                            var p = child.spawn(paths.ffsplit, splitArgs, {
                                detached: !0,
                                stdio: [ "ignore", null, process.env.FFSPLIT_DEBUG ? null : "inherit" ]
                            });
                            common.pipeProcToResp(p, res, next), process.env.FFSPLIT_DEBUG && p.stderr && p.stderr.pipe(process.stderr);
                        }));
                    })(res, splitArgs);
                } else common.handleErr({
                    message: "segment does not exist in segmentsByFrame",
                    httpCode: 404
                }, res);
            }
        }));
    }, segmentApi.segmentTranscodeMiddleware = function(req, res, next) {
        prepareQueue.push({
            id: req.params.from,
            from: req.params.from,
            opts: req.query
        }, (function(err, instance) {
            if (err) common.handleErr(err, res); else {
                var segment = instance.segmentsUniform[parseInt(req.params.seg, 10)];
                if (segment) {
                    var selectedStream = instance.streams[req.params.stream], transcodeArgs = [ "-ss", common.toSecs(segment.at), "-t", common.toSecs(segment.duration), "-i", req.params.from, "-af", "aselect=gt(n\\,1)" ], q = parseInt(req.params.quality, 10);
                    q && -1 === instance.qualities.indexOf(q) ? common.handleErr({
                        message: "no such quality",
                        httpCode: 404
                    }, res) : (q && instance.videoStream.size[1] - q > 100 && (transcodeArgs = transcodeArgs.concat([ "-vf", "scale=-2:" + req.params.quality ])), 
                    transcodeArgs = (transcodeArgs = selectedStream ? transcodeArgs.concat([ "-map", "0:" + selectedStream.stream ], ffmpegArgs[selectedStream.codec_type].notTransmuxing) : transcodeArgs.concat(ffmpegArgs.video.notTransmuxing, ffmpegArgs.audio.notTransmuxing)).concat(ffmpegArgs.end.any), 
                    res.setHeader("X-HLS-Flow", "transcoder"), common.serveFfmpeg(transcodeArgs, "video/mp2t", res));
                } else common.handleErr({
                    message: "segment does not exist in segmentsUniform",
                    httpCode: 404
                }, res);
            }
        }));
    }, segmentApi.DLNAMpegTtsMiddleware = function(req, res, next) {
        prepareQueue.push({
            id: req.params.from,
            from: req.params.from,
            opts: req.query
        }, (function(err, instance) {
            if (err) common.handleErr(err, res); else {
                var vidTransmux = instance.streams.every((function(stream) {
                    return "video" !== stream.codec_type || common.streamShouldTransmux(stream);
                })), audTransmux = instance.streams.every((function(stream) {
                    return "audio" !== stream.codec_type || common.streamShouldTransmux(stream);
                }));
                process.env.FFMPEG_DEBUG && console.log(instance.streams, vidTransmux, audTransmux);
                var args = [ "-ss", common.toSecs(parseInt(req.params.at) || 0), "-i", req.params.from, "-c:v", vidTransmux ? "copy" : "libx264", "-c:a", audTransmux ? "copy" : "aac" ];
                vidTransmux && (args = args.concat(ffmpegArgs.video.getFilter(instance))), args = args.concat([ "-strict", "-2", "-loglevel", process.env.FFMPEG_DEBUG ? "warning" : "error", "-tune", "zerolatency", "-f", "mpegts", "pipe:1" ]), 
                res.setHeader("transferMode.dlna.org", "Streaming"), res.setHeader("contentFeatures.dlna.org", "DLNA.ORG_PN=AVC_TS_BL_CIF15_AAC_540;DLNA.ORG_FLAGS=ED100000000000000000000000000000"), 
                common.serveFfmpeg(args, "video/vnd.dlna.mpeg-tts", res);
            }
        }));
    }, segmentApi.init = function(pathsParam, prepareQueueParam, convertQueueParam) {
        paths = pathsParam, prepareQueue = prepareQueueParam, convertQueue = convertQueueParam, 
        common.init(paths, convertQueue);
    };
}
