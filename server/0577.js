function(module, exports, __webpack_require__) {
    var socket = __webpack_require__(578), KBucket = __webpack_require__(580), equals = __webpack_require__(112), events = __webpack_require__(5), randombytes = __webpack_require__(113), util = __webpack_require__(0), Buffer = __webpack_require__(90).Buffer, BOOTSTRAP_NODES = [ {
        host: "router.bittorrent.com",
        port: 6881
    }, {
        host: "router.utorrent.com",
        port: 6881
    }, {
        host: "dht.transmissionbt.com",
        port: 6881
    } ];
    function RPC(opts) {
        if (!(this instanceof RPC)) return new RPC(opts);
        opts || (opts = {});
        var self = this;
        function addNode(data, peer) {
            data && isNodeId(data.id, self._idLength) && !self.nodes.get(data.id) && !equals(data.id, self.id) && self._addNode({
                id: data.id,
                host: peer.address || peer.host,
                port: peer.port,
                distance: 0
            });
        }
        this._idLength = opts.idLength || 20, this.id = (function(str) {
            if (Buffer.isBuffer(str)) return str;
            if (ArrayBuffer.isView(str)) return Buffer.from(str.buffer, str.byteOffset, str.byteLength);
            if ("string" == typeof str) return Buffer.from(str, "hex");
            throw new Error("Pass a buffer or a string");
        })(opts.id || opts.nodeId || randombytes(this._idLength)), this.socket = opts.krpcSocket || socket(opts), 
        this.bootstrap = (function(val) {
            return !1 === val ? [] : !0 === val ? BOOTSTRAP_NODES : [].concat(val || BOOTSTRAP_NODES).map(parsePeer);
        })(opts.nodes || opts.bootstrap), this.concurrency = opts.concurrency || 16, this.backgroundConcurrency = opts.backgroundConcurrency || this.concurrency / 4 | 0, 
        this.k = opts.k || 20, this.destroyed = !1, this.pending = [], this.nodes = null, 
        this.socket.setMaxListeners(0), this.socket.on("query", (function(query, peer) {
            addNode(query.a, peer), self.emit("query", query, peer);
        })), this.socket.on("response", (function(reply, peer) {
            addNode(reply.r, peer);
        })), this.socket.on("warning", (function(err) {
            self.emit("warning", err);
        })), this.socket.on("error", (function(err) {
            self.emit("error", err);
        })), this.socket.on("update", (function() {
            for (;self.pending.length && self.socket.inflight < self.concurrency; ) {
                var next = self.pending.shift();
                self.query(next[0], next[1], next[2]);
            }
        })), this.socket.on("listening", (function() {
            self.emit("listening");
        })), events.EventEmitter.call(this), this.clear();
    }
    function isNodeId(id, idLength) {
        return id && Buffer.isBuffer(id) && id.length === idLength;
    }
    function parseIp(buf, offset) {
        return buf[offset++] + "." + buf[offset++] + "." + buf[offset++] + "." + buf[offset++];
    }
    function parsePeer(peer) {
        return "string" == typeof peer ? {
            host: peer.split(":")[0],
            port: Number(peer.split(":")[1])
        } : peer;
    }
    function noop() {}
    module.exports = RPC, util.inherits(RPC, events.EventEmitter), RPC.prototype.response = function(node, query, response, nodes, cb) {
        "function" == typeof nodes && (cb = nodes, nodes = null), response.id || (response.id = this.id), 
        nodes && (response.nodes = (function(nodes, idLength) {
            for (var buf = Buffer.allocUnsafe(nodes.length * (idLength + 6)), ptr = 0, i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                if (isNodeId(node.id, idLength)) {
                    node.id.copy(buf, ptr), ptr += idLength;
                    for (var ip = (node.host || node.address).split("."), j = 0; j < 4; j++) buf[ptr++] = parseInt(ip[j] || 0, 10);
                    buf.writeUInt16BE(node.port, ptr), ptr += 2;
                }
            }
            return ptr === buf.length ? buf : buf.slice(0, ptr);
        })(nodes, this._idLength)), this.socket.response(node, query, response, cb);
    }, RPC.prototype.error = function(node, query, error, cb) {
        this.socket.error(node, query, error, cb);
    }, RPC.prototype.bind = function() {
        this.socket.bind.apply(this.socket, arguments);
    }, RPC.prototype.address = function() {
        return this.socket.address();
    }, RPC.prototype.queryAll = function(nodes, message, visit, cb) {
        message.a || (message.a = {}), message.a.id || (message.a.id = this.id);
        var stop = !1, missing = nodes.length, hits = 0, error = null;
        if (!missing) return cb(new Error("No nodes to query"), 0);
        for (var i = 0; i < nodes.length; i++) this.query(nodes[i], message, done);
        function done(err, res, peer) {
            err ? err.code >= 300 && err.code < 400 && (error = err) : hits++, err || stop || visit && !1 === visit(res, peer) && (stop = !0), 
            --missing || cb(hits ? null : error || new Error("All queries failed"), hits);
        }
    }, RPC.prototype.query = function(node, message, cb) {
        this.socket.inflight >= this.concurrency ? this.pending.push([ node, message, cb ]) : (message.a || (message.a = {}), 
        message.a.id || (message.a.id = this.id), node.token && (message.a.token = node.token), 
        this.socket.query(node, message, cb));
    }, RPC.prototype.destroy = function(cb) {
        this.destroyed = !0, this.socket.destroy(cb);
    }, RPC.prototype.clear = function() {
        var self = this;
        this.nodes = new KBucket({
            localNodeId: this.id,
            numberOfNodesPerKBucket: this.k,
            numberOfNodesToPing: this.concurrency
        }), this.nodes.on("ping", (function(older, newer) {
            self.emit("ping", older, newer);
        }));
    }, RPC.prototype.populate = function(target, message, cb) {
        this._closest(target, message, !0, null, cb);
    }, RPC.prototype.closest = function(target, message, visit, cb) {
        this._closest(target, message, !1, visit, cb);
    }, RPC.prototype._addNode = function(node) {
        var old = this.nodes.get(node.id);
        this.nodes.add(node), old || this.emit("node", node);
    }, RPC.prototype._closest = function(target, message, background, visit, cb) {
        cb || (cb = noop);
        var self = this, count = 0, queried = {}, pending = 0, once = !0, stop = !1;
        message.a || (message.a = {}), message.a.id || (message.a.id = this.id);
        var table = new KBucket({
            localNodeId: target,
            numberOfNodesPerKBucket: this.k,
            numberOfNodesToPing: this.concurrency
        }), evt = background ? "postupdate" : "update";
        function kick() {
            if (!(self.destroyed || self.socket.inflight >= self.concurrency)) {
                var otherInflight = self.pending.length + self.socket.inflight - pending;
                if (!(background && self.socket.inflight >= self.backgroundConcurrency && otherInflight)) {
                    var closest = table.closest(target, self.k);
                    (!closest.length || closest.length < self.bootstrap.length) && (!(closest = self.nodes.closest(target, self.k)).length || closest.length < self.bootstrap.length) && once && (once = !1, 
                    self.bootstrap.forEach((function(peer) {
                        pending++, self.socket.query(peer, message, afterQuery);
                    })));
                    for (var i = 0; i < closest.length && !stop; i++) {
                        if (self.socket.inflight >= self.concurrency) return;
                        var peer = closest[i], id = peer.host + ":" + peer.port;
                        queried[id] || (queried[id] = !0, pending++, self.socket.query(peer, message, afterQuery));
                    }
                    pending || (self.socket.removeListener(evt, kick), process.nextTick(done));
                }
            }
        }
        function done() {
            cb(null, count);
        }
        function afterQuery(err, res, peer) {
            pending--, peer && (queried[(peer.address || peer.host) + ":" + peer.port] = !0), 
            peer && peer.id && self.nodes.get(peer.id) && (!err || "EUNEXPECTEDNODE" !== err.code && "ETIMEDOUT" !== err.code || self.nodes.remove(peer.id));
            var r = res && res.r;
            if (!r) return kick();
            !err && isNodeId(r.id, self._idLength) && (count++, add({
                id: r.id,
                port: peer.port,
                host: peer.host || peer.address,
                distance: 0
            }));
            for (var nodes = r.nodes ? (function(buf, idLength) {
                var contacts = [];
                try {
                    for (var i = 0; i < buf.length; i += idLength + 6) {
                        var port = buf.readUInt16BE(i + (idLength + 4));
                        port && contacts.push({
                            id: buf.slice(i, i + idLength),
                            host: parseIp(buf, i + idLength),
                            port: port,
                            distance: 0,
                            token: null
                        });
                    }
                } catch (err) {}
                return contacts;
            })(r.nodes, self._idLength) : [], i = 0; i < nodes.length; i++) add(nodes[i]);
            visit && !1 === visit(res, peer) && (stop = !0), kick();
        }
        function add(node) {
            equals(node.id, self.id) || table.add(node);
        }
        this.socket.on(evt, kick), kick();
    };
}
