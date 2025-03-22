function(module, exports, __webpack_require__) {
    "use strict";
    var url = __webpack_require__(7), util = __webpack_require__(0), http = __webpack_require__(11), https = __webpack_require__(22), crypto = __webpack_require__(9), stream = __webpack_require__(3), Ultron = __webpack_require__(601), Options = __webpack_require__(263), Sender = __webpack_require__(264), Receiver = __webpack_require__(267), SenderHixie = __webpack_require__(608), ReceiverHixie = __webpack_require__(609), Extensions = __webpack_require__(268), PerMessageDeflate = __webpack_require__(115), EventEmitter = __webpack_require__(5).EventEmitter;
    function WebSocket(address, protocols, options) {
        if (this instanceof WebSocket == 0) return new WebSocket(address, protocols, options);
        EventEmitter.call(this), protocols && !Array.isArray(protocols) && "object" == typeof protocols && (options = protocols, 
        protocols = null), "string" == typeof protocols && (protocols = [ protocols ]), 
        Array.isArray(protocols) || (protocols = []), this._socket = null, this._ultron = null, 
        this._closeReceived = !1, this.bytesReceived = 0, this.readyState = null, this.supports = {}, 
        this.extensions = {}, this._binaryType = "nodebuffer", Array.isArray(address) ? initAsServerClient.apply(this, address.concat(options)) : initAsClient.apply(this, [ address, protocols, options ]);
    }
    function MessageEvent(dataArg, isBinary, target) {
        this.type = "message", this.data = dataArg, this.target = target, this.binary = isBinary;
    }
    function CloseEvent(code, reason, target) {
        this.type = "close", this.wasClean = void 0 === code || 1e3 === code, this.code = code, 
        this.reason = reason, this.target = target;
    }
    function OpenEvent(target) {
        this.type = "open", this.target = target;
    }
    function buildHostHeader(isSecure, hostname, port) {
        var headerHost = hostname;
        return hostname && (isSecure && 443 != port || !isSecure && 80 != port) && (headerHost = headerHost + ":" + port), 
        headerHost;
    }
    function initAsServerClient(req, socket, upgradeHead, options) {
        options = new Options({
            protocolVersion: 13,
            protocol: null,
            extensions: {},
            maxPayload: 0
        }).merge(options), this.protocol = options.value.protocol, this.protocolVersion = options.value.protocolVersion, 
        this.extensions = options.value.extensions, this.supports.binary = "hixie-76" !== this.protocolVersion, 
        this.upgradeReq = req, this.readyState = WebSocket.CONNECTING, this._isServer = !0, 
        this.maxPayload = options.value.maxPayload, "hixie-76" === options.value.protocolVersion ? establishConnection.call(this, ReceiverHixie, SenderHixie, socket, upgradeHead) : establishConnection.call(this, Receiver, Sender, socket, upgradeHead);
    }
    function initAsClient(address, protocols, options) {
        if (8 !== (options = new Options({
            origin: null,
            protocolVersion: 13,
            host: null,
            headers: null,
            protocol: protocols.join(","),
            agent: null,
            pfx: null,
            key: null,
            passphrase: null,
            cert: null,
            ca: null,
            ciphers: null,
            rejectUnauthorized: null,
            perMessageDeflate: !0,
            localAddress: null
        }).merge(options)).value.protocolVersion && 13 !== options.value.protocolVersion) throw new Error("unsupported protocol version");
        var serverUrl = url.parse(address), isUnixSocket = "ws+unix:" === serverUrl.protocol;
        if (!serverUrl.host && !isUnixSocket) throw new Error("invalid url");
        var perMessageDeflate, isSecure = "wss:" === serverUrl.protocol || "https:" === serverUrl.protocol, httpObj = isSecure ? https : http, port = serverUrl.port || (isSecure ? 443 : 80), auth = serverUrl.auth, extensionsOffer = {};
        options.value.perMessageDeflate && (perMessageDeflate = new PerMessageDeflate(!0 !== typeof options.value.perMessageDeflate ? options.value.perMessageDeflate : {}, !1), 
        extensionsOffer[PerMessageDeflate.extensionName] = perMessageDeflate.offer()), this._isServer = !1, 
        this.url = address, this.protocolVersion = options.value.protocolVersion, this.supports.binary = "hixie-76" !== this.protocolVersion;
        var key = new Buffer(options.value.protocolVersion + "-" + Date.now()).toString("base64"), shasum = crypto.createHash("sha1");
        shasum.update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
        var expectedServerKey = shasum.digest("base64"), agent = options.value.agent, headerHost = buildHostHeader(isSecure, serverUrl.hostname, port), requestOptions = {
            port: port,
            host: serverUrl.hostname,
            headers: {
                Connection: "Upgrade",
                Upgrade: "websocket",
                Host: headerHost,
                "Sec-WebSocket-Version": options.value.protocolVersion,
                "Sec-WebSocket-Key": key
            }
        };
        if (auth && (requestOptions.headers.Authorization = "Basic " + new Buffer(auth).toString("base64")), 
        options.value.protocol && (requestOptions.headers["Sec-WebSocket-Protocol"] = options.value.protocol), 
        options.value.host && (requestOptions.headers.Host = options.value.host), options.value.headers) for (var header in options.value.headers) options.value.headers.hasOwnProperty(header) && (requestOptions.headers[header] = options.value.headers[header]);
        Object.keys(extensionsOffer).length && (requestOptions.headers["Sec-WebSocket-Extensions"] = Extensions.format(extensionsOffer)), 
        (options.isDefinedAndNonNull("pfx") || options.isDefinedAndNonNull("key") || options.isDefinedAndNonNull("passphrase") || options.isDefinedAndNonNull("cert") || options.isDefinedAndNonNull("ca") || options.isDefinedAndNonNull("ciphers") || options.isDefinedAndNonNull("rejectUnauthorized")) && (options.isDefinedAndNonNull("pfx") && (requestOptions.pfx = options.value.pfx), 
        options.isDefinedAndNonNull("key") && (requestOptions.key = options.value.key), 
        options.isDefinedAndNonNull("passphrase") && (requestOptions.passphrase = options.value.passphrase), 
        options.isDefinedAndNonNull("cert") && (requestOptions.cert = options.value.cert), 
        options.isDefinedAndNonNull("ca") && (requestOptions.ca = options.value.ca), options.isDefinedAndNonNull("ciphers") && (requestOptions.ciphers = options.value.ciphers), 
        options.isDefinedAndNonNull("rejectUnauthorized") && (requestOptions.rejectUnauthorized = options.value.rejectUnauthorized), 
        agent || (agent = new httpObj.Agent(requestOptions))), requestOptions.path = serverUrl.path || "/", 
        agent && (requestOptions.agent = agent), isUnixSocket && (requestOptions.socketPath = serverUrl.pathname), 
        options.value.localAddress && (requestOptions.localAddress = options.value.localAddress), 
        options.value.origin && (options.value.protocolVersion < 13 ? requestOptions.headers["Sec-WebSocket-Origin"] = options.value.origin : requestOptions.headers.Origin = options.value.origin);
        var self = this, req = httpObj.request(requestOptions);
        req.on("error", (function(error) {
            self.emit("error", error), cleanupWebsocketResources.call(self, error);
        })), req.once("response", (function(res) {
            var error;
            self.emit("unexpected-response", req, res) || (error = new Error("unexpected server response (" + res.statusCode + ")"), 
            req.abort(), self.emit("error", error)), cleanupWebsocketResources.call(self, error);
        })), req.once("upgrade", (function(res, socket, upgradeHead) {
            if (self.readyState === WebSocket.CLOSED) return self.emit("close"), self.removeAllListeners(), 
            void socket.end();
            var serverKey = res.headers["sec-websocket-accept"];
            if (void 0 === serverKey || serverKey !== expectedServerKey) return self.emit("error", "invalid server key"), 
            self.removeAllListeners(), void socket.end();
            var serverProt = res.headers["sec-websocket-protocol"], protList = (options.value.protocol || "").split(/, */), protError = null;
            if (!options.value.protocol && serverProt ? protError = "server sent a subprotocol even though none requested" : options.value.protocol && !serverProt ? protError = "server sent no subprotocol even though requested" : serverProt && -1 === protList.indexOf(serverProt) && (protError = "server responded with an invalid protocol"), 
            protError) return self.emit("error", protError), self.removeAllListeners(), void socket.end();
            serverProt && (self.protocol = serverProt);
            var serverExtensions = Extensions.parse(res.headers["sec-websocket-extensions"]);
            if (perMessageDeflate && serverExtensions[PerMessageDeflate.extensionName]) {
                try {
                    perMessageDeflate.accept(serverExtensions[PerMessageDeflate.extensionName]);
                } catch (err) {
                    return self.emit("error", "invalid extension parameter"), self.removeAllListeners(), 
                    void socket.end();
                }
                self.extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
            }
            establishConnection.call(self, Receiver, Sender, socket, upgradeHead), req.removeAllListeners(), 
            req = null, agent = null;
        })), req.end(), this.readyState = WebSocket.CONNECTING;
    }
    function establishConnection(ReceiverClass, SenderClass, socket, upgradeHead) {
        var ultron = this._ultron = new Ultron(socket), called = !1, self = this;
        function firstHandler(data) {
            called || self.readyState === WebSocket.CLOSED || (called = !0, socket.removeListener("data", firstHandler), 
            ultron.on("data", realHandler), upgradeHead && upgradeHead.length > 0 && (realHandler(upgradeHead), 
            upgradeHead = null), data && realHandler(data));
        }
        function realHandler(data) {
            self.bytesReceived += data.length, self._receiver.add(data);
        }
        socket.setTimeout(0), socket.setNoDelay(!0), this._receiver = new ReceiverClass(this.extensions, this.maxPayload), 
        this._socket = socket, ultron.on("end", cleanupWebsocketResources.bind(this)), ultron.on("close", cleanupWebsocketResources.bind(this)), 
        ultron.on("error", cleanupWebsocketResources.bind(this)), ultron.on("data", firstHandler), 
        process.nextTick(firstHandler), self._receiver.ontext = function(data, flags) {
            flags = flags || {}, self.emit("message", data, flags);
        }, self._receiver.onbinary = function(data, flags) {
            (flags = flags || {}).binary = !0, self.emit("message", data, flags);
        }, self._receiver.onping = function(data, flags) {
            flags = flags || {}, self.pong(data, {
                mask: !self._isServer,
                binary: !0 === flags.binary
            }, !0), self.emit("ping", data, flags);
        }, self._receiver.onpong = function(data, flags) {
            self.emit("pong", data, flags || {});
        }, self._receiver.onclose = function(code, data, flags) {
            flags = flags || {}, self._closeReceived = !0, self.close(code, data);
        }, self._receiver.onerror = function(reason, errorCode) {
            self.close(void 0 !== errorCode ? errorCode : 1002, ""), self.emit("error", reason instanceof Error ? reason : new Error(reason));
        }, this._sender = new SenderClass(socket, this.extensions), this._sender.on("error", (function(error) {
            self.close(1002, ""), self.emit("error", error);
        })), this.readyState = WebSocket.OPEN, this.emit("open");
    }
    function startQueue(instance) {
        instance._queue = instance._queue || [];
    }
    function executeQueueSends(instance) {
        var queue = instance._queue;
        if (void 0 !== queue) {
            delete instance._queue;
            for (var i = 0, l = queue.length; i < l; ++i) queue[i]();
        }
    }
    function cleanupWebsocketResources(error) {
        if (this.readyState !== WebSocket.CLOSED) {
            if (this.readyState = WebSocket.CLOSED, clearTimeout(this._closeTimer), this._closeTimer = null, 
            !error && this._closeReceived || (this._closeCode = 1006), this.emit("close", this._closeCode || 1e3, this._closeMessage || ""), 
            this._socket) {
                this._ultron && this._ultron.destroy(), this._socket.on("error", (function() {
                    try {
                        this.destroy();
                    } catch (e) {}
                }));
                try {
                    error ? this._socket.destroy() : this._socket.end();
                } catch (e) {}
                this._socket = null, this._ultron = null;
            }
            this._sender && (this._sender.removeAllListeners(), this._sender = null), this._receiver && (this._receiver.cleanup(), 
            this._receiver = null), this.extensions[PerMessageDeflate.extensionName] && this.extensions[PerMessageDeflate.extensionName].cleanup(), 
            this.extensions = null, this.removeAllListeners(), this.on("error", (function() {})), 
            delete this._queue;
        }
    }
    util.inherits(WebSocket, EventEmitter), [ "CONNECTING", "OPEN", "CLOSING", "CLOSED" ].forEach((function(state, index) {
        WebSocket.prototype[state] = WebSocket[state] = index;
    })), WebSocket.prototype.close = function(code, data) {
        if (this.readyState !== WebSocket.CLOSED) if (this.readyState !== WebSocket.CONNECTING) if (this.readyState !== WebSocket.CLOSING) {
            var self = this;
            try {
                this.readyState = WebSocket.CLOSING, this._closeCode = code, this._closeMessage = data;
                var mask = !this._isServer;
                this._sender.close(code, data, mask, (function(err) {
                    err && self.emit("error", err), self._closeReceived && self._isServer ? self.terminate() : (clearTimeout(self._closeTimer), 
                    self._closeTimer = setTimeout(cleanupWebsocketResources.bind(self, !0), 3e4));
                }));
            } catch (e) {
                this.emit("error", e);
            }
        } else this._closeReceived && this._isServer && this.terminate(); else this.readyState = WebSocket.CLOSED;
    }, WebSocket.prototype.pause = function() {
        if (this.readyState !== WebSocket.OPEN) throw new Error("not opened");
        return this._socket.pause();
    }, WebSocket.prototype.ping = function(data, options, dontFailWhenClosed) {
        if (this.readyState !== WebSocket.OPEN) {
            if (!0 === dontFailWhenClosed) return;
            throw new Error("not opened");
        }
        void 0 === (options = options || {}).mask && (options.mask = !this._isServer), this._sender.ping(data, options);
    }, WebSocket.prototype.pong = function(data, options, dontFailWhenClosed) {
        if (this.readyState !== WebSocket.OPEN) {
            if (!0 === dontFailWhenClosed) return;
            throw new Error("not opened");
        }
        void 0 === (options = options || {}).mask && (options.mask = !this._isServer), this._sender.pong(data, options);
    }, WebSocket.prototype.resume = function() {
        if (this.readyState !== WebSocket.OPEN) throw new Error("not opened");
        return this._socket.resume();
    }, WebSocket.prototype.send = function(data, options, cb) {
        if ("function" == typeof options && (cb = options, options = {}), this.readyState === WebSocket.OPEN) if (data || (data = ""), 
        this._queue) {
            var self = this;
            this._queue.push((function() {
                self.send(data, options, cb);
            }));
        } else {
            (options = options || {}).fin = !0, void 0 === options.binary && (options.binary = data instanceof ArrayBuffer || data instanceof Buffer || data instanceof Uint8Array || data instanceof Uint16Array || data instanceof Uint32Array || data instanceof Int8Array || data instanceof Int16Array || data instanceof Int32Array || data instanceof Float32Array || data instanceof Float64Array), 
            void 0 === options.mask && (options.mask = !this._isServer), void 0 === options.compress && (options.compress = !0), 
            this.extensions[PerMessageDeflate.extensionName] || (options.compress = !1);
            var readable = "function" == typeof stream.Readable ? stream.Readable : stream.Stream;
            data instanceof readable ? (startQueue(this), self = this, (function(instance, stream, options, cb) {
                stream.on("data", (function(data) {
                    instance.readyState === WebSocket.OPEN ? (options.fin = !1, instance._sender.send(data, options)) : cb(new Error("not opened"));
                })), stream.on("end", (function() {
                    instance.readyState === WebSocket.OPEN ? (options.fin = !0, instance._sender.send(null, options), 
                    cb(null)) : cb(new Error("not opened"));
                }));
            })(this, data, options, (function(error) {
                process.nextTick((function() {
                    executeQueueSends(self);
                })), "function" == typeof cb && cb(error);
            }))) : this._sender.send(data, options, cb);
        } else {
            if ("function" != typeof cb) throw new Error("not opened");
            cb(new Error("not opened"));
        }
    }, WebSocket.prototype.stream = function(options, cb) {
        "function" == typeof options && (cb = options, options = {});
        var self = this;
        if ("function" != typeof cb) throw new Error("callback must be provided");
        if (this.readyState === WebSocket.OPEN) this._queue ? this._queue.push((function() {
            self.stream(options, cb);
        })) : (void 0 === (options = options || {}).mask && (options.mask = !this._isServer), 
        void 0 === options.compress && (options.compress = !0), this.extensions[PerMessageDeflate.extensionName] || (options.compress = !1), 
        startQueue(this), process.nextTick(cb.bind(null, null, (function send(data, final) {
            try {
                if (self.readyState !== WebSocket.OPEN) throw new Error("not opened");
                options.fin = !0 === final, self._sender.send(data, options), final ? executeQueueSends(self) : process.nextTick(cb.bind(null, null, send));
            } catch (e) {
                "function" == typeof cb ? cb(e) : (delete self._queue, self.emit("error", e));
            }
        })))); else {
            if ("function" != typeof cb) throw new Error("not opened");
            cb(new Error("not opened"));
        }
    }, WebSocket.prototype.terminate = function() {
        if (this.readyState !== WebSocket.CLOSED) if (this._socket) {
            this.readyState = WebSocket.CLOSING;
            try {
                this._socket.end();
            } catch (e) {
                return void cleanupWebsocketResources.call(this, !0);
            }
            this._closeTimer && clearTimeout(this._closeTimer), this._closeTimer = setTimeout(cleanupWebsocketResources.bind(this, !0), 3e4);
        } else this.readyState === WebSocket.CONNECTING && cleanupWebsocketResources.call(this, !0);
    }, Object.defineProperty(WebSocket.prototype, "bufferedAmount", {
        get: function() {
            var amount = 0;
            return this._socket && (amount = this._socket.bufferSize || 0), amount;
        }
    }), Object.defineProperty(WebSocket.prototype, "binaryType", {
        get: function() {
            return this._binaryType;
        },
        set: function(type) {
            if ("arraybuffer" !== type && "nodebuffer" !== type) throw new SyntaxError('unsupported binaryType: must be either "nodebuffer" or "arraybuffer"');
            this._binaryType = type;
        }
    }), [ "open", "error", "close", "message" ].forEach((function(method) {
        Object.defineProperty(WebSocket.prototype, "on" + method, {
            get: function() {
                var listener = this.listeners(method)[0];
                return listener ? listener._listener ? listener._listener : listener : void 0;
            },
            set: function(listener) {
                this.removeAllListeners(method), this.addEventListener(method, listener);
            }
        });
    })), WebSocket.prototype.addEventListener = function(method, listener) {
        var target = this;
        function onMessage(data, flags) {
            flags.binary && "arraybuffer" === this.binaryType && (data = new Uint8Array(data).buffer), 
            listener.call(target, new MessageEvent(data, !!flags.binary, target));
        }
        function onClose(code, message) {
            listener.call(target, new CloseEvent(code, message, target));
        }
        function onError(event) {
            event.type = "error", event.target = target, listener.call(target, event);
        }
        function onOpen() {
            listener.call(target, new OpenEvent(target));
        }
        "function" == typeof listener && ("message" === method ? (onMessage._listener = listener, 
        this.on(method, onMessage)) : "close" === method ? (onClose._listener = listener, 
        this.on(method, onClose)) : "error" === method ? (onError._listener = listener, 
        this.on(method, onError)) : "open" === method ? (onOpen._listener = listener, this.on(method, onOpen)) : this.on(method, listener));
    }, module.exports = WebSocket, module.exports.buildHostHeader = buildHostHeader;
}
