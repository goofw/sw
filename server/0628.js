function(module, exports, __webpack_require__) {
    var prepareQueue, allSubs, common = __webpack_require__(70), languageNames = __webpack_require__(629).languageNames, url = __webpack_require__(7), masterPlaylistApi = module.exports;
    masterPlaylistApi.masterPlaylistMiddleware = function(req, res, next) {
        var query = url.parse(req.url).query;
        query = query ? "?" + query : "", prepareQueue.push({
            id: req.params.from,
            from: req.params.from,
            opts: req.query
        }, (function(err, instance) {
            if (err) return common.handleErr(err, res);
            var body = [], base = req.url.split("/").slice(0, -1).join("/") + "/";
            body.push("#EXTM3U"), body.push("#EXT-X-VERSION:4");
            var subs = allSubs[req.query.waitForSubs];
            if (subs && subs.forEach((function(s) {
                s && s.lang && body.push('#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="' + (s.langName || languageNames[s.langName]) + '",DEFAULT=YES,AUTOSELECT=YES,FORCED=NO,LANGUAGE="' + s.lang + '",URI="' + base + "/subs-" + s.lang + ".m3u8" + query + '"');
            })), req.params.hlsMultiStream) instance.streams.forEach((function(stream, i) {
                if ("audio" === stream.codec_type) {
                    var audioMeta = '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",';
                    stream.lang && (audioMeta += 'LANGUAGE="' + stream.lang + '",AUTOSELECT=YES,'), 
                    stream.default && (audioMeta += "DEFAULT=YES,"), audioMeta += 'NAME="' + (languageNames[stream.lang] || stream.lang || "Audio " + stream.stream) + '",URI="stream-' + stream.stream + ".m3u8" + query + '"', 
                    body.push(audioMeta);
                }
                "video" === stream.codec_type && (body.push("#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=" + instance.bitrate + ',AUDIO="audio"' + (subs ? ',SUBTITLES="subs"' : "")), 
                body.push(base + "stream-" + stream.stream + ".m3u8" + query));
            })); else {
                var streams = [], i = 0;
                common.hasFFsplit() && instance.segmentsByFrame && instance.streams.some((function(x) {
                    return "h264" == x.codec_name;
                })) && streams.push("#EXT-X-STREAM-INF:PROGRAM-ID=" + i++ + ",BANDWIDTH=" + instance.bitrate + (subs ? ',SUBTITLES="subs"' : "") + "\n" + base + "stream-q-o.m3u8" + query);
                var vs = instance.videoStream;
                instance.qualities.forEach((function(h) {
                    var bitrate = common.estimateBitrate(h * vs.size[0] / vs.size[1], h, vs.fps || 24);
                    streams.push("#EXT-X-STREAM-INF:PROGRAM-ID=" + i++ + ",BANDWIDTH=" + Math.round(1e3 * bitrate) + (subs ? ',SUBTITLES="subs"' : "") + "\n" + base + "stream-q-" + h + ".m3u8" + query);
                })), body = body.concat(req.params.adaptiveBitrate ? streams : streams.slice(0, 1));
            }
            common.servePlaylist(body, res);
        }));
    }, masterPlaylistApi.masterMultiPlaylistMiddleware = function(req, res, next) {
        return req.params.hlsMultiStream = !0, masterPlaylistApi.masterPlaylistMiddleware(req, res, next);
    }, masterPlaylistApi.init = function(prepareQueueParam, allSubsParam) {
        prepareQueue = prepareQueueParam, allSubs = allSubsParam;
    };
}
