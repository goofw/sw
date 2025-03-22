function(module, exports, __webpack_require__) {
    "use strict";
    var debug = __webpack_require__(40)("matroska:decoder"), debugTag = __webpack_require__(40)("matroska:decoder:tag"), util = (__webpack_require__(2), 
    __webpack_require__(10).SlowBuffer, __webpack_require__(0)), Writable = __webpack_require__(3).Writable, Document2 = __webpack_require__(641), Source = __webpack_require__(275), FileSource = __webpack_require__(276), HttpSource = __webpack_require__(277), tools = __webpack_require__(72), schema = __webpack_require__(12);
    function Decoder(options) {
        Writable.call(this, options), options = options || {}, this.options = options, this.skipTags = options.skipTags, 
        void 0 === this.skipTags && (this.skipTags = {
            SimpleBlock: !0,
            Void: !0,
            Block: !0,
            FileData: !0,
            TagBinary: !0
        }), this._streamSession = {}, this.ignoreData = options.ignoreData, this._buffer = null, 
        this._tag_stack = [], this._state = 1, this._bufferOffset = 0, this._fileOffset = 0, 
        this._tagVint = {}, this._workingBuffer = new Buffer(64), this.document = new Document2, 
        this._skipTagData = !0 === this.ignoreData;
        var self = this;
        this.on("finish", (function() {
            self.document._buildLinks(), self.emit("$document", self.document);
        }));
    }
    module.exports = Decoder, util.inherits(Decoder, Writable), Decoder.OnlyMetaDatas = function() {
        return {
            skipTags: {
                SimpleBlock: !0,
                Void: !0,
                Block: !0,
                FileData: !0,
                Cluster: !0,
                Cues: !0,
                Tracks: !0
            }
        };
    }, Decoder.AllDatas = function() {
        return {
            skipTags: {}
        };
    }, Decoder.prototype._getStream = function(source, callback) {
        var self = this, enabled = !0;
        debug("Request stream ", self._readOffset), source.getStream(this._streamSession, {
            start: self._readOffset
        }, (function(error, stream) {
            if (error) return callback(error);
            self._fileOffset = self._readOffset, self._buffer = null, self._bufferOffset = 0, 
            self._skipBytes = 0, stream.on("end", (function() {
                enabled && (enabled = !1, callback(null, self.document));
            })), stream.on("error", (function(error) {
                enabled && callback(error);
            })), stream.on("readable", (function() {
                if (enabled) {
                    for (var bs = []; ;) {
                        var b = stream.read();
                        if (!b) break;
                        bs.push(b);
                    }
                    if (bs.length) {
                        var buffer = bs.length > 1 ? Buffer.concat(bs) : bs[0], bytesRead = buffer.length;
                        if (self._skipBytes) {
                            if (debug.enabled && debug("SkipBytes catch " + bytesRead + "/" + self._skipBytes), 
                            bytesRead <= self._skipBytes) return self._skipBytes -= bytesRead, void (self._fileOffset += bytesRead);
                            bytesRead = (buffer = buffer.slice(self._skipBytes)).length, self._fileOffset += self._skipBytes, 
                            self._skipBytes = 0;
                        }
                        self._readOffset += bytesRead;
                        var currentPosition = self._readOffset;
                        debug.enabled && debug("Buffer Read length=", bytesRead, " readOffset=" + self._readOffset + " fileOffset=" + self._fileOffset), 
                        self._write(buffer, null, (function() {
                            if (self._stop) return enabled = !1, void callback(self._parsingError, self.document);
                            if (self._skipBytes) {
                                if (debug.enabled && debug("skipBytes " + self._skipBytes), self._buffer) {
                                    var left = self._buffer.length - self._bufferOffset;
                                    if (debug("skipBytes left=" + left), self._skipBytes <= left) return self._bufferOffset += self._skipBytes, 
                                    self._fileOffset += self._skipBytes, void (self._skipBytes = 0);
                                    self._skipBytes -= left, self._fileOffset += left, self._buffer = null, self._bufferOffset = 0;
                                }
                                if (self._skipBytes < 32e3) return;
                                self._readOffset += self._skipBytes;
                            }
                            return currentPosition !== self._readOffset ? (debug.enabled && debug("Read offset changed to " + self._readOffset), 
                            enabled = !1, stream.destroy(), void setImmediate(self._getStream.bind(self, source, callback))) : void 0;
                        }));
                    } else debug("No buffer");
                }
            }));
        }));
    }, Decoder.prototype.parse = function(source, callback) {
        if (this.document.children) return callback(new Error("Document has already children"));
        if ("string" == typeof source && (source = /^http:\/\//.test(source) ? new HttpSource(source) : new FileSource(source)), 
        source instanceof Source == 0) throw new Error("Invalid source parameter (" + source + ")");
        this.document.source = source, this._skipTagData = !0 === this.ignoreData, this._readOffset = 0;
        var self = this;
        this._getStream(source, (function(error, document) {
            source.end(self._streamSession, (function() {
                document && document._buildLinks(), callback(error, document);
            }));
        }));
    }, Decoder.prototype._write = function(chunk, enc, done) {
        if (debug.enabled && debug("State=" + this._state + " skip=" + this._skipBytes + " bufferOffset=" + this._bufferOffset + " chunk=" + chunk.length), 
        4 === this._state) {
            if (this._skipBytes >= chunk.length ? (this._skipBytes -= chunk.length, this._fileOffset += chunk.length, 
            this._bufferOffset = 0, chunk = null) : (this._fileOffset += this._skipBytes, this._bufferOffset = this._skipBytes, 
            this._skipBytes = 0), this._skipBytes || (this._skipEndFunc && (this._skipEndFunc(), 
            this._skipEndFunc = null), this._state = 1), !chunk || !chunk.length) return void done();
            this._buffer = null;
        }
        if (this._buffer) {
            var buf = this._buffer;
            this._bufferOffset && (buf = buf.slice(this._bufferOffset)), this._buffer = Buffer.concat([ buf, chunk ]);
        } else this._buffer = chunk;
        this._bufferOffset = 0;
        try {
            for (;!this._stop && this._buffer && this._bufferOffset < this._buffer.length; ) if (1 !== this._state) {
                if (2 !== this._state) {
                    if (3 !== this._state) {
                        if (4 === this._state) break;
                        debug("Invalid state ", this._state);
                    } else if (!this.readContent()) break;
                } else if (!this.readSize()) break;
            } else if (!this.readTag()) break;
        } catch (x) {
            return console.error(x), this._parsingError = x, this._stop = !0, void done();
        }
        this._buffer && this._bufferOffset === this._buffer.length && (this._buffer = null, 
        this._bufferOffset = 0), done();
    }, Decoder.prototype.readTag = function() {
        debugTag.enabled && debugTag("parsing tag");
        var tag, start = this._fileOffset;
        try {
            tag = tools.readHInt(this._buffer, this._bufferOffset, this._tagVint);
        } catch (x) {
            throw x;
        }
        if (null === tag) return !this._EBMLFormatVerified && this._buffer.length > 7 ? (debug("Invalid format !"), 
        this._parsingError = new Error("Invalid format for " + this.document), this._stop = !0, 
        !1) : (debug("waiting for more data"), !1);
        if (!this._EBMLFormatVerified) {
            if (tag.value !== schema.byName.EBML) return debug("Invalid format !"), this._parsingError = new Error("Invalid format for " + this.document), 
            this._stop = !0, !1;
            this._EBMLFormatVerified = !0;
        }
        this._bufferOffset += tag.length, this._fileOffset += tag.length, this._state = 2;
        var parent, stack = this._tag_stack;
        stack.length && (parent = stack[stack.length - 1]);
        var tagObj = this.document.createElement(tag.value, start, tag.length);
        return (parent || this.document).appendChild(tagObj, !1), stack.push(tagObj), debugTag.enabled && debugTag("push tag: " + util.inspect(tagObj, {
            depth: 1
        })), !0;
    }, Decoder.prototype.readSize = function() {
        var tagObj = this._tag_stack[this._tag_stack.length - 1];
        debugTag.enabled && debugTag("parsing size for tag: 0x" + tagObj.ebmlID.toString(16));
        var size = tools.readVInt(this._buffer, this._bufferOffset, this._tagVint);
        if (null === size) return debugTag.enabled && debugTag("waiting for more data (size is null) " + this._bufferOffset + "/" + this._buffer.length), 
        !1;
        if (size.value < 0) throw new Error("Invalid size " + size.value + " cursor=" + this._bufferOffset + " buffer=" + this._buffer.length);
        return this._bufferOffset += size.length, this._fileOffset += size.length, this._state = 3, 
        tagObj._setDataSize(size.value, size.length), debugTag.enabled && debugTag("read size: " + size.value), 
        0 !== size.value || this.endContent(tagObj);
    }, Decoder.prototype.readContent = function() {
        var stack = this._tag_stack, tag = stack[stack.length - 1];
        if (debugTag.enabled && debugTag("parsing content for tag: " + tag.ebmlID.toString(16)), 
        tag.masterType) {
            if (debugTag.enabled && debugTag("content should be tags"), this.emit(tag._name, tag), 
            this._state = 1, this.skipTags && this.skipTags[tag._name]) {
                stack.pop();
                var leftBytes = this._buffer.length - this._bufferOffset, contentBytes = tag.end - this._fileOffset;
                return contentBytes >= leftBytes ? (this._skipBytes = contentBytes - leftBytes, 
                this._fileOffset += leftBytes, this._buffer = null, this._bufferOffset = 0, this._state = 4, 
                !1) : (this._bufferOffset += contentBytes, this._fileOffset += contentBytes, !0);
            }
            return !0;
        }
        if ((leftBytes = this._buffer.length - this._bufferOffset) < tag.dataSize) return debugTag.enabled && debugTag("waiting for more data: got=" + leftBytes, "need=" + (tag.dataSize - leftBytes)), 
        (this._skipTagData || this.skipTags && this.skipTags[tag._name]) && (this._skipBytes = tag.dataSize - leftBytes, 
        this._fileOffset += leftBytes, this._buffer = null, this._bufferOffset = 0, this._state = 4, 
        this._skipEndFunc = this.endContent.bind(this, tag)), !1;
        if (debugTag.enabled && debugTag("Get content data: got=" + leftBytes, "need=" + (tag.dataSize - leftBytes)), 
        !(this.ignoreData || this.skipTags && this.skipTags[tag._name])) {
            var data = this._buffer.slice(this._bufferOffset, this._bufferOffset + tag.dataSize);
            tag._setData(data);
        }
        return this._fileOffset += tag.dataSize, this._buffer = this._buffer.slice(this._bufferOffset + tag.dataSize), 
        this._bufferOffset = 0, this.endContent(tag);
    }, Decoder.prototype.endContent = function(tagObj) {
        var stack = this._tag_stack;
        for (stack.pop(); stack.length; ) {
            var topElement = stack[stack.length - 1];
            if (this._fileOffset < topElement.end) break;
            debugTag.enabled && debugTag("Pop " + topElement._name), this.emit(topElement._name + ":end", topElement), 
            stack.pop();
        }
        return this.emit(tagObj._name, tagObj), debugTag.enabled && (tagObj.data ? tagObj.data.length <= 128 ? debugTag('read data: len="+tagData.length+" value=0x' + tagObj.data.toString("hex")) : debugTag("read data:", tagObj.data) : debugTag("read data: NULL")), 
        debugTag.enabled && debugTag("Push " + util.inspect(tagObj, {
            depth: 0
        })), this._state = 1, !0;
    }, Decoder.parseInfoTagsAndAttachments = function(source, callback) {
        new Decoder(Decoder.OnlyMetaDatas()).parseEbmlIDs(source, [ schema.byName.Info, schema.byName.Tags, schema.byName.Attachments ], callback);
    }, Decoder.prototype.parseEbmlIDs = function(source, ebmlIDs, callback) {
        util.isArray(ebmlIDs) || (ebmlIDs = [ ebmlIDs ]), this.document._partial = !0;
        var segmentContentPosition, self = this, toParse = {}, targets = {}, positions = [];
        function nextPosition() {
            if (positions.length) {
                var position = positions.shift(), newOffset = segmentContentPosition + position;
                if (debug.enabled && debug("New offset=" + newOffset, "fileOffset=", self._fileOffset, "bufferOffset=", self._bufferOffset, "buffer.length=", self._buffer.length), 
                self._buffer) {
                    var start = self._fileOffset - self._bufferOffset;
                    if (newOffset >= start && newOffset < start + self._buffer.length) return self._fileOffset = newOffset, 
                    self._bufferOffset = newOffset - start, self._skipBytes = 0, void (self._state = 1);
                }
                if (newOffset > self._readOffset) return self._skipBytes = newOffset - self._readOffset, 
                self._fileOffset = self._readOffset, self._buffer = null, self._bufferOffset = 0, 
                void (self._state = 1);
                self._readOffset = newOffset, self._fileOffset = newOffset, self._buffer = null, 
                self._bufferOffset = 0, self._skipBytes = 0, self._state = 1;
            } else self._stop = !0;
        }
        ebmlIDs.forEach((function(name) {
            var ebmlID = tools.convertEbmlID(name);
            if (!toParse[ebmlID]) {
                toParse[ebmlID] = !0;
                var ebmlName = schema.byEbmlID[ebmlID].name;
                self.on(ebmlName, (function(tag) {
                    targets[tag.ebmlID] = tag;
                })), self.on(ebmlName + ":end", (function(tag) {
                    nextPosition();
                }));
            }
        })), this.on("Seek:end", (function(tag) {
            var sid = tag.seekID;
            toParse[sid] && positions.push(tag.seekPosition);
        })), this.on("SeekHead:end", (function(seekHead) {
            segmentContentPosition = seekHead.getLevel1().getContentPosition(), positions.sort((function(v1, v2) {
                return v1 - v2;
            })), nextPosition();
        })), this.parse(source, (function(error, document) {
            if (error) return callback(error);
            callback(null, self.document, targets);
        }));
    };
}
