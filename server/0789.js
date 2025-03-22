function(module, exports, __webpack_require__) {
    var bncode = __webpack_require__(179), crypto = __webpack_require__(9), EXTENSIONS_m_ut_metadata = 1;
    module.exports = function(engine, callback) {
        var metadataPieces = [];
        return function(wire) {
            var metadata = engine.metadata;
            wire.once("extended", (function(id, handshake) {
                if (handshake = bncode.decode(handshake), !id && handshake.m && void 0 !== handshake.m.ut_metadata) {
                    var channel = handshake.m.ut_metadata, size = handshake.metadata_size;
                    if (wire.on("extended", (function(id, ext) {
                        if (id === EXTENSIONS_m_ut_metadata) {
                            var delimiter, message, piece, metadata = engine.metadata;
                            try {
                                delimiter = ext.toString("ascii").indexOf("ee"), piece = (message = bncode.decode(ext.slice(0, -1 === delimiter ? ext.length : delimiter + 2))).piece;
                            } catch (err) {
                                return;
                            }
                            if (!(piece < 0) && 2 !== message.msg_type) if (0 !== message.msg_type) {
                                if (1 === message.msg_type && !metadata) {
                                    metadataPieces[piece] = ext.slice(delimiter + 2);
                                    for (var i = 0; 16384 * i < size; i++) if (!metadataPieces[i]) return;
                                    if (metadata = Buffer.concat(metadataPieces), engine.infoHash !== (data = metadata, 
                                    crypto.createHash("sha1").update(data).digest("hex"))) return metadataPieces = [], 
                                    void (metadata = null);
                                    callback(engine.metadata = metadata);
                                }
                                var data;
                            } else {
                                if (!metadata) return wire.extended(channel, {
                                    msg_type: 2,
                                    piece: piece
                                });
                                var offset = 16384 * piece, buf = metadata.slice(offset, offset + 16384);
                                wire.extended(channel, Buffer.concat([ bncode.encode({
                                    msg_type: 1,
                                    piece: piece
                                }), buf ]));
                            }
                        }
                    })), !(size > 4194304) && size && !metadata) for (var i = 0; 16384 * i < size; i++) metadataPieces[i] || wire.extended(channel, {
                        msg_type: 0,
                        piece: i
                    });
                }
            })), wire.peerExtensions.extended && wire.extended(0, metadata ? {
                m: {
                    ut_metadata: 1
                },
                metadata_size: metadata.length
            } : {
                m: {
                    ut_metadata: 1
                }
            });
        };
    };
}
