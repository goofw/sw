function(module, exports, __webpack_require__) {
    var events = __webpack_require__(5), util = __webpack_require__(0), crypto = __webpack_require__(9), ErrorCodes = (events.EventEmitter, 
    __webpack_require__(265)), bufferUtil = __webpack_require__(266), PerMessageDeflate = __webpack_require__(115);
    function Sender(socket, extensions) {
        if (this instanceof Sender == 0) throw new TypeError("Classes can't be function-called");
        events.EventEmitter.call(this), this._socket = socket, this.extensions = extensions || {}, 
        this.firstFragment = !0, this.compress = !1, this.messageHandlers = [], this.processing = !1;
    }
    function writeUInt16BE(value, offset) {
        this[offset] = (65280 & value) >> 8, this[offset + 1] = 255 & value;
    }
    function writeUInt32BE(value, offset) {
        this[offset] = (4278190080 & value) >> 24, this[offset + 1] = (16711680 & value) >> 16, 
        this[offset + 2] = (65280 & value) >> 8, this[offset + 3] = 255 & value;
    }
    function getArrayBuffer(data) {
        for (var array = new Uint8Array(data.buffer || data), l = data.byteLength || data.length, o = data.byteOffset || 0, buffer = new Buffer(l), i = 0; i < l; ++i) buffer[i] = array[o + i];
        return buffer;
    }
    util.inherits(Sender, events.EventEmitter), Sender.prototype.close = function(code, data, mask, cb) {
        if (void 0 !== code && ("number" != typeof code || !ErrorCodes.isValidErrorCode(code))) throw new Error("first argument must be a valid error code number");
        code = code || 1e3;
        var dataBuffer = new Buffer(2 + (data ? Buffer.byteLength(data) : 0));
        writeUInt16BE.call(dataBuffer, code, 0), dataBuffer.length > 2 && dataBuffer.write(data, 2);
        var self = this;
        this.messageHandlers.push((function() {
            self.frameAndSend(8, dataBuffer, !0, mask), "function" == typeof cb && cb();
        })), this.flush();
    }, Sender.prototype.ping = function(data, options) {
        var mask = options && options.mask, self = this;
        this.messageHandlers.push((function() {
            self.frameAndSend(9, data || "", !0, mask);
        })), this.flush();
    }, Sender.prototype.pong = function(data, options) {
        var mask = options && options.mask, self = this;
        this.messageHandlers.push((function() {
            self.frameAndSend(10, data || "", !0, mask);
        })), this.flush();
    }, Sender.prototype.send = function(data, options, cb) {
        var finalFragment = !options || !1 !== options.fin, mask = options && options.mask, compress = options && options.compress, opcode = options && options.binary ? 2 : 1;
        !1 === this.firstFragment ? (opcode = 0, compress = !1) : (this.firstFragment = !1, 
        this.compress = compress), finalFragment && (this.firstFragment = !0);
        var compressFragment = this.compress, self = this;
        this.messageHandlers.push((function() {
            data && compressFragment ? (self.processing = !0, self.applyExtensions(data, finalFragment, compressFragment, (function(err, data) {
                err ? "function" == typeof cb ? cb(err) : self.emit("error", err) : (self.frameAndSend(opcode, data, finalFragment, mask, compress, cb), 
                self.processing = !1, self.flush());
            }))) : self.frameAndSend(opcode, data, finalFragment, mask, compress, cb);
        })), this.flush();
    }, Sender.prototype.frameAndSend = function(opcode, data, finalFragment, maskData, compressed, cb) {
        var canModifyData = !1;
        if (data) {
            Buffer.isBuffer(data) || (canModifyData = !0, !data || void 0 === data.byteLength && void 0 === data.buffer ? ("number" == typeof data && (data = data.toString()), 
            data = new Buffer(data)) : data = getArrayBuffer(data));
            var dataLength = data.length, dataOffset = maskData ? 6 : 2, secondByte = dataLength;
            dataLength >= 65536 ? (dataOffset += 8, secondByte = 127) : dataLength > 125 && (dataOffset += 2, 
            secondByte = 126);
            var mergeBuffers = dataLength < 32768 || maskData && !canModifyData, outputBuffer = new Buffer(mergeBuffers ? dataLength + dataOffset : dataOffset);
            switch (outputBuffer[0] = finalFragment ? 128 | opcode : opcode, compressed && (outputBuffer[0] |= 64), 
            secondByte) {
              case 126:
                writeUInt16BE.call(outputBuffer, dataLength, 2);
                break;

              case 127:
                writeUInt32BE.call(outputBuffer, 0, 2), writeUInt32BE.call(outputBuffer, dataLength, 6);
            }
            if (maskData) {
                outputBuffer[1] = 128 | secondByte;
                var mask = crypto.randomBytes(4);
                if (outputBuffer[dataOffset - 4] = mask[0], outputBuffer[dataOffset - 3] = mask[1], 
                outputBuffer[dataOffset - 2] = mask[2], outputBuffer[dataOffset - 1] = mask[3], 
                mergeBuffers) {
                    bufferUtil.mask(data, mask, outputBuffer, dataOffset, dataLength);
                    try {
                        this._socket.write(outputBuffer, "binary", cb);
                    } catch (e) {
                        "function" == typeof cb ? cb(e) : this.emit("error", e);
                    }
                } else {
                    bufferUtil.mask(data, mask, data, 0, dataLength);
                    try {
                        this._socket.write(outputBuffer, "binary"), this._socket.write(data, "binary", cb);
                    } catch (e) {
                        "function" == typeof cb ? cb(e) : this.emit("error", e);
                    }
                }
            } else if (outputBuffer[1] = secondByte, mergeBuffers) {
                data.copy(outputBuffer, dataOffset);
                try {
                    this._socket.write(outputBuffer, "binary", cb);
                } catch (e) {
                    "function" == typeof cb ? cb(e) : this.emit("error", e);
                }
            } else try {
                this._socket.write(outputBuffer, "binary"), this._socket.write(data, "binary", cb);
            } catch (e) {
                "function" == typeof cb ? cb(e) : this.emit("error", e);
            }
        } else try {
            this._socket.write(new Buffer([ opcode | (finalFragment ? 128 : 0), 0 | (maskData ? 128 : 0) ].concat(maskData ? [ 0, 0, 0, 0 ] : [])), "binary", cb);
        } catch (e) {
            "function" == typeof cb ? cb(e) : this.emit("error", e);
        }
    }, Sender.prototype.flush = function() {
        for (;!this.processing && this.messageHandlers.length; ) this.messageHandlers.shift()();
    }, Sender.prototype.applyExtensions = function(data, fin, compress, callback) {
        (data.buffer || data) instanceof ArrayBuffer && (data = getArrayBuffer(data)), this.extensions[PerMessageDeflate.extensionName].compress(data, fin, callback);
    }, module.exports = Sender;
}
