function(module, exports, __webpack_require__) {
    const fetch = __webpack_require__(33), consts = __webpack_require__(79);
    module.exports = function(entry) {
        const imdbIdFile = entry.files.find((function(f) {
            return f.imdb_id;
        })), biggestFileWithName = entry.files.sort(((a, b) => b.length - a.length)).find((f => f.parsedName)), genericMeta = {
            id: entry.itemId,
            type: "other",
            name: biggestFileWithName && biggestFileWithName.parsedName || entry.name,
            showAsVideos: !0
        };
        return imdbIdFile ? (genericMeta.poster = consts.METAHUB_URL + "/poster/medium/" + imdbIdFile.imdb_id + "/img", 
        genericMeta.background = consts.METAHUB_URL + "/background/medium/" + imdbIdFile.imdb_id + "/img", 
        genericMeta.logo = consts.METAHUB_URL + "/logo/medium/" + imdbIdFile.imdb_id + "/img", 
        fetch(consts.CINEMETA_URL + "/meta/" + imdbIdFile.type + "/" + imdbIdFile.imdb_id + ".json").then((function(resp) {
            return resp.json();
        })).then((function(resp) {
            if (!resp || !resp.meta) throw "no meta found";
            const interestingFields = [ "imdb_id", "name", "genre", "director", "cast", "poster", "description", "trailers", "background", "logo", "imdbRating", "runtime", "genres", "releaseInfo" ];
            return Object.keys(resp.meta).forEach((key => interestingFields.includes(key) || delete resp.meta[key])), 
            Object.assign(resp.meta, {
                id: genericMeta.id,
                type: genericMeta.type
            }), resp.meta;
        })).catch((function(err) {
            return console.log("local-addon", imdbIdFile, err), genericMeta;
        }))) : Promise.resolve(genericMeta);
    };
}
