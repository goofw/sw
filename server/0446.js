function(module, exports, __webpack_require__) {
    var EventEmitter = __webpack_require__(5).EventEmitter;
    function PacketStreamWrapper(stream) {
        EventEmitter.call(this), this.stream = stream;
        var state = 0, packetLength = 0, self = this;
        this.stream.on("readable", (function() {
            for (;;) switch (state) {
              case 0:
                var header = stream.read(4);
                if (null === header) return;
                packetLength = header.readUInt32BE(0), state = 1;
                break;

              case 1:
                var packet = stream.read(packetLength);
                if (null === packet) return;
                self.emit("packet", packet), state = 0;
            }
        }));
    }
    (0, __webpack_require__(0).inherits)(PacketStreamWrapper, EventEmitter), PacketStreamWrapper.prototype.send = function(buf) {
        var header = new Buffer(4);
        header.writeUInt32BE(buf.length, 0), this.stream.write(Buffer.concat([ header, buf ]));
    }, module.exports = PacketStreamWrapper;
}
