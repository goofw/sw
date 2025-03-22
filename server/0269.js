function(module, exports, __webpack_require__) {
    module.exports = decodeTorrentFile, module.exports.decode = decodeTorrentFile, module.exports.encode = function(parsed) {
        var torrent = {
            info: parsed.info
        };
        return torrent["announce-list"] = (parsed.announce || []).map((function(url) {
            return torrent.announce || (torrent.announce = url), [ url = Buffer.from(url, "utf8") ];
        })), torrent["url-list"] = parsed.urlList || [], parsed.created && (torrent["creation date"] = parsed.created.getTime() / 1e3 | 0), 
        parsed.createdBy && (torrent["created by"] = parsed.createdBy), parsed.comment && (torrent.comment = parsed.comment), 
        bencode.encode(torrent);
    };
    var bencode = __webpack_require__(164), path = __webpack_require__(4), sha1 = __webpack_require__(165), uniq = __webpack_require__(114);
    function decodeTorrentFile(torrent) {
        Buffer.isBuffer(torrent) && (torrent = bencode.decode(torrent)), ensure(torrent.info, "info"), 
        ensure(torrent.info["name.utf-8"] || torrent.info.name, "info.name"), ensure(torrent.info["piece length"], "info['piece length']"), 
        ensure(torrent.info.pieces, "info.pieces"), torrent.info.files ? torrent.info.files.forEach((function(file) {
            ensure("number" == typeof file.length, "info.files[0].length"), ensure(file["path.utf-8"] || file.path, "info.files[0].path");
        })) : ensure("number" == typeof torrent.info.length, "info.length");
        var result = {};
        result.info = torrent.info, result.infoBuffer = bencode.encode(torrent.info), result.infoHash = sha1.sync(result.infoBuffer), 
        result.infoHashBuffer = Buffer.from(result.infoHash, "hex"), result.name = (torrent.info["name.utf-8"] || torrent.info.name).toString(), 
        void 0 !== torrent.info.private && (result.private = !!torrent.info.private), torrent["creation date"] && (result.created = new Date(1e3 * torrent["creation date"])), 
        torrent["created by"] && (result.createdBy = torrent["created by"].toString()), 
        Buffer.isBuffer(torrent.comment) && (result.comment = torrent.comment.toString()), 
        result.announce = [], torrent["announce-list"] && torrent["announce-list"].length ? torrent["announce-list"].forEach((function(urls) {
            urls.forEach((function(url) {
                result.announce.push(url.toString());
            }));
        })) : torrent.announce && result.announce.push(torrent.announce.toString()), Buffer.isBuffer(torrent["url-list"]) && (torrent["url-list"] = torrent["url-list"].length > 0 ? [ torrent["url-list"] ] : []), 
        result.urlList = (torrent["url-list"] || []).map((function(url) {
            return url.toString();
        })), uniq(result.announce), uniq(result.urlList);
        var files = torrent.info.files || [ torrent.info ];
        result.files = files.map((function(file, i) {
            var parts = [].concat(result.name, file["path.utf-8"] || file.path || []).map((function(p) {
                return p.toString();
            }));
            return {
                path: path.join.apply(null, [ path.sep ].concat(parts)).slice(1),
                name: parts[parts.length - 1],
                length: file.length,
                offset: files.slice(0, i).reduce(sumLength, 0)
            };
        })), result.length = files.reduce(sumLength, 0);
        var lastFile = result.files[result.files.length - 1];
        return result.pieceLength = torrent.info["piece length"], result.lastPieceLength = (lastFile.offset + lastFile.length) % result.pieceLength || result.pieceLength, 
        result.pieces = (function(buf) {
            for (var pieces = [], i = 0; i < buf.length; i += 20) pieces.push(buf.slice(i, i + 20).toString("hex"));
            return pieces;
        })(torrent.info.pieces), result;
    }
    function sumLength(sum, file) {
        return sum + file.length;
    }
    function ensure(bool, fieldName) {
        if (!bool) throw new Error("Torrent is missing required field: " + fieldName);
    }
}
