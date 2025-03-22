function(module, exports, __webpack_require__) {
    module.exports = HTTPTracker;
    var bencode = __webpack_require__(257), compact2string = __webpack_require__(258), debug = __webpack_require__(8)("bittorrent-tracker:http-tracker"), get = __webpack_require__(593), inherits = __webpack_require__(6), common = __webpack_require__(50), Tracker = __webpack_require__(167), HTTP_SCRAPE_SUPPORT = /\/(announce)[^\/]*$/;
    function HTTPTracker(client, announceUrl, opts) {
        var m;
        Tracker.call(this, client, announceUrl), debug("new http tracker %s", announceUrl), 
        this.scrapeUrl = null, (m = this.announceUrl.match(HTTP_SCRAPE_SUPPORT)) && (this.scrapeUrl = this.announceUrl.slice(0, m.index) + "/scrape" + this.announceUrl.slice(m.index + 9));
    }
    inherits(HTTPTracker, Tracker), HTTPTracker.prototype.DEFAULT_ANNOUNCE_INTERVAL = 18e5, 
    HTTPTracker.prototype.announce = function(opts) {
        if (!this.destroyed) {
            var params = {
                numwant: opts.numwant,
                uploaded: opts.uploaded,
                downloaded: opts.downloaded,
                event: opts.event,
                compact: null == opts.compact ? 1 : opts.compact,
                info_hash: this.client._infoHashBinary,
                peer_id: this.client._peerIdBinary,
                port: this.client._port
            };
            this._trackerId && (params.trackerid = this._trackerId), this._request(this.announceUrl, params, this._onAnnounceResponse.bind(this));
        }
    }, HTTPTracker.prototype.scrape = function(opts) {
        if (!this.destroyed) if (this.scrapeUrl) {
            var params = {
                info_hash: Array.isArray(opts.infoHash) && opts.infoHash.length > 0 ? opts.infoHash.map((function(infoHash) {
                    return infoHash.toString("binary");
                })) : opts.infoHash && opts.infoHash.toString("binary") || this.client._infoHashBinary
            };
            this._request(this.scrapeUrl, params, this._onScrapeResponse.bind(this));
        } else this.client.emit("error", new Error("scrape not supported " + this.announceUrl));
    }, HTTPTracker.prototype.destroy = function(cb) {
        this.destroyed || (this.destroyed = !0, clearInterval(this.interval), cb(null));
    }, HTTPTracker.prototype._request = function(requestUrl, params, cb) {
        var self = this, u = requestUrl + (-1 === requestUrl.indexOf("?") ? "?" : "&") + common.querystringStringify(params);
        get.concat(u, (function(err, res, data) {
            if (!self.destroyed) {
                if (err) return self.client.emit("warning", err);
                if (200 !== res.statusCode) return self.client.emit("warning", new Error("Non-200 response code " + res.statusCode + " from " + self.announceUrl));
                if (!data || 0 === data.length) return self.client.emit("warning", new Error("Invalid tracker response from" + self.announceUrl));
                try {
                    data = bencode.decode(data);
                } catch (err) {
                    return self.client.emit("warning", new Error("Error decoding tracker response: " + err.message));
                }
                var failure = data["failure reason"];
                if (failure) return debug("failure from " + requestUrl + " (" + failure + ")"), 
                self.client.emit("warning", new Error(failure));
                var warning = data["warning message"];
                warning && (debug("warning from " + requestUrl + " (" + warning + ")"), self.client.emit("warning", new Error(warning))), 
                debug("response from " + requestUrl), cb(data);
            }
        }));
    }, HTTPTracker.prototype._onAnnounceResponse = function(data) {
        var self = this, interval = data.interval || data["min interval"];
        interval && self.setInterval(1e3 * interval);
        var addrs, trackerId = data["tracker id"];
        if (trackerId && (self._trackerId = trackerId), self.client.emit("update", {
            announce: self.announceUrl,
            complete: data.complete,
            incomplete: data.incomplete
        }), Buffer.isBuffer(data.peers)) {
            try {
                addrs = compact2string.multi(data.peers);
            } catch (err) {
                return self.client.emit("warning", err);
            }
            addrs.forEach((function(addr) {
                self.client.emit("peer", addr);
            }));
        } else Array.isArray(data.peers) && data.peers.forEach((function(peer) {
            self.client.emit("peer", peer.ip + ":" + peer.port);
        }));
        if (Buffer.isBuffer(data.peers6)) {
            try {
                addrs = compact2string.multi6(data.peers6);
            } catch (err) {
                return self.client.emit("warning", err);
            }
            addrs.forEach((function(addr) {
                self.client.emit("peer", addr);
            }));
        } else Array.isArray(data.peers6) && data.peers6.forEach((function(peer) {
            var ip = /^\[/.test(peer.ip) || !/:/.test(peer.ip) ? peer.ip : "[" + peer.ip + "]";
            self.client.emit("peer", ip + ":" + peer.port);
        }));
    }, HTTPTracker.prototype._onScrapeResponse = function(data) {
        var self = this;
        data = data.files || data.host || {};
        var keys = Object.keys(data);
        0 !== keys.length ? keys.forEach((function(infoHash) {
            var response = data[infoHash];
            self.client.emit("scrape", {
                announce: self.announceUrl,
                infoHash: common.binaryToHex(infoHash),
                complete: response.complete,
                incomplete: response.incomplete,
                downloaded: response.downloaded
            });
        })) : self.client.emit("warning", new Error("invalid scrape response"));
    };
}
