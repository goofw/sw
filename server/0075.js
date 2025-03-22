function(module, exports, __webpack_require__) {
    "use strict";
    var util = __webpack_require__(0), debug = __webpack_require__(41)("matroska:tools"), Schema = __webpack_require__(13), dateformat = __webpack_require__(274), CLASS_A_SIZE = Math.pow(2, 7), CLASS_B_SIZE = Math.pow(2, 14), CLASS_C_SIZE = Math.pow(2, 21), CLASS_D_SIZE = Math.pow(2, 28), CLASS_E_SIZE = Math.pow(2, 35), CLASS_F_SIZE = Math.pow(2, 42), CLASS_G_SIZE = Math.pow(2, 49), MAX_7BITS = (Math.pow(2, 56), 
    Math.pow(2, 7)), MAX_8BITS = Math.pow(2, 8), MAX_15BITS = Math.pow(2, 15), MAX_16BITS = Math.pow(2, 16), MAX_23BITS = Math.pow(2, 23), MAX_24BITS = Math.pow(2, 24), MAX_31BITS = Math.pow(2, 31), MAX_32BITS = Math.pow(2, 32), MAX_39BITS = Math.pow(2, 39), MAX_40BITS = Math.pow(2, 40), MAX_47BITS = Math.pow(2, 47), MAX_48BITS = Math.pow(2, 48), MAX_53BITS = (Math.pow(2, 52), 
    Math.pow(2, 53)), MAX_55BITS = Math.pow(2, 55), MAX_56BITS = Math.pow(2, 56), BITSn = [ 0, 256, Math.pow(2, 16), Math.pow(2, 24), Math.pow(2, 32), Math.pow(2, 40), Math.pow(2, 48), Math.pow(2, 56) ], BUFFS = [ new Buffer([ 0 ]), new Buffer([ 1 ]), new Buffer([ 2 ]), new Buffer([ 3 ]) ], BUFFSV = [ new Buffer([ 128 ]), new Buffer([ 129 ]) ], floatBuf = new Buffer(4), tools = {
        readVInt: function(buffer, start, ret, keepMask) {
            var bs = buffer[start = start || 0];
            if (!bs) throw (error = new Error("INVALID VINT format (value=0)")).code = "INVALID", 
            error;
            var length = 8;
            if (bs >= 128) length = 1; else if (bs >= 64) length = 2; else if (bs >= 32) length = 3; else if (bs >= 16) length = 4; else if (bs >= 8) length = 5; else if (bs >= 4) length = 6; else if (bs >= 2) length = 7; else {
                if (!(bs >= 1)) throw (error = new Error("INVALID VINT format (length>7 bs=" + bs + ")")).code = "INVALID", 
                error;
                length = 8;
            }
            if (start + length > buffer.length) return debug.enabled && debug("No enough bytes for VINT format " + start + "+" + length + ">" + buffer.length), 
            null;
            ret || (ret = {}), ret.length = length;
            var value = bs;
            for (keepMask || (value &= (1 << 8 - length) - 1), length--, start++; length; ) {
                var error, len = Math.min(length, 6), v = buffer.readUIntBE(start, len);
                if (value = value * BITSn[len] + v, 7 === length && value >= MAX_40BITS) throw (error = new Error("INVALID VINT value too big (length>7 bs=" + bs + ")")).code = "INVALID", 
                error;
                length -= len, start += len;
            }
            return ret.value = value, ret;
        },
        writeVInt: function(value, buffer, offset) {
            if (value < 0) throw new Error("Unrepresentable value: " + value);
            if (value < BUFFSV.length) return BUFFSV[value];
            var length = this.sizeVInt(value);
            return buffer || (buffer = new Buffer(length), offset = 0), this.writeVIntBuffer(value, buffer, offset), 
            0 === offset && buffer.length === length ? buffer : buffer.slice(offset, length);
        },
        writeVIntBuffer: function(value, buffer, offset) {
            if (value < 0) throw new Error("Unrepresentable value: " + value);
            if (offset < 0 || isNaN(offset)) throw new Error("Invalid offset " + offset);
            var length = this.sizeVInt(value);
            if (length > 1) for (var l = length - 1, off = offset + l + 1; l; ) {
                var len = Math.min(l, 6);
                off -= len, buffer.writeUIntBE(value, off, len, !0), value /= BITSn[len], l -= len;
            }
            return buffer[offset] = value | 1 << 8 - length, length;
        },
        readHInt: function(buffer, start, ret) {
            return this.readVInt(buffer, start, ret, !0);
        },
        sizeHInt: function(value) {
            if (value < 0) throw new Error("Unrepresentable value: " + value);
            return this.sizeVInt(value / 2);
        },
        sizeVInt: function(value) {
            if (value < 0) throw new Error("Unrepresentable value: " + value);
            return value < CLASS_A_SIZE - 1 ? 1 : value < CLASS_B_SIZE - 1 ? 2 : value < CLASS_C_SIZE - 1 ? 3 : value < CLASS_D_SIZE - 1 ? 4 : value < CLASS_E_SIZE - 1 ? 5 : value < CLASS_F_SIZE - 1 ? 6 : value < CLASS_G_SIZE - 1 ? 7 : 8;
        },
        sizeUInt: function(value) {
            if (value < 0) throw new Error("Unrepresentable value: " + value);
            return value < MAX_8BITS ? 1 : value < MAX_16BITS ? 2 : value < MAX_24BITS ? 3 : value < MAX_32BITS ? 4 : value < MAX_40BITS ? 5 : value < MAX_48BITS ? 6 : value < MAX_56BITS ? 7 : 8;
        },
        sizeInt: function(value) {
            return value > -MAX_7BITS && value < MAX_7BITS ? 1 : value > -MAX_15BITS && value < MAX_15BITS ? 2 : value > -MAX_23BITS && value < MAX_23BITS ? 3 : value > -MAX_31BITS && value < MAX_31BITS ? 4 : value > -MAX_39BITS && value < MAX_39BITS ? 5 : value > -MAX_47BITS && value < MAX_47BITS ? 6 : value > -MAX_55BITS && value < MAX_55BITS ? 7 : 8;
        },
        sizeFloat: function(value) {
            return floatBuf.writeFloatBE(value, 0), floatBuf.readFloatBE(0) !== value ? 8 : 4;
        },
        writeInt: function(newValue) {
            var b, size = this.sizeInt(newValue);
            if (1 === size) return newValue >= 0 && newValue < BUFFS.length ? BUFFS[newValue] : ((b = new Buffer(1))[0] = newValue, 
            b);
            if (size < 7) return (b = new Buffer(size)).writeIntBE(0, newValue, b.length), b;
            if (newValue > -MAX_53BITS && newValue < MAX_53BITS) return (b = new Buffer(7))[0] = newValue / MAX_48BITS, 
            b.writeUIntBE(newValue, 1, 6, !0), b;
            throw new Error("Can not encode more than 52 bits");
        },
        writeUInt: function(newValue) {
            var b, size = this.sizeUInt(newValue);
            if (1 === size) return newValue < BUFFS.length ? BUFFS[newValue] : ((b = new Buffer(1))[0] = newValue, 
            b);
            if (size < 7) {
                try {
                    (b = new Buffer(size)).writeUIntBE(newValue, 0, b.length);
                } catch (x) {
                    throw new Error("newValue=" + newValue + " len=" + b.length + " " + x);
                }
                return b;
            }
            if (newValue < MAX_53BITS) return (b = new Buffer(7))[0] = newValue / MAX_48BITS, 
            b.writeUIntBE(newValue, 1, 6, !0), b;
            throw new Error("Can not encode more than 52 bits");
        },
        convertEbmlID: function(ebmlID) {
            if ("number" == typeof ebmlID) return ebmlID;
            if ("string" == typeof ebmlID) {
                var desc = Schema.byName[ebmlID];
                if (!desc) throw new Error("Unknown ebmlID name '" + emblID + "'");
                return desc;
            }
            throw new Error("Invalid ebmlID parameter '" + ebmlID + "'");
        },
        writeCRC: function(crc) {
            for (var data = new Buffer(4), i = 0; i < 4; i++) data[i] = crc, crc >>= 8;
            return data;
        },
        writeEbmlID: function(ebmlID) {
            for (var data = new Buffer(8), i = data.length - 1; i >= 0; i--) if (data[i] = ebmlID, 
            !(ebmlID >>= 8)) return data.slice(i);
            return data;
        },
        readCRC: function(data) {
            for (var len = data.length, crc = 0, i = 0; i < len; i++) crc <<= 8 + data[i];
            return crc;
        },
        formatDate: function(date) {
            return dateformat(date, "yyyy-mm-dd HH:MM:ss.l");
        },
        formatDay: function(date) {
            return dateformat(date, "yyyy-mm-dd");
        },
        formatYear: function(date) {
            return dateformat(date, "yyyy");
        },
        validType: function(type, value) {
            switch (type) {
              case "8":
              case "s":
                if ("string" == typeof value || null == value) return value;
                break;

              case "u":
              case "i":
              case "u":
              case "i":
              case "f":
                if ("number" == typeof value || void 0 === value) return value;
                break;

              case "d":
                if (util.isDate(value) || null == value) return value;
                break;

              case "b":
                if (Buffer.isBuffer(value) || null == value) return value;
            }
            throw new Error("Invalid value '" + value + "' for type '" + type + "'");
        }
    };
    module.exports = tools;
}
