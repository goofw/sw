function(module, exports, __webpack_require__) {
    const consts = __webpack_require__(79);
    module.exports = function(storage, metaStorage, args, cb) {
        const metas = [];
        storage.indexes.itemId.forEach((function(items, itemId) {
            const entry = storage.getAggrEntry("itemId", itemId, [ "files" ]);
            if (!(entry.itemId && entry.files && entry.files.length)) return;
            const firstFile = entry.files[0], meta = metaStorage.indexes.primaryKey.get(entry.itemId);
            metas.push(meta || {
                id: entry.itemId,
                type: "other",
                name: firstFile.parsedName || entry.name,
                poster: firstFile.imdb_id ? consts.METAHUB_URL + "/poster/medium/" + firstFile.imdb_id + "/img" : null
            });
        })), cb(null, {
            metas: metas
        });
    };
}
