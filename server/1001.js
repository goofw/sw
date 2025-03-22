function(module, exports, __webpack_require__) {
    const fetch = __webpack_require__(33), indexer = __webpack_require__(467), mapEntryToMeta = __webpack_require__(468), consts = __webpack_require__(79);
    function mapFile(entry, uxTime, file, index) {
        const stream = entry.ih ? {
            infoHash: entry.ih,
            fileIdx: file.idx,
            title: entry.ih + "/" + file.idx,
            sources: entry.sources
        } : {
            title: file.path,
            url: "file://" + file.path,
            subtitle: consts.STREAM_LOCALFILE_SUBTITLE
        }, videoId = [ file.imdb_id, file.season, file.episode ].filter((x => x)).join(":"), thumbnail = file.season && file.episode ? `${consts.METAHUB_EPISODES_URL}/${file.imdb_id}/${file.season}/${file.episode}/w780.jpg` : `${consts.METAHUB_URL}/background/medium/${file.imdb_id}/img`;
        return {
            id: videoId || stream.title,
            title: file.name,
            publishedAt: entry.dateModified || new Date,
            released: new Date(uxTime - 6e4 * index),
            stream: stream,
            season: file.season,
            episode: file.episode,
            thumbnail: file.imdb_id ? thumbnail : null
        };
    }
    module.exports = function(storage, metaStorage, engineUrl, args, cb) {
        let entry = storage.getAggrEntry("itemId", args.id, [ "files" ]);
        if (!entry && args.id.startsWith(consts.PREFIX_BT) && (entry = (function(engineUrl, ih) {
            return fetch(engineUrl + "/" + ih + "/create", {
                method: "POST"
            }).then((function(resp) {
                return resp.json();
            })).then((function(torrent) {
                return new Promise((function(resolve, reject) {
                    indexer.indexParsedTorrent(torrent, (function(err, entry) {
                        return err ? reject(err) : entry ? void resolve(entry) : reject(new Error("internal err: no entry from indexParsedTorrent"));
                    }));
                }));
            }));
        })(engineUrl, args.id.slice(consts.PREFIX_BT.length))), !entry) return cb(null, null);
        Promise.resolve(entry).then((function(entry) {
            const videos = entry.files.sort((function(a, b) {
                try {
                    return a.season - b.season || a.episode - b.episode;
                } catch (e) {}
                return 0;
            })).map(mapFile.bind(null, entry, (new Date).getTime()));
            return Promise.resolve(metaStorage.indexes.primaryKey.get(entry.itemId)).then((function(meta) {
                return meta || mapEntryToMeta(entry);
            })).then((function(meta) {
                meta.videos = videos, cb(null, {
                    meta: meta
                });
            }));
        })).catch((function(err) {
            console.log(err), cb(null, null);
        }));
    };
}
