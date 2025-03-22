function(module, exports, __webpack_require__) {
    var utp = __webpack_require__(765), net = __webpack_require__(42), fifo = __webpack_require__(767), once = __webpack_require__(34), speedometer = __webpack_require__(382), peerWireProtocol = __webpack_require__(768), EventEmitter = __webpack_require__(5).EventEmitter, util = __webpack_require__(0), RECONNECT_WAIT = [ 4e3, 8e3, 12e3 ], toBuffer = function(str, encoding) {
        return Buffer.isBuffer(str) ? str : new Buffer(str, encoding);
    }, toAddress = function(wire) {
        return "string" == typeof wire ? wire : wire.peerAddress;
    }, onwire = function(swarm, connection, onhandshake, isServer) {
        var wire = peerWireProtocol(swarm._pwp), destroy = function() {
            connection.destroy(), connection.emit("timeout");
        }, connectTimeout = !isServer && setTimeout(destroy, swarm.connectTimeout), handshakeTimeout = setTimeout(destroy, swarm.handshakeTimeout);
        return handshakeTimeout.unref && handshakeTimeout.unref(), connectTimeout.unref && connectTimeout.unref(), 
        connection.on("connect", (function() {
            clearTimeout(connectTimeout);
        })), wire.once("handshake", (function(infoHash, peerId) {
            clearTimeout(handshakeTimeout), onhandshake(infoHash, peerId);
        })), connection.on("end", (function() {
            connection.destroy();
        })), connection.on("error", (function() {
            connection.destroy();
        })), connection.on("close", (function() {
            clearTimeout(connectTimeout), clearTimeout(handshakeTimeout), wire.destroy();
        })), connection.pipe(wire).pipe(connection), wire;
    }, pools = {}, Swarm = function(infoHash, peerId, options) {
        if (!(this instanceof Swarm)) return new Swarm(infoHash, peerId, options);
        EventEmitter.call(this), options = options || {}, this.handshake = options.handshake, 
        this.port = 0, this.size = options.size || 100, this.utp = options.utp || !1, this.handshakeTimeout = options.handshakeTimeout || 25e3, 
        this.connectTimeout = options.connectTimeout || 3e3, this.infoHash = toBuffer(infoHash, "hex"), 
        this.peerId = toBuffer(peerId, "utf-8"), this.downloaded = 0, this.uploaded = 0, 
        this.connections = [], this.wires = [], this.paused = !1, this.tries = 0, this.uploaded = 0, 
        this.downloaded = 0, this.downloadSpeed = speedometer(), this.uploadSpeed = speedometer(), 
        this._destroyed = !1, this._queues = [ fifo() ], this._peers = {}, this._pwp = {
            speed: options.speed
        };
    };
    util.inherits(Swarm, EventEmitter), Swarm.prototype.__defineGetter__("queued", (function() {
        return this._queues.reduce((function(prev, queue) {
            return prev + queue.length;
        }), 0);
    })), Swarm.prototype.pause = function() {
        this.paused = !0, this.emit("pause");
    }, Swarm.prototype.resume = function() {
        this.paused = !1, this.emit("resume"), this._drain();
    }, Swarm.prototype.priority = function(addr, level) {
        addr = toAddress(addr);
        var peer = this._peers[addr];
        return peer ? "number" != typeof level || peer.priority === level ? level : (this._queues[level] || (this._queues[level] = fifo()), 
        peer.node && (this._queues[peer.priority].remove(peer.node), peer.node = this._queues[level].push(addr)), 
        peer.priority = level) : 0;
    }, Swarm.prototype.add = function(addr) {
        if (!this._destroyed && !this._peers[addr]) {
            var port = Number(addr.split(":")[1]);
            port > 0 && port < 65535 && (this._peers[addr] = {
                node: this._queues[0].push(addr),
                wire: null,
                timeout: null,
                reconnect: !1,
                priority: 0,
                retries: 0,
                noUtp: !1
            }, this._drain());
        }
    }, Swarm.prototype.remove = function(addr) {
        this._remove(toAddress(addr)), this._drain();
    }, Swarm.prototype.listen = function(port, onlistening) {
        onlistening && this.once("listening", onlistening), this.port = port, (function(port, swarm) {
            var pool = pools[port];
            if (!pool) {
                var swarms = {}, servers = [], onconnection = function(connection) {
                    var wire = onwire(swarm, connection, (function(infoHash, peerId) {
                        var swarm = swarms[infoHash.toString("hex")];
                        if (!swarm) return connection.destroy();
                        swarm._onincoming(connection, wire);
                    }), !0);
                };
                servers.push(net.createServer(onconnection)), swarm.utp && servers.push(utp.createServer(onconnection));
                var loop = function(i) {
                    if (i < servers.length) return servers[i].listen(port, loop.bind(null, i + 1));
                    pool.listening = !0, Object.keys(swarms).forEach((function(infoHash) {
                        swarms[infoHash].emit("listening");
                    }));
                };
                loop(0), pool = pools[port] = {
                    servers: servers,
                    swarms: swarms,
                    listening: !1
                };
            }
            var infoHash = swarm.infoHash.toString("hex");
            pool.listening && process.nextTick((function() {
                swarm.emit("listening");
            })), pool.swarms[infoHash] ? process.nextTick((function() {
                swarm.emit("error", new Error("port and info hash already in use"));
            })) : pool.swarms[infoHash] = swarm;
        })(this.port, this);
    }, Swarm.prototype.destroy = function() {
        this._destroyed = !0;
        var port, self = this;
        Object.keys(this._peers).forEach((function(addr) {
            self._remove(addr);
        })), this.wires.forEach((function(wire) {
            wire.destroy(), wire.removeAllListeners();
        })), port = this.port, pools[port] && (delete pools[port].swarms[this.infoHash.toString("hex")], 
        Object.keys(pools[port].swarms).length || (pools[port].servers.forEach((function(server) {
            server.close();
        })), delete pools[port])), process.nextTick((function() {
            self.emit("close"), self.removeAllListeners();
        }));
    }, Swarm.prototype._remove = function(addr) {
        var peer = this._peers[addr];
        peer && (delete this._peers[addr], peer.node && this._queues[peer.priority].remove(peer.node), 
        peer.timeout && clearTimeout(peer.timeout), peer.wire && peer.wire.destroy());
    }, Swarm.prototype._drain = function() {
        if (!(this.connections.length >= this.size || this.paused)) {
            var self = this, addr = this._shift();
            if (addr) {
                var peer = this._peers[addr];
                if (peer) {
                    self.tries++;
                    var connection, repush = function() {
                        peer.node = self._queues[peer.priority].push(addr), self._drain();
                    }, parts = addr.split(":");
                    this.utp && !peer.noUtp ? (connection = utp.connect(parts[1], parts[0])).on("timeout", (function() {
                        peer.noUtp = !0, repush();
                    })) : connection = net.connect(parts[1], parts[0]), peer.timeout && clearTimeout(peer.timeout), 
                    peer.node = null, peer.timeout = null;
                    var wire = onwire(this, connection, (function(infoHash) {
                        if (infoHash.toString("hex") !== self.infoHash.toString("hex")) return connection.destroy();
                        peer.reconnect = !0, peer.retries = 0, self._onwire(connection, wire);
                    }));
                    wire.on("close", (function() {
                        if (peer.wire = null, !peer.reconnect || self._destroyed || peer.retries >= RECONNECT_WAIT.length) return self._remove(addr);
                        peer.timeout = setTimeout(repush, RECONNECT_WAIT[peer.retries++]);
                    })), peer.wire = wire, self._onconnection(connection), wire.peerAddress = addr, 
                    wire.handshake(this.infoHash, this.peerId, this.handshake);
                }
            }
        }
    }, Swarm.prototype._shift = function() {
        for (var i = this._queues.length - 1; i >= 0; i--) if (this._queues[i] && this._queues[i].length) return this._queues[i].shift();
        return null;
    }, Swarm.prototype._onincoming = function(connection, wire) {
        wire.peerAddress = connection.address().address + ":" + connection.address().port, 
        wire.handshake(this.infoHash, this.peerId, this.handshake), this._onconnection(connection), 
        this._onwire(connection, wire);
    }, Swarm.prototype._onconnection = function(connection) {
        var self = this;
        connection.once("close", (function() {
            self.connections.splice(self.connections.indexOf(connection), 1), self._drain();
        })), this.connections.push(connection);
    }, Swarm.prototype._onwire = function(connection, wire) {
        var self = this;
        wire.on("download", (function(downloaded) {
            self.downloaded += downloaded, self.downloadSpeed(downloaded), self.emit("download", downloaded);
        })), wire.on("upload", (function(uploaded) {
            self.uploaded += uploaded, self.uploadSpeed(uploaded), self.emit("upload", uploaded);
        }));
        var cleanup = once((function() {
            self.emit("wire-disconnect", wire, connection), self.wires.splice(self.wires.indexOf(wire), 1), 
            connection.destroy();
        }));
        connection.on("close", cleanup), connection.on("error", cleanup), connection.on("end", cleanup), 
        wire.on("end", cleanup), wire.on("close", cleanup), wire.on("finish", cleanup), 
        this.wires.push(wire), this.emit("wire", wire, connection);
    }, module.exports = Swarm;
}
