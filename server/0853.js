function(module, exports, __webpack_require__) {
    var Box = __webpack_require__(429), Descriptor = __webpack_require__(854), uint64be = __webpack_require__(430);
    function writeReserved(buf, offset, end) {
        for (var i = offset; i < end; i++) buf[i] = 0;
    }
    function writeDate(date, buf, offset) {
        buf.writeUInt32BE(Math.floor((date.getTime() + 20828448e5) / 1e3), offset);
    }
    function writeDate64(date, buf, offset) {
        buf.writeUIntBE(Math.floor((date.getTime() + 20828448e5) / 1e3), offset, 6);
    }
    function writeFixed32(num, buf, offset) {
        buf.writeUInt16BE(Math.floor(num) % 65536, offset), buf.writeUInt16BE(Math.floor(256 * num * 256) % 65536, offset + 2);
    }
    function writeMatrix(list, buf, offset) {
        list || (list = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ]);
        for (var i = 0; i < list.length; i++) writeFixed32(list[i], buf, offset + 4 * i);
    }
    function readMatrix(buf) {
        for (var list = new Array(buf.length / 4), i = 0; i < list.length; i++) list[i] = readFixed32(buf, 4 * i);
        return list;
    }
    function readDate64(buf, offset) {
        return new Date(1e3 * buf.readUIntBE(offset, 6) - 20828448e5);
    }
    function readDate(buf, offset) {
        return new Date(1e3 * buf.readUInt32BE(offset) - 20828448e5);
    }
    function readFixed32(buf, offset) {
        return buf.readUInt16BE(offset) + buf.readUInt16BE(offset + 2) / 65536;
    }
    function readFixed16(buf, offset) {
        return buf[offset] + buf[offset + 1] / 256;
    }
    function readString(buf, offset, length) {
        var i;
        for (i = 0; i < length && 0 !== buf[offset + i]; i++) ;
        return buf.toString("utf8", offset, offset + i);
    }
    exports.fullBoxes = {}, [ "mvhd", "tkhd", "mdhd", "vmhd", "smhd", "stsd", "esds", "stsz", "stco", "co64", "stss", "stts", "ctts", "stsc", "dref", "elst", "hdlr", "mehd", "trex", "mfhd", "tfhd", "tfdt", "trun" ].forEach((function(type) {
        exports.fullBoxes[type] = !0;
    })), exports.ftyp = {}, exports.ftyp.encode = function(box, buf, offset) {
        buf = buf ? buf.slice(offset) : Buffer.alloc(exports.ftyp.encodingLength(box));
        var brands = box.compatibleBrands || [];
        buf.write(box.brand, 0, 4, "ascii"), buf.writeUInt32BE(box.brandVersion, 4);
        for (var i = 0; i < brands.length; i++) buf.write(brands[i], 8 + 4 * i, 4, "ascii");
        return exports.ftyp.encode.bytes = 8 + 4 * brands.length, buf;
    }, exports.ftyp.decode = function(buf, offset) {
        for (var brand = (buf = buf.slice(offset)).toString("ascii", 0, 4), version = buf.readUInt32BE(4), compatibleBrands = [], i = 8; i < buf.length; i += 4) compatibleBrands.push(buf.toString("ascii", i, i + 4));
        return {
            brand: brand,
            brandVersion: version,
            compatibleBrands: compatibleBrands
        };
    }, exports.ftyp.encodingLength = function(box) {
        return 8 + 4 * (box.compatibleBrands || []).length;
    }, exports.mvhd = {}, exports.mvhd.encode = function(box, buf, offset) {
        return buf = buf ? buf.slice(offset) : Buffer.alloc(96), writeDate(box.ctime || new Date, buf, 0), 
        writeDate(box.mtime || new Date, buf, 4), buf.writeUInt32BE(box.timeScale || 0, 8), 
        buf.writeUInt32BE(box.duration || 0, 12), writeFixed32(box.preferredRate || 0, buf, 16), 
        (function(num, buf, offset) {
            buf[20] = Math.floor(num) % 256, buf[21] = Math.floor(256 * num) % 256;
        })(box.preferredVolume || 0, buf), writeReserved(buf, 22, 32), writeMatrix(box.matrix, buf, 32), 
        buf.writeUInt32BE(box.previewTime || 0, 68), buf.writeUInt32BE(box.previewDuration || 0, 72), 
        buf.writeUInt32BE(box.posterTime || 0, 76), buf.writeUInt32BE(box.selectionTime || 0, 80), 
        buf.writeUInt32BE(box.selectionDuration || 0, 84), buf.writeUInt32BE(box.currentTime || 0, 88), 
        buf.writeUInt32BE(box.nextTrackId || 0, 92), exports.mvhd.encode.bytes = 96, buf;
    }, exports.mvhd.decode = function(buf, offset) {
        return {
            ctime: readDate(buf = buf.slice(offset), 0),
            mtime: readDate(buf, 4),
            timeScale: buf.readUInt32BE(8),
            duration: buf.readUInt32BE(12),
            preferredRate: readFixed32(buf, 16),
            preferredVolume: readFixed16(buf, 20),
            matrix: readMatrix(buf.slice(32, 68)),
            previewTime: buf.readUInt32BE(68),
            previewDuration: buf.readUInt32BE(72),
            posterTime: buf.readUInt32BE(76),
            selectionTime: buf.readUInt32BE(80),
            selectionDuration: buf.readUInt32BE(84),
            currentTime: buf.readUInt32BE(88),
            nextTrackId: buf.readUInt32BE(92)
        };
    }, exports.mvhd.encodingLength = function(box) {
        return 96;
    }, exports.tkhd = {}, exports.tkhd.encode = function(box, buf, offset) {
        return buf = buf ? buf.slice(offset) : Buffer.alloc(80), writeDate(box.ctime || new Date, buf, 0), 
        writeDate(box.mtime || new Date, buf, 4), buf.writeUInt32BE(box.trackId || 0, 8), 
        writeReserved(buf, 12, 16), buf.writeUInt32BE(box.duration || 0, 16), writeReserved(buf, 20, 28), 
        buf.writeUInt16BE(box.layer || 0, 28), buf.writeUInt16BE(box.alternateGroup || 0, 30), 
        buf.writeUInt16BE(box.volume || 0, 32), writeMatrix(box.matrix, buf, 36), buf.writeUInt32BE(box.trackWidth || 0, 72), 
        buf.writeUInt32BE(box.trackHeight || 0, 76), exports.tkhd.encode.bytes = 80, buf;
    }, exports.tkhd.decode = function(buf, offset) {
        return {
            ctime: readDate(buf = buf.slice(offset), 0),
            mtime: readDate(buf, 4),
            trackId: buf.readUInt32BE(8),
            duration: buf.readUInt32BE(16),
            layer: buf.readUInt16BE(28),
            alternateGroup: buf.readUInt16BE(30),
            volume: buf.readUInt16BE(32),
            matrix: readMatrix(buf.slice(36, 72)),
            trackWidth: buf.readUInt32BE(72),
            trackHeight: buf.readUInt32BE(76)
        };
    }, exports.tkhd.encodingLength = function(box) {
        return 80;
    }, exports.mdhd = {}, exports.mdhd.encode = function(box, buf, offset) {
        return 1 === box.version ? (buf = buf ? buf.slice(offset) : Buffer.alloc(32), writeDate64(box.ctime || new Date, buf, 0), 
        writeDate64(box.mtime || new Date, buf, 8), buf.writeUInt32BE(box.timeScale || 0, 16), 
        buf.writeUIntBE(box.duration || 0, 20, 6), buf.writeUInt16BE(box.language || 0, 28), 
        buf.writeUInt16BE(box.quality || 0, 30), exports.mdhd.encode.bytes = 32, buf) : (buf = buf ? buf.slice(offset) : Buffer.alloc(20), 
        writeDate(box.ctime || new Date, buf, 0), writeDate(box.mtime || new Date, buf, 4), 
        buf.writeUInt32BE(box.timeScale || 0, 8), buf.writeUInt32BE(box.duration || 0, 12), 
        buf.writeUInt16BE(box.language || 0, 16), buf.writeUInt16BE(box.quality || 0, 18), 
        exports.mdhd.encode.bytes = 20, buf);
    }, exports.mdhd.decode = function(buf, offset, end) {
        return buf = buf.slice(offset), end - offset != 20 ? {
            ctime: readDate64(buf, 0),
            mtime: readDate64(buf, 8),
            timeScale: buf.readUInt32BE(16),
            duration: buf.readUIntBE(20, 6),
            language: buf.readUInt16BE(28),
            quality: buf.readUInt16BE(30)
        } : {
            ctime: readDate(buf, 0),
            mtime: readDate(buf, 4),
            timeScale: buf.readUInt32BE(8),
            duration: buf.readUInt32BE(12),
            language: buf.readUInt16BE(16),
            quality: buf.readUInt16BE(18)
        };
    }, exports.mdhd.encodingLength = function(box) {
        return 1 === box.version ? 32 : 20;
    }, exports.vmhd = {}, exports.vmhd.encode = function(box, buf, offset) {
        (buf = buf ? buf.slice(offset) : Buffer.alloc(8)).writeUInt16BE(box.graphicsMode || 0, 0);
        var opcolor = box.opcolor || [ 0, 0, 0 ];
        return buf.writeUInt16BE(opcolor[0], 2), buf.writeUInt16BE(opcolor[1], 4), buf.writeUInt16BE(opcolor[2], 6), 
        exports.vmhd.encode.bytes = 8, buf;
    }, exports.vmhd.decode = function(buf, offset) {
        return {
            graphicsMode: (buf = buf.slice(offset)).readUInt16BE(0),
            opcolor: [ buf.readUInt16BE(2), buf.readUInt16BE(4), buf.readUInt16BE(6) ]
        };
    }, exports.vmhd.encodingLength = function(box) {
        return 8;
    }, exports.smhd = {}, exports.smhd.encode = function(box, buf, offset) {
        return (buf = buf ? buf.slice(offset) : Buffer.alloc(4)).writeUInt16BE(box.balance || 0, 0), 
        writeReserved(buf, 2, 4), exports.smhd.encode.bytes = 4, buf;
    }, exports.smhd.decode = function(buf, offset) {
        return {
            balance: (buf = buf.slice(offset)).readUInt16BE(0)
        };
    }, exports.smhd.encodingLength = function(box) {
        return 4;
    }, exports.stsd = {}, exports.stsd.encode = function(box, buf, offset) {
        buf = buf ? buf.slice(offset) : Buffer.alloc(exports.stsd.encodingLength(box));
        var entries = box.entries || [];
        buf.writeUInt32BE(entries.length, 0);
        for (var ptr = 4, i = 0; i < entries.length; i++) {
            var entry = entries[i];
            Box.encode(entry, buf, ptr), ptr += Box.encode.bytes;
        }
        return exports.stsd.encode.bytes = ptr, buf;
    }, exports.stsd.decode = function(buf, offset, end) {
        for (var num = (buf = buf.slice(offset)).readUInt32BE(0), entries = new Array(num), ptr = 4, i = 0; i < num; i++) {
            var entry = Box.decode(buf, ptr, end);
            entries[i] = entry, ptr += entry.length;
        }
        return {
            entries: entries
        };
    }, exports.stsd.encodingLength = function(box) {
        var totalSize = 4;
        if (!box.entries) return totalSize;
        for (var i = 0; i < box.entries.length; i++) totalSize += Box.encodingLength(box.entries[i]);
        return totalSize;
    }, exports.avc1 = exports.VisualSampleEntry = {}, exports.VisualSampleEntry.encode = function(box, buf, offset) {
        writeReserved(buf = buf ? buf.slice(offset) : Buffer.alloc(exports.VisualSampleEntry.encodingLength(box)), 0, 6), 
        buf.writeUInt16BE(box.dataReferenceIndex || 0, 6), writeReserved(buf, 8, 24), buf.writeUInt16BE(box.width || 0, 24), 
        buf.writeUInt16BE(box.height || 0, 26), buf.writeUInt32BE(box.hResolution || 4718592, 28), 
        buf.writeUInt32BE(box.vResolution || 4718592, 32), writeReserved(buf, 36, 40), buf.writeUInt16BE(box.frameCount || 1, 40);
        var compressorName = box.compressorName || "", nameLen = Math.min(compressorName.length, 31);
        buf.writeUInt8(nameLen, 42), buf.write(compressorName, 43, nameLen, "utf8"), buf.writeUInt16BE(box.depth || 24, 74), 
        buf.writeInt16BE(-1, 76);
        var ptr = 78;
        (box.children || []).forEach((function(child) {
            Box.encode(child, buf, ptr), ptr += Box.encode.bytes;
        })), exports.VisualSampleEntry.encode.bytes = ptr;
    }, exports.VisualSampleEntry.decode = function(buf, offset, end) {
        buf = buf.slice(offset);
        for (var length = end - offset, nameLen = Math.min(buf.readUInt8(42), 31), box = {
            dataReferenceIndex: buf.readUInt16BE(6),
            width: buf.readUInt16BE(24),
            height: buf.readUInt16BE(26),
            hResolution: buf.readUInt32BE(28),
            vResolution: buf.readUInt32BE(32),
            frameCount: buf.readUInt16BE(40),
            compressorName: buf.toString("utf8", 43, 43 + nameLen),
            depth: buf.readUInt16BE(74),
            children: []
        }, ptr = 78; length - ptr >= 8; ) {
            var child = Box.decode(buf, ptr, length);
            box.children.push(child), box[child.type] = child, ptr += child.length;
        }
        return box;
    }, exports.VisualSampleEntry.encodingLength = function(box) {
        var len = 78;
        return (box.children || []).forEach((function(child) {
            len += Box.encodingLength(child);
        })), len;
    }, exports.avcC = {}, exports.avcC.encode = function(box, buf, offset) {
        buf = buf ? buf.slice(offset) : Buffer.alloc(box.buffer.length), box.buffer.copy(buf), 
        exports.avcC.encode.bytes = box.buffer.length;
    }, exports.avcC.decode = function(buf, offset, end) {
        return {
            mimeCodec: (buf = buf.slice(offset, end)).toString("hex", 1, 4),
            buffer: Buffer.from(buf)
        };
    }, exports.avcC.encodingLength = function(box) {
        return box.buffer.length;
    }, exports.mp4a = exports.AudioSampleEntry = {}, exports.AudioSampleEntry.encode = function(box, buf, offset) {
        writeReserved(buf = buf ? buf.slice(offset) : Buffer.alloc(exports.AudioSampleEntry.encodingLength(box)), 0, 6), 
        buf.writeUInt16BE(box.dataReferenceIndex || 0, 6), writeReserved(buf, 8, 16), buf.writeUInt16BE(box.channelCount || 2, 16), 
        buf.writeUInt16BE(box.sampleSize || 16, 18), writeReserved(buf, 20, 24), buf.writeUInt32BE(box.sampleRate || 0, 24);
        var ptr = 28;
        (box.children || []).forEach((function(child) {
            Box.encode(child, buf, ptr), ptr += Box.encode.bytes;
        })), exports.AudioSampleEntry.encode.bytes = ptr;
    }, exports.AudioSampleEntry.decode = function(buf, offset, end) {
        for (var length = end - offset, box = {
            dataReferenceIndex: (buf = buf.slice(offset, end)).readUInt16BE(6),
            channelCount: buf.readUInt16BE(16),
            sampleSize: buf.readUInt16BE(18),
            sampleRate: buf.readUInt32BE(24),
            children: []
        }, ptr = 28; length - ptr >= 8; ) {
            var child = Box.decode(buf, ptr, length);
            box.children.push(child), box[child.type] = child, ptr += child.length;
        }
        return box;
    }, exports.AudioSampleEntry.encodingLength = function(box) {
        var len = 28;
        return (box.children || []).forEach((function(child) {
            len += Box.encodingLength(child);
        })), len;
    }, exports.esds = {}, exports.esds.encode = function(box, buf, offset) {
        buf = buf ? buf.slice(offset) : Buffer.alloc(box.buffer.length), box.buffer.copy(buf, 0), 
        exports.esds.encode.bytes = box.buffer.length;
    }, exports.esds.decode = function(buf, offset, end) {
        buf = buf.slice(offset, end);
        var desc = Descriptor.Descriptor.decode(buf, 0, buf.length), dcd = ("ESDescriptor" === desc.tagName ? desc : {}).DecoderConfigDescriptor || {}, oti = dcd.oti || 0, dsi = dcd.DecoderSpecificInfo, audioConfig = dsi ? (248 & dsi.buffer.readUInt8(0)) >> 3 : 0, mimeCodec = null;
        return oti && (mimeCodec = oti.toString(16), audioConfig && (mimeCodec += "." + audioConfig)), 
        {
            mimeCodec: mimeCodec,
            buffer: Buffer.from(buf.slice(0))
        };
    }, exports.esds.encodingLength = function(box) {
        return box.buffer.length;
    }, exports.stsz = {}, exports.stsz.encode = function(box, buf, offset) {
        var entries = box.entries || [];
        (buf = buf ? buf.slice(offset) : Buffer.alloc(exports.stsz.encodingLength(box))).writeUInt32BE(0, 0), 
        buf.writeUInt32BE(entries.length, 4);
        for (var i = 0; i < entries.length; i++) buf.writeUInt32BE(entries[i], 4 * i + 8);
        return exports.stsz.encode.bytes = 8 + 4 * entries.length, buf;
    }, exports.stsz.decode = function(buf, offset) {
        for (var size = (buf = buf.slice(offset)).readUInt32BE(0), num = buf.readUInt32BE(4), entries = new Array(num), i = 0; i < num; i++) entries[i] = 0 === size ? buf.readUInt32BE(4 * i + 8) : size;
        return {
            entries: entries
        };
    }, exports.stsz.encodingLength = function(box) {
        return 8 + 4 * box.entries.length;
    }, exports.stss = exports.stco = {}, exports.stco.encode = function(box, buf, offset) {
        var entries = box.entries || [];
        (buf = buf ? buf.slice(offset) : Buffer.alloc(exports.stco.encodingLength(box))).writeUInt32BE(entries.length, 0);
        for (var i = 0; i < entries.length; i++) buf.writeUInt32BE(entries[i], 4 * i + 4);
        return exports.stco.encode.bytes = 4 + 4 * entries.length, buf;
    }, exports.stco.decode = function(buf, offset) {
        for (var num = (buf = buf.slice(offset)).readUInt32BE(0), entries = new Array(num), i = 0; i < num; i++) entries[i] = buf.readUInt32BE(4 * i + 4);
        return {
            entries: entries
        };
    }, exports.stco.encodingLength = function(box) {
        return 4 + 4 * box.entries.length;
    }, exports.co64 = {}, exports.co64.encode = function(box, buf, offset) {
        var entries = box.entries || [];
        (buf = buf ? buf.slice(offset) : Buffer.alloc(exports.co64.encodingLength(box))).writeUInt32BE(entries.length, 0);
        for (var i = 0; i < entries.length; i++) uint64be.encode(entries[i], buf, 8 * i + 4);
        return exports.co64.encode.bytes = 4 + 8 * entries.length, buf;
    }, exports.co64.decode = function(buf, offset) {
        for (var num = (buf = buf.slice(offset)).readUInt32BE(0), entries = new Array(num), i = 0; i < num; i++) entries[i] = uint64be.decode(buf, 8 * i + 4);
        return {
            entries: entries
        };
    }, exports.co64.encodingLength = function(box) {
        return 4 + 8 * box.entries.length;
    }, exports.stts = {}, exports.stts.encode = function(box, buf, offset) {
        var entries = box.entries || [];
        (buf = buf ? buf.slice(offset) : Buffer.alloc(exports.stts.encodingLength(box))).writeUInt32BE(entries.length, 0);
        for (var i = 0; i < entries.length; i++) {
            var ptr = 8 * i + 4;
            buf.writeUInt32BE(entries[i].count || 0, ptr), buf.writeUInt32BE(entries[i].duration || 0, ptr + 4);
        }
        return exports.stts.encode.bytes = 4 + 8 * box.entries.length, buf;
    }, exports.stts.decode = function(buf, offset) {
        for (var num = (buf = buf.slice(offset)).readUInt32BE(0), entries = new Array(num), i = 0; i < num; i++) {
            var ptr = 8 * i + 4;
            entries[i] = {
                count: buf.readUInt32BE(ptr),
                duration: buf.readUInt32BE(ptr + 4)
            };
        }
        return {
            entries: entries
        };
    }, exports.stts.encodingLength = function(box) {
        return 4 + 8 * box.entries.length;
    }, exports.ctts = {}, exports.ctts.encode = function(box, buf, offset) {
        var entries = box.entries || [];
        (buf = buf ? buf.slice(offset) : Buffer.alloc(exports.ctts.encodingLength(box))).writeUInt32BE(entries.length, 0);
        for (var i = 0; i < entries.length; i++) {
            var ptr = 8 * i + 4;
            buf.writeUInt32BE(entries[i].count || 0, ptr), buf.writeUInt32BE(entries[i].compositionOffset || 0, ptr + 4);
        }
        return exports.ctts.encode.bytes = 4 + 8 * entries.length, buf;
    }, exports.ctts.decode = function(buf, offset) {
        for (var num = (buf = buf.slice(offset)).readUInt32BE(0), entries = new Array(num), i = 0; i < num; i++) {
            var ptr = 8 * i + 4;
            entries[i] = {
                count: buf.readUInt32BE(ptr),
                compositionOffset: buf.readInt32BE(ptr + 4)
            };
        }
        return {
            entries: entries
        };
    }, exports.ctts.encodingLength = function(box) {
        return 4 + 8 * box.entries.length;
    }, exports.stsc = {}, exports.stsc.encode = function(box, buf, offset) {
        var entries = box.entries || [];
        (buf = buf ? buf.slice(offset) : Buffer.alloc(exports.stsc.encodingLength(box))).writeUInt32BE(entries.length, 0);
        for (var i = 0; i < entries.length; i++) {
            var ptr = 12 * i + 4;
            buf.writeUInt32BE(entries[i].firstChunk || 0, ptr), buf.writeUInt32BE(entries[i].samplesPerChunk || 0, ptr + 4), 
            buf.writeUInt32BE(entries[i].sampleDescriptionId || 0, ptr + 8);
        }
        return exports.stsc.encode.bytes = 4 + 12 * entries.length, buf;
    }, exports.stsc.decode = function(buf, offset) {
        for (var num = (buf = buf.slice(offset)).readUInt32BE(0), entries = new Array(num), i = 0; i < num; i++) {
            var ptr = 12 * i + 4;
            entries[i] = {
                firstChunk: buf.readUInt32BE(ptr),
                samplesPerChunk: buf.readUInt32BE(ptr + 4),
                sampleDescriptionId: buf.readUInt32BE(ptr + 8)
            };
        }
        return {
            entries: entries
        };
    }, exports.stsc.encodingLength = function(box) {
        return 4 + 12 * box.entries.length;
    }, exports.dref = {}, exports.dref.encode = function(box, buf, offset) {
        buf = buf ? buf.slice(offset) : Buffer.alloc(exports.dref.encodingLength(box));
        var entries = box.entries || [];
        buf.writeUInt32BE(entries.length, 0);
        for (var ptr = 4, i = 0; i < entries.length; i++) {
            var entry = entries[i], size = (entry.buf ? entry.buf.length : 0) + 4 + 4;
            buf.writeUInt32BE(size, ptr), ptr += 4, buf.write(entry.type, ptr, 4, "ascii"), 
            ptr += 4, entry.buf && (entry.buf.copy(buf, ptr), ptr += entry.buf.length);
        }
        return exports.dref.encode.bytes = ptr, buf;
    }, exports.dref.decode = function(buf, offset) {
        for (var num = (buf = buf.slice(offset)).readUInt32BE(0), entries = new Array(num), ptr = 4, i = 0; i < num; i++) {
            var size = buf.readUInt32BE(ptr), type = buf.toString("ascii", ptr + 4, ptr + 8), tmp = buf.slice(ptr + 8, ptr + size);
            ptr += size, entries[i] = {
                type: type,
                buf: tmp
            };
        }
        return {
            entries: entries
        };
    }, exports.dref.encodingLength = function(box) {
        var totalSize = 4;
        if (!box.entries) return totalSize;
        for (var i = 0; i < box.entries.length; i++) {
            var buf = box.entries[i].buf;
            totalSize += (buf ? buf.length : 0) + 4 + 4;
        }
        return totalSize;
    }, exports.elst = {}, exports.elst.encode = function(box, buf, offset) {
        var entries = box.entries || [];
        (buf = buf ? buf.slice(offset) : Buffer.alloc(exports.elst.encodingLength(box))).writeUInt32BE(entries.length, 0);
        for (var i = 0; i < entries.length; i++) {
            var ptr = 12 * i + 4;
            buf.writeUInt32BE(entries[i].trackDuration || 0, ptr), buf.writeUInt32BE(entries[i].mediaTime || 0, ptr + 4), 
            writeFixed32(entries[i].mediaRate || 0, buf, ptr + 8);
        }
        return exports.elst.encode.bytes = 4 + 12 * entries.length, buf;
    }, exports.elst.decode = function(buf, offset) {
        for (var num = (buf = buf.slice(offset)).readUInt32BE(0), entries = new Array(num), i = 0; i < num; i++) {
            var ptr = 12 * i + 4;
            entries[i] = {
                trackDuration: buf.readUInt32BE(ptr),
                mediaTime: buf.readInt32BE(ptr + 4),
                mediaRate: readFixed32(buf, ptr + 8)
            };
        }
        return {
            entries: entries
        };
    }, exports.elst.encodingLength = function(box) {
        return 4 + 12 * box.entries.length;
    }, exports.hdlr = {}, exports.hdlr.encode = function(box, buf, offset) {
        buf = buf ? buf.slice(offset) : Buffer.alloc(exports.hdlr.encodingLength(box));
        var len = 21 + (box.name || "").length;
        return buf.fill(0, 0, len), buf.write(box.handlerType || "", 4, 4, "ascii"), (function(str, buf, offset) {
            var strBuffer = Buffer.from(str, "utf8");
            strBuffer.copy(buf, 20), buf[20 + strBuffer.length] = 0;
        })(box.name || "", buf), exports.hdlr.encode.bytes = len, buf;
    }, exports.hdlr.decode = function(buf, offset, end) {
        return {
            handlerType: (buf = buf.slice(offset)).toString("ascii", 4, 8),
            name: readString(buf, 20, end)
        };
    }, exports.hdlr.encodingLength = function(box) {
        return 21 + (box.name || "").length;
    }, exports.mehd = {}, exports.mehd.encode = function(box, buf, offset) {
        return (buf = buf ? buf.slice(offset) : Buffer.alloc(4)).writeUInt32BE(box.fragmentDuration || 0, 0), 
        exports.mehd.encode.bytes = 4, buf;
    }, exports.mehd.decode = function(buf, offset) {
        return {
            fragmentDuration: (buf = buf.slice(offset)).readUInt32BE(0)
        };
    }, exports.mehd.encodingLength = function(box) {
        return 4;
    }, exports.trex = {}, exports.trex.encode = function(box, buf, offset) {
        return (buf = buf ? buf.slice(offset) : Buffer.alloc(20)).writeUInt32BE(box.trackId || 0, 0), 
        buf.writeUInt32BE(box.defaultSampleDescriptionIndex || 0, 4), buf.writeUInt32BE(box.defaultSampleDuration || 0, 8), 
        buf.writeUInt32BE(box.defaultSampleSize || 0, 12), buf.writeUInt32BE(box.defaultSampleFlags || 0, 16), 
        exports.trex.encode.bytes = 20, buf;
    }, exports.trex.decode = function(buf, offset) {
        return {
            trackId: (buf = buf.slice(offset)).readUInt32BE(0),
            defaultSampleDescriptionIndex: buf.readUInt32BE(4),
            defaultSampleDuration: buf.readUInt32BE(8),
            defaultSampleSize: buf.readUInt32BE(12),
            defaultSampleFlags: buf.readUInt32BE(16)
        };
    }, exports.trex.encodingLength = function(box) {
        return 20;
    }, exports.mfhd = {}, exports.mfhd.encode = function(box, buf, offset) {
        return (buf = buf ? buf.slice(offset) : Buffer.alloc(4)).writeUInt32BE(box.sequenceNumber || 0, 0), 
        exports.mfhd.encode.bytes = 4, buf;
    }, exports.mfhd.decode = function(buf, offset) {
        return {
            sequenceNumber: buf.readUInt32BE(0)
        };
    }, exports.mfhd.encodingLength = function(box) {
        return 4;
    }, exports.tfhd = {}, exports.tfhd.encode = function(box, buf, offset) {
        return (buf = buf ? buf.slice(offset) : Buffer.alloc(4)).writeUInt32BE(box.trackId, 0), 
        exports.tfhd.encode.bytes = 4, buf;
    }, exports.tfhd.decode = function(buf, offset) {}, exports.tfhd.encodingLength = function(box) {
        return 4;
    }, exports.tfdt = {}, exports.tfdt.encode = function(box, buf, offset) {
        return (buf = buf ? buf.slice(offset) : Buffer.alloc(4)).writeUInt32BE(box.baseMediaDecodeTime || 0, 0), 
        exports.tfdt.encode.bytes = 4, buf;
    }, exports.tfdt.decode = function(buf, offset) {}, exports.tfdt.encodingLength = function(box) {
        return 4;
    }, exports.trun = {}, exports.trun.encode = function(box, buf, offset) {
        (buf = buf ? buf.slice(offset) : Buffer.alloc(8 + 16 * box.entries.length)).writeUInt32BE(box.entries.length, 0), 
        buf.writeInt32BE(box.dataOffset, 4);
        for (var ptr = 8, i = 0; i < box.entries.length; i++) {
            var entry = box.entries[i];
            buf.writeUInt32BE(entry.sampleDuration, ptr), ptr += 4, buf.writeUInt32BE(entry.sampleSize, ptr), 
            ptr += 4, buf.writeUInt32BE(entry.sampleFlags, ptr), ptr += 4, 0 === (box.version || 0) ? buf.writeUInt32BE(entry.sampleCompositionTimeOffset, ptr) : buf.writeInt32BE(entry.sampleCompositionTimeOffset, ptr), 
            ptr += 4;
        }
        exports.trun.encode.bytes = ptr;
    }, exports.trun.decode = function(buf, offset) {}, exports.trun.encodingLength = function(box) {
        return 8 + 16 * box.entries.length;
    }, exports.mdat = {}, exports.mdat.encode = function(box, buf, offset) {
        box.buffer ? (box.buffer.copy(buf, offset), exports.mdat.encode.bytes = box.buffer.length) : exports.mdat.encode.bytes = exports.mdat.encodingLength(box);
    }, exports.mdat.decode = function(buf, start, end) {
        return {
            buffer: Buffer.from(buf.slice(start, end))
        };
    }, exports.mdat.encodingLength = function(box) {
        return box.buffer ? box.buffer.length : box.contentLength;
    };
}
