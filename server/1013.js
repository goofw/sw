function(module, exports, __webpack_require__) {
    var needle = __webpack_require__(1014), helpers = __webpack_require__(226);
    module.exports = function imdbFind(task, cb, loose) {
        var shouldRetry = !loose && task.year, retry = function() {
            return shouldRetry ? imdbFind(task, cb, !0) : void cb(null, null);
        };
        !(function(searchTerm, cb) {
            var url = "https://sg.media-imdb.com/suggests/" + searchTerm.charAt(0).toLowerCase() + "/" + encodeURIComponent(searchTerm) + ".json";
            needle.get(url, (function(err, res) {
                if (!err && 200 == res.statusCode && res.body) {
                    var results = JSON.parse(res.body.toString().match(/{.*}/g)).d;
                    cb(!(!results || !results.length) && results, url);
                } else cb(!1);
            }));
        })(shouldRetry ? task.name + " " + task.year : task.name, (function(results, url) {
            results ? matchSimilar(results, (function(result) {
                result ? cb(null, result, {
                    match: url
                }) : retry();
            })) : retry();
        }));
        var matchSimilar = function(results, callback) {
            var pick, secondBest, firstResult;
            results.forEach((function(result) {
                if ((result || {}).id && result.id.match(/tt\d{7,8}/g)) {
                    var res = {
                        id: result.id,
                        name: result.l,
                        year: result.y,
                        type: result.q,
                        yearRange: result.yr,
                        image: result.i ? {
                            src: result.i[0],
                            width: result.i[1],
                            height: result.i[2]
                        } : void 0,
                        starring: result.s
                    }, movieMatch = "movie" == task.type && [ "feature", "TV special" ].indexOf(res.type) > -1, seriesMatch = "series" == task.type && [ "TV series", "TV mini-series" ].indexOf(res.type) > -1;
                    if ((!task.type || movieMatch || seriesMatch) && helpers.yearSimilar(task.year, res.year)) {
                        var similarity = helpers.nameSimilar(task.name, res.name);
                        similarity > .6 && (!pick || pick && similarity > pick.similarity) && ((pick = res).similarity = similarity), 
                        !secondBest && helpers.nameAlmostSimilar(task.name, res.name) && (secondBest = res), 
                        firstResult || task.strict || (firstResult = res);
                    }
                }
            })), secondBest && pick && (helpers.nameAlmostSimilar(task.name, pick.name) || (pick = secondBest)), 
            callback(pick || secondBest || firstResult || null);
        };
    };
}
