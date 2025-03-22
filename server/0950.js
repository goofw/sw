function(module, exports, __webpack_require__) {
    var EventEmitter = __webpack_require__(5).EventEmitter, util = __webpack_require__(0), tls = __webpack_require__(92), debug = __webpack_require__(8)("castv2"), protocol = __webpack_require__(222), PacketStreamWrapper = __webpack_require__(446), CastMessage = protocol.CastMessage;
    function Server(options) {
        EventEmitter.call(this), this.server = new tls.Server(options), this.clients = {};
    }
    function genClientId(socket) {
        return [ socket.remoteAddress, socket.remotePort ].join(":");
    }
    util.inherits(Server, EventEmitter), Server.prototype.listen = function(port, host, callback) {
        var self = this, args = Array.prototype.slice.call(arguments);
        function onlisten() {
            var addr = self.server.address();
            debug("server listening on %s:%d", addr.address, addr.port), callback && callback();
        }
        function onconnect(socket) {
            debug("connection from %s:%d", socket.remoteAddress, socket.remotePort);
            var ps = new PacketStreamWrapper(socket), clientId = genClientId(socket);
            function onpacket(buf) {
                var message = CastMessage.parse(buf);
                if (debug("recv message: clientId=%s protocolVersion=%s sourceId=%s destinationId=%s namespace=%s data=%s", clientId, message.protocol_version, message.source_id, message.destination_id, message.namespace, 1 === message.payload_type ? util.inspect(message.payload_binary) : message.payload_utf8), 
                0 !== message.protocol_version) return debug("client error: clientId=%s unsupported protocol version (%s)", clientId, message.protocolVersion), 
                void self.clients[clientId].socket.end();
                self.emit("message", clientId, message.source_id, message.destination_id, message.namespace, 1 === message.payload_type ? message.payload_binary : message.payload_utf8);
            }
            ps.on("packet", onpacket), socket.once("close", (function() {
                debug("client %s disconnected", clientId), ps.removeListener("packet", onpacket), 
                delete self.clients[clientId];
            })), self.clients[clientId] = {
                socket: socket,
                ps: ps
            };
        }
        function onshutdown() {
            debug("server shutting down"), self.server.removeListener("secureConnection", onconnect), 
            self.emit("close");
        }
        function onerror(err) {
            debug("error: %s %j", err.message, err), self.emit("error", err);
        }
        "function" == typeof args[args.length - 1] && (callback = args.pop()), this.server.listen.apply(this.server, args.concat([ onlisten ])), 
        this.server.on("secureConnection", onconnect), this.server.on("error", onerror), 
        this.server.once("close", onshutdown);
    }, Server.prototype.close = function() {
        for (var clientId in this.server.close(), this.clients) this.clients[clientId].socket.end();
    }, Server.prototype.send = function(clientId, sourceId, destinationId, namespace, data) {
        var message = {
            protocol_version: 0,
            source_id: sourceId,
            destination_id: destinationId,
            namespace: namespace
        };
        Buffer.isBuffer(data) ? (message.payload_type = 1, message.payload_binary = data) : (message.payload_type = 0, 
        message.payload_utf8 = data), debug("send message: clientId=%s protocolVersion=%s sourceId=%s destinationId=%s namespace=%s data=%s", clientId, message.protocol_version, message.source_id, message.destination_id, message.namespace, 1 === message.payload_type ? util.inspect(message.payload_binary) : message.payload_utf8);
        var buf = CastMessage.serialize(message);
        this.clients[clientId].ps.send(buf);
    }, module.exports = Server;
}
