function(module, exports, __webpack_require__) {
    "use strict";
    function _optionalChain(ops) {
        let lastAccessLHS, value = ops[0], i = 1;
        for (;i < ops.length; ) {
            const op = ops[i], fn = ops[i + 1];
            if (i += 2, ("optionalAccess" === op || "optionalCall" === op) && null == value) return;
            "access" === op || "optionalAccess" === op ? (lastAccessLHS = value, value = fn(value)) : "call" !== op && "optionalCall" !== op || (value = fn(((...args) => value.call(lastAccessLHS, ...args))), 
            lastAccessLHS = void 0);
        }
        return value;
    }
    var _class, _class2, _class3, _class4;
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _events = __webpack_require__(5), RXX_EXTENSION = /\.R(\d\d)$|.RAR$/i, RAR_EXTENSION = /.RAR$/i, PARTXX_RAR_EXTENSION = /.PART(\d\d).RAR/i, makeRarFileBundle = (fileMedias = []) => ((fileMedias = []) => fileMedias.filter((file => file.name && file.name.match(PARTXX_RAR_EXTENSION))).length > 0)(fileMedias) ? new class {
        constructor(fileMedias = []) {
            this.fileMedias = fileMedias, this.fileMedias.length > 0 && (this.filter(), this.sort());
        }
        filter() {
            this.fileMedias = this.fileMedias.filter((file => file.name.match(PARTXX_RAR_EXTENSION)));
        }
        sort() {
            this.fileMedias.sort(((first, second) => {
                const firstMatch = first.name.match(PARTXX_RAR_EXTENSION), secondMatch = second.name.match(PARTXX_RAR_EXTENSION);
                return +(firstMatch && firstMatch[1] || 0) - +(secondMatch && secondMatch[1] || 0);
            }));
        }
        get length() {
            return this.fileMedias.length;
        }
        get fileNames() {
            return this.fileMedias.map((file => file.name));
        }
        get files() {
            return this.fileMedias;
        }
    }(fileMedias) : new class {
        constructor(fileMedias = []) {
            this.fileMedias = fileMedias, this.fileMedias.length > 0 && (this.filter(), this.sort());
        }
        filter() {
            this.fileMedias = this.fileMedias.filter((file => file.name && file.name.match(RXX_EXTENSION)));
        }
        sort() {
            this.fileMedias.sort(((first, second) => {
                if (first.name.match(RAR_EXTENSION)) return -1;
                if (second.name.match(RAR_EXTENSION)) return 1;
                {
                    const firstMatch = first.name.match(RXX_EXTENSION), secondMatch = second.name.match(RXX_EXTENSION);
                    return +(firstMatch && firstMatch[1] || 0) - +(secondMatch && secondMatch[1] || 0);
                }
            }));
        }
        get length() {
            return this.fileMedias.length;
        }
        get fileNames() {
            return this.fileMedias.map((file => file.name));
        }
        get files() {
            return this.fileMedias;
        }
    }(fileMedias), RarFileChunk = class _RarFileChunk {
        constructor(fileMedia, startOffset, endOffset) {
            this.fileMedia = fileMedia, this.startOffset = startOffset, this.endOffset = endOffset;
        }
        padEnd(endPadding) {
            return new _RarFileChunk(this.fileMedia, this.startOffset, this.endOffset - endPadding);
        }
        padStart(startPadding) {
            return new _RarFileChunk(this.fileMedia, this.startOffset + startPadding, this.endOffset);
        }
        get length() {
            return Math.max(0, this.endOffset - this.startOffset);
        }
        getStream() {
            return this.fileMedia.createReadStream({
                start: this.startOffset,
                end: this.endOffset
            });
        }
    }, _stream = __webpack_require__(3), InnerFileStream = class extends _stream.Readable {
        constructor(rarFileChunks, options) {
            super(options), this.rarFileChunks = rarFileChunks;
        }
        pushData(data) {
            this.push(data) || _optionalChain([ this, "access", _ => _.stream, "optionalAccess", _2 => _2.pause, "call", _3 => _3() ]);
        }
        get isStarted() {
            return !!this.stream;
        }
        next() {
            const chunk = this.rarFileChunks.shift();
            chunk ? (this.stream = chunk.getStream(), _optionalChain([ this, "access", _4 => _4.stream, "optionalAccess", _5 => _5.on, "call", _6 => _6("data", (data => this.pushData(data))) ]), 
            _optionalChain([ this, "access", _7 => _7.stream, "optionalAccess", _8 => _8.on, "call", _9 => _9("end", (() => this.next())) ])) : this.push(null);
        }
        _read() {
            this.isStarted ? _optionalChain([ this, "access", _10 => _10.stream, "optionalAccess", _11 => _11.resume, "call", _12 => _12() ]) : this.next();
        }
    }, streamToBuffer = async stream => new Promise(((resolve, reject) => {
        const buffers = [];
        stream.on("error", reject), stream.on("data", (data => buffers.push(data))), stream.on("end", (() => resolve(Buffer.concat(buffers))));
    })), MarkerHeaderParser = ((_class = class {
        constructor(headerBuffer) {
            this.headerBuffer = headerBuffer;
        }
        static __initStatic() {
            this.HEADER_SIZE = 11;
        }
        parse() {
            const crc = this.headerBuffer.readUInt16LE(0), type = this.headerBuffer.readUInt8(2), flags = this.headerBuffer.readUInt16LE(3);
            let size = this.headerBuffer.readUInt16LE(5);
            return 0 != (32768 & flags) && (size += this.headerBuffer.readUint32LE(7) || 0), 
            {
                crc: crc,
                type: type,
                flags: flags,
                size: size
            };
        }
    }).__initStatic(), _class), ArchiveHeaderParser = ((_class2 = class {
        constructor(buffer) {
            this.buffer = buffer;
        }
        static __initStatic2() {
            this.HEADER_SIZE = 13;
        }
        parse() {
            let vars = {
                crc: this.buffer.readUInt16LE(0),
                type: this.buffer.readUInt8(2),
                flags: this.buffer.readUInt16LE(3),
                size: this.buffer.readUInt16LE(5),
                reserved1: this.buffer.readUInt16LE(7),
                reserved2: this.buffer.readUInt32LE(9)
            };
            return Object.assign({
                hasVolumeAttributes: 0 != (1 & (parsedVars = vars).flags),
                hasComment: 0 != (2 & parsedVars.flags),
                isLocked: 0 != (4 & parsedVars.flags),
                hasSolidAttributes: 0 != (8 & parsedVars.flags),
                isNewNameScheme: 0 != (16 & parsedVars.flags),
                hasAuthInfo: 0 != (32 & parsedVars.flags),
                hasRecovery: 0 != (64 & parsedVars.flags),
                isBlockEncoded: 0 != (128 & parsedVars.flags),
                isFirstVolume: 0 != (256 & parsedVars.flags)
            }, vars);
            var parsedVars;
        }
    }).__initStatic2(), _class2), FileHeaderParser = ((_class3 = class {
        constructor(buffer) {
            _class3.prototype.__init.call(this), this.buffer = buffer;
        }
        static __initStatic3() {
            this.HEADER_SIZE = 280;
        }
        __init() {
            this.offset = 0;
        }
        handleHighFileSize(parsedVars) {
            if (parsedVars.hasHighSize) {
                const highPackSize = this.buffer.readInt32LE(this.offset);
                this.offset += 4;
                const highUnpackSize = this.buffer.readInt32LE(this.offset);
                this.offset += 4, parsedVars.size = 4294967296 * highPackSize + parsedVars.size, 
                parsedVars.unpackedSize = 4294967296 * highUnpackSize + parsedVars.unpackedSize;
            }
        }
        parseFileName(parsedVars) {
            let nameBuffer = this.buffer.subarray(this.offset, this.offset + parsedVars.nameSize);
            nameBuffer = Buffer.isBuffer(nameBuffer) ? nameBuffer : Buffer.from(nameBuffer), 
            parsedVars.name = nameBuffer.toString("utf8");
        }
        parseFlags(parsedVars) {
            return {
                continuesFromPrevious: 0 != (1 & parsedVars.flags),
                continuesInNext: 0 != (2 & parsedVars.flags),
                isEncrypted: 0 != (4 & parsedVars.flags),
                hasComment: 0 != (8 & parsedVars.flags),
                hasInfoFromPrevious: 0 != (16 & parsedVars.flags),
                hasHighSize: 0 != (256 & parsedVars.flags),
                hasSpecialName: 0 != (512 & parsedVars.flags),
                hasSalt: 0 != (1024 & parsedVars.flags),
                isOldVersion: 0 != (2048 & parsedVars.flags),
                hasExtendedTime: 0 != (4096 & parsedVars.flags)
            };
        }
        parse() {
            const crc = this.buffer.readUInt16LE(this.offset);
            this.offset += 2;
            const type = this.buffer.readUInt8(this.offset);
            this.offset += 1;
            const flags = this.buffer.readUInt16LE(this.offset);
            this.offset += 2;
            const headSize = this.buffer.readUInt16LE(this.offset);
            this.offset += 2;
            const size = this.buffer.readUInt32LE(this.offset);
            this.offset += 4;
            const unpackedSize = this.buffer.readUInt32LE(this.offset);
            this.offset += 4;
            const host = this.buffer.readUInt8(this.offset);
            this.offset += 1;
            const fileCrc = this.buffer.readUInt32LE(this.offset);
            this.offset += 4;
            const timestamp = this.buffer.readUInt32LE(this.offset);
            this.offset += 4;
            const version = this.buffer.readUInt8(this.offset);
            this.offset += 1;
            const method = this.buffer.readUInt8(this.offset);
            this.offset += 1;
            const nameSize = this.buffer.readUInt16LE(this.offset);
            this.offset += 2;
            const attributes = this.buffer.readUInt32LE(this.offset);
            this.offset += 4;
            let vars = {
                crc: crc,
                type: type,
                flags: flags,
                headSize: headSize,
                size: size,
                unpackedSize: unpackedSize,
                host: host,
                fileCrc: fileCrc,
                timestamp: timestamp,
                version: version,
                method: method,
                nameSize: nameSize,
                attributes: attributes,
                name: ""
            };
            const boolFlags = this.parseFlags(vars), header = Object.assign(vars, boolFlags);
            return this.handleHighFileSize(header), this.parseFileName(header), this.offset = 0, 
            header;
        }
    }).__initStatic3(), _class3), TerminatorHeaderParser = ((_class4 = class {
        constructor(headerBuffer) {
            this.headerBuffer = headerBuffer;
        }
        static __initStatic4() {
            this.HEADER_SIZE = 27;
        }
        parse() {
            return {
                crc: this.headerBuffer.readUInt16LE(0),
                type: this.headerBuffer.readUInt8(2),
                flags: this.headerBuffer.readUInt16LE(3),
                size: this.headerBuffer.readUInt16LE(5)
            };
        }
    }).__initStatic4(), _class4);
    function flatten(ary) {
        let ret = [];
        for (let i = 0; i < ary.length; i++) Array.isArray(ary[i]) ? ret = ret.concat(flatten(ary[i])) : ret.push(ary[i]);
        return ret;
    }
    var parseHeader = async (Parser, fileMedia, offset = 0) => {
        const stream = fileMedia.createReadStream({
            start: offset,
            end: offset + Parser.HEADER_SIZE
        });
        return new Parser(await streamToBuffer(stream)).parse();
    }, RarFilesPackage = class extends _events.EventEmitter {
        constructor(fileMedias) {
            super(), this.rarFileBundle = makeRarFileBundle(fileMedias);
        }
        async parseFile(rarFile, opts) {
            const fileChunks = [];
            let fileOffset = 0;
            const markerHead = await parseHeader(MarkerHeaderParser, rarFile);
            fileOffset += markerHead.size;
            const archiveHeader = await parseHeader(ArchiveHeaderParser, rarFile, fileOffset);
            fileOffset += archiveHeader.size;
            let countFiles = 0, retrievedFiles = 0;
            for (;fileOffset < rarFile.length - TerminatorHeaderParser.HEADER_SIZE; ) {
                let getFileChunk2 = function() {
                    if (48 !== fileHead.method) throw new Error("Decompression is not implemented");
                    return {
                        name: fileHead.name,
                        fileHead: fileHead,
                        chunk: new RarFileChunk(rarFile, fileOffset, fileOffset + fileHead.size - 1)
                    };
                };
                const fileHead = await parseHeader(FileHeaderParser, rarFile, fileOffset);
                if (116 !== fileHead.type) break;
                if (fileOffset += fileHead.headSize, opts.filter) {
                    if (opts.filter(fileHead.name, countFiles) && (fileChunks.push(getFileChunk2()), 
                    retrievedFiles++, opts.hasOwnProperty("maxFiles") && retrievedFiles === opts.maxFiles)) break;
                } else fileChunks.push(getFileChunk2());
                fileOffset += fileHead.size, countFiles++;
            }
            return this.emit("file-parsed", rarFile), fileChunks;
        }
        async parse(opts) {
            opts = opts || {}, this.emit("parsing-start", this.rarFileBundle);
            const parsedFileChunks = [], {files: files} = this.rarFileBundle;
            for (let i = 0; i < files.length; ++i) {
                const file = files[i], chunks = await this.parseFile(file, opts);
                if (!chunks.length) return this.emit("parsing-complete", []), [];
                const {fileHead: fileHead, chunk: chunk} = chunks[chunks.length - 1], chunkSize = Math.abs(chunk.endOffset - chunk.startOffset);
                let innerFileSize = fileHead.unpackedSize;
                if (parsedFileChunks.push(chunks), fileHead.continuesInNext) for (;Math.abs(innerFileSize - chunkSize) >= chunkSize; ) {
                    const nextFile = files[++i];
                    parsedFileChunks.push([ {
                        name: fileHead.name,
                        chunk: new RarFileChunk(nextFile, chunk.startOffset, chunk.endOffset)
                    } ]), this.emit("file-parsed", nextFile), innerFileSize -= chunkSize;
                }
            }
            const fileChunks = flatten(parsedFileChunks), grouped = (fn = f => f.name, object = fileChunks.reduce(((prev, curr) => {
                const groupKey = fn(curr), group = prev[groupKey] || [];
                return group.push(curr), Object.assign(prev, {
                    [groupKey]: group
                });
            }), {}), mapper = value => value.map((v => v.chunk)), Object.fromEntries(Object.entries(object).map((([key, value]) => [ key, mapper(value) ]))));
            var object, mapper, fn;
            const innerFiles = Object.entries(grouped).map((([name, chunks]) => new class {
                constructor(name, rarFileChunks) {
                    this.name = name, this.rarFileChunks = rarFileChunks, this.length = rarFileChunks.map((c => c.length)).reduce(((s, n) => s + n)), 
                    this.chunkMap = this.calculateChunkMap(rarFileChunks), this.name = name;
                }
                readToEnd() {
                    return streamToBuffer(this.createReadStream({
                        start: 0,
                        end: this.length - 1
                    }));
                }
                getChunksToStream(fileStart, fileEnd) {
                    const {index: startIndex, start: startOffset} = this.findMappedChunk(fileStart);
                    let {index: endIndex, end: endOffset} = this.findMappedChunk(fileEnd);
                    const chunksToStream = this.rarFileChunks.slice(startIndex, endIndex + 1), last = chunksToStream.length - 1;
                    chunksToStream[0] = chunksToStream[0].padStart(Math.abs(startOffset - fileStart));
                    let diff = Math.abs(endOffset - fileEnd);
                    return diff === this.rarFileChunks.length && (diff = 0), 0 !== diff && (chunksToStream[last] = chunksToStream[last].padEnd(diff)), 
                    chunksToStream;
                }
                createReadStream(interval) {
                    interval || (interval = {
                        start: 0,
                        end: this.length - 1
                    });
                    let {start: start, end: end} = interval;
                    if (start < 0 || end >= this.length) throw Error("Illegal start/end offset");
                    return new InnerFileStream(this.getChunksToStream(start, end));
                }
                calculateChunkMap(rarFileChunks) {
                    const chunkMap = [];
                    let index = 0, fileOffset = 0;
                    for (const chunk of rarFileChunks) {
                        const start = fileOffset, end = fileOffset + chunk.length;
                        fileOffset = end + 1, chunkMap.push({
                            index: index,
                            start: start,
                            end: end,
                            chunk: chunk
                        }), index++;
                    }
                    return chunkMap;
                }
                findMappedChunk(offset) {
                    let selectedMap = this.chunkMap[0];
                    for (const chunkMapping of this.chunkMap) if (offset >= chunkMapping.start && offset <= chunkMapping.end) {
                        selectedMap = chunkMapping;
                        break;
                    }
                    return selectedMap;
                }
            }(name, chunks)));
            return this.emit("parsing-complete", innerFiles), innerFiles;
        }
    }, _path = __webpack_require__(4), _fs = __webpack_require__(2);
    exports.LocalFileMedia = class {
        constructor(path) {
            this.path = path, this.name = _path.basename.call(void 0, path), this.length = _fs.statSync.call(void 0, path).size;
        }
        createReadStream(interval) {
            return _fs.createReadStream.call(void 0, this.path, interval);
        }
    }, exports.RarFilesPackage = RarFilesPackage;
}
