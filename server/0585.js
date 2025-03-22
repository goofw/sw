function(module, exports, __webpack_require__) {
    module.exports = Client;
    var EventEmitter = __webpack_require__(5).EventEmitter, debug = __webpack_require__(8)("bittorrent-tracker"), inherits = __webpack_require__(6), once = __webpack_require__(34), parallel = __webpack_require__(586), uniq = __webpack_require__(114), url = __webpack_require__(7), common = __webpack_require__(50), HTTPTracker = __webpack_require__(589), UDPTracker = __webpack_require__(595), WebSocketTracker = __webpack_require__(597);
    function Client(peerId, port, torrent, opts) {
        var self = this;
        if (!(self instanceof Client)) return new Client(peerId, port, torrent, opts);
        EventEmitter.call(self), opts || (opts = {}), self.peerId = "string" == typeof peerId ? peerId : peerId.toString("hex"), 
        self.peerIdBuffer = new Buffer(self.peerId, "hex"), self._peerIdBinary = self.peerIdBuffer.toString("binary"), 
        self.infoHash = "string" == typeof torrent.infoHash ? torrent.infoHash : torrent.infoHash.toString("hex"), 
        self.infoHashBuffer = new Buffer(self.infoHash, "hex"), self._infoHashBinary = self.infoHashBuffer.toString("binary"), 
        self.torrentLength = torrent.length, self.destroyed = !1, self._port = port, self._rtcConfig = opts.rtcConfig, 
        self._wrtc = opts.wrtc, debug("new client %s", self.infoHash);
        var webrtcSupport = !!self._wrtc || "undefined" != typeof window, announce = "string" == typeof torrent.announce ? [ torrent.announce ] : null == torrent.announce ? [] : torrent.announce;
        announce = announce.map((function(announceUrl) {
            return "/" === (announceUrl = announceUrl.toString())[announceUrl.length - 1] && (announceUrl = announceUrl.substring(0, announceUrl.length - 1)), 
            announceUrl;
        })), announce = uniq(announce), self._trackers = announce.map((function(announceUrl) {
            var protocol = url.parse(announceUrl).protocol;
            return "http:" !== protocol && "https:" !== protocol || "function" != typeof HTTPTracker ? "udp:" === protocol && "function" == typeof UDPTracker ? new UDPTracker(self, announceUrl) : "ws:" !== protocol && "wss:" !== protocol || !webrtcSupport ? (process.nextTick((function() {
                var err = new Error("unsupported tracker protocol for " + announceUrl);
                self.emit("warning", err);
            })), null) : new WebSocketTracker(self, announceUrl) : new HTTPTracker(self, announceUrl);
        })).filter(Boolean);
    }
    inherits(Client, EventEmitter), Client.scrape = function(announceUrl, infoHash, cb) {
        cb = once(cb);
        var client = new Client(new Buffer("01234567890123456789"), 6881, {
            infoHash: Array.isArray(infoHash) ? infoHash[0] : infoHash,
            announce: [ announceUrl ]
        });
        client.once("error", cb);
        var len = Array.isArray(infoHash) ? infoHash.length : 1, results = {};
        client.on("scrape", (function(data) {
            if (len -= 1, results[data.infoHash] = data, 0 === len) {
                client.destroy();
                var keys = Object.keys(results);
                1 === keys.length ? cb(null, results[keys[0]]) : cb(null, results);
            }
        })), infoHash = Array.isArray(infoHash) ? infoHash.map((function(infoHash) {
            return new Buffer(infoHash, "hex");
        })) : new Buffer(infoHash, "hex"), client.scrape({
            infoHash: infoHash
        });
    }, Client.prototype.start = function(opts) {
        debug("send `start`"), (opts = this._defaultAnnounceOpts(opts)).event = "started", 
        this._announce(opts), this._trackers.forEach((function(tracker) {
            tracker.setInterval();
        }));
    }, Client.prototype.stop = function(opts) {
        debug("send `stop`"), (opts = this._defaultAnnounceOpts(opts)).event = "stopped", 
        this._announce(opts);
    }, Client.prototype.complete = function(opts) {
        debug("send `complete`"), opts || (opts = {}), null == opts.downloaded && null != this.torrentLength && (opts.downloaded = this.torrentLength), 
        (opts = this._defaultAnnounceOpts(opts)).event = "completed", this._announce(opts);
    }, Client.prototype.update = function(opts) {
        debug("send `update`"), (opts = this._defaultAnnounceOpts(opts)).event && delete opts.event, 
        this._announce(opts);
    }, Client.prototype._announce = function(opts) {
        this._trackers.forEach((function(tracker) {
            tracker.announce(opts);
        }));
    }, Client.prototype.scrape = function(opts) {
        debug("send `scrape`"), opts || (opts = {}), this._trackers.forEach((function(tracker) {
            tracker.scrape(opts);
        }));
    }, Client.prototype.setInterval = function(intervalMs) {
        debug("setInterval %d", intervalMs), this._trackers.forEach((function(tracker) {
            tracker.setInterval(intervalMs);
        }));
    }, Client.prototype.destroy = function(cb) {
        if (!this.destroyed) {
            this.destroyed = !0, debug("destroy");
            var tasks = this._trackers.map((function(tracker) {
                return function(cb) {
                    tracker.destroy(cb);
                };
            }));
            parallel(tasks, cb), this._trackers = [];
        }
    }, Client.prototype._defaultAnnounceOpts = function(opts) {
        return opts || (opts = {}), null == opts.numwant && (opts.numwant = common.DEFAULT_ANNOUNCE_PEERS), 
        null == opts.uploaded && (opts.uploaded = 0), null == opts.downloaded && (opts.downloaded = 0), 
        null == opts.left && null != this.torrentLength && (opts.left = this.torrentLength - opts.downloaded), 
        opts;
    };
}
