function(module, exports, __webpack_require__) {
    var dgram = __webpack_require__(69), bencode = __webpack_require__(164), isIP = __webpack_require__(42).isIP, dns = __webpack_require__(579), util = __webpack_require__(0), events = __webpack_require__(5), Buffer = __webpack_require__(90).Buffer, equals = __webpack_require__(112), ETIMEDOUT = new Error("Query timed out");
    ETIMEDOUT.code = "ETIMEDOUT";
    var EUNEXPECTEDNODE = new Error("Unexpected node id");
    function RPC(opts) {
        if (!(this instanceof RPC)) return new RPC(opts);
        opts || (opts = {});
        var self = this;
        this.timeout = opts.timeout || 2e3, this.inflight = 0, this.destroyed = !1, this.isIP = opts.isIP || isIP, 
        this.socket = opts.socket || dgram.createSocket("udp4"), this.socket.on("message", (function(buf, rinfo) {
            if (!self.destroyed && rinfo.port) {
                try {
                    var message = bencode.decode(buf);
                } catch (e) {
                    return self.emit("warning", e);
                }
                var type = message && message.y && message.y.toString();
                if ("r" === type || "e" === type) {
                    if (!Buffer.isBuffer(message.t)) return;
                    try {
                        var tid = message.t.readUInt16BE(0);
                    } catch (err) {
                        return self.emit("warning", err);
                    }
                    var index = self._ids.indexOf(tid);
                    if (-1 === index || 0 === tid) return self.emit("response", message, rinfo), void self.emit("warning", new Error("Unexpected transaction id: " + tid));
                    var req = self._reqs[index];
                    if (req.peer.host !== rinfo.address) return self.emit("response", message, rinfo), 
                    void self.emit("warning", new Error("Out of order response"));
                    if (self._ids[index] = 0, self._reqs[index] = null, self.inflight--, "e" === type) {
                        var isArray = Array.isArray(message.e), err = new Error(isArray ? message.e.join(" ") : "Unknown error");
                        return err.code = isArray && message.e.length && "number" == typeof message.e[0] ? message.e[0] : 0, 
                        req.callback(err, message, rinfo, req.message), self.emit("update"), void self.emit("postupdate");
                    }
                    var rid = message.r && message.r.id;
                    if (req.peer && req.peer.id && rid && !equals(req.peer.id, rid)) return req.callback(EUNEXPECTEDNODE, null, rinfo), 
                    self.emit("update"), void self.emit("postupdate");
                    req.callback(null, message, rinfo, req.message), self.emit("update"), self.emit("postupdate"), 
                    self.emit("response", message, rinfo);
                } else "q" === type ? self.emit("query", message, rinfo) : self.emit("warning", new Error("Unknown type: " + type));
            }
        })), this.socket.on("error", (function(err) {
            "EACCES" === err.code || "EADDRINUSE" === err.code ? self.emit("error", err) : self.emit("warning", err);
        })), this.socket.on("listening", (function() {
            self.emit("listening");
        })), this._tick = 0, this._ids = [], this._reqs = [], this._timer = setInterval((function() {
            var missing = self.inflight;
            if (missing) for (var i = 0; i < self._reqs.length; i++) {
                var req = self._reqs[i];
                if (req && (req.ttl ? req.ttl-- : self._cancel(i, ETIMEDOUT), !--missing)) return;
            }
        }), this.timeout / 4 | 0), events.EventEmitter.call(this);
    }
    function noop() {}
    EUNEXPECTEDNODE.code = "EUNEXPECTEDNODE", module.exports = RPC, util.inherits(RPC, events.EventEmitter), 
    RPC.prototype.address = function() {
        return this.socket.address();
    }, RPC.prototype.response = function(peer, req, res, cb) {
        this.send(peer, {
            t: req.t,
            y: "r",
            r: res
        }, cb);
    }, RPC.prototype.error = function(peer, req, error, cb) {
        this.send(peer, {
            t: req.t,
            y: "e",
            e: [].concat(error.message || error)
        }, cb);
    }, RPC.prototype.send = function(peer, message, cb) {
        var buf = bencode.encode(message);
        this.socket.send(buf, 0, buf.length, peer.port, peer.address || peer.host, cb || noop);
    }, RPC.prototype.bind = function() {
        this.socket.bind.apply(this.socket, arguments);
    }, RPC.prototype.destroy = function(cb) {
        this.destroyed = !0, clearInterval(this._timer), cb && this.socket.on("close", cb);
        for (var i = 0; i < this._ids.length; i++) this._cancel(i);
        this.socket.close();
    }, RPC.prototype.query = function(peer, query, cb) {
        if (cb || (cb = noop), !this.isIP(peer.host)) return this._resolveAndQuery(peer, query, cb);
        var message = {
            t: Buffer.allocUnsafe(2),
            y: "q",
            q: query.q,
            a: query.a
        }, req = {
            ttl: 4,
            peer: peer,
            message: message,
            callback: cb
        };
        65535 === this._tick && (this._tick = 0);
        var tid = ++this._tick, free = this._ids.indexOf(0);
        for (-1 === free && (free = this._ids.push(0) - 1), this._ids[free] = tid; this._reqs.length < free; ) this._reqs.push(null);
        return this._reqs[free] = req, this.inflight++, message.t.writeUInt16BE(tid, 0), 
        this.send(peer, message), tid;
    }, RPC.prototype.cancel = function(tid, err) {
        var index = this._ids.indexOf(tid);
        index > -1 && this._cancel(index, err);
    }, RPC.prototype._cancel = function(index, err) {
        var req = this._reqs[index];
        this._ids[index] = 0, this._reqs[index] = null, req && (this.inflight--, req.callback(err || new Error("Query was cancelled"), null, req.peer), 
        this.emit("update"), this.emit("postupdate"));
    }, RPC.prototype._resolveAndQuery = function(peer, query, cb) {
        var self = this;
        dns.lookup(peer.host, (function(err, ip) {
            return err ? cb(err) : self.destroyed ? cb(new Error("k-rpc-socket is destroyed")) : void self.query({
                host: ip,
                port: peer.port
            }, query, cb);
        }));
    };
}
