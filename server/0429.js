function(module, exports, __webpack_require__) {
    var uint64be = __webpack_require__(430), boxes = __webpack_require__(853), Box = exports, containers = exports.containers = {
        moov: [ "mvhd", "meta", "traks", "mvex" ],
        trak: [ "tkhd", "tref", "trgr", "edts", "meta", "mdia", "udta" ],
        edts: [ "elst" ],
        mdia: [ "mdhd", "hdlr", "elng", "minf" ],
        minf: [ "vmhd", "smhd", "hmhd", "sthd", "nmhd", "dinf", "stbl" ],
        dinf: [ "dref" ],
        stbl: [ "stsd", "stts", "ctts", "cslg", "stsc", "stsz", "stz2", "stco", "co64", "stss", "stsh", "padb", "stdp", "sdtp", "sbgps", "sgpds", "subss", "saizs", "saios" ],
        mvex: [ "mehd", "trexs", "leva" ],
        moof: [ "mfhd", "meta", "trafs" ],
        traf: [ "tfhd", "tfdt", "trun", "sbgps", "sgpds", "subss", "saizs", "saios", "meta" ]
    };
    Box.encode = function(obj, buffer, offset) {
        return Box.encodingLength(obj), offset = offset || 0, buffer = buffer || Buffer.alloc(obj.length), 
        Box._encode(obj, buffer, offset);
    }, Box._encode = function(obj, buffer, offset) {
        var type = obj.type, len = obj.length;
        len > 4294967295 && (len = 1), buffer.writeUInt32BE(len, offset), buffer.write(obj.type, offset + 4, 4, "ascii");
        var ptr = offset + 8;
        if (1 === len && (uint64be.encode(obj.length, buffer, ptr), ptr += 8), boxes.fullBoxes[type] && (buffer.writeUInt32BE(obj.flags || 0, ptr), 
        buffer.writeUInt8(obj.version || 0, ptr), ptr += 4), containers[type]) containers[type].forEach((function(childType) {
            if (5 === childType.length) {
                var entry = obj[childType] || [];
                childType = childType.substr(0, 4), entry.forEach((function(child) {
                    Box._encode(child, buffer, ptr), ptr += Box.encode.bytes;
                }));
            } else obj[childType] && (Box._encode(obj[childType], buffer, ptr), ptr += Box.encode.bytes);
        })), obj.otherBoxes && obj.otherBoxes.forEach((function(child) {
            Box._encode(child, buffer, ptr), ptr += Box.encode.bytes;
        })); else if (boxes[type]) {
            var encode = boxes[type].encode;
            encode(obj, buffer, ptr), ptr += encode.bytes;
        } else {
            if (!obj.buffer) throw new Error("Either `type` must be set to a known type (not'" + type + "') or `buffer` must be set");
            obj.buffer.copy(buffer, ptr), ptr += obj.buffer.length;
        }
        return Box.encode.bytes = ptr - offset, buffer;
    }, Box.readHeaders = function(buffer, start, end) {
        if (start = start || 0, (end = end || buffer.length) - start < 8) return 8;
        var version, flags, len = buffer.readUInt32BE(start), type = buffer.toString("ascii", start + 4, start + 8), ptr = start + 8;
        if (1 === len) {
            if (end - start < 16) return 16;
            len = uint64be.decode(buffer, ptr), ptr += 8;
        }
        return boxes.fullBoxes[type] && (version = buffer.readUInt8(ptr), flags = 16777215 & buffer.readUInt32BE(ptr), 
        ptr += 4), {
            length: len,
            headersLen: ptr - start,
            contentLen: len - (ptr - start),
            type: type,
            version: version,
            flags: flags
        };
    }, Box.decode = function(buffer, start, end) {
        start = start || 0, end = end || buffer.length;
        var headers = Box.readHeaders(buffer, start, end);
        if (!headers || headers.length > end - start) throw new Error("Data too short");
        return Box.decodeWithoutHeaders(headers, buffer, start + headers.headersLen, start + headers.length);
    }, Box.decodeWithoutHeaders = function(headers, buffer, start, end) {
        start = start || 0, end = end || buffer.length;
        var type = headers.type, obj = {};
        if (containers[type]) {
            obj.otherBoxes = [];
            for (var contents = containers[type], ptr = start; end - ptr >= 8; ) {
                var child = Box.decode(buffer, ptr, end);
                if (ptr += child.length, contents.indexOf(child.type) >= 0) obj[child.type] = child; else if (contents.indexOf(child.type + "s") >= 0) {
                    var childType = child.type + "s";
                    (obj[childType] = obj[childType] || []).push(child);
                } else obj.otherBoxes.push(child);
            }
        } else boxes[type] ? obj = (0, boxes[type].decode)(buffer, start, end) : obj.buffer = Buffer.from(buffer.slice(start, end));
        return obj.length = headers.length, obj.contentLen = headers.contentLen, obj.type = headers.type, 
        obj.version = headers.version, obj.flags = headers.flags, obj;
    }, Box.encodingLength = function(obj) {
        var type = obj.type, len = 8;
        if (boxes.fullBoxes[type] && (len += 4), containers[type]) containers[type].forEach((function(childType) {
            if (5 === childType.length) {
                var entry = obj[childType] || [];
                childType = childType.substr(0, 4), entry.forEach((function(child) {
                    child.type = childType, len += Box.encodingLength(child);
                }));
            } else if (obj[childType]) {
                var child = obj[childType];
                child.type = childType, len += Box.encodingLength(child);
            }
        })), obj.otherBoxes && obj.otherBoxes.forEach((function(child) {
            len += Box.encodingLength(child);
        })); else if (boxes[type]) len += boxes[type].encodingLength(obj); else {
            if (!obj.buffer) throw new Error("Either `type` must be set to a known type (not'" + type + "') or `buffer` must be set");
            len += obj.buffer.length;
        }
        return len > 4294967295 && (len += 8), obj.length = len, len;
    };
}
