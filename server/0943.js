function(module, exports, __webpack_require__) {
    var EventEmitter = __webpack_require__(5).EventEmitter, util = __webpack_require__(0), tls = __webpack_require__(92), debug = __webpack_require__(8)("castv2"), protocol = __webpack_require__(222), PacketStreamWrapper = __webpack_require__(446), Channel = __webpack_require__(949), CastMessage = protocol.CastMessage;
    function Client() {
        EventEmitter.call(this), this.socket = null, this.ps = null;
    }
    util.inherits(Client, EventEmitter), Client.prototype.connect = function(options, callback) {
        var self = this;
        function onerror(err) {
            debug("error: %s %j", err.message, err), self.emit("error", err);
        }
        function onpacket(buf) {
            var message = CastMessage.parse(buf);
            if (debug("recv message: protocolVersion=%s sourceId=%s destinationId=%s namespace=%s data=%s", message.protocol_version, message.source_id, message.destination_id, message.namespace, 1 === message.payload_type ? util.inspect(message.payload_binary) : message.payload_utf8), 
            0 !== message.protocol_version) return self.emit("error", new Error("Unsupported protocol version: " + message.protocol_version)), 
            void self.close();
            self.emit("message", message.source_id, message.destination_id, message.namespace, 1 === message.payload_type ? message.payload_binary : message.payload_utf8);
        }
        "string" == typeof options && (options = {
            host: options
        }), options.port = options.port || 8009, options.rejectUnauthorized = !1, callback && this.once("connect", callback), 
        debug("connecting to %s:%d ...", options.host, options.port), this.socket = tls.connect(options, (function() {
            self.ps = new PacketStreamWrapper(self.socket), self.ps.on("packet", onpacket), 
            debug("connected"), self.emit("connect");
        })), this.socket.on("error", onerror), this.socket.once("close", (function() {
            debug("connection closed"), self.socket.removeListener("error", onerror), self.socket = null, 
            self.ps && (self.ps.removeListener("packet", onpacket), self.ps = null), self.emit("close");
        }));
    }, Client.prototype.close = function() {
        debug("closing connection ..."), this.socket.destroy();
    }, Client.prototype.send = function(sourceId, destinationId, namespace, data) {
        var message = {
            protocol_version: 0,
            source_id: sourceId,
            destination_id: destinationId,
            namespace: namespace
        };
        Buffer.isBuffer(data) ? (message.payload_type = 1, message.payload_binary = data) : (message.payload_type = 0, 
        message.payload_utf8 = data), debug("send message: protocolVersion=%s sourceId=%s destinationId=%s namespace=%s data=%s", message.protocol_version, message.source_id, message.destination_id, message.namespace, 1 === message.payload_type ? util.inspect(message.payload_binary) : message.payload_utf8);
        var buf = CastMessage.serialize(message);
        this.ps.send(buf);
    }, Client.prototype.createChannel = function(sourceId, destinationId, namespace, encoding) {
        return new Channel(this, sourceId, destinationId, namespace, encoding);
    }, module.exports = Client;
}
