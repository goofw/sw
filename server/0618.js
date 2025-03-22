function(module, exports, __webpack_require__) {
    module.exports = function(msg, rinfo) {
        if (msg.length < 16) throw new Error("received packet is too short");
        var params = {
            connectionId: msg.slice(0, 8),
            action: msg.readUInt32BE(8),
            transactionId: msg.readUInt32BE(12)
        };
        if (!bufferEqual(params.connectionId, common.CONNECTION_ID)) throw new Error("received packet with invalid connection id");
        if (params.action === common.ACTIONS.CONNECT) ; else if (params.action === common.ACTIONS.ANNOUNCE) {
            if (params.info_hash = msg.slice(16, 36).toString("hex"), params.peer_id = msg.slice(36, 56).toString("hex"), 
            params.downloaded = fromUInt64(msg.slice(56, 64)), params.left = fromUInt64(msg.slice(64, 72)), 
            params.uploaded = fromUInt64(msg.slice(72, 80)), params.event = common.EVENT_IDS[msg.readUInt32BE(80)], 
            !params.event) throw new Error("invalid event");
            var ip = msg.readUInt32BE(84);
            params.ip = ip ? ipLib.toString(ip) : rinfo.address, params.key = msg.readUInt32BE(88), 
            params.numwant = Math.min(msg.readUInt32BE(92) || common.DEFAULT_ANNOUNCE_PEERS, common.MAX_ANNOUNCE_PEERS), 
            params.port = msg.readUInt16BE(96) || rinfo.port, params.addr = params.ip + ":" + params.port, 
            params.compact = 1;
        } else {
            if (params.action !== common.ACTIONS.SCRAPE) throw new Error("Invalid action in UDP packet: " + params.action);
            if ((msg.length - 16) % 20 != 0) throw new Error("invalid scrape message");
            params.info_hash = [];
            for (var i = 0, len = (msg.length - 16) / 20; i < len; i += 1) {
                var infoHash = msg.slice(16 + 20 * i, 36 + 20 * i).toString("hex");
                params.info_hash.push(infoHash);
            }
        }
        return params;
    };
    var bufferEqual = __webpack_require__(619), ipLib = __webpack_require__(116), common = __webpack_require__(50);
    function fromUInt64(buf) {
        var high = 0 | buf.readUInt32BE(0), low = 0 | buf.readUInt32BE(4);
        return 131072 * high + (low >= 0 ? low : 131072 + low);
    }
}
