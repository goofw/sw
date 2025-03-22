function(module, exports, __webpack_require__) {
    var prepareQueue, common = __webpack_require__(70), streamPlaylistApi = module.exports;
    streamPlaylistApi.streamPlaylistMiddleware = function(req, res, next) {
        var prefix = req.params.hasOwnProperty("stream") || req.params.hasOwnProperty("quality") ? req.url.split("/").pop().split(".")[0] + "/" : "";
        prepareQueue.push({
            id: req.params.from,
            from: req.params.from,
            opts: req.query
        }, (function(err, instance) {
            if (err) return common.handleErr(err, res);
            req.params.quality || console.error("WARNING: streamPlaylistMiddleware should no longer be used without quality");
            var q = parseInt(req.params.quality, 10);
            if (instance.qualities && -1 === instance.qualities.indexOf(q) && "o" !== req.params.quality) return common.handleErr({
                message: "no such quality",
                httpCode: 404
            }, res);
            var segments = isNaN(req.params.quality) ? instance.segmentsByFrame : instance.segmentsUniform, body = [];
            body.push("#EXTM3U"), body.push("#EXT-X-VERSION:4");
            var maxDuration = segments.reduce((function(r, s) {
                return Math.max(r, s.duration);
            }), 0);
            body.push("#EXT-X-TARGETDURATION:" + Math.ceil(maxDuration / 1e3)), body.push("#EXT-X-MEDIA-SEQUENCE:0"), 
            body.push("#EXT-X-PLAYLIST-TYPE:VOD"), segments.forEach((function(seg, i) {
                req.query.xdiscontinuity && body.push("#EXT-X-DISCONTINUITY"), body.push("#EXTINF:" + common.toSecs(seg.duration) + ","), 
                body.push(prefix + i + ".ts" + (req.search || ""));
            })), body.push("#EXT-X-ENDLIST"), common.servePlaylist(body, res);
        }));
    }, streamPlaylistApi.init = function(prepareQueueParam) {
        prepareQueue = prepareQueueParam;
    };
}
