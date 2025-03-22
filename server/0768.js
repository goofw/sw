function(module, exports, __webpack_require__) {
    var Duplex = __webpack_require__(3).Duplex || __webpack_require__(769).Duplex, bitfield = (__webpack_require__(5).EventEmitter, 
    __webpack_require__(772)), util = __webpack_require__(0), bncode = __webpack_require__(773), speedometer = __webpack_require__(382), bufferFrom = __webpack_require__(387), bufferAlloc = __webpack_require__(388), MESSAGE_PROTOCOL = bufferFrom([ 19, 66, 105, 116, 84, 111, 114, 114, 101, 110, 116, 32, 112, 114, 111, 116, 111, 99, 111, 108 ]), MESSAGE_KEEP_ALIVE = bufferFrom([ 0, 0, 0, 0 ]), MESSAGE_CHOKE = bufferFrom([ 0, 0, 0, 1, 0 ]), MESSAGE_UNCHOKE = bufferFrom([ 0, 0, 0, 1, 1 ]), MESSAGE_INTERESTED = bufferFrom([ 0, 0, 0, 1, 2 ]), MESSAGE_UNINTERESTED = bufferFrom([ 0, 0, 0, 1, 3 ]), MESSAGE_RESERVED = [ 0, 0, 0, 0, 0, 0, 0, 0 ], MESSAGE_PORT = [ 0, 0, 0, 3, 9, 0, 0 ], noop = function() {}, pull = function(requests, piece, offset, length) {
        for (var i = 0; i < requests.length; i++) {
            var req = requests[i];
            if (req.piece === piece && req.offset === offset && req.length === length) return 0 === i ? requests.shift() : requests.splice(i, 1), 
            req;
        }
        return null;
    }, Request = function(piece, offset, length, callback) {
        this.piece = piece, this.offset = offset, this.length = length, this.callback = callback, 
        this.timeout = null;
    }, Wire = function(opts) {
        if (!(this instanceof Wire)) return new Wire(opts);
        opts || (opts = {}), Duplex.call(this);
        var self = this;
        this.amChoking = !0, this.amInterested = !1, this.peerChoking = !0, this.peerInterested = !1, 
        this.peerPieces = [], this.peerExtensions = {}, this.peerAddress = null, this.uploaded = 0, 
        this.downloaded = 0, this.uploadSpeed = speedometer(opts.speed), this.downloadSpeed = speedometer(opts.speed), 
        this.requests = [], this.peerRequests = [], this._keepAlive = null, this._finished = !1, 
        this.on("finish", (function() {
            for (self._finished = !0, self.push(null), clearInterval(self._keepAlive), self._parse(Number.MAX_VALUE, noop); self.peerRequests.length; ) self.peerRequests.pop();
            for (;self.requests.length; ) self._callback(self.requests.shift(), new Error("wire is closed"), null);
        })), this._timeout = 0, this._ontimeout = function() {
            self._callback(self.requests.shift(), new Error("request has timed out"), null), 
            self.emit("timeout");
        };
        var onmessagelength = function(buffer) {
            var length = buffer.readUInt32BE(0);
            if (length) return self._parse(length, onmessage);
            self._parse(4, onmessagelength), self.emit("keep-alive");
        }, onmessage = function(buffer) {
            switch (self._parse(4, onmessagelength), buffer[0]) {
              case 0:
                return self._onchoke();

              case 1:
                return self._onunchoke();

              case 2:
                return self._oninterested();

              case 3:
                return self._onuninterested();

              case 4:
                return self._onhave(buffer.readUInt32BE(1));

              case 5:
                return self._onbitfield(buffer.slice(1));

              case 6:
                return self._onrequest(buffer.readUInt32BE(1), buffer.readUInt32BE(5), buffer.readUInt32BE(9));

              case 7:
                return self._onpiece(buffer.readUInt32BE(1), buffer.readUInt32BE(5), buffer.slice(9));

              case 8:
                return self._oncancel(buffer.readUInt32BE(1), buffer.readUInt32BE(5), buffer.readUInt32BE(9));

              case 9:
                return self._onport(buffer.readUInt16BE(1));

              case 20:
                return self._onextended(buffer.readUInt8(1), buffer.slice(2));
            }
            self.emit("unknownmessage", buffer);
        };
        this._buffer = [], this._bufferSize = 0, this._parser = null, this._parserSize = 0, 
        this._parse(1, (function(buffer) {
            var pstrlen = buffer.readUInt8(0);
            self._parse(pstrlen + 48, (function(handshake) {
                handshake = handshake.slice(pstrlen), self._onhandshake(handshake.slice(8, 28), handshake.slice(28, 48), {
                    dht: !!(1 & handshake[7]),
                    extended: !!(16 & handshake[5])
                }), self._parse(4, onmessagelength);
            }));
        }));
    };
    util.inherits(Wire, Duplex), Wire.prototype.handshake = function(infoHash, peerId, extensions) {
        if ("string" == typeof infoHash && (infoHash = bufferFrom(infoHash, "hex")), "string" == typeof peerId && (peerId = bufferFrom(peerId)), 
        20 !== infoHash.length || 20 !== peerId.length) throw new Error("infoHash and peerId MUST have length 20");
        var reserved = bufferFrom(MESSAGE_RESERVED);
        extensions && extensions.dht && (reserved[7] |= 1), reserved[5] |= 16, this._push(Buffer.concat([ MESSAGE_PROTOCOL, reserved, infoHash, peerId ], MESSAGE_PROTOCOL.length + 48));
    }, Wire.prototype.choke = function() {
        if (!this.amChoking) {
            for (this.amChoking = !0; this.peerRequests.length; ) this.peerRequests.pop();
            this._push(MESSAGE_CHOKE);
        }
    }, Wire.prototype.unchoke = function() {
        this.amChoking && (this.amChoking = !1, this._push(MESSAGE_UNCHOKE));
    }, Wire.prototype.interested = function() {
        this.amInterested || (this.amInterested = !0, this._push(MESSAGE_INTERESTED));
    }, Wire.prototype.uninterested = function() {
        this.amInterested && (this.amInterested = !1, this._push(MESSAGE_UNINTERESTED));
    }, Wire.prototype.have = function(i) {
        this._message(4, [ i ], null);
    }, Wire.prototype.bitfield = function(bitfield) {
        bitfield.buffer && (bitfield = bitfield.buffer), this._message(5, [], bitfield);
    }, Wire.prototype.request = function(i, offset, length, callback) {
        return callback || (callback = noop), this._finished ? callback(new Error("wire is closed")) : this.peerChoking ? callback(new Error("peer is choking")) : (this.requests.push(new Request(i, offset, length, callback)), 
        this._updateTimeout(), void this._message(6, [ i, offset, length ], null));
    }, Wire.prototype.piece = function(i, offset, buffer) {
        this.uploaded += buffer.length, this.uploadSpeed(buffer.length), this.emit("upload", buffer.length), 
        this._message(7, [ i, offset ], buffer);
    }, Wire.prototype.cancel = function(i, offset, length) {
        this._callback(pull(this.requests, i, offset, length), new Error("request was cancelled"), null), 
        this._message(8, [ i, offset, length ], null);
    }, Wire.prototype.extended = function(id, msg) {
        this._message(20, [], Buffer.concat([ bufferFrom([ id ]), Buffer.isBuffer(msg) ? msg : bncode.encode(msg) ]));
    }, Wire.prototype.port = function(port) {
        var message = bufferFrom(MESSAGE_PORT);
        message.writeUInt16BE(port, 5), this._push(message);
    }, Wire.prototype.setKeepAlive = function(bool) {
        clearInterval(this._keepAlive), !1 !== bool && (this._keepAlive = setInterval(this._push.bind(this, MESSAGE_KEEP_ALIVE), 6e4));
    }, Wire.prototype.setTimeout = function(ms, fn) {
        this.requests.length && clearTimeout(this.requests[0].timeout), this._timeout = ms, 
        this._updateTimeout(), fn && this.on("timeout", fn);
    }, Wire.prototype.destroy = function() {
        this.emit("close"), this.end();
    }, Wire.prototype._onhandshake = function(infoHash, peerId, extensions) {
        this.peerExtensions = extensions, this.emit("handshake", infoHash, peerId, extensions);
    }, Wire.prototype._oninterested = function() {
        this.peerInterested = !0, this.emit("interested");
    }, Wire.prototype._onuninterested = function() {
        this.peerInterested = !1, this.emit("uninterested");
    }, Wire.prototype._onchoke = function() {
        for (this.peerChoking = !0, this.emit("choke"); this.requests.length; ) this._callback(this.requests.shift(), new Error("peer is choking"), null);
    }, Wire.prototype._onunchoke = function() {
        this.peerChoking = !1, this.emit("unchoke");
    }, Wire.prototype._onbitfield = function(buffer) {
        for (var pieces = bitfield(buffer), i = 0; i < 8 * buffer.length; i++) this.peerPieces[i] = pieces.get(i);
        this.emit("bitfield", buffer);
    }, Wire.prototype._onhave = function(i) {
        this.peerPieces[i] = !0, this.emit("have", i);
    }, Wire.prototype._onrequest = function(i, offset, length) {
        if (!this.amChoking) {
            var self = this, respond = function(err, buffer) {
                request === pull(self.peerRequests, i, offset, length) && (err || self.piece(i, offset, buffer));
            }, request = new Request(i, offset, length, respond);
            this.peerRequests.push(request), this.emit("request", i, offset, length, respond);
        }
    }, Wire.prototype._oncancel = function(i, offset, length) {
        pull(this.peerRequests, i, offset, length), this.emit("cancel", i, offset, length);
    }, Wire.prototype._onpiece = function(i, offset, buffer) {
        this._callback(pull(this.requests, i, offset, buffer.length), null, buffer), this.downloaded += buffer.length, 
        this.downloadSpeed(buffer.length), this.emit("download", buffer.length), this.emit("piece", i, offset, buffer);
    }, Wire.prototype._onport = function(port) {
        this.emit("port", port);
    }, Wire.prototype._onextended = function(id, ext) {
        this.emit("extended", id, ext);
    }, Wire.prototype._callback = function(request, err, buffer) {
        request && (request.timeout && clearTimeout(request.timeout), this.peerChoking || this._finished || this._updateTimeout(), 
        request.callback(err, buffer));
    }, Wire.prototype._updateTimeout = function() {
        this._timeout && this.requests.length && !this.requests[0].timeout && (this.requests[0].timeout = setTimeout(this._ontimeout, this._timeout));
    }, Wire.prototype._message = function(id, numbers, data) {
        var dataLength = data ? data.length : 0, buffer = bufferAlloc(5 + 4 * numbers.length);
        buffer.writeUInt32BE(buffer.length + dataLength - 4, 0), buffer[4] = id;
        for (var i = 0; i < numbers.length; i++) buffer.writeUInt32BE(numbers[i], 5 + 4 * i);
        this._push(buffer), data && this._push(data);
    }, Wire.prototype._push = function(data) {
        this._finished || this.push(data);
    }, Wire.prototype._parse = function(size, parser) {
        this._parserSize = size, this._parser = parser;
    }, Wire.prototype._write = function(data, encoding, callback) {
        for (this._bufferSize += data.length, this._buffer.push(data); this._bufferSize >= this._parserSize; ) {
            var buffer = 1 === this._buffer.length ? this._buffer[0] : Buffer.concat(this._buffer, this._bufferSize);
            this._bufferSize -= this._parserSize, this._buffer = this._bufferSize ? [ buffer.slice(this._parserSize) ] : [], 
            this._parser(buffer.slice(0, this._parserSize));
        }
        callback();
    }, Wire.prototype._read = noop, module.exports = Wire;
}
