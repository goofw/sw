function(module, exports, __webpack_require__) {
    const parseTorrent = __webpack_require__(1002), fs = __webpack_require__(2), path = __webpack_require__(4), nameToImdb = __webpack_require__(1010), videoNameParser = __webpack_require__(1022), promisify = __webpack_require__(0).promisify, consts = __webpack_require__(79);
    function indexParsedTorrent(torrent, cb) {
        const ih = ((torrent = torrent || {}).infoHash || "").toLowerCase(), name = torrent.name, files = (torrent.files || []).map((function(f, i) {
            return f.idx = i, f;
        })).filter((function(x) {
            return x.path.match(consts.INTERESTING_FILE);
        }));
        if (!files.length) return void cb(null, {
            files: []
        });
        const procFile = promisify(processFile);
        Promise.all(files.map((f => procFile(f)))).then((function(processedFiles) {
            var t;
            cb(null, {
                itemId: "bt:" + ih,
                ih: ih,
                name: name,
                files: processedFiles,
                sources: torrent.announce ? (t = torrent, [ "dht:" + t.infoHash ].concat(t.announce.map((function(x) {
                    return "tracker:" + x;
                })))) : null
            });
        })).catch(cb);
    }
    function processFile(f, cb) {
        var parsed = videoNameParser(f.path, {
            strict: !0,
            fromInside: !0,
            fileLength: f.length
        });
        if (!consts.INTERESTING_TYPE.includes(parsed.type)) return cb(null, f);
        nameToImdb({
            name: parsed.name,
            year: parsed.year,
            type: parsed.type
        }, (function(err, imdbId) {
            imdbId && (f.parsedName = parsed.name, f.type = parsed.type, f.imdb_id = imdbId, 
            parsed.season && (f.season = parsed.season, f.episode = [].concat(parsed.episode).shift())), 
            cb(null, f);
        }));
    }
    module.exports = {
        indexFile: function(fPath, cb) {
            fPath.match(".torrent$") ? (function(fPath, cb) {
                fs.readFile(fPath, (function(err, buf) {
                    if (err) return cb(err);
                    let torrent;
                    try {
                        torrent = parseTorrent(buf);
                    } catch (e) {
                        return cb(e);
                    }
                    indexParsedTorrent(torrent, cb);
                }));
            })(fPath, cb) : fPath.match(consts.INTERESTING_FILE) ? fs.stat(fPath, (function(err, stat) {
                if (err) return cb(err);
                processFile({
                    path: fPath,
                    name: path.basename(fPath),
                    length: stat.size
                }, (function(err, f) {
                    return err ? cb(err) : f.imdb_id ? cb(null, {
                        dateModified: stat.mtime,
                        itemId: consts.PREFIX_LOCAL + f.imdb_id,
                        name: f.name,
                        files: [ f ]
                    }) : cb(null, {
                        files: []
                    });
                }));
            })) : cb(null, {
                files: []
            });
        },
        indexParsedTorrent: indexParsedTorrent
    };
}
