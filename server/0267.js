function(module, exports, __webpack_require__) {
    __webpack_require__(0);
    var isValidUTF8 = __webpack_require__(604), ErrorCodes = __webpack_require__(265), BufferPool = __webpack_require__(607), bufferUtil = __webpack_require__(266), PerMessageDeflate = __webpack_require__(115);
    function Receiver(extensions, maxPayload) {
        if (this instanceof Receiver == 0) throw new TypeError("Classes can't be function-called");
        "number" == typeof extensions && (maxPayload = extensions, extensions = {});
        var fragmentedPoolPrevUsed = -1;
        this.fragmentedBufferPool = new BufferPool(1024, (function(db, length) {
            return db.used + length;
        }), (function(db) {
            return fragmentedPoolPrevUsed = fragmentedPoolPrevUsed >= 0 ? Math.ceil((fragmentedPoolPrevUsed + db.used) / 2) : db.used;
        }));
        var unfragmentedPoolPrevUsed = -1;
        this.unfragmentedBufferPool = new BufferPool(1024, (function(db, length) {
            return db.used + length;
        }), (function(db) {
            return unfragmentedPoolPrevUsed = unfragmentedPoolPrevUsed >= 0 ? Math.ceil((unfragmentedPoolPrevUsed + db.used) / 2) : db.used;
        })), this.extensions = extensions || {}, this.maxPayload = maxPayload || 0, this.currentPayloadLength = 0, 
        this.state = {
            activeFragmentedOperation: null,
            lastFragment: !1,
            masked: !1,
            opcode: 0,
            fragmentedOperation: !1
        }, this.overflow = [], this.headerBuffer = new Buffer(10), this.expectOffset = 0, 
        this.expectBuffer = null, this.expectHandler = null, this.currentMessage = [], this.currentMessageLength = 0, 
        this.messageHandlers = [], this.expectHeader(2, this.processPacket), this.dead = !1, 
        this.processing = !1, this.onerror = function() {}, this.ontext = function() {}, 
        this.onbinary = function() {}, this.onclose = function() {}, this.onping = function() {}, 
        this.onpong = function() {};
    }
    function readUInt16BE(start) {
        return (this[start] << 8) + this[start + 1];
    }
    function readUInt32BE(start) {
        return (this[start] << 24) + (this[start + 1] << 16) + (this[start + 2] << 8) + this[start + 3];
    }
    function fastCopy(length, srcBuffer, dstBuffer, dstOffset) {
        switch (length) {
          default:
            srcBuffer.copy(dstBuffer, dstOffset, 0, length);
            break;

          case 16:
            dstBuffer[dstOffset + 15] = srcBuffer[15];

          case 15:
            dstBuffer[dstOffset + 14] = srcBuffer[14];

          case 14:
            dstBuffer[dstOffset + 13] = srcBuffer[13];

          case 13:
            dstBuffer[dstOffset + 12] = srcBuffer[12];

          case 12:
            dstBuffer[dstOffset + 11] = srcBuffer[11];

          case 11:
            dstBuffer[dstOffset + 10] = srcBuffer[10];

          case 10:
            dstBuffer[dstOffset + 9] = srcBuffer[9];

          case 9:
            dstBuffer[dstOffset + 8] = srcBuffer[8];

          case 8:
            dstBuffer[dstOffset + 7] = srcBuffer[7];

          case 7:
            dstBuffer[dstOffset + 6] = srcBuffer[6];

          case 6:
            dstBuffer[dstOffset + 5] = srcBuffer[5];

          case 5:
            dstBuffer[dstOffset + 4] = srcBuffer[4];

          case 4:
            dstBuffer[dstOffset + 3] = srcBuffer[3];

          case 3:
            dstBuffer[dstOffset + 2] = srcBuffer[2];

          case 2:
            dstBuffer[dstOffset + 1] = srcBuffer[1];

          case 1:
            dstBuffer[dstOffset] = srcBuffer[0];
        }
    }
    function clone(obj) {
        var cloned = {};
        for (var k in obj) obj.hasOwnProperty(k) && (cloned[k] = obj[k]);
        return cloned;
    }
    module.exports = Receiver, Receiver.prototype.add = function(data) {
        if (!this.dead) {
            var dataLength = data.length;
            if (0 != dataLength) if (null != this.expectBuffer) {
                var toRead = Math.min(dataLength, this.expectBuffer.length - this.expectOffset);
                for (fastCopy(toRead, data, this.expectBuffer, this.expectOffset), this.expectOffset += toRead, 
                toRead < dataLength && this.overflow.push(data.slice(toRead)); this.expectBuffer && this.expectOffset == this.expectBuffer.length; ) {
                    var bufferForHandler = this.expectBuffer;
                    this.expectBuffer = null, this.expectOffset = 0, this.expectHandler.call(this, bufferForHandler);
                }
            } else this.overflow.push(data);
        }
    }, Receiver.prototype.cleanup = function() {
        this.dead = !0, this.overflow = null, this.headerBuffer = null, this.expectBuffer = null, 
        this.expectHandler = null, this.unfragmentedBufferPool = null, this.fragmentedBufferPool = null, 
        this.state = null, this.currentMessage = null, this.onerror = null, this.ontext = null, 
        this.onbinary = null, this.onclose = null, this.onping = null, this.onpong = null;
    }, Receiver.prototype.expectHeader = function(length, handler) {
        if (0 != length) {
            this.expectBuffer = this.headerBuffer.slice(this.expectOffset, this.expectOffset + length), 
            this.expectHandler = handler;
            for (var toRead = length; toRead > 0 && this.overflow.length > 0; ) {
                var fromOverflow = this.overflow.pop();
                toRead < fromOverflow.length && this.overflow.push(fromOverflow.slice(toRead));
                var read = Math.min(fromOverflow.length, toRead);
                fastCopy(read, fromOverflow, this.expectBuffer, this.expectOffset), this.expectOffset += read, 
                toRead -= read;
            }
        } else handler(null);
    }, Receiver.prototype.expectData = function(length, handler) {
        if (0 != length) {
            this.expectBuffer = this.allocateFromPool(length, this.state.fragmentedOperation), 
            this.expectHandler = handler;
            for (var toRead = length; toRead > 0 && this.overflow.length > 0; ) {
                var fromOverflow = this.overflow.pop();
                toRead < fromOverflow.length && this.overflow.push(fromOverflow.slice(toRead));
                var read = Math.min(fromOverflow.length, toRead);
                fastCopy(read, fromOverflow, this.expectBuffer, this.expectOffset), this.expectOffset += read, 
                toRead -= read;
            }
        } else handler(null);
    }, Receiver.prototype.allocateFromPool = function(length, isFragmented) {
        return (isFragmented ? this.fragmentedBufferPool : this.unfragmentedBufferPool).get(length);
    }, Receiver.prototype.processPacket = function(data) {
        if (this.extensions[PerMessageDeflate.extensionName]) {
            if (0 != (48 & data[0])) return void this.error("reserved fields (2, 3) must be empty", 1002);
        } else if (0 != (112 & data[0])) return void this.error("reserved fields must be empty", 1002);
        this.state.lastFragment = 128 == (128 & data[0]), this.state.masked = 128 == (128 & data[1]);
        var compressed = 64 == (64 & data[0]), opcode = 15 & data[0];
        if (0 === opcode) {
            if (compressed) return void this.error("continuation frame cannot have the Per-message Compressed bits", 1002);
            if (this.state.fragmentedOperation = !0, this.state.opcode = this.state.activeFragmentedOperation, 
            1 != this.state.opcode && 2 != this.state.opcode) return void this.error("continuation frame cannot follow current opcode", 1002);
        } else {
            if (opcode < 3 && null != this.state.activeFragmentedOperation) return void this.error("data frames after the initial data frame must have opcode 0", 1002);
            if (opcode >= 8 && compressed) return void this.error("control frames cannot have the Per-message Compressed bits", 1002);
            this.state.compressed = compressed, this.state.opcode = opcode, !1 === this.state.lastFragment ? (this.state.fragmentedOperation = !0, 
            this.state.activeFragmentedOperation = opcode) : this.state.fragmentedOperation = !1;
        }
        var handler = opcodes[this.state.opcode];
        void 0 === handler ? this.error("no handler for opcode " + this.state.opcode, 1002) : handler.start.call(this, data);
    }, Receiver.prototype.endPacket = function() {
        this.dead || (this.state.fragmentedOperation ? this.state.lastFragment && this.fragmentedBufferPool.reset(!0) : this.unfragmentedBufferPool.reset(!0), 
        this.expectOffset = 0, this.expectBuffer = null, this.expectHandler = null, this.state.lastFragment && this.state.opcode === this.state.activeFragmentedOperation && (this.state.activeFragmentedOperation = null), 
        this.currentPayloadLength = 0, this.state.lastFragment = !1, this.state.opcode = null != this.state.activeFragmentedOperation ? this.state.activeFragmentedOperation : 0, 
        this.state.masked = !1, this.expectHeader(2, this.processPacket));
    }, Receiver.prototype.reset = function() {
        this.dead || (this.state = {
            activeFragmentedOperation: null,
            lastFragment: !1,
            masked: !1,
            opcode: 0,
            fragmentedOperation: !1
        }, this.fragmentedBufferPool.reset(!0), this.unfragmentedBufferPool.reset(!0), this.expectOffset = 0, 
        this.expectBuffer = null, this.expectHandler = null, this.overflow = [], this.currentMessage = [], 
        this.currentMessageLength = 0, this.messageHandlers = [], this.currentPayloadLength = 0);
    }, Receiver.prototype.unmask = function(mask, buf, binary) {
        return null != mask && null != buf && bufferUtil.unmask(buf, mask), binary ? buf : null != buf ? buf.toString("utf8") : "";
    }, Receiver.prototype.error = function(reason, protocolErrorCode) {
        if (!this.dead) return this.reset(), "string" == typeof reason ? this.onerror(new Error(reason), protocolErrorCode) : reason.constructor == Error ? this.onerror(reason, protocolErrorCode) : this.onerror(new Error("An error occured"), protocolErrorCode), 
        this;
    }, Receiver.prototype.flush = function() {
        if (!this.processing && !this.dead) {
            var handler = this.messageHandlers.shift();
            if (handler) {
                this.processing = !0;
                var self = this;
                handler((function() {
                    self.processing = !1, self.flush();
                }));
            }
        }
    }, Receiver.prototype.applyExtensions = function(messageBuffer, fin, compressed, callback) {
        var self = this;
        compressed ? this.extensions[PerMessageDeflate.extensionName].decompress(messageBuffer, fin, (function(err, buffer) {
            self.dead || (err ? callback(new Error("invalid compressed data")) : callback(null, buffer));
        })) : callback(null, messageBuffer);
    }, Receiver.prototype.maxPayloadExceeded = function(length) {
        if (void 0 === this.maxPayload || null === this.maxPayload || this.maxPayload < 1) return !1;
        var fullLength = this.currentPayloadLength + length;
        return fullLength < this.maxPayload ? (this.currentPayloadLength = fullLength, !1) : (this.error("payload cannot exceed " + this.maxPayload + " bytes", 1009), 
        this.messageBuffer = [], this.cleanup(), !0);
    };
    var opcodes = {
        1: {
            start: function(data) {
                var self = this, firstLength = 127 & data[1];
                if (firstLength < 126) {
                    if (self.maxPayloadExceeded(firstLength)) return void self.error("Maximumpayload exceeded in compressed text message. Aborting...", 1009);
                    opcodes[1].getData.call(self, firstLength);
                } else 126 == firstLength ? self.expectHeader(2, (function(data) {
                    var length = readUInt16BE.call(data, 0);
                    self.maxPayloadExceeded(length) ? self.error("Maximumpayload exceeded in compressed text message. Aborting...", 1009) : opcodes[1].getData.call(self, length);
                })) : 127 == firstLength && self.expectHeader(8, (function(data) {
                    if (0 == readUInt32BE.call(data, 0)) {
                        var length = readUInt32BE.call(data, 4);
                        self.maxPayloadExceeded(length) ? self.error("Maximumpayload exceeded in compressed text message. Aborting...", 1009) : opcodes[1].getData.call(self, readUInt32BE.call(data, 4));
                    } else self.error("packets with length spanning more than 32 bit is currently not supported", 1008);
                }));
            },
            getData: function(length) {
                var self = this;
                self.state.masked ? self.expectHeader(4, (function(data) {
                    var mask = data;
                    self.expectData(length, (function(data) {
                        opcodes[1].finish.call(self, mask, data);
                    }));
                })) : self.expectData(length, (function(data) {
                    opcodes[1].finish.call(self, null, data);
                }));
            },
            finish: function(mask, data) {
                var self = this, packet = this.unmask(mask, data, !0) || new Buffer(0), state = clone(this.state);
                this.messageHandlers.push((function(callback) {
                    self.applyExtensions(packet, state.lastFragment, state.compressed, (function(err, buffer) {
                        if (err) return 1009 === err.type ? self.error("Maximumpayload exceeded in compressed text message. Aborting...", 1009) : self.error(err.message, 1007);
                        if (null != buffer) {
                            if (!(0 == self.maxPayload || self.maxPayload > 0 && self.currentMessageLength + buffer.length < self.maxPayload)) return self.currentMessage = null, 
                            self.currentMessage = [], self.currentMessageLength = 0, void self.error(new Error("Maximum payload exceeded. maxPayload: " + self.maxPayload), 1009);
                            self.currentMessage.push(buffer), self.currentMessageLength += buffer.length;
                        }
                        if (state.lastFragment) {
                            var messageBuffer = Buffer.concat(self.currentMessage);
                            if (self.currentMessage = [], self.currentMessageLength = 0, !isValidUTF8(messageBuffer)) return void self.error("invalid utf8 sequence", 1007);
                            self.ontext(messageBuffer.toString("utf8"), {
                                masked: state.masked,
                                buffer: messageBuffer
                            });
                        }
                        callback();
                    }));
                })), this.flush(), this.endPacket();
            }
        },
        2: {
            start: function(data) {
                var self = this, firstLength = 127 & data[1];
                if (firstLength < 126) {
                    if (self.maxPayloadExceeded(firstLength)) return void self.error("Max payload exceeded in compressed text message. Aborting...", 1009);
                    opcodes[2].getData.call(self, firstLength);
                } else 126 == firstLength ? self.expectHeader(2, (function(data) {
                    var length = readUInt16BE.call(data, 0);
                    self.maxPayloadExceeded(length) ? self.error("Max payload exceeded in compressed text message. Aborting...", 1009) : opcodes[2].getData.call(self, length);
                })) : 127 == firstLength && self.expectHeader(8, (function(data) {
                    if (0 == readUInt32BE.call(data, 0)) {
                        var length = readUInt32BE.call(data, 4, !0);
                        self.maxPayloadExceeded(length) ? self.error("Max payload exceeded in compressed text message. Aborting...", 1009) : opcodes[2].getData.call(self, length);
                    } else self.error("packets with length spanning more than 32 bit is currently not supported", 1008);
                }));
            },
            getData: function(length) {
                var self = this;
                self.state.masked ? self.expectHeader(4, (function(data) {
                    var mask = data;
                    self.expectData(length, (function(data) {
                        opcodes[2].finish.call(self, mask, data);
                    }));
                })) : self.expectData(length, (function(data) {
                    opcodes[2].finish.call(self, null, data);
                }));
            },
            finish: function(mask, data) {
                var self = this, packet = this.unmask(mask, data, !0) || new Buffer(0), state = clone(this.state);
                this.messageHandlers.push((function(callback) {
                    self.applyExtensions(packet, state.lastFragment, state.compressed, (function(err, buffer) {
                        if (err) return 1009 === err.type ? self.error("Max payload exceeded in compressed binary message. Aborting...", 1009) : self.error(err.message, 1007);
                        if (null != buffer) {
                            if (!(0 == self.maxPayload || self.maxPayload > 0 && self.currentMessageLength + buffer.length < self.maxPayload)) return self.currentMessage = null, 
                            self.currentMessage = [], self.currentMessageLength = 0, void self.error(new Error("Maximum payload exceeded"), 1009);
                            self.currentMessage.push(buffer), self.currentMessageLength += buffer.length;
                        }
                        if (state.lastFragment) {
                            var messageBuffer = Buffer.concat(self.currentMessage);
                            self.currentMessage = [], self.currentMessageLength = 0, self.onbinary(messageBuffer, {
                                masked: state.masked,
                                buffer: messageBuffer
                            });
                        }
                        callback();
                    }));
                })), this.flush(), this.endPacket();
            }
        },
        8: {
            start: function(data) {
                if (0 != this.state.lastFragment) {
                    var firstLength = 127 & data[1];
                    firstLength < 126 ? opcodes[8].getData.call(this, firstLength) : this.error("control frames cannot have more than 125 bytes of data", 1002);
                } else this.error("fragmented close is not supported", 1002);
            },
            getData: function(length) {
                var self = this;
                self.state.masked ? self.expectHeader(4, (function(data) {
                    var mask = data;
                    self.expectData(length, (function(data) {
                        opcodes[8].finish.call(self, mask, data);
                    }));
                })) : self.expectData(length, (function(data) {
                    opcodes[8].finish.call(self, null, data);
                }));
            },
            finish: function(mask, data) {
                var self = this;
                data = self.unmask(mask, data, !0);
                var state = clone(this.state);
                this.messageHandlers.push((function() {
                    if (data && 1 == data.length) self.error("close packets with data must be at least two bytes long", 1002); else {
                        var code = data && data.length > 1 ? readUInt16BE.call(data, 0) : 1e3;
                        if (ErrorCodes.isValidErrorCode(code)) {
                            var message = "";
                            if (data && data.length > 2) {
                                var messageBuffer = data.slice(2);
                                if (!isValidUTF8(messageBuffer)) return void self.error("invalid utf8 sequence", 1007);
                                message = messageBuffer.toString("utf8");
                            }
                            self.onclose(code, message, {
                                masked: state.masked
                            }), self.reset();
                        } else self.error("invalid error code", 1002);
                    }
                })), this.flush();
            }
        },
        9: {
            start: function(data) {
                if (0 != this.state.lastFragment) {
                    var firstLength = 127 & data[1];
                    firstLength < 126 ? opcodes[9].getData.call(this, firstLength) : this.error("control frames cannot have more than 125 bytes of data", 1002);
                } else this.error("fragmented ping is not supported", 1002);
            },
            getData: function(length) {
                var self = this;
                self.state.masked ? self.expectHeader(4, (function(data) {
                    var mask = data;
                    self.expectData(length, (function(data) {
                        opcodes[9].finish.call(self, mask, data);
                    }));
                })) : self.expectData(length, (function(data) {
                    opcodes[9].finish.call(self, null, data);
                }));
            },
            finish: function(mask, data) {
                var self = this;
                data = this.unmask(mask, data, !0);
                var state = clone(this.state);
                this.messageHandlers.push((function(callback) {
                    self.onping(data, {
                        masked: state.masked,
                        binary: !0
                    }), callback();
                })), this.flush(), this.endPacket();
            }
        },
        10: {
            start: function(data) {
                if (0 != this.state.lastFragment) {
                    var firstLength = 127 & data[1];
                    firstLength < 126 ? opcodes[10].getData.call(this, firstLength) : this.error("control frames cannot have more than 125 bytes of data", 1002);
                } else this.error("fragmented pong is not supported", 1002);
            },
            getData: function(length) {
                var self = this;
                this.state.masked ? this.expectHeader(4, (function(data) {
                    var mask = data;
                    self.expectData(length, (function(data) {
                        opcodes[10].finish.call(self, mask, data);
                    }));
                })) : this.expectData(length, (function(data) {
                    opcodes[10].finish.call(self, null, data);
                }));
            },
            finish: function(mask, data) {
                var self = this;
                data = self.unmask(mask, data, !0);
                var state = clone(this.state);
                this.messageHandlers.push((function(callback) {
                    self.onpong(data, {
                        masked: state.masked,
                        binary: !0
                    }), callback();
                })), this.flush(), this.endPacket();
            }
        }
    };
}
