function(module, exports, __webpack_require__) {
    var INFLATE = __webpack_require__(729), bops = __webpack_require__(177), Reader = exports.Reader = function(data) {
        if (!(this instanceof Reader)) return new Reader(data);
        this._source = new BufferSource(data), this._offset = 0;
    };
    function BufferSource(buffer) {
        this._buffer = buffer, this.length = function() {
            return buffer.length;
        }, this.read = function(start, length) {
            return bops.subarray(this._buffer, start, start + length);
        };
    }
    Reader.prototype.length = function() {
        return this._source.length();
    }, Reader.prototype.position = function() {
        return this._offset;
    }, Reader.prototype.seek = function(offset) {
        this._offset = offset;
    }, Reader.prototype.read = function(length) {
        var bytes = this._source.read(this._offset, length);
        return this._offset += length, bytes;
    }, Reader.prototype.readInteger = function(length, bigEndian) {
        return bigEndian ? bytesToNumberBE(this.read(length)) : bytesToNumberLE(this.read(length));
    }, Reader.prototype.readString = function(length, charset) {
        return bops.to(this.read(length), charset || "utf8");
    }, Reader.prototype.readUncompressed = function(length, method) {
        var compressed = this.read(length), uncompressed = null;
        if (0 === method) uncompressed = compressed; else {
            if (8 !== method) throw new Error("Unknown compression method: " + structure.compression_method);
            uncompressed = INFLATE.inflate(compressed);
        }
        return uncompressed;
    }, Reader.prototype.readStructure = function() {
        var structure = {};
        switch (structure.signature = this.readInteger(4), structure.signature) {
          case 67324752:
            this.readLocalFileHeader(structure);
            break;

          case 33639248:
            this.readCentralDirectoryFileHeader(structure);
            break;

          case 101010256:
            this.readEndOfCentralDirectoryRecord(structure);
            break;

          default:
            throw new Error("Unknown ZIP structure signature: 0x" + structure.signature.toString(16));
        }
        return structure;
    }, Reader.prototype.readLocalFileHeader = function(structure) {
        if ((structure = structure || {}).signature || (structure.signature = this.readInteger(4)), 
        67324752 !== structure.signature) throw new Error("ZIP local file header signature invalid (expects 0x04034b50, actually 0x" + structure.signature.toString(16) + ")");
        structure.version_needed = this.readInteger(2), structure.flags = this.readInteger(2), 
        structure.compression_method = this.readInteger(2), structure.last_mod_file_time = this.readInteger(2), 
        structure.last_mod_file_date = this.readInteger(2), structure.crc_32 = this.readInteger(4), 
        structure.compressed_size = this.readInteger(4), structure.uncompressed_size = this.readInteger(4), 
        structure.file_name_length = this.readInteger(2), structure.extra_field_length = this.readInteger(2);
        var n = structure.file_name_length, m = structure.extra_field_length;
        return structure.file_name = this.readString(n), structure.extra_field = this.read(m), 
        structure;
    }, Reader.prototype.readCentralDirectoryFileHeader = function(structure) {
        if ((structure = structure || {}).signature || (structure.signature = this.readInteger(4)), 
        33639248 !== structure.signature) throw new Error("ZIP central directory file header signature invalid (expects 0x02014b50, actually 0x" + structure.signature.toString(16) + ")");
        structure.version = this.readInteger(2), structure.version_needed = this.readInteger(2), 
        structure.flags = this.readInteger(2), structure.compression_method = this.readInteger(2), 
        structure.last_mod_file_time = this.readInteger(2), structure.last_mod_file_date = this.readInteger(2), 
        structure.crc_32 = this.readInteger(4), structure.compressed_size = this.readInteger(4), 
        structure.uncompressed_size = this.readInteger(4), structure.file_name_length = this.readInteger(2), 
        structure.extra_field_length = this.readInteger(2), structure.file_comment_length = this.readInteger(2), 
        structure.disk_number = this.readInteger(2), structure.internal_file_attributes = this.readInteger(2), 
        structure.external_file_attributes = this.readInteger(4), structure.local_file_header_offset = this.readInteger(4);
        var n = structure.file_name_length, m = structure.extra_field_length, k = structure.file_comment_length;
        return structure.file_name = this.readString(n), structure.extra_field = this.read(m), 
        structure.file_comment = this.readString(k), structure.mode = this.detectChmod(structure.version, structure.external_file_attributes), 
        structure;
    }, Reader.prototype.detectChmod = function(versionMadeBy, externalFileAttributes) {
        var mode = externalFileAttributes >>> 16, chmod = !1;
        return mode &= 511, 3 != versionMadeBy >> 8 || "darwin" !== process.platform && "linux" !== process.platform || (chmod = mode.toString(8)), 
        chmod;
    }, Reader.prototype.locateEndOfCentralDirectoryRecord = function() {
        for (var length = this.length(), minPosition = length - Math.pow(2, 16) - 22, position = length - 22 + 1; --position; ) {
            if (position < minPosition) throw new Error("Unable to find end of central directory record");
            if (this.seek(position), 101010256 === this.readInteger(4) && (this.seek(position + 20), 
            position + 22 + this.readInteger(2) === length)) break;
        }
        return this.seek(position), position;
    }, Reader.prototype.readEndOfCentralDirectoryRecord = function(structure) {
        if ((structure = structure || {}).signature || (structure.signature = this.readInteger(4)), 
        101010256 !== structure.signature) throw new Error("ZIP end of central directory record signature invalid (expects 0x06054b50, actually 0x" + structure.signature.toString(16) + ")");
        structure.disk_number = this.readInteger(2), structure.central_dir_disk_number = this.readInteger(2), 
        structure.central_dir_disk_records = this.readInteger(2), structure.central_dir_total_records = this.readInteger(2), 
        structure.central_dir_size = this.readInteger(4), structure.central_dir_offset = this.readInteger(4), 
        structure.file_comment_length = this.readInteger(2);
        var n = structure.file_comment_length;
        return structure.file_comment = this.readString(n), structure;
    }, Reader.prototype.readDataDescriptor = function() {
        var descriptor = {};
        return descriptor.crc_32 = this.readInteger(4), 134695760 === descriptor.crc_32 && (descriptor.crc_32 = this.readInteger(4)), 
        descriptor.compressed_size = this.readInteger(4), descriptor.uncompressed_size = this.readInteger(4), 
        descriptor;
    }, Reader.prototype.iterator = function() {
        var stream = this;
        stream.locateEndOfCentralDirectoryRecord();
        var endRecord = stream.readEndOfCentralDirectoryRecord();
        stream.seek(endRecord.central_dir_offset);
        var count = endRecord.central_dir_disk_records;
        return {
            next: function() {
                if (0 == count--) throw "stop-iteration";
                var centralHeader = stream.readCentralDirectoryFileHeader(), saved = stream.position();
                stream.seek(centralHeader.local_file_header_offset);
                var localHeader = stream.readLocalFileHeader(), start = stream.position();
                return stream.seek(saved), new Entry(localHeader, stream, start, centralHeader.compressed_size, centralHeader.compression_method, centralHeader.mode);
            }
        };
    }, Reader.prototype.forEach = function(block, context) {
        for (var next, iterator = this.iterator(); ;) {
            try {
                next = iterator.next();
            } catch (exception) {
                if ("stop-iteration" === exception) break;
                if ("skip-iteration" === exception) continue;
                throw exception;
            }
            block.call(context, next);
        }
    }, Reader.prototype.toObject = function(charset) {
        var object = {};
        return this.forEach((function(entry) {
            if (entry.isFile()) {
                var data = entry.getData();
                charset && (data = data.toString(charset)), object[entry.getName()] = data;
            }
        })), object;
    }, Reader.prototype.close = function(mode, options) {};
    var Entry = exports.Entry = function(header, realStream, start, compressedSize, compressionMethod, mode) {
        this._mode = mode, this._header = header, this._realStream = realStream, this._stream = null, 
        this._start = start, this._compressedSize = compressedSize, this._compressionMethod = compressionMethod;
    };
    Entry.prototype.getName = function() {
        return this._header.file_name;
    }, Entry.prototype.isFile = function() {
        return !this.isDirectory();
    }, Entry.prototype.isDirectory = function() {
        return "/" === this.getName().slice(-1);
    }, Entry.prototype.lastModified = function() {
        return decodeDateTime(this._header.last_mod_file_date, this._header.last_mod_file_time);
    }, Entry.prototype.getData = function() {
        if (null == this._stream) {
            var bookmark = this._realStream.position();
            this._realStream.seek(this._start), this._stream = this._realStream.readUncompressed(this._compressedSize, this._compressionMethod), 
            this._realStream.seek(bookmark);
        }
        return this._stream;
    }, Entry.prototype.getMode = function() {
        return this._mode;
    };
    var bytesToNumberLE = function(bytes) {
        for (var acc = 0, i = 0; i < bytes.length; i++) acc += bops.readUInt8(bytes, i) << 8 * i;
        return acc;
    }, bytesToNumberBE = function(bytes) {
        for (var acc = 0, i = 0; i < bytes.length; i++) acc = (acc << 8) + bops.readUInt8(bytes, i);
        return acc;
    }, decodeDateTime = function(date, time) {
        return new Date(1980 + (date >>> 9), (date >>> 5 & 15) - 1, 31 & date, time >>> 11 & 31, time >>> 5 & 63, 2 * (63 & time));
    };
}
