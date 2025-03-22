function(module, exports, __webpack_require__) {
    var start, log_level, logObject, Log = (start = new Date, log_level = 4, logObject = {
        setLogLevel: function(level) {
            log_level = level == this.debug ? 1 : level == this.info ? 2 : level == this.warn ? 3 : (this.error, 
            4);
        },
        debug: function(module, msg) {
            void 0 === console.debug && (console.debug = console.log), 1 >= log_level && console.debug("[" + Log.getDurationString(new Date - start, 1e3) + "]", "[" + module + "]", msg);
        },
        log: function(module, msg) {
            this.debug(module.msg);
        },
        info: function(module, msg) {
            2 >= log_level && console.info("[" + Log.getDurationString(new Date - start, 1e3) + "]", "[" + module + "]", msg);
        },
        warn: function(module, msg) {
            3 >= log_level && console.warn("[" + Log.getDurationString(new Date - start, 1e3) + "]", "[" + module + "]", msg);
        },
        error: function(module, msg) {
            4 >= log_level && console.error("[" + Log.getDurationString(new Date - start, 1e3) + "]", "[" + module + "]", msg);
        }
    }, logObject);
    Log.getDurationString = function(duration, _timescale) {
        var neg;
        function pad(number, length) {
            for (var a = ("" + number).split("."); a[0].length < length; ) a[0] = "0" + a[0];
            return a.join(".");
        }
        duration < 0 ? (neg = !0, duration = -duration) : neg = !1;
        var duration_sec = duration / (_timescale || 1), hours = Math.floor(duration_sec / 3600);
        duration_sec -= 3600 * hours;
        var minutes = Math.floor(duration_sec / 60), msec = 1e3 * (duration_sec -= 60 * minutes);
        return msec -= 1e3 * (duration_sec = Math.floor(duration_sec)), msec = Math.floor(msec), 
        (neg ? "-" : "") + hours + ":" + pad(minutes, 2) + ":" + pad(duration_sec, 2) + "." + pad(msec, 3);
    }, Log.printRanges = function(ranges) {
        var length = ranges.length;
        if (length > 0) {
            for (var str = "", i = 0; i < length; i++) i > 0 && (str += ","), str += "[" + Log.getDurationString(ranges.start(i)) + "," + Log.getDurationString(ranges.end(i)) + "]";
            return str;
        }
        return "(empty)";
    }, exports.Log = Log;
    var MP4BoxStream = function(arrayBuffer) {
        if (!(arrayBuffer instanceof ArrayBuffer)) throw "Needs an array buffer";
        this.buffer = arrayBuffer, this.dataview = new DataView(arrayBuffer), this.position = 0;
    };
    MP4BoxStream.prototype.getPosition = function() {
        return this.position;
    }, MP4BoxStream.prototype.getEndPosition = function() {
        return this.buffer.byteLength;
    }, MP4BoxStream.prototype.getLength = function() {
        return this.buffer.byteLength;
    }, MP4BoxStream.prototype.seek = function(pos) {
        var npos = Math.max(0, Math.min(this.buffer.byteLength, pos));
        return this.position = isNaN(npos) || !isFinite(npos) ? 0 : npos, !0;
    }, MP4BoxStream.prototype.isEos = function() {
        return this.getPosition() >= this.getEndPosition();
    }, MP4BoxStream.prototype.readAnyInt = function(size, signed) {
        var res = 0;
        if (this.position + size <= this.buffer.byteLength) {
            switch (size) {
              case 1:
                res = signed ? this.dataview.getInt8(this.position) : this.dataview.getUint8(this.position);
                break;

              case 2:
                res = signed ? this.dataview.getInt16(this.position) : this.dataview.getUint16(this.position);
                break;

              case 3:
                if (signed) throw "No method for reading signed 24 bits values";
                res = this.dataview.getUint8(this.position) << 16, res |= this.dataview.getUint8(this.position) << 8, 
                res |= this.dataview.getUint8(this.position);
                break;

              case 4:
                res = signed ? this.dataview.getInt32(this.position) : this.dataview.getUint32(this.position);
                break;

              case 8:
                if (signed) throw "No method for reading signed 64 bits values";
                res = this.dataview.getUint32(this.position) << 32, res |= this.dataview.getUint32(this.position);
                break;

              default:
                throw "readInt method not implemented for size: " + size;
            }
            return this.position += size, res;
        }
        throw "Not enough bytes in buffer";
    }, MP4BoxStream.prototype.readUint8 = function() {
        return this.readAnyInt(1, !1);
    }, MP4BoxStream.prototype.readUint16 = function() {
        return this.readAnyInt(2, !1);
    }, MP4BoxStream.prototype.readUint24 = function() {
        return this.readAnyInt(3, !1);
    }, MP4BoxStream.prototype.readUint32 = function() {
        return this.readAnyInt(4, !1);
    }, MP4BoxStream.prototype.readUint64 = function() {
        return this.readAnyInt(8, !1);
    }, MP4BoxStream.prototype.readString = function(length) {
        if (this.position + length <= this.buffer.byteLength) {
            for (var s = "", i = 0; i < length; i++) s += String.fromCharCode(this.readUint8());
            return s;
        }
        throw "Not enough bytes in buffer";
    }, MP4BoxStream.prototype.readCString = function() {
        for (var arr = []; ;) {
            var b = this.readUint8();
            if (0 === b) break;
            arr.push(b);
        }
        return String.fromCharCode.apply(null, arr);
    }, MP4BoxStream.prototype.readInt8 = function() {
        return this.readAnyInt(1, !0);
    }, MP4BoxStream.prototype.readInt16 = function() {
        return this.readAnyInt(2, !0);
    }, MP4BoxStream.prototype.readInt32 = function() {
        return this.readAnyInt(4, !0);
    }, MP4BoxStream.prototype.readInt64 = function() {
        return this.readAnyInt(8, !1);
    }, MP4BoxStream.prototype.readUint8Array = function(length) {
        for (var arr = new Uint8Array(length), i = 0; i < length; i++) arr[i] = this.readUint8();
        return arr;
    }, MP4BoxStream.prototype.readInt16Array = function(length) {
        for (var arr = new Int16Array(length), i = 0; i < length; i++) arr[i] = this.readInt16();
        return arr;
    }, MP4BoxStream.prototype.readUint16Array = function(length) {
        for (var arr = new Int16Array(length), i = 0; i < length; i++) arr[i] = this.readUint16();
        return arr;
    }, MP4BoxStream.prototype.readUint32Array = function(length) {
        for (var arr = new Uint32Array(length), i = 0; i < length; i++) arr[i] = this.readUint32();
        return arr;
    }, MP4BoxStream.prototype.readInt32Array = function(length) {
        for (var arr = new Int32Array(length), i = 0; i < length; i++) arr[i] = this.readInt32();
        return arr;
    }, exports.MP4BoxStream = MP4BoxStream;
    var DataStream = function(arrayBuffer, byteOffset, endianness) {
        this._byteOffset = byteOffset || 0, arrayBuffer instanceof ArrayBuffer ? this.buffer = arrayBuffer : "object" == typeof arrayBuffer ? (this.dataView = arrayBuffer, 
        byteOffset && (this._byteOffset += byteOffset)) : this.buffer = new ArrayBuffer(arrayBuffer || 0), 
        this.position = 0, this.endianness = null == endianness ? DataStream.LITTLE_ENDIAN : endianness;
    };
    DataStream.prototype = {}, DataStream.prototype.getPosition = function() {
        return this.position;
    }, DataStream.prototype._realloc = function(extra) {
        if (this._dynamicSize) {
            var req = this._byteOffset + this.position + extra, blen = this._buffer.byteLength;
            if (req <= blen) req > this._byteLength && (this._byteLength = req); else {
                for (blen < 1 && (blen = 1); req > blen; ) blen *= 2;
                var buf = new ArrayBuffer(blen), src = new Uint8Array(this._buffer);
                new Uint8Array(buf, 0, src.length).set(src), this.buffer = buf, this._byteLength = req;
            }
        }
    }, DataStream.prototype._trimAlloc = function() {
        if (this._byteLength != this._buffer.byteLength) {
            var buf = new ArrayBuffer(this._byteLength), dst = new Uint8Array(buf), src = new Uint8Array(this._buffer, 0, dst.length);
            dst.set(src), this.buffer = buf;
        }
    }, DataStream.BIG_ENDIAN = !1, DataStream.LITTLE_ENDIAN = !0, DataStream.prototype._byteLength = 0, 
    Object.defineProperty(DataStream.prototype, "byteLength", {
        get: function() {
            return this._byteLength - this._byteOffset;
        }
    }), Object.defineProperty(DataStream.prototype, "buffer", {
        get: function() {
            return this._trimAlloc(), this._buffer;
        },
        set: function(v) {
            this._buffer = v, this._dataView = new DataView(this._buffer, this._byteOffset), 
            this._byteLength = this._buffer.byteLength;
        }
    }), Object.defineProperty(DataStream.prototype, "byteOffset", {
        get: function() {
            return this._byteOffset;
        },
        set: function(v) {
            this._byteOffset = v, this._dataView = new DataView(this._buffer, this._byteOffset), 
            this._byteLength = this._buffer.byteLength;
        }
    }), Object.defineProperty(DataStream.prototype, "dataView", {
        get: function() {
            return this._dataView;
        },
        set: function(v) {
            this._byteOffset = v.byteOffset, this._buffer = v.buffer, this._dataView = new DataView(this._buffer, this._byteOffset), 
            this._byteLength = this._byteOffset + v.byteLength;
        }
    }), DataStream.prototype.seek = function(pos) {
        var npos = Math.max(0, Math.min(this.byteLength, pos));
        this.position = isNaN(npos) || !isFinite(npos) ? 0 : npos;
    }, DataStream.prototype.isEof = function() {
        return this.position >= this._byteLength;
    }, DataStream.prototype.mapUint8Array = function(length) {
        this._realloc(1 * length);
        var arr = new Uint8Array(this._buffer, this.byteOffset + this.position, length);
        return this.position += 1 * length, arr;
    }, DataStream.prototype.readInt32Array = function(length, e) {
        length = null == length ? this.byteLength - this.position / 4 : length;
        var arr = new Int32Array(length);
        return DataStream.memcpy(arr.buffer, 0, this.buffer, this.byteOffset + this.position, length * arr.BYTES_PER_ELEMENT), 
        DataStream.arrayToNative(arr, null == e ? this.endianness : e), this.position += arr.byteLength, 
        arr;
    }, DataStream.prototype.readInt16Array = function(length, e) {
        length = null == length ? this.byteLength - this.position / 2 : length;
        var arr = new Int16Array(length);
        return DataStream.memcpy(arr.buffer, 0, this.buffer, this.byteOffset + this.position, length * arr.BYTES_PER_ELEMENT), 
        DataStream.arrayToNative(arr, null == e ? this.endianness : e), this.position += arr.byteLength, 
        arr;
    }, DataStream.prototype.readInt8Array = function(length) {
        length = null == length ? this.byteLength - this.position : length;
        var arr = new Int8Array(length);
        return DataStream.memcpy(arr.buffer, 0, this.buffer, this.byteOffset + this.position, length * arr.BYTES_PER_ELEMENT), 
        this.position += arr.byteLength, arr;
    }, DataStream.prototype.readUint32Array = function(length, e) {
        length = null == length ? this.byteLength - this.position / 4 : length;
        var arr = new Uint32Array(length);
        return DataStream.memcpy(arr.buffer, 0, this.buffer, this.byteOffset + this.position, length * arr.BYTES_PER_ELEMENT), 
        DataStream.arrayToNative(arr, null == e ? this.endianness : e), this.position += arr.byteLength, 
        arr;
    }, DataStream.prototype.readUint16Array = function(length, e) {
        length = null == length ? this.byteLength - this.position / 2 : length;
        var arr = new Uint16Array(length);
        return DataStream.memcpy(arr.buffer, 0, this.buffer, this.byteOffset + this.position, length * arr.BYTES_PER_ELEMENT), 
        DataStream.arrayToNative(arr, null == e ? this.endianness : e), this.position += arr.byteLength, 
        arr;
    }, DataStream.prototype.readUint8Array = function(length) {
        length = null == length ? this.byteLength - this.position : length;
        var arr = new Uint8Array(length);
        return DataStream.memcpy(arr.buffer, 0, this.buffer, this.byteOffset + this.position, length * arr.BYTES_PER_ELEMENT), 
        this.position += arr.byteLength, arr;
    }, DataStream.prototype.readFloat64Array = function(length, e) {
        length = null == length ? this.byteLength - this.position / 8 : length;
        var arr = new Float64Array(length);
        return DataStream.memcpy(arr.buffer, 0, this.buffer, this.byteOffset + this.position, length * arr.BYTES_PER_ELEMENT), 
        DataStream.arrayToNative(arr, null == e ? this.endianness : e), this.position += arr.byteLength, 
        arr;
    }, DataStream.prototype.readFloat32Array = function(length, e) {
        length = null == length ? this.byteLength - this.position / 4 : length;
        var arr = new Float32Array(length);
        return DataStream.memcpy(arr.buffer, 0, this.buffer, this.byteOffset + this.position, length * arr.BYTES_PER_ELEMENT), 
        DataStream.arrayToNative(arr, null == e ? this.endianness : e), this.position += arr.byteLength, 
        arr;
    }, DataStream.prototype.readInt32 = function(e) {
        var v = this._dataView.getInt32(this.position, null == e ? this.endianness : e);
        return this.position += 4, v;
    }, DataStream.prototype.readInt16 = function(e) {
        var v = this._dataView.getInt16(this.position, null == e ? this.endianness : e);
        return this.position += 2, v;
    }, DataStream.prototype.readInt8 = function() {
        var v = this._dataView.getInt8(this.position);
        return this.position += 1, v;
    }, DataStream.prototype.readUint32 = function(e) {
        var v = this._dataView.getUint32(this.position, null == e ? this.endianness : e);
        return this.position += 4, v;
    }, DataStream.prototype.readUint16 = function(e) {
        var v = this._dataView.getUint16(this.position, null == e ? this.endianness : e);
        return this.position += 2, v;
    }, DataStream.prototype.readUint8 = function() {
        var v = this._dataView.getUint8(this.position);
        return this.position += 1, v;
    }, DataStream.prototype.readFloat32 = function(e) {
        var v = this._dataView.getFloat32(this.position, null == e ? this.endianness : e);
        return this.position += 4, v;
    }, DataStream.prototype.readFloat64 = function(e) {
        var v = this._dataView.getFloat64(this.position, null == e ? this.endianness : e);
        return this.position += 8, v;
    }, DataStream.endianness = new Int8Array(new Int16Array([ 1 ]).buffer)[0] > 0, DataStream.memcpy = function(dst, dstOffset, src, srcOffset, byteLength) {
        var dstU8 = new Uint8Array(dst, dstOffset, byteLength), srcU8 = new Uint8Array(src, srcOffset, byteLength);
        dstU8.set(srcU8);
    }, DataStream.arrayToNative = function(array, arrayIsLittleEndian) {
        return arrayIsLittleEndian == this.endianness ? array : this.flipArrayEndianness(array);
    }, DataStream.nativeToEndian = function(array, littleEndian) {
        return this.endianness == littleEndian ? array : this.flipArrayEndianness(array);
    }, DataStream.flipArrayEndianness = function(array) {
        for (var u8 = new Uint8Array(array.buffer, array.byteOffset, array.byteLength), i = 0; i < array.byteLength; i += array.BYTES_PER_ELEMENT) for (var j = i + array.BYTES_PER_ELEMENT - 1, k = i; j > k; j--, 
        k++) {
            var tmp = u8[k];
            u8[k] = u8[j], u8[j] = tmp;
        }
        return array;
    }, DataStream.prototype.failurePosition = 0, String.fromCharCodeUint8 = function(uint8arr) {
        for (var arr = [], i = 0; i < uint8arr.length; i++) arr[i] = uint8arr[i];
        return String.fromCharCode.apply(null, arr);
    }, DataStream.prototype.readString = function(length, encoding) {
        return null == encoding || "ASCII" == encoding ? String.fromCharCodeUint8.apply(null, [ this.mapUint8Array(null == length ? this.byteLength - this.position : length) ]) : new TextDecoder(encoding).decode(this.mapUint8Array(length));
    }, DataStream.prototype.readCString = function(length) {
        var blen = this.byteLength - this.position, u8 = new Uint8Array(this._buffer, this._byteOffset + this.position), len = blen;
        null != length && (len = Math.min(length, blen));
        for (var i = 0; i < len && 0 !== u8[i]; i++) ;
        var s = String.fromCharCodeUint8.apply(null, [ this.mapUint8Array(i) ]);
        return null != length ? this.position += len - i : i != blen && (this.position += 1), 
        s;
    };
    var MAX_SIZE = Math.pow(2, 32);
    DataStream.prototype.readInt64 = function() {
        return this.readInt32() * MAX_SIZE + this.readUint32();
    }, DataStream.prototype.readUint64 = function() {
        return this.readUint32() * MAX_SIZE + this.readUint32();
    }, DataStream.prototype.readInt64 = function() {
        return this.readUint32() * MAX_SIZE + this.readUint32();
    }, DataStream.prototype.readUint24 = function() {
        return (this.readUint8() << 16) + (this.readUint8() << 8) + this.readUint8();
    }, exports.DataStream = DataStream, DataStream.prototype.save = function(filename) {
        var blob = new Blob([ this.buffer ]);
        if (!window.URL || !URL.createObjectURL) throw "DataStream.save: Can't create object URL.";
        var url = window.URL.createObjectURL(blob), a = document.createElement("a");
        document.body.appendChild(a), a.setAttribute("href", url), a.setAttribute("download", filename), 
        a.setAttribute("target", "_self"), a.click(), window.URL.revokeObjectURL(url);
    }, DataStream.prototype._dynamicSize = !0, Object.defineProperty(DataStream.prototype, "dynamicSize", {
        get: function() {
            return this._dynamicSize;
        },
        set: function(v) {
            v || this._trimAlloc(), this._dynamicSize = v;
        }
    }), DataStream.prototype.shift = function(offset) {
        var buf = new ArrayBuffer(this._byteLength - offset), dst = new Uint8Array(buf), src = new Uint8Array(this._buffer, offset, dst.length);
        dst.set(src), this.buffer = buf, this.position -= offset;
    }, DataStream.prototype.writeInt32Array = function(arr, e) {
        if (this._realloc(4 * arr.length), arr instanceof Int32Array && this.byteOffset + this.position % arr.BYTES_PER_ELEMENT === 0) DataStream.memcpy(this._buffer, this.byteOffset + this.position, arr.buffer, 0, arr.byteLength), 
        this.mapInt32Array(arr.length, e); else for (var i = 0; i < arr.length; i++) this.writeInt32(arr[i], e);
    }, DataStream.prototype.writeInt16Array = function(arr, e) {
        if (this._realloc(2 * arr.length), arr instanceof Int16Array && this.byteOffset + this.position % arr.BYTES_PER_ELEMENT === 0) DataStream.memcpy(this._buffer, this.byteOffset + this.position, arr.buffer, 0, arr.byteLength), 
        this.mapInt16Array(arr.length, e); else for (var i = 0; i < arr.length; i++) this.writeInt16(arr[i], e);
    }, DataStream.prototype.writeInt8Array = function(arr) {
        if (this._realloc(1 * arr.length), arr instanceof Int8Array && this.byteOffset + this.position % arr.BYTES_PER_ELEMENT === 0) DataStream.memcpy(this._buffer, this.byteOffset + this.position, arr.buffer, 0, arr.byteLength), 
        this.mapInt8Array(arr.length); else for (var i = 0; i < arr.length; i++) this.writeInt8(arr[i]);
    }, DataStream.prototype.writeUint32Array = function(arr, e) {
        if (this._realloc(4 * arr.length), arr instanceof Uint32Array && this.byteOffset + this.position % arr.BYTES_PER_ELEMENT === 0) DataStream.memcpy(this._buffer, this.byteOffset + this.position, arr.buffer, 0, arr.byteLength), 
        this.mapUint32Array(arr.length, e); else for (var i = 0; i < arr.length; i++) this.writeUint32(arr[i], e);
    }, DataStream.prototype.writeUint16Array = function(arr, e) {
        if (this._realloc(2 * arr.length), arr instanceof Uint16Array && this.byteOffset + this.position % arr.BYTES_PER_ELEMENT === 0) DataStream.memcpy(this._buffer, this.byteOffset + this.position, arr.buffer, 0, arr.byteLength), 
        this.mapUint16Array(arr.length, e); else for (var i = 0; i < arr.length; i++) this.writeUint16(arr[i], e);
    }, DataStream.prototype.writeUint8Array = function(arr) {
        if (this._realloc(1 * arr.length), arr instanceof Uint8Array && this.byteOffset + this.position % arr.BYTES_PER_ELEMENT === 0) DataStream.memcpy(this._buffer, this.byteOffset + this.position, arr.buffer, 0, arr.byteLength), 
        this.mapUint8Array(arr.length); else for (var i = 0; i < arr.length; i++) this.writeUint8(arr[i]);
    }, DataStream.prototype.writeFloat64Array = function(arr, e) {
        if (this._realloc(8 * arr.length), arr instanceof Float64Array && this.byteOffset + this.position % arr.BYTES_PER_ELEMENT === 0) DataStream.memcpy(this._buffer, this.byteOffset + this.position, arr.buffer, 0, arr.byteLength), 
        this.mapFloat64Array(arr.length, e); else for (var i = 0; i < arr.length; i++) this.writeFloat64(arr[i], e);
    }, DataStream.prototype.writeFloat32Array = function(arr, e) {
        if (this._realloc(4 * arr.length), arr instanceof Float32Array && this.byteOffset + this.position % arr.BYTES_PER_ELEMENT === 0) DataStream.memcpy(this._buffer, this.byteOffset + this.position, arr.buffer, 0, arr.byteLength), 
        this.mapFloat32Array(arr.length, e); else for (var i = 0; i < arr.length; i++) this.writeFloat32(arr[i], e);
    }, DataStream.prototype.writeInt32 = function(v, e) {
        this._realloc(4), this._dataView.setInt32(this.position, v, null == e ? this.endianness : e), 
        this.position += 4;
    }, DataStream.prototype.writeInt16 = function(v, e) {
        this._realloc(2), this._dataView.setInt16(this.position, v, null == e ? this.endianness : e), 
        this.position += 2;
    }, DataStream.prototype.writeInt8 = function(v) {
        this._realloc(1), this._dataView.setInt8(this.position, v), this.position += 1;
    }, DataStream.prototype.writeUint32 = function(v, e) {
        this._realloc(4), this._dataView.setUint32(this.position, v, null == e ? this.endianness : e), 
        this.position += 4;
    }, DataStream.prototype.writeUint16 = function(v, e) {
        this._realloc(2), this._dataView.setUint16(this.position, v, null == e ? this.endianness : e), 
        this.position += 2;
    }, DataStream.prototype.writeUint8 = function(v) {
        this._realloc(1), this._dataView.setUint8(this.position, v), this.position += 1;
    }, DataStream.prototype.writeFloat32 = function(v, e) {
        this._realloc(4), this._dataView.setFloat32(this.position, v, null == e ? this.endianness : e), 
        this.position += 4;
    }, DataStream.prototype.writeFloat64 = function(v, e) {
        this._realloc(8), this._dataView.setFloat64(this.position, v, null == e ? this.endianness : e), 
        this.position += 8;
    }, DataStream.prototype.writeUCS2String = function(str, endianness, lengthOverride) {
        null == lengthOverride && (lengthOverride = str.length);
        for (var i = 0; i < str.length && i < lengthOverride; i++) this.writeUint16(str.charCodeAt(i), endianness);
        for (;i < lengthOverride; i++) this.writeUint16(0);
    }, DataStream.prototype.writeString = function(s, encoding, length) {
        var i = 0;
        if (null == encoding || "ASCII" == encoding) if (null != length) {
            var len = Math.min(s.length, length);
            for (i = 0; i < len; i++) this.writeUint8(s.charCodeAt(i));
            for (;i < length; i++) this.writeUint8(0);
        } else for (i = 0; i < s.length; i++) this.writeUint8(s.charCodeAt(i)); else this.writeUint8Array(new TextEncoder(encoding).encode(s.substring(0, length)));
    }, DataStream.prototype.writeCString = function(s, length) {
        var i = 0;
        if (null != length) {
            var len = Math.min(s.length, length);
            for (i = 0; i < len; i++) this.writeUint8(s.charCodeAt(i));
            for (;i < length; i++) this.writeUint8(0);
        } else {
            for (i = 0; i < s.length; i++) this.writeUint8(s.charCodeAt(i));
            this.writeUint8(0);
        }
    }, DataStream.prototype.writeStruct = function(structDefinition, struct) {
        for (var i = 0; i < structDefinition.length; i += 2) {
            var t = structDefinition[i + 1];
            this.writeType(t, struct[structDefinition[i]], struct);
        }
    }, DataStream.prototype.writeType = function(t, v, struct) {
        var tp;
        if ("function" == typeof t) return t(this, v);
        if ("object" == typeof t && !(t instanceof Array)) return t.set(this, v, struct);
        var lengthOverride = null, charset = "ASCII", pos = this.position;
        switch ("string" == typeof t && /:/.test(t) && (tp = t.split(":"), t = tp[0], lengthOverride = parseInt(tp[1])), 
        "string" == typeof t && /,/.test(t) && (tp = t.split(","), t = tp[0], charset = parseInt(tp[1])), 
        t) {
          case "uint8":
            this.writeUint8(v);
            break;

          case "int8":
            this.writeInt8(v);
            break;

          case "uint16":
            this.writeUint16(v, this.endianness);
            break;

          case "int16":
            this.writeInt16(v, this.endianness);
            break;

          case "uint32":
            this.writeUint32(v, this.endianness);
            break;

          case "int32":
            this.writeInt32(v, this.endianness);
            break;

          case "float32":
            this.writeFloat32(v, this.endianness);
            break;

          case "float64":
            this.writeFloat64(v, this.endianness);
            break;

          case "uint16be":
            this.writeUint16(v, DataStream.BIG_ENDIAN);
            break;

          case "int16be":
            this.writeInt16(v, DataStream.BIG_ENDIAN);
            break;

          case "uint32be":
            this.writeUint32(v, DataStream.BIG_ENDIAN);
            break;

          case "int32be":
            this.writeInt32(v, DataStream.BIG_ENDIAN);
            break;

          case "float32be":
            this.writeFloat32(v, DataStream.BIG_ENDIAN);
            break;

          case "float64be":
            this.writeFloat64(v, DataStream.BIG_ENDIAN);
            break;

          case "uint16le":
            this.writeUint16(v, DataStream.LITTLE_ENDIAN);
            break;

          case "int16le":
            this.writeInt16(v, DataStream.LITTLE_ENDIAN);
            break;

          case "uint32le":
            this.writeUint32(v, DataStream.LITTLE_ENDIAN);
            break;

          case "int32le":
            this.writeInt32(v, DataStream.LITTLE_ENDIAN);
            break;

          case "float32le":
            this.writeFloat32(v, DataStream.LITTLE_ENDIAN);
            break;

          case "float64le":
            this.writeFloat64(v, DataStream.LITTLE_ENDIAN);
            break;

          case "cstring":
            this.writeCString(v, lengthOverride);
            break;

          case "string":
            this.writeString(v, charset, lengthOverride);
            break;

          case "u16string":
            this.writeUCS2String(v, this.endianness, lengthOverride);
            break;

          case "u16stringle":
            this.writeUCS2String(v, DataStream.LITTLE_ENDIAN, lengthOverride);
            break;

          case "u16stringbe":
            this.writeUCS2String(v, DataStream.BIG_ENDIAN, lengthOverride);
            break;

          default:
            if (3 == t.length) {
                for (var ta = t[1], i = 0; i < v.length; i++) this.writeType(ta, v[i]);
                break;
            }
            this.writeStruct(t, v);
        }
        null != lengthOverride && (this.position = pos, this._realloc(lengthOverride), this.position = pos + lengthOverride);
    }, DataStream.prototype.writeUint64 = function(v) {
        var h = Math.floor(v / MAX_SIZE);
        this.writeUint32(h), this.writeUint32(4294967295 & v);
    }, DataStream.prototype.writeUint24 = function(v) {
        this.writeUint8((16711680 & v) >> 16), this.writeUint8((65280 & v) >> 8), this.writeUint8(255 & v);
    }, DataStream.prototype.adjustUint32 = function(position, value) {
        var pos = this.position;
        this.seek(position), this.writeUint32(value), this.seek(pos);
    }, DataStream.prototype.mapInt32Array = function(length, e) {
        this._realloc(4 * length);
        var arr = new Int32Array(this._buffer, this.byteOffset + this.position, length);
        return DataStream.arrayToNative(arr, null == e ? this.endianness : e), this.position += 4 * length, 
        arr;
    }, DataStream.prototype.mapInt16Array = function(length, e) {
        this._realloc(2 * length);
        var arr = new Int16Array(this._buffer, this.byteOffset + this.position, length);
        return DataStream.arrayToNative(arr, null == e ? this.endianness : e), this.position += 2 * length, 
        arr;
    }, DataStream.prototype.mapInt8Array = function(length) {
        this._realloc(1 * length);
        var arr = new Int8Array(this._buffer, this.byteOffset + this.position, length);
        return this.position += 1 * length, arr;
    }, DataStream.prototype.mapUint32Array = function(length, e) {
        this._realloc(4 * length);
        var arr = new Uint32Array(this._buffer, this.byteOffset + this.position, length);
        return DataStream.arrayToNative(arr, null == e ? this.endianness : e), this.position += 4 * length, 
        arr;
    }, DataStream.prototype.mapUint16Array = function(length, e) {
        this._realloc(2 * length);
        var arr = new Uint16Array(this._buffer, this.byteOffset + this.position, length);
        return DataStream.arrayToNative(arr, null == e ? this.endianness : e), this.position += 2 * length, 
        arr;
    }, DataStream.prototype.mapFloat64Array = function(length, e) {
        this._realloc(8 * length);
        var arr = new Float64Array(this._buffer, this.byteOffset + this.position, length);
        return DataStream.arrayToNative(arr, null == e ? this.endianness : e), this.position += 8 * length, 
        arr;
    }, DataStream.prototype.mapFloat32Array = function(length, e) {
        this._realloc(4 * length);
        var arr = new Float32Array(this._buffer, this.byteOffset + this.position, length);
        return DataStream.arrayToNative(arr, null == e ? this.endianness : e), this.position += 4 * length, 
        arr;
    };
    var MultiBufferStream = function(buffer) {
        this.buffers = [], this.bufferIndex = -1, buffer && (this.insertBuffer(buffer), 
        this.bufferIndex = 0);
    };
    (MultiBufferStream.prototype = new DataStream(new ArrayBuffer, 0, DataStream.BIG_ENDIAN)).initialized = function() {
        var firstBuffer;
        return this.bufferIndex > -1 || (this.buffers.length > 0 ? 0 === (firstBuffer = this.buffers[0]).fileStart ? (this.buffer = firstBuffer, 
        this.bufferIndex = 0, Log.debug("MultiBufferStream", "Stream ready for parsing"), 
        !0) : (Log.warn("MultiBufferStream", "The first buffer should have a fileStart of 0"), 
        this.logBufferLevel(), !1) : (Log.warn("MultiBufferStream", "No buffer to start parsing from"), 
        this.logBufferLevel(), !1));
    }, ArrayBuffer.concat = function(buffer1, buffer2) {
        Log.debug("ArrayBuffer", "Trying to create a new buffer of size: " + (buffer1.byteLength + buffer2.byteLength));
        var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
        return tmp.set(new Uint8Array(buffer1), 0), tmp.set(new Uint8Array(buffer2), buffer1.byteLength), 
        tmp.buffer;
    }, MultiBufferStream.prototype.reduceBuffer = function(buffer, offset, newLength) {
        var smallB;
        return (smallB = new Uint8Array(newLength)).set(new Uint8Array(buffer, offset, newLength)), 
        smallB.buffer.fileStart = buffer.fileStart + offset, smallB.buffer.usedBytes = 0, 
        smallB.buffer;
    }, MultiBufferStream.prototype.insertBuffer = function(ab) {
        for (var to_add = !0, i = 0; i < this.buffers.length; i++) {
            var b = this.buffers[i];
            if (ab.fileStart <= b.fileStart) {
                if (ab.fileStart === b.fileStart) {
                    if (ab.byteLength > b.byteLength) {
                        this.buffers.splice(i, 1), i--;
                        continue;
                    }
                    Log.warn("MultiBufferStream", "Buffer (fileStart: " + ab.fileStart + " - Length: " + ab.byteLength + ") already appended, ignoring");
                } else ab.fileStart + ab.byteLength <= b.fileStart || (ab = this.reduceBuffer(ab, 0, b.fileStart - ab.fileStart)), 
                Log.debug("MultiBufferStream", "Appending new buffer (fileStart: " + ab.fileStart + " - Length: " + ab.byteLength + ")"), 
                this.buffers.splice(i, 0, ab), 0 === i && (this.buffer = ab);
                to_add = !1;
                break;
            }
            if (ab.fileStart < b.fileStart + b.byteLength) {
                var offset = b.fileStart + b.byteLength - ab.fileStart, newLength = ab.byteLength - offset;
                if (!(newLength > 0)) {
                    to_add = !1;
                    break;
                }
                ab = this.reduceBuffer(ab, offset, newLength);
            }
        }
        to_add && (Log.debug("MultiBufferStream", "Appending new buffer (fileStart: " + ab.fileStart + " - Length: " + ab.byteLength + ")"), 
        this.buffers.push(ab), 0 === i && (this.buffer = ab));
    }, MultiBufferStream.prototype.logBufferLevel = function(info) {
        var i, buffer, used, total, range, ranges = [], bufferedString = "";
        for (used = 0, total = 0, i = 0; i < this.buffers.length; i++) buffer = this.buffers[i], 
        0 === i ? (range = {}, ranges.push(range), range.start = buffer.fileStart, range.end = buffer.fileStart + buffer.byteLength, 
        bufferedString += "[" + range.start + "-") : range.end === buffer.fileStart ? range.end = buffer.fileStart + buffer.byteLength : ((range = {}).start = buffer.fileStart, 
        bufferedString += ranges[ranges.length - 1].end - 1 + "], [" + range.start + "-", 
        range.end = buffer.fileStart + buffer.byteLength, ranges.push(range)), used += buffer.usedBytes, 
        total += buffer.byteLength;
        ranges.length > 0 && (bufferedString += range.end - 1 + "]");
        var log = info ? Log.info : Log.debug;
        0 === this.buffers.length ? log("MultiBufferStream", "No more buffer in memory") : log("MultiBufferStream", this.buffers.length + " stored buffer(s) (" + used + "/" + total + " bytes): " + bufferedString);
    }, MultiBufferStream.prototype.cleanBuffers = function() {
        var i, buffer;
        for (i = 0; i < this.buffers.length; i++) (buffer = this.buffers[i]).usedBytes === buffer.byteLength && (Log.debug("MultiBufferStream", "Removing buffer #" + i), 
        this.buffers.splice(i, 1), i--);
    }, MultiBufferStream.prototype.mergeNextBuffer = function() {
        var next_buffer;
        if (this.bufferIndex + 1 < this.buffers.length) {
            if ((next_buffer = this.buffers[this.bufferIndex + 1]).fileStart === this.buffer.fileStart + this.buffer.byteLength) {
                var oldLength = this.buffer.byteLength, oldUsedBytes = this.buffer.usedBytes, oldFileStart = this.buffer.fileStart;
                return this.buffers[this.bufferIndex] = ArrayBuffer.concat(this.buffer, next_buffer), 
                this.buffer = this.buffers[this.bufferIndex], this.buffers.splice(this.bufferIndex + 1, 1), 
                this.buffer.usedBytes = oldUsedBytes, this.buffer.fileStart = oldFileStart, Log.debug("ISOFile", "Concatenating buffer for box parsing (length: " + oldLength + "->" + this.buffer.byteLength + ")"), 
                !0;
            }
            return !1;
        }
        return !1;
    }, MultiBufferStream.prototype.findPosition = function(fromStart, filePosition, markAsUsed) {
        var i, abuffer = null, index = -1;
        for (i = !0 === fromStart ? 0 : this.bufferIndex; i < this.buffers.length && (abuffer = this.buffers[i]).fileStart <= filePosition; ) index = i, 
        markAsUsed && (abuffer.fileStart + abuffer.byteLength <= filePosition ? abuffer.usedBytes = abuffer.byteLength : abuffer.usedBytes = filePosition - abuffer.fileStart, 
        this.logBufferLevel()), i++;
        return -1 !== index && (abuffer = this.buffers[index]).fileStart + abuffer.byteLength >= filePosition ? (Log.debug("MultiBufferStream", "Found position in existing buffer #" + index), 
        index) : -1;
    }, MultiBufferStream.prototype.findEndContiguousBuf = function(inputindex) {
        var i, currentBuf, nextBuf, index = void 0 !== inputindex ? inputindex : this.bufferIndex;
        if (currentBuf = this.buffers[index], this.buffers.length > index + 1) for (i = index + 1; i < this.buffers.length && (nextBuf = this.buffers[i]).fileStart === currentBuf.fileStart + currentBuf.byteLength; i++) currentBuf = nextBuf;
        return currentBuf.fileStart + currentBuf.byteLength;
    }, MultiBufferStream.prototype.getEndFilePositionAfter = function(pos) {
        var index = this.findPosition(!0, pos, !1);
        return -1 !== index ? this.findEndContiguousBuf(index) : pos;
    }, MultiBufferStream.prototype.addUsedBytes = function(nbBytes) {
        this.buffer.usedBytes += nbBytes, this.logBufferLevel();
    }, MultiBufferStream.prototype.setAllUsedBytes = function() {
        this.buffer.usedBytes = this.buffer.byteLength, this.logBufferLevel();
    }, MultiBufferStream.prototype.seek = function(filePosition, fromStart, markAsUsed) {
        var index;
        return -1 !== (index = this.findPosition(fromStart, filePosition, markAsUsed)) ? (this.buffer = this.buffers[index], 
        this.bufferIndex = index, this.position = filePosition - this.buffer.fileStart, 
        Log.debug("MultiBufferStream", "Repositioning parser at buffer position: " + this.position), 
        !0) : (Log.debug("MultiBufferStream", "Position " + filePosition + " not found in buffered data"), 
        !1);
    }, MultiBufferStream.prototype.getPosition = function() {
        if (-1 === this.bufferIndex || null === this.buffers[this.bufferIndex]) throw "Error accessing position in the MultiBufferStream";
        return this.buffers[this.bufferIndex].fileStart + this.position;
    }, MultiBufferStream.prototype.getLength = function() {
        return this.byteLength;
    }, MultiBufferStream.prototype.getEndPosition = function() {
        if (-1 === this.bufferIndex || null === this.buffers[this.bufferIndex]) throw "Error accessing position in the MultiBufferStream";
        return this.buffers[this.bufferIndex].fileStart + this.byteLength;
    }, exports.MultiBufferStream = MultiBufferStream;
    var MPEG4DescriptorParser = function() {
        var descTagToName = [];
        descTagToName[3] = "ES_Descriptor", descTagToName[4] = "DecoderConfigDescriptor", 
        descTagToName[5] = "DecoderSpecificInfo", descTagToName[6] = "SLConfigDescriptor", 
        this.getDescriptorName = function(tag) {
            return descTagToName[tag];
        };
        var that = this, classes = {};
        return this.parseOneDescriptor = function(stream) {
            var tag, desc, byteRead, size = 0;
            for (tag = stream.readUint8(), byteRead = stream.readUint8(); 128 & byteRead; ) size = (127 & byteRead) << 7, 
            byteRead = stream.readUint8();
            return size += 127 & byteRead, Log.debug("MPEG4DescriptorParser", "Found " + (descTagToName[tag] || "Descriptor " + tag) + ", size " + size + " at position " + stream.getPosition()), 
            (desc = descTagToName[tag] ? new classes[descTagToName[tag]](size) : new classes.Descriptor(size)).parse(stream), 
            desc;
        }, classes.Descriptor = function(_tag, _size) {
            this.tag = _tag, this.size = _size, this.descs = [];
        }, classes.Descriptor.prototype.parse = function(stream) {
            this.data = stream.readUint8Array(this.size);
        }, classes.Descriptor.prototype.findDescriptor = function(tag) {
            for (var i = 0; i < this.descs.length; i++) if (this.descs[i].tag == tag) return this.descs[i];
            return null;
        }, classes.Descriptor.prototype.parseRemainingDescriptors = function(stream) {
            for (var start = stream.position; stream.position < start + this.size; ) {
                var desc = that.parseOneDescriptor(stream);
                this.descs.push(desc);
            }
        }, classes.ES_Descriptor = function(size) {
            classes.Descriptor.call(this, 3, size);
        }, classes.ES_Descriptor.prototype = new classes.Descriptor, classes.ES_Descriptor.prototype.parse = function(stream) {
            if (this.ES_ID = stream.readUint16(), this.flags = stream.readUint8(), this.size -= 3, 
            128 & this.flags ? (this.dependsOn_ES_ID = stream.readUint16(), this.size -= 2) : this.dependsOn_ES_ID = 0, 
            64 & this.flags) {
                var l = stream.readUint8();
                this.URL = stream.readString(l), this.size -= l + 1;
            } else this.URL = "";
            32 & this.flags ? (this.OCR_ES_ID = stream.readUint16(), this.size -= 2) : this.OCR_ES_ID = 0, 
            this.parseRemainingDescriptors(stream);
        }, classes.ES_Descriptor.prototype.getOTI = function(stream) {
            var dcd = this.findDescriptor(4);
            return dcd ? dcd.oti : 0;
        }, classes.ES_Descriptor.prototype.getAudioConfig = function(stream) {
            var dcd = this.findDescriptor(4);
            if (!dcd) return null;
            var dsi = dcd.findDescriptor(5);
            if (dsi && dsi.data) {
                var audioObjectType = (248 & dsi.data[0]) >> 3;
                return 31 === audioObjectType && dsi.data.length >= 2 && (audioObjectType = 32 + ((7 & dsi.data[0]) << 3) + ((224 & dsi.data[1]) >> 5)), 
                audioObjectType;
            }
            return null;
        }, classes.DecoderConfigDescriptor = function(size) {
            classes.Descriptor.call(this, 4, size);
        }, classes.DecoderConfigDescriptor.prototype = new classes.Descriptor, classes.DecoderConfigDescriptor.prototype.parse = function(stream) {
            this.oti = stream.readUint8(), this.streamType = stream.readUint8(), this.bufferSize = stream.readUint24(), 
            this.maxBitrate = stream.readUint32(), this.avgBitrate = stream.readUint32(), this.size -= 13, 
            this.parseRemainingDescriptors(stream);
        }, classes.DecoderSpecificInfo = function(size) {
            classes.Descriptor.call(this, 5, size);
        }, classes.DecoderSpecificInfo.prototype = new classes.Descriptor, classes.SLConfigDescriptor = function(size) {
            classes.Descriptor.call(this, 6, size);
        }, classes.SLConfigDescriptor.prototype = new classes.Descriptor, this;
    };
    exports.MPEG4DescriptorParser = MPEG4DescriptorParser;
    var BoxParser = {
        ERR_INVALID_DATA: -1,
        ERR_NOT_ENOUGH_DATA: 0,
        OK: 1,
        BASIC_BOXES: [ "mdat", "idat", "free", "skip", "meco", "strk" ],
        FULL_BOXES: [ "hmhd", "nmhd", "iods", "xml ", "bxml", "ipro", "mere" ],
        CONTAINER_BOXES: [ [ "moov", [ "trak", "pssh" ] ], [ "trak" ], [ "edts" ], [ "mdia" ], [ "minf" ], [ "dinf" ], [ "stbl", [ "sgpd", "sbgp" ] ], [ "mvex", [ "trex" ] ], [ "moof", [ "traf" ] ], [ "traf", [ "trun", "sgpd", "sbgp" ] ], [ "vttc" ], [ "tref" ], [ "iref" ], [ "mfra", [ "tfra" ] ], [ "meco" ], [ "hnti" ], [ "hinf" ], [ "strk" ], [ "strd" ], [ "sinf" ], [ "rinf" ], [ "schi" ], [ "trgr" ], [ "udta", [ "kind" ] ], [ "iprp", [ "ipma" ] ], [ "ipco" ] ],
        boxCodes: [],
        fullBoxCodes: [],
        containerBoxCodes: [],
        sampleEntryCodes: {},
        sampleGroupEntryCodes: [],
        trackGroupTypes: [],
        UUIDBoxes: {},
        UUIDs: [],
        initialize: function() {
            BoxParser.FullBox.prototype = new BoxParser.Box, BoxParser.ContainerBox.prototype = new BoxParser.Box, 
            BoxParser.SampleEntry.prototype = new BoxParser.Box, BoxParser.TrackGroupTypeBox.prototype = new BoxParser.FullBox, 
            BoxParser.BASIC_BOXES.forEach((function(type) {
                BoxParser.createBoxCtor(type);
            })), BoxParser.FULL_BOXES.forEach((function(type) {
                BoxParser.createFullBoxCtor(type);
            })), BoxParser.CONTAINER_BOXES.forEach((function(types) {
                BoxParser.createContainerBoxCtor(types[0], null, types[1]);
            }));
        },
        Box: function(_type, _size, _uuid) {
            this.type = _type, this.size = _size, this.uuid = _uuid;
        },
        FullBox: function(type, size, uuid) {
            BoxParser.Box.call(this, type, size, uuid), this.flags = 0, this.version = 0;
        },
        ContainerBox: function(type, size, uuid) {
            BoxParser.Box.call(this, type, size, uuid), this.boxes = [];
        },
        SampleEntry: function(type, size, hdr_size, start) {
            BoxParser.ContainerBox.call(this, type, size), this.hdr_size = hdr_size, this.start = start;
        },
        SampleGroupEntry: function(type) {
            this.grouping_type = type;
        },
        TrackGroupTypeBox: function(type, size) {
            BoxParser.FullBox.call(this, type, size);
        },
        createBoxCtor: function(type, parseMethod) {
            BoxParser.boxCodes.push(type), BoxParser[type + "Box"] = function(size) {
                BoxParser.Box.call(this, type, size);
            }, BoxParser[type + "Box"].prototype = new BoxParser.Box, parseMethod && (BoxParser[type + "Box"].prototype.parse = parseMethod);
        },
        createFullBoxCtor: function(type, parseMethod) {
            BoxParser[type + "Box"] = function(size) {
                BoxParser.FullBox.call(this, type, size);
            }, BoxParser[type + "Box"].prototype = new BoxParser.FullBox, BoxParser[type + "Box"].prototype.parse = function(stream) {
                this.parseFullHeader(stream), parseMethod && parseMethod.call(this, stream);
            };
        },
        addSubBoxArrays: function(subBoxNames) {
            if (subBoxNames) {
                this.subBoxNames = subBoxNames;
                for (var nbSubBoxes = subBoxNames.length, k = 0; k < nbSubBoxes; k++) this[subBoxNames[k] + "s"] = [];
            }
        },
        createContainerBoxCtor: function(type, parseMethod, subBoxNames) {
            BoxParser[type + "Box"] = function(size) {
                BoxParser.ContainerBox.call(this, type, size), BoxParser.addSubBoxArrays.call(this, subBoxNames);
            }, BoxParser[type + "Box"].prototype = new BoxParser.ContainerBox, parseMethod && (BoxParser[type + "Box"].prototype.parse = parseMethod);
        },
        createMediaSampleEntryCtor: function(mediaType, parseMethod, subBoxNames) {
            BoxParser.sampleEntryCodes[mediaType] = [], BoxParser[mediaType + "SampleEntry"] = function(type, size) {
                BoxParser.SampleEntry.call(this, type, size), BoxParser.addSubBoxArrays.call(this, subBoxNames);
            }, BoxParser[mediaType + "SampleEntry"].prototype = new BoxParser.SampleEntry, parseMethod && (BoxParser[mediaType + "SampleEntry"].prototype.parse = parseMethod);
        },
        createSampleEntryCtor: function(mediaType, type, parseMethod, subBoxNames) {
            BoxParser.sampleEntryCodes[mediaType].push(type), BoxParser[type + "SampleEntry"] = function(size) {
                BoxParser[mediaType + "SampleEntry"].call(this, type, size), BoxParser.addSubBoxArrays.call(this, subBoxNames);
            }, BoxParser[type + "SampleEntry"].prototype = new BoxParser[mediaType + "SampleEntry"], 
            parseMethod && (BoxParser[type + "SampleEntry"].prototype.parse = parseMethod);
        },
        createEncryptedSampleEntryCtor: function(mediaType, type, parseMethod) {
            BoxParser.createSampleEntryCtor.call(this, mediaType, type, parseMethod, [ "sinf" ]);
        },
        createSampleGroupCtor: function(type, parseMethod) {
            BoxParser[type + "SampleGroupEntry"] = function(size) {
                BoxParser.SampleGroupEntry.call(this, type, size);
            }, BoxParser[type + "SampleGroupEntry"].prototype = new BoxParser.SampleGroupEntry, 
            parseMethod && (BoxParser[type + "SampleGroupEntry"].prototype.parse = parseMethod);
        },
        createTrackGroupCtor: function(type, parseMethod) {
            BoxParser[type + "TrackGroupTypeBox"] = function(size) {
                BoxParser.TrackGroupTypeBox.call(this, type, size);
            }, BoxParser[type + "TrackGroupTypeBox"].prototype = new BoxParser.TrackGroupTypeBox, 
            parseMethod && (BoxParser[type + "TrackGroupTypeBox"].prototype.parse = parseMethod);
        },
        createUUIDBox: function(uuid, isFullBox, isContainerBox, parseMethod) {
            BoxParser.UUIDs.push(uuid), BoxParser.UUIDBoxes[uuid] = function(size) {
                isFullBox ? BoxParser.FullBox.call(this, "uuid", size, uuid) : isContainerBox ? BoxParser.ContainerBox.call(this, "uuid", size, uuid) : BoxParser.Box.call(this, "uuid", size, uuid);
            }, BoxParser.UUIDBoxes[uuid].prototype = isFullBox ? new BoxParser.FullBox : isContainerBox ? new BoxParser.ContainerBox : new BoxParser.Box, 
            parseMethod && (BoxParser.UUIDBoxes[uuid].prototype.parse = isFullBox ? function(stream) {
                this.parseFullHeader(stream), parseMethod && parseMethod.call(this, stream);
            } : parseMethod);
        }
    };
    BoxParser.initialize(), BoxParser.TKHD_FLAG_ENABLED = 1, BoxParser.TKHD_FLAG_IN_MOVIE = 2, 
    BoxParser.TKHD_FLAG_IN_PREVIEW = 4, BoxParser.TFHD_FLAG_BASE_DATA_OFFSET = 1, BoxParser.TFHD_FLAG_SAMPLE_DESC = 2, 
    BoxParser.TFHD_FLAG_SAMPLE_DUR = 8, BoxParser.TFHD_FLAG_SAMPLE_SIZE = 16, BoxParser.TFHD_FLAG_SAMPLE_FLAGS = 32, 
    BoxParser.TFHD_FLAG_DUR_EMPTY = 65536, BoxParser.TFHD_FLAG_DEFAULT_BASE_IS_MOOF = 131072, 
    BoxParser.TRUN_FLAGS_DATA_OFFSET = 1, BoxParser.TRUN_FLAGS_FIRST_FLAG = 4, BoxParser.TRUN_FLAGS_DURATION = 256, 
    BoxParser.TRUN_FLAGS_SIZE = 512, BoxParser.TRUN_FLAGS_FLAGS = 1024, BoxParser.TRUN_FLAGS_CTS_OFFSET = 2048, 
    BoxParser.Box.prototype.add = function(name) {
        return this.addBox(new BoxParser[name + "Box"]);
    }, BoxParser.Box.prototype.addBox = function(box) {
        return this.boxes.push(box), this[box.type + "s"] ? this[box.type + "s"].push(box) : this[box.type] = box, 
        box;
    }, BoxParser.Box.prototype.set = function(prop, value) {
        return this[prop] = value, this;
    }, BoxParser.Box.prototype.addEntry = function(value, _prop) {
        var prop = _prop || "entries";
        return this[prop] || (this[prop] = []), this[prop].push(value), this;
    }, exports.BoxParser = BoxParser, BoxParser.parseUUID = function(stream) {
        return BoxParser.parseHex16(stream);
    }, BoxParser.parseHex16 = function(stream) {
        for (var hex16 = "", i = 0; i < 16; i++) {
            var hex = stream.readUint8().toString(16);
            hex16 += 1 === hex.length ? "0" + hex : hex;
        }
        return hex16;
    }, BoxParser.parseOneBox = function(stream, headerOnly, parentSize) {
        var box, diff, uuid, start = stream.getPosition(), hdr_size = 0;
        if (stream.getEndPosition() - start < 8) return Log.debug("BoxParser", "Not enough data in stream to parse the type and size of the box"), 
        {
            code: BoxParser.ERR_NOT_ENOUGH_DATA
        };
        if (parentSize && parentSize < 8) return Log.debug("BoxParser", "Not enough bytes left in the parent box to parse a new box"), 
        {
            code: BoxParser.ERR_NOT_ENOUGH_DATA
        };
        var size = stream.readUint32(), type = stream.readString(4), box_type = type;
        if (Log.debug("BoxParser", "Found box of type '" + type + "' and size " + size + " at position " + start), 
        hdr_size = 8, "uuid" == type) {
            if (stream.getEndPosition() - stream.getPosition() < 16 || parentSize - hdr_size < 16) return stream.seek(start), 
            Log.debug("BoxParser", "Not enough bytes left in the parent box to parse a UUID box"), 
            {
                code: BoxParser.ERR_NOT_ENOUGH_DATA
            };
            hdr_size += 16, box_type = uuid = BoxParser.parseUUID(stream);
        }
        if (1 == size) {
            if (stream.getEndPosition() - stream.getPosition() < 8 || parentSize && parentSize - hdr_size < 8) return stream.seek(start), 
            Log.warn("BoxParser", 'Not enough data in stream to parse the extended size of the "' + type + '" box'), 
            {
                code: BoxParser.ERR_NOT_ENOUGH_DATA
            };
            size = stream.readUint64(), hdr_size += 8;
        } else if (0 === size) if (parentSize) size = parentSize; else if ("mdat" !== type) return Log.error("BoxParser", "Unlimited box size not supported for type: '" + type + "'"), 
        box = new BoxParser.Box(type, size), {
            code: BoxParser.OK,
            box: box,
            size: box.size
        };
        return size < hdr_size ? (Log.error("BoxParser", "Box of type " + type + " has an invalid size " + size + " (too small to be a box)"), 
        {
            code: BoxParser.ERR_NOT_ENOUGH_DATA,
            type: type,
            size: size,
            hdr_size: hdr_size,
            start: start
        }) : parentSize && size > parentSize ? (Log.error("BoxParser", "Box of type '" + type + "' has a size " + size + " greater than its container size " + parentSize), 
        {
            code: BoxParser.ERR_NOT_ENOUGH_DATA,
            type: type,
            size: size,
            hdr_size: hdr_size,
            start: start
        }) : start + size > stream.getEndPosition() ? (stream.seek(start), Log.info("BoxParser", "Not enough data in stream to parse the entire '" + type + "' box"), 
        {
            code: BoxParser.ERR_NOT_ENOUGH_DATA,
            type: type,
            size: size,
            hdr_size: hdr_size,
            start: start
        }) : headerOnly ? {
            code: BoxParser.OK,
            type: type,
            size: size,
            hdr_size: hdr_size,
            start: start
        } : (BoxParser[type + "Box"] ? box = new BoxParser[type + "Box"](size) : "uuid" !== type ? (Log.warn("BoxParser", "Unknown box type: '" + type + "'"), 
        (box = new BoxParser.Box(type, size)).has_unparsed_data = !0) : BoxParser.UUIDBoxes[uuid] ? box = new BoxParser.UUIDBoxes[uuid](size) : (Log.warn("BoxParser", "Unknown uuid type: '" + uuid + "'"), 
        (box = new BoxParser.Box(type, size)).uuid = uuid, box.has_unparsed_data = !0), 
        box.hdr_size = hdr_size, box.start = start, box.write === BoxParser.Box.prototype.write && "mdat" !== box.type && (Log.info("BoxParser", "'" + box_type + "' box writing not yet implemented, keeping unparsed data in memory for later write"), 
        box.parseDataAndRewind(stream)), box.parse(stream), (diff = stream.getPosition() - (box.start + box.size)) < 0 ? (Log.warn("BoxParser", "Parsing of box '" + box_type + "' did not read the entire indicated box data size (missing " + -diff + " bytes), seeking forward"), 
        stream.seek(box.start + box.size)) : diff > 0 && (Log.error("BoxParser", "Parsing of box '" + box_type + "' read " + diff + " more bytes than the indicated box data size, seeking backwards"), 
        stream.seek(box.start + box.size)), {
            code: BoxParser.OK,
            box: box,
            size: box.size
        });
    }, BoxParser.Box.prototype.parse = function(stream) {
        "mdat" != this.type ? this.data = stream.readUint8Array(this.size - this.hdr_size) : 0 === this.size ? stream.seek(stream.getEndPosition()) : stream.seek(this.start + this.size);
    }, BoxParser.Box.prototype.parseDataAndRewind = function(stream) {
        this.data = stream.readUint8Array(this.size - this.hdr_size), stream.position -= this.size - this.hdr_size;
    }, BoxParser.FullBox.prototype.parseDataAndRewind = function(stream) {
        this.parseFullHeader(stream), this.data = stream.readUint8Array(this.size - this.hdr_size), 
        this.hdr_size -= 4, stream.position -= this.size - this.hdr_size;
    }, BoxParser.FullBox.prototype.parseFullHeader = function(stream) {
        this.version = stream.readUint8(), this.flags = stream.readUint24(), this.hdr_size += 4;
    }, BoxParser.FullBox.prototype.parse = function(stream) {
        this.parseFullHeader(stream), this.data = stream.readUint8Array(this.size - this.hdr_size);
    }, BoxParser.ContainerBox.prototype.parse = function(stream) {
        for (var ret, box; stream.getPosition() < this.start + this.size; ) {
            if ((ret = BoxParser.parseOneBox(stream, !1, this.size - (stream.getPosition() - this.start))).code !== BoxParser.OK) return;
            if (box = ret.box, this.boxes.push(box), this.subBoxNames && -1 != this.subBoxNames.indexOf(box.type)) this[this.subBoxNames[this.subBoxNames.indexOf(box.type)] + "s"].push(box); else {
                var box_type = "uuid" !== box.type ? box.type : box.uuid;
                this[box_type] ? Log.warn("Box of type " + box_type + " already stored in field of this type") : this[box_type] = box;
            }
        }
    }, BoxParser.Box.prototype.parseLanguage = function(stream) {
        this.language = stream.readUint16();
        var chars = [];
        chars[0] = this.language >> 10 & 31, chars[1] = this.language >> 5 & 31, chars[2] = 31 & this.language, 
        this.languageString = String.fromCharCode(chars[0] + 96, chars[1] + 96, chars[2] + 96);
    }, BoxParser.SAMPLE_ENTRY_TYPE_VISUAL = "Visual", BoxParser.SAMPLE_ENTRY_TYPE_AUDIO = "Audio", 
    BoxParser.SAMPLE_ENTRY_TYPE_HINT = "Hint", BoxParser.SAMPLE_ENTRY_TYPE_METADATA = "Metadata", 
    BoxParser.SAMPLE_ENTRY_TYPE_SUBTITLE = "Subtitle", BoxParser.SAMPLE_ENTRY_TYPE_SYSTEM = "System", 
    BoxParser.SAMPLE_ENTRY_TYPE_TEXT = "Text", BoxParser.SampleEntry.prototype.parseHeader = function(stream) {
        stream.readUint8Array(6), this.data_reference_index = stream.readUint16(), this.hdr_size += 8;
    }, BoxParser.SampleEntry.prototype.parse = function(stream) {
        this.parseHeader(stream), this.data = stream.readUint8Array(this.size - this.hdr_size);
    }, BoxParser.SampleEntry.prototype.parseDataAndRewind = function(stream) {
        this.parseHeader(stream), this.data = stream.readUint8Array(this.size - this.hdr_size), 
        this.hdr_size -= 8, stream.position -= this.size - this.hdr_size;
    }, BoxParser.SampleEntry.prototype.parseFooter = function(stream) {
        BoxParser.ContainerBox.prototype.parse.call(this, stream);
    }, BoxParser.createMediaSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_HINT), BoxParser.createMediaSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_METADATA), 
    BoxParser.createMediaSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_SUBTITLE), BoxParser.createMediaSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_SYSTEM), 
    BoxParser.createMediaSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_TEXT), BoxParser.createMediaSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_VISUAL, (function(stream) {
        this.parseHeader(stream), stream.readUint16(), stream.readUint16(), stream.readUint32Array(3), 
        this.width = stream.readUint16(), this.height = stream.readUint16(), this.horizresolution = stream.readUint32(), 
        this.vertresolution = stream.readUint32(), stream.readUint32(), this.frame_count = stream.readUint16(), 
        compressorname_length = Math.min(31, stream.readUint8()), this.compressorname = stream.readString(compressorname_length), 
        compressorname_length < 31 && stream.readString(31 - compressorname_length), this.depth = stream.readUint16(), 
        stream.readUint16(), this.parseFooter(stream);
    })), BoxParser.createMediaSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_AUDIO, (function(stream) {
        this.parseHeader(stream), stream.readUint32Array(2), this.channel_count = stream.readUint16(), 
        this.samplesize = stream.readUint16(), stream.readUint16(), stream.readUint16(), 
        this.samplerate = stream.readUint32() / 65536, this.parseFooter(stream);
    })), BoxParser.createSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_VISUAL, "avc1"), 
    BoxParser.createSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_VISUAL, "avc2"), BoxParser.createSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_VISUAL, "avc3"), 
    BoxParser.createSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_VISUAL, "avc4"), BoxParser.createSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_VISUAL, "av01"), 
    BoxParser.createSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_VISUAL, "hvc1"), BoxParser.createSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_VISUAL, "hev1"), 
    BoxParser.createSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_AUDIO, "mp4a"), BoxParser.createSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_AUDIO, "ac-3"), 
    BoxParser.createSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_AUDIO, "ec-3"), BoxParser.createEncryptedSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_VISUAL, "encv"), 
    BoxParser.createEncryptedSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_AUDIO, "enca"), 
    BoxParser.createEncryptedSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_SUBTITLE, "encu"), 
    BoxParser.createEncryptedSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_SYSTEM, "encs"), 
    BoxParser.createEncryptedSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_TEXT, "enct"), 
    BoxParser.createEncryptedSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_METADATA, "encm"), 
    BoxParser.createBoxCtor("av1C", (function(stream) {
        var tmp = stream.readUint8();
        if (tmp >> 7 & !1) Log.error("av1C marker problem"); else if (this.version = 127 & tmp, 
        1 === this.version) if (tmp = stream.readUint8(), this.seq_profile = tmp >> 5 & 7, 
        this.seq_level_idx_0 = 31 & tmp, tmp = stream.readUint8(), this.seq_tier_0 = tmp >> 7 & 1, 
        this.high_bitdepth = tmp >> 6 & 1, this.twelve_bit = tmp >> 5 & 1, this.monochrome = tmp >> 4 & 1, 
        this.chroma_subsampling_x = tmp >> 3 & 1, this.chroma_subsampling_y = tmp >> 2 & 1, 
        this.chroma_sample_position = 3 & tmp, tmp = stream.readUint8(), this.reserved_1 = tmp >> 5 & 7, 
        0 === this.reserved_1) {
            if (this.initial_presentation_delay_present = tmp >> 4 & 1, 1 === this.initial_presentation_delay_present) this.initial_presentation_delay_minus_one = 15 & tmp; else if (this.reserved_2 = 15 & tmp, 
            0 !== this.reserved_2) return void Log.error("av1C reserved_2 parsing problem");
            var configOBUs_length = this.size - this.hdr_size - 4;
            this.configOBUs = stream.readUint8Array(configOBUs_length);
        } else Log.error("av1C reserved_1 parsing problem"); else Log.error("av1C version " + this.version + " not supported");
    })), BoxParser.createBoxCtor("avcC", (function(stream) {
        var i, toparse;
        for (this.configurationVersion = stream.readUint8(), this.AVCProfileIndication = stream.readUint8(), 
        this.profile_compatibility = stream.readUint8(), this.AVCLevelIndication = stream.readUint8(), 
        this.lengthSizeMinusOne = 3 & stream.readUint8(), this.nb_SPS_nalus = 31 & stream.readUint8(), 
        toparse = this.size - this.hdr_size - 6, this.SPS = [], i = 0; i < this.nb_SPS_nalus; i++) this.SPS[i] = {}, 
        this.SPS[i].length = stream.readUint16(), this.SPS[i].nalu = stream.readUint8Array(this.SPS[i].length), 
        toparse -= 2 + this.SPS[i].length;
        for (this.nb_PPS_nalus = stream.readUint8(), toparse--, this.PPS = [], i = 0; i < this.nb_PPS_nalus; i++) this.PPS[i] = {}, 
        this.PPS[i].length = stream.readUint16(), this.PPS[i].nalu = stream.readUint8Array(this.PPS[i].length), 
        toparse -= 2 + this.PPS[i].length;
        toparse > 0 && (this.ext = stream.readUint8Array(toparse));
    })), BoxParser.createBoxCtor("btrt", (function(stream) {
        this.bufferSizeDB = stream.readUint32(), this.maxBitrate = stream.readUint32(), 
        this.avgBitrate = stream.readUint32();
    })), BoxParser.createBoxCtor("clap", (function(stream) {
        this.cleanApertureWidthN = stream.readUint32(), this.cleanApertureWidthD = stream.readUint32(), 
        this.cleanApertureHeightN = stream.readUint32(), this.cleanApertureHeightD = stream.readUint32(), 
        this.horizOffN = stream.readUint32(), this.horizOffD = stream.readUint32(), this.vertOffN = stream.readUint32(), 
        this.vertOffD = stream.readUint32();
    })), BoxParser.createBoxCtor("clli", (function(stream) {
        this.max_content_light_level = stream.readUint16(), this.max_pic_average_light_level = stream.readUint16();
    })), BoxParser.createFullBoxCtor("co64", (function(stream) {
        var entry_count, i;
        if (entry_count = stream.readUint32(), this.chunk_offsets = [], 0 === this.version) for (i = 0; i < entry_count; i++) this.chunk_offsets.push(stream.readUint64());
    })), BoxParser.createFullBoxCtor("CoLL", (function(stream) {
        this.maxCLL = stream.readUint16(), this.maxFALL = stream.readUint16();
    })), BoxParser.createBoxCtor("colr", (function(stream) {
        if (this.colour_type = stream.readString(4), "nclx" === this.colour_type) {
            this.colour_primaries = stream.readUint16(), this.transfer_characteristics = stream.readUint16(), 
            this.matrix_coefficients = stream.readUint16();
            var tmp = stream.readUint8();
            this.full_range_flag = tmp >> 7;
        } else ("rICC" === this.colour_type || "prof" === this.colour_type) && (this.ICC_profile = stream.readUint8Array(this.size - 4));
    })), BoxParser.createFullBoxCtor("cprt", (function(stream) {
        this.parseLanguage(stream), this.notice = stream.readCString();
    })), BoxParser.createFullBoxCtor("cslg", (function(stream) {
        0 === this.version && (this.compositionToDTSShift = stream.readInt32(), this.leastDecodeToDisplayDelta = stream.readInt32(), 
        this.greatestDecodeToDisplayDelta = stream.readInt32(), this.compositionStartTime = stream.readInt32(), 
        this.compositionEndTime = stream.readInt32());
    })), BoxParser.createFullBoxCtor("ctts", (function(stream) {
        var entry_count, i;
        if (entry_count = stream.readUint32(), this.sample_counts = [], this.sample_offsets = [], 
        0 === this.version) for (i = 0; i < entry_count; i++) {
            this.sample_counts.push(stream.readUint32());
            var value = stream.readInt32();
            value < 0 && Log.warn("BoxParser", "ctts box uses negative values without using version 1"), 
            this.sample_offsets.push(value);
        } else if (1 == this.version) for (i = 0; i < entry_count; i++) this.sample_counts.push(stream.readUint32()), 
        this.sample_offsets.push(stream.readInt32());
    })), BoxParser.createBoxCtor("dac3", (function(stream) {
        var tmp_byte1 = stream.readUint8(), tmp_byte2 = stream.readUint8(), tmp_byte3 = stream.readUint8();
        this.fscod = tmp_byte1 >> 6, this.bsid = tmp_byte1 >> 1 & 31, this.bsmod = (1 & tmp_byte1) << 2 | tmp_byte2 >> 6 & 3, 
        this.acmod = tmp_byte2 >> 3 & 7, this.lfeon = tmp_byte2 >> 2 & 1, this.bit_rate_code = 3 & tmp_byte2 | tmp_byte3 >> 5 & 7;
    })), BoxParser.createBoxCtor("dec3", (function(stream) {
        var tmp_16 = stream.readUint16();
        this.data_rate = tmp_16 >> 3, this.num_ind_sub = 7 & tmp_16, this.ind_subs = [];
        for (var i = 0; i < this.num_ind_sub + 1; i++) {
            var ind_sub = {};
            this.ind_subs.push(ind_sub);
            var tmp_byte1 = stream.readUint8(), tmp_byte2 = stream.readUint8(), tmp_byte3 = stream.readUint8();
            ind_sub.fscod = tmp_byte1 >> 6, ind_sub.bsid = tmp_byte1 >> 1 & 31, ind_sub.bsmod = (1 & tmp_byte1) << 4 | tmp_byte2 >> 4 & 15, 
            ind_sub.acmod = tmp_byte2 >> 1 & 7, ind_sub.lfeon = 1 & tmp_byte2, ind_sub.num_dep_sub = tmp_byte3 >> 1 & 15, 
            ind_sub.num_dep_sub > 0 && (ind_sub.chan_loc = (1 & tmp_byte3) << 8 | stream.readUint8());
        }
    })), BoxParser.createFullBoxCtor("dfLa", (function(stream) {
        var boxesFound = [], knownBlockTypes = [ "STREAMINFO", "PADDING", "APPLICATION", "SEEKTABLE", "VORBIS_COMMENT", "CUESHEET", "PICTURE", "RESERVED" ];
        for (this.parseFullHeader(stream); ;) {
            var flagAndType = stream.readUint8(), type = Math.min(127 & flagAndType, knownBlockTypes.length - 1);
            if (type ? stream.readUint8Array(stream.readUint24()) : (stream.readUint8Array(13), 
            this.samplerate = stream.readUint32() >> 12, stream.readUint8Array(20)), boxesFound.push(knownBlockTypes[type]), 
            128 & flagAndType) break;
        }
        this.numMetadataBlocks = boxesFound.length + " (" + boxesFound.join(", ") + ")";
    })), BoxParser.createBoxCtor("dimm", (function(stream) {
        this.bytessent = stream.readUint64();
    })), BoxParser.createBoxCtor("dmax", (function(stream) {
        this.time = stream.readUint32();
    })), BoxParser.createBoxCtor("dmed", (function(stream) {
        this.bytessent = stream.readUint64();
    })), BoxParser.createFullBoxCtor("dref", (function(stream) {
        var ret, box;
        this.entries = [];
        for (var entry_count = stream.readUint32(), i = 0; i < entry_count; i++) {
            if ((ret = BoxParser.parseOneBox(stream, !1, this.size - (stream.getPosition() - this.start))).code !== BoxParser.OK) return;
            box = ret.box, this.entries.push(box);
        }
    })), BoxParser.createBoxCtor("drep", (function(stream) {
        this.bytessent = stream.readUint64();
    })), BoxParser.createFullBoxCtor("elng", (function(stream) {
        this.extended_language = stream.readString(this.size - this.hdr_size);
    })), BoxParser.createFullBoxCtor("elst", (function(stream) {
        this.entries = [];
        for (var entry_count = stream.readUint32(), i = 0; i < entry_count; i++) {
            var entry = {};
            this.entries.push(entry), 1 === this.version ? (entry.segment_duration = stream.readUint64(), 
            entry.media_time = stream.readInt64()) : (entry.segment_duration = stream.readUint32(), 
            entry.media_time = stream.readInt32()), entry.media_rate_integer = stream.readInt16(), 
            entry.media_rate_fraction = stream.readInt16();
        }
    })), BoxParser.createFullBoxCtor("emsg", (function(stream) {
        this.scheme_id_uri = stream.readCString(), this.value = stream.readCString(), this.timescale = stream.readUint32(), 
        this.presentation_time_delta = stream.readUint32(), this.event_duration = stream.readUint32(), 
        this.id = stream.readUint32();
        var message_size = this.size - this.hdr_size - (16 + (this.scheme_id_uri.length + 1) + (this.value.length + 1));
        this.message_data = stream.readUint8Array(message_size);
    })), BoxParser.createFullBoxCtor("esds", (function(stream) {
        var esd_data = stream.readUint8Array(this.size - this.hdr_size), esd_parser = new MPEG4DescriptorParser;
        this.esd = esd_parser.parseOneDescriptor(new DataStream(esd_data.buffer, 0, DataStream.BIG_ENDIAN));
    })), BoxParser.createBoxCtor("fiel", (function(stream) {
        this.fieldCount = stream.readUint8(), this.fieldOrdering = stream.readUint8();
    })), BoxParser.createBoxCtor("frma", (function(stream) {
        this.data_format = stream.readString(4);
    })), BoxParser.createBoxCtor("ftyp", (function(stream) {
        var toparse = this.size - this.hdr_size;
        this.major_brand = stream.readString(4), this.minor_version = stream.readUint32(), 
        toparse -= 8, this.compatible_brands = [];
        for (var i = 0; toparse >= 4; ) this.compatible_brands[i] = stream.readString(4), 
        toparse -= 4, i++;
    })), BoxParser.createFullBoxCtor("hdlr", (function(stream) {
        0 === this.version && (stream.readUint32(), this.handler = stream.readString(4), 
        stream.readUint32Array(3), this.name = stream.readString(this.size - this.hdr_size - 20), 
        "\0" === this.name[this.name.length - 1] && (this.name = this.name.slice(0, -1)));
    })), BoxParser.createBoxCtor("hvcC", (function(stream) {
        var i, j, length, tmp_byte;
        this.configurationVersion = stream.readUint8(), tmp_byte = stream.readUint8(), this.general_profile_space = tmp_byte >> 6, 
        this.general_tier_flag = (32 & tmp_byte) >> 5, this.general_profile_idc = 31 & tmp_byte, 
        this.general_profile_compatibility = stream.readUint32(), this.general_constraint_indicator = stream.readUint8Array(6), 
        this.general_level_idc = stream.readUint8(), this.min_spatial_segmentation_idc = 4095 & stream.readUint16(), 
        this.parallelismType = 3 & stream.readUint8(), this.chroma_format_idc = 3 & stream.readUint8(), 
        this.bit_depth_luma_minus8 = 7 & stream.readUint8(), this.bit_depth_chroma_minus8 = 7 & stream.readUint8(), 
        this.avgFrameRate = stream.readUint16(), tmp_byte = stream.readUint8(), this.constantFrameRate = tmp_byte >> 6, 
        this.numTemporalLayers = (13 & tmp_byte) >> 3, this.temporalIdNested = (4 & tmp_byte) >> 2, 
        this.lengthSizeMinusOne = 3 & tmp_byte, this.nalu_arrays = [];
        var numOfArrays = stream.readUint8();
        for (i = 0; i < numOfArrays; i++) {
            var nalu_array = [];
            this.nalu_arrays.push(nalu_array), tmp_byte = stream.readUint8(), nalu_array.completeness = (128 & tmp_byte) >> 7, 
            nalu_array.nalu_type = 63 & tmp_byte;
            var numNalus = stream.readUint16();
            for (j = 0; j < numNalus; j++) {
                var nalu = {};
                nalu_array.push(nalu), length = stream.readUint16(), nalu.data = stream.readUint8Array(length);
            }
        }
    })), BoxParser.createFullBoxCtor("iinf", (function(stream) {
        var ret;
        0 === this.version ? this.entry_count = stream.readUint16() : this.entry_count = stream.readUint32(), 
        this.item_infos = [];
        for (var i = 0; i < this.entry_count; i++) {
            if ((ret = BoxParser.parseOneBox(stream, !1, this.size - (stream.getPosition() - this.start))).code !== BoxParser.OK) return;
            "infe" !== ret.box.type && Log.error("BoxParser", "Expected 'infe' box, got " + ret.box.type), 
            this.item_infos[i] = ret.box;
        }
    })), BoxParser.createFullBoxCtor("iloc", (function(stream) {
        var byte;
        byte = stream.readUint8(), this.offset_size = byte >> 4 & 15, this.length_size = 15 & byte, 
        byte = stream.readUint8(), this.base_offset_size = byte >> 4 & 15, 1 === this.version || 2 === this.version ? this.index_size = 15 & byte : this.index_size = 0, 
        this.items = [];
        var item_count = 0;
        if (this.version < 2) item_count = stream.readUint16(); else {
            if (2 !== this.version) throw "version of iloc box not supported";
            item_count = stream.readUint32();
        }
        for (var i = 0; i < item_count; i++) {
            var item = {};
            if (this.items.push(item), this.version < 2) item.item_ID = stream.readUint16(); else {
                if (2 !== this.version) throw "version of iloc box not supported";
                item.item_ID = stream.readUint16();
            }
            switch (1 === this.version || 2 === this.version ? item.construction_method = 15 & stream.readUint16() : item.construction_method = 0, 
            item.data_reference_index = stream.readUint16(), this.base_offset_size) {
              case 0:
                item.base_offset = 0;
                break;

              case 4:
                item.base_offset = stream.readUint32();
                break;

              case 8:
                item.base_offset = stream.readUint64();
                break;

              default:
                throw "Error reading base offset size";
            }
            var extent_count = stream.readUint16();
            item.extents = [];
            for (var j = 0; j < extent_count; j++) {
                var extent = {};
                if (item.extents.push(extent), 1 === this.version || 2 === this.version) switch (this.index_size) {
                  case 0:
                    extent.extent_index = 0;
                    break;

                  case 4:
                    extent.extent_index = stream.readUint32();
                    break;

                  case 8:
                    extent.extent_index = stream.readUint64();
                    break;

                  default:
                    throw "Error reading extent index";
                }
                switch (this.offset_size) {
                  case 0:
                    extent.extent_offset = 0;
                    break;

                  case 4:
                    extent.extent_offset = stream.readUint32();
                    break;

                  case 8:
                    extent.extent_offset = stream.readUint64();
                    break;

                  default:
                    throw "Error reading extent index";
                }
                switch (this.length_size) {
                  case 0:
                    extent.extent_length = 0;
                    break;

                  case 4:
                    extent.extent_length = stream.readUint32();
                    break;

                  case 8:
                    extent.extent_length = stream.readUint64();
                    break;

                  default:
                    throw "Error reading extent index";
                }
            }
        }
    })), BoxParser.createFullBoxCtor("infe", (function(stream) {
        if (0 !== this.version && 1 !== this.version || (this.item_ID = stream.readUint16(), 
        this.item_protection_index = stream.readUint16(), this.item_name = stream.readCString(), 
        this.content_type = stream.readCString(), this.content_encoding = stream.readCString()), 
        1 === this.version) return this.extension_type = stream.readString(4), Log.warn("BoxParser", "Cannot parse extension type"), 
        void stream.seek(this.start + this.size);
        this.version >= 2 && (2 === this.version ? this.item_ID = stream.readUint16() : 3 === this.version && (this.item_ID = stream.readUint32()), 
        this.item_protection_index = stream.readUint16(), this.item_type = stream.readString(4), 
        this.item_name = stream.readCString(), "mime" === this.item_type ? (this.content_type = stream.readCString(), 
        this.content_encoding = stream.readCString()) : "uri " === this.item_type && (this.item_uri_type = stream.readCString()));
    })), BoxParser.createFullBoxCtor("ipma", (function(stream) {
        var i, j;
        for (entry_count = stream.readUint32(), this.associations = [], i = 0; i < entry_count; i++) {
            var item_assoc = {};
            this.associations.push(item_assoc), this.version < 1 ? item_assoc.id = stream.readUint16() : item_assoc.id = stream.readUint32();
            var association_count = stream.readUint8();
            for (item_assoc.props = [], j = 0; j < association_count; j++) {
                var tmp = stream.readUint8(), p = {};
                item_assoc.props.push(p), p.essential = (128 & tmp) >> 7 == 1, 1 & this.flags ? p.property_index = (127 & tmp) << 8 | stream.readUint8() : p.property_index = 127 & tmp;
            }
        }
    })), BoxParser.createFullBoxCtor("iref", (function(stream) {
        var ret, box;
        for (this.references = []; stream.getPosition() < this.start + this.size; ) {
            if ((ret = BoxParser.parseOneBox(stream, !0, this.size - (stream.getPosition() - this.start))).code !== BoxParser.OK) return;
            (box = 0 === this.version ? new BoxParser.SingleItemTypeReferenceBox(ret.type, ret.size, ret.hdr_size, ret.start) : new BoxParser.SingleItemTypeReferenceBoxLarge(ret.type, ret.size, ret.hdr_size, ret.start)).write === BoxParser.Box.prototype.write && "mdat" !== box.type && (Log.warn("BoxParser", box.type + " box writing not yet implemented, keeping unparsed data in memory for later write"), 
            box.parseDataAndRewind(stream)), box.parse(stream), this.references.push(box);
        }
    })), BoxParser.createBoxCtor("irot", (function(stream) {
        this.angle = 3 & stream.readUint8();
    })), BoxParser.createFullBoxCtor("ispe", (function(stream) {
        this.image_width = stream.readUint32(), this.image_height = stream.readUint32();
    })), BoxParser.createFullBoxCtor("kind", (function(stream) {
        this.schemeURI = stream.readCString(), this.value = stream.readCString();
    })), BoxParser.createFullBoxCtor("leva", (function(stream) {
        var count = stream.readUint8();
        this.levels = [];
        for (var i = 0; i < count; i++) {
            var level = {};
            this.levels[i] = level, level.track_ID = stream.readUint32();
            var tmp_byte = stream.readUint8();
            switch (level.padding_flag = tmp_byte >> 7, level.assignment_type = 127 & tmp_byte, 
            level.assignment_type) {
              case 0:
                level.grouping_type = stream.readString(4);
                break;

              case 1:
                level.grouping_type = stream.readString(4), level.grouping_type_parameter = stream.readUint32();
                break;

              case 2:
              case 3:
                break;

              case 4:
                level.sub_track_id = stream.readUint32();
                break;

              default:
                Log.warn("BoxParser", "Unknown leva assignement type");
            }
        }
    })), BoxParser.createBoxCtor("maxr", (function(stream) {
        this.period = stream.readUint32(), this.bytes = stream.readUint32();
    })), BoxParser.createBoxCtor("mdcv", (function(stream) {
        this.display_primaries = [], this.display_primaries[0] = {}, this.display_primaries[0].x = stream.readUint16(), 
        this.display_primaries[0].y = stream.readUint16(), this.display_primaries[1] = {}, 
        this.display_primaries[1].x = stream.readUint16(), this.display_primaries[1].y = stream.readUint16(), 
        this.display_primaries[2] = {}, this.display_primaries[2].x = stream.readUint16(), 
        this.display_primaries[2].y = stream.readUint16(), this.white_point = {}, this.white_point.x = stream.readUint16(), 
        this.white_point.y = stream.readUint16(), this.max_display_mastering_luminance = stream.readUint32(), 
        this.min_display_mastering_luminance = stream.readUint32();
    })), BoxParser.createFullBoxCtor("mdhd", (function(stream) {
        1 == this.version ? (this.creation_time = stream.readUint64(), this.modification_time = stream.readUint64(), 
        this.timescale = stream.readUint32(), this.duration = stream.readUint64()) : (this.creation_time = stream.readUint32(), 
        this.modification_time = stream.readUint32(), this.timescale = stream.readUint32(), 
        this.duration = stream.readUint32()), this.parseLanguage(stream), stream.readUint16();
    })), BoxParser.createFullBoxCtor("mehd", (function(stream) {
        1 & this.flags && (Log.warn("BoxParser", "mehd box incorrectly uses flags set to 1, converting version to 1"), 
        this.version = 1), 1 == this.version ? this.fragment_duration = stream.readUint64() : this.fragment_duration = stream.readUint32();
    })), BoxParser.createFullBoxCtor("meta", (function(stream) {
        this.boxes = [], BoxParser.ContainerBox.prototype.parse.call(this, stream);
    })), BoxParser.createFullBoxCtor("mfhd", (function(stream) {
        this.sequence_number = stream.readUint32();
    })), BoxParser.createFullBoxCtor("mfro", (function(stream) {
        this._size = stream.readUint32();
    })), BoxParser.createFullBoxCtor("mvhd", (function(stream) {
        1 == this.version ? (this.creation_time = stream.readUint64(), this.modification_time = stream.readUint64(), 
        this.timescale = stream.readUint32(), this.duration = stream.readUint64()) : (this.creation_time = stream.readUint32(), 
        this.modification_time = stream.readUint32(), this.timescale = stream.readUint32(), 
        this.duration = stream.readUint32()), this.rate = stream.readUint32(), this.volume = stream.readUint16() >> 8, 
        stream.readUint16(), stream.readUint32Array(2), this.matrix = stream.readUint32Array(9), 
        stream.readUint32Array(6), this.next_track_id = stream.readUint32();
    })), BoxParser.createBoxCtor("npck", (function(stream) {
        this.packetssent = stream.readUint32();
    })), BoxParser.createBoxCtor("nump", (function(stream) {
        this.packetssent = stream.readUint64();
    })), BoxParser.createFullBoxCtor("padb", (function(stream) {
        var sample_count = stream.readUint32();
        this.padbits = [];
        for (var i = 0; i < Math.floor((sample_count + 1) / 2); i++) this.padbits = stream.readUint8();
    })), BoxParser.createBoxCtor("pasp", (function(stream) {
        this.hSpacing = stream.readUint32(), this.vSpacing = stream.readUint32();
    })), BoxParser.createBoxCtor("payl", (function(stream) {
        this.text = stream.readString(this.size - this.hdr_size);
    })), BoxParser.createBoxCtor("payt", (function(stream) {
        this.payloadID = stream.readUint32();
        var count = stream.readUint8();
        this.rtpmap_string = stream.readString(count);
    })), BoxParser.createFullBoxCtor("pdin", (function(stream) {
        var count = (this.size - this.hdr_size) / 8;
        this.rate = [], this.initial_delay = [];
        for (var i = 0; i < count; i++) this.rate[i] = stream.readUint32(), this.initial_delay[i] = stream.readUint32();
    })), BoxParser.createFullBoxCtor("pitm", (function(stream) {
        0 === this.version ? this.item_id = stream.readUint16() : this.item_id = stream.readUint32();
    })), BoxParser.createFullBoxCtor("pixi", (function(stream) {
        var i;
        for (this.num_channels = stream.readUint8(), this.bits_per_channels = [], i = 0; i < this.num_channels; i++) this.bits_per_channels[i] = stream.readUint8();
    })), BoxParser.createBoxCtor("pmax", (function(stream) {
        this.bytes = stream.readUint32();
    })), BoxParser.createFullBoxCtor("prft", (function(stream) {
        this.ref_track_id = stream.readUint32(), this.ntp_timestamp = stream.readUint64(), 
        0 === this.version ? this.media_time = stream.readUint32() : this.media_time = stream.readUint64();
    })), BoxParser.createFullBoxCtor("pssh", (function(stream) {
        if (this.system_id = BoxParser.parseHex16(stream), this.version > 0) {
            var count = stream.readUint32();
            this.kid = [];
            for (var i = 0; i < count; i++) this.kid[i] = BoxParser.parseHex16(stream);
        }
        var datasize = stream.readUint32();
        datasize > 0 && (this.data = stream.readUint8Array(datasize));
    })), BoxParser.createFullBoxCtor("clef", (function(stream) {
        this.width = stream.readUint32(), this.height = stream.readUint32();
    })), BoxParser.createFullBoxCtor("enof", (function(stream) {
        this.width = stream.readUint32(), this.height = stream.readUint32();
    })), BoxParser.createFullBoxCtor("prof", (function(stream) {
        this.width = stream.readUint32(), this.height = stream.readUint32();
    })), BoxParser.createContainerBoxCtor("tapt", null, [ "clef", "prof", "enof" ]), 
    BoxParser.createBoxCtor("rtp ", (function(stream) {
        this.descriptionformat = stream.readString(4), this.sdptext = stream.readString(this.size - this.hdr_size - 4);
    })), BoxParser.createFullBoxCtor("saio", (function(stream) {
        1 & this.flags && (this.aux_info_type = stream.readUint32(), this.aux_info_type_parameter = stream.readUint32());
        var count = stream.readUint32();
        this.offset = [];
        for (var i = 0; i < count; i++) 0 === this.version ? this.offset[i] = stream.readUint32() : this.offset[i] = stream.readUint64();
    })), BoxParser.createFullBoxCtor("saiz", (function(stream) {
        1 & this.flags && (this.aux_info_type = stream.readUint32(), this.aux_info_type_parameter = stream.readUint32()), 
        this.default_sample_info_size = stream.readUint8();
        var count = stream.readUint32();
        if (this.sample_info_size = [], 0 === this.default_sample_info_size) for (var i = 0; i < count; i++) this.sample_info_size[i] = stream.readUint8();
    })), BoxParser.createSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_METADATA, "mett", (function(stream) {
        this.parseHeader(stream), this.content_encoding = stream.readCString(), this.mime_format = stream.readCString(), 
        this.parseFooter(stream);
    })), BoxParser.createSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_METADATA, "metx", (function(stream) {
        this.parseHeader(stream), this.content_encoding = stream.readCString(), this.namespace = stream.readCString(), 
        this.schema_location = stream.readCString(), this.parseFooter(stream);
    })), BoxParser.createSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_SUBTITLE, "sbtt", (function(stream) {
        this.parseHeader(stream), this.content_encoding = stream.readCString(), this.mime_format = stream.readCString(), 
        this.parseFooter(stream);
    })), BoxParser.createSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_SUBTITLE, "stpp", (function(stream) {
        this.parseHeader(stream), this.namespace = stream.readCString(), this.schema_location = stream.readCString(), 
        this.auxiliary_mime_types = stream.readCString(), this.parseFooter(stream);
    })), BoxParser.createSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_SUBTITLE, "stxt", (function(stream) {
        this.parseHeader(stream), this.content_encoding = stream.readCString(), this.mime_format = stream.readCString(), 
        this.parseFooter(stream);
    })), BoxParser.createSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_SUBTITLE, "tx3g", (function(stream) {
        this.parseHeader(stream), this.displayFlags = stream.readUint32(), this.horizontal_justification = stream.readInt8(), 
        this.vertical_justification = stream.readInt8(), this.bg_color_rgba = stream.readUint8Array(4), 
        this.box_record = stream.readInt16Array(4), this.style_record = stream.readUint8Array(12), 
        this.parseFooter(stream);
    })), BoxParser.createSampleEntryCtor(BoxParser.SAMPLE_ENTRY_TYPE_METADATA, "wvtt", (function(stream) {
        this.parseHeader(stream), this.parseFooter(stream);
    })), BoxParser.createSampleGroupCtor("alst", (function(stream) {
        var i, roll_count = stream.readUint16();
        for (this.first_output_sample = stream.readUint16(), this.sample_offset = [], i = 0; i < roll_count; i++) this.sample_offset[i] = stream.readUint32();
        var remaining = this.description_length - 4 - 4 * roll_count;
        for (this.num_output_samples = [], this.num_total_samples = [], i = 0; i < remaining / 4; i++) this.num_output_samples[i] = stream.readUint16(), 
        this.num_total_samples[i] = stream.readUint16();
    })), BoxParser.createSampleGroupCtor("avll", (function(stream) {
        this.layerNumber = stream.readUint8(), this.accurateStatisticsFlag = stream.readUint8(), 
        this.avgBitRate = stream.readUint16(), this.avgFrameRate = stream.readUint16();
    })), BoxParser.createSampleGroupCtor("avss", (function(stream) {
        this.subSequenceIdentifier = stream.readUint16(), this.layerNumber = stream.readUint8();
        var tmp_byte = stream.readUint8();
        this.durationFlag = tmp_byte >> 7, this.avgRateFlag = tmp_byte >> 6 & 1, this.durationFlag && (this.duration = stream.readUint32()), 
        this.avgRateFlag && (this.accurateStatisticsFlag = stream.readUint8(), this.avgBitRate = stream.readUint16(), 
        this.avgFrameRate = stream.readUint16()), this.dependency = [];
        for (var numReferences = stream.readUint8(), i = 0; i < numReferences; i++) {
            var dependencyInfo = {};
            this.dependency.push(dependencyInfo), dependencyInfo.subSeqDirectionFlag = stream.readUint8(), 
            dependencyInfo.layerNumber = stream.readUint8(), dependencyInfo.subSequenceIdentifier = stream.readUint16();
        }
    })), BoxParser.createSampleGroupCtor("dtrt", (function(stream) {
        Log.warn("BoxParser", "Sample Group type: " + this.grouping_type + " not fully parsed");
    })), BoxParser.createSampleGroupCtor("mvif", (function(stream) {
        Log.warn("BoxParser", "Sample Group type: " + this.grouping_type + " not fully parsed");
    })), BoxParser.createSampleGroupCtor("prol", (function(stream) {
        this.roll_distance = stream.readInt16();
    })), BoxParser.createSampleGroupCtor("rap ", (function(stream) {
        var tmp_byte = stream.readUint8();
        this.num_leading_samples_known = tmp_byte >> 7, this.num_leading_samples = 127 & tmp_byte;
    })), BoxParser.createSampleGroupCtor("rash", (function(stream) {
        if (this.operation_point_count = stream.readUint16(), this.description_length !== 2 + (1 === this.operation_point_count ? 2 : 6 * this.operation_point_count) + 9) Log.warn("BoxParser", "Mismatch in " + this.grouping_type + " sample group length"), 
        this.data = stream.readUint8Array(this.description_length - 2); else {
            if (1 === this.operation_point_count) this.target_rate_share = stream.readUint16(); else {
                this.target_rate_share = [], this.available_bitrate = [];
                for (var i = 0; i < this.operation_point_count; i++) this.available_bitrate[i] = stream.readUint32(), 
                this.target_rate_share[i] = stream.readUint16();
            }
            this.maximum_bitrate = stream.readUint32(), this.minimum_bitrate = stream.readUint32(), 
            this.discard_priority = stream.readUint8();
        }
    })), BoxParser.createSampleGroupCtor("roll", (function(stream) {
        this.roll_distance = stream.readInt16();
    })), BoxParser.SampleGroupEntry.prototype.parse = function(stream) {
        Log.warn("BoxParser", "Unknown Sample Group type: " + this.grouping_type), this.data = stream.readUint8Array(this.description_length);
    }, BoxParser.createSampleGroupCtor("scif", (function(stream) {
        Log.warn("BoxParser", "Sample Group type: " + this.grouping_type + " not fully parsed");
    })), BoxParser.createSampleGroupCtor("scnm", (function(stream) {
        Log.warn("BoxParser", "Sample Group type: " + this.grouping_type + " not fully parsed");
    })), BoxParser.createSampleGroupCtor("seig", (function(stream) {
        this.reserved = stream.readUint8();
        var tmp = stream.readUint8();
        this.crypt_byte_block = tmp >> 4, this.skip_byte_block = 15 & tmp, this.isProtected = stream.readUint8(), 
        this.Per_Sample_IV_Size = stream.readUint8(), this.KID = BoxParser.parseHex16(stream), 
        this.constant_IV_size = 0, this.constant_IV = 0, 1 === this.isProtected && 0 === this.Per_Sample_IV_Size && (this.constant_IV_size = stream.readUint8(), 
        this.constant_IV = stream.readUint8Array(this.constant_IV_size));
    })), BoxParser.createSampleGroupCtor("stsa", (function(stream) {
        Log.warn("BoxParser", "Sample Group type: " + this.grouping_type + " not fully parsed");
    })), BoxParser.createSampleGroupCtor("sync", (function(stream) {
        var tmp_byte = stream.readUint8();
        this.NAL_unit_type = 63 & tmp_byte;
    })), BoxParser.createSampleGroupCtor("tele", (function(stream) {
        var tmp_byte = stream.readUint8();
        this.level_independently_decodable = tmp_byte >> 7;
    })), BoxParser.createSampleGroupCtor("tsas", (function(stream) {
        Log.warn("BoxParser", "Sample Group type: " + this.grouping_type + " not fully parsed");
    })), BoxParser.createSampleGroupCtor("tscl", (function(stream) {
        Log.warn("BoxParser", "Sample Group type: " + this.grouping_type + " not fully parsed");
    })), BoxParser.createSampleGroupCtor("vipr", (function(stream) {
        Log.warn("BoxParser", "Sample Group type: " + this.grouping_type + " not fully parsed");
    })), BoxParser.createFullBoxCtor("sbgp", (function(stream) {
        this.grouping_type = stream.readString(4), 1 === this.version ? this.grouping_type_parameter = stream.readUint32() : this.grouping_type_parameter = 0, 
        this.entries = [];
        for (var entry_count = stream.readUint32(), i = 0; i < entry_count; i++) {
            var entry = {};
            this.entries.push(entry), entry.sample_count = stream.readInt32(), entry.group_description_index = stream.readInt32();
        }
    })), BoxParser.createFullBoxCtor("schm", (function(stream) {
        this.scheme_type = stream.readString(4), this.scheme_version = stream.readUint32(), 
        1 & this.flags && (this.scheme_uri = stream.readString(this.size - this.hdr_size - 8));
    })), BoxParser.createBoxCtor("sdp ", (function(stream) {
        this.sdptext = stream.readString(this.size - this.hdr_size);
    })), BoxParser.createFullBoxCtor("sdtp", (function(stream) {
        var tmp_byte, count = this.size - this.hdr_size;
        this.is_leading = [], this.sample_depends_on = [], this.sample_is_depended_on = [], 
        this.sample_has_redundancy = [];
        for (var i = 0; i < count; i++) tmp_byte = stream.readUint8(), this.is_leading[i] = tmp_byte >> 6, 
        this.sample_depends_on[i] = tmp_byte >> 4 & 3, this.sample_is_depended_on[i] = tmp_byte >> 2 & 3, 
        this.sample_has_redundancy[i] = 3 & tmp_byte;
    })), BoxParser.createFullBoxCtor("senc"), BoxParser.createFullBoxCtor("sgpd", (function(stream) {
        this.grouping_type = stream.readString(4), Log.debug("BoxParser", "Found Sample Groups of type " + this.grouping_type), 
        1 === this.version ? this.default_length = stream.readUint32() : this.default_length = 0, 
        this.version >= 2 && (this.default_group_description_index = stream.readUint32()), 
        this.entries = [];
        for (var entry_count = stream.readUint32(), i = 0; i < entry_count; i++) {
            var entry;
            entry = BoxParser[this.grouping_type + "SampleGroupEntry"] ? new BoxParser[this.grouping_type + "SampleGroupEntry"](this.grouping_type) : new BoxParser.SampleGroupEntry(this.grouping_type), 
            this.entries.push(entry), 1 === this.version && 0 === this.default_length ? entry.description_length = stream.readUint32() : entry.description_length = this.default_length, 
            entry.write === BoxParser.SampleGroupEntry.prototype.write && (Log.info("BoxParser", "SampleGroup for type " + this.grouping_type + " writing not yet implemented, keeping unparsed data in memory for later write"), 
            entry.data = stream.readUint8Array(entry.description_length), stream.position -= entry.description_length), 
            entry.parse(stream);
        }
    })), BoxParser.createFullBoxCtor("sidx", (function(stream) {
        this.reference_ID = stream.readUint32(), this.timescale = stream.readUint32(), 0 === this.version ? (this.earliest_presentation_time = stream.readUint32(), 
        this.first_offset = stream.readUint32()) : (this.earliest_presentation_time = stream.readUint64(), 
        this.first_offset = stream.readUint64()), stream.readUint16(), this.references = [];
        for (var count = stream.readUint16(), i = 0; i < count; i++) {
            var ref = {};
            this.references.push(ref);
            var tmp_32 = stream.readUint32();
            ref.reference_type = tmp_32 >> 31 & 1, ref.referenced_size = 2147483647 & tmp_32, 
            ref.subsegment_duration = stream.readUint32(), tmp_32 = stream.readUint32(), ref.starts_with_SAP = tmp_32 >> 31 & 1, 
            ref.SAP_type = tmp_32 >> 28 & 7, ref.SAP_delta_time = 268435455 & tmp_32;
        }
    })), BoxParser.SingleItemTypeReferenceBox = function(type, size, hdr_size, start) {
        BoxParser.Box.call(this, type, size), this.hdr_size = hdr_size, this.start = start;
    }, BoxParser.SingleItemTypeReferenceBox.prototype = new BoxParser.Box, BoxParser.SingleItemTypeReferenceBox.prototype.parse = function(stream) {
        this.from_item_ID = stream.readUint16();
        var count = stream.readUint16();
        this.references = [];
        for (var i = 0; i < count; i++) this.references[i] = stream.readUint16();
    }, BoxParser.SingleItemTypeReferenceBoxLarge = function(type, size, hdr_size, start) {
        BoxParser.Box.call(this, type, size), this.hdr_size = hdr_size, this.start = start;
    }, BoxParser.SingleItemTypeReferenceBoxLarge.prototype = new BoxParser.Box, BoxParser.SingleItemTypeReferenceBoxLarge.prototype.parse = function(stream) {
        this.from_item_ID = stream.readUint32();
        var count = stream.readUint16();
        this.references = [];
        for (var i = 0; i < count; i++) this.references[i] = stream.readUint32();
    }, BoxParser.createFullBoxCtor("SmDm", (function(stream) {
        this.primaryRChromaticity_x = stream.readUint16(), this.primaryRChromaticity_y = stream.readUint16(), 
        this.primaryGChromaticity_x = stream.readUint16(), this.primaryGChromaticity_y = stream.readUint16(), 
        this.primaryBChromaticity_x = stream.readUint16(), this.primaryBChromaticity_y = stream.readUint16(), 
        this.whitePointChromaticity_x = stream.readUint16(), this.whitePointChromaticity_y = stream.readUint16(), 
        this.luminanceMax = stream.readUint32(), this.luminanceMin = stream.readUint32();
    })), BoxParser.createFullBoxCtor("smhd", (function(stream) {
        this.balance = stream.readUint16(), stream.readUint16();
    })), BoxParser.createFullBoxCtor("ssix", (function(stream) {
        this.subsegments = [];
        for (var subsegment_count = stream.readUint32(), i = 0; i < subsegment_count; i++) {
            var subsegment = {};
            this.subsegments.push(subsegment), subsegment.ranges = [];
            for (var range_count = stream.readUint32(), j = 0; j < range_count; j++) {
                var range = {};
                subsegment.ranges.push(range), range.level = stream.readUint8(), range.range_size = stream.readUint24();
            }
        }
    })), BoxParser.createFullBoxCtor("stco", (function(stream) {
        var entry_count;
        if (entry_count = stream.readUint32(), this.chunk_offsets = [], 0 === this.version) for (var i = 0; i < entry_count; i++) this.chunk_offsets.push(stream.readUint32());
    })), BoxParser.createFullBoxCtor("stdp", (function(stream) {
        var count = (this.size - this.hdr_size) / 2;
        this.priority = [];
        for (var i = 0; i < count; i++) this.priority[i] = stream.readUint16();
    })), BoxParser.createFullBoxCtor("sthd"), BoxParser.createFullBoxCtor("stri", (function(stream) {
        this.switch_group = stream.readUint16(), this.alternate_group = stream.readUint16(), 
        this.sub_track_id = stream.readUint32();
        var count = (this.size - this.hdr_size - 8) / 4;
        this.attribute_list = [];
        for (var i = 0; i < count; i++) this.attribute_list[i] = stream.readUint32();
    })), BoxParser.createFullBoxCtor("stsc", (function(stream) {
        var entry_count, i;
        if (entry_count = stream.readUint32(), this.first_chunk = [], this.samples_per_chunk = [], 
        this.sample_description_index = [], 0 === this.version) for (i = 0; i < entry_count; i++) this.first_chunk.push(stream.readUint32()), 
        this.samples_per_chunk.push(stream.readUint32()), this.sample_description_index.push(stream.readUint32());
    })), BoxParser.createFullBoxCtor("stsd", (function(stream) {
        var i, ret, entryCount, box;
        for (this.entries = [], entryCount = stream.readUint32(), i = 1; i <= entryCount; i++) {
            if ((ret = BoxParser.parseOneBox(stream, !0, this.size - (stream.getPosition() - this.start))).code !== BoxParser.OK) return;
            BoxParser[ret.type + "SampleEntry"] ? ((box = new BoxParser[ret.type + "SampleEntry"](ret.size)).hdr_size = ret.hdr_size, 
            box.start = ret.start) : (Log.warn("BoxParser", "Unknown sample entry type: " + ret.type), 
            box = new BoxParser.SampleEntry(ret.type, ret.size, ret.hdr_size, ret.start)), box.write === BoxParser.SampleEntry.prototype.write && (Log.info("BoxParser", "SampleEntry " + box.type + " box writing not yet implemented, keeping unparsed data in memory for later write"), 
            box.parseDataAndRewind(stream)), box.parse(stream), this.entries.push(box);
        }
    })), BoxParser.createFullBoxCtor("stsg", (function(stream) {
        this.grouping_type = stream.readUint32();
        var count = stream.readUint16();
        this.group_description_index = [];
        for (var i = 0; i < count; i++) this.group_description_index[i] = stream.readUint32();
    })), BoxParser.createFullBoxCtor("stsh", (function(stream) {
        var entry_count, i;
        if (entry_count = stream.readUint32(), this.shadowed_sample_numbers = [], this.sync_sample_numbers = [], 
        0 === this.version) for (i = 0; i < entry_count; i++) this.shadowed_sample_numbers.push(stream.readUint32()), 
        this.sync_sample_numbers.push(stream.readUint32());
    })), BoxParser.createFullBoxCtor("stss", (function(stream) {
        var i, entry_count;
        if (entry_count = stream.readUint32(), 0 === this.version) for (this.sample_numbers = [], 
        i = 0; i < entry_count; i++) this.sample_numbers.push(stream.readUint32());
    })), BoxParser.createFullBoxCtor("stsz", (function(stream) {
        var i;
        if (this.sample_sizes = [], 0 === this.version) for (this.sample_size = stream.readUint32(), 
        this.sample_count = stream.readUint32(), i = 0; i < this.sample_count; i++) 0 === this.sample_size ? this.sample_sizes.push(stream.readUint32()) : this.sample_sizes[i] = this.sample_size;
    })), BoxParser.createFullBoxCtor("stts", (function(stream) {
        var entry_count, i, delta;
        if (entry_count = stream.readUint32(), this.sample_counts = [], this.sample_deltas = [], 
        0 === this.version) for (i = 0; i < entry_count; i++) this.sample_counts.push(stream.readUint32()), 
        (delta = stream.readInt32()) < 0 && (Log.warn("BoxParser", "File uses negative stts sample delta, using value 1 instead, sync may be lost!"), 
        delta = 1), this.sample_deltas.push(delta);
    })), BoxParser.createFullBoxCtor("stvi", (function(stream) {
        var tmp32 = stream.readUint32();
        this.single_view_allowed = 3 & tmp32, this.stereo_scheme = stream.readUint32();
        var ret, box, length = stream.readUint32();
        for (this.stereo_indication_type = stream.readString(length), this.boxes = []; stream.getPosition() < this.start + this.size; ) {
            if ((ret = BoxParser.parseOneBox(stream, !1, this.size - (stream.getPosition() - this.start))).code !== BoxParser.OK) return;
            box = ret.box, this.boxes.push(box), this[box.type] = box;
        }
    })), BoxParser.createBoxCtor("styp", (function(stream) {
        BoxParser.ftypBox.prototype.parse.call(this, stream);
    })), BoxParser.createFullBoxCtor("stz2", (function(stream) {
        var i, sample_count;
        if (this.sample_sizes = [], 0 === this.version) if (this.reserved = stream.readUint24(), 
        this.field_size = stream.readUint8(), sample_count = stream.readUint32(), 4 === this.field_size) for (i = 0; i < sample_count; i += 2) {
            var tmp = stream.readUint8();
            this.sample_sizes[i] = tmp >> 4 & 15, this.sample_sizes[i + 1] = 15 & tmp;
        } else if (8 === this.field_size) for (i = 0; i < sample_count; i++) this.sample_sizes[i] = stream.readUint8(); else if (16 === this.field_size) for (i = 0; i < sample_count; i++) this.sample_sizes[i] = stream.readUint16(); else Log.error("BoxParser", "Error in length field in stz2 box");
    })), BoxParser.createFullBoxCtor("subs", (function(stream) {
        var i, j, entry_count, subsample_count;
        for (entry_count = stream.readUint32(), this.entries = [], i = 0; i < entry_count; i++) {
            var sampleInfo = {};
            if (this.entries[i] = sampleInfo, sampleInfo.sample_delta = stream.readUint32(), 
            sampleInfo.subsamples = [], (subsample_count = stream.readUint16()) > 0) for (j = 0; j < subsample_count; j++) {
                var subsample = {};
                sampleInfo.subsamples.push(subsample), 1 == this.version ? subsample.size = stream.readUint32() : subsample.size = stream.readUint16(), 
                subsample.priority = stream.readUint8(), subsample.discardable = stream.readUint8(), 
                subsample.codec_specific_parameters = stream.readUint32();
            }
        }
    })), BoxParser.createFullBoxCtor("tenc", (function(stream) {
        if (stream.readUint8(), 0 === this.version) stream.readUint8(); else {
            var tmp = stream.readUint8();
            this.default_crypt_byte_block = tmp >> 4 & 15, this.default_skip_byte_block = 15 & tmp;
        }
        this.default_isProtected = stream.readUint8(), this.default_Per_Sample_IV_Size = stream.readUint8(), 
        this.default_KID = BoxParser.parseHex16(stream), 1 === this.default_isProtected && 0 === this.default_Per_Sample_IV_Size && (this.default_constant_IV_size = stream.readUint8(), 
        this.default_constant_IV = stream.readUint8Array(this.default_constant_IV_size));
    })), BoxParser.createFullBoxCtor("tfdt", (function(stream) {
        1 == this.version ? this.baseMediaDecodeTime = stream.readUint64() : this.baseMediaDecodeTime = stream.readUint32();
    })), BoxParser.createFullBoxCtor("tfhd", (function(stream) {
        var readBytes = 0;
        this.track_id = stream.readUint32(), this.size - this.hdr_size > readBytes && this.flags & BoxParser.TFHD_FLAG_BASE_DATA_OFFSET ? (this.base_data_offset = stream.readUint64(), 
        readBytes += 8) : this.base_data_offset = 0, this.size - this.hdr_size > readBytes && this.flags & BoxParser.TFHD_FLAG_SAMPLE_DESC ? (this.default_sample_description_index = stream.readUint32(), 
        readBytes += 4) : this.default_sample_description_index = 0, this.size - this.hdr_size > readBytes && this.flags & BoxParser.TFHD_FLAG_SAMPLE_DUR ? (this.default_sample_duration = stream.readUint32(), 
        readBytes += 4) : this.default_sample_duration = 0, this.size - this.hdr_size > readBytes && this.flags & BoxParser.TFHD_FLAG_SAMPLE_SIZE ? (this.default_sample_size = stream.readUint32(), 
        readBytes += 4) : this.default_sample_size = 0, this.size - this.hdr_size > readBytes && this.flags & BoxParser.TFHD_FLAG_SAMPLE_FLAGS ? (this.default_sample_flags = stream.readUint32(), 
        readBytes += 4) : this.default_sample_flags = 0;
    })), BoxParser.createFullBoxCtor("tfra", (function(stream) {
        this.track_ID = stream.readUint32(), stream.readUint24();
        var tmp_byte = stream.readUint8();
        this.length_size_of_traf_num = tmp_byte >> 4 & 3, this.length_size_of_trun_num = tmp_byte >> 2 & 3, 
        this.length_size_of_sample_num = 3 & tmp_byte, this.entries = [];
        for (var number_of_entries = stream.readUint32(), i = 0; i < number_of_entries; i++) 1 === this.version ? (this.time = stream.readUint64(), 
        this.moof_offset = stream.readUint64()) : (this.time = stream.readUint32(), this.moof_offset = stream.readUint32()), 
        this.traf_number = stream["readUint" + 8 * (this.length_size_of_traf_num + 1)](), 
        this.trun_number = stream["readUint" + 8 * (this.length_size_of_trun_num + 1)](), 
        this.sample_number = stream["readUint" + 8 * (this.length_size_of_sample_num + 1)]();
    })), BoxParser.createFullBoxCtor("tkhd", (function(stream) {
        1 == this.version ? (this.creation_time = stream.readUint64(), this.modification_time = stream.readUint64(), 
        this.track_id = stream.readUint32(), stream.readUint32(), this.duration = stream.readUint64()) : (this.creation_time = stream.readUint32(), 
        this.modification_time = stream.readUint32(), this.track_id = stream.readUint32(), 
        stream.readUint32(), this.duration = stream.readUint32()), stream.readUint32Array(2), 
        this.layer = stream.readInt16(), this.alternate_group = stream.readInt16(), this.volume = stream.readInt16() >> 8, 
        stream.readUint16(), this.matrix = stream.readInt32Array(9), this.width = stream.readUint32(), 
        this.height = stream.readUint32();
    })), BoxParser.createBoxCtor("tmax", (function(stream) {
        this.time = stream.readUint32();
    })), BoxParser.createBoxCtor("tmin", (function(stream) {
        this.time = stream.readUint32();
    })), BoxParser.createBoxCtor("totl", (function(stream) {
        this.bytessent = stream.readUint32();
    })), BoxParser.createBoxCtor("tpay", (function(stream) {
        this.bytessent = stream.readUint32();
    })), BoxParser.createBoxCtor("tpyl", (function(stream) {
        this.bytessent = stream.readUint64();
    })), BoxParser.TrackGroupTypeBox.prototype.parse = function(stream) {
        this.parseFullHeader(stream), this.track_group_id = stream.readUint32();
    }, BoxParser.createTrackGroupCtor("msrc"), BoxParser.TrackReferenceTypeBox = function(type, size, hdr_size, start) {
        BoxParser.Box.call(this, type, size), this.hdr_size = hdr_size, this.start = start;
    }, BoxParser.TrackReferenceTypeBox.prototype = new BoxParser.Box, BoxParser.TrackReferenceTypeBox.prototype.parse = function(stream) {
        this.track_ids = stream.readUint32Array((this.size - this.hdr_size) / 4);
    }, BoxParser.trefBox.prototype.parse = function(stream) {
        for (var ret, box; stream.getPosition() < this.start + this.size; ) {
            if ((ret = BoxParser.parseOneBox(stream, !0, this.size - (stream.getPosition() - this.start))).code !== BoxParser.OK) return;
            (box = new BoxParser.TrackReferenceTypeBox(ret.type, ret.size, ret.hdr_size, ret.start)).write === BoxParser.Box.prototype.write && "mdat" !== box.type && (Log.info("BoxParser", "TrackReference " + box.type + " box writing not yet implemented, keeping unparsed data in memory for later write"), 
            box.parseDataAndRewind(stream)), box.parse(stream), this.boxes.push(box);
        }
    }, BoxParser.createFullBoxCtor("trep", (function(stream) {
        for (this.track_ID = stream.readUint32(), this.boxes = []; stream.getPosition() < this.start + this.size; ) {
            if (ret = BoxParser.parseOneBox(stream, !1, this.size - (stream.getPosition() - this.start)), 
            ret.code !== BoxParser.OK) return;
            box = ret.box, this.boxes.push(box);
        }
    })), BoxParser.createFullBoxCtor("trex", (function(stream) {
        this.track_id = stream.readUint32(), this.default_sample_description_index = stream.readUint32(), 
        this.default_sample_duration = stream.readUint32(), this.default_sample_size = stream.readUint32(), 
        this.default_sample_flags = stream.readUint32();
    })), BoxParser.createBoxCtor("trpy", (function(stream) {
        this.bytessent = stream.readUint64();
    })), BoxParser.createFullBoxCtor("trun", (function(stream) {
        var readBytes = 0;
        if (this.sample_count = stream.readUint32(), readBytes += 4, this.size - this.hdr_size > readBytes && this.flags & BoxParser.TRUN_FLAGS_DATA_OFFSET ? (this.data_offset = stream.readInt32(), 
        readBytes += 4) : this.data_offset = 0, this.size - this.hdr_size > readBytes && this.flags & BoxParser.TRUN_FLAGS_FIRST_FLAG ? (this.first_sample_flags = stream.readUint32(), 
        readBytes += 4) : this.first_sample_flags = 0, this.sample_duration = [], this.sample_size = [], 
        this.sample_flags = [], this.sample_composition_time_offset = [], this.size - this.hdr_size > readBytes) for (var i = 0; i < this.sample_count; i++) this.flags & BoxParser.TRUN_FLAGS_DURATION && (this.sample_duration[i] = stream.readUint32()), 
        this.flags & BoxParser.TRUN_FLAGS_SIZE && (this.sample_size[i] = stream.readUint32()), 
        this.flags & BoxParser.TRUN_FLAGS_FLAGS && (this.sample_flags[i] = stream.readUint32()), 
        this.flags & BoxParser.TRUN_FLAGS_CTS_OFFSET && (0 === this.version ? this.sample_composition_time_offset[i] = stream.readUint32() : this.sample_composition_time_offset[i] = stream.readInt32());
    })), BoxParser.createFullBoxCtor("tsel", (function(stream) {
        this.switch_group = stream.readUint32();
        var count = (this.size - this.hdr_size - 4) / 4;
        this.attribute_list = [];
        for (var i = 0; i < count; i++) this.attribute_list[i] = stream.readUint32();
    })), BoxParser.createFullBoxCtor("txtC", (function(stream) {
        this.config = stream.readCString();
    })), BoxParser.createFullBoxCtor("url ", (function(stream) {
        1 !== this.flags && (this.location = stream.readCString());
    })), BoxParser.createFullBoxCtor("urn ", (function(stream) {
        this.name = stream.readCString(), this.size - this.hdr_size - this.name.length - 1 > 0 && (this.location = stream.readCString());
    })), BoxParser.createUUIDBox("a5d40b30e81411ddba2f0800200c9a66", !0, !1, (function(stream) {
        this.LiveServerManifest = stream.readString(this.size - this.hdr_size).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    })), BoxParser.createUUIDBox("d08a4f1810f34a82b6c832d8aba183d3", !0, !1, (function(stream) {
        this.system_id = BoxParser.parseHex16(stream);
        var datasize = stream.readUint32();
        datasize > 0 && (this.data = stream.readUint8Array(datasize));
    })), BoxParser.createUUIDBox("a2394f525a9b4f14a2446c427c648df4", !0, !1), BoxParser.createUUIDBox("8974dbce7be74c5184f97148f9882554", !0, !1, (function(stream) {
        this.default_AlgorithmID = stream.readUint24(), this.default_IV_size = stream.readUint8(), 
        this.default_KID = BoxParser.parseHex16(stream);
    })), BoxParser.createUUIDBox("d4807ef2ca3946958e5426cb9e46a79f", !0, !1, (function(stream) {
        this.fragment_count = stream.readUint8(), this.entries = [];
        for (var i = 0; i < this.fragment_count; i++) {
            var entry = {}, absolute_time = 0, absolute_duration = 0;
            1 === this.version ? (absolute_time = stream.readUint64(), absolute_duration = stream.readUint64()) : (absolute_time = stream.readUint32(), 
            absolute_duration = stream.readUint32()), entry.absolute_time = absolute_time, entry.absolute_duration = absolute_duration, 
            this.entries.push(entry);
        }
    })), BoxParser.createUUIDBox("6d1d9b0542d544e680e2141daff757b2", !0, !1, (function(stream) {
        1 === this.version ? (this.absolute_time = stream.readUint64(), this.duration = stream.readUint64()) : (this.absolute_time = stream.readUint32(), 
        this.duration = stream.readUint32());
    })), BoxParser.createFullBoxCtor("vmhd", (function(stream) {
        this.graphicsmode = stream.readUint16(), this.opcolor = stream.readUint16Array(3);
    })), BoxParser.createFullBoxCtor("vpcC", (function(stream) {
        var tmp;
        1 === this.version ? (this.profile = stream.readUint8(), this.level = stream.readUint8(), 
        tmp = stream.readUint8(), this.bitDepth = tmp >> 4, this.chromaSubsampling = tmp >> 1 & 7, 
        this.videoFullRangeFlag = 1 & tmp, this.colourPrimaries = stream.readUint8(), this.transferCharacteristics = stream.readUint8(), 
        this.matrixCoefficients = stream.readUint8(), this.codecIntializationDataSize = stream.readUint16(), 
        this.codecIntializationData = stream.readUint8Array(this.codecIntializationDataSize)) : (this.profile = stream.readUint8(), 
        this.level = stream.readUint8(), tmp = stream.readUint8(), this.bitDepth = tmp >> 4 & 15, 
        this.colorSpace = 15 & tmp, tmp = stream.readUint8(), this.chromaSubsampling = tmp >> 4 & 15, 
        this.transferFunction = tmp >> 1 & 7, this.videoFullRangeFlag = 1 & tmp, this.codecIntializationDataSize = stream.readUint16(), 
        this.codecIntializationData = stream.readUint8Array(this.codecIntializationDataSize));
    })), BoxParser.createBoxCtor("vttC", (function(stream) {
        this.text = stream.readString(this.size - this.hdr_size);
    })), BoxParser.SampleEntry.prototype.isVideo = function() {
        return !1;
    }, BoxParser.SampleEntry.prototype.isAudio = function() {
        return !1;
    }, BoxParser.SampleEntry.prototype.isSubtitle = function() {
        return !1;
    }, BoxParser.SampleEntry.prototype.isMetadata = function() {
        return !1;
    }, BoxParser.SampleEntry.prototype.isHint = function() {
        return !1;
    }, BoxParser.SampleEntry.prototype.getCodec = function() {
        return this.type.replace(".", "");
    }, BoxParser.SampleEntry.prototype.getWidth = function() {
        return "";
    }, BoxParser.SampleEntry.prototype.getHeight = function() {
        return "";
    }, BoxParser.SampleEntry.prototype.getChannelCount = function() {
        return "";
    }, BoxParser.SampleEntry.prototype.getSampleRate = function() {
        return "";
    }, BoxParser.SampleEntry.prototype.getSampleSize = function() {
        return "";
    }, BoxParser.VisualSampleEntry.prototype.isVideo = function() {
        return !0;
    }, BoxParser.VisualSampleEntry.prototype.getWidth = function() {
        return this.width;
    }, BoxParser.VisualSampleEntry.prototype.getHeight = function() {
        return this.height;
    }, BoxParser.AudioSampleEntry.prototype.isAudio = function() {
        return !0;
    }, BoxParser.AudioSampleEntry.prototype.getChannelCount = function() {
        return this.channel_count;
    }, BoxParser.AudioSampleEntry.prototype.getSampleRate = function() {
        return this.samplerate;
    }, BoxParser.AudioSampleEntry.prototype.getSampleSize = function() {
        return this.samplesize;
    }, BoxParser.SubtitleSampleEntry.prototype.isSubtitle = function() {
        return !0;
    }, BoxParser.MetadataSampleEntry.prototype.isMetadata = function() {
        return !0;
    }, BoxParser.decimalToHex = function(d, padding) {
        var hex = Number(d).toString(16);
        for (padding = null == padding ? padding = 2 : padding; hex.length < padding; ) hex = "0" + hex;
        return hex;
    }, BoxParser.avc1SampleEntry.prototype.getCodec = BoxParser.avc2SampleEntry.prototype.getCodec = BoxParser.avc3SampleEntry.prototype.getCodec = BoxParser.avc4SampleEntry.prototype.getCodec = function() {
        var baseCodec = BoxParser.SampleEntry.prototype.getCodec.call(this);
        return this.avcC ? baseCodec + "." + BoxParser.decimalToHex(this.avcC.AVCProfileIndication) + BoxParser.decimalToHex(this.avcC.profile_compatibility) + BoxParser.decimalToHex(this.avcC.AVCLevelIndication) : baseCodec;
    }, BoxParser.hev1SampleEntry.prototype.getCodec = BoxParser.hvc1SampleEntry.prototype.getCodec = function() {
        var i, baseCodec = BoxParser.SampleEntry.prototype.getCodec.call(this);
        if (this.hvcC) {
            switch (baseCodec += ".", this.hvcC.general_profile_space) {
              case 0:
                baseCodec += "";
                break;

              case 1:
                baseCodec += "A";
                break;

              case 2:
                baseCodec += "B";
                break;

              case 3:
                baseCodec += "C";
            }
            baseCodec += this.hvcC.general_profile_idc, baseCodec += ".";
            var val = this.hvcC.general_profile_compatibility, reversed = 0;
            for (i = 0; i < 32 && (reversed |= 1 & val, 31 != i); i++) reversed <<= 1, val >>= 1;
            baseCodec += BoxParser.decimalToHex(reversed, 0), baseCodec += ".", 0 === this.hvcC.general_tier_flag ? baseCodec += "L" : baseCodec += "H", 
            baseCodec += this.hvcC.general_level_idc;
            var hasByte = !1, constraint_string = "";
            for (i = 5; i >= 0; i--) (this.hvcC.general_constraint_indicator[i] || hasByte) && (constraint_string = "." + BoxParser.decimalToHex(this.hvcC.general_constraint_indicator[i], 0) + constraint_string, 
            hasByte = !0);
            baseCodec += constraint_string;
        }
        return baseCodec;
    }, BoxParser.mp4aSampleEntry.prototype.getCodec = function() {
        var baseCodec = BoxParser.SampleEntry.prototype.getCodec.call(this);
        if (this.esds && this.esds.esd) {
            var oti = this.esds.esd.getOTI(), dsi = this.esds.esd.getAudioConfig();
            return baseCodec + "." + BoxParser.decimalToHex(oti) + (dsi ? "." + dsi : "");
        }
        return baseCodec;
    }, BoxParser.stxtSampleEntry.prototype.getCodec = function() {
        var baseCodec = BoxParser.SampleEntry.prototype.getCodec.call(this);
        return this.mime_format ? baseCodec + "." + this.mime_format : baseCodec;
    }, BoxParser.av01SampleEntry.prototype.getCodec = function() {
        var bitdepth, baseCodec = BoxParser.SampleEntry.prototype.getCodec.call(this);
        return 2 === this.av1C.seq_profile && 1 === this.av1C.high_bitdepth ? bitdepth = 1 === this.av1C.twelve_bit ? 12 : 10 : this.av1C.seq_profile <= 2 && (bitdepth = 1 === this.av1C.high_bitdepth ? 10 : 8), 
        baseCodec + "." + this.av1C.seq_profile + "." + this.av1C.seq_level_idx_0 + (this.av1C.seq_tier_0 ? "H" : "M") + "." + bitdepth + "." + this.av1C.monochrome + "." + this.av1C.chroma_subsampling_x + this.av1C.chroma_subsampling_y + this.av1C.chroma_sample_position;
    }, BoxParser.Box.prototype.writeHeader = function(stream, msg) {
        this.size += 8, this.size > MAX_SIZE && (this.size += 8), "uuid" === this.type && (this.size += 16), 
        Log.debug("BoxWriter", "Writing box " + this.type + " of size: " + this.size + " at position " + stream.getPosition() + (msg || "")), 
        this.size > MAX_SIZE ? stream.writeUint32(1) : (this.sizePosition = stream.getPosition(), 
        stream.writeUint32(this.size)), stream.writeString(this.type, null, 4), "uuid" === this.type && stream.writeUint8Array(this.uuid), 
        this.size > MAX_SIZE && stream.writeUint64(this.size);
    }, BoxParser.FullBox.prototype.writeHeader = function(stream) {
        this.size += 4, BoxParser.Box.prototype.writeHeader.call(this, stream, " v=" + this.version + " f=" + this.flags), 
        stream.writeUint8(this.version), stream.writeUint24(this.flags);
    }, BoxParser.Box.prototype.write = function(stream) {
        "mdat" === this.type ? this.data && (this.size = this.data.length, this.writeHeader(stream), 
        stream.writeUint8Array(this.data)) : (this.size = this.data ? this.data.length : 0, 
        this.writeHeader(stream), this.data && stream.writeUint8Array(this.data));
    }, BoxParser.ContainerBox.prototype.write = function(stream) {
        this.size = 0, this.writeHeader(stream);
        for (var i = 0; i < this.boxes.length; i++) this.boxes[i] && (this.boxes[i].write(stream), 
        this.size += this.boxes[i].size);
        Log.debug("BoxWriter", "Adjusting box " + this.type + " with new size " + this.size), 
        stream.adjustUint32(this.sizePosition, this.size);
    }, BoxParser.TrackReferenceTypeBox.prototype.write = function(stream) {
        this.size = 4 * this.track_ids.length, this.writeHeader(stream), stream.writeUint32Array(this.track_ids);
    }, BoxParser.avcCBox.prototype.write = function(stream) {
        var i;
        for (this.size = 7, i = 0; i < this.SPS.length; i++) this.size += 2 + this.SPS[i].length;
        for (i = 0; i < this.PPS.length; i++) this.size += 2 + this.PPS[i].length;
        for (this.ext && (this.size += this.ext.length), this.writeHeader(stream), stream.writeUint8(this.configurationVersion), 
        stream.writeUint8(this.AVCProfileIndication), stream.writeUint8(this.profile_compatibility), 
        stream.writeUint8(this.AVCLevelIndication), stream.writeUint8(this.lengthSizeMinusOne + 252), 
        stream.writeUint8(this.SPS.length + 224), i = 0; i < this.SPS.length; i++) stream.writeUint16(this.SPS[i].length), 
        stream.writeUint8Array(this.SPS[i].nalu);
        for (stream.writeUint8(this.PPS.length), i = 0; i < this.PPS.length; i++) stream.writeUint16(this.PPS[i].length), 
        stream.writeUint8Array(this.PPS[i].nalu);
        this.ext && stream.writeUint8Array(this.ext);
    }, BoxParser.co64Box.prototype.write = function(stream) {
        var i;
        for (this.version = 0, this.flags = 0, this.size = 4 + 8 * this.chunk_offsets.length, 
        this.writeHeader(stream), stream.writeUint32(this.chunk_offsets.length), i = 0; i < this.chunk_offsets.length; i++) stream.writeUint64(this.chunk_offsets[i]);
    }, BoxParser.cslgBox.prototype.write = function(stream) {
        this.version = 0, this.flags = 0, this.size = 20, this.writeHeader(stream), stream.writeInt32(this.compositionToDTSShift), 
        stream.writeInt32(this.leastDecodeToDisplayDelta), stream.writeInt32(this.greatestDecodeToDisplayDelta), 
        stream.writeInt32(this.compositionStartTime), stream.writeInt32(this.compositionEndTime);
    }, BoxParser.cttsBox.prototype.write = function(stream) {
        var i;
        for (this.version = 0, this.flags = 0, this.size = 4 + 8 * this.sample_counts.length, 
        this.writeHeader(stream), stream.writeUint32(this.sample_counts.length), i = 0; i < this.sample_counts.length; i++) stream.writeUint32(this.sample_counts[i]), 
        1 === this.version ? stream.writeInt32(this.sample_offsets[i]) : stream.writeUint32(this.sample_offsets[i]);
    }, BoxParser.drefBox.prototype.write = function(stream) {
        this.version = 0, this.flags = 0, this.size = 4, this.writeHeader(stream), stream.writeUint32(this.entries.length);
        for (var i = 0; i < this.entries.length; i++) this.entries[i].write(stream), this.size += this.entries[i].size;
        Log.debug("BoxWriter", "Adjusting box " + this.type + " with new size " + this.size), 
        stream.adjustUint32(this.sizePosition, this.size);
    }, BoxParser.elngBox.prototype.write = function(stream) {
        this.version = 0, this.flags = 0, this.size = this.extended_language.length, this.writeHeader(stream), 
        stream.writeString(this.extended_language);
    }, BoxParser.elstBox.prototype.write = function(stream) {
        this.version = 0, this.flags = 0, this.size = 4 + 12 * this.entries.length, this.writeHeader(stream), 
        stream.writeUint32(this.entries.length);
        for (var i = 0; i < this.entries.length; i++) {
            var entry = this.entries[i];
            stream.writeUint32(entry.segment_duration), stream.writeInt32(entry.media_time), 
            stream.writeInt16(entry.media_rate_integer), stream.writeInt16(entry.media_rate_fraction);
        }
    }, BoxParser.emsgBox.prototype.write = function(stream) {
        this.version = 0, this.flags = 0, this.size = 16 + this.message_data.length + (this.scheme_id_uri.length + 1) + (this.value.length + 1), 
        this.writeHeader(stream), stream.writeCString(this.scheme_id_uri), stream.writeCString(this.value), 
        stream.writeUint32(this.timescale), stream.writeUint32(this.presentation_time_delta), 
        stream.writeUint32(this.event_duration), stream.writeUint32(this.id), stream.writeUint8Array(this.message_data);
    }, BoxParser.ftypBox.prototype.write = function(stream) {
        this.size = 8 + 4 * this.compatible_brands.length, this.writeHeader(stream), stream.writeString(this.major_brand, null, 4), 
        stream.writeUint32(this.minor_version);
        for (var i = 0; i < this.compatible_brands.length; i++) stream.writeString(this.compatible_brands[i], null, 4);
    }, BoxParser.hdlrBox.prototype.write = function(stream) {
        this.size = 20 + this.name.length + 1, this.version = 0, this.flags = 0, this.writeHeader(stream), 
        stream.writeUint32(0), stream.writeString(this.handler, null, 4), stream.writeUint32(0), 
        stream.writeUint32(0), stream.writeUint32(0), stream.writeCString(this.name);
    }, BoxParser.kindBox.prototype.write = function(stream) {
        this.version = 0, this.flags = 0, this.size = this.schemeURI.length + 1 + (this.value.length + 1), 
        this.writeHeader(stream), stream.writeCString(this.schemeURI), stream.writeCString(this.value);
    }, BoxParser.mdhdBox.prototype.write = function(stream) {
        this.size = 20, this.flags = 0, this.version = 0, this.writeHeader(stream), stream.writeUint32(this.creation_time), 
        stream.writeUint32(this.modification_time), stream.writeUint32(this.timescale), 
        stream.writeUint32(this.duration), stream.writeUint16(this.language), stream.writeUint16(0);
    }, BoxParser.mehdBox.prototype.write = function(stream) {
        this.version = 0, this.flags = 0, this.size = 4, this.writeHeader(stream), stream.writeUint32(this.fragment_duration);
    }, BoxParser.mfhdBox.prototype.write = function(stream) {
        this.version = 0, this.flags = 0, this.size = 4, this.writeHeader(stream), stream.writeUint32(this.sequence_number);
    }, BoxParser.mvhdBox.prototype.write = function(stream) {
        this.version = 0, this.flags = 0, this.size = 96, this.writeHeader(stream), stream.writeUint32(this.creation_time), 
        stream.writeUint32(this.modification_time), stream.writeUint32(this.timescale), 
        stream.writeUint32(this.duration), stream.writeUint32(this.rate), stream.writeUint16(this.volume << 8), 
        stream.writeUint16(0), stream.writeUint32(0), stream.writeUint32(0), stream.writeUint32Array(this.matrix), 
        stream.writeUint32(0), stream.writeUint32(0), stream.writeUint32(0), stream.writeUint32(0), 
        stream.writeUint32(0), stream.writeUint32(0), stream.writeUint32(this.next_track_id);
    }, BoxParser.SampleEntry.prototype.writeHeader = function(stream) {
        this.size = 8, BoxParser.Box.prototype.writeHeader.call(this, stream), stream.writeUint8(0), 
        stream.writeUint8(0), stream.writeUint8(0), stream.writeUint8(0), stream.writeUint8(0), 
        stream.writeUint8(0), stream.writeUint16(this.data_reference_index);
    }, BoxParser.SampleEntry.prototype.writeFooter = function(stream) {
        for (var i = 0; i < this.boxes.length; i++) this.boxes[i].write(stream), this.size += this.boxes[i].size;
        Log.debug("BoxWriter", "Adjusting box " + this.type + " with new size " + this.size), 
        stream.adjustUint32(this.sizePosition, this.size);
    }, BoxParser.SampleEntry.prototype.write = function(stream) {
        this.writeHeader(stream), stream.writeUint8Array(this.data), this.size += this.data.length, 
        Log.debug("BoxWriter", "Adjusting box " + this.type + " with new size " + this.size), 
        stream.adjustUint32(this.sizePosition, this.size);
    }, BoxParser.VisualSampleEntry.prototype.write = function(stream) {
        this.writeHeader(stream), this.size += 70, stream.writeUint16(0), stream.writeUint16(0), 
        stream.writeUint32(0), stream.writeUint32(0), stream.writeUint32(0), stream.writeUint16(this.width), 
        stream.writeUint16(this.height), stream.writeUint32(this.horizresolution), stream.writeUint32(this.vertresolution), 
        stream.writeUint32(0), stream.writeUint16(this.frame_count), stream.writeUint8(Math.min(31, this.compressorname.length)), 
        stream.writeString(this.compressorname, null, 31), stream.writeUint16(this.depth), 
        stream.writeInt16(-1), this.writeFooter(stream);
    }, BoxParser.AudioSampleEntry.prototype.write = function(stream) {
        this.writeHeader(stream), this.size += 20, stream.writeUint32(0), stream.writeUint32(0), 
        stream.writeUint16(this.channel_count), stream.writeUint16(this.samplesize), stream.writeUint16(0), 
        stream.writeUint16(0), stream.writeUint32(this.samplerate << 16), this.writeFooter(stream);
    }, BoxParser.stppSampleEntry.prototype.write = function(stream) {
        this.writeHeader(stream), this.size += this.namespace.length + 1 + this.schema_location.length + 1 + this.auxiliary_mime_types.length + 1, 
        stream.writeCString(this.namespace), stream.writeCString(this.schema_location), 
        stream.writeCString(this.auxiliary_mime_types), this.writeFooter(stream);
    }, BoxParser.SampleGroupEntry.prototype.write = function(stream) {
        stream.writeUint8Array(this.data);
    }, BoxParser.sbgpBox.prototype.write = function(stream) {
        this.version = 1, this.flags = 0, this.size = 12 + 8 * this.entries.length, this.writeHeader(stream), 
        stream.writeString(this.grouping_type, null, 4), stream.writeUint32(this.grouping_type_parameter), 
        stream.writeUint32(this.entries.length);
        for (var i = 0; i < this.entries.length; i++) {
            var entry = this.entries[i];
            stream.writeInt32(entry.sample_count), stream.writeInt32(entry.group_description_index);
        }
    }, BoxParser.sgpdBox.prototype.write = function(stream) {
        var i, entry;
        for (this.flags = 0, this.size = 12, i = 0; i < this.entries.length; i++) entry = this.entries[i], 
        1 === this.version && (0 === this.default_length && (this.size += 4), this.size += entry.data.length);
        for (this.writeHeader(stream), stream.writeString(this.grouping_type, null, 4), 
        1 === this.version && stream.writeUint32(this.default_length), this.version >= 2 && stream.writeUint32(this.default_sample_description_index), 
        stream.writeUint32(this.entries.length), i = 0; i < this.entries.length; i++) entry = this.entries[i], 
        1 === this.version && 0 === this.default_length && stream.writeUint32(entry.description_length), 
        entry.write(stream);
    }, BoxParser.sidxBox.prototype.write = function(stream) {
        this.version = 0, this.flags = 0, this.size = 20 + 12 * this.references.length, 
        this.writeHeader(stream), stream.writeUint32(this.reference_ID), stream.writeUint32(this.timescale), 
        stream.writeUint32(this.earliest_presentation_time), stream.writeUint32(this.first_offset), 
        stream.writeUint16(0), stream.writeUint16(this.references.length);
        for (var i = 0; i < this.references.length; i++) {
            var ref = this.references[i];
            stream.writeUint32(ref.reference_type << 31 | ref.referenced_size), stream.writeUint32(ref.subsegment_duration), 
            stream.writeUint32(ref.starts_with_SAP << 31 | ref.SAP_type << 28 | ref.SAP_delta_time);
        }
    }, BoxParser.stcoBox.prototype.write = function(stream) {
        this.version = 0, this.flags = 0, this.size = 4 + 4 * this.chunk_offsets.length, 
        this.writeHeader(stream), stream.writeUint32(this.chunk_offsets.length), stream.writeUint32Array(this.chunk_offsets);
    }, BoxParser.stscBox.prototype.write = function(stream) {
        var i;
        for (this.version = 0, this.flags = 0, this.size = 4 + 12 * this.first_chunk.length, 
        this.writeHeader(stream), stream.writeUint32(this.first_chunk.length), i = 0; i < this.first_chunk.length; i++) stream.writeUint32(this.first_chunk[i]), 
        stream.writeUint32(this.samples_per_chunk[i]), stream.writeUint32(this.sample_description_index[i]);
    }, BoxParser.stsdBox.prototype.write = function(stream) {
        var i;
        for (this.version = 0, this.flags = 0, this.size = 0, this.writeHeader(stream), 
        stream.writeUint32(this.entries.length), this.size += 4, i = 0; i < this.entries.length; i++) this.entries[i].write(stream), 
        this.size += this.entries[i].size;
        Log.debug("BoxWriter", "Adjusting box " + this.type + " with new size " + this.size), 
        stream.adjustUint32(this.sizePosition, this.size);
    }, BoxParser.stshBox.prototype.write = function(stream) {
        var i;
        for (this.version = 0, this.flags = 0, this.size = 4 + 8 * this.shadowed_sample_numbers.length, 
        this.writeHeader(stream), stream.writeUint32(this.shadowed_sample_numbers.length), 
        i = 0; i < this.shadowed_sample_numbers.length; i++) stream.writeUint32(this.shadowed_sample_numbers[i]), 
        stream.writeUint32(this.sync_sample_numbers[i]);
    }, BoxParser.stssBox.prototype.write = function(stream) {
        this.version = 0, this.flags = 0, this.size = 4 + 4 * this.sample_numbers.length, 
        this.writeHeader(stream), stream.writeUint32(this.sample_numbers.length), stream.writeUint32Array(this.sample_numbers);
    }, BoxParser.stszBox.prototype.write = function(stream) {
        var i, constant = !0;
        if (this.version = 0, this.flags = 0, this.sample_sizes.length > 0) for (i = 0; i + 1 < this.sample_sizes.length; ) {
            if (this.sample_sizes[i + 1] !== this.sample_sizes[0]) {
                constant = !1;
                break;
            }
            i++;
        } else constant = !1;
        this.size = 8, constant || (this.size += 4 * this.sample_sizes.length), this.writeHeader(stream), 
        constant ? stream.writeUint32(this.sample_sizes[0]) : stream.writeUint32(0), stream.writeUint32(this.sample_sizes.length), 
        constant || stream.writeUint32Array(this.sample_sizes);
    }, BoxParser.sttsBox.prototype.write = function(stream) {
        var i;
        for (this.version = 0, this.flags = 0, this.size = 4 + 8 * this.sample_counts.length, 
        this.writeHeader(stream), stream.writeUint32(this.sample_counts.length), i = 0; i < this.sample_counts.length; i++) stream.writeUint32(this.sample_counts[i]), 
        stream.writeUint32(this.sample_deltas[i]);
    }, BoxParser.tfdtBox.prototype.write = function(stream) {
        this.version = 0, this.flags = 0, this.size = 4, 1 === this.version && (this.size += 4), 
        this.writeHeader(stream), 1 === this.version ? stream.writeUint64(this.baseMediaDecodeTime) : stream.writeUint32(this.baseMediaDecodeTime);
    }, BoxParser.tfhdBox.prototype.write = function(stream) {
        this.version = 0, this.size = 4, this.flags & BoxParser.TFHD_FLAG_BASE_DATA_OFFSET && (this.size += 8), 
        this.flags & BoxParser.TFHD_FLAG_SAMPLE_DESC && (this.size += 4), this.flags & BoxParser.TFHD_FLAG_SAMPLE_DUR && (this.size += 4), 
        this.flags & BoxParser.TFHD_FLAG_SAMPLE_SIZE && (this.size += 4), this.flags & BoxParser.TFHD_FLAG_SAMPLE_FLAGS && (this.size += 4), 
        this.writeHeader(stream), stream.writeUint32(this.track_id), this.flags & BoxParser.TFHD_FLAG_BASE_DATA_OFFSET && stream.writeUint64(this.base_data_offset), 
        this.flags & BoxParser.TFHD_FLAG_SAMPLE_DESC && stream.writeUint32(this.default_sample_description_index), 
        this.flags & BoxParser.TFHD_FLAG_SAMPLE_DUR && stream.writeUint32(this.default_sample_duration), 
        this.flags & BoxParser.TFHD_FLAG_SAMPLE_SIZE && stream.writeUint32(this.default_sample_size), 
        this.flags & BoxParser.TFHD_FLAG_SAMPLE_FLAGS && stream.writeUint32(this.default_sample_flags);
    }, BoxParser.tkhdBox.prototype.write = function(stream) {
        this.version = 0, this.size = 80, this.writeHeader(stream), stream.writeUint32(this.creation_time), 
        stream.writeUint32(this.modification_time), stream.writeUint32(this.track_id), stream.writeUint32(0), 
        stream.writeUint32(this.duration), stream.writeUint32(0), stream.writeUint32(0), 
        stream.writeInt16(this.layer), stream.writeInt16(this.alternate_group), stream.writeInt16(this.volume << 8), 
        stream.writeUint16(0), stream.writeInt32Array(this.matrix), stream.writeUint32(this.width), 
        stream.writeUint32(this.height);
    }, BoxParser.trexBox.prototype.write = function(stream) {
        this.version = 0, this.flags = 0, this.size = 20, this.writeHeader(stream), stream.writeUint32(this.track_id), 
        stream.writeUint32(this.default_sample_description_index), stream.writeUint32(this.default_sample_duration), 
        stream.writeUint32(this.default_sample_size), stream.writeUint32(this.default_sample_flags);
    }, BoxParser.trunBox.prototype.write = function(stream) {
        this.version = 0, this.size = 4, this.flags & BoxParser.TRUN_FLAGS_DATA_OFFSET && (this.size += 4), 
        this.flags & BoxParser.TRUN_FLAGS_FIRST_FLAG && (this.size += 4), this.flags & BoxParser.TRUN_FLAGS_DURATION && (this.size += 4 * this.sample_duration.length), 
        this.flags & BoxParser.TRUN_FLAGS_SIZE && (this.size += 4 * this.sample_size.length), 
        this.flags & BoxParser.TRUN_FLAGS_FLAGS && (this.size += 4 * this.sample_flags.length), 
        this.flags & BoxParser.TRUN_FLAGS_CTS_OFFSET && (this.size += 4 * this.sample_composition_time_offset.length), 
        this.writeHeader(stream), stream.writeUint32(this.sample_count), this.flags & BoxParser.TRUN_FLAGS_DATA_OFFSET && (this.data_offset_position = stream.getPosition(), 
        stream.writeInt32(this.data_offset)), this.flags & BoxParser.TRUN_FLAGS_FIRST_FLAG && stream.writeUint32(this.first_sample_flags);
        for (var i = 0; i < this.sample_count; i++) this.flags & BoxParser.TRUN_FLAGS_DURATION && stream.writeUint32(this.sample_duration[i]), 
        this.flags & BoxParser.TRUN_FLAGS_SIZE && stream.writeUint32(this.sample_size[i]), 
        this.flags & BoxParser.TRUN_FLAGS_FLAGS && stream.writeUint32(this.sample_flags[i]), 
        this.flags & BoxParser.TRUN_FLAGS_CTS_OFFSET && (0 === this.version ? stream.writeUint32(this.sample_composition_time_offset[i]) : stream.writeInt32(this.sample_composition_time_offset[i]));
    }, BoxParser["url Box"].prototype.write = function(stream) {
        this.version = 0, this.location ? (this.flags = 0, this.size = this.location.length + 1) : (this.flags = 1, 
        this.size = 0), this.writeHeader(stream), this.location && stream.writeCString(this.location);
    }, BoxParser["urn Box"].prototype.write = function(stream) {
        this.version = 0, this.flags = 0, this.size = this.name.length + 1 + (this.location ? this.location.length + 1 : 0), 
        this.writeHeader(stream), stream.writeCString(this.name), this.location && stream.writeCString(this.location);
    }, BoxParser.vmhdBox.prototype.write = function(stream) {
        this.version = 0, this.flags = 1, this.size = 8, this.writeHeader(stream), stream.writeUint16(this.graphicsmode), 
        stream.writeUint16Array(this.opcolor);
    }, BoxParser.cttsBox.prototype.unpack = function(samples) {
        var i, j, k;
        for (k = 0, i = 0; i < this.sample_counts.length; i++) for (j = 0; j < this.sample_counts[i]; j++) samples[k].pts = samples[k].dts + this.sample_offsets[i], 
        k++;
    }, BoxParser.sttsBox.prototype.unpack = function(samples) {
        var i, j, k;
        for (k = 0, i = 0; i < this.sample_counts.length; i++) for (j = 0; j < this.sample_counts[i]; j++) samples[k].dts = 0 === k ? 0 : samples[k - 1].dts + this.sample_deltas[i], 
        k++;
    }, BoxParser.stcoBox.prototype.unpack = function(samples) {
        var i;
        for (i = 0; i < this.chunk_offsets.length; i++) samples[i].offset = this.chunk_offsets[i];
    }, BoxParser.stscBox.prototype.unpack = function(samples) {
        var i, j, k, l, m;
        for (l = 0, m = 0, i = 0; i < this.first_chunk.length; i++) for (j = 0; j < (i + 1 < this.first_chunk.length ? this.first_chunk[i + 1] : 1 / 0); j++) for (m++, 
        k = 0; k < this.samples_per_chunk[i]; k++) {
            if (!samples[l]) return;
            samples[l].description_index = this.sample_description_index[i], samples[l].chunk_index = m, 
            l++;
        }
    }, BoxParser.stszBox.prototype.unpack = function(samples) {
        var i;
        for (i = 0; i < this.sample_sizes.length; i++) samples[i].size = this.sample_sizes[i];
    }, BoxParser.DIFF_BOXES_PROP_NAMES = [ "boxes", "entries", "references", "subsamples", "items", "item_infos", "extents", "associations", "subsegments", "ranges", "seekLists", "seekPoints", "esd", "levels" ], 
    BoxParser.DIFF_PRIMITIVE_ARRAY_PROP_NAMES = [ "compatible_brands", "matrix", "opcolor", "sample_counts", "sample_counts", "sample_deltas", "first_chunk", "samples_per_chunk", "sample_sizes", "chunk_offsets", "sample_offsets", "sample_description_index", "sample_duration" ], 
    BoxParser.boxEqualFields = function(box_a, box_b) {
        if (box_a && !box_b) return !1;
        var prop;
        for (prop in box_a) if (!(BoxParser.DIFF_BOXES_PROP_NAMES.indexOf(prop) > -1 || box_a[prop] instanceof BoxParser.Box || box_b[prop] instanceof BoxParser.Box || void 0 === box_a[prop] || void 0 === box_b[prop] || "function" == typeof box_a[prop] || "function" == typeof box_b[prop] || box_a.subBoxNames && box_a.subBoxNames.indexOf(prop.slice(0, 4)) > -1 || box_b.subBoxNames && box_b.subBoxNames.indexOf(prop.slice(0, 4)) > -1 || "data" === prop || "start" === prop || "size" === prop || "creation_time" === prop || "modification_time" === prop || BoxParser.DIFF_PRIMITIVE_ARRAY_PROP_NAMES.indexOf(prop) > -1 || box_a[prop] === box_b[prop])) return !1;
        return !0;
    }, BoxParser.boxEqual = function(box_a, box_b) {
        if (!BoxParser.boxEqualFields(box_a, box_b)) return !1;
        for (var j = 0; j < BoxParser.DIFF_BOXES_PROP_NAMES.length; j++) {
            var name = BoxParser.DIFF_BOXES_PROP_NAMES[j];
            if (box_a[name] && box_b[name] && !BoxParser.boxEqual(box_a[name], box_b[name])) return !1;
        }
        return !0;
    };
    var VTTin4Parser = function() {};
    VTTin4Parser.prototype.parseSample = function(data) {
        var cues, cue, stream = new MP4BoxStream(data.buffer);
        for (cues = []; !stream.isEos(); ) (cue = BoxParser.parseOneBox(stream, !1)).code === BoxParser.OK && "vttc" === cue.box.type && cues.push(cue.box);
        return cues;
    }, VTTin4Parser.prototype.getText = function(startTime, endTime, data) {
        function pad(n, width, z) {
            return z = z || "0", (n += "").length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        }
        function secToTimestamp(insec) {
            var h = Math.floor(insec / 3600), m = Math.floor((insec - 3600 * h) / 60), s = Math.floor(insec - 3600 * h - 60 * m), ms = Math.floor(1e3 * (insec - 3600 * h - 60 * m - s));
            return pad(h, 2) + ":" + pad(m, 2) + ":" + pad(s, 2) + "." + pad(ms, 3);
        }
        for (var cues = this.parseSample(data), string = "", i = 0; i < cues.length; i++) {
            var cueIn4 = cues[i];
            string += secToTimestamp(startTime) + " --\x3e " + secToTimestamp(endTime) + "\r\n", 
            string += cueIn4.payl.text;
        }
        return string;
    };
    var XMLSubtitlein4Parser = function() {};
    XMLSubtitlein4Parser.prototype.parseSample = function(sample) {
        var i, res = {
            resources: []
        }, stream = new MP4BoxStream(sample.data.buffer);
        if (sample.subsamples && 0 !== sample.subsamples.length) {
            if (res.documentString = stream.readString(sample.subsamples[0].size), sample.subsamples.length > 1) for (i = 1; i < sample.subsamples.length; i++) res.resources[i] = stream.readUint8Array(sample.subsamples[i].size);
        } else res.documentString = stream.readString(sample.data.length);
        return "undefined" != typeof DOMParser && (res.document = (new DOMParser).parseFromString(res.documentString, "application/xml")), 
        res;
    };
    var Textin4Parser = function() {};
    Textin4Parser.prototype.parseSample = function(sample) {
        return new MP4BoxStream(sample.data.buffer).readString(sample.data.length);
    }, Textin4Parser.prototype.parseConfig = function(data) {
        var stream = new MP4BoxStream(data.buffer);
        return stream.readUint32(), stream.readCString();
    }, exports.XMLSubtitlein4Parser = XMLSubtitlein4Parser, exports.Textin4Parser = Textin4Parser;
    var ISOFile = function(stream) {
        this.stream = stream || new MultiBufferStream, this.boxes = [], this.mdats = [], 
        this.moofs = [], this.isProgressive = !1, this.moovStartFound = !1, this.onMoovStart = null, 
        this.moovStartSent = !1, this.onReady = null, this.readySent = !1, this.onSegment = null, 
        this.onSamples = null, this.onError = null, this.sampleListBuilt = !1, this.fragmentedTracks = [], 
        this.extractedTracks = [], this.isFragmentationInitialized = !1, this.sampleProcessingStarted = !1, 
        this.nextMoofNumber = 0, this.itemListBuilt = !1, this.onSidx = null, this.sidxSent = !1;
    };
    ISOFile.prototype.setSegmentOptions = function(id, user, options) {
        var trak = this.getTrackById(id);
        if (trak) {
            var fragTrack = {};
            this.fragmentedTracks.push(fragTrack), fragTrack.id = id, fragTrack.user = user, 
            fragTrack.trak = trak, trak.nextSample = 0, fragTrack.segmentStream = null, fragTrack.nb_samples = 1e3, 
            fragTrack.rapAlignement = !0, options && (options.nbSamples && (fragTrack.nb_samples = options.nbSamples), 
            options.rapAlignement && (fragTrack.rapAlignement = options.rapAlignement));
        }
    }, ISOFile.prototype.unsetSegmentOptions = function(id) {
        for (var index = -1, i = 0; i < this.fragmentedTracks.length; i++) this.fragmentedTracks[i].id == id && (index = i);
        index > -1 && this.fragmentedTracks.splice(index, 1);
    }, ISOFile.prototype.setExtractionOptions = function(id, user, options) {
        var trak = this.getTrackById(id);
        if (trak) {
            var extractTrack = {};
            this.extractedTracks.push(extractTrack), extractTrack.id = id, extractTrack.user = user, 
            extractTrack.trak = trak, trak.nextSample = 0, extractTrack.nb_samples = 1e3, extractTrack.samples = [], 
            options && options.nbSamples && (extractTrack.nb_samples = options.nbSamples);
        }
    }, ISOFile.prototype.unsetExtractionOptions = function(id) {
        for (var index = -1, i = 0; i < this.extractedTracks.length; i++) this.extractedTracks[i].id == id && (index = i);
        index > -1 && this.extractedTracks.splice(index, 1);
    }, ISOFile.prototype.parse = function() {
        var ret, box;
        if (!this.restoreParsePosition || this.restoreParsePosition()) for (;;) {
            if (this.hasIncompleteMdat && this.hasIncompleteMdat()) {
                if (this.processIncompleteMdat()) continue;
                return;
            }
            if (this.saveParsePosition && this.saveParsePosition(), (ret = BoxParser.parseOneBox(this.stream, !1)).code === BoxParser.ERR_NOT_ENOUGH_DATA) {
                if (this.processIncompleteBox) {
                    if (this.processIncompleteBox(ret)) continue;
                    return;
                }
                return;
            }
            var box_type;
            switch (box_type = "uuid" !== (box = ret.box).type ? box.type : box.uuid, this.boxes.push(box), 
            box_type) {
              case "mdat":
                this.mdats.push(box);
                break;

              case "moof":
                this.moofs.push(box);
                break;

              case "moov":
                this.moovStartFound = !0, 0 === this.mdats.length && (this.isProgressive = !0);

              default:
                void 0 !== this[box_type] && Log.warn("ISOFile", "Duplicate Box of type: " + box_type + ", overriding previous occurrence"), 
                this[box_type] = box;
            }
            this.updateUsedBytes && this.updateUsedBytes(box, ret);
        }
    }, ISOFile.prototype.checkBuffer = function(ab) {
        if (null == ab) throw "Buffer must be defined and non empty";
        if (void 0 === ab.fileStart) throw "Buffer must have a fileStart property";
        return 0 === ab.byteLength ? (Log.warn("ISOFile", "Ignoring empty buffer (fileStart: " + ab.fileStart + ")"), 
        this.stream.logBufferLevel(), !1) : (Log.info("ISOFile", "Processing buffer (fileStart: " + ab.fileStart + ")"), 
        ab.usedBytes = 0, this.stream.insertBuffer(ab), this.stream.logBufferLevel(), !!this.stream.initialized() || (Log.warn("ISOFile", "Not ready to start parsing"), 
        !1));
    }, ISOFile.prototype.appendBuffer = function(ab, last) {
        var nextFileStart;
        if (this.checkBuffer(ab)) return this.parse(), this.moovStartFound && !this.moovStartSent && (this.moovStartSent = !0, 
        this.onMoovStart && this.onMoovStart()), this.moov ? (this.sampleListBuilt || (this.buildSampleLists(), 
        this.sampleListBuilt = !0), this.updateSampleLists(), this.onReady && !this.readySent && (this.readySent = !0, 
        this.onReady(this.getInfo())), this.processSamples(last), this.nextSeekPosition ? (nextFileStart = this.nextSeekPosition, 
        this.nextSeekPosition = void 0) : nextFileStart = this.nextParsePosition, this.stream.getEndFilePositionAfter && (nextFileStart = this.stream.getEndFilePositionAfter(nextFileStart))) : nextFileStart = this.nextParsePosition ? this.nextParsePosition : 0, 
        this.sidx && this.onSidx && !this.sidxSent && (this.onSidx(this.sidx), this.sidxSent = !0), 
        this.meta && (this.flattenItemInfo && !this.itemListBuilt && (this.flattenItemInfo(), 
        this.itemListBuilt = !0), this.processItems && this.processItems(this.onItem)), 
        this.stream.cleanBuffers && (Log.info("ISOFile", "Done processing buffer (fileStart: " + ab.fileStart + ") - next buffer to fetch should have a fileStart position of " + nextFileStart), 
        this.stream.logBufferLevel(), this.stream.cleanBuffers(), this.stream.logBufferLevel(!0), 
        Log.info("ISOFile", "Sample data size in memory: " + this.getAllocatedSampleDataSize())), 
        nextFileStart;
    }, ISOFile.prototype.getInfo = function() {
        var i, j, trak, track, sample_desc, movie = {}, _1904 = new Date("1904-01-01T00:00:00Z").getTime();
        if (this.moov) for (movie.hasMoov = !0, movie.duration = this.moov.mvhd.duration, 
        movie.timescale = this.moov.mvhd.timescale, movie.isFragmented = null != this.moov.mvex, 
        movie.isFragmented && this.moov.mvex.mehd && (movie.fragment_duration = this.moov.mvex.mehd.fragment_duration), 
        movie.isProgressive = this.isProgressive, movie.hasIOD = null != this.moov.iods, 
        movie.brands = [], movie.brands.push(this.ftyp.major_brand), movie.brands = movie.brands.concat(this.ftyp.compatible_brands), 
        movie.created = new Date(_1904 + 1e3 * this.moov.mvhd.creation_time), movie.modified = new Date(_1904 + 1e3 * this.moov.mvhd.modification_time), 
        movie.tracks = [], movie.audioTracks = [], movie.videoTracks = [], movie.subtitleTracks = [], 
        movie.metadataTracks = [], movie.hintTracks = [], movie.otherTracks = [], i = 0; i < this.moov.traks.length; i++) {
            if (sample_desc = (trak = this.moov.traks[i]).mdia.minf.stbl.stsd.entries[0], track = {}, 
            movie.tracks.push(track), track.id = trak.tkhd.track_id, track.name = trak.mdia.hdlr.name, 
            track.references = [], trak.tref) for (j = 0; j < trak.tref.boxes.length; j++) ref = {}, 
            track.references.push(ref), ref.type = trak.tref.boxes[j].type, ref.track_ids = trak.tref.boxes[j].track_ids;
            trak.edts && (track.edits = trak.edts.elst.entries), track.created = new Date(_1904 + 1e3 * trak.tkhd.creation_time), 
            track.modified = new Date(_1904 + 1e3 * trak.tkhd.modification_time), track.movie_duration = trak.tkhd.duration, 
            track.movie_timescale = movie.timescale, track.layer = trak.tkhd.layer, track.alternate_group = trak.tkhd.alternate_group, 
            track.volume = trak.tkhd.volume, track.matrix = trak.tkhd.matrix, track.track_width = trak.tkhd.width / 65536, 
            track.track_height = trak.tkhd.height / 65536, track.timescale = trak.mdia.mdhd.timescale, 
            track.cts_shift = trak.mdia.minf.stbl.cslg, track.duration = trak.mdia.mdhd.duration, 
            track.samples_duration = trak.samples_duration, track.codec = sample_desc.getCodec(), 
            track.kind = trak.udta && trak.udta.kinds.length ? trak.udta.kinds[0] : {
                schemeURI: "",
                value: ""
            }, track.language = trak.mdia.elng ? trak.mdia.elng.extended_language : trak.mdia.mdhd.languageString, 
            track.nb_samples = trak.samples.length, track.size = trak.samples_size, track.bitrate = 8 * track.size * track.timescale / track.samples_duration, 
            sample_desc.isAudio() ? (track.type = "audio", movie.audioTracks.push(track), track.audio = {}, 
            track.audio.sample_rate = sample_desc.getSampleRate(), track.audio.channel_count = sample_desc.getChannelCount(), 
            track.audio.sample_size = sample_desc.getSampleSize()) : sample_desc.isVideo() ? (track.type = "video", 
            movie.videoTracks.push(track), track.video = {}, track.video.width = sample_desc.getWidth(), 
            track.video.height = sample_desc.getHeight()) : sample_desc.isSubtitle() ? (track.type = "subtitles", 
            movie.subtitleTracks.push(track)) : sample_desc.isHint() ? (track.type = "metadata", 
            movie.hintTracks.push(track)) : sample_desc.isMetadata() ? (track.type = "metadata", 
            movie.metadataTracks.push(track)) : (track.type = "metadata", movie.otherTracks.push(track));
        } else movie.hasMoov = !1;
        if (movie.mime = "", movie.hasMoov && movie.tracks) {
            for (movie.videoTracks && movie.videoTracks.length > 0 ? movie.mime += 'video/mp4; codecs="' : movie.audioTracks && movie.audioTracks.length > 0 ? movie.mime += 'audio/mp4; codecs="' : movie.mime += 'application/mp4; codecs="', 
            i = 0; i < movie.tracks.length; i++) 0 !== i && (movie.mime += ","), movie.mime += movie.tracks[i].codec;
            movie.mime += '"; profiles="', movie.mime += this.ftyp.compatible_brands.join(), 
            movie.mime += '"';
        }
        return movie;
    }, ISOFile.prototype.processSamples = function(last) {
        var i, trak;
        if (this.sampleProcessingStarted) {
            if (this.isFragmentationInitialized && null !== this.onSegment) for (i = 0; i < this.fragmentedTracks.length; i++) {
                var fragTrak = this.fragmentedTracks[i];
                for (trak = fragTrak.trak; trak.nextSample < trak.samples.length && this.sampleProcessingStarted; ) {
                    Log.debug("ISOFile", "Creating media fragment on track #" + fragTrak.id + " for sample " + trak.nextSample);
                    var result = this.createFragment(fragTrak.id, trak.nextSample, fragTrak.segmentStream);
                    if (!result) break;
                    if (fragTrak.segmentStream = result, trak.nextSample++, (trak.nextSample % fragTrak.nb_samples == 0 || last && trak.nextSample >= trak.samples.length) && (Log.info("ISOFile", "Sending fragmented data on track #" + fragTrak.id + " for samples [" + Math.max(0, trak.nextSample - fragTrak.nb_samples) + "," + (trak.nextSample - 1) + "]"), 
                    Log.info("ISOFile", "Sample data size in memory: " + this.getAllocatedSampleDataSize()), 
                    this.onSegment && this.onSegment(fragTrak.id, fragTrak.user, fragTrak.segmentStream.buffer, trak.nextSample, last && trak.nextSample >= trak.samples.length), 
                    fragTrak.segmentStream = null, fragTrak !== this.fragmentedTracks[i])) break;
                }
            }
            if (null !== this.onSamples) for (i = 0; i < this.extractedTracks.length; i++) {
                var extractTrak = this.extractedTracks[i];
                for (trak = extractTrak.trak; trak.nextSample < trak.samples.length && this.sampleProcessingStarted; ) {
                    Log.debug("ISOFile", "Exporting on track #" + extractTrak.id + " sample #" + trak.nextSample);
                    var sample = this.getSample(trak, trak.nextSample);
                    if (!sample) break;
                    if (trak.nextSample++, extractTrak.samples.push(sample), (trak.nextSample % extractTrak.nb_samples == 0 || trak.nextSample >= trak.samples.length) && (Log.debug("ISOFile", "Sending samples on track #" + extractTrak.id + " for sample " + trak.nextSample), 
                    this.onSamples && this.onSamples(extractTrak.id, extractTrak.user, extractTrak.samples), 
                    extractTrak.samples = [], extractTrak !== this.extractedTracks[i])) break;
                }
            }
        }
    }, ISOFile.prototype.getBox = function(type) {
        var result = this.getBoxes(type, !0);
        return result.length ? result[0] : null;
    }, ISOFile.prototype.getBoxes = function(type, returnEarly) {
        var result = [];
        return ISOFile._sweep.call(this, type, result, returnEarly), result;
    }, ISOFile._sweep = function(type, result, returnEarly) {
        for (var box in this.type && this.type == type && result.push(this), this.boxes) {
            if (result.length && returnEarly) return;
            ISOFile._sweep.call(this.boxes[box], type, result, returnEarly);
        }
    }, ISOFile.prototype.getTrackSamplesInfo = function(track_id) {
        var track = this.getTrackById(track_id);
        return track ? track.samples : void 0;
    }, ISOFile.prototype.getTrackSample = function(track_id, number) {
        var track = this.getTrackById(track_id);
        return this.getSample(track, number);
    }, ISOFile.prototype.releaseUsedSamples = function(id, sampleNum) {
        var size = 0, trak = this.getTrackById(id);
        trak.lastValidSample || (trak.lastValidSample = 0);
        for (var i = trak.lastValidSample; i < sampleNum; i++) size += this.releaseSample(trak, i);
        Log.info("ISOFile", "Track #" + id + " released samples up to " + sampleNum + " (released size: " + size + ", remaining: " + this.samplesDataSize + ")"), 
        trak.lastValidSample = sampleNum;
    }, ISOFile.prototype.start = function() {
        this.sampleProcessingStarted = !0, this.processSamples(!1);
    }, ISOFile.prototype.stop = function() {
        this.sampleProcessingStarted = !1;
    }, ISOFile.prototype.flush = function() {
        Log.info("ISOFile", "Flushing remaining samples"), this.updateSampleLists(), this.processSamples(!0), 
        this.stream.cleanBuffers(), this.stream.logBufferLevel(!0);
    }, ISOFile.prototype.seekTrack = function(time, useRap, trak) {
        var j, sample, seek_offset, timescale, rap_seek_sample_num = 0, seek_sample_num = 0;
        if (0 === trak.samples.length) return Log.info("ISOFile", "No sample in track, cannot seek! Using time " + Log.getDurationString(0, 1) + " and offset: 0"), 
        {
            offset: 0,
            time: 0
        };
        for (j = 0; j < trak.samples.length; j++) {
            if (sample = trak.samples[j], 0 === j) seek_sample_num = 0, timescale = sample.timescale; else if (sample.cts > time * sample.timescale) {
                seek_sample_num = j - 1;
                break;
            }
            useRap && sample.is_sync && (rap_seek_sample_num = j);
        }
        for (useRap && (seek_sample_num = rap_seek_sample_num), time = trak.samples[seek_sample_num].cts, 
        trak.nextSample = seek_sample_num; trak.samples[seek_sample_num].alreadyRead === trak.samples[seek_sample_num].size && trak.samples[seek_sample_num + 1]; ) seek_sample_num++;
        return seek_offset = trak.samples[seek_sample_num].offset + trak.samples[seek_sample_num].alreadyRead, 
        Log.info("ISOFile", "Seeking to " + (useRap ? "RAP" : "") + " sample #" + trak.nextSample + " on track " + trak.tkhd.track_id + ", time " + Log.getDurationString(time, timescale) + " and offset: " + seek_offset), 
        {
            offset: seek_offset,
            time: time / timescale
        };
    }, ISOFile.prototype.seek = function(time, useRap) {
        var trak, trak_seek_info, i, moov = this.moov, seek_info = {
            offset: 1 / 0,
            time: 1 / 0
        };
        if (this.moov) {
            for (i = 0; i < moov.traks.length; i++) trak = moov.traks[i], (trak_seek_info = this.seekTrack(time, useRap, trak)).offset < seek_info.offset && (seek_info.offset = trak_seek_info.offset), 
            trak_seek_info.time < seek_info.time && (seek_info.time = trak_seek_info.time);
            return Log.info("ISOFile", "Seeking at time " + Log.getDurationString(seek_info.time, 1) + " needs a buffer with a fileStart position of " + seek_info.offset), 
            seek_info.offset === 1 / 0 ? seek_info = {
                offset: this.nextParsePosition,
                time: 0
            } : seek_info.offset = this.stream.getEndFilePositionAfter(seek_info.offset), Log.info("ISOFile", "Adjusted seek position (after checking data already in buffer): " + seek_info.offset), 
            seek_info;
        }
        throw "Cannot seek: moov not received!";
    }, ISOFile.prototype.equal = function(b) {
        for (var box_index = 0; box_index < this.boxes.length && box_index < b.boxes.length; ) {
            var a_box = this.boxes[box_index], b_box = b.boxes[box_index];
            if (!BoxParser.boxEqual(a_box, b_box)) return !1;
            box_index++;
        }
        return !0;
    }, exports.ISOFile = ISOFile, ISOFile.prototype.lastBoxStartPosition = 0, ISOFile.prototype.parsingMdat = null, 
    ISOFile.prototype.nextParsePosition = 0, ISOFile.prototype.discardMdatData = !1, 
    ISOFile.prototype.processIncompleteBox = function(ret) {
        var box;
        return "mdat" === ret.type ? (box = new BoxParser[ret.type + "Box"](ret.size), this.parsingMdat = box, 
        this.boxes.push(box), this.mdats.push(box), box.start = ret.start, box.hdr_size = ret.hdr_size, 
        this.stream.addUsedBytes(box.hdr_size), this.lastBoxStartPosition = box.start + box.size, 
        this.stream.seek(box.start + box.size, !1, this.discardMdatData) ? (this.parsingMdat = null, 
        !0) : (this.moovStartFound ? this.nextParsePosition = this.stream.findEndContiguousBuf() : this.nextParsePosition = box.start + box.size, 
        !1)) : ("moov" === ret.type && (this.moovStartFound = !0, 0 === this.mdats.length && (this.isProgressive = !0)), 
        this.stream.mergeNextBuffer && this.stream.mergeNextBuffer() ? (this.nextParsePosition = this.stream.getEndPosition(), 
        !0) : (ret.type ? this.moovStartFound ? this.nextParsePosition = this.stream.getEndPosition() : this.nextParsePosition = this.stream.getPosition() + ret.size : this.nextParsePosition = this.stream.getEndPosition(), 
        !1));
    }, ISOFile.prototype.hasIncompleteMdat = function() {
        return null !== this.parsingMdat;
    }, ISOFile.prototype.processIncompleteMdat = function() {
        var box;
        return box = this.parsingMdat, this.stream.seek(box.start + box.size, !1, this.discardMdatData) ? (Log.debug("ISOFile", "Found 'mdat' end in buffered data"), 
        this.parsingMdat = null, !0) : (this.nextParsePosition = this.stream.findEndContiguousBuf(), 
        !1);
    }, ISOFile.prototype.restoreParsePosition = function() {
        return this.stream.seek(this.lastBoxStartPosition, !0, this.discardMdatData);
    }, ISOFile.prototype.saveParsePosition = function() {
        this.lastBoxStartPosition = this.stream.getPosition();
    }, ISOFile.prototype.updateUsedBytes = function(box, ret) {
        this.stream.addUsedBytes && ("mdat" === box.type ? (this.stream.addUsedBytes(box.hdr_size), 
        this.discardMdatData && this.stream.addUsedBytes(box.size - box.hdr_size)) : this.stream.addUsedBytes(box.size));
    }, ISOFile.prototype.add = BoxParser.Box.prototype.add, ISOFile.prototype.addBox = BoxParser.Box.prototype.addBox, 
    ISOFile.prototype.init = function(_options) {
        var options = _options || {}, moov = (this.add("ftyp").set("major_brand", options.brands && options.brands[0] || "iso4").set("minor_version", 0).set("compatible_brands", options.brands || [ "iso4" ]), 
        this.add("moov"));
        return moov.add("mvhd").set("timescale", options.timescale || 600).set("rate", options.rate || 1).set("creation_time", 0).set("modification_time", 0).set("duration", options.duration || 0).set("volume", 1).set("matrix", [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ]).set("next_track_id", 1), 
        moov.add("mvex"), this;
    }, ISOFile.prototype.addTrack = function(_options) {
        this.moov || this.init(_options);
        var options = _options || {};
        options.width = options.width || 320, options.height = options.height || 320, options.id = options.id || this.moov.mvhd.next_track_id, 
        options.type = options.type || "avc1";
        var trak = this.moov.add("trak");
        this.moov.mvhd.next_track_id = options.id + 1, trak.add("tkhd").set("flags", BoxParser.TKHD_FLAG_ENABLED | BoxParser.TKHD_FLAG_IN_MOVIE | BoxParser.TKHD_FLAG_IN_PREVIEW).set("creation_time", 0).set("modification_time", 0).set("track_id", options.id).set("duration", options.duration || 0).set("layer", options.layer || 0).set("alternate_group", 0).set("volume", 1).set("matrix", [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ]).set("width", options.width).set("height", options.height);
        var mdia = trak.add("mdia");
        mdia.add("mdhd").set("creation_time", 0).set("modification_time", 0).set("timescale", options.timescale || 1).set("duration", options.media_duration || 0).set("language", options.language || 0), 
        mdia.add("hdlr").set("handler", options.hdlr || "vide").set("name", options.name || "Track created with MP4Box.js"), 
        mdia.add("elng").set("extended_language", options.language || "fr-FR");
        var minf = mdia.add("minf");
        if (void 0 !== BoxParser[options.type + "SampleEntry"]) {
            var sample_description_entry = new BoxParser[options.type + "SampleEntry"];
            sample_description_entry.data_reference_index = 1;
            var media_type = "";
            for (var mediaType in BoxParser.sampleEntryCodes) for (var codes = BoxParser.sampleEntryCodes[mediaType], i = 0; i < codes.length; i++) if (codes.indexOf(options.type) > -1) {
                media_type = mediaType;
                break;
            }
            switch (media_type) {
              case "Visual":
                minf.add("vmhd").set("graphicsmode", 0).set("opcolor", [ 0, 0, 0 ]), sample_description_entry.set("width", options.width).set("height", options.height).set("horizresolution", 72 << 16).set("vertresolution", 72 << 16).set("frame_count", 1).set("compressorname", options.type + " Compressor").set("depth", 24);
                break;

              case "Audio":
                minf.add("smhd").set("balance", options.balance || 0), sample_description_entry.set("channel_count", options.channel_count || 2).set("samplesize", options.samplesize || 16).set("samplerate", options.samplerate || 65536);
                break;

              case "Hint":
                minf.add("hmhd");
                break;

              case "Subtitle":
                minf.add("sthd"), "stpp" === options.type && sample_description_entry.set("namespace", options.namespace || "nonamespace").set("schema_location", options.schema_location || "").set("auxiliary_mime_types", options.auxiliary_mime_types || "");
                break;

              default:
                minf.add("nmhd");
            }
            options.description && sample_description_entry.addBox(options.description), minf.add("dinf").add("dref").addEntry((new BoxParser["url Box"]).set("flags", 1));
            var stbl = minf.add("stbl");
            return stbl.add("stsd").addEntry(sample_description_entry), stbl.add("stts").set("sample_counts", []).set("sample_deltas", []), 
            stbl.add("stsc").set("first_chunk", []).set("samples_per_chunk", []).set("sample_description_index", []), 
            stbl.add("stco").set("chunk_offsets", []), stbl.add("stsz").set("sample_sizes", []), 
            this.moov.mvex.add("trex").set("track_id", options.id).set("default_sample_description_index", options.default_sample_description_index || 1).set("default_sample_duration", options.default_sample_duration || 0).set("default_sample_size", options.default_sample_size || 0).set("default_sample_flags", options.default_sample_flags || 0), 
            this.buildTrakSampleLists(trak), options.id;
        }
    }, BoxParser.Box.prototype.computeSize = function(stream_) {
        var stream = stream_ || new DataStream;
        stream.endianness = DataStream.BIG_ENDIAN, this.write(stream);
    }, ISOFile.prototype.addSample = function(track_id, data, _options) {
        var options = _options || {}, sample = {}, trak = this.getTrackById(track_id);
        if (null !== trak) {
            sample.number = trak.samples.length, sample.track_id = trak.tkhd.track_id, sample.timescale = trak.mdia.mdhd.timescale, 
            sample.description_index = options.sample_description_index ? options.sample_description_index - 1 : 0, 
            sample.description = trak.mdia.minf.stbl.stsd.entries[sample.description_index], 
            sample.data = data, sample.size = data.length, sample.alreadyRead = sample.size, 
            sample.duration = options.duration || 1, sample.cts = options.cts || 0, sample.dts = options.dts || 0, 
            sample.is_sync = options.is_sync || !1, sample.is_leading = options.is_leading || 0, 
            sample.depends_on = options.depends_on || 0, sample.is_depended_on = options.is_depended_on || 0, 
            sample.has_redundancy = options.has_redundancy || 0, sample.degradation_priority = options.degradation_priority || 0, 
            sample.offset = 0, sample.subsamples = options.subsamples, trak.samples.push(sample), 
            trak.samples_size += sample.size, trak.samples_duration += sample.duration, this.processSamples();
            var moof = ISOFile.createSingleSampleMoof(sample);
            return this.addBox(moof), moof.computeSize(), moof.trafs[0].truns[0].data_offset = moof.size + 8, 
            this.add("mdat").data = data, sample;
        }
    }, ISOFile.createSingleSampleMoof = function(sample) {
        var moof = new BoxParser.moofBox;
        moof.add("mfhd").set("sequence_number", this.nextMoofNumber), this.nextMoofNumber++;
        var traf = moof.add("traf");
        return traf.add("tfhd").set("track_id", sample.track_id).set("flags", BoxParser.TFHD_FLAG_DEFAULT_BASE_IS_MOOF), 
        traf.add("tfdt").set("baseMediaDecodeTime", sample.dts), traf.add("trun").set("flags", BoxParser.TRUN_FLAGS_DATA_OFFSET | BoxParser.TRUN_FLAGS_DURATION | BoxParser.TRUN_FLAGS_SIZE | BoxParser.TRUN_FLAGS_FLAGS | BoxParser.TRUN_FLAGS_CTS_OFFSET).set("data_offset", 0).set("first_sample_flags", 0).set("sample_count", 1).set("sample_duration", [ sample.duration ]).set("sample_size", [ sample.size ]).set("sample_flags", [ 0 ]).set("sample_composition_time_offset", [ sample.cts - sample.dts ]), 
        moof;
    }, ISOFile.prototype.lastMoofIndex = 0, ISOFile.prototype.samplesDataSize = 0, ISOFile.prototype.resetTables = function() {
        var i, trak, stsc, stts, ctts, stss;
        for (this.initial_duration = this.moov.mvhd.duration, this.moov.mvhd.duration = 0, 
        i = 0; i < this.moov.traks.length; i++) {
            (trak = this.moov.traks[i]).tkhd.duration = 0, trak.mdia.mdhd.duration = 0, (trak.mdia.minf.stbl.stco || trak.mdia.minf.stbl.co64).chunk_offsets = [], 
            (stsc = trak.mdia.minf.stbl.stsc).first_chunk = [], stsc.samples_per_chunk = [], 
            stsc.sample_description_index = [], (trak.mdia.minf.stbl.stsz || trak.mdia.minf.stbl.stz2).sample_sizes = [], 
            (stts = trak.mdia.minf.stbl.stts).sample_counts = [], stts.sample_deltas = [], (ctts = trak.mdia.minf.stbl.ctts) && (ctts.sample_counts = [], 
            ctts.sample_offsets = []), stss = trak.mdia.minf.stbl.stss;
            var k = trak.mdia.minf.stbl.boxes.indexOf(stss);
            -1 != k && (trak.mdia.minf.stbl.boxes[k] = null);
        }
    }, ISOFile.initSampleGroups = function(trak, traf, sbgps, trak_sgpds, traf_sgpds) {
        var l, k, sample_group_info, sample_group_key;
        function SampleGroupInfo(_type, _parameter, _sbgp) {
            this.grouping_type = _type, this.grouping_type_parameter = _parameter, this.sbgp = _sbgp, 
            this.last_sample_in_run = -1, this.entry_index = -1;
        }
        for (traf && (traf.sample_groups_info = []), trak.sample_groups_info || (trak.sample_groups_info = []), 
        k = 0; k < sbgps.length; k++) {
            for (sample_group_key = sbgps[k].grouping_type + "/" + sbgps[k].grouping_type_parameter, 
            sample_group_info = new SampleGroupInfo(sbgps[k].grouping_type, sbgps[k].grouping_type_parameter, sbgps[k]), 
            traf && (traf.sample_groups_info[sample_group_key] = sample_group_info), trak.sample_groups_info[sample_group_key] || (trak.sample_groups_info[sample_group_key] = sample_group_info), 
            l = 0; l < trak_sgpds.length; l++) trak_sgpds[l].grouping_type === sbgps[k].grouping_type && (sample_group_info.description = trak_sgpds[l], 
            sample_group_info.description.used = !0);
            if (traf_sgpds) for (l = 0; l < traf_sgpds.length; l++) traf_sgpds[l].grouping_type === sbgps[k].grouping_type && (sample_group_info.fragment_description = traf_sgpds[l], 
            sample_group_info.fragment_description.used = !0, sample_group_info.is_fragment = !0);
        }
        if (traf) {
            if (traf_sgpds) for (k = 0; k < traf_sgpds.length; k++) !traf_sgpds[k].used && traf_sgpds[k].version >= 2 && (sample_group_key = traf_sgpds[k].grouping_type + "/0", 
            (sample_group_info = new SampleGroupInfo(traf_sgpds[k].grouping_type, 0)).is_fragment = !0, 
            traf.sample_groups_info[sample_group_key] || (traf.sample_groups_info[sample_group_key] = sample_group_info));
        } else for (k = 0; k < trak_sgpds.length; k++) !trak_sgpds[k].used && trak_sgpds[k].version >= 2 && (sample_group_key = trak_sgpds[k].grouping_type + "/0", 
        sample_group_info = new SampleGroupInfo(trak_sgpds[k].grouping_type, 0), trak.sample_groups_info[sample_group_key] || (trak.sample_groups_info[sample_group_key] = sample_group_info));
    }, ISOFile.setSampleGroupProperties = function(trak, sample, sample_number, sample_groups_info) {
        var k, index;
        for (k in sample.sample_groups = [], sample_groups_info) {
            var description;
            sample.sample_groups[k] = {}, sample.sample_groups[k].grouping_type = sample_groups_info[k].grouping_type, 
            sample.sample_groups[k].grouping_type_parameter = sample_groups_info[k].grouping_type_parameter, 
            sample_number >= sample_groups_info[k].last_sample_in_run && (sample_groups_info[k].last_sample_in_run < 0 && (sample_groups_info[k].last_sample_in_run = 0), 
            sample_groups_info[k].entry_index++, sample_groups_info[k].entry_index <= sample_groups_info[k].sbgp.entries.length - 1 && (sample_groups_info[k].last_sample_in_run += sample_groups_info[k].sbgp.entries[sample_groups_info[k].entry_index].sample_count)), 
            sample_groups_info[k].entry_index <= sample_groups_info[k].sbgp.entries.length - 1 ? sample.sample_groups[k].group_description_index = sample_groups_info[k].sbgp.entries[sample_groups_info[k].entry_index].group_description_index : sample.sample_groups[k].group_description_index = -1, 
            0 !== sample.sample_groups[k].group_description_index && (description = sample_groups_info[k].fragment_description ? sample_groups_info[k].fragment_description : sample_groups_info[k].description, 
            sample.sample_groups[k].group_description_index > 0 ? (index = sample.sample_groups[k].group_description_index > 65535 ? (sample.sample_groups[k].group_description_index >> 16) - 1 : sample.sample_groups[k].group_description_index - 1, 
            description && index >= 0 && (sample.sample_groups[k].description = description.entries[index])) : description && description.version >= 2 && description.default_group_description_index > 0 && (sample.sample_groups[k].description = description.entries[description.default_group_description_index - 1]));
        }
    }, ISOFile.process_sdtp = function(sdtp, sample, number) {
        sample && (sdtp ? (sample.is_leading = sdtp.is_leading[number], sample.depends_on = sdtp.sample_depends_on[number], 
        sample.is_depended_on = sdtp.sample_is_depended_on[number], sample.has_redundancy = sdtp.sample_has_redundancy[number]) : (sample.is_leading = 0, 
        sample.depends_on = 0, sample.is_depended_on = 0, sample.has_redundancy = 0));
    }, ISOFile.prototype.buildSampleLists = function() {
        var i;
        for (i = 0; i < this.moov.traks.length; i++) trak = this.moov.traks[i], this.buildTrakSampleLists(trak);
    }, ISOFile.prototype.buildTrakSampleLists = function(trak) {
        var j, stco, stsc, stsz, stts, ctts, stss, stsd, subs, sbgps, sgpds, stdp, chunk_run_index, chunk_index, last_chunk_in_run, offset_in_chunk, last_sample_in_chunk, last_sample_in_stts_run, stts_run_index, last_sample_in_ctts_run, ctts_run_index, last_stss_index, subs_entry_index, last_subs_sample_index;
        if (trak.samples = [], trak.samples_duration = 0, trak.samples_size = 0, stco = trak.mdia.minf.stbl.stco || trak.mdia.minf.stbl.co64, 
        stsc = trak.mdia.minf.stbl.stsc, stsz = trak.mdia.minf.stbl.stsz || trak.mdia.minf.stbl.stz2, 
        stts = trak.mdia.minf.stbl.stts, ctts = trak.mdia.minf.stbl.ctts, stss = trak.mdia.minf.stbl.stss, 
        stsd = trak.mdia.minf.stbl.stsd, subs = trak.mdia.minf.stbl.subs, stdp = trak.mdia.minf.stbl.stdp, 
        sbgps = trak.mdia.minf.stbl.sbgps, sgpds = trak.mdia.minf.stbl.sgpds, last_sample_in_stts_run = -1, 
        stts_run_index = -1, last_sample_in_ctts_run = -1, ctts_run_index = -1, last_stss_index = 0, 
        subs_entry_index = 0, last_subs_sample_index = 0, ISOFile.initSampleGroups(trak, null, sbgps, sgpds), 
        void 0 !== stsz) {
            for (j = 0; j < stsz.sample_sizes.length; j++) {
                var sample = {};
                sample.number = j, sample.track_id = trak.tkhd.track_id, sample.timescale = trak.mdia.mdhd.timescale, 
                sample.alreadyRead = 0, trak.samples[j] = sample, sample.size = stsz.sample_sizes[j], 
                trak.samples_size += sample.size, 0 === j ? (chunk_index = 1, chunk_run_index = 0, 
                sample.chunk_index = chunk_index, sample.chunk_run_index = chunk_run_index, last_sample_in_chunk = stsc.samples_per_chunk[chunk_run_index], 
                offset_in_chunk = 0, last_chunk_in_run = chunk_run_index + 1 < stsc.first_chunk.length ? stsc.first_chunk[chunk_run_index + 1] - 1 : 1 / 0) : j < last_sample_in_chunk ? (sample.chunk_index = chunk_index, 
                sample.chunk_run_index = chunk_run_index) : (chunk_index++, sample.chunk_index = chunk_index, 
                offset_in_chunk = 0, chunk_index <= last_chunk_in_run || (last_chunk_in_run = 1 + ++chunk_run_index < stsc.first_chunk.length ? stsc.first_chunk[chunk_run_index + 1] - 1 : 1 / 0), 
                sample.chunk_run_index = chunk_run_index, last_sample_in_chunk += stsc.samples_per_chunk[chunk_run_index]), 
                sample.description_index = stsc.sample_description_index[sample.chunk_run_index] - 1, 
                sample.description = stsd.entries[sample.description_index], sample.offset = stco.chunk_offsets[sample.chunk_index - 1] + offset_in_chunk, 
                offset_in_chunk += sample.size, j > last_sample_in_stts_run && (stts_run_index++, 
                last_sample_in_stts_run < 0 && (last_sample_in_stts_run = 0), last_sample_in_stts_run += stts.sample_counts[stts_run_index]), 
                j > 0 ? (trak.samples[j - 1].duration = stts.sample_deltas[stts_run_index], trak.samples_duration += trak.samples[j - 1].duration, 
                sample.dts = trak.samples[j - 1].dts + trak.samples[j - 1].duration) : sample.dts = 0, 
                ctts ? (j >= last_sample_in_ctts_run && (ctts_run_index++, last_sample_in_ctts_run < 0 && (last_sample_in_ctts_run = 0), 
                last_sample_in_ctts_run += ctts.sample_counts[ctts_run_index]), sample.cts = trak.samples[j].dts + ctts.sample_offsets[ctts_run_index]) : sample.cts = sample.dts, 
                stss ? (j == stss.sample_numbers[last_stss_index] - 1 ? (sample.is_sync = !0, last_stss_index++) : (sample.is_sync = !1, 
                sample.degradation_priority = 0), subs && subs.entries[subs_entry_index].sample_delta + last_subs_sample_index == j + 1 && (sample.subsamples = subs.entries[subs_entry_index].subsamples, 
                last_subs_sample_index += subs.entries[subs_entry_index].sample_delta, subs_entry_index++)) : sample.is_sync = !0, 
                ISOFile.process_sdtp(trak.mdia.minf.stbl.sdtp, sample, sample.number), sample.degradation_priority = stdp ? stdp.priority[j] : 0, 
                subs && subs.entries[subs_entry_index].sample_delta + last_subs_sample_index == j && (sample.subsamples = subs.entries[subs_entry_index].subsamples, 
                last_subs_sample_index += subs.entries[subs_entry_index].sample_delta), (sbgps.length > 0 || sgpds.length > 0) && ISOFile.setSampleGroupProperties(trak, sample, j, trak.sample_groups_info);
            }
            j > 0 && (trak.samples[j - 1].duration = Math.max(trak.mdia.mdhd.duration - trak.samples[j - 1].dts, 0), 
            trak.samples_duration += trak.samples[j - 1].duration);
        }
    }, ISOFile.prototype.updateSampleLists = function() {
        var i, j, k, default_sample_description_index, default_sample_duration, default_sample_size, default_sample_flags, last_run_position, box, moof, traf, trak, trex, sample, sample_flags;
        if (void 0 !== this.moov) for (;this.lastMoofIndex < this.moofs.length; ) if (box = this.moofs[this.lastMoofIndex], 
        this.lastMoofIndex++, "moof" == box.type) for (moof = box, i = 0; i < moof.trafs.length; i++) {
            for (traf = moof.trafs[i], trak = this.getTrackById(traf.tfhd.track_id), trex = this.getTrexById(traf.tfhd.track_id), 
            default_sample_description_index = traf.tfhd.flags & BoxParser.TFHD_FLAG_SAMPLE_DESC ? traf.tfhd.default_sample_description_index : trex ? trex.default_sample_description_index : 1, 
            default_sample_duration = traf.tfhd.flags & BoxParser.TFHD_FLAG_SAMPLE_DUR ? traf.tfhd.default_sample_duration : trex ? trex.default_sample_duration : 0, 
            default_sample_size = traf.tfhd.flags & BoxParser.TFHD_FLAG_SAMPLE_SIZE ? traf.tfhd.default_sample_size : trex ? trex.default_sample_size : 0, 
            default_sample_flags = traf.tfhd.flags & BoxParser.TFHD_FLAG_SAMPLE_FLAGS ? traf.tfhd.default_sample_flags : trex ? trex.default_sample_flags : 0, 
            traf.sample_number = 0, traf.sbgps.length > 0 && ISOFile.initSampleGroups(trak, traf, traf.sbgps, trak.mdia.minf.stbl.sgpds, traf.sgpds), 
            j = 0; j < traf.truns.length; j++) {
                var trun = traf.truns[j];
                for (k = 0; k < trun.sample_count; k++) {
                    (sample = {}).number_in_traf = traf.sample_number, traf.sample_number++, sample.number = trak.samples.length, 
                    traf.first_sample_index = trak.samples.length, trak.samples.push(sample), sample.track_id = trak.tkhd.track_id, 
                    sample.timescale = trak.mdia.mdhd.timescale, sample.description_index = default_sample_description_index - 1, 
                    sample.description = trak.mdia.minf.stbl.stsd.entries[sample.description_index], 
                    sample.size = default_sample_size, trun.flags & BoxParser.TRUN_FLAGS_SIZE && (sample.size = trun.sample_size[k]), 
                    trak.samples_size += sample.size, sample.duration = default_sample_duration, trun.flags & BoxParser.TRUN_FLAGS_DURATION && (sample.duration = trun.sample_duration[k]), 
                    trak.samples_duration += sample.duration, trak.first_traf_merged || k > 0 ? sample.dts = trak.samples[trak.samples.length - 2].dts + trak.samples[trak.samples.length - 2].duration : (traf.tfdt ? sample.dts = traf.tfdt.baseMediaDecodeTime : sample.dts = 0, 
                    trak.first_traf_merged = !0), sample.cts = sample.dts, trun.flags & BoxParser.TRUN_FLAGS_CTS_OFFSET && (sample.cts = sample.dts + trun.sample_composition_time_offset[k]), 
                    sample_flags = default_sample_flags, trun.flags & BoxParser.TRUN_FLAGS_FLAGS ? sample_flags = trun.sample_flags[k] : 0 === k && trun.flags & BoxParser.TRUN_FLAGS_FIRST_FLAG && (sample_flags = trun.first_sample_flags), 
                    sample.is_sync = !(sample_flags >> 16 & 1), sample.is_leading = sample_flags >> 26 & 3, 
                    sample.depends_on = sample_flags >> 24 & 3, sample.is_depended_on = sample_flags >> 22 & 3, 
                    sample.has_redundancy = sample_flags >> 20 & 3, sample.degradation_priority = 65535 & sample_flags;
                    var bdo, bdop = !!(traf.tfhd.flags & BoxParser.TFHD_FLAG_BASE_DATA_OFFSET), dbim = !!(traf.tfhd.flags & BoxParser.TFHD_FLAG_DEFAULT_BASE_IS_MOOF), dop = !!(trun.flags & BoxParser.TRUN_FLAGS_DATA_OFFSET);
                    bdo = bdop ? traf.tfhd.base_data_offset : dbim || 0 === j ? moof.start : last_run_position, 
                    sample.offset = 0 === j && 0 === k ? dop ? bdo + trun.data_offset : bdo : last_run_position, 
                    last_run_position = sample.offset + sample.size, (traf.sbgps.length > 0 || traf.sgpds.length > 0 || trak.mdia.minf.stbl.sbgps.length > 0 || trak.mdia.minf.stbl.sgpds.length > 0) && ISOFile.setSampleGroupProperties(trak, sample, sample.number_in_traf, traf.sample_groups_info);
                }
            }
            if (traf.subs) {
                trak.has_fragment_subsamples = !0;
                var sample_index = traf.first_sample_index;
                for (j = 0; j < traf.subs.entries.length; j++) sample_index += traf.subs.entries[j].sample_delta, 
                (sample = trak.samples[sample_index - 1]).subsamples = traf.subs.entries[j].subsamples;
            }
        }
    }, ISOFile.prototype.getSample = function(trak, sampleNum) {
        var buffer, sample = trak.samples[sampleNum];
        if (!this.moov) return null;
        if (sample.data) {
            if (sample.alreadyRead == sample.size) return sample;
        } else sample.data = new Uint8Array(sample.size), sample.alreadyRead = 0, this.samplesDataSize += sample.size, 
        Log.debug("ISOFile", "Allocating sample #" + sampleNum + " on track #" + trak.tkhd.track_id + " of size " + sample.size + " (total: " + this.samplesDataSize + ")");
        var index = this.stream.findPosition(!0, sample.offset + sample.alreadyRead, !1);
        if (index > -1) {
            var lengthAfterStart = (buffer = this.stream.buffers[index]).byteLength - (sample.offset + sample.alreadyRead - buffer.fileStart);
            return sample.size - sample.alreadyRead <= lengthAfterStart ? (Log.debug("ISOFile", "Getting sample #" + sampleNum + " data (alreadyRead: " + sample.alreadyRead + " offset: " + (sample.offset + sample.alreadyRead - buffer.fileStart) + " read size: " + (sample.size - sample.alreadyRead) + " full size: " + sample.size + ")"), 
            DataStream.memcpy(sample.data.buffer, sample.alreadyRead, buffer, sample.offset + sample.alreadyRead - buffer.fileStart, sample.size - sample.alreadyRead), 
            buffer.usedBytes += sample.size - sample.alreadyRead, this.stream.logBufferLevel(), 
            sample.alreadyRead = sample.size, sample) : (Log.debug("ISOFile", "Getting sample #" + sampleNum + " partial data (alreadyRead: " + sample.alreadyRead + " offset: " + (sample.offset + sample.alreadyRead - buffer.fileStart) + " read size: " + lengthAfterStart + " full size: " + sample.size + ")"), 
            DataStream.memcpy(sample.data.buffer, sample.alreadyRead, buffer, sample.offset + sample.alreadyRead - buffer.fileStart, lengthAfterStart), 
            sample.alreadyRead += lengthAfterStart, buffer.usedBytes += lengthAfterStart, this.stream.logBufferLevel(), 
            null);
        }
        return null;
    }, ISOFile.prototype.releaseSample = function(trak, sampleNum) {
        var sample = trak.samples[sampleNum];
        return sample.data ? (this.samplesDataSize -= sample.size, sample.data = null, sample.alreadyRead = 0, 
        sample.size) : 0;
    }, ISOFile.prototype.getAllocatedSampleDataSize = function() {
        return this.samplesDataSize;
    }, ISOFile.prototype.getCodecs = function() {
        var i, codecs = "";
        for (i = 0; i < this.moov.traks.length; i++) i > 0 && (codecs += ","), codecs += this.moov.traks[i].mdia.minf.stbl.stsd.entries[0].getCodec();
        return codecs;
    }, ISOFile.prototype.getTrexById = function(id) {
        var i;
        if (!this.moov || !this.moov.mvex) return null;
        for (i = 0; i < this.moov.mvex.trexs.length; i++) {
            var trex = this.moov.mvex.trexs[i];
            if (trex.track_id == id) return trex;
        }
        return null;
    }, ISOFile.prototype.getTrackById = function(id) {
        if (void 0 === this.moov) return null;
        for (var j = 0; j < this.moov.traks.length; j++) {
            var trak = this.moov.traks[j];
            if (trak.tkhd.track_id == id) return trak;
        }
        return null;
    }, ISOFile.prototype.items = [], ISOFile.prototype.itemsDataSize = 0, ISOFile.prototype.flattenItemInfo = function() {
        var i, j, item, items = this.items, meta = this.meta;
        if (null != meta && void 0 !== meta.hdlr && void 0 !== meta.iinf) {
            for (i = 0; i < meta.iinf.item_infos.length; i++) (item = {}).id = meta.iinf.item_infos[i].item_ID, 
            items[item.id] = item, item.ref_to = [], item.name = meta.iinf.item_infos[i].item_name, 
            meta.iinf.item_infos[i].protection_index > 0 && (item.protection = meta.ipro.protections[meta.iinf.item_infos[i].protection_index - 1]), 
            meta.iinf.item_infos[i].item_type ? item.type = meta.iinf.item_infos[i].item_type : item.type = "mime", 
            item.content_type = meta.iinf.item_infos[i].content_type, item.content_encoding = meta.iinf.item_infos[i].content_encoding;
            if (meta.iloc) for (i = 0; i < meta.iloc.items.length; i++) {
                var itemloc = meta.iloc.items[i];
                switch (item = items[itemloc.item_ID], 0 !== itemloc.data_reference_index && (Log.warn("Item storage with reference to other files: not supported"), 
                item.source = meta.dinf.boxes[itemloc.data_reference_index - 1]), itemloc.construction_method) {
                  case 0:
                    break;

                  case 1:
                  case 2:
                    Log.warn("Item storage with construction_method : not supported");
                }
                for (item.extents = [], item.size = 0, j = 0; j < itemloc.extents.length; j++) item.extents[j] = {}, 
                item.extents[j].offset = itemloc.extents[j].extent_offset + itemloc.base_offset, 
                item.extents[j].length = itemloc.extents[j].extent_length, item.extents[j].alreadyRead = 0, 
                item.size += item.extents[j].length;
            }
            if (meta.pitm && (items[meta.pitm.item_id].primary = !0), meta.iref) for (i = 0; i < meta.iref.references.length; i++) {
                var ref = meta.iref.references[i];
                for (j = 0; j < ref.references.length; j++) items[ref.from_item_ID].ref_to.push({
                    type: ref.type,
                    id: ref.references[j]
                });
            }
            if (meta.iprp) for (var k = 0; k < meta.iprp.ipmas.length; k++) {
                var ipma = meta.iprp.ipmas[k];
                for (i = 0; i < ipma.associations.length; i++) {
                    var association = ipma.associations[i];
                    for (void 0 === (item = items[association.id]).properties && (item.properties = {}, 
                    item.properties.boxes = []), j = 0; j < association.props.length; j++) {
                        var propEntry = association.props[j];
                        if (propEntry.property_index > 0) {
                            var propbox = meta.iprp.ipco.boxes[propEntry.property_index - 1];
                            item.properties[propbox.type] = propbox, item.properties.boxes.push(propbox);
                        }
                    }
                }
            }
        }
    }, ISOFile.prototype.getItem = function(item_id) {
        var buffer, item;
        if (!this.meta) return null;
        if (!(item = this.items[item_id]).data && item.size) item.data = new Uint8Array(item.size), 
        item.alreadyRead = 0, this.itemsDataSize += item.size, Log.debug("ISOFile", "Allocating item #" + item_id + " of size " + item.size + " (total: " + this.itemsDataSize + ")"); else if (item.alreadyRead === item.size) return item;
        for (var i = 0; i < item.extents.length; i++) {
            var extent = item.extents[i];
            if (extent.alreadyRead !== extent.length) {
                var index = this.stream.findPosition(!0, extent.offset + extent.alreadyRead, !1);
                if (!(index > -1)) return null;
                var lengthAfterStart = (buffer = this.stream.buffers[index]).byteLength - (extent.offset + extent.alreadyRead - buffer.fileStart);
                if (!(extent.length - extent.alreadyRead <= lengthAfterStart)) return Log.debug("ISOFile", "Getting item #" + item_id + " extent #" + i + " partial data (alreadyRead: " + extent.alreadyRead + " offset: " + (extent.offset + extent.alreadyRead - buffer.fileStart) + " read size: " + lengthAfterStart + " full extent size: " + extent.length + " full item size: " + item.size + ")"), 
                DataStream.memcpy(item.data.buffer, item.alreadyRead, buffer, extent.offset + extent.alreadyRead - buffer.fileStart, lengthAfterStart), 
                extent.alreadyRead += lengthAfterStart, item.alreadyRead += lengthAfterStart, buffer.usedBytes += lengthAfterStart, 
                this.stream.logBufferLevel(), null;
                Log.debug("ISOFile", "Getting item #" + item_id + " extent #" + i + " data (alreadyRead: " + extent.alreadyRead + " offset: " + (extent.offset + extent.alreadyRead - buffer.fileStart) + " read size: " + (extent.length - extent.alreadyRead) + " full extent size: " + extent.length + " full item size: " + item.size + ")"), 
                DataStream.memcpy(item.data.buffer, item.alreadyRead, buffer, extent.offset + extent.alreadyRead - buffer.fileStart, extent.length - extent.alreadyRead), 
                buffer.usedBytes += extent.length - extent.alreadyRead, this.stream.logBufferLevel(), 
                extent.alreadyRead = extent.length, item.alreadyRead += extent.length;
            }
        }
        return item.alreadyRead === item.size ? item : null;
    }, ISOFile.prototype.releaseItem = function(item_id) {
        var item = this.items[item_id];
        if (item.data) {
            this.itemsDataSize -= item.size, item.data = null, item.alreadyRead = 0;
            for (var i = 0; i < item.extents.length; i++) item.extents[i].alreadyRead = 0;
            return item.size;
        }
        return 0;
    }, ISOFile.prototype.processItems = function(callback) {
        for (var i in this.items) {
            var item = this.items[i];
            this.getItem(item.id), callback && !item.sent && (callback(item), item.sent = !0, 
            item.data = null);
        }
    }, ISOFile.prototype.hasItem = function(name) {
        for (var i in this.items) {
            var item = this.items[i];
            if (item.name === name) return item.id;
        }
        return -1;
    }, ISOFile.prototype.getMetaHandler = function() {
        return this.meta ? this.meta.hdlr.handler : null;
    }, ISOFile.prototype.getPrimaryItem = function() {
        return this.meta && this.meta.pitm ? this.getItem(this.meta.pitm.item_id) : null;
    }, ISOFile.prototype.write = function(outstream) {
        for (var i = 0; i < this.boxes.length; i++) this.boxes[i].write(outstream);
    }, ISOFile.prototype.createFragment = function(track_id, sampleNumber, stream_) {
        var trak = this.getTrackById(track_id), sample = this.getSample(trak, sampleNumber);
        if (null == sample) return sample = trak.samples[sampleNumber], this.nextSeekPosition ? this.nextSeekPosition = Math.min(sample.offset + sample.alreadyRead, this.nextSeekPosition) : this.nextSeekPosition = trak.samples[sampleNumber].offset + sample.alreadyRead, 
        null;
        var stream = stream_ || new DataStream;
        stream.endianness = DataStream.BIG_ENDIAN;
        var moof = ISOFile.createSingleSampleMoof(sample);
        moof.write(stream), moof.trafs[0].truns[0].data_offset = moof.size + 8, Log.debug("MP4Box", "Adjusting data_offset with new value " + moof.trafs[0].truns[0].data_offset), 
        stream.adjustUint32(moof.trafs[0].truns[0].data_offset_position, moof.trafs[0].truns[0].data_offset);
        var mdat = new BoxParser.mdatBox;
        return mdat.data = sample.data, mdat.write(stream), stream;
    }, ISOFile.writeInitializationSegment = function(ftyp, moov, total_duration, sample_duration) {
        var i;
        Log.debug("ISOFile", "Generating initialization segment");
        var stream = new DataStream;
        stream.endianness = DataStream.BIG_ENDIAN, ftyp.write(stream);
        var mvex = moov.add("mvex");
        for (total_duration && mvex.add("mehd").set("fragment_duration", total_duration), 
        i = 0; i < moov.traks.length; i++) mvex.add("trex").set("track_id", moov.traks[i].tkhd.track_id).set("default_sample_description_index", 1).set("default_sample_duration", sample_duration).set("default_sample_size", 0).set("default_sample_flags", 65536);
        return moov.write(stream), stream.buffer;
    }, ISOFile.prototype.save = function(name) {
        var stream = new DataStream;
        stream.endianness = DataStream.BIG_ENDIAN, this.write(stream), stream.save(name);
    }, ISOFile.prototype.getBuffer = function() {
        var stream = new DataStream;
        return stream.endianness = DataStream.BIG_ENDIAN, this.write(stream), stream.buffer;
    }, ISOFile.prototype.initializeSegmentation = function() {
        var i, initSegs, trak, seg;
        for (null === this.onSegment && Log.warn("MP4Box", "No segmentation callback set!"), 
        this.isFragmentationInitialized || (this.isFragmentationInitialized = !0, this.nextMoofNumber = 0, 
        this.resetTables()), initSegs = [], i = 0; i < this.fragmentedTracks.length; i++) {
            var moov = new BoxParser.moovBox;
            moov.mvhd = this.moov.mvhd, moov.boxes.push(moov.mvhd), trak = this.getTrackById(this.fragmentedTracks[i].id), 
            moov.boxes.push(trak), moov.traks.push(trak), (seg = {}).id = trak.tkhd.track_id, 
            seg.user = this.fragmentedTracks[i].user, seg.buffer = ISOFile.writeInitializationSegment(this.ftyp, moov, this.moov.mvex && this.moov.mvex.mehd ? this.moov.mvex.mehd.fragment_duration : void 0, this.moov.traks[i].samples.length > 0 ? this.moov.traks[i].samples[0].duration : 0), 
            initSegs.push(seg);
        }
        return initSegs;
    }, BoxParser.Box.prototype.printHeader = function(output) {
        this.size += 8, this.size > MAX_SIZE && (this.size += 8), "uuid" === this.type && (this.size += 16), 
        output.log(output.indent + "size:" + this.size), output.log(output.indent + "type:" + this.type);
    }, BoxParser.FullBox.prototype.printHeader = function(output) {
        this.size += 4, BoxParser.Box.prototype.printHeader.call(this, output), output.log(output.indent + "version:" + this.version), 
        output.log(output.indent + "flags:" + this.flags);
    }, BoxParser.Box.prototype.print = function(output) {
        this.printHeader(output);
    }, BoxParser.ContainerBox.prototype.print = function(output) {
        this.printHeader(output);
        for (var i = 0; i < this.boxes.length; i++) if (this.boxes[i]) {
            var prev_indent = output.indent;
            output.indent += " ", this.boxes[i].print(output), output.indent = prev_indent;
        }
    }, ISOFile.prototype.print = function(output) {
        output.indent = "";
        for (var i = 0; i < this.boxes.length; i++) this.boxes[i] && this.boxes[i].print(output);
    }, BoxParser.mvhdBox.prototype.print = function(output) {
        BoxParser.FullBox.prototype.printHeader.call(this, output), output.log(output.indent + "creation_time: " + this.creation_time), 
        output.log(output.indent + "modification_time: " + this.modification_time), output.log(output.indent + "timescale: " + this.timescale), 
        output.log(output.indent + "duration: " + this.duration), output.log(output.indent + "rate: " + this.rate), 
        output.log(output.indent + "volume: " + (this.volume >> 8)), output.log(output.indent + "matrix: " + this.matrix.join(", ")), 
        output.log(output.indent + "next_track_id: " + this.next_track_id);
    }, BoxParser.tkhdBox.prototype.print = function(output) {
        BoxParser.FullBox.prototype.printHeader.call(this, output), output.log(output.indent + "creation_time: " + this.creation_time), 
        output.log(output.indent + "modification_time: " + this.modification_time), output.log(output.indent + "track_id: " + this.track_id), 
        output.log(output.indent + "duration: " + this.duration), output.log(output.indent + "volume: " + (this.volume >> 8)), 
        output.log(output.indent + "matrix: " + this.matrix.join(", ")), output.log(output.indent + "layer: " + this.layer), 
        output.log(output.indent + "alternate_group: " + this.alternate_group), output.log(output.indent + "width: " + this.width), 
        output.log(output.indent + "height: " + this.height);
    };
    var MP4Box_createFile = function(_keepMdatData, _stream) {
        var keepMdatData = void 0 === _keepMdatData || _keepMdatData, file = new ISOFile(_stream);
        return file.discardMdatData = !keepMdatData, file;
    };
    exports.createFile = MP4Box_createFile;
}
