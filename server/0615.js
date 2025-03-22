function(module, exports, __webpack_require__) {
    module.exports = Swarm;
    var debug = __webpack_require__(8)("bittorrent-tracker"), randomIterate = __webpack_require__(616);
    function Swarm(infoHash, server) {
        this.peers = {}, this.complete = 0, this.incomplete = 0;
    }
    Swarm.prototype.announce = function(params, cb) {
        var peer = this.peers[params.addr || params.peer_id];
        if ("started" === params.event) this._onAnnounceStarted(params, peer); else if ("stopped" === params.event) this._onAnnounceStopped(params, peer); else if ("completed" === params.event) this._onAnnounceCompleted(params, peer); else {
            if ("update" !== params.event) return void cb(new Error("invalid event"));
            this._onAnnounceUpdate(params, peer);
        }
        cb(null, {
            complete: this.complete,
            incomplete: this.incomplete,
            peers: this._getPeers(params.numwant, params.peer_id, !!params.socket)
        });
    }, Swarm.prototype.scrape = function(params, cb) {
        cb(null, {
            complete: this.complete,
            incomplete: this.incomplete
        });
    }, Swarm.prototype._onAnnounceStarted = function(params, peer) {
        if (peer) return debug("unexpected `started` event from peer that is already in swarm"), 
        this._onAnnounceUpdate(params, peer);
        0 === params.left ? this.complete += 1 : this.incomplete += 1, peer = this.peers[params.addr || params.peer_id] = {
            complete: 0 === params.left,
            peerId: params.peer_id,
            ip: params.ip,
            port: params.port,
            socket: params.socket
        };
    }, Swarm.prototype._onAnnounceStopped = function(params, peer) {
        peer ? (peer.complete ? this.complete -= 1 : this.incomplete -= 1, this.peers[params.addr || params.peer_id] = null) : debug("unexpected `stopped` event from peer that is not in swarm");
    }, Swarm.prototype._onAnnounceCompleted = function(params, peer) {
        if (!peer) return debug("unexpected `completed` event from peer that is not in swarm"), 
        this._onAnnounceStarted(params, peer);
        peer.complete ? debug("unexpected `completed` event from peer that is already marked as completed") : (this.complete += 1, 
        this.incomplete -= 1, peer.complete = !0);
    }, Swarm.prototype._onAnnounceUpdate = function(params, peer) {
        if (!peer) return debug("unexpected `update` event from peer that is not in swarm"), 
        this._onAnnounceStarted(params, peer);
        peer.complete || 0 !== params.left || (this.complete += 1, this.incomplete -= 1, 
        peer.complete = !0);
    }, Swarm.prototype._getPeers = function(numwant, ownPeerId, isWebRTC) {
        for (var peerId, peers = [], ite = randomIterate(Object.keys(this.peers)); (peerId = ite()) && peers.length < numwant; ) {
            var peer = this.peers[peerId];
            peer && (isWebRTC && peer.peerId === ownPeerId || isWebRTC && peer.ip || !isWebRTC && peer.socket || peers.push(peer));
        }
        return peers;
    };
}
