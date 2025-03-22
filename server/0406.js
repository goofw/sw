function(module, exports, __webpack_require__) {
    "use strict";
    var async = __webpack_require__(38), fs = __webpack_require__(2), util = __webpack_require__(0), debug = (__webpack_require__(71).crc32, 
    __webpack_require__(41)("matroska:document")), schema = __webpack_require__(13), Element = __webpack_require__(407), tools = __webpack_require__(75);
    __webpack_require__(187), __webpack_require__(188), __webpack_require__(189), __webpack_require__(190), 
    __webpack_require__(191), __webpack_require__(192), __webpack_require__(193), __webpack_require__(194), 
    __webpack_require__(43), __webpack_require__(195), __webpack_require__(29), __webpack_require__(196), 
    __webpack_require__(197), __webpack_require__(136), __webpack_require__(137), __webpack_require__(138), 
    __webpack_require__(198), __webpack_require__(199), __webpack_require__(200), __webpack_require__(201), 
    __webpack_require__(202), __webpack_require__(203), __webpack_require__(204), __webpack_require__(205);
    var tagClasses = {};
    function Document() {
        this.type = "D", this._name = "Document", this.tagId = 0, this._nextTagId = 1, this.ownerDocument = this, 
        this.masterType = !0;
    }
    function removeList(list, tag) {
        if (!list || !list.length) return !1;
        var idx = list.indexOf(tag);
        return !(idx < 0 || (list.splice(idx, 1), 0));
    }
    tagClasses[schema.byName.Segment] = "segment3", tagClasses[schema.byName.Attachments] = "attachments", 
    tagClasses[schema.byName.AttachedFile] = "attachedFile", tagClasses[schema.byName.Tags] = "tags", 
    tagClasses[schema.byName.Tag] = "tag", tagClasses[schema.byName.Targets] = "targets", 
    tagClasses[schema.byName.SimpleTag] = "simpleTag", tagClasses[schema.byName.SeekHead] = "seekHead", 
    tagClasses[schema.byName.Seek] = "seek", tagClasses[schema.byName.Info] = "info", 
    tagClasses[schema.byName.Tracks] = "tracks", tagClasses[schema.byName.TrackEntry] = "trackEntry", 
    tagClasses[schema.byName.Video] = "video", tagClasses[schema.byName.Audio] = "audio", 
    tagClasses[schema.byName.CRC_32] = "crc-32", tagClasses[schema.byName.Cues] = "cues", 
    tagClasses[schema.byName.CuePoint] = "cuePoint", tagClasses[schema.byName.CueReference] = "cueReference", 
    tagClasses[schema.byName.CueTrackPositions] = "cueTrackPositions", util.inherits(Document, Element), 
    module.exports = Document, Document.prototype.createElement = function(ebmlID, start, length) {
        var element, tagClass = tagClasses[ebmlID];
        return tagClass ? ("string" == typeof tagClass && (tagClass = __webpack_require__(819)("./" + tagClass), 
        tagClasses[ebmlID] = tagClass), element = new tagClass(this, this._nextTagId++, start, length)) : element = new Element(this, this._nextTagId++, ebmlID, start, length), 
        element;
    }, Document.prototype._registerPosition = function(tag) {
        this._positions || (this._positions = []), this._positions.push(tag), this._modified && tag._markModified();
    }, Document.prototype._unregisterPosition = function(tag) {
        return removeList(this._positions, tag);
    }, Document.prototype._registerCRC = function(tag) {
        this._crcs || (this._crcs = []), this._crcs.push(tag);
    }, Document.prototype._unregisterCRC = function(tag) {
        return removeList(this._crcs, tag);
    }, Document.prototype._markModified = function() {
        if (!this._modified) {
            if (this._partial) throw new Error("Can not modify a partial parsed document");
            this._modified = !0, this._positions && this._positions.forEach((function(child) {
                child._markModified();
            }));
        }
    }, Document.prototype._buildLinks = function() {
        if (!this._linksBuilt && (this._linksBuilt = !0, this._positions)) {
            var self = this;
            this._positions.forEach((function(child) {
                var offset = child.getValue(), parent1 = child.getLevel1(), targetType = child._positionTargetType;
                switch (targetType) {
                  case "segment":
                    break;

                  case "clusterRelative":
                    var cp = child.parent.cueClusterPosition;
                    if (!cp) throw new Error("Invalid cluster relative without a cueClusterPosition");
                    offset += cp._positionTarget ? cp._positionTarget.getContentPosition() : cp;
                    break;

                  default:
                    throw new Error("Not supported ! (" + targetType + ")");
                }
                var target = parent1.getTagByPosition(offset, !0);
                debug.enabled && debug("Position #" + parent1.tagId + " " + offset + "=> " + (target ? "#" + target.tagID : "null")), 
                target && "start" === target.position ? child._positionTarget = target.target : self._partial || debug("Can not find target for offset=" + offset + " doc=" + self);
            }));
        }
    }, Document.prototype.write = function(stream, options, callback) {
        "function" == typeof options && 2 === arguments.length && (callback = options, options = null), 
        options = options || {};
        var self = this;
        if (this._partial) return callback(new Error("The document is not complete"));
        this._prepareDocument(options, (function(error) {
            if (error) return callback(error);
            self._computePositions((function(error) {
                if (error) return callback(error);
                var source = self.source;
                self._updateCRC32((function(error) {
                    if (error) return callback(error);
                    var closeStream = !1;
                    "string" == typeof stream && (stream = fs.createWriteStream(stream), closeStream = !0);
                    var writeSession = {
                        stream: stream,
                        options: options
                    };
                    self._write(writeSession, source, (function(error) {
                        if (error) return callback(error);
                        source.end(writeSession, (function(error) {
                            return error ? callback(error) : closeStream ? void stream.end(callback) : callback();
                        }));
                    }));
                }));
            }));
        }));
    }, Document.prototype._prepareDocument = function(options, callback) {
        return callback();
    }, Document.prototype._write = function(output, source, callback) {
        async.eachSeries(this.children, (function(child, callback) {
            child._write(output, source, callback);
        }), callback);
    }, Document.prototype._computePositions = function(estimatedFileSize, callback) {
        if (!this._positions || !this._positions.length) return callback();
        "function" == typeof estimatedFileSize && (callback = estimatedFileSize, estimatedFileSize = null), 
        estimatedFileSize || (estimatedFileSize = 0, this.children.forEach((function(child) {
            var s = child._getSize();
            estimatedFileSize += s;
        })));
        var bits = 8 * tools.sizeUInt(estimatedFileSize), max = Math.pow(2, bits) - 1, error = !1;
        if (this._positions.forEach((function(child) {
            child.setUInt(max);
            var target = child._positionTarget;
            target && child.getLevel1() === target.getLevel1() || (error = !0);
        })), error) return callback(error);
        for (var tx = 1, times = 5, changes = 1; changes && times; times--, tx++) changes = 0, 
        this._positions.forEach((function(child) {
            var target = child._positionTarget, level1 = target.getLevel1(), newPosition = target.getPosition() - level1.getContentPosition();
            newPosition !== child.getUInt() && (child.setUInt(newPosition), changes++);
        }));
        return callback();
    }, Document.prototype._updateCRC32 = function(callback) {
        var crcs = this._crcs;
        if (!crcs || !crcs.length) return callback();
        function depth(t) {
            for (var ret = 0; t; t = t.parent) ret++;
            return ret;
        }
        crcs.sort((function(t1, t2) {
            return depth(t2) - depth(t1);
        })), async.eachSeries(crcs, (function(crcTag, callback) {
            crcTag.parent._computeChildrenCRC(!0, null, (function(error, crc) {
                return error ? callback(error) : crcTag.data && crc == crcTag.getCRCValue() ? callback() : (crcTag.setCRCValue(crc), 
                void callback());
            }));
        }), callback);
    }, Document.prototype.getTagById = function(tagId) {
        if (isNaN(tagId)) throw new Error("Tag identifier is not supported (" + tagId + ")");
        return this.deepWalk((function(child) {
            if (child.tagId === tagId) return child;
        }));
    }, Document.prototype.toString = function() {
        return "[Document source=" + this.source + "]";
    };
}
