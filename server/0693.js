function(module, exports, __webpack_require__) {
    var paths, convertQueue, common = __webpack_require__(70), videoapi = __webpack_require__(271), thumbApi = module.exports;
    thumbApi.thumbMiddleware = function(req, res) {
        videoapi.probeVideo(req.params.from, (function(err, instance) {
            if (err) return common.handleErr(err, res);
            var args = [ "-ss", isNaN(req.query.at) ? Math.round(instance.duration / 1e3 / 2) : req.query.at, "-i", req.params.from, "-r", "1", "-vframes", "1", "-f", "image2", "-vcodec", "mjpeg", "pipe:1" ];
            common.serveFfmpeg(args, "image/jpg", res);
        }));
    }, thumbApi.init = function(pathsParam, convertQueueParam) {
        paths = pathsParam, convertQueue = convertQueueParam, common.init(paths, convertQueue);
    };
}
