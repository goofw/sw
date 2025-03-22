function(module, exports, __webpack_require__) {
    var util = __webpack_require__(0), events = __webpack_require__(5), http = __webpack_require__(11), crypto = __webpack_require__(9), Options = __webpack_require__(263), WebSocket = __webpack_require__(262), Extensions = __webpack_require__(268), PerMessageDeflate = __webpack_require__(115), url = (__webpack_require__(92), 
    __webpack_require__(7));
    function WebSocketServer(options, callback) {
        if (this instanceof WebSocketServer == 0) return new WebSocketServer(options, callback);
        if (events.EventEmitter.call(this), !(options = new Options({
            host: "0.0.0.0",
            port: null,
            server: null,
            verifyClient: null,
            handleProtocols: null,
            path: null,
            noServer: !1,
            disableHixie: !1,
            clientTracking: !0,
            perMessageDeflate: !0,
            maxPayload: 104857600
        }).merge(options)).isDefinedAndNonNull("port") && !options.isDefinedAndNonNull("server") && !options.value.noServer) throw new TypeError("`port` or a `server` must be provided");
        var self = this;
        if (options.isDefinedAndNonNull("port")) this._server = http.createServer((function(req, res) {
            var body = http.STATUS_CODES[426];
            res.writeHead(426, {
                "Content-Length": body.length,
                "Content-Type": "text/plain"
            }), res.end(body);
        })), this._server.allowHalfOpen = !1, this._server.listen(options.value.port, options.value.host, callback), 
        this._closeServer = function() {
            self._server && self._server.close();
        }; else if (options.value.server && (this._server = options.value.server, options.value.path)) {
            if (this._server._webSocketPaths && options.value.server._webSocketPaths[options.value.path]) throw new Error("two instances of WebSocketServer cannot listen on the same http server path");
            "object" != typeof this._server._webSocketPaths && (this._server._webSocketPaths = {}), 
            this._server._webSocketPaths[options.value.path] = 1;
        }
        this._server && (this._onceServerListening = function() {
            self.emit("listening");
        }, this._server.once("listening", this._onceServerListening)), void 0 !== this._server && (this._onServerError = function(error) {
            self.emit("error", error);
        }, this._server.on("error", this._onServerError), this._onServerUpgrade = function(req, socket, upgradeHead) {
            var head = new Buffer(upgradeHead.length);
            upgradeHead.copy(head), self.handleUpgrade(req, socket, head, (function(client) {
                self.emit("connection" + req.url, client), self.emit("connection", client);
            }));
        }, this._server.on("upgrade", this._onServerUpgrade)), this.options = options.value, 
        this.path = options.value.path, this.clients = [];
    }
    function handleHybiUpgrade(req, socket, upgradeHead, cb) {
        var errorHandler = function() {
            try {
                socket.destroy();
            } catch (e) {}
        };
        if (socket.on("error", errorHandler), req.headers["sec-websocket-key"]) {
            var version = parseInt(req.headers["sec-websocket-version"]);
            if (-1 !== [ 8, 13 ].indexOf(version)) {
                var protocols = req.headers["sec-websocket-protocol"], origin = version < 13 ? req.headers["sec-websocket-origin"] : req.headers.origin, extensionsOffer = Extensions.parse(req.headers["sec-websocket-extensions"]), self = this, completeHybiUpgrade2 = function(protocol) {
                    var key = req.headers["sec-websocket-key"], shasum = crypto.createHash("sha1");
                    shasum.update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
                    var headers = [ "HTTP/1.1 101 Switching Protocols", "Upgrade: websocket", "Connection: Upgrade", "Sec-WebSocket-Accept: " + (key = shasum.digest("base64")) ];
                    void 0 !== protocol && headers.push("Sec-WebSocket-Protocol: " + protocol);
                    var extensions = {};
                    try {
                        extensions = acceptExtensions.call(self, extensionsOffer);
                    } catch (err) {
                        return void abortConnection(socket, 400, "Bad Request");
                    }
                    if (Object.keys(extensions).length) {
                        var serverExtensions = {};
                        Object.keys(extensions).forEach((function(token) {
                            serverExtensions[token] = [ extensions[token].params ];
                        })), headers.push("Sec-WebSocket-Extensions: " + Extensions.format(serverExtensions));
                    }
                    self.emit("headers", headers), socket.setTimeout(0), socket.setNoDelay(!0);
                    try {
                        socket.write(headers.concat("", "").join("\r\n"));
                    } catch (e) {
                        try {
                            socket.destroy();
                        } catch (e) {}
                        return;
                    }
                    var client = new WebSocket([ req, socket, upgradeHead ], {
                        protocolVersion: version,
                        protocol: protocol,
                        extensions: extensions,
                        maxPayload: self.options.maxPayload
                    });
                    self.options.clientTracking && (self.clients.push(client), client.on("close", (function() {
                        var index = self.clients.indexOf(client);
                        -1 != index && self.clients.splice(index, 1);
                    }))), socket.removeListener("error", errorHandler), cb(client);
                }, completeHybiUpgrade1 = function() {
                    if ("function" != typeof self.options.handleProtocols) void 0 !== protocols ? completeHybiUpgrade2(protocols.split(/, */)[0]) : completeHybiUpgrade2(); else {
                        var protList = (protocols || "").split(/, */), callbackCalled = !1;
                        self.options.handleProtocols(protList, (function(result, protocol) {
                            callbackCalled = !0, result ? completeHybiUpgrade2(protocol) : abortConnection(socket, 401, "Unauthorized");
                        })), callbackCalled || abortConnection(socket, 501, "Could not process protocols");
                    }
                };
                if ("function" == typeof this.options.verifyClient) {
                    var info = {
                        origin: origin,
                        secure: void 0 !== req.connection.authorized || void 0 !== req.connection.encrypted,
                        req: req
                    };
                    if (2 == this.options.verifyClient.length) return void this.options.verifyClient(info, (function(result, code, name) {
                        void 0 === code && (code = 401), void 0 === name && (name = http.STATUS_CODES[code]), 
                        result ? completeHybiUpgrade1() : abortConnection(socket, code, name);
                    }));
                    if (!this.options.verifyClient(info)) return void abortConnection(socket, 401, "Unauthorized");
                }
                completeHybiUpgrade1();
            } else abortConnection(socket, 400, "Bad Request");
        } else abortConnection(socket, 400, "Bad Request");
    }
    function handleHixieUpgrade(req, socket, upgradeHead, cb) {
        var errorHandler = function() {
            try {
                socket.destroy();
            } catch (e) {}
        };
        if (socket.on("error", errorHandler), this.options.disableHixie) abortConnection(socket, 401, "Hixie support disabled"); else if (req.headers["sec-websocket-key2"]) {
            var origin = req.headers.origin, self = this, onClientVerified = function() {
                var wshost;
                wshost = req.headers["x-forwarded-host"] ? req.headers["x-forwarded-host"] : req.headers.host;
                var location = ("https" === req.headers["x-forwarded-proto"] || socket.encrypted ? "wss" : "ws") + "://" + wshost + req.url, protocol = req.headers["sec-websocket-protocol"], buildResponseHeader = function() {
                    var headers = [ "HTTP/1.1 101 Switching Protocols", "Upgrade: WebSocket", "Connection: Upgrade", "Sec-WebSocket-Location: " + location ];
                    return void 0 !== protocol && headers.push("Sec-WebSocket-Protocol: " + protocol), 
                    void 0 !== origin && headers.push("Sec-WebSocket-Origin: " + origin), new Buffer(headers.concat("", "").join("\r\n"));
                }, completeHandshake = function(nonce, rest, headerBuffer) {
                    var k1 = req.headers["sec-websocket-key1"], k2 = req.headers["sec-websocket-key2"], md5 = crypto.createHash("md5");
                    [ k1, k2 ].forEach((function(k) {
                        var n = parseInt(k.replace(/[^\d]/g, "")), spaces = k.replace(/[^ ]/g, "").length;
                        0 !== spaces && n % spaces == 0 ? (n /= spaces, md5.update(String.fromCharCode(n >> 24 & 255, n >> 16 & 255, n >> 8 & 255, 255 & n))) : abortConnection(socket, 400, "Bad Request");
                    })), md5.update(nonce.toString("binary")), socket.setTimeout(0), socket.setNoDelay(!0);
                    try {
                        var hashBuffer = new Buffer(md5.digest("binary"), "binary"), handshakeBuffer = new Buffer(headerBuffer.length + hashBuffer.length);
                        headerBuffer.copy(handshakeBuffer, 0), hashBuffer.copy(handshakeBuffer, headerBuffer.length), 
                        socket.write(handshakeBuffer, "binary", (function(err) {
                            if (!err) {
                                var client = new WebSocket([ req, socket, rest ], {
                                    protocolVersion: "hixie-76",
                                    protocol: protocol
                                });
                                self.options.clientTracking && (self.clients.push(client), client.on("close", (function() {
                                    var index = self.clients.indexOf(client);
                                    -1 != index && self.clients.splice(index, 1);
                                }))), socket.removeListener("error", errorHandler), cb(client);
                            }
                        }));
                    } catch (e) {
                        try {
                            socket.destroy();
                        } catch (e) {}
                        return;
                    }
                };
                if (upgradeHead && upgradeHead.length >= 8) {
                    var nonce = upgradeHead.slice(0, 8), rest = upgradeHead.length > 8 ? upgradeHead.slice(8) : null;
                    completeHandshake.call(self, nonce, rest, buildResponseHeader());
                } else {
                    nonce = new Buffer(8), upgradeHead.copy(nonce, 0);
                    var received = upgradeHead.length, handler = (rest = null, function(data) {
                        var toRead = Math.min(data.length, 8 - received);
                        0 !== toRead && (data.copy(nonce, received, 0, toRead), 8 == (received += toRead) && (socket.removeListener("data", handler), 
                        toRead < data.length && (rest = data.slice(toRead)), completeHandshake.call(self, nonce, rest, new Buffer(0))));
                    });
                    socket.on("data", handler), (function() {
                        socket.setTimeout(0), socket.setNoDelay(!0);
                        var headerBuffer = buildResponseHeader();
                        try {
                            socket.write(headerBuffer, "binary", (function(err) {
                                err && socket.removeListener("data", handler);
                            }));
                        } catch (e) {
                            try {
                                socket.destroy();
                            } catch (e) {}
                            return;
                        }
                    })();
                }
            };
            if ("function" == typeof this.options.verifyClient) {
                var info = {
                    origin: origin,
                    secure: void 0 !== req.connection.authorized || void 0 !== req.connection.encrypted,
                    req: req
                };
                if (2 == this.options.verifyClient.length) return self = this, void this.options.verifyClient(info, (function(result, code, name) {
                    void 0 === code && (code = 401), void 0 === name && (name = http.STATUS_CODES[code]), 
                    result ? onClientVerified.apply(self) : abortConnection(socket, code, name);
                }));
                if (!this.options.verifyClient(info)) return void abortConnection(socket, 401, "Unauthorized");
            }
            onClientVerified();
        } else abortConnection(socket, 400, "Bad Request");
    }
    function acceptExtensions(offer) {
        var extensions = {}, options = this.options.perMessageDeflate, maxPayload = this.options.maxPayload;
        if (options && offer[PerMessageDeflate.extensionName]) {
            var perMessageDeflate = new PerMessageDeflate(!0 !== options ? options : {}, !0, maxPayload);
            perMessageDeflate.accept(offer[PerMessageDeflate.extensionName]), extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
        }
        return extensions;
    }
    function abortConnection(socket, code, name) {
        try {
            var response = [ "HTTP/1.1 " + code + " " + name, "Content-type: text/html" ];
            socket.write(response.concat("", "").join("\r\n"));
        } catch (e) {} finally {
            try {
                socket.destroy();
            } catch (e) {}
        }
    }
    util.inherits(WebSocketServer, events.EventEmitter), WebSocketServer.prototype.close = function(callback) {
        var error = null;
        try {
            for (var i = 0, l = this.clients.length; i < l; ++i) this.clients[i].terminate();
        } catch (e) {
            error = e;
        }
        this.path && this._server._webSocketPaths && (delete this._server._webSocketPaths[this.path], 
        0 == Object.keys(this._server._webSocketPaths).length && delete this._server._webSocketPaths);
        try {
            void 0 !== this._closeServer && this._closeServer();
        } finally {
            this._server && (this._server.removeListener("listening", this._onceServerListening), 
            this._server.removeListener("error", this._onServerError), this._server.removeListener("upgrade", this._onServerUpgrade)), 
            delete this._server;
        }
        if (callback) callback(error); else if (error) throw error;
    }, WebSocketServer.prototype.handleUpgrade = function(req, socket, upgradeHead, cb) {
        if (this.options.path) {
            var u = url.parse(req.url);
            if (u && u.pathname !== this.options.path) return;
        }
        void 0 !== req.headers.upgrade && "websocket" === req.headers.upgrade.toLowerCase() ? req.headers["sec-websocket-key1"] ? handleHixieUpgrade.apply(this, arguments) : handleHybiUpgrade.apply(this, arguments) : abortConnection(socket, 400, "Bad Request");
    }, module.exports = WebSocketServer;
}
