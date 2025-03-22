function(module, exports, __webpack_require__) {
    var events = __webpack_require__(5), util = __webpack_require__(0);
    function Sender(socket) {
        if (this instanceof Sender == 0) throw new TypeError("Classes can't be function-called");
        events.EventEmitter.call(this), this.socket = socket, this.continuationFrame = !1, 
        this.isClosed = !1;
    }
    events.EventEmitter, module.exports = Sender, util.inherits(Sender, events.EventEmitter), 
    Sender.prototype.send = function(data, options, cb) {
        if (!this.isClosed) {
            var isString = "string" == typeof data, length = isString ? Buffer.byteLength(data) : data.length, lengthbytes = length > 127 ? 2 : 1, writeStartMarker = 0 == this.continuationFrame, writeEndMarker = !options || !(void 0 !== options.fin && !options.fin), buffer = new Buffer((writeStartMarker ? options && options.binary ? 1 + lengthbytes : 1 : 0) + length + (!writeEndMarker || options && options.binary ? 0 : 1)), offset = writeStartMarker ? 1 : 0;
            writeStartMarker && (options && options.binary ? (buffer.write("", "binary"), lengthbytes > 1 && buffer.write(String.fromCharCode(128 + length / 128), offset++, "binary"), 
            buffer.write(String.fromCharCode(127 & length), offset++, "binary")) : buffer.write("\0", "binary")), 
            isString ? buffer.write(data, offset, "utf8") : data.copy(buffer, offset, 0), writeEndMarker ? (options && options.binary || buffer.write("ÿ", offset + length, "binary"), 
            this.continuationFrame = !1) : this.continuationFrame = !0;
            try {
                this.socket.write(buffer, "binary", cb);
            } catch (e) {
                this.error(e.toString());
            }
        }
    }, Sender.prototype.close = function(code, data, mask, cb) {
        if (!this.isClosed) {
            this.isClosed = !0;
            try {
                this.continuationFrame && this.socket.write(new Buffer([ 255 ], "binary")), this.socket.write(new Buffer([ 255, 0 ]), "binary", cb);
            } catch (e) {
                this.error(e.toString());
            }
        }
    }, Sender.prototype.ping = function(data, options) {}, Sender.prototype.pong = function(data, options) {}, 
    Sender.prototype.error = function(reason) {
        return this.emit("error", reason), this;
    };
}
