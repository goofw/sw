function(module, exports, __webpack_require__) {
    var fetch = __webpack_require__(33), helpers = __webpack_require__(226), cinemetaUrls = {
        movie: "https://cinemeta.strem.io/stremioget/stremio/v1/q.json?b=eyJwYXJhbXMiOltudWxsLHt9XSwibWV0aG9kIjoibmFtZXMubW92aWUiLCJpZCI6MSwianNvbnJwYyI6IjIuMCJ9",
        series: "https://cinemeta.strem.io/stremioget/stremio/v1/q.json?b=eyJwYXJhbXMiOltudWxsLHt9XSwibWV0aG9kIjoibmFtZXMuc2VyaWVzIiwiaWQiOjEsImpzb25ycGMiOiIyLjAifQ=="
    };
    function indexEntry(entry) {
        entry.year && (entry.year = parseInt(entry.year.toString().split("-")[0]));
        var n = helpers.simplifyName(entry);
        meta[n] || (meta[n] = []), meta[n].push(entry), byImdb[entry.imdb_id] = entry;
    }
    var pulled = {
        movie: !1,
        series: !1
    }, meta = {}, byImdb = {};
    module.exports = function(query, cb) {
        function match() {
            var name = helpers.simplifyName(query);
            if (!name) return cb(null, null);
            var m = (meta[name] || []).find((function(match) {
                return match.type === query.type && ("movie" !== query.type || !query.hasOwnProperty("year") || helpers.yearSimilar(query.year, match.year));
            })), res = !!m && {
                id: m.imdb_id,
                name: m.name,
                year: m.year,
                type: m.type,
                yearRange: void 0,
                image: void 0,
                starring: void 0,
                similarity: void 0
            };
            return cb(null, res);
        }
        query.type && !pulled[query.type] && cinemetaUrls[query.type] ? fetch(cinemetaUrls[query.type]).then((function(resp) {
            return resp.json();
        })).then((function(resp) {
            return resp.result;
        })).then((function(res) {
            res.forEach(indexEntry), pulled[query.type] = 1;
        })).catch((function(e) {
            console.error(e);
        })).then((function() {
            match();
        })) : process.nextTick(match);
    };
}
