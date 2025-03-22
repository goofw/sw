function(module, exports, __webpack_require__) {
    "use strict";
    var async = __webpack_require__(38), fs = __webpack_require__(2), util = __webpack_require__(0), debug = (__webpack_require__(71).crc32, 
    __webpack_require__(40)("matroska:document")), schema = __webpack_require__(12), Element = __webpack_require__(273), tools = __webpack_require__(72), tagClasses = {};
    function Document() {
        this.type = "D", this._name = "Document", this.tagId = 0, this._nextTagId = 1, this.ownerDocument = this, 
        this.masterType = !0;
    }
    function removeList(list, tag) {
        if (!list || !list.length) return !1;
        var idx = list.indexOf(tag);
        return !(idx < 0 || (list.splice(idx, 1), 0));
    }
    tagClasses[schema.byName.Segment] = __webpack_require__(651), tagClasses[schema.byName.Attachments] = __webpack_require__(656), 
    tagClasses[schema.byName.AttachedFile] = __webpack_require__(657), tagClasses[schema.byName.Tags] = __webpack_require__(658), 
    tagClasses[schema.byName.Tag] = __webpack_require__(659), tagClasses[schema.byName.Targets] = __webpack_require__(660), 
    tagClasses[schema.byName.SimpleTag] = __webpack_require__(661), tagClasses[schema.byName.SeekHead] = __webpack_require__(662), 
    tagClasses[schema.byName.Seek] = __webpack_require__(663), tagClasses[schema.byName.Info] = __webpack_require__(664), 
    tagClasses[schema.byName.Tracks] = __webpack_require__(665), tagClasses[schema.byName.TrackEntry] = __webpack_require__(666), 
    tagClasses[schema.byName.Video] = __webpack_require__(667), tagClasses[schema.byName.Audio] = __webpack_require__(668), 
    tagClasses[schema.byName.CRC_32] = __webpack_require__(669), tagClasses[schema.byName.Cues] = __webpack_require__(670), 
    tagClasses[schema.byName.CuePoint] = __webpack_require__(671), tagClasses[schema.byName.CueReference] = __webpack_require__(672), 
    tagClasses[schema.byName.CueTrackPositions] = __webpack_require__(673), util.inherits(Document, Element), 
    module.exports = Document, Document.prototype.createElement = function(ebmlID, start, length) {
        var tagClass = tagClasses[ebmlID];
        return tagClass ? new tagClass(this, this._nextTagId++, start, length) : new Element(this, this._nextTagId++, ebmlID, start, length);
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
                    if (!cp) throw console.log("parent=", child.parent), new Error("Invalid cluster relative without a cueClusterPosition");
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
                    "string" == typeof stream && (console.log("Write to file ", stream), stream = fs.createWriteStream(stream), 
                    closeStream = !0);
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
            return target ? child.getLevel1() !== target.getLevel1() ? (console.error("Target and source have not the same Level1 target=" + target._name + "#" + target.tagId), 
            void (error = !0)) : void 0 : (console.error("No target for tag '" + child._name + "' #" + child.tagId), 
            void (error = !0));
        })), error) return callback(error);
        for (var tx = 1, times = 5, changes = 1; changes && times; times--, tx++) changes = 0, 
        this._positions.forEach((function(child) {
            var target = child._positionTarget, level1 = target.getLevel1(), newPosition = target.getPosition() - level1.getContentPosition();
            newPosition !== child.getUInt() && (child.setUInt(newPosition), changes++);
        })), console.log("Position pass #" + tx + ": " + changes + " modified positions");
        return callback();
    }, Document.prototype._updateCRC32 = function(callback) {
        var crcs = this._crcs;
        if (!crcs || !crcs.length) return console.log("No crc to compute ", crcs), callback();
        function depth(t) {
            for (var ret = 0; t; t = t.parent) ret++;
            return ret;
        }
        console.log(crcs.length + " crc to compute ..."), crcs.sort((function(t1, t2) {
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
