function(module, exports, __webpack_require__) {
    module.exports = UDPTracker;
    var BN = __webpack_require__(596), compact2string = __webpack_require__(258), debug = __webpack_require__(8)("bittorrent-tracker:udp-tracker"), dgram = __webpack_require__(69), hat = __webpack_require__(91), inherits = __webpack_require__(6), url = __webpack_require__(7), common = __webpack_require__(50), Tracker = __webpack_require__(167);
    function UDPTracker(client, announceUrl, opts) {
        Tracker.call(this, client, announceUrl), debug("new udp tracker %s", announceUrl), 
        this.cleanupFns = [];
    }
    function genTransactionId() {
        return new Buffer(hat(32), "hex");
    }
    function toUInt64(n) {
        if (n > 4294967295 || "string" == typeof n) {
            for (var bytes = new BN(n).toArray(); bytes.length < 8; ) bytes.unshift(0);
            return new Buffer(bytes);
        }
        return Buffer.concat([ common.toUInt32(0), common.toUInt32(n) ]);
    }
    function noop() {}
    inherits(UDPTracker, Tracker), UDPTracker.prototype.DEFAULT_ANNOUNCE_INTERVAL = 18e5, 
    UDPTracker.prototype.announce = function(opts) {
        this.destroyed || this._request(opts);
    }, UDPTracker.prototype.scrape = function(opts) {
        this.destroyed || (opts._scrape = !0, this._request(opts));
    }, UDPTracker.prototype.destroy = function(cb) {
        this.destroyed || (this.destroyed = !0, clearInterval(this.interval), this.cleanupFns.slice(0).forEach((function(cleanup) {
            cleanup();
        })), this.cleanupFns = [], cb(null));
    }, UDPTracker.prototype._request = function(opts) {
        var self = this;
        opts || (opts = {});
        var parsedUrl = url.parse(self.announceUrl), transactionId = genTransactionId(), socket = dgram.createSocket("udp4"), cleanup = function() {
            if (socket) {
                self.cleanupFns.splice(self.cleanupFns.indexOf(cleanup), 1), timeout && (clearTimeout(timeout), 
                timeout = null), socket.removeListener("error", onError), socket.removeListener("message", onSocketMessage), 
                socket.on("error", noop);
                try {
                    socket.close();
                } catch (err) {}
                socket = null;
            }
        };
        self.cleanupFns.push(cleanup);
        var ms = "stopped" === opts.event ? 1500 : 15e3, timeout = setTimeout((function() {
            timeout = null, "stopped" === opts.event ? cleanup() : onError(new Error("tracker request timed out (" + opts.event + ")"));
        }), ms);
        function onSocketMessage(msg) {
            if (!self.destroyed) {
                if (msg.length < 8 || msg.readUInt32BE(4) !== transactionId.readUInt32BE(0)) return onError(new Error("tracker sent invalid transaction id"));
                var action = msg.readUInt32BE(0);
                switch (debug("UDP response %s, action %s", self.announceUrl, action), action) {
                  case 0:
                    return msg.length < 16 ? onError(new Error("invalid udp handshake")) : void (opts._scrape ? (function(connectionId) {
                        transactionId = genTransactionId();
                        var infoHash = Array.isArray(opts.infoHash) && opts.infoHash.length > 0 ? Buffer.concat(opts.infoHash) : opts.infoHash || self.client.infoHashBuffer;
                        send(Buffer.concat([ connectionId, common.toUInt32(common.ACTIONS.SCRAPE), transactionId, infoHash ]));
                    })(msg.slice(8, 16)) : (function(connectionId, opts) {
                        var n, buf;
                        transactionId = genTransactionId(), send(Buffer.concat([ connectionId, common.toUInt32(common.ACTIONS.ANNOUNCE), transactionId, self.client.infoHashBuffer, self.client.peerIdBuffer, toUInt64(opts.downloaded), null != opts.left ? toUInt64(opts.left) : new Buffer("FFFFFFFFFFFFFFFF", "hex"), toUInt64(opts.uploaded), common.toUInt32(common.EVENTS[opts.event] || 0), common.toUInt32(0), common.toUInt32(0), common.toUInt32(opts.numwant), (n = self.client._port, 
                        buf = new Buffer(2), buf.writeUInt16BE(n, 0), buf) ]));
                    })(msg.slice(8, 16), opts));

                  case 1:
                    if (cleanup(), msg.length < 20) return onError(new Error("invalid announce message"));
                    var addrs, interval = msg.readUInt32BE(8);
                    interval && self.setInterval(1e3 * interval), self.client.emit("update", {
                        announce: self.announceUrl,
                        complete: msg.readUInt32BE(16),
                        incomplete: msg.readUInt32BE(12)
                    });
                    try {
                        addrs = compact2string.multi(msg.slice(20));
                    } catch (err) {
                        return self.client.emit("warning", err);
                    }
                    addrs.forEach((function(addr) {
                        self.client.emit("peer", addr);
                    }));
                    break;

                  case 2:
                    if (cleanup(), msg.length < 20 || (msg.length - 8) % 12 != 0) return onError(new Error("invalid scrape message"));
                    for (var infoHashes = Array.isArray(opts.infoHash) && opts.infoHash.length > 0 ? opts.infoHash.map((function(infoHash) {
                        return infoHash.toString("hex");
                    })) : [ opts.infoHash && opts.infoHash.toString("hex") || self.client.infoHash ], i = 0, len = (msg.length - 8) / 12; i < len; i += 1) self.client.emit("scrape", {
                        announce: self.announceUrl,
                        infoHash: infoHashes[i],
                        complete: msg.readUInt32BE(8 + 12 * i),
                        downloaded: msg.readUInt32BE(12 + 12 * i),
                        incomplete: msg.readUInt32BE(16 + 12 * i)
                    });
                    break;

                  case 3:
                    if (cleanup(), msg.length < 8) return onError(new Error("invalid error message"));
                    self.client.emit("warning", new Error(msg.slice(8).toString()));
                    break;

                  default:
                    onError(new Error("tracker sent invalid action"));
                }
            }
        }
        function onError(err) {
            self.destroyed || (cleanup(), err.message && (err.message += " (" + self.announceUrl + ")"), 
            self.client.emit("warning", err));
        }
        function send(message) {
            parsedUrl.port || (parsedUrl.port = 80), socket.send(message, 0, message.length, parsedUrl.port, parsedUrl.hostname);
        }
        timeout.unref && timeout.unref(), send(Buffer.concat([ common.CONNECTION_ID, common.toUInt32(common.ACTIONS.CONNECT), transactionId ])), 
        socket.on("error", onError), socket.on("message", onSocketMessage);
    };
}
