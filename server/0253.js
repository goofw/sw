function(module, exports, __webpack_require__) {
    module.exports = DHT;
    var bencode = __webpack_require__(164), Buffer = __webpack_require__(23).Buffer, debug = __webpack_require__(572)("bittorrent-dht"), equals = __webpack_require__(112), EventEmitter = __webpack_require__(5).EventEmitter, inherits = __webpack_require__(6), KBucket = __webpack_require__(576), krpc = __webpack_require__(577), LRU = __webpack_require__(581), randombytes = __webpack_require__(113), simpleSha1 = __webpack_require__(165);
    function DHT(opts) {
        if (!(this instanceof DHT)) return new DHT(opts);
        opts || (opts = {});
        var self = this;
        this._tables = LRU({
            maxAge: 3e5,
            max: opts.maxTables || 1e3
        }), this._values = LRU(opts.maxValues || 1e3), this._peers = new PeerStore(opts.maxPeers || 1e4), 
        this._secrets = null, this._hash = opts.hash || sha1, this._hashLength = this._hash(Buffer.from("")).length, 
        this._rpc = opts.krpc || krpc(Object.assign({
            idLength: this._hashLength
        }, opts)), this._rpc.on("query", (function(query, peer) {
            self._onquery(query, peer);
        })), this._rpc.on("node", (function(node) {
            self.emit("node", node);
        })), this._rpc.on("warning", (function(err) {
            self.emit("warning", err);
        })), this._rpc.on("error", (function(err) {
            self.emit("error", err);
        })), this._rpc.on("listening", (function() {
            self.listening = !0, self._debug("listening %d", self.address().port), self.emit("listening");
        })), this._rotateSecrets(), this._verify = opts.verify || null, this._host = opts.host || null, 
        this._interval = setInterval((function() {
            self._rotateSecrets();
        }), 3e5), this._runningBucketCheck = !1, this._bucketCheckTimeout = null, this._bucketOutdatedTimeSpan = opts.timeBucketOutdated || 9e5, 
        this.listening = !1, this.destroyed = !1, this.nodeId = this._rpc.id, this.nodes = this._rpc.nodes, 
        this.nodes.on("ping", (function(nodes, contact) {
            self._debug("received ping", nodes, contact), self._checkAndRemoveNodes(nodes, (function(_, removed) {
                removed && (self._debug("added new node:", contact), self.addNode(contact)), self._debug("no node added, all other nodes ok");
            }));
        })), process.nextTick((function() {
            self.destroyed || self._bootstrap(!1 !== opts.bootstrap);
        })), EventEmitter.call(this), this._debug("new DHT %s", this.nodeId);
    }
    function noop() {}
    function sha1(buf) {
        return Buffer.from(simpleSha1.sync(buf), "hex");
    }
    function createGetResponse(id, token, value) {
        var r = {
            id: id,
            token: token,
            v: value.v
        };
        return value.sig && (r.sig = value.sig, r.k = value.k, value.salt && (r.salt = value.salt), 
        "number" == typeof value.seq && (r.seq = value.seq)), r;
    }
    function parseIp(buf, offset) {
        return buf[offset++] + "." + buf[offset++] + "." + buf[offset++] + "." + buf[offset++];
    }
    function encodeSigData(msg) {
        var ref = {
            seq: msg.seq || 0,
            v: msg.v
        };
        return msg.salt && (ref.salt = msg.salt), bencode.encode(ref).slice(1, -1);
    }
    function toNode(node) {
        return {
            host: node.host,
            port: node.port
        };
    }
    function PeerStore(max) {
        this.max = max || 1e4, this.used = 0, this.peers = LRU(1 / 0);
    }
    function swap(list, a, b) {
        if (a !== b) {
            var tmp = list[a];
            list[a] = list[b], list[b] = tmp, list[a].index = a, list[b].index = b;
        }
    }
    function toBuffer(str) {
        if (Buffer.isBuffer(str)) return str;
        if ("string" == typeof str) return Buffer.from(str, "hex");
        throw new Error("Pass a buffer or a string");
    }
    inherits(DHT, EventEmitter), DHT.prototype._setBucketCheckInterval = function() {
        var self = this;
        function checkBucket() {
            if (Date.now() - self._rpc.nodes.metadata.lastChange < self._bucketOutdatedTimeSpan) return queueNext();
            self._pingAll((function() {
                self.destroyed || (self.nodes.toArray().length < 1 && self._bootstrap(!0), queueNext());
            }));
        }
        function queueNext() {
            if (self._runningBucketCheck && !self.destroyed) {
                var nextTimeout = Math.floor(6e4 * Math.random() + 3e4);
                self._bucketCheckTimeout = setTimeout(checkBucket, nextTimeout);
            }
        }
        this._runningBucketCheck = !0, queueNext();
    }, DHT.prototype._pingAll = function(cb) {
        this._checkAndRemoveNodes(this.nodes.toArray(), cb);
    }, DHT.prototype.removeBucketCheckInterval = function() {
        this._runningBucketCheck = !1, clearTimeout(this._bucketCheckTimeout);
    }, DHT.prototype.updateBucketTimestamp = function() {
        this._rpc.nodes.metadata.lastChange = Date.now();
    }, DHT.prototype._checkAndRemoveNodes = function(nodes, cb) {
        var self = this;
        this._checkNodes(nodes, (function(_, node) {
            node && self.removeNode(node.id), cb(null, node);
        }));
    }, DHT.prototype._checkNodes = function(nodes, cb) {
        var self = this;
        !(function test(acc) {
            if (!acc.length) return cb(null);
            var current = acc.pop();
            self._sendPing(current, (function(err) {
                if (!err) return self.updateBucketTimestamp(), test(acc);
                self._sendPing(current, (function(er) {
                    return err ? cb(null, current) : (self.updateBucketTimestamp(), test(acc));
                }));
            }));
        })(nodes);
    }, DHT.prototype.addNode = function(node) {
        var self = this;
        if (node.id) {
            node.id = toBuffer(node.id);
            var old = !!this._rpc.nodes.get(node.id);
            return this._rpc.nodes.add(node), void (old || (this.emit("node", node), this.updateBucketTimestamp()));
        }
        this._sendPing(node, (function(_, node) {
            node && self.addNode(node);
        }));
    }, DHT.prototype.removeNode = function(id) {
        this._rpc.nodes.remove(toBuffer(id));
    }, DHT.prototype._sendPing = function(node, cb) {
        var self = this, expectedId = node.id;
        this._rpc.query(node, {
            q: "ping"
        }, (function(err, pong, node) {
            return err ? cb(err) : pong.r && pong.r.id && Buffer.isBuffer(pong.r.id) && pong.r.id.length === self._hashLength ? Buffer.isBuffer(expectedId) && !expectedId.equals(pong.r.id) ? cb(new Error("Unexpected node id")) : (self.updateBucketTimestamp(), 
            void cb(null, {
                id: pong.r.id,
                host: node.host || node.address,
                port: node.port
            })) : cb(new Error("Bad reply"));
        }));
    }, DHT.prototype.toJSON = function() {
        var self = this, values = {};
        return Object.keys(this._values.cache).forEach((function(key) {
            var value = self._values.cache[key].value;
            values[key] = {
                v: value.v.toString("hex"),
                id: value.id.toString("hex")
            }, null != value.seq && (values[key].seq = value.seq), null != value.sig && (values[key].sig = value.sig.toString("hex")), 
            null != value.k && (values[key].k = value.k.toString("hex"));
        })), {
            nodes: this._rpc.nodes.toArray().map(toNode),
            values: values
        };
    }, DHT.prototype.put = function(opts, cb) {
        (Buffer.isBuffer(opts) || "string" == typeof opts) && (opts = {
            v: opts
        });
        var isMutable = !!opts.k;
        if (void 0 === opts.v) throw new Error("opts.v not given");
        if (opts.v.length >= 1e3) throw new Error("v must be less than 1000 bytes in put()");
        if (isMutable && void 0 !== opts.cas && "number" != typeof opts.cas) throw new Error("opts.cas must be an integer if provided");
        if (isMutable && !opts.k) throw new Error("opts.k ed25519 public key required for mutable put");
        if (isMutable && 32 !== opts.k.length) throw new Error("opts.k ed25519 public key must be 32 bytes");
        if (isMutable && "function" != typeof opts.sign && !Buffer.isBuffer(opts.sig)) throw new Error("opts.sign function or options.sig signature is required for mutable put");
        if (isMutable && opts.salt && opts.salt.length > 64) throw new Error("opts.salt is > 64 bytes long");
        if (isMutable && void 0 === opts.seq) throw new Error("opts.seq not provided for a mutable update");
        if (isMutable && "number" != typeof opts.seq) throw new Error("opts.seq not an integer");
        return this._put(opts, cb);
    }, DHT.prototype._put = function(opts, cb) {
        cb || (cb = noop);
        var isMutable = !!opts.k, v = "string" == typeof opts.v ? Buffer.from(opts.v) : opts.v, key = isMutable ? this._hash(opts.salt ? Buffer.concat([ opts.k, opts.salt ]) : opts.k) : this._hash(bencode.encode(v)), table = this._tables.get(key.toString("hex"));
        if (!table) return this._preput(key, opts, cb);
        var message = {
            q: "put",
            a: {
                id: this._rpc.id,
                token: null,
                v: v
            }
        };
        return isMutable && ("number" == typeof opts.cas && (message.a.cas = opts.cas), 
        opts.salt && (message.a.salt = opts.salt), message.a.k = opts.k, message.a.seq = opts.seq, 
        "function" == typeof opts.sign ? message.a.sig = opts.sign(encodeSigData(message.a)) : Buffer.isBuffer(opts.sig) && (message.a.sig = opts.sig)), 
        this._values.set(key.toString("hex"), message.a), this._rpc.queryAll(table.closest(key), message, null, (function(err, n) {
            if (err) return cb(err, key, n);
            cb(null, key, n);
        })), key;
    }, DHT.prototype._preput = function(key, opts, cb) {
        var self = this;
        return this._closest(key, {
            q: "get",
            a: {
                id: this._rpc.id,
                target: key
            }
        }, null, (function(err, n) {
            if (err) return cb(err);
            self.put(opts, cb);
        })), key;
    }, DHT.prototype.get = function(key, opts, cb) {
        key = toBuffer(key), "function" == typeof opts && (cb = opts, opts = null), opts || (opts = {});
        var verify = opts.verify || this._verify, hash = this._hash, value = this._values.get(key.toString("hex")) || null;
        if (value) return value = createGetResponse(this._rpc.id, null, value), process.nextTick(done);
        function done(err) {
            if (err) return cb(err);
            cb(null, value);
        }
        this._closest(key, {
            q: "get",
            a: {
                id: this._rpc.id,
                target: key
            }
        }, (function(message) {
            var r = message.r;
            if (!r || !r.v) return !0;
            if (r.k || r.sig) {
                if (!verify || !r.sig || !r.k) return !0;
                if (!verify(r.sig, encodeSigData(r), r.k)) return !0;
                if (equals(hash(r.salt ? Buffer.concat([ r.k, r.salt ]) : r.k), key)) return value = r, 
                !1;
            } else if (equals(hash(bencode.encode(r.v)), key)) return value = r, !1;
            return !0;
        }), done);
    }, DHT.prototype.announce = function(infoHash, port, cb) {
        if ("function" == typeof port) return this.announce(infoHash, 0, port);
        infoHash = toBuffer(infoHash), cb || (cb = noop);
        var table = this._tables.get(infoHash.toString("hex"));
        if (!table) return this._preannounce(infoHash, port, cb);
        if (this._host) {
            var dhtPort = this.listening ? this.address().port : 0;
            this._addPeer({
                host: this._host,
                port: port || dhtPort
            }, infoHash, {
                host: this._host,
                port: dhtPort
            });
        }
        var message = {
            q: "announce_peer",
            a: {
                id: this._rpc.id,
                token: null,
                info_hash: infoHash,
                port: port,
                implied_port: port ? 0 : 1
            }
        };
        this._debug("announce %s %d", infoHash, port), this._rpc.queryAll(table.closest(infoHash), message, null, cb);
    }, DHT.prototype._preannounce = function(infoHash, port, cb) {
        var self = this;
        this.lookup(infoHash, (function(err) {
            return self.destroyed ? cb(new Error("dht is destroyed")) : err ? cb(err) : void self.announce(infoHash, port, cb);
        }));
    }, DHT.prototype.lookup = function(infoHash, cb) {
        infoHash = toBuffer(infoHash), cb || (cb = noop);
        var self = this, aborted = !1;
        function emit(values, from) {
            values || (values = self._peers.get(infoHash.toString("hex")));
            for (var peers = (function(buf) {
                var peers = [];
                try {
                    for (var i = 0; i < buf.length; i++) {
                        var port = buf[i].readUInt16BE(4);
                        port && peers.push({
                            host: parseIp(buf[i], 0),
                            port: port
                        });
                    }
                } catch (err) {}
                return peers;
            })(values), i = 0; i < peers.length; i++) self.emit("peer", peers[i], infoHash, from || null);
        }
        return this._debug("lookup %s", infoHash), process.nextTick(emit), this._closest(infoHash, {
            q: "get_peers",
            a: {
                id: this._rpc.id,
                info_hash: infoHash
            }
        }, (function(message, node) {
            if (aborted) return !1;
            message.r.values && emit(message.r.values, node);
        }), cb), function() {
            aborted = !0;
        };
    }, DHT.prototype.address = function() {
        return this._rpc.address();
    }, DHT.prototype.listen = function() {
        this._rpc.bind.apply(this._rpc, arguments), this.updateBucketTimestamp(), this._setBucketCheckInterval();
    }, DHT.prototype.destroy = function(cb) {
        if (this.destroyed) cb && process.nextTick(cb); else {
            this.destroyed = !0;
            var self = this;
            clearInterval(this._interval), this.removeBucketCheckInterval(), this._debug("destroying"), 
            this._rpc.destroy((function() {
                self.emit("close"), cb && cb();
            }));
        }
    }, DHT.prototype._onquery = function(query, peer) {
        var q = query.q.toString();
        if (this._debug("received %s query from %s:%d", q, peer.address, peer.port), query.a) switch (q) {
          case "ping":
            return this._rpc.response(peer, query, {
                id: this._rpc.id
            });

          case "find_node":
            return this._onfindnode(query, peer);

          case "get_peers":
            return this._ongetpeers(query, peer);

          case "announce_peer":
            return this._onannouncepeer(query, peer);

          case "get":
            return this._onget(query, peer);

          case "put":
            return this._onput(query, peer);
        }
    }, DHT.prototype._onfindnode = function(query, peer) {
        var target = query.a.target;
        if (!target) return this._rpc.error(peer, query, [ 203, "`find_node` missing required `a.target` field" ]);
        this.emit("find_node", target);
        var nodes = this._rpc.nodes.closest(target);
        this._rpc.response(peer, query, {
            id: this._rpc.id
        }, nodes);
    }, DHT.prototype._ongetpeers = function(query, peer) {
        var host = peer.address || peer.host, infoHash = query.a.info_hash;
        if (!infoHash) return this._rpc.error(peer, query, [ 203, "`get_peers` missing required `a.info_hash` field" ]);
        this.emit("get_peers", infoHash);
        var r = {
            id: this._rpc.id,
            token: this._generateToken(host)
        }, peers = this._peers.get(infoHash.toString("hex"));
        peers.length ? (r.values = peers, this._rpc.response(peer, query, r)) : this._rpc.response(peer, query, r, this._rpc.nodes.closest(infoHash));
    }, DHT.prototype._onannouncepeer = function(query, peer) {
        var host = peer.address || peer.host, port = query.a.implied_port ? peer.port : query.a.port;
        if (!(!port || "number" != typeof port || port <= 0 || port > 65535)) {
            var infoHash = query.a.info_hash, token = query.a.token;
            if (infoHash && token) {
                if (!this._validateToken(host, token)) return this._rpc.error(peer, query, [ 203, "cannot `announce_peer` with bad token" ]);
                this.emit("announce_peer", infoHash, {
                    host: host,
                    port: peer.port
                }), this._addPeer({
                    host: host,
                    port: port
                }, infoHash, {
                    host: host,
                    port: peer.port
                }), this._rpc.response(peer, query, {
                    id: this._rpc.id
                });
            }
        }
    }, DHT.prototype._addPeer = function(peer, infoHash, from) {
        this._peers.add(infoHash.toString("hex"), (function(host, port) {
            for (var buf = Buffer.allocUnsafe(6), ip = host.split("."), i = 0; i < 4; i++) buf[i] = parseInt(ip[i] || 0, 10);
            return buf.writeUInt16BE(port, 4), buf;
        })(peer.host, peer.port)), this.emit("announce", peer, infoHash, from);
    }, DHT.prototype._onget = function(query, peer) {
        var host = peer.address || peer.host, target = query.a.target;
        if (target) {
            var token = this._generateToken(host), value = this._values.get(target.toString("hex"));
            if (this.emit("get", target, value), value) this._rpc.response(peer, query, createGetResponse(this._rpc.id, token, value)); else {
                var nodes = this._rpc.nodes.closest(target);
                this._rpc.response(peer, query, {
                    id: this._rpc.id,
                    token: token
                }, nodes);
            }
        }
    }, DHT.prototype._onput = function(query, peer) {
        var host = peer.address || peer.host, a = query.a;
        if (a) {
            var v = query.a.v;
            if (v) {
                var id = query.a.id;
                if (id) {
                    var token = a.token;
                    if (token) {
                        if (!this._validateToken(host, token)) return this._rpc.error(peer, query, [ 203, "cannot `put` with bad token" ]);
                        if (v.length > 1e3) return this._rpc.error(peer, query, [ 205, "data payload too large" ]);
                        var isMutable = !(!a.k && !a.sig);
                        if (!isMutable || a.k || a.sig) {
                            var key = isMutable ? this._hash(a.salt ? Buffer.concat([ a.k, a.salt ]) : a.k) : this._hash(bencode.encode(v)), keyHex = key.toString("hex");
                            if (this.emit("put", key, v), isMutable) {
                                if (!this._verify) return this._rpc.error(peer, query, [ 400, "verification not supported" ]);
                                if (!this._verify(a.sig, encodeSigData(a), a.k)) return;
                                var prev = this._values.get(keyHex);
                                if (prev && "number" == typeof a.cas && prev.seq !== a.cas) return this._rpc.error(peer, query, [ 301, "CAS mismatch, re-read and try again" ]);
                                if (prev && "number" == typeof prev.seq && !(a.seq > prev.seq)) return this._rpc.error(peer, query, [ 302, "sequence number less than current" ]);
                                this._values.set(keyHex, {
                                    v: v,
                                    k: a.k,
                                    salt: a.salt,
                                    sig: a.sig,
                                    seq: a.seq,
                                    id: id
                                });
                            } else this._values.set(keyHex, {
                                v: v,
                                id: id
                            });
                            this._rpc.response(peer, query, {
                                id: this._rpc.id
                            });
                        }
                    }
                }
            }
        }
    }, DHT.prototype._bootstrap = function(populate) {
        var self = this;
        if (!populate) return process.nextTick(ready);
        function ready() {
            self.ready || (self._debug("emit ready"), self.ready = !0, self.emit("ready"));
        }
        this._rpc.populate(self._rpc.id, {
            q: "find_node",
            a: {
                id: self._rpc.id,
                target: self._rpc.id
            }
        }, ready);
    }, DHT.prototype._closest = function(target, message, onmessage, cb) {
        var self = this, table = new KBucket({
            localNodeId: target,
            numberOfNodesPerKBucket: this._rpc.k
        });
        this._rpc.closest(target, message, (function(message, node) {
            return !message.r || (message.r.token && message.r.id && Buffer.isBuffer(message.r.id) && message.r.id.length === self._hashLength && (self._debug("found node %s (target: %s)", message.r.id, target), 
            table.add({
                id: message.r.id,
                host: node.host || node.address,
                port: node.port,
                token: message.r.token
            })), !onmessage || onmessage(message, node));
        }), (function(err, n) {
            if (err) return cb(err);
            self._tables.set(target.toString("hex"), table), self._debug("visited %d nodes", n), 
            cb(null, n);
        }));
    }, DHT.prototype._debug = function() {
        if (debug.enabled) {
            var args = [].slice.call(arguments);
            args[0] = "[" + this.nodeId.toString("hex").substring(0, 7) + "] " + args[0];
            for (var i = 1; i < args.length; i++) Buffer.isBuffer(args[i]) && (args[i] = args[i].toString("hex"));
            debug.apply(null, args);
        }
    }, DHT.prototype._validateToken = function(host, token) {
        var tokenA = this._generateToken(host, this._secrets[0]), tokenB = this._generateToken(host, this._secrets[1]);
        return equals(token, tokenA) || equals(token, tokenB);
    }, DHT.prototype._generateToken = function(host, secret) {
        return secret || (secret = this._secrets[0]), this._hash(Buffer.concat([ Buffer.from(host), secret ]));
    }, DHT.prototype._rotateSecrets = function() {
        this._secrets ? (this._secrets[1] = this._secrets[0], this._secrets[0] = randombytes(this._hashLength)) : this._secrets = [ randombytes(this._hashLength), randombytes(this._hashLength) ];
    }, PeerStore.prototype.add = function(key, peer) {
        var peers = this.peers.get(key);
        peers || (peers = {
            values: [],
            map: LRU(1 / 0)
        }, this.peers.set(key, peers));
        var id = peer.toString("hex");
        if (!peers.map.get(id)) {
            var node = {
                index: peers.values.length,
                peer: peer
            };
            peers.map.set(id, node), peers.values.push(node), ++this.used > this.max && this._evict();
        }
    }, PeerStore.prototype._evict = function() {
        var a = this.peers.peek(this.peers.tail), b = a.map.remove(a.map.tail), values = a.values;
        swap(values, b.index, values.length - 1), values.pop(), this.used--, values.length || this.peers.remove(this.peers.tail);
    }, PeerStore.prototype.get = function(key) {
        var node = this.peers.get(key);
        return node ? (function(values, n) {
            for (var len = Math.min(values.length, 100), ptr = 0, res = new Array(len), i = 0; i < len; i++) {
                var next = ptr + Math.random() * (values.length - ptr) | 0;
                res[ptr] = values[next].peer, swap(values, ptr++, next);
            }
            return res;
        })(node.values) : [];
    };
}
