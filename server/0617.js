function(module, exports, __webpack_require__) {
    module.exports = function(req, opts) {
        opts || (opts = {});
        var s = req.url.split("?"), params = common.querystringParse(s[1]);
        if ("announce" === opts.action || "/announce" === s[0]) {
            if (params.action = common.ACTIONS.ANNOUNCE, "string" != typeof params.info_hash || 20 !== params.info_hash.length) throw new Error("invalid info_hash");
            if (params.info_hash = common.binaryToHex(params.info_hash), "string" != typeof params.peer_id || 20 !== params.peer_id.length) throw new Error("invalid peer_id");
            if (params.peer_id = common.binaryToHex(params.peer_id), params.port = Number(params.port), 
            !params.port) throw new Error("invalid port");
            params.left = Number(params.left) || 1 / 0, params.compact = Number(params.compact) || 0, 
            params.numwant = Math.min(Number(params.numwant) || common.DEFAULT_ANNOUNCE_PEERS, common.MAX_ANNOUNCE_PEERS), 
            params.ip = opts.trustProxy ? req.headers["x-forwarded-for"] || req.connection.remoteAddress : req.connection.remoteAddress.replace(REMOVE_IPV4_MAPPED_IPV6_RE, ""), 
            params.addr = (common.IPV6_RE.test(params.ip) ? "[" + params.ip + "]" : params.ip) + ":" + params.port;
        } else {
            if ("scrape" !== opts.action && "/scrape" !== s[0]) throw new Error("invalid action in HTTP request: " + req.url);
            params.action = common.ACTIONS.SCRAPE, "string" == typeof params.info_hash && (params.info_hash = [ params.info_hash ]), 
            Array.isArray(params.info_hash) && (params.info_hash = params.info_hash.map((function(binaryInfoHash) {
                if ("string" != typeof binaryInfoHash || 20 !== binaryInfoHash.length) throw new Error("invalid info_hash");
                return common.binaryToHex(binaryInfoHash);
            })));
        }
        return params;
    };
    var common = __webpack_require__(50), REMOVE_IPV4_MAPPED_IPV6_RE = /^::ffff:/;
}
