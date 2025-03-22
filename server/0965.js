function(module, exports) {
    var opts, ophop, defineProp, ECMAScript = (opts = Object.prototype.toString, ophop = Object.prototype.hasOwnProperty, 
    {
        Class: function(v) {
            return opts.call(v).replace(/^\[object *|\]$/g, "");
        },
        HasProperty: function(o, p) {
            return p in o;
        },
        HasOwnProperty: function(o, p) {
            return ophop.call(o, p);
        },
        IsCallable: function(o) {
            return "function" == typeof o;
        },
        ToInt32: function(v) {
            return v >> 0;
        },
        ToUint32: function(v) {
            return v >>> 0;
        }
    }), LN2 = Math.LN2, abs = Math.abs, floor = Math.floor, log = Math.log, min = Math.min, pow = Math.pow, round = Math.round;
    function configureProperties(obj) {
        if (getOwnPropNames && defineProp) {
            var i, props = getOwnPropNames(obj);
            for (i = 0; i < props.length; i += 1) defineProp(obj, props[i], {
                value: obj[props[i]],
                writable: !1,
                enumerable: !1,
                configurable: !1
            });
        }
    }
    defineProp = Object.defineProperty && (function() {
        try {
            return Object.defineProperty({}, "x", {}), !0;
        } catch (e) {
            return !1;
        }
    })() ? Object.defineProperty : function(o, p, desc) {
        if (!o === Object(o)) throw new TypeError("Object.defineProperty called on non-object");
        return ECMAScript.HasProperty(desc, "get") && Object.prototype.__defineGetter__ && Object.prototype.__defineGetter__.call(o, p, desc.get), 
        ECMAScript.HasProperty(desc, "set") && Object.prototype.__defineSetter__ && Object.prototype.__defineSetter__.call(o, p, desc.set), 
        ECMAScript.HasProperty(desc, "value") && (o[p] = desc.value), o;
    };
    var getOwnPropNames = Object.getOwnPropertyNames || function(o) {
        if (o !== Object(o)) throw new TypeError("Object.getOwnPropertyNames called on non-object");
        var p, props = [];
        for (p in o) ECMAScript.HasOwnProperty(o, p) && props.push(p);
        return props;
    };
    function makeArrayAccessors(obj) {
        if (defineProp) {
            if (obj.length > 1e5) throw new RangeError("Array too large for polyfill");
            var i;
            for (i = 0; i < obj.length; i += 1) makeArrayAccessor(i);
        }
        function makeArrayAccessor(index) {
            defineProp(obj, index, {
                get: function() {
                    return obj._getter(index);
                },
                set: function(v) {
                    obj._setter(index, v);
                },
                enumerable: !0,
                configurable: !1
            });
        }
    }
    function as_signed(value, bits) {
        var s = 32 - bits;
        return value << s >> s;
    }
    function as_unsigned(value, bits) {
        var s = 32 - bits;
        return value << s >>> s;
    }
    function packI8(n) {
        return [ 255 & n ];
    }
    function unpackI8(bytes) {
        return as_signed(bytes[0], 8);
    }
    function packU8(n) {
        return [ 255 & n ];
    }
    function unpackU8(bytes) {
        return as_unsigned(bytes[0], 8);
    }
    function packU8Clamped(n) {
        return [ (n = round(Number(n))) < 0 ? 0 : n > 255 ? 255 : 255 & n ];
    }
    function packI16(n) {
        return [ n >> 8 & 255, 255 & n ];
    }
    function unpackI16(bytes) {
        return as_signed(bytes[0] << 8 | bytes[1], 16);
    }
    function packU16(n) {
        return [ n >> 8 & 255, 255 & n ];
    }
    function unpackU16(bytes) {
        return as_unsigned(bytes[0] << 8 | bytes[1], 16);
    }
    function packI32(n) {
        return [ n >> 24 & 255, n >> 16 & 255, n >> 8 & 255, 255 & n ];
    }
    function unpackI32(bytes) {
        return as_signed(bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], 32);
    }
    function packU32(n) {
        return [ n >> 24 & 255, n >> 16 & 255, n >> 8 & 255, 255 & n ];
    }
    function unpackU32(bytes) {
        return as_unsigned(bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], 32);
    }
    function packIEEE754(v, ebits, fbits) {
        var s, e, f, i, bits, str, bytes, bias = (1 << ebits - 1) - 1;
        function roundToEven(n) {
            var w = floor(n), f = n - w;
            return f < .5 ? w : f > .5 || w % 2 ? w + 1 : w;
        }
        for (v != v ? (e = (1 << ebits) - 1, f = pow(2, fbits - 1), s = 0) : v === 1 / 0 || v === -1 / 0 ? (e = (1 << ebits) - 1, 
        f = 0, s = v < 0 ? 1 : 0) : 0 === v ? (e = 0, f = 0, s = 1 / v == -1 / 0 ? 1 : 0) : (s = v < 0, 
        (v = abs(v)) >= pow(2, 1 - bias) ? (e = min(floor(log(v) / LN2), 1023), (f = roundToEven(v / pow(2, e) * pow(2, fbits))) / pow(2, fbits) >= 2 && (e += 1, 
        f = 1), e > bias ? (e = (1 << ebits) - 1, f = 0) : (e += bias, f -= pow(2, fbits))) : (e = 0, 
        f = roundToEven(v / pow(2, 1 - bias - fbits)))), bits = [], i = fbits; i; i -= 1) bits.push(f % 2 ? 1 : 0), 
        f = floor(f / 2);
        for (i = ebits; i; i -= 1) bits.push(e % 2 ? 1 : 0), e = floor(e / 2);
        for (bits.push(s ? 1 : 0), bits.reverse(), str = bits.join(""), bytes = []; str.length; ) bytes.push(parseInt(str.substring(0, 8), 2)), 
        str = str.substring(8);
        return bytes;
    }
    function unpackIEEE754(bytes, ebits, fbits) {
        var i, j, b, str, bias, s, e, f, bits = [];
        for (i = bytes.length; i; i -= 1) for (b = bytes[i - 1], j = 8; j; j -= 1) bits.push(b % 2 ? 1 : 0), 
        b >>= 1;
        return bits.reverse(), str = bits.join(""), bias = (1 << ebits - 1) - 1, s = parseInt(str.substring(0, 1), 2) ? -1 : 1, 
        e = parseInt(str.substring(1, 1 + ebits), 2), f = parseInt(str.substring(1 + ebits), 2), 
        e === (1 << ebits) - 1 ? 0 !== f ? NaN : s * (1 / 0) : e > 0 ? s * pow(2, e - bias) * (1 + f / pow(2, fbits)) : 0 !== f ? s * pow(2, -(bias - 1)) * (f / pow(2, fbits)) : s < 0 ? -0 : 0;
    }
    function unpackF64(b) {
        return unpackIEEE754(b, 11, 52);
    }
    function packF64(v) {
        return packIEEE754(v, 11, 52);
    }
    function unpackF32(b) {
        return unpackIEEE754(b, 8, 23);
    }
    function packF32(v) {
        return packIEEE754(v, 8, 23);
    }
    !(function() {
        var ArrayBuffer = function(length) {
            if ((length = ECMAScript.ToInt32(length)) < 0) throw new RangeError("ArrayBuffer size is not a small enough positive integer");
            var i;
            for (this.byteLength = length, this._bytes = [], this._bytes.length = length, i = 0; i < this.byteLength; i += 1) this._bytes[i] = 0;
            configureProperties(this);
        };
        exports.ArrayBuffer = exports.ArrayBuffer || ArrayBuffer;
        var ArrayBufferView = function() {};
        function makeConstructor(bytesPerElement, pack, unpack) {
            var ctor;
            return ctor = function(buffer, byteOffset, length) {
                var array, sequence, i, s;
                if (arguments.length && "number" != typeof arguments[0]) if ("object" == typeof arguments[0] && arguments[0].constructor === ctor) for (array = arguments[0], 
                this.length = array.length, this.byteLength = this.length * this.BYTES_PER_ELEMENT, 
                this.buffer = new ArrayBuffer(this.byteLength), this.byteOffset = 0, i = 0; i < this.length; i += 1) this._setter(i, array._getter(i)); else if ("object" != typeof arguments[0] || arguments[0] instanceof ArrayBuffer || "ArrayBuffer" === ECMAScript.Class(arguments[0])) {
                    if ("object" != typeof arguments[0] || !(arguments[0] instanceof ArrayBuffer || "ArrayBuffer" === ECMAScript.Class(arguments[0]))) throw new TypeError("Unexpected argument type(s)");
                    if (this.buffer = buffer, this.byteOffset = ECMAScript.ToUint32(byteOffset), this.byteOffset > this.buffer.byteLength) throw new RangeError("byteOffset out of range");
                    if (this.byteOffset % this.BYTES_PER_ELEMENT) throw new RangeError("ArrayBuffer length minus the byteOffset is not a multiple of the element size.");
                    if (arguments.length < 3) {
                        if (this.byteLength = this.buffer.byteLength - this.byteOffset, this.byteLength % this.BYTES_PER_ELEMENT) throw new RangeError("length of buffer minus byteOffset not a multiple of the element size");
                        this.length = this.byteLength / this.BYTES_PER_ELEMENT;
                    } else this.length = ECMAScript.ToUint32(length), this.byteLength = this.length * this.BYTES_PER_ELEMENT;
                    if (this.byteOffset + this.byteLength > this.buffer.byteLength) throw new RangeError("byteOffset and length reference an area beyond the end of the buffer");
                } else for (sequence = arguments[0], this.length = ECMAScript.ToUint32(sequence.length), 
                this.byteLength = this.length * this.BYTES_PER_ELEMENT, this.buffer = new ArrayBuffer(this.byteLength), 
                this.byteOffset = 0, i = 0; i < this.length; i += 1) s = sequence[i], this._setter(i, Number(s)); else {
                    if (this.length = ECMAScript.ToInt32(arguments[0]), length < 0) throw new RangeError("ArrayBufferView size is not a small enough positive integer");
                    this.byteLength = this.length * this.BYTES_PER_ELEMENT, this.buffer = new ArrayBuffer(this.byteLength), 
                    this.byteOffset = 0;
                }
                this.constructor = ctor, configureProperties(this), makeArrayAccessors(this);
            }, ctor.prototype = new ArrayBufferView, ctor.prototype.BYTES_PER_ELEMENT = bytesPerElement, 
            ctor.prototype._pack = pack, ctor.prototype._unpack = unpack, ctor.BYTES_PER_ELEMENT = bytesPerElement, 
            ctor.prototype._getter = function(index) {
                if (arguments.length < 1) throw new SyntaxError("Not enough arguments");
                if (!((index = ECMAScript.ToUint32(index)) >= this.length)) {
                    var i, o, bytes = [];
                    for (i = 0, o = this.byteOffset + index * this.BYTES_PER_ELEMENT; i < this.BYTES_PER_ELEMENT; i += 1, 
                    o += 1) bytes.push(this.buffer._bytes[o]);
                    return this._unpack(bytes);
                }
            }, ctor.prototype.get = ctor.prototype._getter, ctor.prototype._setter = function(index, value) {
                if (arguments.length < 2) throw new SyntaxError("Not enough arguments");
                if (!((index = ECMAScript.ToUint32(index)) >= this.length)) {
                    var i, o, bytes = this._pack(value);
                    for (i = 0, o = this.byteOffset + index * this.BYTES_PER_ELEMENT; i < this.BYTES_PER_ELEMENT; i += 1, 
                    o += 1) this.buffer._bytes[o] = bytes[i];
                }
            }, ctor.prototype.set = function(index, value) {
                if (arguments.length < 1) throw new SyntaxError("Not enough arguments");
                var array, sequence, offset, len, i, s, d, byteOffset, byteLength, tmp;
                if ("object" == typeof arguments[0] && arguments[0].constructor === this.constructor) {
                    if (array = arguments[0], (offset = ECMAScript.ToUint32(arguments[1])) + array.length > this.length) throw new RangeError("Offset plus length of array is out of range");
                    if (byteOffset = this.byteOffset + offset * this.BYTES_PER_ELEMENT, byteLength = array.length * this.BYTES_PER_ELEMENT, 
                    array.buffer === this.buffer) {
                        for (tmp = [], i = 0, s = array.byteOffset; i < byteLength; i += 1, s += 1) tmp[i] = array.buffer._bytes[s];
                        for (i = 0, d = byteOffset; i < byteLength; i += 1, d += 1) this.buffer._bytes[d] = tmp[i];
                    } else for (i = 0, s = array.byteOffset, d = byteOffset; i < byteLength; i += 1, 
                    s += 1, d += 1) this.buffer._bytes[d] = array.buffer._bytes[s];
                } else {
                    if ("object" != typeof arguments[0] || void 0 === arguments[0].length) throw new TypeError("Unexpected argument type(s)");
                    if (sequence = arguments[0], len = ECMAScript.ToUint32(sequence.length), (offset = ECMAScript.ToUint32(arguments[1])) + len > this.length) throw new RangeError("Offset plus length of array is out of range");
                    for (i = 0; i < len; i += 1) s = sequence[i], this._setter(offset + i, Number(s));
                }
            }, ctor.prototype.subarray = function(start, end) {
                function clamp(v, min, max) {
                    return v < min ? min : v > max ? max : v;
                }
                start = ECMAScript.ToInt32(start), end = ECMAScript.ToInt32(end), arguments.length < 1 && (start = 0), 
                arguments.length < 2 && (end = this.length), start < 0 && (start = this.length + start), 
                end < 0 && (end = this.length + end), start = clamp(start, 0, this.length);
                var len = (end = clamp(end, 0, this.length)) - start;
                return len < 0 && (len = 0), new this.constructor(this.buffer, this.byteOffset + start * this.BYTES_PER_ELEMENT, len);
            }, ctor;
        }
        var Int8Array = makeConstructor(1, packI8, unpackI8), Uint8Array = makeConstructor(1, packU8, unpackU8), Uint8ClampedArray = makeConstructor(1, packU8Clamped, unpackU8), Int16Array = makeConstructor(2, packI16, unpackI16), Uint16Array = makeConstructor(2, packU16, unpackU16), Int32Array = makeConstructor(4, packI32, unpackI32), Uint32Array = makeConstructor(4, packU32, unpackU32), Float32Array = makeConstructor(4, packF32, unpackF32), Float64Array = makeConstructor(8, packF64, unpackF64);
        exports.Int8Array = exports.Int8Array || Int8Array, exports.Uint8Array = exports.Uint8Array || Uint8Array, 
        exports.Uint8ClampedArray = exports.Uint8ClampedArray || Uint8ClampedArray, exports.Int16Array = exports.Int16Array || Int16Array, 
        exports.Uint16Array = exports.Uint16Array || Uint16Array, exports.Int32Array = exports.Int32Array || Int32Array, 
        exports.Uint32Array = exports.Uint32Array || Uint32Array, exports.Float32Array = exports.Float32Array || Float32Array, 
        exports.Float64Array = exports.Float64Array || Float64Array;
    })(), (function() {
        function r(array, index) {
            return ECMAScript.IsCallable(array.get) ? array.get(index) : array[index];
        }
        var u16array, IS_BIG_ENDIAN = (u16array = new exports.Uint16Array([ 4660 ]), 18 === r(new exports.Uint8Array(u16array.buffer), 0)), DataView = function(buffer, byteOffset, byteLength) {
            if (0 === arguments.length) buffer = new exports.ArrayBuffer(0); else if (!(buffer instanceof exports.ArrayBuffer || "ArrayBuffer" === ECMAScript.Class(buffer))) throw new TypeError("TypeError");
            if (this.buffer = buffer || new exports.ArrayBuffer(0), this.byteOffset = ECMAScript.ToUint32(byteOffset), 
            this.byteOffset > this.buffer.byteLength) throw new RangeError("byteOffset out of range");
            if (this.byteLength = arguments.length < 3 ? this.buffer.byteLength - this.byteOffset : ECMAScript.ToUint32(byteLength), 
            this.byteOffset + this.byteLength > this.buffer.byteLength) throw new RangeError("byteOffset and length reference an area beyond the end of the buffer");
            configureProperties(this);
        };
        function makeGetter(arrayType) {
            return function(byteOffset, littleEndian) {
                if ((byteOffset = ECMAScript.ToUint32(byteOffset)) + arrayType.BYTES_PER_ELEMENT > this.byteLength) throw new RangeError("Array index out of range");
                byteOffset += this.byteOffset;
                var i, uint8Array = new exports.Uint8Array(this.buffer, byteOffset, arrayType.BYTES_PER_ELEMENT), bytes = [];
                for (i = 0; i < arrayType.BYTES_PER_ELEMENT; i += 1) bytes.push(r(uint8Array, i));
                return Boolean(littleEndian) === Boolean(IS_BIG_ENDIAN) && bytes.reverse(), r(new arrayType(new exports.Uint8Array(bytes).buffer), 0);
            };
        }
        function makeSetter(arrayType) {
            return function(byteOffset, value, littleEndian) {
                if ((byteOffset = ECMAScript.ToUint32(byteOffset)) + arrayType.BYTES_PER_ELEMENT > this.byteLength) throw new RangeError("Array index out of range");
                var i, typeArray = new arrayType([ value ]), byteArray = new exports.Uint8Array(typeArray.buffer), bytes = [];
                for (i = 0; i < arrayType.BYTES_PER_ELEMENT; i += 1) bytes.push(r(byteArray, i));
                Boolean(littleEndian) === Boolean(IS_BIG_ENDIAN) && bytes.reverse(), new exports.Uint8Array(this.buffer, byteOffset, arrayType.BYTES_PER_ELEMENT).set(bytes);
            };
        }
        DataView.prototype.getUint8 = makeGetter(exports.Uint8Array), DataView.prototype.getInt8 = makeGetter(exports.Int8Array), 
        DataView.prototype.getUint16 = makeGetter(exports.Uint16Array), DataView.prototype.getInt16 = makeGetter(exports.Int16Array), 
        DataView.prototype.getUint32 = makeGetter(exports.Uint32Array), DataView.prototype.getInt32 = makeGetter(exports.Int32Array), 
        DataView.prototype.getFloat32 = makeGetter(exports.Float32Array), DataView.prototype.getFloat64 = makeGetter(exports.Float64Array), 
        DataView.prototype.setUint8 = makeSetter(exports.Uint8Array), DataView.prototype.setInt8 = makeSetter(exports.Int8Array), 
        DataView.prototype.setUint16 = makeSetter(exports.Uint16Array), DataView.prototype.setInt16 = makeSetter(exports.Int16Array), 
        DataView.prototype.setUint32 = makeSetter(exports.Uint32Array), DataView.prototype.setInt32 = makeSetter(exports.Int32Array), 
        DataView.prototype.setFloat32 = makeSetter(exports.Float32Array), DataView.prototype.setFloat64 = makeSetter(exports.Float64Array), 
        exports.DataView = exports.DataView || DataView;
    })();
}
