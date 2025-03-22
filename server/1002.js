function(module, exports, __webpack_require__) {
    const bencode = __webpack_require__(1003), blobToBuffer = __webpack_require__(1006), fs = __webpack_require__(2), get = __webpack_require__(376), magnet = __webpack_require__(1007), path = __webpack_require__(4), sha1 = __webpack_require__(165), uniq = __webpack_require__(114);
    function parseTorrent(torrentId) {
        if ("string" == typeof torrentId && /^(stream-)?magnet:/.test(torrentId)) return magnet(torrentId);
        if ("string" == typeof torrentId && (/^[a-f0-9]{40}$/i.test(torrentId) || /^[a-z2-7]{32}$/i.test(torrentId))) return magnet(`magnet:?xt=urn:btih:${torrentId}`);
        if (Buffer.isBuffer(torrentId) && 20 === torrentId.length) return magnet(`magnet:?xt=urn:btih:${torrentId.toString("hex")}`);
        if (Buffer.isBuffer(torrentId)) return (function(torrent) {
            Buffer.isBuffer(torrent) && (torrent = bencode.decode(torrent)), ensure(torrent.info, "info"), 
            ensure(torrent.info["name.utf-8"] || torrent.info.name, "info.name"), ensure(torrent.info["piece length"], "info['piece length']"), 
            ensure(torrent.info.pieces, "info.pieces"), torrent.info.files ? torrent.info.files.forEach((file => {
                ensure("number" == typeof file.length, "info.files[0].length"), ensure(file["path.utf-8"] || file.path, "info.files[0].path");
            })) : ensure("number" == typeof torrent.info.length, "info.length");
            const result = {
                info: torrent.info,
                infoBuffer: bencode.encode(torrent.info),
                name: (torrent.info["name.utf-8"] || torrent.info.name).toString(),
                announce: []
            };
            result.infoHash = sha1.sync(result.infoBuffer), result.infoHashBuffer = Buffer.from(result.infoHash, "hex"), 
            void 0 !== torrent.info.private && (result.private = !!torrent.info.private), torrent["creation date"] && (result.created = new Date(1e3 * torrent["creation date"])), 
            torrent["created by"] && (result.createdBy = torrent["created by"].toString()), 
            Buffer.isBuffer(torrent.comment) && (result.comment = torrent.comment.toString()), 
            Array.isArray(torrent["announce-list"]) && torrent["announce-list"].length > 0 ? torrent["announce-list"].forEach((urls => {
                urls.forEach((url => {
                    result.announce.push(url.toString());
                }));
            })) : torrent.announce && result.announce.push(torrent.announce.toString()), Buffer.isBuffer(torrent["url-list"]) && (torrent["url-list"] = torrent["url-list"].length > 0 ? [ torrent["url-list"] ] : []), 
            result.urlList = (torrent["url-list"] || []).map((url => url.toString())), uniq(result.announce), 
            uniq(result.urlList);
            const files = torrent.info.files || [ torrent.info ];
            result.files = files.map(((file, i) => {
                const parts = [].concat(result.name, file["path.utf-8"] || file.path || []).map((p => p.toString()));
                return {
                    path: path.join.apply(null, [ path.sep ].concat(parts)).slice(1),
                    name: parts[parts.length - 1],
                    length: file.length,
                    offset: files.slice(0, i).reduce(sumLength, 0)
                };
            })), result.length = files.reduce(sumLength, 0);
            const lastFile = result.files[result.files.length - 1];
            return result.pieceLength = torrent.info["piece length"], result.lastPieceLength = (lastFile.offset + lastFile.length) % result.pieceLength || result.pieceLength, 
            result.pieces = (function(buf) {
                const pieces = [];
                for (let i = 0; i < buf.length; i += 20) pieces.push(buf.slice(i, i + 20).toString("hex"));
                return pieces;
            })(torrent.info.pieces), result;
        })(torrentId);
        if (torrentId && torrentId.infoHash) return torrentId.infoHash = torrentId.infoHash.toLowerCase(), 
        torrentId.announce || (torrentId.announce = []), "string" == typeof torrentId.announce && (torrentId.announce = [ torrentId.announce ]), 
        torrentId.urlList || (torrentId.urlList = []), torrentId;
        throw new Error("Invalid torrent identifier");
    }
    function sumLength(sum, file) {
        return sum + file.length;
    }
    function ensure(bool, fieldName) {
        if (!bool) throw new Error(`Torrent is missing required field: ${fieldName}`);
    }
    module.exports = parseTorrent, module.exports.remote = function(torrentId, cb) {
        let parsedTorrent;
        if ("function" != typeof cb) throw new Error("second argument must be a Function");
        try {
            parsedTorrent = parseTorrent(torrentId);
        } catch (err) {}
        function parseOrThrow(torrentBuf) {
            try {
                parsedTorrent = parseTorrent(torrentBuf);
            } catch (err) {
                return cb(err);
            }
            parsedTorrent && parsedTorrent.infoHash ? cb(null, parsedTorrent) : cb(new Error("Invalid torrent identifier"));
        }
        parsedTorrent && parsedTorrent.infoHash ? process.nextTick((() => {
            cb(null, parsedTorrent);
        })) : "undefined" != typeof Blob && torrentId instanceof Blob ? blobToBuffer(torrentId, ((err, torrentBuf) => {
            if (err) return cb(new Error(`Error converting Blob: ${err.message}`));
            parseOrThrow(torrentBuf);
        })) : "function" == typeof get && /^https?:/.test(torrentId) ? get.concat({
            url: torrentId,
            timeout: 3e4,
            headers: {
                "user-agent": "WebTorrent (https://webtorrent.io)"
            }
        }, ((err, res, torrentBuf) => {
            if (err) return cb(new Error(`Error downloading torrent: ${err.message}`));
            parseOrThrow(torrentBuf);
        })) : "function" == typeof fs.readFile && "string" == typeof torrentId ? fs.readFile(torrentId, ((err, torrentBuf) => {
            if (err) return cb(new Error("Invalid torrent identifier"));
            parseOrThrow(torrentBuf);
        })) : process.nextTick((() => {
            cb(new Error("Invalid torrent identifier"));
        }));
    }, module.exports.toMagnetURI = magnet.encode, module.exports.toTorrentFile = function(parsed) {
        const torrent = {
            info: parsed.info
        };
        return torrent["announce-list"] = (parsed.announce || []).map((url => (torrent.announce || (torrent.announce = url), 
        [ url = Buffer.from(url, "utf8") ]))), torrent["url-list"] = parsed.urlList || [], 
        void 0 !== parsed.private && (torrent.private = Number(parsed.private)), parsed.created && (torrent["creation date"] = parsed.created.getTime() / 1e3 | 0), 
        parsed.createdBy && (torrent["created by"] = parsed.createdBy), parsed.comment && (torrent.comment = parsed.comment), 
        bencode.encode(torrent);
    }, Buffer.alloc(0);
}
