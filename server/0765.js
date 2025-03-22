function(module, exports, __webpack_require__) {
    var offset, then, dgram = __webpack_require__(69), cyclist = __webpack_require__(766), util = __webpack_require__(0), EventEmitter = __webpack_require__(5).EventEmitter, Duplex = __webpack_require__(3).Duplex, uint32 = function(n) {
        return n >>> 0;
    }, uint16 = function(n) {
        return 65535 & n;
    }, timestamp = (offset = process.hrtime(), then = 1e3 * Date.now(), function() {
        var diff = process.hrtime(offset);
        return uint32(then + 1e6 * diff[0] + (diff[1] / 1e3 | 0));
    }), bufferToPacket = function(buffer) {
        var packet = {};
        return packet.id = 240 & buffer[0], packet.connection = buffer.readUInt16BE(2), 
        packet.timestamp = buffer.readUInt32BE(4), packet.timediff = buffer.readUInt32BE(8), 
        packet.window = buffer.readUInt32BE(12), packet.seq = buffer.readUInt16BE(16), packet.ack = buffer.readUInt16BE(18), 
        packet.data = buffer.length > 20 ? buffer.slice(20) : null, packet;
    }, createPacket = function(connection, id, data) {
        return {
            id: id,
            connection: 64 === id ? connection._recvId : connection._sendId,
            seq: connection._seq,
            ack: connection._ack,
            timestamp: timestamp(),
            timediff: 0,
            window: 262144,
            data: data,
            sent: 0
        };
    }, Connection = function(port, host, socket, syn) {
        Duplex.call(this);
        var self = this;
        this.port = port, this.host = host, this.socket = socket, this._outgoing = cyclist(512), 
        this._incoming = cyclist(512), this._inflightPackets = 0, this._closed = !1, this._alive = !1, 
        syn ? (this._connecting = !1, this._recvId = uint16(syn.connection + 1), this._sendId = syn.connection, 
        this._seq = 65535 * Math.random() | 0, this._ack = syn.seq, this._synack = createPacket(this, 32, null), 
        this._transmit(this._synack)) : (this._connecting = !0, this._recvId = 0, this._sendId = 0, 
        this._seq = 65535 * Math.random() | 0, this._ack = 0, this._synack = null, socket.on("listening", (function() {
            self._recvId = socket.address().port, self._sendId = uint16(self._recvId + 1), self._sendOutgoing(createPacket(self, 64, null));
        })), socket.on("error", (function(err) {
            self.emit("error", err);
        })), socket.bind());
        var resend = setInterval(this._resend.bind(this), 500), keepAlive = setInterval(this._keepAlive.bind(this), 1e4), tick = 0, closed = function() {
            2 == ++tick && self._closing();
        }, sendFin = function() {
            if (self._connecting) return self.once("connect", sendFin);
            self._sendOutgoing(createPacket(self, 16, null)), self.once("flush", closed);
        };
        this.once("finish", sendFin), this.once("close", (function() {
            syn || setTimeout(socket.close.bind(socket), 5e3), clearInterval(resend), clearInterval(keepAlive);
        })), this.once("end", (function() {
            process.nextTick(closed);
        }));
    };
    util.inherits(Connection, Duplex), Connection.prototype.setTimeout = function() {}, 
    Connection.prototype.destroy = function() {
        this.end();
    }, Connection.prototype.address = function() {
        return {
            port: this.port,
            address: this.host
        };
    }, Connection.prototype._read = function() {}, Connection.prototype._write = function(data, enc, callback) {
        if (this._connecting) return this._writeOnce("connect", data, enc, callback);
        for (;this._writable(); ) {
            var payload = this._payload(data);
            if (this._sendOutgoing(createPacket(this, 0, payload)), payload.length === data.length) return callback();
            data = data.slice(payload.length);
        }
        this._writeOnce("flush", data, enc, callback);
    }, Connection.prototype._writeOnce = function(event, data, enc, callback) {
        this.once(event, (function() {
            this._write(data, enc, callback);
        }));
    }, Connection.prototype._writable = function() {
        return this._inflightPackets < 511;
    }, Connection.prototype._payload = function(data) {
        return data.length > 1400 ? data.slice(0, 1400) : data;
    }, Connection.prototype._resend = function() {
        var offset = this._seq - this._inflightPackets, first = this._outgoing.get(offset);
        if (first) {
            var now = timestamp();
            if (!(uint32(first.sent - now) < 5e5)) for (var i = 0; i < this._inflightPackets; i++) {
                var packet = this._outgoing.get(offset + i);
                uint32(packet.sent - now) >= 5e5 && this._transmit(packet);
            }
        }
    }, Connection.prototype._keepAlive = function() {
        if (this._alive) return this._alive = !1;
        this._sendAck();
    }, Connection.prototype._closing = function() {
        this._closed || (this._closed = !0, process.nextTick(this.emit.bind(this, "close")));
    }, Connection.prototype._recvAck = function(ack) {
        var offset = this._seq - this._inflightPackets, acked = uint16(ack - offset) + 1;
        if (!(acked >= 512)) {
            for (var i = 0; i < acked; i++) this._outgoing.del(offset + i), this._inflightPackets--;
            this._inflightPackets || this.emit("flush");
        }
    }, Connection.prototype._recvIncoming = function(packet) {
        if (!this._closed) if (64 === packet.id && this._connecting) this._transmit(this._synack); else {
            if (48 === packet.id) return this.push(null), this.end(), void this._closing();
            if (this._connecting) {
                if (32 !== packet.id) return this._incoming.put(packet.seq, packet);
                if (this._ack = uint16(packet.seq - 1), this._recvAck(packet.ack), this._connecting = !1, 
                this.emit("connect"), !(packet = this._incoming.del(packet.seq))) return;
            }
            if (uint16(packet.seq - this._ack) >= 512) return this._sendAck();
            if (this._recvAck(packet.ack), 32 !== packet.id) {
                for (this._incoming.put(packet.seq, packet); packet = this._incoming.del(this._ack + 1); ) this._ack = uint16(this._ack + 1), 
                0 === packet.id && this.push(packet.data), 16 === packet.id && this.push(null);
                this._sendAck();
            }
        }
    }, Connection.prototype._sendAck = function() {
        this._transmit(createPacket(this, 32, null));
    }, Connection.prototype._sendOutgoing = function(packet) {
        this._outgoing.put(packet.seq, packet), this._seq = uint16(this._seq + 1), this._inflightPackets++, 
        this._transmit(packet);
    }, Connection.prototype._transmit = function(packet) {
        packet.sent = 0 === packet.sent ? packet.timestamp : timestamp();
        var message = (function(packet) {
            var buffer = new Buffer(20 + (packet.data ? packet.data.length : 0));
            return buffer[0] = 1 | packet.id, buffer[1] = 0, buffer.writeUInt16BE(packet.connection, 2), 
            buffer.writeUInt32BE(packet.timestamp, 4), buffer.writeUInt32BE(packet.timediff, 8), 
            buffer.writeUInt32BE(packet.window, 12), buffer.writeUInt16BE(packet.seq, 16), buffer.writeUInt16BE(packet.ack, 18), 
            packet.data && packet.data.copy(buffer, 20), buffer;
        })(packet);
        this._alive = !0, this.socket.send(message, 0, message.length, this.port, this.host);
    };
    var Server = function() {
        EventEmitter.call(this), this._socket = null, this._connections = {};
    };
    util.inherits(Server, EventEmitter), Server.prototype.address = function() {
        return this._socket.address();
    }, Server.prototype.listen = function(port, onlistening) {
        var socket = this._socket = dgram.createSocket("udp4"), connections = this._connections, self = this;
        socket.on("message", (function(message, rinfo) {
            if (!(message.length < 20)) {
                var packet = bufferToPacket(message), id = rinfo.address + ":" + (64 === packet.id ? uint16(packet.connection + 1) : packet.connection);
                if (connections[id]) return connections[id]._recvIncoming(packet);
                64 === packet.id && (connections[id] = new Connection(rinfo.port, rinfo.address, socket, packet), 
                connections[id].on("close", (function() {
                    delete connections[id];
                })), self.emit("connection", connections[id]));
            }
        })), socket.once("listening", (function() {
            self.emit("listening");
        })), onlistening && self.once("listening", onlistening), socket.bind(port);
    }, exports.createServer = function(onconnection) {
        var server = new Server;
        return onconnection && server.on("connection", onconnection), server;
    }, exports.connect = function(port, host) {
        var socket = dgram.createSocket("udp4"), connection = new Connection(port, host || "127.0.0.1", socket, null);
        return socket.on("message", (function(message) {
            if (!(message.length < 20)) {
                var packet = bufferToPacket(message);
                64 !== packet.id && packet.connection === connection._recvId && connection._recvIncoming(packet);
            }
        })), connection;
    };
}
