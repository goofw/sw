function(module, exports, __webpack_require__) {
    const path = __webpack_require__(4), consts = __webpack_require__(79), SUPPORTED_TYPES = [ "movie", "series" ];
    function getFileVideoId(f) {
        return (f.season && f.episode ? [ f.imdb_id, f.season, f.episode ] : [ f.imdb_id ]).join(":");
    }
    module.exports = function(storage, args, cb) {
        if (!args.id.startsWith(consts.PREFIX_IMDB) || !SUPPORTED_TYPES.includes(args.type)) return cb(null, {
            streams: []
        });
        const idSplit = args.id.split(":"), itemIdLocal = consts.PREFIX_LOCAL + idSplit[0], streams = [];
        if (storage.indexes.itemId.has(itemIdLocal)) {
            const entries = storage.indexes.itemId.get(itemIdLocal);
            for (var entry of entries.values()) {
                const f = entry.files[0];
                args.type === f.type && args.id === getFileVideoId(f) && streams.push({
                    id: "file://" + f.path,
                    url: "file://" + f.path,
                    subtitle: consts.STREAM_LOCALFILE_SUBTITLE,
                    title: path.basename(f.path)
                });
            }
        }
        for (let k of storage.indexes.itemId.keys()) if (k.startsWith(consts.PREFIX_BT)) {
            const entry = storage.indexes.itemId.get(k).values().next().value;
            entry.files.forEach((function(f, i) {
                args.type === f.type && args.id === getFileVideoId(f) && streams.push({
                    title: path.basename(f.path),
                    infoHash: entry.ih,
                    fileIdx: i,
                    id: entry.ih + "/" + i,
                    sources: entry.sources
                });
            }));
        }
        cb(null, {
            streams: streams
        });
    };
}
