function(module, exports, __webpack_require__) {
    "use strict";
    var Buffer = __webpack_require__(14).Buffer;
    exports._dbcs = DBCSCodec;
    for (var UNASSIGNED_NODE = new Array(256), i = 0; i < 256; i++) UNASSIGNED_NODE[i] = -1;
    function DBCSCodec(codecOptions, iconv) {
        if (this.encodingName = codecOptions.encodingName, !codecOptions) throw new Error("DBCS codec is called without the data.");
        if (!codecOptions.table) throw new Error("Encoding '" + this.encodingName + "' has no data.");
        var mappingTable = codecOptions.table();
        this.decodeTables = [], this.decodeTables[0] = UNASSIGNED_NODE.slice(0), this.decodeTableSeq = [];
        for (var i = 0; i < mappingTable.length; i++) this._addDecodeChunk(mappingTable[i]);
        this.defaultCharUnicode = iconv.defaultCharUnicode, this.encodeTable = [], this.encodeTableSeq = [];
        var skipEncodeChars = {};
        if (codecOptions.encodeSkipVals) for (i = 0; i < codecOptions.encodeSkipVals.length; i++) {
            var val = codecOptions.encodeSkipVals[i];
            if ("number" == typeof val) skipEncodeChars[val] = !0; else for (var j = val.from; j <= val.to; j++) skipEncodeChars[j] = !0;
        }
        if (this._fillEncodeTable(0, 0, skipEncodeChars), codecOptions.encodeAdd) for (var uChar in codecOptions.encodeAdd) Object.prototype.hasOwnProperty.call(codecOptions.encodeAdd, uChar) && this._setEncodeChar(uChar.charCodeAt(0), codecOptions.encodeAdd[uChar]);
        if (this.defCharSB = this.encodeTable[0][iconv.defaultCharSingleByte.charCodeAt(0)], 
        -1 === this.defCharSB && (this.defCharSB = this.encodeTable[0]["?"]), -1 === this.defCharSB && (this.defCharSB = "?".charCodeAt(0)), 
        "function" == typeof codecOptions.gb18030) {
            this.gb18030 = codecOptions.gb18030();
            var thirdByteNodeIdx = this.decodeTables.length, thirdByteNode = this.decodeTables[thirdByteNodeIdx] = UNASSIGNED_NODE.slice(0), fourthByteNodeIdx = this.decodeTables.length, fourthByteNode = this.decodeTables[fourthByteNodeIdx] = UNASSIGNED_NODE.slice(0);
            for (i = 129; i <= 254; i++) {
                var secondByteNodeIdx = -1e3 - this.decodeTables[0][i], secondByteNode = this.decodeTables[secondByteNodeIdx];
                for (j = 48; j <= 57; j++) secondByteNode[j] = -1e3 - thirdByteNodeIdx;
            }
            for (i = 129; i <= 254; i++) thirdByteNode[i] = -1e3 - fourthByteNodeIdx;
            for (i = 48; i <= 57; i++) fourthByteNode[i] = -2;
        }
    }
    function DBCSEncoder(options, codec) {
        this.leadSurrogate = -1, this.seqObj = void 0, this.encodeTable = codec.encodeTable, 
        this.encodeTableSeq = codec.encodeTableSeq, this.defaultCharSingleByte = codec.defCharSB, 
        this.gb18030 = codec.gb18030;
    }
    function DBCSDecoder(options, codec) {
        this.nodeIdx = 0, this.prevBuf = Buffer.alloc(0), this.decodeTables = codec.decodeTables, 
        this.decodeTableSeq = codec.decodeTableSeq, this.defaultCharUnicode = codec.defaultCharUnicode, 
        this.gb18030 = codec.gb18030;
    }
    function findIdx(table, val) {
        if (table[0] > val) return -1;
        for (var l = 0, r = table.length; l < r - 1; ) {
            var mid = l + Math.floor((r - l + 1) / 2);
            table[mid] <= val ? l = mid : r = mid;
        }
        return l;
    }
    DBCSCodec.prototype.encoder = DBCSEncoder, DBCSCodec.prototype.decoder = DBCSDecoder, 
    DBCSCodec.prototype._getDecodeTrieNode = function(addr) {
        for (var bytes = []; addr > 0; addr >>= 8) bytes.push(255 & addr);
        0 == bytes.length && bytes.push(0);
        for (var node = this.decodeTables[0], i = bytes.length - 1; i > 0; i--) {
            var val = node[bytes[i]];
            if (-1 == val) node[bytes[i]] = -1e3 - this.decodeTables.length, this.decodeTables.push(node = UNASSIGNED_NODE.slice(0)); else {
                if (!(val <= -1e3)) throw new Error("Overwrite byte in " + this.encodingName + ", addr: " + addr.toString(16));
                node = this.decodeTables[-1e3 - val];
            }
        }
        return node;
    }, DBCSCodec.prototype._addDecodeChunk = function(chunk) {
        var curAddr = parseInt(chunk[0], 16), writeTable = this._getDecodeTrieNode(curAddr);
        curAddr &= 255;
        for (var k = 1; k < chunk.length; k++) {
            var part = chunk[k];
            if ("string" == typeof part) for (var l = 0; l < part.length; ) {
                var code = part.charCodeAt(l++);
                if (55296 <= code && code < 56320) {
                    var codeTrail = part.charCodeAt(l++);
                    if (!(56320 <= codeTrail && codeTrail < 57344)) throw new Error("Incorrect surrogate pair in " + this.encodingName + " at chunk " + chunk[0]);
                    writeTable[curAddr++] = 65536 + 1024 * (code - 55296) + (codeTrail - 56320);
                } else if (4080 < code && code <= 4095) {
                    for (var len = 4095 - code + 2, seq = [], m = 0; m < len; m++) seq.push(part.charCodeAt(l++));
                    writeTable[curAddr++] = -10 - this.decodeTableSeq.length, this.decodeTableSeq.push(seq);
                } else writeTable[curAddr++] = code;
            } else {
                if ("number" != typeof part) throw new Error("Incorrect type '" + typeof part + "' given in " + this.encodingName + " at chunk " + chunk[0]);
                var charCode = writeTable[curAddr - 1] + 1;
                for (l = 0; l < part; l++) writeTable[curAddr++] = charCode++;
            }
        }
        if (curAddr > 255) throw new Error("Incorrect chunk in " + this.encodingName + " at addr " + chunk[0] + ": too long" + curAddr);
    }, DBCSCodec.prototype._getEncodeBucket = function(uCode) {
        var high = uCode >> 8;
        return void 0 === this.encodeTable[high] && (this.encodeTable[high] = UNASSIGNED_NODE.slice(0)), 
        this.encodeTable[high];
    }, DBCSCodec.prototype._setEncodeChar = function(uCode, dbcsCode) {
        var bucket = this._getEncodeBucket(uCode), low = 255 & uCode;
        bucket[low] <= -10 ? this.encodeTableSeq[-10 - bucket[low]][-1] = dbcsCode : -1 == bucket[low] && (bucket[low] = dbcsCode);
    }, DBCSCodec.prototype._setEncodeSequence = function(seq, dbcsCode) {
        var node, uCode = seq[0], bucket = this._getEncodeBucket(uCode), low = 255 & uCode;
        bucket[low] <= -10 ? node = this.encodeTableSeq[-10 - bucket[low]] : (node = {}, 
        -1 !== bucket[low] && (node[-1] = bucket[low]), bucket[low] = -10 - this.encodeTableSeq.length, 
        this.encodeTableSeq.push(node));
        for (var j = 1; j < seq.length - 1; j++) {
            var oldVal = node[uCode];
            "object" == typeof oldVal ? node = oldVal : (node = node[uCode] = {}, void 0 !== oldVal && (node[-1] = oldVal));
        }
        node[uCode = seq[seq.length - 1]] = dbcsCode;
    }, DBCSCodec.prototype._fillEncodeTable = function(nodeIdx, prefix, skipEncodeChars) {
        for (var node = this.decodeTables[nodeIdx], i = 0; i < 256; i++) {
            var uCode = node[i], mbCode = prefix + i;
            skipEncodeChars[mbCode] || (uCode >= 0 ? this._setEncodeChar(uCode, mbCode) : uCode <= -1e3 ? this._fillEncodeTable(-1e3 - uCode, mbCode << 8, skipEncodeChars) : uCode <= -10 && this._setEncodeSequence(this.decodeTableSeq[-10 - uCode], mbCode));
        }
    }, DBCSEncoder.prototype.write = function(str) {
        for (var newBuf = Buffer.alloc(str.length * (this.gb18030 ? 4 : 3)), leadSurrogate = this.leadSurrogate, seqObj = this.seqObj, nextChar = -1, i = 0, j = 0; ;) {
            if (-1 === nextChar) {
                if (i == str.length) break;
                var uCode = str.charCodeAt(i++);
            } else uCode = nextChar, nextChar = -1;
            if (55296 <= uCode && uCode < 57344) if (uCode < 56320) {
                if (-1 === leadSurrogate) {
                    leadSurrogate = uCode;
                    continue;
                }
                leadSurrogate = uCode, uCode = -1;
            } else -1 !== leadSurrogate ? (uCode = 65536 + 1024 * (leadSurrogate - 55296) + (uCode - 56320), 
            leadSurrogate = -1) : uCode = -1; else -1 !== leadSurrogate && (nextChar = uCode, 
            uCode = -1, leadSurrogate = -1);
            var dbcsCode = -1;
            if (void 0 !== seqObj && -1 != uCode) {
                var resCode = seqObj[uCode];
                if ("object" == typeof resCode) {
                    seqObj = resCode;
                    continue;
                }
                "number" == typeof resCode ? dbcsCode = resCode : null == resCode && void 0 !== (resCode = seqObj[-1]) && (dbcsCode = resCode, 
                nextChar = uCode), seqObj = void 0;
            } else if (uCode >= 0) {
                var subtable = this.encodeTable[uCode >> 8];
                if (void 0 !== subtable && (dbcsCode = subtable[255 & uCode]), dbcsCode <= -10) {
                    seqObj = this.encodeTableSeq[-10 - dbcsCode];
                    continue;
                }
                if (-1 == dbcsCode && this.gb18030) {
                    var idx = findIdx(this.gb18030.uChars, uCode);
                    if (-1 != idx) {
                        dbcsCode = this.gb18030.gbChars[idx] + (uCode - this.gb18030.uChars[idx]), newBuf[j++] = 129 + Math.floor(dbcsCode / 12600), 
                        dbcsCode %= 12600, newBuf[j++] = 48 + Math.floor(dbcsCode / 1260), dbcsCode %= 1260, 
                        newBuf[j++] = 129 + Math.floor(dbcsCode / 10), dbcsCode %= 10, newBuf[j++] = 48 + dbcsCode;
                        continue;
                    }
                }
            }
            -1 === dbcsCode && (dbcsCode = this.defaultCharSingleByte), dbcsCode < 256 ? newBuf[j++] = dbcsCode : dbcsCode < 65536 ? (newBuf[j++] = dbcsCode >> 8, 
            newBuf[j++] = 255 & dbcsCode) : (newBuf[j++] = dbcsCode >> 16, newBuf[j++] = dbcsCode >> 8 & 255, 
            newBuf[j++] = 255 & dbcsCode);
        }
        return this.seqObj = seqObj, this.leadSurrogate = leadSurrogate, newBuf.slice(0, j);
    }, DBCSEncoder.prototype.end = function() {
        if (-1 !== this.leadSurrogate || void 0 !== this.seqObj) {
            var newBuf = Buffer.alloc(10), j = 0;
            if (this.seqObj) {
                var dbcsCode = this.seqObj[-1];
                void 0 !== dbcsCode && (dbcsCode < 256 ? newBuf[j++] = dbcsCode : (newBuf[j++] = dbcsCode >> 8, 
                newBuf[j++] = 255 & dbcsCode)), this.seqObj = void 0;
            }
            return -1 !== this.leadSurrogate && (newBuf[j++] = this.defaultCharSingleByte, this.leadSurrogate = -1), 
            newBuf.slice(0, j);
        }
    }, DBCSEncoder.prototype.findIdx = findIdx, DBCSDecoder.prototype.write = function(buf) {
        var newBuf = Buffer.alloc(2 * buf.length), nodeIdx = this.nodeIdx, prevBuf = this.prevBuf, prevBufOffset = this.prevBuf.length, seqStart = -this.prevBuf.length;
        prevBufOffset > 0 && (prevBuf = Buffer.concat([ prevBuf, buf.slice(0, 10) ]));
        for (var i = 0, j = 0; i < buf.length; i++) {
            var uCode, curByte = i >= 0 ? buf[i] : prevBuf[i + prevBufOffset];
            if ((uCode = this.decodeTables[nodeIdx][curByte]) >= 0) ; else if (-1 === uCode) i = seqStart, 
            uCode = this.defaultCharUnicode.charCodeAt(0); else if (-2 === uCode) {
                var curSeq = seqStart >= 0 ? buf.slice(seqStart, i + 1) : prevBuf.slice(seqStart + prevBufOffset, i + 1 + prevBufOffset), ptr = 12600 * (curSeq[0] - 129) + 1260 * (curSeq[1] - 48) + 10 * (curSeq[2] - 129) + (curSeq[3] - 48), idx = findIdx(this.gb18030.gbChars, ptr);
                uCode = this.gb18030.uChars[idx] + ptr - this.gb18030.gbChars[idx];
            } else {
                if (uCode <= -1e3) {
                    nodeIdx = -1e3 - uCode;
                    continue;
                }
                if (!(uCode <= -10)) throw new Error("iconv-lite internal error: invalid decoding table value " + uCode + " at " + nodeIdx + "/" + curByte);
                for (var seq = this.decodeTableSeq[-10 - uCode], k = 0; k < seq.length - 1; k++) uCode = seq[k], 
                newBuf[j++] = 255 & uCode, newBuf[j++] = uCode >> 8;
                uCode = seq[seq.length - 1];
            }
            if (uCode > 65535) {
                uCode -= 65536;
                var uCodeLead = 55296 + Math.floor(uCode / 1024);
                newBuf[j++] = 255 & uCodeLead, newBuf[j++] = uCodeLead >> 8, uCode = 56320 + uCode % 1024;
            }
            newBuf[j++] = 255 & uCode, newBuf[j++] = uCode >> 8, nodeIdx = 0, seqStart = i + 1;
        }
        return this.nodeIdx = nodeIdx, this.prevBuf = seqStart >= 0 ? buf.slice(seqStart) : prevBuf.slice(seqStart + prevBufOffset), 
        newBuf.slice(0, j).toString("ucs2");
    }, DBCSDecoder.prototype.end = function() {
        for (var ret = ""; this.prevBuf.length > 0; ) {
            ret += this.defaultCharUnicode;
            var buf = this.prevBuf.slice(1);
            this.prevBuf = Buffer.alloc(0), this.nodeIdx = 0, buf.length > 0 && (ret += this.write(buf));
        }
        return this.nodeIdx = 0, ret;
    };
}
