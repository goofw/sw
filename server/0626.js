function(module, exports, __webpack_require__) {
    var events = __webpack_require__(5), namedQueue = __webpack_require__(270), async = __webpack_require__(38), locatorapi = __webpack_require__(627), masterplaylistsapi = __webpack_require__(628), streamplaylistsapi = __webpack_require__(633), subtitlesapi = __webpack_require__(634), segmentsapi = __webpack_require__(635), videoapi = __webpack_require__(271), thumbapi = __webpack_require__(693), HLS = module.exports, allSubs = {}, evs = new events.EventEmitter, prepareQueue = new namedQueue((function(task, cb) {
        (HLS.prepare || videoapi.prepare)(task, cb);
    }), 1 / 0), convertQueue = async.queue((function(task, cb) {
        task(cb);
    }), 200);
    convertQueue.saturated = function() {
        console.log("WARNING: convertQueue saturated with concurrency: " + convertQueue.concurrency + " and tasks: " + convertQueue.length());
    };
    var paths = {
        ffmpeg: null,
        ffsplit: null
    };
    locatorapi.init(paths), videoapi.init(paths, prepareQueue), masterplaylistsapi.init(prepareQueue, allSubs), 
    streamplaylistsapi.init(prepareQueue), segmentsapi.init(paths, prepareQueue, convertQueue), 
    thumbapi.init(paths, convertQueue), subtitlesapi.init(prepareQueue, allSubs, evs), 
    HLS.setParallelConverts = function(converts) {
        convertQueue.concurrency = converts;
    }, HLS.locateExecutable = locatorapi.locateExecutable, HLS.locateAllExecutables = locatorapi.locateAllExecutables, 
    HLS.masterPlaylistMiddleware = masterplaylistsapi.masterPlaylistMiddleware, HLS.masterMultiPlaylistMiddleware = masterplaylistsapi.masterMultiPlaylistMiddleware, 
    HLS.streamPlaylistMiddleware = streamplaylistsapi.streamPlaylistMiddleware, HLS.streamPlaylistMiddleware = streamplaylistsapi.streamPlaylistMiddleware, 
    HLS.segmentTranscodeMiddleware = segmentsapi.segmentTranscodeMiddleware, HLS.segmentMiddleware = segmentsapi.segmentMiddleware, 
    HLS.probeVideo = videoapi.probeVideo, HLS.DLNAMpegTtsMiddleware = segmentsapi.DLNAMpegTtsMiddleware, 
    HLS.subsPlaylistMiddleware = subtitlesapi.subsPlaylistMiddleware, HLS.subsReceiveMiddleware = subtitlesapi.subsReceiveMiddleware, 
    HLS.thumbMiddleware = thumbapi.thumbMiddleware;
}
