function(module, exports, __webpack_require__) {
    module.exports = function(socket, params) {
        if ((params = JSON.parse(params)).action = common.ACTIONS.ANNOUNCE, params.socket = socket, 
        "string" != typeof params.info_hash || 20 !== params.info_hash.length) throw new Error("invalid info_hash");
        if (params.info_hash = common.binaryToHex(params.info_hash), "string" != typeof params.peer_id || 20 !== params.peer_id.length) throw new Error("invalid peer_id");
        if (params.peer_id = common.binaryToHex(params.peer_id), params.answer) {
            if ("string" != typeof params.to_peer_id || 20 !== params.to_peer_id.length) throw new Error("invalid `to_peer_id` (required with `answer`)");
            params.to_peer_id = common.binaryToHex(params.to_peer_id);
        }
        return params.left = Number(params.left) || 1 / 0, params.numwant = Math.min(Number(params.offers && params.offers.length) || 0, common.MAX_ANNOUNCE_PEERS), 
        params.compact = -1, params;
    };
    var common = __webpack_require__(50);
}
