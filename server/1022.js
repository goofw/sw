function(module, exports) {
    var movieKeywords = [ "1080p", "720p", "480p", "blurayrip", "brrip", "divx", "dvdrip", "hdrip", "hdtv", "tvrip", "xvid", "camrip" ], excluded = {};
    movieKeywords.forEach((function(x) {
        excluded[x] = 1;
    }));
    var SEGMENTS_SPLIT = /\.| |-|;|_/g;
    module.exports = function(filePath, options) {
        options = options || {};
        var meta = {}, segments = filePath.replace(/\\/g, "/").split("/").reverse().filter((function(x) {
            return x;
        })).slice(0, 3), firstNameSplit = segments[0].split(/\.| |_/);
        function saneSeason() {
            return meta.hasOwnProperty("season") && !isNaN(meta.season);
        }
        function saneEpisode() {
            return Array.isArray(meta.episode) && meta.episode.length;
        }
        [ segments[0], segments[1] ].filter((function(x) {
            return x;
        })).forEach((function(seg) {
            for (var matches, regex = /\b\d{4}\b/g; matches = regex.exec(seg); ) {
                var number = parseInt(matches[0], 10);
                number >= 1900 && number <= 2030 && (meta.year = number);
            }
        }));
        var pad = function(x) {
            return ("00" + x).slice(-2);
        };
        [ segments[0], segments[1] ].filter((function(x) {
            return x;
        })).forEach((function(seg) {
            var aired = seg.match(/(\d\d\d\d)(\.|-| )(\d\d)(\.|-| )(\d\d)/);
            if (aired && aired[1]) {
                var year = parseInt(aired[1], 10);
                year >= 1900 && year <= 2030 && (meta.aired = [ year, pad(aired[3]), pad(aired[5]) ].join("-"));
            }
        })), [ segments[0], segments[1] ].forEach((function(seg) {
            seg && seg.split(/\.| |_/).forEach((function(x, i) {
                var seasonMatch = x.match(/S(\d{1,2})/i);
                seasonMatch && (meta.season = parseInt(seasonMatch[1], 10));
                var episodeMatch = x.match(/E(\d{2})/gi);
                episodeMatch && (meta.episode = episodeMatch.map((function(y) {
                    return parseInt(y.slice(1), 10);
                })));
                var xStampMatch = x.match(/(\d\d?)x(\d\d?)/i);
                xStampMatch && (meta.season = parseInt(xStampMatch[1], 10), meta.episode = [ parseInt(xStampMatch[2], 10) ]);
            }));
            var fullMatch = seg && seg.replace(/\.| |;|_/g, " ").match(/^([a-zA-Z0-9,-?!'& ]*) S(\d{1,2})E(\d{2})/i);
            !meta.name && meta.season && meta.episode && fullMatch && fullMatch[1] && (meta.name = fullMatch[1]);
        }));
        var dotStampMatch = segments[0].match(/[^\da-zA-Z](\d\d?)\.(\d\d?)[^\da-zA-Z]/i);
        if (saneSeason() && saneEpisode() || !dotStampMatch || meta.year || (meta.season = parseInt(dotStampMatch[1], 10), 
        meta.episode = [ parseInt(dotStampMatch[2], 10) ]), !(saneSeason() && saneEpisode() || options.strict)) {
            var stamp = firstNameSplit.reverse().map((function(x) {
                return x.match(new RegExp("\\d\\d\\d\\d?e")) && (x = x.slice(0, -1)), x.match(new RegExp("s\\d\\d\\d\\d?")) && (x = x.slice(1)), 
                x;
            })).filter((function(x) {
                return !isNaN(x) && (3 == x.length || !meta.year && 4 == x.length);
            }))[0];
            stamp && (!meta.year || meta.year && firstNameSplit.indexOf(stamp.toString()) < firstNameSplit.indexOf(meta.year.toString())) && (meta.episode = [ parseInt(stamp.slice(-2), 10) ], 
            meta.season = parseInt(stamp.slice(0, -2), 10));
        }
        if (!saneSeason()) {
            var seasonMatch = segments.join("/").match(/season(\.| )?(\d{1,2})/gi);
            seasonMatch && (meta.season = parseInt(seasonMatch[0].match(/\d/g).join(""), 10));
            var seasonEpMatch = segments.join("/").match(/Season (\d{1,2}) - (\d{1,2})/i);
            seasonEpMatch && (meta.season = parseInt(seasonEpMatch[1], 10), meta.episode = [ parseInt(seasonEpMatch[2], 10) ]);
        }
        if (!saneEpisode()) {
            var episodeMatch = segments.join("/").match(/ep(isode)?(\.| )?(\d+)/gi);
            episodeMatch && (meta.episode = [ parseInt(episodeMatch[0].match(/\d/g).join(""), 10) ]);
        }
        var isSample, canBeMovie, diskNumberMatch = segments[0].match(/[ _.-]*(?:cd|dvd|p(?:ar)?t|dis[ck]|d)[ _.-]*(\d)[^\d]/);
        return diskNumberMatch && (meta.diskNumber = parseInt(diskNumberMatch[1], 10)), 
        (options.fromInside ? segments : [].concat(segments).reverse()).forEach((function(seg, i) {
            if (seg == segments[0]) {
                var sourcePrefix = (seg = seg.split(".").slice(0, -1).join(".")).match(/^\[(.*?)\]/);
                sourcePrefix && (seg = seg.slice(sourcePrefix[0].length));
            }
            var squareBracket = seg.indexOf("[");
            squareBracket > -1 && (seg = seg.slice(0, squareBracket));
            var segSplit = seg.split(SEGMENTS_SPLIT), nameParts = [];
            isSample = isSample || seg.match(/^sample/i) || seg.match(/^etrg/i), meta.name || (segSplit.some((function(word, i) {
                if (!(word.match("^[a-zA-Z,?!'&]*$") || !isNaN(word) && word.length <= 2 || !isNaN(word) && 0 == i) || excluded[word.toLowerCase()] || [ "ep", "episode", "season" ].indexOf(word.toLowerCase()) > -1 && !isNaN(segSplit[i + 1])) return !0;
                nameParts.push(word);
            })), (1 != nameParts.length || isNaN(nameParts[0])) && (meta.name = nameParts.filter((function(x) {
                return x && x.length > 0;
            })).map((function(x) {
                return x[0].toUpperCase() + x.slice(1).toLowerCase();
            })).join(" ")));
        })), isSample = isSample || "sample" == (segments[1] || "").toLowerCase(), canBeMovie = options.strict ? meta.hasOwnProperty("year") : meta.hasOwnProperty("year") || meta.hasOwnProperty("diskNumber") || movieKeywords.some((function(keyword) {
            return segments.join("/").toLowerCase().search(keyword) > -1;
        })), meta.name && meta.aired && (meta.type = "series"), meta.name && saneSeason() && saneEpisode() ? meta.type = "series" : meta.name && canBeMovie ? meta.type = "movie" : "movie" != meta.type && meta.name && saneSeason() ? meta.type = "extras" : meta.type = "other", 
        options.fileLength && options.fileLength < 1024 * (meta.type.match(/movie/) ? 80 : 50) * 1024 && meta.type.match(/movie|series/) && !isSample && (meta.type = "other"), 
        ("series" != meta.type || meta.aired) && (delete meta.episode, delete meta.season), 
        "series" == meta.type && meta.year && (meta.aired = meta.aired || meta.year, delete meta.year), 
        meta.type += isSample ? "-sample" : "", meta.name = meta.name && meta.name.toLowerCase().trim().replace(/\([^\(]+\)$/, "").replace(/&/g, "and").replace(/[^0-9a-z ]+/g, " ").split(" ").filter((function(r) {
            return r;
        })).join(" "), options.hints && options.hints.imdb_id && (meta.imdb_id = options.hints.imdb_id), 
        meta.tag = [], filePath.match(/1080p/i) && (meta.tag.push("hd"), meta.tag.push("1080p")), 
        filePath.match(/720p/i) && meta.tag.push("720p"), filePath.match(/480p/i) && meta.tag.push("480p"), 
        isSample && meta.tag.push("sample"), meta;
    };
}
