function(module, exports, __webpack_require__) {
    var types = __webpack_require__(901), rcodes = __webpack_require__(902), opcodes = __webpack_require__(903), ip = __webpack_require__(116), Buffer = __webpack_require__(23).Buffer, name = exports.txt = exports.name = {};
    name.encode = function(str, buf, offset) {
        buf || (buf = Buffer.allocUnsafe(name.encodingLength(str))), offset || (offset = 0);
        var oldOffset = offset, n = str.replace(/^\.|\.$/gm, "");
        if (n.length) for (var list = n.split("."), i = 0; i < list.length; i++) {
            var len = buf.write(list[i], offset + 1);
            buf[offset] = len, offset += len + 1;
        }
        return buf[offset++] = 0, name.encode.bytes = offset - oldOffset, buf;
    }, name.encode.bytes = 0, name.decode = function(buf, offset) {
        offset || (offset = 0);
        var list = [], oldOffset = offset, len = buf[offset++];
        if (0 === len) return name.decode.bytes = 1, ".";
        if (len >= 192) {
            var res = name.decode(buf, buf.readUInt16BE(offset - 1) - 49152);
            return name.decode.bytes = 2, res;
        }
        for (;len; ) {
            if (len >= 192) {
                list.push(name.decode(buf, buf.readUInt16BE(offset - 1) - 49152)), offset++;
                break;
            }
            list.push(buf.toString("utf-8", offset, offset + len)), offset += len, len = buf[offset++];
        }
        return name.decode.bytes = offset - oldOffset, list.join(".");
    }, name.decode.bytes = 0, name.encodingLength = function(n) {
        return Buffer.byteLength(n) + 2;
    };
    var string = {
        encode: function(s, buf, offset) {
            buf || (buf = Buffer.allocUnsafe(string.encodingLength(s))), offset || (offset = 0);
            var len = buf.write(s, offset + 1);
            return buf[offset] = len, string.encode.bytes = len + 1, buf;
        }
    };
    string.encode.bytes = 0, string.decode = function(buf, offset) {
        offset || (offset = 0);
        var len = buf[offset], s = buf.toString("utf-8", offset + 1, offset + 1 + len);
        return string.decode.bytes = len + 1, s;
    }, string.decode.bytes = 0, string.encodingLength = function(s) {
        return Buffer.byteLength(s) + 1;
    };
    var header = {
        encode: function(h, buf, offset) {
            buf || (buf = header.encodingLength(h)), offset || (offset = 0);
            var flags = 32767 & (h.flags || 0), type = "response" === h.type ? 32768 : 0;
            return buf.writeUInt16BE(h.id || 0, offset), buf.writeUInt16BE(flags | type, offset + 2), 
            buf.writeUInt16BE(h.questions.length, offset + 4), buf.writeUInt16BE(h.answers.length, offset + 6), 
            buf.writeUInt16BE(h.authorities.length, offset + 8), buf.writeUInt16BE(h.additionals.length, offset + 10), 
            buf;
        }
    };
    header.encode.bytes = 12, header.decode = function(buf, offset) {
        if (offset || (offset = 0), buf.length < 12) throw new Error("Header must be 12 bytes");
        var flags = buf.readUInt16BE(offset + 2);
        return {
            id: buf.readUInt16BE(offset),
            type: 32768 & flags ? "response" : "query",
            flags: 32767 & flags,
            flag_qr: 1 == (flags >> 15 & 1),
            opcode: opcodes.toString(flags >> 11 & 15),
            flag_auth: 1 == (flags >> 10 & 1),
            flag_trunc: 1 == (flags >> 9 & 1),
            flag_rd: 1 == (flags >> 8 & 1),
            flag_ra: 1 == (flags >> 7 & 1),
            flag_z: 1 == (flags >> 6 & 1),
            flag_ad: 1 == (flags >> 5 & 1),
            flag_cd: 1 == (flags >> 4 & 1),
            rcode: rcodes.toString(15 & flags),
            questions: new Array(buf.readUInt16BE(offset + 4)),
            answers: new Array(buf.readUInt16BE(offset + 6)),
            authorities: new Array(buf.readUInt16BE(offset + 8)),
            additionals: new Array(buf.readUInt16BE(offset + 10))
        };
    }, header.decode.bytes = 12, header.encodingLength = function() {
        return 12;
    };
    var runknown = exports.unknown = {};
    runknown.encode = function(data, buf, offset) {
        return buf || (buf = Buffer.allocUnsafe(runknown.encodingLength(data))), offset || (offset = 0), 
        buf.writeUInt16BE(data.length, offset), data.copy(buf, offset + 2), runknown.encode.bytes = data.length + 2, 
        buf;
    }, runknown.encode.bytes = 0, runknown.decode = function(buf, offset) {
        offset || (offset = 0);
        var len = buf.readUInt16BE(offset), data = buf.slice(offset + 2, offset + 2 + len);
        return runknown.decode.bytes = len + 2, data;
    }, runknown.decode.bytes = 0, runknown.encodingLength = function(data) {
        return data.length + 2;
    };
    var rns = exports.ns = {};
    rns.encode = function(data, buf, offset) {
        return buf || (buf = Buffer.allocUnsafe(rns.encodingLength(data))), offset || (offset = 0), 
        name.encode(data, buf, offset + 2), buf.writeUInt16BE(name.encode.bytes, offset), 
        rns.encode.bytes = name.encode.bytes + 2, buf;
    }, rns.encode.bytes = 0, rns.decode = function(buf, offset) {
        offset || (offset = 0);
        var len = buf.readUInt16BE(offset), dd = name.decode(buf, offset + 2);
        return rns.decode.bytes = len + 2, dd;
    }, rns.decode.bytes = 0, rns.encodingLength = function(data) {
        return name.encodingLength(data) + 2;
    };
    var rsoa = exports.soa = {};
    rsoa.encode = function(data, buf, offset) {
        buf || (buf = Buffer.allocUnsafe(rsoa.encodingLength(data))), offset || (offset = 0);
        var oldOffset = offset;
        return offset += 2, name.encode(data.mname, buf, offset), offset += name.encode.bytes, 
        name.encode(data.rname, buf, offset), offset += name.encode.bytes, buf.writeUInt32BE(data.serial || 0, offset), 
        offset += 4, buf.writeUInt32BE(data.refresh || 0, offset), offset += 4, buf.writeUInt32BE(data.retry || 0, offset), 
        offset += 4, buf.writeUInt32BE(data.expire || 0, offset), offset += 4, buf.writeUInt32BE(data.minimum || 0, offset), 
        offset += 4, buf.writeUInt16BE(offset - oldOffset - 2, oldOffset), rsoa.encode.bytes = offset - oldOffset, 
        buf;
    }, rsoa.encode.bytes = 0, rsoa.decode = function(buf, offset) {
        offset || (offset = 0);
        var oldOffset = offset, data = {};
        return offset += 2, data.mname = name.decode(buf, offset), offset += name.decode.bytes, 
        data.rname = name.decode(buf, offset), offset += name.decode.bytes, data.serial = buf.readUInt32BE(offset), 
        offset += 4, data.refresh = buf.readUInt32BE(offset), offset += 4, data.retry = buf.readUInt32BE(offset), 
        offset += 4, data.expire = buf.readUInt32BE(offset), offset += 4, data.minimum = buf.readUInt32BE(offset), 
        offset += 4, rsoa.decode.bytes = offset - oldOffset, data;
    }, rsoa.decode.bytes = 0, rsoa.encodingLength = function(data) {
        return 22 + name.encodingLength(data.mname) + name.encodingLength(data.rname);
    };
    var rtxt = exports.txt = exports.null = {}, rnull = rtxt;
    rtxt.encode = function(data, buf, offset) {
        buf || (buf = Buffer.allocUnsafe(rtxt.encodingLength(data))), offset || (offset = 0), 
        "string" == typeof data && (data = Buffer.from(data)), data || (data = Buffer.allocUnsafe(0));
        var oldOffset = offset;
        offset += 2;
        var len = data.length;
        return data.copy(buf, offset, 0, len), offset += len, buf.writeUInt16BE(offset - oldOffset - 2, oldOffset), 
        rtxt.encode.bytes = offset - oldOffset, buf;
    }, rtxt.encode.bytes = 0, rtxt.decode = function(buf, offset) {
        offset || (offset = 0);
        var oldOffset = offset, len = buf.readUInt16BE(offset);
        offset += 2;
        var data = buf.slice(offset, offset + len);
        return offset += len, rtxt.decode.bytes = offset - oldOffset, data;
    }, rtxt.decode.bytes = 0, rtxt.encodingLength = function(data) {
        return data ? (Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data)) + 2 : 2;
    };
    var rhinfo = exports.hinfo = {};
    rhinfo.encode = function(data, buf, offset) {
        buf || (buf = Buffer.allocUnsafe(rhinfo.encodingLength(data))), offset || (offset = 0);
        var oldOffset = offset;
        return offset += 2, string.encode(data.cpu, buf, offset), offset += string.encode.bytes, 
        string.encode(data.os, buf, offset), offset += string.encode.bytes, buf.writeUInt16BE(offset - oldOffset - 2, oldOffset), 
        rhinfo.encode.bytes = offset - oldOffset, buf;
    }, rhinfo.encode.bytes = 0, rhinfo.decode = function(buf, offset) {
        offset || (offset = 0);
        var oldOffset = offset, data = {};
        return offset += 2, data.cpu = string.decode(buf, offset), offset += string.decode.bytes, 
        data.os = string.decode(buf, offset), offset += string.decode.bytes, rhinfo.decode.bytes = offset - oldOffset, 
        data;
    }, rhinfo.decode.bytes = 0, rhinfo.encodingLength = function(data) {
        return string.encodingLength(data.cpu) + string.encodingLength(data.os) + 2;
    };
    var rptr = exports.ptr = {}, rcname = exports.cname = rptr, rdname = exports.dname = rptr;
    rptr.encode = function(data, buf, offset) {
        return buf || (buf = Buffer.allocUnsafe(rptr.encodingLength(data))), offset || (offset = 0), 
        name.encode(data, buf, offset + 2), buf.writeUInt16BE(name.encode.bytes, offset), 
        rptr.encode.bytes = name.encode.bytes + 2, buf;
    }, rptr.encode.bytes = 0, rptr.decode = function(buf, offset) {
        offset || (offset = 0);
        var data = name.decode(buf, offset + 2);
        return rptr.decode.bytes = name.decode.bytes + 2, data;
    }, rptr.decode.bytes = 0, rptr.encodingLength = function(data) {
        return name.encodingLength(data) + 2;
    };
    var rsrv = exports.srv = {};
    rsrv.encode = function(data, buf, offset) {
        buf || (buf = Buffer.allocUnsafe(rsrv.encodingLength(data))), offset || (offset = 0), 
        buf.writeUInt16BE(data.priority || 0, offset + 2), buf.writeUInt16BE(data.weight || 0, offset + 4), 
        buf.writeUInt16BE(data.port || 0, offset + 6), name.encode(data.target, buf, offset + 8);
        var len = name.encode.bytes + 6;
        return buf.writeUInt16BE(len, offset), rsrv.encode.bytes = len + 2, buf;
    }, rsrv.encode.bytes = 0, rsrv.decode = function(buf, offset) {
        offset || (offset = 0);
        var len = buf.readUInt16BE(offset), data = {};
        return data.priority = buf.readUInt16BE(offset + 2), data.weight = buf.readUInt16BE(offset + 4), 
        data.port = buf.readUInt16BE(offset + 6), data.target = name.decode(buf, offset + 8), 
        rsrv.decode.bytes = len + 2, data;
    }, rsrv.decode.bytes = 0, rsrv.encodingLength = function(data) {
        return 8 + name.encodingLength(data.target);
    };
    var rcaa = exports.caa = {};
    rcaa.ISSUER_CRITICAL = 128, rcaa.encode = function(data, buf, offset) {
        var len = rcaa.encodingLength(data);
        return buf || (buf = Buffer.allocUnsafe(rcaa.encodingLength(data))), offset || (offset = 0), 
        data.issuerCritical && (data.flags = rcaa.ISSUER_CRITICAL), buf.writeUInt16BE(len - 2, offset), 
        offset += 2, buf.writeUInt8(data.flags || 0, offset), offset += 1, string.encode(data.tag, buf, offset), 
        offset += string.encode.bytes, buf.write(data.value, offset), offset += Buffer.byteLength(data.value), 
        rcaa.encode.bytes = len, buf;
    }, rcaa.encode.bytes = 0, rcaa.decode = function(buf, offset) {
        offset || (offset = 0);
        var len = buf.readUInt16BE(offset), oldOffset = offset += 2, data = {};
        return data.flags = buf.readUInt8(offset), offset += 1, data.tag = string.decode(buf, offset), 
        offset += string.decode.bytes, data.value = buf.toString("utf-8", offset, oldOffset + len), 
        data.issuerCritical = !!(data.flags & rcaa.ISSUER_CRITICAL), rcaa.decode.bytes = len + 2, 
        data;
    }, rcaa.decode.bytes = 0, rcaa.encodingLength = function(data) {
        return string.encodingLength(data.tag) + string.encodingLength(data.value) + 2;
    };
    var ra = exports.a = {};
    ra.encode = function(host, buf, offset) {
        return buf || (buf = Buffer.allocUnsafe(ra.encodingLength(host))), offset || (offset = 0), 
        buf.writeUInt16BE(4, offset), offset += 2, ip.toBuffer(host, buf, offset), ra.encode.bytes = 6, 
        buf;
    }, ra.encode.bytes = 0, ra.decode = function(buf, offset) {
        offset || (offset = 0), offset += 2;
        var host = ip.toString(buf, offset, 4);
        return ra.decode.bytes = 6, host;
    }, ra.decode.bytes = 0, ra.encodingLength = function() {
        return 6;
    };
    var raaaa = exports.aaaa = {};
    raaaa.encode = function(host, buf, offset) {
        return buf || (buf = Buffer.allocUnsafe(raaaa.encodingLength(host))), offset || (offset = 0), 
        buf.writeUInt16BE(16, offset), offset += 2, ip.toBuffer(host, buf, offset), raaaa.encode.bytes = 18, 
        buf;
    }, raaaa.encode.bytes = 0, raaaa.decode = function(buf, offset) {
        offset || (offset = 0), offset += 2;
        var host = ip.toString(buf, offset, 16);
        return raaaa.decode.bytes = 18, host;
    }, raaaa.decode.bytes = 0, raaaa.encodingLength = function() {
        return 18;
    };
    var renc = exports.record = function(type) {
        switch (type.toUpperCase()) {
          case "A":
            return ra;

          case "PTR":
            return rptr;

          case "CNAME":
            return rcname;

          case "DNAME":
            return rdname;

          case "TXT":
            return rtxt;

          case "NULL":
            return rnull;

          case "AAAA":
            return raaaa;

          case "SRV":
            return rsrv;

          case "HINFO":
            return rhinfo;

          case "CAA":
            return rcaa;

          case "NS":
            return rns;

          case "SOA":
            return rsoa;
        }
        return runknown;
    }, answer = exports.answer = {};
    answer.encode = function(a, buf, offset) {
        buf || (buf = Buffer.allocUnsafe(answer.encodingLength(a))), offset || (offset = 0);
        var oldOffset = offset;
        name.encode(a.name, buf, offset), offset += name.encode.bytes, buf.writeUInt16BE(types.toType(a.type), offset);
        var klass = void 0 === a.class ? 1 : a.class;
        a.flush && (klass |= 32768), buf.writeUInt16BE(klass, offset + 2), buf.writeUInt32BE(a.ttl || 0, offset + 4);
        var enc = renc(a.type);
        return enc.encode(a.data, buf, offset + 8), offset += 8 + enc.encode.bytes, answer.encode.bytes = offset - oldOffset, 
        buf;
    }, answer.encode.bytes = 0, answer.decode = function(buf, offset) {
        offset || (offset = 0);
        var a = {}, oldOffset = offset;
        a.name = name.decode(buf, offset), offset += name.decode.bytes, a.type = types.toString(buf.readUInt16BE(offset)), 
        a.class = buf.readUInt16BE(offset + 2), a.ttl = buf.readUInt32BE(offset + 4), a.flush = !!(32768 & a.class), 
        a.flush && (a.class &= -32769);
        var enc = renc(a.type);
        return a.data = enc.decode(buf, offset + 8), offset += 8 + enc.decode.bytes, answer.decode.bytes = offset - oldOffset, 
        a;
    }, answer.decode.bytes = 0, answer.encodingLength = function(a) {
        return name.encodingLength(a.name) + 8 + renc(a.type).encodingLength(a.data);
    };
    var question = exports.question = {};
    function encodingLengthList(list, enc) {
        for (var len = 0, i = 0; i < list.length; i++) len += enc.encodingLength(list[i]);
        return len;
    }
    function encodeList(list, enc, buf, offset) {
        for (var i = 0; i < list.length; i++) enc.encode(list[i], buf, offset), offset += enc.encode.bytes;
        return offset;
    }
    function decodeList(list, enc, buf, offset) {
        for (var i = 0; i < list.length; i++) list[i] = enc.decode(buf, offset), offset += enc.decode.bytes;
        return offset;
    }
    question.encode = function(q, buf, offset) {
        buf || (buf = Buffer.allocUnsafe(question.encodingLength(q))), offset || (offset = 0);
        var oldOffset = offset;
        return name.encode(q.name, buf, offset), offset += name.encode.bytes, buf.writeUInt16BE(types.toType(q.type), offset), 
        offset += 2, buf.writeUInt16BE(void 0 === q.class ? 1 : q.class, offset), offset += 2, 
        question.encode.bytes = offset - oldOffset, q;
    }, question.encode.bytes = 0, question.decode = function(buf, offset) {
        offset || (offset = 0);
        var oldOffset = offset, q = {};
        return q.name = name.decode(buf, offset), offset += name.decode.bytes, q.type = types.toString(buf.readUInt16BE(offset)), 
        offset += 2, q.class = buf.readUInt16BE(offset), offset += 2, !!(32768 & q.class) && (q.class &= -32769), 
        question.decode.bytes = offset - oldOffset, q;
    }, question.decode.bytes = 0, question.encodingLength = function(q) {
        return name.encodingLength(q.name) + 4;
    }, exports.AUTHORITATIVE_ANSWER = 1024, exports.TRUNCATED_RESPONSE = 512, exports.RECURSION_DESIRED = 256, 
    exports.RECURSION_AVAILABLE = 128, exports.AUTHENTIC_DATA = 32, exports.CHECKING_DISABLED = 16, 
    exports.encode = function(result, buf, offset) {
        buf || (buf = Buffer.allocUnsafe(exports.encodingLength(result))), offset || (offset = 0);
        var oldOffset = offset;
        return result.questions || (result.questions = []), result.answers || (result.answers = []), 
        result.authorities || (result.authorities = []), result.additionals || (result.additionals = []), 
        header.encode(result, buf, offset), offset += header.encode.bytes, offset = encodeList(result.questions, question, buf, offset), 
        offset = encodeList(result.answers, answer, buf, offset), offset = encodeList(result.authorities, answer, buf, offset), 
        offset = encodeList(result.additionals, answer, buf, offset), exports.encode.bytes = offset - oldOffset, 
        buf;
    }, exports.encode.bytes = 0, exports.decode = function(buf, offset) {
        offset || (offset = 0);
        var oldOffset = offset, result = header.decode(buf, offset);
        return offset += header.decode.bytes, offset = decodeList(result.questions, question, buf, offset), 
        offset = decodeList(result.answers, answer, buf, offset), offset = decodeList(result.authorities, answer, buf, offset), 
        offset = decodeList(result.additionals, answer, buf, offset), exports.decode.bytes = offset - oldOffset, 
        result;
    }, exports.decode.bytes = 0, exports.encodingLength = function(result) {
        return header.encodingLength(result) + encodingLengthList(result.questions || [], question) + encodingLengthList(result.answers || [], answer) + encodingLengthList(result.authorities || [], answer) + encodingLengthList(result.additionals || [], answer);
    };
}
