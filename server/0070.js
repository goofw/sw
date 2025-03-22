function(module, exports, __webpack_require__) {
    var paths, common = module.exports, once = __webpack_require__(34), child = __webpack_require__(31), eos = __webpack_require__(163);
    common.servePlaylist = function(lines, res) {
        lines.push(""), lines = lines.join("\n"), res.setHeader("Content-Type", "application/vnd.apple.mpegurl"), 
        res.setHeader("Content-Length", new Buffer(lines).length), res.statusCode = 200, 
        res.write(lines), res.end();
    }, common.toSecs = function(ms) {
        return (ms / 1e3).toFixed(3);
    }, common.handleErr = function(err, res) {
        res.setHeader("Cache-Control", "no-cache"), res.writeHead(err.httpCode || 500), 
        res.end(err.message || (err.toString ? err.toString() : "internal server error"));
    }, common.pipeProcToResp = function(p, res, next) {
        var procExited = !1, stdoutClosed = !1;
        p.stdout.pipe(res, {
            end: !1
        }), p.on("error", (function(err) {
            console.error("ffsplit/ffmpeg error", err);
        })), p.on("exit", (function(code) {
            procExited = !0, 0 !== code && (res.statusCode = 500), stdoutClosed && procExited && res.end();
        })), eos(p.stdout, (function() {
            (stdoutClosed = !0) && procExited && res.end(), next();
        })), eos(res, (function(err) {
            stdoutClosed || p.stdout.destroy(), setTimeout((function() {
                procExited || (console.log("process " + p.pid + " refuses to die"), p.kill("SIGKILL"));
            }), 1e4), next();
        }));
    }, common.serveFfmpeg = function(args, type, res) {
        if (!paths.ffmpeg) return common.handleErr(new Error("no ffmpeg found"), res);
        convertQueue.push((function(cb) {
            var next = once(cb);
            process.env.FFMPEG_DEBUG && console.log(args.join(" ")), res.setHeader("Content-Type", type);
            var p = child.spawn(paths.ffmpeg, args);
            common.pipeProcToResp(p, res, next), process.env.FFMPEG_DEBUG && p.stderr.pipe(process.stderr);
        }));
    }, common.streamShouldTransmux = function(stream, supportsHevc) {
        var type = stream.codec_type, name = stream.codec_name.toLowerCase();
        return "video" == type ? -1 != name.indexOf("h264") || supportsHevc && name.indexOf("hevc") : "audio" == type ? -1 != name.indexOf("aac") : void 0;
    }, common.estimateBitrate = function(w, h, fps) {
        return h * w * fps * .11 / 1024;
    }, common.hasFFsplit = function(p) {
        return !!paths.ffsplit;
    }, common.init = function(pathsParam, convertQueueParam) {
        paths = pathsParam, convertQueue = convertQueueParam;
    };
}
