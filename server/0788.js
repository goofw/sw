function(module, exports, __webpack_require__) {
    var bncode = __webpack_require__(179), crypto = __webpack_require__(9), sha1 = function(buf) {
        return crypto.createHash("sha1").update(buf).digest("hex");
    };
    module.exports = function(torrent) {
        var encoded = !1;
        if (torrent.info && (encoded = bncode.encode(torrent.info), sha1(encoded) === torrent.infoHash)) return encoded;
        var info = {};
        return info.name = torrent.name || "", torrent.private && (info.private = 1), info.files = torrent.files.map((function(file) {
            return {
                length: file.length,
                path: (0 === file.path.indexOf(info.name) ? file.path.slice(info.name.length) : file.path).slice(1).split(/\\|\//)
            };
        })), info["piece length"] = torrent.pieceLength, info.pieces = Buffer.concat(torrent.pieces.map((function(buf) {
            return Buffer.from(buf, "hex");
        }))), encoded = bncode.encode(info), sha1(encoded) === torrent.infoHash ? encoded : torrent.files.length ? (delete info.files, 
        info.length = torrent.files[0].length, encoded = bncode.encode(info), sha1(encoded) === torrent.infoHash ? encoded : null) : null;
    };
}
