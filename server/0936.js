function(module, exports, __webpack_require__) {
    "use strict";
    __webpack_require__(42);
    var debug, tls = __webpack_require__(92), http = __webpack_require__(11), https = __webpack_require__(22), events = __webpack_require__(5), assert = __webpack_require__(24), util = __webpack_require__(0), Buffer = __webpack_require__(23).Buffer;
    function TunnelingAgent(options) {
        var self = this;
        self.options = options || {}, self.proxyOptions = self.options.proxy || {}, self.maxSockets = self.options.maxSockets || http.Agent.defaultMaxSockets, 
        self.requests = [], self.sockets = [], self.on("free", (function(socket, host, port) {
            for (var i = 0, len = self.requests.length; i < len; ++i) {
                var pending = self.requests[i];
                if (pending.host === host && pending.port === port) return self.requests.splice(i, 1), 
                void pending.request.onSocket(socket);
            }
            socket.destroy(), self.removeSocket(socket);
        }));
    }
    function createSecureSocket(options, cb) {
        var self = this;
        TunnelingAgent.prototype.createSocket.call(self, options, (function(socket) {
            var secureSocket = tls.connect(0, mergeOptions({}, self.options, {
                servername: options.host,
                socket: socket
            }));
            self.sockets[self.sockets.indexOf(socket)] = secureSocket, cb(secureSocket);
        }));
    }
    function mergeOptions(target) {
        for (var i = 1, len = arguments.length; i < len; ++i) {
            var overrides = arguments[i];
            if ("object" == typeof overrides) for (var keys = Object.keys(overrides), j = 0, keyLen = keys.length; j < keyLen; ++j) {
                var k = keys[j];
                void 0 !== overrides[k] && (target[k] = overrides[k]);
            }
        }
        return target;
    }
    exports.httpOverHttp = function(options) {
        var agent = new TunnelingAgent(options);
        return agent.request = http.request, agent;
    }, exports.httpsOverHttp = function(options) {
        var agent = new TunnelingAgent(options);
        return agent.request = http.request, agent.createSocket = createSecureSocket, agent.defaultPort = 443, 
        agent;
    }, exports.httpOverHttps = function(options) {
        var agent = new TunnelingAgent(options);
        return agent.request = https.request, agent;
    }, exports.httpsOverHttps = function(options) {
        var agent = new TunnelingAgent(options);
        return agent.request = https.request, agent.createSocket = createSecureSocket, agent.defaultPort = 443, 
        agent;
    }, util.inherits(TunnelingAgent, events.EventEmitter), TunnelingAgent.prototype.addRequest = function(req, options) {
        var self = this;
        "string" == typeof options && (options = {
            host: options,
            port: arguments[2],
            path: arguments[3]
        }), self.sockets.length >= this.maxSockets ? self.requests.push({
            host: options.host,
            port: options.port,
            request: req
        }) : self.createConnection({
            host: options.host,
            port: options.port,
            request: req
        });
    }, TunnelingAgent.prototype.createConnection = function(pending) {
        var self = this;
        self.createSocket(pending, (function(socket) {
            function onFree() {
                self.emit("free", socket, pending.host, pending.port);
            }
            function onCloseOrRemove(err) {
                self.removeSocket(socket), socket.removeListener("free", onFree), socket.removeListener("close", onCloseOrRemove), 
                socket.removeListener("agentRemove", onCloseOrRemove);
            }
            socket.on("free", onFree), socket.on("close", onCloseOrRemove), socket.on("agentRemove", onCloseOrRemove), 
            pending.request.onSocket(socket);
        }));
    }, TunnelingAgent.prototype.createSocket = function(options, cb) {
        var self = this, placeholder = {};
        self.sockets.push(placeholder);
        var connectOptions = mergeOptions({}, self.proxyOptions, {
            method: "CONNECT",
            path: options.host + ":" + options.port,
            agent: !1
        });
        connectOptions.proxyAuth && (connectOptions.headers = connectOptions.headers || {}, 
        connectOptions.headers["Proxy-Authorization"] = "Basic " + Buffer.from(connectOptions.proxyAuth).toString("base64")), 
        debug("making CONNECT request");
        var connectReq = self.request(connectOptions);
        function onConnect(res, socket, head) {
            if (connectReq.removeAllListeners(), socket.removeAllListeners(), 200 === res.statusCode) assert.equal(head.length, 0), 
            debug("tunneling connection has established"), self.sockets[self.sockets.indexOf(placeholder)] = socket, 
            cb(socket); else {
                debug("tunneling socket could not be established, statusCode=%d", res.statusCode);
                var error = new Error("tunneling socket could not be established, statusCode=" + res.statusCode);
                error.code = "ECONNRESET", options.request.emit("error", error), self.removeSocket(placeholder);
            }
        }
        connectReq.useChunkedEncodingByDefault = !1, connectReq.once("response", (function(res) {
            res.upgrade = !0;
        })), connectReq.once("upgrade", (function(res, socket, head) {
            process.nextTick((function() {
                onConnect(res, socket, head);
            }));
        })), connectReq.once("connect", onConnect), connectReq.once("error", (function(cause) {
            connectReq.removeAllListeners(), debug("tunneling socket could not be established, cause=%s\n", cause.message, cause.stack);
            var error = new Error("tunneling socket could not be established, cause=" + cause.message);
            error.code = "ECONNRESET", options.request.emit("error", error), self.removeSocket(placeholder);
        })), connectReq.end();
    }, TunnelingAgent.prototype.removeSocket = function(socket) {
        var pos = this.sockets.indexOf(socket);
        if (-1 !== pos) {
            this.sockets.splice(pos, 1);
            var pending = this.requests.shift();
            pending && this.createConnection(pending);
        }
    }, debug = process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG) ? function() {
        var args = Array.prototype.slice.call(arguments);
        "string" == typeof args[0] ? args[0] = "TUNNEL: " + args[0] : args.unshift("TUNNEL:"), 
        console.error.apply(console, args);
    } : function() {}, exports.debug = debug;
}
