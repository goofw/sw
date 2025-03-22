function(module, exports, __webpack_require__) {
    module.exports = Server;
    var bencode = __webpack_require__(257), debug = __webpack_require__(8)("bittorrent-tracker"), dgram = __webpack_require__(69), EventEmitter = __webpack_require__(5).EventEmitter, http = __webpack_require__(11), inherits = __webpack_require__(6), series = __webpack_require__(612), string2compact = __webpack_require__(613), WebSocketServer = __webpack_require__(261).Server, common = __webpack_require__(50), Swarm = __webpack_require__(615), parseHttpRequest = __webpack_require__(617), parseUdpRequest = __webpack_require__(618), parseWebSocketRequest = __webpack_require__(620);
    function Server(opts) {
        var self = this;
        if (!(self instanceof Server)) return new Server(opts);
        if (EventEmitter.call(self), opts || (opts = {}), debug("new server %s", JSON.stringify(opts)), 
        self.intervalMs = opts.interval ? opts.interval : 6e5, self._trustProxy = !!opts.trustProxy, 
        "function" == typeof opts.filter && (self._filter = opts.filter), self._listenCalled = !1, 
        self.listening = !1, self.destroyed = !1, self.torrents = {}, self.http = null, 
        self.udp4 = null, self.udp6 = null, self.ws = null, !1 !== opts.http && (self.http = http.createServer(), 
        self.http.on("error", (function(err) {
            self._onError(err);
        })), self.http.on("listening", onListening), process.nextTick((function() {
            self.http.on("request", (function(req, res) {
                res.headersSent || self.onHttpRequest(req, res);
            }));
        }))), !1 !== opts.udp) {
            var isNode10 = /^v0.10./.test(process.version);
            self.udp4 = self.udp = dgram.createSocket(isNode10 ? "udp4" : {
                type: "udp4",
                reuseAddr: !0
            }), self.udp4.on("message", (function(msg, rinfo) {
                self.onUdpRequest(msg, rinfo);
            })), self.udp4.on("error", (function(err) {
                self._onError(err);
            })), self.udp4.on("listening", onListening), self.udp6 = dgram.createSocket(isNode10 ? "udp6" : {
                type: "udp6",
                reuseAddr: !0
            }), self.udp6.on("message", (function(msg, rinfo) {
                self.onUdpRequest(msg, rinfo);
            })), self.udp6.on("error", (function(err) {
                self._onError(err);
            })), self.udp6.on("listening", onListening);
        }
        !1 !== opts.ws && (self.http || (self.http = http.createServer(), self.http.on("error", (function(err) {
            self._onError(err);
        })), self.http.on("listening", onListening), process.nextTick((function() {
            self.http.on("request", (function(req, res) {
                res.headersSent || (res.statusCode = 404, res.end("404 Not Found"));
            }));
        }))), self.ws = new WebSocketServer({
            server: self.http
        }), self.ws.address = self.http.address.bind(self.http), self.ws.on("error", (function(err) {
            self._onError(err);
        })), self.ws.on("connection", (function(socket) {
            self.onWebSocketConnection(socket);
        })));
        var num = !!self.http + !!self.udp4 + !!self.udp6;
        function onListening() {
            0 == (num -= 1) && (self.listening = !0, debug("listening"), self.emit("listening"));
        }
    }
    function toNumber(x) {
        return (x = Number(x)) >= 0 && x;
    }
    inherits(Server, EventEmitter), Server.prototype._onError = function(err) {
        this.emit("error", err);
    }, Server.prototype.listen = function() {
        var self = this;
        if (self._listenCalled || self.listening) throw new Error("server already listening");
        self._listenCalled = !0;
        var lastArg = arguments[arguments.length - 1];
        "function" == typeof lastArg && self.once("listening", lastArg);
        var port = toNumber(arguments[0]) || arguments[0] || 0, hostname = "function" != typeof arguments[1] ? arguments[1] : void 0;
        function isObject(obj) {
            return "object" == typeof obj && null !== obj;
        }
        debug("listen (port: %o hostname: %o)", port, hostname);
        var httpPort = isObject(port) ? port.http || 0 : port, udpPort = isObject(port) ? port.udp || 0 : port, httpHostname = isObject(hostname) ? hostname.http : hostname || "::", udp4Hostname = isObject(hostname) ? hostname.udp : hostname, udp6Hostname = isObject(hostname) ? hostname.udp6 : hostname;
        self.http && self.http.listen(httpPort, httpHostname), self.udp4 && self.udp4.bind(udpPort, udp4Hostname), 
        self.udp6 && self.udp6.bind(udpPort, udp6Hostname);
    }, Server.prototype.close = function(cb) {
        if (cb || (cb = function() {}), debug("close"), this.listening = !1, this.destroyed = !0, 
        this.udp4) try {
            this.udp4.close();
        } catch (err) {}
        if (this.udp6) try {
            this.udp6.close();
        } catch (err) {}
        if (this.ws) try {
            this.ws.close();
        } catch (err) {}
        this.http ? this.http.close(cb) : cb(null);
    }, Server.prototype.createSwarm = function(infoHash, cb) {
        var self = this;
        Buffer.isBuffer(infoHash) && (infoHash = infoHash.toString("hex")), process.nextTick((function() {
            var swarm = self.torrents[infoHash] = new Swarm(infoHash, self);
            cb(null, swarm);
        }));
    }, Server.prototype.getSwarm = function(infoHash, cb) {
        var self = this;
        Buffer.isBuffer(infoHash) && (infoHash = infoHash.toString("hex")), process.nextTick((function() {
            cb(null, self.torrents[infoHash]);
        }));
    }, Server.prototype.onHttpRequest = function(req, res, opts) {
        var params, self = this;
        opts || (opts = {}), opts.trustProxy = opts.trustProxy || self._trustProxy;
        try {
            (params = parseHttpRequest(req, opts)).httpReq = req, params.httpRes = res;
        } catch (err) {
            return res.end(bencode.encode({
                "failure reason": err.message
            })), void self.emit("warning", err);
        }
        self._onRequest(params, (function(err, response) {
            if (err && (self.emit("warning", err), response = {
                "failure reason": err.message
            }), self.destroyed) return res.end();
            delete response.action, res.end(bencode.encode(response)), params.action === common.ACTIONS.ANNOUNCE && self.emit(common.EVENT_NAMES[params.event], params.addr, params);
        }));
    }, Server.prototype.onUdpRequest = function(msg, rinfo) {
        var params, self = this;
        try {
            params = parseUdpRequest(msg, rinfo);
        } catch (err) {
            return void self.emit("warning", err);
        }
        self._onRequest(params, (function(err, response) {
            if (err && (self.emit("warning", err), response = {
                action: common.ACTIONS.ERROR,
                "failure reason": err.message
            }), !self.destroyed) {
                response.transactionId = params.transactionId, response.connectionId = params.connectionId;
                var buf = (function(params) {
                    var packet;
                    switch (params.action) {
                      case common.ACTIONS.CONNECT:
                        packet = Buffer.concat([ common.toUInt32(common.ACTIONS.CONNECT), common.toUInt32(params.transactionId), params.connectionId ]);
                        break;

                      case common.ACTIONS.ANNOUNCE:
                        packet = Buffer.concat([ common.toUInt32(common.ACTIONS.ANNOUNCE), common.toUInt32(params.transactionId), common.toUInt32(params.interval), common.toUInt32(params.incomplete), common.toUInt32(params.complete), params.peers ]);
                        break;

                      case common.ACTIONS.SCRAPE:
                        var scrapeResponse = [ common.toUInt32(common.ACTIONS.SCRAPE), common.toUInt32(params.transactionId) ];
                        for (var infoHash in params.files) {
                            var file = params.files[infoHash];
                            scrapeResponse.push(common.toUInt32(file.complete), common.toUInt32(file.downloaded), common.toUInt32(file.incomplete));
                        }
                        packet = Buffer.concat(scrapeResponse);
                        break;

                      case common.ACTIONS.ERROR:
                        packet = Buffer.concat([ common.toUInt32(common.ACTIONS.ERROR), common.toUInt32(params.transactionId || 0), new Buffer(params["failure reason"], "utf8") ]);
                        break;

                      default:
                        throw new Error("Action not implemented: " + params.action);
                    }
                    return packet;
                })(response);
                try {
                    ("IPv4" === rinfo.family ? self.udp4 : self.udp6).send(buf, 0, buf.length, rinfo.port, rinfo.address);
                } catch (err) {
                    self.emit("warning", err);
                }
                params.action === common.ACTIONS.ANNOUNCE && self.emit(common.EVENT_NAMES[params.event], params.addr, params);
            }
        }));
    }, Server.prototype.onWebSocketConnection = function(socket) {
        socket.peerId = null, socket.infoHashes = [], socket.onSend = this._onWebSocketSend.bind(this, socket), 
        socket.on("message", this._onWebSocketRequest.bind(this, socket)), socket.on("error", this._onWebSocketError.bind(this, socket)), 
        socket.on("close", this._onWebSocketClose.bind(this, socket));
    }, Server.prototype._onWebSocketRequest = function(socket, params) {
        var self = this;
        try {
            params = parseWebSocketRequest(socket, params);
        } catch (err) {
            return socket.send(JSON.stringify({
                "failure reason": err.message,
                info_hash: common.hexToBinary(params.info_hash)
            }), socket.onSend), void self.emit("warning", err);
        }
        socket.peerId || (socket.peerId = params.peer_id), self._onRequest(params, (function(err, response) {
            if (err && (self.emit("warning", err), response = {
                "failure reason": err.message
            }), !self.destroyed) {
                -1 === socket.infoHashes.indexOf(params.info_hash) && socket.infoHashes.push(params.info_hash);
                var peers = response.peers;
                delete response.peers, response.interval = Math.ceil(self.intervalMs / 1e3 / 5), 
                response.info_hash = common.hexToBinary(params.info_hash), socket.send(JSON.stringify(response), socket.onSend), 
                debug("sent response %s to %s", JSON.stringify(response), params.peer_id), params.numwant && (debug("got offers %s from %s", JSON.stringify(params.offers), params.peer_id), 
                debug("got %s peers from swarm %s", peers.length, params.info_hash), peers.forEach((function(peer, i) {
                    peer.socket.send(JSON.stringify({
                        offer: params.offers[i].offer,
                        offer_id: params.offers[i].offer_id,
                        peer_id: common.hexToBinary(params.peer_id),
                        info_hash: common.hexToBinary(params.info_hash)
                    }), peer.socket.onSend), debug("sent offer to %s from %s", peer.peerId, params.peer_id);
                }))), params.answer ? (debug("got answer %s from %s", JSON.stringify(params.answer), params.peer_id), 
                self.getSwarm(params.info_hash, (function(err, swarm) {
                    if (err) return self.emit("warning", err);
                    if (!swarm) return self.emit("warning", new Error("no swarm with that `info_hash`"));
                    var toPeer = swarm.peers[params.to_peer_id];
                    if (!toPeer) return self.emit("warning", new Error("no peer with that `to_peer_id`"));
                    toPeer.socket.send(JSON.stringify({
                        answer: params.answer,
                        offer_id: params.offer_id,
                        peer_id: common.hexToBinary(params.peer_id),
                        info_hash: common.hexToBinary(params.info_hash)
                    }), toPeer.socket.onSend), debug("sent answer to %s from %s", toPeer.peerId, params.peer_id), 
                    done();
                }))) : done();
            }
            function done() {
                params.action === common.ACTIONS.ANNOUNCE && self.emit(common.EVENT_NAMES[params.event], params.peer_id, params);
            }
        }));
    }, Server.prototype._onRequest = function(params, cb) {
        params && params.action === common.ACTIONS.CONNECT ? cb(null, {
            action: common.ACTIONS.CONNECT
        }) : params && params.action === common.ACTIONS.ANNOUNCE ? this._onAnnounce(params, cb) : params && params.action === common.ACTIONS.SCRAPE ? this._onScrape(params, cb) : cb(new Error("Invalid action"));
    }, Server.prototype._onAnnounce = function(params, cb) {
        var self = this;
        function announce(swarm) {
            params.event && "empty" !== params.event || (params.event = "update"), swarm.announce(params, (function(err, response) {
                if (err) return cb(err);
                if (response.action || (response.action = common.ACTIONS.ANNOUNCE), response.interval || (response.interval = Math.ceil(self.intervalMs / 1e3)), 
                1 === params.compact) {
                    var peers = response.peers;
                    response.peers = string2compact(peers.filter((function(peer) {
                        return common.IPV4_RE.test(peer.ip);
                    })).map((function(peer) {
                        return peer.ip + ":" + peer.port;
                    }))), response.peers6 = string2compact(peers.filter((function(peer) {
                        return common.IPV6_RE.test(peer.ip);
                    })).map((function(peer) {
                        return "[" + peer.ip + "]:" + peer.port;
                    })));
                } else 0 === params.compact && (response.peers = response.peers.map((function(peer) {
                    return {
                        "peer id": common.hexToBinary(peer.peerId),
                        ip: peer.ip,
                        port: peer.port
                    };
                })));
                cb(null, response);
            }));
        }
        self.getSwarm(params.info_hash, (function(err, swarm) {
            if (err) return cb(err);
            swarm ? announce(swarm) : self._filter ? self._filter(params.info_hash, params, (function(allowed) {
                allowed instanceof Error ? cb(allowed) : allowed ? self.createSwarm(params.info_hash, (function(err, swarm) {
                    if (err) return cb(err);
                    announce(swarm);
                })) : cb(new Error("disallowed info_hash"));
            })) : self.createSwarm(params.info_hash, (function(err, swarm) {
                if (err) return cb(err);
                announce(swarm);
            }));
        }));
    }, Server.prototype._onScrape = function(params, cb) {
        var self = this;
        null == params.info_hash && (params.info_hash = Object.keys(self.torrents)), series(params.info_hash.map((function(infoHash) {
            return function(cb) {
                self.getSwarm(infoHash, (function(err, swarm) {
                    if (err) return cb(err);
                    swarm ? swarm.scrape(params, (function(err, scrapeInfo) {
                        if (err) return cb(err);
                        cb(null, {
                            infoHash: infoHash,
                            complete: scrapeInfo && scrapeInfo.complete || 0,
                            incomplete: scrapeInfo && scrapeInfo.incomplete || 0
                        });
                    })) : cb(null, {
                        infoHash: infoHash,
                        complete: 0,
                        incomplete: 0
                    });
                }));
            };
        })), (function(err, results) {
            if (err) return cb(err);
            var response = {
                action: common.ACTIONS.SCRAPE,
                files: {},
                flags: {
                    min_request_interval: Math.ceil(self.intervalMs / 1e3)
                }
            };
            results.forEach((function(result) {
                response.files[common.hexToBinary(result.infoHash)] = {
                    complete: result.complete || 0,
                    incomplete: result.incomplete || 0,
                    downloaded: result.complete || 0
                };
            })), cb(null, response);
        }));
    }, Server.prototype._onWebSocketSend = function(socket, err) {
        err && this._onWebSocketError(socket, err);
    }, Server.prototype._onWebSocketClose = function(socket) {
        var self = this;
        socket.peerId && socket.infoHashes && (debug("websocket close"), socket.infoHashes.forEach((function(infoHash) {
            var swarm = self.torrents[infoHash];
            swarm && swarm.announce({
                event: "stopped",
                numwant: 0,
                peer_id: socket.peerId
            }, (function() {}));
        })));
    }, Server.prototype._onWebSocketError = function(socket, err) {
        debug("websocket error %s", err.message || err), this.emit("warning", err), this._onWebSocketClose(socket);
    };
}
