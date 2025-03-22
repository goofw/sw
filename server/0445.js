function(module, exports, __webpack_require__) {
    module.exports = (function() {
        "use strict";
        var Buffer = __webpack_require__(10).Buffer, Long = __webpack_require__(946), memcpy = null;
        try {
            memcpy = __webpack_require__(947);
        } catch (e) {}
        var ByteBuffer = function(capacity, littleEndian, noAssert) {
            if (void 0 === capacity && (capacity = ByteBuffer.DEFAULT_CAPACITY), void 0 === littleEndian && (littleEndian = ByteBuffer.DEFAULT_ENDIAN), 
            void 0 === noAssert && (noAssert = ByteBuffer.DEFAULT_NOASSERT), !noAssert) {
                if ((capacity |= 0) < 0) throw RangeError("Illegal capacity");
                littleEndian = !!littleEndian, noAssert = !!noAssert;
            }
            this.buffer = 0 === capacity ? EMPTY_BUFFER : new Buffer(capacity), this.offset = 0, 
            this.markedOffset = -1, this.limit = capacity, this.littleEndian = void 0 !== littleEndian && !!littleEndian, 
            this.noAssert = !!noAssert;
        };
        ByteBuffer.VERSION = "3.5.5", ByteBuffer.LITTLE_ENDIAN = !0, ByteBuffer.BIG_ENDIAN = !1, 
        ByteBuffer.DEFAULT_CAPACITY = 16, ByteBuffer.DEFAULT_ENDIAN = ByteBuffer.BIG_ENDIAN, 
        ByteBuffer.DEFAULT_NOASSERT = !1, ByteBuffer.Long = Long;
        var ByteBufferPrototype = ByteBuffer.prototype, EMPTY_BUFFER = new Buffer(0), stringFromCharCode = String.fromCharCode;
        ByteBuffer.allocate = function(capacity, littleEndian, noAssert) {
            return new ByteBuffer(capacity, littleEndian, noAssert);
        }, ByteBuffer.concat = function(buffers, encoding, littleEndian, noAssert) {
            "boolean" != typeof encoding && "string" == typeof encoding || (noAssert = littleEndian, 
            littleEndian = encoding, encoding = void 0);
            for (var length, capacity = 0, i = 0, k = buffers.length; i < k; ++i) ByteBuffer.isByteBuffer(buffers[i]) || (buffers[i] = ByteBuffer.wrap(buffers[i], encoding)), 
            (length = buffers[i].limit - buffers[i].offset) > 0 && (capacity += length);
            if (0 === capacity) return new ByteBuffer(0, littleEndian, noAssert);
            var bi, bb = new ByteBuffer(capacity, littleEndian, noAssert);
            for (i = 0; i < k; ) (length = (bi = buffers[i++]).limit - bi.offset) <= 0 || (bi.buffer.copy(bb.buffer, bb.offset, bi.offset, bi.limit), 
            bb.offset += length);
            return bb.limit = bb.offset, bb.offset = 0, bb;
        }, ByteBuffer.isByteBuffer = function(bb) {
            return !0 === (bb && bb instanceof ByteBuffer);
        }, ByteBuffer.type = function() {
            return Buffer;
        }, ByteBuffer.wrap = function(buffer, encoding, littleEndian, noAssert) {
            if ("string" != typeof encoding && (noAssert = littleEndian, littleEndian = encoding, 
            encoding = void 0), "string" == typeof buffer) switch (void 0 === encoding && (encoding = "utf8"), 
            encoding) {
              case "base64":
                return ByteBuffer.fromBase64(buffer, littleEndian);

              case "hex":
                return ByteBuffer.fromHex(buffer, littleEndian);

              case "binary":
                return ByteBuffer.fromBinary(buffer, littleEndian);

              case "utf8":
                return ByteBuffer.fromUTF8(buffer, littleEndian);

              case "debug":
                return ByteBuffer.fromDebug(buffer, littleEndian);

              default:
                throw Error("Unsupported encoding: " + encoding);
            }
            if (null === buffer || "object" != typeof buffer) throw TypeError("Illegal buffer");
            var bb;
            if (ByteBuffer.isByteBuffer(buffer)) return (bb = ByteBufferPrototype.clone.call(buffer)).markedOffset = -1, 
            bb;
            var b, i = 0, k = 0;
            if (buffer instanceof Uint8Array) {
                if (b = new Buffer(buffer.length), memcpy) memcpy(b, 0, buffer.buffer, buffer.byteOffset, buffer.byteOffset + buffer.length); else for (i = 0, 
                k = buffer.length; i < k; ++i) b[i] = buffer[i];
                buffer = b;
            } else if (buffer instanceof ArrayBuffer) {
                if (b = new Buffer(buffer.byteLength), memcpy) memcpy(b, 0, buffer, 0, buffer.byteLength); else for (i = 0, 
                k = (buffer = new Uint8Array(buffer)).length; i < k; ++i) b[i] = buffer[i];
                buffer = b;
            } else if (!(buffer instanceof Buffer)) {
                if ("[object Array]" !== Object.prototype.toString.call(buffer)) throw TypeError("Illegal buffer");
                buffer = new Buffer(buffer);
            }
            return bb = new ByteBuffer(0, littleEndian, noAssert), buffer.length > 0 && (bb.buffer = buffer, 
            bb.limit = buffer.length), bb;
        }, ByteBufferPrototype.writeInt8 = function(value, offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof value || value % 1 != 0) throw TypeError("Illegal value: " + value + " (not an integer)");
                if (value |= 0, "number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+0) <= " + this.buffer.length);
            }
            offset += 1;
            var capacity0 = this.buffer.length;
            return offset > capacity0 && this.resize((capacity0 *= 2) > offset ? capacity0 : offset), 
            offset -= 1, this.buffer[offset] = value, relative && (this.offset += 1), this;
        }, ByteBufferPrototype.writeByte = ByteBufferPrototype.writeInt8, ByteBufferPrototype.readInt8 = function(offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 1 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+1) <= " + this.buffer.length);
            }
            var value = this.buffer[offset];
            return 128 == (128 & value) && (value = -(255 - value + 1)), relative && (this.offset += 1), 
            value;
        }, ByteBufferPrototype.readByte = ByteBufferPrototype.readInt8, ByteBufferPrototype.writeUint8 = function(value, offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof value || value % 1 != 0) throw TypeError("Illegal value: " + value + " (not an integer)");
                if (value >>>= 0, "number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+0) <= " + this.buffer.length);
            }
            offset += 1;
            var capacity1 = this.buffer.length;
            return offset > capacity1 && this.resize((capacity1 *= 2) > offset ? capacity1 : offset), 
            offset -= 1, this.buffer[offset] = value, relative && (this.offset += 1), this;
        }, ByteBufferPrototype.readUint8 = function(offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 1 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+1) <= " + this.buffer.length);
            }
            var value = this.buffer[offset];
            return relative && (this.offset += 1), value;
        }, ByteBufferPrototype.writeInt16 = function(value, offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof value || value % 1 != 0) throw TypeError("Illegal value: " + value + " (not an integer)");
                if (value |= 0, "number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+0) <= " + this.buffer.length);
            }
            offset += 2;
            var capacity2 = this.buffer.length;
            return offset > capacity2 && this.resize((capacity2 *= 2) > offset ? capacity2 : offset), 
            offset -= 2, this.littleEndian ? (this.buffer[offset + 1] = (65280 & value) >>> 8, 
            this.buffer[offset] = 255 & value) : (this.buffer[offset] = (65280 & value) >>> 8, 
            this.buffer[offset + 1] = 255 & value), relative && (this.offset += 2), this;
        }, ByteBufferPrototype.writeShort = ByteBufferPrototype.writeInt16, ByteBufferPrototype.readInt16 = function(offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 2 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+2) <= " + this.buffer.length);
            }
            var value = 0;
            return this.littleEndian ? (value = this.buffer[offset], value |= this.buffer[offset + 1] << 8) : (value = this.buffer[offset] << 8, 
            value |= this.buffer[offset + 1]), 32768 == (32768 & value) && (value = -(65535 - value + 1)), 
            relative && (this.offset += 2), value;
        }, ByteBufferPrototype.readShort = ByteBufferPrototype.readInt16, ByteBufferPrototype.writeUint16 = function(value, offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof value || value % 1 != 0) throw TypeError("Illegal value: " + value + " (not an integer)");
                if (value >>>= 0, "number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+0) <= " + this.buffer.length);
            }
            offset += 2;
            var capacity3 = this.buffer.length;
            return offset > capacity3 && this.resize((capacity3 *= 2) > offset ? capacity3 : offset), 
            offset -= 2, this.littleEndian ? (this.buffer[offset + 1] = (65280 & value) >>> 8, 
            this.buffer[offset] = 255 & value) : (this.buffer[offset] = (65280 & value) >>> 8, 
            this.buffer[offset + 1] = 255 & value), relative && (this.offset += 2), this;
        }, ByteBufferPrototype.readUint16 = function(offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 2 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+2) <= " + this.buffer.length);
            }
            var value = 0;
            return this.littleEndian ? (value = this.buffer[offset], value |= this.buffer[offset + 1] << 8) : (value = this.buffer[offset] << 8, 
            value |= this.buffer[offset + 1]), relative && (this.offset += 2), value;
        }, ByteBufferPrototype.writeInt32 = function(value, offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof value || value % 1 != 0) throw TypeError("Illegal value: " + value + " (not an integer)");
                if (value |= 0, "number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+0) <= " + this.buffer.length);
            }
            offset += 4;
            var capacity4 = this.buffer.length;
            return offset > capacity4 && this.resize((capacity4 *= 2) > offset ? capacity4 : offset), 
            offset -= 4, this.littleEndian ? (this.buffer[offset + 3] = value >>> 24 & 255, 
            this.buffer[offset + 2] = value >>> 16 & 255, this.buffer[offset + 1] = value >>> 8 & 255, 
            this.buffer[offset] = 255 & value) : (this.buffer[offset] = value >>> 24 & 255, 
            this.buffer[offset + 1] = value >>> 16 & 255, this.buffer[offset + 2] = value >>> 8 & 255, 
            this.buffer[offset + 3] = 255 & value), relative && (this.offset += 4), this;
        }, ByteBufferPrototype.writeInt = ByteBufferPrototype.writeInt32, ByteBufferPrototype.readInt32 = function(offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 4 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+4) <= " + this.buffer.length);
            }
            var value = 0;
            return this.littleEndian ? (value = this.buffer[offset + 2] << 16, value |= this.buffer[offset + 1] << 8, 
            value |= this.buffer[offset], value += this.buffer[offset + 3] << 24 >>> 0) : (value = this.buffer[offset + 1] << 16, 
            value |= this.buffer[offset + 2] << 8, value |= this.buffer[offset + 3], value += this.buffer[offset] << 24 >>> 0), 
            value |= 0, relative && (this.offset += 4), value;
        }, ByteBufferPrototype.readInt = ByteBufferPrototype.readInt32, ByteBufferPrototype.writeUint32 = function(value, offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof value || value % 1 != 0) throw TypeError("Illegal value: " + value + " (not an integer)");
                if (value >>>= 0, "number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+0) <= " + this.buffer.length);
            }
            offset += 4;
            var capacity5 = this.buffer.length;
            return offset > capacity5 && this.resize((capacity5 *= 2) > offset ? capacity5 : offset), 
            offset -= 4, this.littleEndian ? (this.buffer[offset + 3] = value >>> 24 & 255, 
            this.buffer[offset + 2] = value >>> 16 & 255, this.buffer[offset + 1] = value >>> 8 & 255, 
            this.buffer[offset] = 255 & value) : (this.buffer[offset] = value >>> 24 & 255, 
            this.buffer[offset + 1] = value >>> 16 & 255, this.buffer[offset + 2] = value >>> 8 & 255, 
            this.buffer[offset + 3] = 255 & value), relative && (this.offset += 4), this;
        }, ByteBufferPrototype.readUint32 = function(offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 4 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+4) <= " + this.buffer.length);
            }
            var value = 0;
            return this.littleEndian ? (value = this.buffer[offset + 2] << 16, value |= this.buffer[offset + 1] << 8, 
            value |= this.buffer[offset], value += this.buffer[offset + 3] << 24 >>> 0) : (value = this.buffer[offset + 1] << 16, 
            value |= this.buffer[offset + 2] << 8, value |= this.buffer[offset + 3], value += this.buffer[offset] << 24 >>> 0), 
            relative && (this.offset += 4), value;
        }, Long && (ByteBufferPrototype.writeInt64 = function(value, offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" == typeof value) value = Long.fromNumber(value); else if ("string" == typeof value) value = Long.fromString(value); else if (!(value && value instanceof Long)) throw TypeError("Illegal value: " + value + " (not an integer or Long)");
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+0) <= " + this.buffer.length);
            }
            "number" == typeof value ? value = Long.fromNumber(value) : "string" == typeof value && (value = Long.fromString(value)), 
            offset += 8;
            var capacity6 = this.buffer.length;
            offset > capacity6 && this.resize((capacity6 *= 2) > offset ? capacity6 : offset), 
            offset -= 8;
            var lo = value.low, hi = value.high;
            return this.littleEndian ? (this.buffer[offset + 3] = lo >>> 24 & 255, this.buffer[offset + 2] = lo >>> 16 & 255, 
            this.buffer[offset + 1] = lo >>> 8 & 255, this.buffer[offset] = 255 & lo, offset += 4, 
            this.buffer[offset + 3] = hi >>> 24 & 255, this.buffer[offset + 2] = hi >>> 16 & 255, 
            this.buffer[offset + 1] = hi >>> 8 & 255, this.buffer[offset] = 255 & hi) : (this.buffer[offset] = hi >>> 24 & 255, 
            this.buffer[offset + 1] = hi >>> 16 & 255, this.buffer[offset + 2] = hi >>> 8 & 255, 
            this.buffer[offset + 3] = 255 & hi, offset += 4, this.buffer[offset] = lo >>> 24 & 255, 
            this.buffer[offset + 1] = lo >>> 16 & 255, this.buffer[offset + 2] = lo >>> 8 & 255, 
            this.buffer[offset + 3] = 255 & lo), relative && (this.offset += 8), this;
        }, ByteBufferPrototype.writeLong = ByteBufferPrototype.writeInt64, ByteBufferPrototype.readInt64 = function(offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 8 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+8) <= " + this.buffer.length);
            }
            var lo = 0, hi = 0;
            this.littleEndian ? (lo = this.buffer[offset + 2] << 16, lo |= this.buffer[offset + 1] << 8, 
            lo |= this.buffer[offset], lo += this.buffer[offset + 3] << 24 >>> 0, offset += 4, 
            hi = this.buffer[offset + 2] << 16, hi |= this.buffer[offset + 1] << 8, hi |= this.buffer[offset], 
            hi += this.buffer[offset + 3] << 24 >>> 0) : (hi = this.buffer[offset + 1] << 16, 
            hi |= this.buffer[offset + 2] << 8, hi |= this.buffer[offset + 3], hi += this.buffer[offset] << 24 >>> 0, 
            offset += 4, lo = this.buffer[offset + 1] << 16, lo |= this.buffer[offset + 2] << 8, 
            lo |= this.buffer[offset + 3], lo += this.buffer[offset] << 24 >>> 0);
            var value = new Long(lo, hi, !1);
            return relative && (this.offset += 8), value;
        }, ByteBufferPrototype.readLong = ByteBufferPrototype.readInt64, ByteBufferPrototype.writeUint64 = function(value, offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" == typeof value) value = Long.fromNumber(value); else if ("string" == typeof value) value = Long.fromString(value); else if (!(value && value instanceof Long)) throw TypeError("Illegal value: " + value + " (not an integer or Long)");
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+0) <= " + this.buffer.length);
            }
            "number" == typeof value ? value = Long.fromNumber(value) : "string" == typeof value && (value = Long.fromString(value)), 
            offset += 8;
            var capacity7 = this.buffer.length;
            offset > capacity7 && this.resize((capacity7 *= 2) > offset ? capacity7 : offset), 
            offset -= 8;
            var lo = value.low, hi = value.high;
            return this.littleEndian ? (this.buffer[offset + 3] = lo >>> 24 & 255, this.buffer[offset + 2] = lo >>> 16 & 255, 
            this.buffer[offset + 1] = lo >>> 8 & 255, this.buffer[offset] = 255 & lo, offset += 4, 
            this.buffer[offset + 3] = hi >>> 24 & 255, this.buffer[offset + 2] = hi >>> 16 & 255, 
            this.buffer[offset + 1] = hi >>> 8 & 255, this.buffer[offset] = 255 & hi) : (this.buffer[offset] = hi >>> 24 & 255, 
            this.buffer[offset + 1] = hi >>> 16 & 255, this.buffer[offset + 2] = hi >>> 8 & 255, 
            this.buffer[offset + 3] = 255 & hi, offset += 4, this.buffer[offset] = lo >>> 24 & 255, 
            this.buffer[offset + 1] = lo >>> 16 & 255, this.buffer[offset + 2] = lo >>> 8 & 255, 
            this.buffer[offset + 3] = 255 & lo), relative && (this.offset += 8), this;
        }, ByteBufferPrototype.readUint64 = function(offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 8 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+8) <= " + this.buffer.length);
            }
            var lo = 0, hi = 0;
            this.littleEndian ? (lo = this.buffer[offset + 2] << 16, lo |= this.buffer[offset + 1] << 8, 
            lo |= this.buffer[offset], lo += this.buffer[offset + 3] << 24 >>> 0, offset += 4, 
            hi = this.buffer[offset + 2] << 16, hi |= this.buffer[offset + 1] << 8, hi |= this.buffer[offset], 
            hi += this.buffer[offset + 3] << 24 >>> 0) : (hi = this.buffer[offset + 1] << 16, 
            hi |= this.buffer[offset + 2] << 8, hi |= this.buffer[offset + 3], hi += this.buffer[offset] << 24 >>> 0, 
            offset += 4, lo = this.buffer[offset + 1] << 16, lo |= this.buffer[offset + 2] << 8, 
            lo |= this.buffer[offset + 3], lo += this.buffer[offset] << 24 >>> 0);
            var value = new Long(lo, hi, !0);
            return relative && (this.offset += 8), value;
        }), ByteBufferPrototype.writeFloat32 = function(value, offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof value) throw TypeError("Illegal value: " + value + " (not a number)");
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+0) <= " + this.buffer.length);
            }
            offset += 4;
            var capacity8 = this.buffer.length;
            return offset > capacity8 && this.resize((capacity8 *= 2) > offset ? capacity8 : offset), 
            offset -= 4, this.littleEndian ? this.buffer.writeFloatLE(value, offset, !0) : this.buffer.writeFloatBE(value, offset, !0), 
            relative && (this.offset += 4), this;
        }, ByteBufferPrototype.writeFloat = ByteBufferPrototype.writeFloat32, ByteBufferPrototype.readFloat32 = function(offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 4 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+4) <= " + this.buffer.length);
            }
            var value = this.littleEndian ? this.buffer.readFloatLE(offset, !0) : this.buffer.readFloatBE(offset, !0);
            return relative && (this.offset += 4), value;
        }, ByteBufferPrototype.readFloat = ByteBufferPrototype.readFloat32, ByteBufferPrototype.writeFloat64 = function(value, offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof value) throw TypeError("Illegal value: " + value + " (not a number)");
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+0) <= " + this.buffer.length);
            }
            offset += 8;
            var capacity9 = this.buffer.length;
            return offset > capacity9 && this.resize((capacity9 *= 2) > offset ? capacity9 : offset), 
            offset -= 8, this.littleEndian ? this.buffer.writeDoubleLE(value, offset, !0) : this.buffer.writeDoubleBE(value, offset, !0), 
            relative && (this.offset += 8), this;
        }, ByteBufferPrototype.writeDouble = ByteBufferPrototype.writeFloat64, ByteBufferPrototype.readFloat64 = function(offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 8 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+8) <= " + this.buffer.length);
            }
            var value = this.littleEndian ? this.buffer.readDoubleLE(offset, !0) : this.buffer.readDoubleBE(offset, !0);
            return relative && (this.offset += 8), value;
        }, ByteBufferPrototype.readDouble = ByteBufferPrototype.readFloat64, ByteBuffer.MAX_VARINT32_BYTES = 5, 
        ByteBuffer.calculateVarint32 = function(value) {
            return (value >>>= 0) < 128 ? 1 : value < 16384 ? 2 : value < 1 << 21 ? 3 : value < 1 << 28 ? 4 : 5;
        }, ByteBuffer.zigZagEncode32 = function(n) {
            return ((n |= 0) << 1 ^ n >> 31) >>> 0;
        }, ByteBuffer.zigZagDecode32 = function(n) {
            return n >>> 1 ^ -(1 & n) | 0;
        }, ByteBufferPrototype.writeVarint32 = function(value, offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof value || value % 1 != 0) throw TypeError("Illegal value: " + value + " (not an integer)");
                if (value |= 0, "number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+0) <= " + this.buffer.length);
            }
            var b, size = ByteBuffer.calculateVarint32(value);
            offset += size;
            var capacity10 = this.buffer.length;
            return offset > capacity10 && this.resize((capacity10 *= 2) > offset ? capacity10 : offset), 
            offset -= size, this.buffer[offset] = b = 128 | value, (value >>>= 0) >= 128 ? (b = value >> 7 | 128, 
            this.buffer[offset + 1] = b, value >= 16384 ? (b = value >> 14 | 128, this.buffer[offset + 2] = b, 
            value >= 1 << 21 ? (b = value >> 21 | 128, this.buffer[offset + 3] = b, value >= 1 << 28 ? (this.buffer[offset + 4] = value >> 28 & 15, 
            size = 5) : (this.buffer[offset + 3] = 127 & b, size = 4)) : (this.buffer[offset + 2] = 127 & b, 
            size = 3)) : (this.buffer[offset + 1] = 127 & b, size = 2)) : (this.buffer[offset] = 127 & b, 
            size = 1), relative ? (this.offset += size, this) : size;
        }, ByteBufferPrototype.writeVarint32ZigZag = function(value, offset) {
            return this.writeVarint32(ByteBuffer.zigZagEncode32(value), offset);
        }, ByteBufferPrototype.readVarint32 = function(offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 1 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+1) <= " + this.buffer.length);
            }
            var temp, ioffset, size = 0, value = 0;
            do {
                if (ioffset = offset + size, !this.noAssert && ioffset > this.limit) {
                    var err = Error("Truncated");
                    throw err.truncated = !0, err;
                }
                temp = this.buffer[ioffset], size < 5 && (value |= (127 & temp) << 7 * size >>> 0), 
                ++size;
            } while (128 == (128 & temp));
            return value |= 0, relative ? (this.offset += size, value) : {
                value: value,
                length: size
            };
        }, ByteBufferPrototype.readVarint32ZigZag = function(offset) {
            var val = this.readVarint32(offset);
            return "object" == typeof val ? val.value = ByteBuffer.zigZagDecode32(val.value) : val = ByteBuffer.zigZagDecode32(val), 
            val;
        }, Long && (ByteBuffer.MAX_VARINT64_BYTES = 10, ByteBuffer.calculateVarint64 = function(value) {
            "number" == typeof value ? value = Long.fromNumber(value) : "string" == typeof value && (value = Long.fromString(value));
            var part0 = value.toInt() >>> 0, part1 = value.shiftRightUnsigned(28).toInt() >>> 0, part2 = value.shiftRightUnsigned(56).toInt() >>> 0;
            return 0 == part2 ? 0 == part1 ? part0 < 16384 ? part0 < 128 ? 1 : 2 : part0 < 1 << 21 ? 3 : 4 : part1 < 16384 ? part1 < 128 ? 5 : 6 : part1 < 1 << 21 ? 7 : 8 : part2 < 128 ? 9 : 10;
        }, ByteBuffer.zigZagEncode64 = function(value) {
            return "number" == typeof value ? value = Long.fromNumber(value, !1) : "string" == typeof value ? value = Long.fromString(value, !1) : !1 !== value.unsigned && (value = value.toSigned()), 
            value.shiftLeft(1).xor(value.shiftRight(63)).toUnsigned();
        }, ByteBuffer.zigZagDecode64 = function(value) {
            return "number" == typeof value ? value = Long.fromNumber(value, !1) : "string" == typeof value ? value = Long.fromString(value, !1) : !1 !== value.unsigned && (value = value.toSigned()), 
            value.shiftRightUnsigned(1).xor(value.and(Long.ONE).toSigned().negate()).toSigned();
        }, ByteBufferPrototype.writeVarint64 = function(value, offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" == typeof value) value = Long.fromNumber(value); else if ("string" == typeof value) value = Long.fromString(value); else if (!(value && value instanceof Long)) throw TypeError("Illegal value: " + value + " (not an integer or Long)");
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+0) <= " + this.buffer.length);
            }
            "number" == typeof value ? value = Long.fromNumber(value, !1) : "string" == typeof value ? value = Long.fromString(value, !1) : !1 !== value.unsigned && (value = value.toSigned());
            var size = ByteBuffer.calculateVarint64(value), part0 = value.toInt() >>> 0, part1 = value.shiftRightUnsigned(28).toInt() >>> 0, part2 = value.shiftRightUnsigned(56).toInt() >>> 0;
            offset += size;
            var capacity11 = this.buffer.length;
            switch (offset > capacity11 && this.resize((capacity11 *= 2) > offset ? capacity11 : offset), 
            offset -= size, size) {
              case 10:
                this.buffer[offset + 9] = part2 >>> 7 & 1;

              case 9:
                this.buffer[offset + 8] = 9 !== size ? 128 | part2 : 127 & part2;

              case 8:
                this.buffer[offset + 7] = 8 !== size ? part1 >>> 21 | 128 : part1 >>> 21 & 127;

              case 7:
                this.buffer[offset + 6] = 7 !== size ? part1 >>> 14 | 128 : part1 >>> 14 & 127;

              case 6:
                this.buffer[offset + 5] = 6 !== size ? part1 >>> 7 | 128 : part1 >>> 7 & 127;

              case 5:
                this.buffer[offset + 4] = 5 !== size ? 128 | part1 : 127 & part1;

              case 4:
                this.buffer[offset + 3] = 4 !== size ? part0 >>> 21 | 128 : part0 >>> 21 & 127;

              case 3:
                this.buffer[offset + 2] = 3 !== size ? part0 >>> 14 | 128 : part0 >>> 14 & 127;

              case 2:
                this.buffer[offset + 1] = 2 !== size ? part0 >>> 7 | 128 : part0 >>> 7 & 127;

              case 1:
                this.buffer[offset] = 1 !== size ? 128 | part0 : 127 & part0;
            }
            return relative ? (this.offset += size, this) : size;
        }, ByteBufferPrototype.writeVarint64ZigZag = function(value, offset) {
            return this.writeVarint64(ByteBuffer.zigZagEncode64(value), offset);
        }, ByteBufferPrototype.readVarint64 = function(offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 1 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+1) <= " + this.buffer.length);
            }
            var start = offset, part0 = 0, part1 = 0, part2 = 0, b = 0;
            if (part0 = 127 & (b = this.buffer[offset++]), 128 & b && (part0 |= (127 & (b = this.buffer[offset++])) << 7, 
            (128 & b || this.noAssert && void 0 === b) && (part0 |= (127 & (b = this.buffer[offset++])) << 14, 
            (128 & b || this.noAssert && void 0 === b) && (part0 |= (127 & (b = this.buffer[offset++])) << 21, 
            (128 & b || this.noAssert && void 0 === b) && (part1 = 127 & (b = this.buffer[offset++]), 
            (128 & b || this.noAssert && void 0 === b) && (part1 |= (127 & (b = this.buffer[offset++])) << 7, 
            (128 & b || this.noAssert && void 0 === b) && (part1 |= (127 & (b = this.buffer[offset++])) << 14, 
            (128 & b || this.noAssert && void 0 === b) && (part1 |= (127 & (b = this.buffer[offset++])) << 21, 
            (128 & b || this.noAssert && void 0 === b) && (part2 = 127 & (b = this.buffer[offset++]), 
            (128 & b || this.noAssert && void 0 === b) && (part2 |= (127 & (b = this.buffer[offset++])) << 7, 
            128 & b || this.noAssert && void 0 === b)))))))))) throw Error("Buffer overrun");
            var value = Long.fromBits(part0 | part1 << 28, part1 >>> 4 | part2 << 24, !1);
            return relative ? (this.offset = offset, value) : {
                value: value,
                length: offset - start
            };
        }, ByteBufferPrototype.readVarint64ZigZag = function(offset) {
            var val = this.readVarint64(offset);
            return val && val.value instanceof Long ? val.value = ByteBuffer.zigZagDecode64(val.value) : val = ByteBuffer.zigZagDecode64(val), 
            val;
        }), ByteBufferPrototype.writeCString = function(str, offset) {
            var relative = void 0 === offset;
            relative && (offset = this.offset);
            var i, k = str.length;
            if (!this.noAssert) {
                if ("string" != typeof str) throw TypeError("Illegal str: Not a string");
                for (i = 0; i < k; ++i) if (0 === str.charCodeAt(i)) throw RangeError("Illegal str: Contains NULL-characters");
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+0) <= " + this.buffer.length);
            }
            offset += (k = Buffer.byteLength(str, "utf8")) + 1;
            var capacity12 = this.buffer.length;
            return offset > capacity12 && this.resize((capacity12 *= 2) > offset ? capacity12 : offset), 
            offset -= k + 1, offset += this.buffer.write(str, offset, k, "utf8"), this.buffer[offset++] = 0, 
            relative ? (this.offset = offset, this) : k;
        }, ByteBufferPrototype.readCString = function(offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 1 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+1) <= " + this.buffer.length);
            }
            var temp, start = offset;
            do {
                if (offset >= this.buffer.length) throw RangeError("Index out of range: " + offset + " <= " + this.buffer.length);
                temp = this.buffer[offset++];
            } while (0 !== temp);
            var str = this.buffer.toString("utf8", start, offset - 1);
            return relative ? (this.offset = offset, str) : {
                string: str,
                length: offset - start
            };
        }, ByteBufferPrototype.writeIString = function(str, offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("string" != typeof str) throw TypeError("Illegal str: Not a string");
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+0) <= " + this.buffer.length);
            }
            var k, start = offset;
            offset += 4 + (k = Buffer.byteLength(str, "utf8"));
            var capacity13 = this.buffer.length;
            return offset > capacity13 && this.resize((capacity13 *= 2) > offset ? capacity13 : offset), 
            offset -= 4 + k, this.littleEndian ? (this.buffer[offset + 3] = k >>> 24 & 255, 
            this.buffer[offset + 2] = k >>> 16 & 255, this.buffer[offset + 1] = k >>> 8 & 255, 
            this.buffer[offset] = 255 & k) : (this.buffer[offset] = k >>> 24 & 255, this.buffer[offset + 1] = k >>> 16 & 255, 
            this.buffer[offset + 2] = k >>> 8 & 255, this.buffer[offset + 3] = 255 & k), offset += 4, 
            offset += this.buffer.write(str, offset, k, "utf8"), relative ? (this.offset = offset, 
            this) : offset - start;
        }, ByteBufferPrototype.readIString = function(offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 4 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+4) <= " + this.buffer.length);
            }
            var str, temp = 0, start = offset;
            if (this.littleEndian ? (temp = this.buffer[offset + 2] << 16, temp |= this.buffer[offset + 1] << 8, 
            temp |= this.buffer[offset], temp += this.buffer[offset + 3] << 24 >>> 0) : (temp = this.buffer[offset + 1] << 16, 
            temp |= this.buffer[offset + 2] << 8, temp |= this.buffer[offset + 3], temp += this.buffer[offset] << 24 >>> 0), 
            (offset += 4) + temp > this.buffer.length) throw RangeError("Index out of bounds: " + offset + " + " + temp + " <= " + this.buffer.length);
            return str = this.buffer.toString("utf8", offset, offset + temp), offset += temp, 
            relative ? (this.offset = offset, str) : {
                string: str,
                length: offset - start
            };
        }, ByteBuffer.METRICS_CHARS = "c", ByteBuffer.METRICS_BYTES = "b", ByteBufferPrototype.writeUTF8String = function(str, offset) {
            var k, relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+0) <= " + this.buffer.length);
            }
            offset += k = Buffer.byteLength(str, "utf8");
            var capacity14 = this.buffer.length;
            return offset > capacity14 && this.resize((capacity14 *= 2) > offset ? capacity14 : offset), 
            offset -= k, offset += this.buffer.write(str, offset, k, "utf8"), relative ? (this.offset = offset, 
            this) : k;
        }, ByteBufferPrototype.writeString = ByteBufferPrototype.writeUTF8String, ByteBuffer.calculateUTF8Chars = function(str) {
            return utfx.calculateUTF16asUTF8((s = str, i = 0, function() {
                return i < s.length ? s.charCodeAt(i++) : null;
            }))[0];
            var s, i;
        }, ByteBuffer.calculateUTF8Bytes = function(str) {
            if ("string" != typeof str) throw TypeError("Illegal argument: " + typeof str);
            return Buffer.byteLength(str, "utf8");
        }, ByteBufferPrototype.readUTF8String = function(length, metrics, offset) {
            "number" == typeof metrics && (offset = metrics, metrics = void 0);
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), void 0 === metrics && (metrics = ByteBuffer.METRICS_CHARS), 
            !this.noAssert) {
                if ("number" != typeof length || length % 1 != 0) throw TypeError("Illegal length: " + length + " (not an integer)");
                if (length |= 0, "number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+0) <= " + this.buffer.length);
            }
            var temp, sd, cs, ps, i = 0, start = offset;
            if (metrics === ByteBuffer.METRICS_CHARS) {
                if (cs = [], ps = [], sd = function() {
                    if (0 === arguments.length) return ps.join("") + stringFromCharCode.apply(String, cs);
                    cs.length + arguments.length > 1024 && (ps.push(stringFromCharCode.apply(String, cs)), 
                    cs.length = 0), Array.prototype.push.apply(cs, arguments);
                }, utfx.decodeUTF8(function() {
                    return i < length && offset < this.limit ? this.buffer[offset++] : null;
                }.bind(this), function(cp) {
                    ++i, utfx.UTF8toUTF16(cp, sd);
                }.bind(this)), i !== length) throw RangeError("Illegal range: Truncated data, " + i + " == " + length);
                return relative ? (this.offset = offset, sd()) : {
                    string: sd(),
                    length: offset - start
                };
            }
            if (metrics === ByteBuffer.METRICS_BYTES) {
                if (!this.noAssert) {
                    if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                    if ((offset >>>= 0) < 0 || offset + length > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + length + ") <= " + this.buffer.length);
                }
                return temp = this.buffer.toString("utf8", offset, offset + length), relative ? (this.offset += length, 
                temp) : {
                    string: temp,
                    length: length
                };
            }
            throw TypeError("Unsupported metrics: " + metrics);
        }, ByteBufferPrototype.readString = ByteBufferPrototype.readUTF8String, ByteBufferPrototype.writeVString = function(str, offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("string" != typeof str) throw TypeError("Illegal str: Not a string");
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+0) <= " + this.buffer.length);
            }
            var k, l, start = offset;
            k = Buffer.byteLength(str, "utf8"), offset += (l = ByteBuffer.calculateVarint32(k)) + k;
            var capacity15 = this.buffer.length;
            return offset > capacity15 && this.resize((capacity15 *= 2) > offset ? capacity15 : offset), 
            offset -= l + k, offset += this.writeVarint32(k, offset), offset += this.buffer.write(str, offset, k, "utf8"), 
            relative ? (this.offset = offset, this) : offset - start;
        }, ByteBufferPrototype.readVString = function(offset) {
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 1 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+1) <= " + this.buffer.length);
            }
            var str, temp = this.readVarint32(offset), start = offset;
            if ((offset += temp.length) + (temp = temp.value) > this.buffer.length) throw RangeError("Index out of bounds: " + offset + " + " + val.value + " <= " + this.buffer.length);
            return str = this.buffer.toString("utf8", offset, offset + temp), offset += temp, 
            relative ? (this.offset = offset, str) : {
                string: str,
                length: offset - start
            };
        }, ByteBufferPrototype.append = function(source, encoding, offset) {
            "number" != typeof encoding && "string" == typeof encoding || (offset = encoding, 
            encoding = void 0);
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+0) <= " + this.buffer.length);
            }
            source instanceof ByteBuffer || (source = ByteBuffer.wrap(source, encoding));
            var length = source.limit - source.offset;
            if (length <= 0) return this;
            offset += length;
            var capacity16 = this.buffer.length;
            return offset > capacity16 && this.resize((capacity16 *= 2) > offset ? capacity16 : offset), 
            offset -= length, source.buffer.copy(this.buffer, offset, source.offset, source.limit), 
            source.offset += length, relative && (this.offset += length), this;
        }, ByteBufferPrototype.appendTo = function(target, offset) {
            return target.append(this, offset), this;
        }, ByteBufferPrototype.assert = function(assert) {
            return this.noAssert = !assert, this;
        }, ByteBufferPrototype.capacity = function() {
            return this.buffer.length;
        }, ByteBufferPrototype.clear = function() {
            return this.offset = 0, this.limit = this.buffer.length, this.markedOffset = -1, 
            this;
        }, ByteBufferPrototype.clone = function(copy) {
            var bb = new ByteBuffer(0, this.littleEndian, this.noAssert);
            if (copy) {
                var buffer = new Buffer(this.buffer.length);
                this.buffer.copy(buffer), bb.buffer = buffer;
            } else bb.buffer = this.buffer;
            return bb.offset = this.offset, bb.markedOffset = this.markedOffset, bb.limit = this.limit, 
            bb;
        }, ByteBufferPrototype.compact = function(begin, end) {
            if (void 0 === begin && (begin = this.offset), void 0 === end && (end = this.limit), 
            !this.noAssert) {
                if ("number" != typeof begin || begin % 1 != 0) throw TypeError("Illegal begin: Not an integer");
                if (begin >>>= 0, "number" != typeof end || end % 1 != 0) throw TypeError("Illegal end: Not an integer");
                if (end >>>= 0, begin < 0 || begin > end || end > this.buffer.length) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.length);
            }
            if (0 === begin && end === this.buffer.length) return this;
            var len = end - begin;
            if (0 === len) return this.buffer = EMPTY_BUFFER, this.markedOffset >= 0 && (this.markedOffset -= begin), 
            this.offset = 0, this.limit = 0, this;
            var buffer = new Buffer(len);
            return this.buffer.copy(buffer, 0, begin, end), this.buffer = buffer, this.markedOffset >= 0 && (this.markedOffset -= begin), 
            this.offset = 0, this.limit = len, this;
        }, ByteBufferPrototype.copy = function(begin, end) {
            if (void 0 === begin && (begin = this.offset), void 0 === end && (end = this.limit), 
            !this.noAssert) {
                if ("number" != typeof begin || begin % 1 != 0) throw TypeError("Illegal begin: Not an integer");
                if (begin >>>= 0, "number" != typeof end || end % 1 != 0) throw TypeError("Illegal end: Not an integer");
                if (end >>>= 0, begin < 0 || begin > end || end > this.buffer.length) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.length);
            }
            if (begin === end) return new ByteBuffer(0, this.littleEndian, this.noAssert);
            var capacity = end - begin, bb = new ByteBuffer(capacity, this.littleEndian, this.noAssert);
            return bb.offset = 0, bb.limit = capacity, bb.markedOffset >= 0 && (bb.markedOffset -= begin), 
            this.copyTo(bb, 0, begin, end), bb;
        }, ByteBufferPrototype.copyTo = function(target, targetOffset, sourceOffset, sourceLimit) {
            var relative, targetRelative;
            if (!this.noAssert && !ByteBuffer.isByteBuffer(target)) throw TypeError("Illegal target: Not a ByteBuffer");
            if (targetOffset = (targetRelative = void 0 === targetOffset) ? target.offset : 0 | targetOffset, 
            sourceOffset = (relative = void 0 === sourceOffset) ? this.offset : 0 | sourceOffset, 
            sourceLimit = void 0 === sourceLimit ? this.limit : 0 | sourceLimit, targetOffset < 0 || targetOffset > target.buffer.length) throw RangeError("Illegal target range: 0 <= " + targetOffset + " <= " + target.buffer.length);
            if (sourceOffset < 0 || sourceLimit > this.buffer.length) throw RangeError("Illegal source range: 0 <= " + sourceOffset + " <= " + this.buffer.length);
            var len = sourceLimit - sourceOffset;
            return 0 === len ? target : (target.ensureCapacity(targetOffset + len), this.buffer.copy(target.buffer, targetOffset, sourceOffset, sourceLimit), 
            relative && (this.offset += len), targetRelative && (target.offset += len), this);
        }, ByteBufferPrototype.ensureCapacity = function(capacity) {
            var current = this.buffer.length;
            return current < capacity ? this.resize((current *= 2) > capacity ? current : capacity) : this;
        }, ByteBufferPrototype.fill = function(value, begin, end) {
            var relative = void 0 === begin;
            if (relative && (begin = this.offset), "string" == typeof value && value.length > 0 && (value = value.charCodeAt(0)), 
            void 0 === begin && (begin = this.offset), void 0 === end && (end = this.limit), 
            !this.noAssert) {
                if ("number" != typeof value || value % 1 != 0) throw TypeError("Illegal value: " + value + " (not an integer)");
                if (value |= 0, "number" != typeof begin || begin % 1 != 0) throw TypeError("Illegal begin: Not an integer");
                if (begin >>>= 0, "number" != typeof end || end % 1 != 0) throw TypeError("Illegal end: Not an integer");
                if (end >>>= 0, begin < 0 || begin > end || end > this.buffer.length) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.length);
            }
            return begin >= end || (this.buffer.fill(value, begin, end), begin = end, relative && (this.offset = begin)), 
            this;
        }, ByteBufferPrototype.flip = function() {
            return this.limit = this.offset, this.offset = 0, this;
        }, ByteBufferPrototype.mark = function(offset) {
            if (offset = void 0 === offset ? this.offset : offset, !this.noAssert) {
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+0) <= " + this.buffer.length);
            }
            return this.markedOffset = offset, this;
        }, ByteBufferPrototype.order = function(littleEndian) {
            if (!this.noAssert && "boolean" != typeof littleEndian) throw TypeError("Illegal littleEndian: Not a boolean");
            return this.littleEndian = !!littleEndian, this;
        }, ByteBufferPrototype.LE = function(littleEndian) {
            return this.littleEndian = void 0 === littleEndian || !!littleEndian, this;
        }, ByteBufferPrototype.BE = function(bigEndian) {
            return this.littleEndian = void 0 !== bigEndian && !bigEndian, this;
        }, ByteBufferPrototype.prepend = function(source, encoding, offset) {
            "number" != typeof encoding && "string" == typeof encoding || (offset = encoding, 
            encoding = void 0);
            var relative = void 0 === offset;
            if (relative && (offset = this.offset), !this.noAssert) {
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
                if ((offset >>>= 0) < 0 || offset + 0 > this.buffer.length) throw RangeError("Illegal offset: 0 <= " + offset + " (+0) <= " + this.buffer.length);
            }
            source instanceof ByteBuffer || (source = ByteBuffer.wrap(source, encoding));
            var len = source.limit - source.offset;
            if (len <= 0) return this;
            var diff = len - offset;
            if (diff > 0) {
                var buffer = new Buffer(this.buffer.length + diff);
                this.buffer.copy(buffer, len, offset, this.buffer.length), this.buffer = buffer, 
                this.offset += diff, this.markedOffset >= 0 && (this.markedOffset += diff), this.limit += diff, 
                offset += diff;
            }
            return source.buffer.copy(this.buffer, offset - len, source.offset, source.limit), 
            source.offset = source.limit, relative && (this.offset -= len), this;
        }, ByteBufferPrototype.prependTo = function(target, offset) {
            return target.prepend(this, offset), this;
        }, ByteBufferPrototype.printDebug = function(out) {
            "function" != typeof out && (out = console.log.bind(console)), out(this.toString() + "\n-------------------------------------------------------------------\n" + this.toDebug(!0));
        }, ByteBufferPrototype.remaining = function() {
            return this.limit - this.offset;
        }, ByteBufferPrototype.reset = function() {
            return this.markedOffset >= 0 ? (this.offset = this.markedOffset, this.markedOffset = -1) : this.offset = 0, 
            this;
        }, ByteBufferPrototype.resize = function(capacity) {
            if (!this.noAssert) {
                if ("number" != typeof capacity || capacity % 1 != 0) throw TypeError("Illegal capacity: " + capacity + " (not an integer)");
                if ((capacity |= 0) < 0) throw RangeError("Illegal capacity: 0 <= " + capacity);
            }
            if (this.buffer.length < capacity) {
                var buffer = new Buffer(capacity);
                this.buffer.copy(buffer), this.buffer = buffer;
            }
            return this;
        }, ByteBufferPrototype.reverse = function(begin, end) {
            if (void 0 === begin && (begin = this.offset), void 0 === end && (end = this.limit), 
            !this.noAssert) {
                if ("number" != typeof begin || begin % 1 != 0) throw TypeError("Illegal begin: Not an integer");
                if (begin >>>= 0, "number" != typeof end || end % 1 != 0) throw TypeError("Illegal end: Not an integer");
                if (end >>>= 0, begin < 0 || begin > end || end > this.buffer.length) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.length);
            }
            return begin === end || Array.prototype.reverse.call(this.buffer.slice(begin, end)), 
            this;
        }, ByteBufferPrototype.skip = function(length) {
            if (!this.noAssert) {
                if ("number" != typeof length || length % 1 != 0) throw TypeError("Illegal length: " + length + " (not an integer)");
                length |= 0;
            }
            var offset = this.offset + length;
            if (!this.noAssert && (offset < 0 || offset > this.buffer.length)) throw RangeError("Illegal length: 0 <= " + this.offset + " + " + length + " <= " + this.buffer.length);
            return this.offset = offset, this;
        }, ByteBufferPrototype.slice = function(begin, end) {
            if (void 0 === begin && (begin = this.offset), void 0 === end && (end = this.limit), 
            !this.noAssert) {
                if ("number" != typeof begin || begin % 1 != 0) throw TypeError("Illegal begin: Not an integer");
                if (begin >>>= 0, "number" != typeof end || end % 1 != 0) throw TypeError("Illegal end: Not an integer");
                if (end >>>= 0, begin < 0 || begin > end || end > this.buffer.length) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.length);
            }
            var bb = this.clone();
            return bb.offset = begin, bb.limit = end, bb;
        }, ByteBufferPrototype.toBuffer = function(forceCopy) {
            var offset = this.offset, limit = this.limit;
            if (offset > limit) {
                var t = offset;
                offset = limit, limit = t;
            }
            if (!this.noAssert) {
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: Not an integer");
                if (offset >>>= 0, "number" != typeof limit || limit % 1 != 0) throw TypeError("Illegal limit: Not an integer");
                if (limit >>>= 0, offset < 0 || offset > limit || limit > this.buffer.length) throw RangeError("Illegal range: 0 <= " + offset + " <= " + limit + " <= " + this.buffer.length);
            }
            if (forceCopy) {
                var buffer = new Buffer(limit - offset);
                return this.buffer.copy(buffer, 0, offset, limit), buffer;
            }
            return 0 === offset && limit === this.buffer.length ? this.buffer : this.buffer.slice(offset, limit);
        }, ByteBufferPrototype.toArrayBuffer = function() {
            var offset = this.offset, limit = this.limit;
            if (offset > limit) {
                var t = offset;
                offset = limit, limit = t;
            }
            if (!this.noAssert) {
                if ("number" != typeof offset || offset % 1 != 0) throw TypeError("Illegal offset: Not an integer");
                if (offset >>>= 0, "number" != typeof limit || limit % 1 != 0) throw TypeError("Illegal limit: Not an integer");
                if (limit >>>= 0, offset < 0 || offset > limit || limit > this.buffer.length) throw RangeError("Illegal range: 0 <= " + offset + " <= " + limit + " <= " + this.buffer.length);
            }
            var ab = new ArrayBuffer(limit - offset);
            if (memcpy) memcpy(ab, 0, this.buffer, offset, limit); else for (var dst = new Uint8Array(ab), i = offset; i < limit; ++i) dst[i - offset] = this.buffer[i];
            return ab;
        }, ByteBufferPrototype.toString = function(encoding, begin, end) {
            if (void 0 === encoding) return "ByteBufferNB(offset=" + this.offset + ",markedOffset=" + this.markedOffset + ",limit=" + this.limit + ",capacity=" + this.capacity() + ")";
            switch ("number" == typeof encoding && (end = begin = encoding = "utf8"), encoding) {
              case "utf8":
                return this.toUTF8(begin, end);

              case "base64":
                return this.toBase64(begin, end);

              case "hex":
                return this.toHex(begin, end);

              case "binary":
                return this.toBinary(begin, end);

              case "debug":
                return this.toDebug();

              case "columns":
                return this.toColumns();

              default:
                throw Error("Unsupported encoding: " + encoding);
            }
        }, ByteBufferPrototype.toBase64 = function(begin, end) {
            if (void 0 === begin && (begin = this.offset), void 0 === end && (end = this.limit), 
            !this.noAssert) {
                if ("number" != typeof begin || begin % 1 != 0) throw TypeError("Illegal begin: Not an integer");
                if (begin >>>= 0, "number" != typeof end || end % 1 != 0) throw TypeError("Illegal end: Not an integer");
                if (end >>>= 0, begin < 0 || begin > end || end > this.buffer.length) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.length);
            }
            return this.buffer.toString("base64", begin, end);
        }, ByteBuffer.fromBase64 = function(str, littleEndian, noAssert) {
            if (!noAssert) {
                if ("string" != typeof str) throw TypeError("Illegal str: Not a string");
                if (str.length % 4 != 0) throw TypeError("Illegal str: Length not a multiple of 4");
            }
            var bb = new ByteBuffer(0, littleEndian, noAssert);
            return bb.buffer = new Buffer(str, "base64"), bb.limit = bb.buffer.length, bb;
        }, ByteBuffer.btoa = function(str) {
            return ByteBuffer.fromBinary(str).toBase64();
        }, ByteBuffer.atob = function(b64) {
            return ByteBuffer.fromBase64(b64).toBinary();
        }, ByteBufferPrototype.toBinary = function(begin, end) {
            if (begin = void 0 === begin ? this.offset : begin, end = void 0 === end ? this.limit : end, 
            !this.noAssert) {
                if ("number" != typeof begin || begin % 1 != 0) throw TypeError("Illegal begin: Not an integer");
                if (begin >>>= 0, "number" != typeof end || end % 1 != 0) throw TypeError("Illegal end: Not an integer");
                if (end >>>= 0, begin < 0 || begin > end || end > this.buffer.length) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.length);
            }
            return this.buffer.toString("binary", begin, end);
        }, ByteBuffer.fromBinary = function(str, littleEndian, noAssert) {
            if (!noAssert && "string" != typeof str) throw TypeError("Illegal str: Not a string");
            var bb = new ByteBuffer(0, littleEndian, noAssert);
            return bb.buffer = new Buffer(str, "binary"), bb.limit = bb.buffer.length, bb;
        }, ByteBufferPrototype.toDebug = function(columns) {
            for (var b, i = -1, k = this.buffer.length, hex = "", asc = "", out = ""; i < k; ) {
                if (-1 !== i && (hex += (b = this.buffer[i]) < 16 ? "0" + b.toString(16).toUpperCase() : b.toString(16).toUpperCase(), 
                columns && (asc += b > 32 && b < 127 ? String.fromCharCode(b) : ".")), ++i, columns && i > 0 && i % 16 == 0 && i !== k) {
                    for (;hex.length < 51; ) hex += " ";
                    out += hex + asc + "\n", hex = asc = "";
                }
                i === this.offset && i === this.limit ? hex += i === this.markedOffset ? "!" : "|" : i === this.offset ? hex += i === this.markedOffset ? "[" : "<" : i === this.limit ? hex += i === this.markedOffset ? "]" : ">" : hex += i === this.markedOffset ? "'" : columns || 0 !== i && i !== k ? " " : "";
            }
            if (columns && " " !== hex) {
                for (;hex.length < 51; ) hex += " ";
                out += hex + asc + "\n";
            }
            return columns ? out : hex;
        }, ByteBuffer.fromDebug = function(str, littleEndian, noAssert) {
            for (var ch, b, k = str.length, bb = new ByteBuffer((k + 1) / 3 | 0, littleEndian, noAssert), i = 0, j = 0, rs = !1, ho = !1, hm = !1, hl = !1, fail = !1; i < k; ) {
                switch (ch = str.charAt(i++)) {
                  case "!":
                    if (!noAssert) {
                        if (ho || hm || hl) {
                            fail = !0;
                            break;
                        }
                        ho = hm = hl = !0;
                    }
                    bb.offset = bb.markedOffset = bb.limit = j, rs = !1;
                    break;

                  case "|":
                    if (!noAssert) {
                        if (ho || hl) {
                            fail = !0;
                            break;
                        }
                        ho = hl = !0;
                    }
                    bb.offset = bb.limit = j, rs = !1;
                    break;

                  case "[":
                    if (!noAssert) {
                        if (ho || hm) {
                            fail = !0;
                            break;
                        }
                        ho = hm = !0;
                    }
                    bb.offset = bb.markedOffset = j, rs = !1;
                    break;

                  case "<":
                    if (!noAssert) {
                        if (ho) {
                            fail = !0;
                            break;
                        }
                        ho = !0;
                    }
                    bb.offset = j, rs = !1;
                    break;

                  case "]":
                    if (!noAssert) {
                        if (hl || hm) {
                            fail = !0;
                            break;
                        }
                        hl = hm = !0;
                    }
                    bb.limit = bb.markedOffset = j, rs = !1;
                    break;

                  case ">":
                    if (!noAssert) {
                        if (hl) {
                            fail = !0;
                            break;
                        }
                        hl = !0;
                    }
                    bb.limit = j, rs = !1;
                    break;

                  case "'":
                    if (!noAssert) {
                        if (hm) {
                            fail = !0;
                            break;
                        }
                        hm = !0;
                    }
                    bb.markedOffset = j, rs = !1;
                    break;

                  case " ":
                    rs = !1;
                    break;

                  default:
                    if (!noAssert && rs) {
                        fail = !0;
                        break;
                    }
                    if (b = parseInt(ch + str.charAt(i++), 16), !noAssert && (isNaN(b) || b < 0 || b > 255)) throw TypeError("Illegal str: Not a debug encoded string");
                    bb.buffer[j++] = b, rs = !0;
                }
                if (fail) throw TypeError("Illegal str: Invalid symbol at " + i);
            }
            if (!noAssert) {
                if (!ho || !hl) throw TypeError("Illegal str: Missing offset or limit");
                if (j < bb.buffer.length) throw TypeError("Illegal str: Not a debug encoded string (is it hex?) " + j + " < " + k);
            }
            return bb;
        }, ByteBufferPrototype.toHex = function(begin, end) {
            if (begin = void 0 === begin ? this.offset : begin, end = void 0 === end ? this.limit : end, 
            !this.noAssert) {
                if ("number" != typeof begin || begin % 1 != 0) throw TypeError("Illegal begin: Not an integer");
                if (begin >>>= 0, "number" != typeof end || end % 1 != 0) throw TypeError("Illegal end: Not an integer");
                if (end >>>= 0, begin < 0 || begin > end || end > this.buffer.length) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.length);
            }
            return this.buffer.toString("hex", begin, end);
        }, ByteBuffer.fromHex = function(str, littleEndian, noAssert) {
            if (!noAssert) {
                if ("string" != typeof str) throw TypeError("Illegal str: Not a string");
                if (str.length % 2 != 0) throw TypeError("Illegal str: Length not a multiple of 2");
            }
            var bb = new ByteBuffer(0, littleEndian, !0);
            return bb.buffer = new Buffer(str, "hex"), bb.limit = bb.buffer.length, bb;
        };
        var utfx = (function() {
            var utfx = {
                MAX_CODEPOINT: 1114111,
                encodeUTF8: function(src, dst) {
                    var cp = null;
                    for ("number" == typeof src && (cp = src, src = function() {
                        return null;
                    }); null !== cp || null !== (cp = src()); ) cp < 128 ? dst(127 & cp) : cp < 2048 ? (dst(cp >> 6 & 31 | 192), 
                    dst(63 & cp | 128)) : cp < 65536 ? (dst(cp >> 12 & 15 | 224), dst(cp >> 6 & 63 | 128), 
                    dst(63 & cp | 128)) : (dst(cp >> 18 & 7 | 240), dst(cp >> 12 & 63 | 128), dst(cp >> 6 & 63 | 128), 
                    dst(63 & cp | 128)), cp = null;
                },
                decodeUTF8: function(src, dst) {
                    for (var a, b, c, d, fail = function(b) {
                        b = b.slice(0, b.indexOf(null));
                        var err = Error(b.toString());
                        throw err.name = "TruncatedError", err.bytes = b, err;
                    }; null !== (a = src()); ) if (0 == (128 & a)) dst(a); else if (192 == (224 & a)) null === (b = src()) && fail([ a, b ]), 
                    dst((31 & a) << 6 | 63 & b); else if (224 == (240 & a)) (null === (b = src()) || null === (c = src())) && fail([ a, b, c ]), 
                    dst((15 & a) << 12 | (63 & b) << 6 | 63 & c); else {
                        if (240 != (248 & a)) throw RangeError("Illegal starting byte: " + a);
                        (null === (b = src()) || null === (c = src()) || null === (d = src())) && fail([ a, b, c, d ]), 
                        dst((7 & a) << 18 | (63 & b) << 12 | (63 & c) << 6 | 63 & d);
                    }
                },
                UTF16toUTF8: function(src, dst) {
                    for (var c1, c2 = null; null !== (c1 = null !== c2 ? c2 : src()); ) c1 >= 55296 && c1 <= 57343 && null !== (c2 = src()) && c2 >= 56320 && c2 <= 57343 ? (dst(1024 * (c1 - 55296) + c2 - 56320 + 65536), 
                    c2 = null) : dst(c1);
                    null !== c2 && dst(c2);
                },
                UTF8toUTF16: function(src, dst) {
                    var cp = null;
                    for ("number" == typeof src && (cp = src, src = function() {
                        return null;
                    }); null !== cp || null !== (cp = src()); ) cp <= 65535 ? dst(cp) : (dst(55296 + ((cp -= 65536) >> 10)), 
                    dst(cp % 1024 + 56320)), cp = null;
                },
                encodeUTF16toUTF8: function(src, dst) {
                    utfx.UTF16toUTF8(src, (function(cp) {
                        utfx.encodeUTF8(cp, dst);
                    }));
                },
                decodeUTF8toUTF16: function(src, dst) {
                    utfx.decodeUTF8(src, (function(cp) {
                        utfx.UTF8toUTF16(cp, dst);
                    }));
                },
                calculateCodePoint: function(cp) {
                    return cp < 128 ? 1 : cp < 2048 ? 2 : cp < 65536 ? 3 : 4;
                },
                calculateUTF8: function(src) {
                    for (var cp, l = 0; null !== (cp = src()); ) l += utfx.calculateCodePoint(cp);
                    return l;
                },
                calculateUTF16asUTF8: function(src) {
                    var n = 0, l = 0;
                    return utfx.UTF16toUTF8(src, (function(cp) {
                        ++n, l += utfx.calculateCodePoint(cp);
                    })), [ n, l ];
                }
            };
            return utfx;
        })();
        return ByteBufferPrototype.toUTF8 = function(begin, end) {
            if (void 0 === begin && (begin = this.offset), void 0 === end && (end = this.limit), 
            !this.noAssert) {
                if ("number" != typeof begin || begin % 1 != 0) throw TypeError("Illegal begin: Not an integer");
                if (begin >>>= 0, "number" != typeof end || end % 1 != 0) throw TypeError("Illegal end: Not an integer");
                if (end >>>= 0, begin < 0 || begin > end || end > this.buffer.length) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.length);
            }
            return this.buffer.toString("utf8", begin, end);
        }, ByteBuffer.fromUTF8 = function(str, littleEndian, noAssert) {
            if (!noAssert && "string" != typeof str) throw TypeError("Illegal str: Not a string");
            var bb = new ByteBuffer(0, littleEndian, noAssert);
            return bb.buffer = new Buffer(str, "utf8"), bb.limit = bb.buffer.length, bb;
        }, ByteBuffer.memcpy = memcpy, ByteBuffer;
    })();
}
