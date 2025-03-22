function(module, exports, __webpack_require__) {
    var prepareQueue, allSubs, evs, common = __webpack_require__(70), subtitlesApi = module.exports;
    subtitlesApi.subsPlaylistMiddleware = function(req, res, next) {
        prepareQueue.push({
            id: req.params.from,
            from: req.params.from,
            opts: req.query
        }, (function(err, instance) {
            if (err) return common.handleErr(err, res);
            var body = [];
            body.push("#EXTM3U"), body.push("#EXT-X-VERSION:4");
            var sub = (allSubs[req.query.waitForSubs] || []).filter((function(s) {
                return req.params.lang === s.lang;
            }))[0];
            if (!sub) return res.end();
            body.push("#EXT-X-TARGETDURATION:" + Math.ceil(instance.duration / 1e3)), body.push("#EXT-X-MEDIA-SEQUENCE:1"), 
            body.push("#EXT-X-PLAYLIST-TYPE:VOD"), body.push("#EXTINF:" + common.toSecs(instance.duration) + ","), 
            body.push("http://" + req.headers.host + "/subtitles.vtt?from=" + encodeURIComponent(sub.url)), 
            body.push("#EXT-X-ENDLIST"), common.servePlaylist(body, res);
        }));
    }, subtitlesApi.subsReceiveMiddleware = function(req, res, next) {
        var id = req.params.item, subs = req.body;
        allSubs[id] = subs, evs.emit("subtitles:" + id, subs), res.end();
    }, subtitlesApi.init = function(prepareQueueParam, allSubsParam, evsParams) {
        prepareQueue = prepareQueueParam, allSubs = allSubsParam, evs = evsParams;
    };
}
