function(module, exports, __webpack_require__) {
    module.exports = WebSocketTracker;
    var debug = __webpack_require__(8)("bittorrent-tracker:websocket-tracker"), hat = __webpack_require__(91), inherits = __webpack_require__(6), Peer = __webpack_require__(598), Socket = __webpack_require__(600), common = __webpack_require__(50), Tracker = __webpack_require__(167), socketPool = {};
    function WebSocketTracker(client, announceUrl, opts) {
        Tracker.call(this, client, announceUrl), debug("new websocket tracker %s", announceUrl), 
        this.peers = {}, this.socket = null, this.reconnecting = !1, this._openSocket();
    }
    function noop() {}
    inherits(WebSocketTracker, Tracker), WebSocketTracker.prototype.DEFAULT_ANNOUNCE_INTERVAL = 3e4, 
    WebSocketTracker.prototype.announce = function(opts) {
        var self = this;
        if (!self.destroyed && !self.reconnecting) {
            if (!self.socket.connected) return self.socket.once("connect", self.announce.bind(self, opts));
            var numwant = Math.min(opts.numwant, 10);
            self._generateOffers(numwant, (function(offers) {
                var params = {
                    numwant: numwant,
                    uploaded: opts.uploaded || 0,
                    downloaded: opts.downloaded,
                    event: opts.event,
                    info_hash: self.client._infoHashBinary,
                    peer_id: self.client._peerIdBinary,
                    offers: offers
                };
                self._trackerId && (params.trackerid = self._trackerId), self._send(params);
            }));
        }
    }, WebSocketTracker.prototype.scrape = function(opts) {
        this.destroyed || this.reconnecting || this._onSocketError(new Error("scrape not supported " + this.announceUrl));
    }, WebSocketTracker.prototype.destroy = function(onclose) {
        if (!this.destroyed) {
            this.destroyed = !0, clearInterval(this.interval), socketPool[this.announceUrl] = null, 
            this.socket.removeListener("connect", this._onSocketConnectBound), this.socket.removeListener("data", this._onSocketDataBound), 
            this.socket.removeListener("close", this._onSocketCloseBound), this.socket.removeListener("error", this._onSocketErrorBound), 
            this._onSocketConnectBound = null, this._onSocketErrorBound = null, this._onSocketDataBound = null, 
            this._onSocketCloseBound = null, this.socket.on("error", noop);
            try {
                this.socket.destroy(onclose);
            } catch (err) {
                onclose && onclose();
            }
            this.socket = null;
        }
    }, WebSocketTracker.prototype._openSocket = function() {
        this.destroyed = !1, this._onSocketConnectBound = this._onSocketConnect.bind(this), 
        this._onSocketErrorBound = this._onSocketError.bind(this), this._onSocketDataBound = this._onSocketData.bind(this), 
        this._onSocketCloseBound = this._onSocketClose.bind(this), this.socket = socketPool[this.announceUrl], 
        this.socket || (this.socket = socketPool[this.announceUrl] = new Socket(this.announceUrl), 
        this.socket.on("connect", this._onSocketConnectBound)), this.socket.on("data", this._onSocketDataBound), 
        this.socket.on("close", this._onSocketCloseBound), this.socket.on("error", this._onSocketErrorBound);
    }, WebSocketTracker.prototype._onSocketConnect = function() {
        this.destroyed || this.reconnecting && (this.reconnecting = !1, this.announce(this.client._defaultAnnounceOpts()));
    }, WebSocketTracker.prototype._onSocketData = function(data) {
        var self = this;
        if (!self.destroyed) {
            if ("object" != typeof data || null === data) return self.client.emit("warning", new Error("Invalid tracker response"));
            if (data.info_hash === self.client._infoHashBinary) {
                if (!data.peer_id || data.peer_id !== self.client._peerIdBinary) {
                    debug("received %s from %s for %s", JSON.stringify(data), self.announceUrl, self.client.infoHash);
                    var failure = data["failure reason"];
                    if (failure) return self.client.emit("warning", new Error(failure));
                    var warning = data["warning message"];
                    warning && self.client.emit("warning", new Error(warning));
                    var interval = data.interval || data["min interval"];
                    interval && self.setInterval(1e3 * interval);
                    var peer, trackerId = data["tracker id"];
                    if (trackerId && (self._trackerId = trackerId), data.complete && self.client.emit("update", {
                        announce: self.announceUrl,
                        complete: data.complete,
                        incomplete: data.incomplete
                    }), data.offer && data.peer_id && (debug("creating peer (from remote offer)"), (peer = new Peer({
                        trickle: !1,
                        config: self.client._rtcConfig,
                        wrtc: self.client._wrtc
                    })).id = common.binaryToHex(data.peer_id), peer.once("signal", (function(answer) {
                        var params = {
                            info_hash: self.client._infoHashBinary,
                            peer_id: self.client._peerIdBinary,
                            to_peer_id: data.peer_id,
                            answer: answer,
                            offer_id: data.offer_id
                        };
                        self._trackerId && (params.trackerid = self._trackerId), self._send(params);
                    })), peer.signal(data.offer), self.client.emit("peer", peer)), data.answer && data.peer_id) {
                        var offerId = common.binaryToHex(data.offer_id);
                        (peer = self.peers[offerId]) ? (peer.id = common.binaryToHex(data.peer_id), peer.signal(data.answer), 
                        self.client.emit("peer", peer), clearTimeout(peer.trackerTimeout), peer.trackerTimeout = null, 
                        self.peers[offerId] = null) : debug("got unexpected answer: " + JSON.stringify(data.answer));
                    }
                }
            } else debug("ignoring websocket data from %s for %s (looking for %s: reused socket)", self.announceUrl, common.binaryToHex(data.info_hash), self.client.infoHash);
        }
    }, WebSocketTracker.prototype._onSocketClose = function() {
        this.destroyed || (this.destroy(), this._startReconnectTimer());
    }, WebSocketTracker.prototype._onSocketError = function(err) {
        this.destroyed || (this.destroy(), this.client.emit("warning", err), this._startReconnectTimer());
    }, WebSocketTracker.prototype._startReconnectTimer = function() {
        var self = this, ms = Math.floor(3e4 * Math.random()) + 5e3;
        self.reconnecting = !0;
        var reconnectTimer = setTimeout((function() {
            self._openSocket();
        }), ms);
        reconnectTimer.unref && reconnectTimer.unref(), debug("reconnecting socket in %s ms", ms);
    }, WebSocketTracker.prototype._send = function(params) {
        if (!this.destroyed) {
            var message = JSON.stringify(params);
            debug("send %s", message), this.socket.send(message);
        }
    }, WebSocketTracker.prototype._generateOffers = function(numwant, cb) {
        var self = this, offers = [];
        debug("generating %s offers", numwant);
        for (var i = 0; i < numwant; ++i) generateOffer();
        function generateOffer() {
            var offerId = hat(160);
            debug("creating peer (from _generateOffers)");
            var peer = self.peers[offerId] = new Peer({
                initiator: !0,
                trickle: !1,
                config: self.client._rtcConfig,
                wrtc: self.client._wrtc
            });
            peer.once("signal", (function(offer) {
                offers.push({
                    offer: offer,
                    offer_id: common.hexToBinary(offerId)
                }), offers.length === numwant && (debug("generated %s offers", numwant), cb(offers));
            })), peer.trackerTimeout = setTimeout((function() {
                debug("tracker timeout: destroying peer"), peer.trackerTimeout = null, self.peers[offerId] = null, 
                peer.destroy();
            }), 5e4);
        }
    };
}
