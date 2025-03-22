function(module, exports, __webpack_require__) {
    var subRetriever = __webpack_require__(696), subParser = __webpack_require__(740).parseString;
    module.exports = function(args, callback) {
        if (!args.url) return callback(new Error("pass .url"));
        subRetriever.retrieveSrt(args.url, (function(err, buf) {
            if (err) return callback(err);
            try {
                var tracks = subParser(buf.toString());
            } catch (e) {
                callback(e);
            }
            callback(null, {
                url: args.url,
                tracks: Object.keys(tracks).map((function(key) {
                    return tracks[key];
                }))
            });
        }));
    };
}
