function(module, exports, __webpack_require__) {
    "use strict";
    var assert = __webpack_require__(24), async = __webpack_require__(38), crc32 = __webpack_require__(71).crc32, stream = __webpack_require__(3), util = __webpack_require__(0), fs = __webpack_require__(2), debug = __webpack_require__(41)("matroska:element"), schema = __webpack_require__(13), tools = __webpack_require__(75), MillenniumTime = Date.UTC(2001, 0, 1);
    function Element(doc, tagId, ebmlID, start, length) {
        if (!doc || "D" !== doc.type) throw new Error("Invalid document");
        this.ownerDocument = doc, this.tagId = tagId;
        var schemaInfo = schema.byEbmlID[ebmlID];
        schemaInfo || (schemaInfo = {
            type: "unknown",
            name: "EBMLID(0x" + ebmlID.toString(16) + ")"
        }), this.ebmlID = ebmlID, this.schemaInfo = schemaInfo, this.type = schemaInfo.type, 
        this._name = schemaInfo.name, isNaN(start) || (this.start = start, this.length = length || 0, 
        this.end = this.start + this.length), "m" === this.type && (this.masterType = !0);
    }
    function addCRC(crc, value) {
        var old = crc.value;
        crc.value = void 0 === old ? crc32(value) : crc32(value, crc.value);
    }
    module.exports = Element, Element.prototype._setDataSize = function(dataSize, lengthTagSize) {
        this.dataSize = dataSize, this.lengthTagSize = lengthTagSize, this.length += dataSize + lengthTagSize, 
        this.end = this.start + this.length;
    }, Element.prototype._setData = function(data) {
        this.data = data;
    }, Element.prototype.getFirstChildByName = function(name) {
        return this.eachChildByName(name, (function(child) {
            return child;
        }));
    }, Element.prototype.listChildrenByName = function(name) {
        var ls = [];
        return this.eachChildByName(name, (function(child) {
            ls.push(child);
        })), ls;
    }, Element.prototype.eachChildByName = function(name, func) {
        var ebmlID = tools.convertEbmlID(name);
        if (func || (func = function(child) {
            return child;
        }), this.children) for (var children = this.children.slice(0); children.length; ) {
            var child = children.shift();
            if (child.ebmlID !== ebmlID) {
                if (child.children) {
                    var sp = [ 0, 0 ].concat(child.children);
                    children.splice.apply(children, sp);
                }
            } else {
                var ret = func(child);
                if (void 0 !== ret) return ret;
            }
        }
    }, Element.prototype.getDirectChildByName = function(name) {
        var ebmlID = tools.convertEbmlID(name), children = this.children;
        if (children && children.length) {
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child.ebmlID === ebmlID) return child;
            }
            return null;
        }
    }, Element.prototype.loadData = function(callback) {
        return callback("Not filled yet");
    }, Element.prototype.getString = function() {
        return this.getBuffer().toString("ascii");
    }, Element.prototype.getUTF8 = function() {
        return this.getBuffer().toString("utf8");
    }, Element.prototype.getValue = function() {
        switch (this.type) {
          case "s":
            return this.getString();

          case "8":
            return this.getUTF8();

          case "i":
            return this.getInt();

          case "u":
            var u = this.getUInt();
            return 0 !== u && 1 !== u || !this.schemaInfo || "0-1" !== this.schemaInfo.range || (u = u > 0), 
            u;

          case "b":
            return this.data;

          case "f":
            return this.getFloat();

          case "d":
            return this.getDate();
        }
        throw new Error("Type not supported !");
    }, Element.prototype.getBuffer = function() {
        if (!this.data) throw new Error("Data is not loaded ! (tagId=#" + this.tagId + ")");
        return this.data;
    }, Element.prototype.getInt = function() {
        var data = this.getBuffer(), f = data.readIntBE(0, Math.min(data.length, 6));
        if (data.length <= 6) return f;
        for (var i = 6; i < data.length; i++) f = 256 * f + data[i];
        return f;
    }, Element.prototype.getUInt = function() {
        var data = this.getBuffer(), f = data.readUIntBE(0, Math.min(data.length, 6));
        if (data.length <= 6) return f;
        for (var i = 6; i < data.length; i++) f = 256 * f + data[i];
        return f;
    }, Element.prototype.getDataSize = function() {
        return this.data ? this.data.length : this.dataSize || 0;
    }, Element.prototype.getCRCValue = function() {
        var data = this.getBuffer();
        if (!data || 4 != data.length || "b" !== this.type) throw new Error("Invalid data");
        return tools.readCRC(data);
    }, Element.prototype.setFileDataSource = function(path, callback) {
        var self = this;
        fs.stat(path, (function(error, stats) {
            return self.data = void 0, self.type = "b", self.dataSize = stats.size, self._dataSource = {
                getStream: function(options, callback) {
                    return "function" == typeof options && (callback = options, options = null), callback(null, fs.createReadStream(path, options));
                },
                info: path
            }, self._markModified(), callback(null, self);
        }));
    }, Element.prototype.setCRCValue = function(crc) {
        var data = tools.writeCRC(crc);
        this.data = data, this.type = "b", this._markModified();
    }, Element.prototype.getFloat = function() {
        var data = this.getBuffer();
        switch (data.length) {
          case 4:
            return data.readFloatBE(0);

          case 8:
            return data.readDoubleBE(0);
        }
        throw new Error("Illegal float size " + data.length + ".");
    }, Element.prototype.getDateNanos = function() {
        return this.getUInt();
    }, Element.prototype.getDate = function() {
        var f = this.getBuffer().readUIntBE(0, 6);
        return new Date(MillenniumTime + 256 * f * 256 / 1e3 / 1e3);
    }, Element.prototype.print = function(level) {
        level = level || 0;
        var s = "             " + (this.start || 0);
        s = s.substring(s.length - 10);
        var si = this.tagId + "             ";
        if (s += "#" + si.substring(0, 5) + " ", level) for (var i = 0; i < level; i++) s += "  ";
        s += "* " + this._name;
        var dataLength = this.data && this.data.length || this.dataSize || "";
        try {
            if (this.masterType) "D" === this.type && (s += "  " + this.source), void 0 === this.start || (s += "  children[size=" + (this.end - this.start) + "]"); else if ("u" === this.type) s += "  u[" + dataLength + "]=" + this.getUInt(); else if ("i" === this.type) s += "  i[" + dataLength + "]=" + this.getInt(); else if ("s" === this.type) s += "  s[" + dataLength + "]='" + this.getString() + "'"; else if ("8" === this.type) s += "  8[" + dataLength + "]='" + (dataLength && this.getUTF8()) + "'"; else if ("f" === this.type) s += "  f[" + dataLength + "]=" + this.getFloat(); else if ("d" === this.type) s += "  d[" + dataLength + "]=" + this.getDate(); else if ("b" === this.type) if (this.dataSize || this.data) if (s += "  b[" + dataLength + "]", 
            this.data) {
                if (s += "=" + this.data.slice(0, Math.min(32, this.data.length)).toString("hex"), 
                this.ebmlID === schema.byName.SeekID) {
                    var targetEbmlID = this.getUInt(), tid = schema.byEbmlID[targetEbmlID];
                    s += tid ? " => " + tid.name : " => ? ";
                }
            } else this._dataSource && (s += "  {dataSource=" + this._dataSource.info + "}"); else s += "  b[]";
            this._positionTarget && (s += "  [=>#" + this._positionTarget.tagId + "]"), this._modified && (s += "  [MODIFIED]");
        } catch (x) {
            s += " error=" + x, debug.enabled && debug("Error for node #" + this.id, x);
        }
        return s += "\n", this.children && this.children.forEach((function(child) {
            s += child.print(level + 1);
        })), s;
    }, Element.prototype.setString = function(newValue) {
        this.data = new Buffer(newValue, "ascii"), this.type = "s", this._markModified();
    }, Element.prototype.setUTF8 = function(newValue) {
        this.data = new Buffer(newValue, "utf8"), this.type = "8", this._markModified();
    }, Element.prototype.setInt = function(newValue) {
        var b = tools.writeInt(newValue);
        this.data = b, this.type = "i", this._markModified();
    }, Element.prototype.setUInt = function(newValue) {
        var b = tools.writeUInt(newValue);
        this.data = b, this.type = "u", this._markModified();
    }, Element.prototype.setFloat = function(newValue) {
        var b = new Buffer(4);
        b.writeFloatBE(newValue, 0), b.readFloatBE(0) !== newValue && (b = new Buffer(8)).writeDoubleBE(newValue, 0), 
        this.type = "f", this.data = b, this._markModified();
    }, Element.prototype.setDateNanos = function(newValue) {
        return this.setDate(newValue);
    }, Element.prototype.setDate = function(newValue) {
        var b = new Buffer(8);
        if (newValue.getTime) {
            var ms = newValue.getTime();
            newValue = 3.90625 * (ms - MillenniumTime) * 3.90625;
        } else isNaN(newValue) || (newValue /= 65536);
        if ("number" != typeof newValue) throw new Error("Invalid date value '" + newValue + "'");
        b.writeUIntBE(newValue, 0, 6), this.type = "d", this.data = b, this._markModified();
    }, Element.prototype.setData = function(newValue) {
        this.data = new Buffer(newValue), this.type = "b", this._markModified();
    }, Element.prototype._markModified = function() {
        if (!this._modified) {
            this._modified = {
                start: this.start,
                end: this.end
            }, this.start = void 0, this.end = void 0, this.length = void 0, this.lengthTagSize = void 0;
            var parent = this.parent;
            parent && parent._markModified();
        }
    }, Element.prototype.setValue = function(newValue) {
        if ("string" == typeof newValue) return "s" === this.type ? void this.setString(newValue) : void this.setUTF8(newValue);
        if ("boolean" == typeof newValue && (newValue = newValue ? 1 : 0), "number" == typeof newValue) return Math.floor(newValue) !== newValue ? void this.setFloat(newValue) : newValue >= 0 ? void this.setUInt(newValue) : void this.setInt(newValue);
        if (newValue && newValue.getTime) this.setDate(newValue); else {
            if (!Buffer.isBuffer(newValue) && !util.isArray(newValue)) throw new Error("Unsupported type of value (" + newValue + ")");
            this.setData(newValue);
        }
    }, Element.prototype.setTargetPosition = function(target) {
        this._positionTarget = target;
    }, Element.prototype.setTargetEbmlID = function(ebmlID) {
        ebmlID.ebmlID && (ebmlID = ebmlID.ebmlID);
        var data = tools.writeEbmlID(ebmlID);
        this.setData(data);
    }, Element.prototype._getSize = function() {
        if (!this._modified && void 0 !== this.start) return assert("number" == typeof this.end, "End of #" + this.tagId + " is not a number"), 
        assert("number" == typeof this.start, "Start of #" + this.tagId + " is not a number"), 
        this.end - this.start;
        if (!this.masterType) {
            var dataLength = this.getDataSize();
            return assert("number" == typeof dataLength, "Data size of #" + this.tagId + " is not a number"), 
            tools.sizeHInt(this.ebmlID) + tools.sizeVInt(dataLength) + dataLength;
        }
        var totalSize = 0;
        return this.children && this.children.forEach((function(child) {
            var s = child._getSize();
            assert("number" == typeof s, "Size of #" + child.tagId + " is not a number"), totalSize += s;
        })), tools.sizeHInt(this.ebmlID) + tools.sizeVInt(totalSize) + totalSize;
    }, Element.prototype._optimizeData = function() {
        if (!this.data) return 0;
        if ("u" === this.type) {
            var u = this.getUInt();
            return tools.sizeUInt(u) !== this.data.length ? (this.setUInt(u), 1) : 0;
        }
        if ("i" === this.type) {
            var i = this.getInt();
            return tools.sizeInt(i) !== this.data.length ? (this.setInt(i), 1) : 0;
        }
        if ("f" === this.type) {
            var f = this.getFloat();
            return tools.sizeFloat(f) !== this.data.length ? (this.setFloat(f), 1) : 0;
        }
        return 0;
    }, Element.prototype._write = function(output, source, callback) {
        if (this._modified || this._dataSource) {
            var ebmlID = this.schemaInfo._ebmlID;
            if (ebmlID || (ebmlID = tools.writeUInt(this.ebmlID), this.schemaInfo._ebmlID = ebmlID), 
            source.writeHInt(output, this.ebmlID), !this.masterType) return !this.data && this._dataSource ? void source.writeTagDataSource(output, this.dataSize, this._dataSource, callback) : void source.writeTagData(output, this.data, callback);
            var children = this.children;
            if (!children) return source.writeVInt(output, 0), callback();
            var totalSize = 0;
            children.forEach((function(child) {
                totalSize += child._getSize();
            })), source.writeVInt(output, totalSize), async.eachSeries(children, (function(child, callback) {
                child._write(output, source, callback);
            }), callback);
        } else source.writeCompleteTag(output, this, callback);
    }, Element.prototype._childrenPosition = function(position) {
        var start = this.start, end = this.end, modified = this._modified;
        if (modified && (start = modified.start, end = modified.end), position < start || position >= end) return null;
        if (position === start) return {
            position: "start",
            target: this
        };
        var children = this.children;
        if (children) for (var i = 0; i < children.length; i++) {
            var ret = children[i]._childrenPosition(position);
            if (ret) return ret;
        }
        return {
            position: "middle",
            target: this
        };
    }, Element.prototype.getTagByPosition = function(position, contentOffset) {
        return position += contentOffset ? this.getContentPosition() : this.getPosition(), 
        this._childrenPosition(position);
    }, Element.prototype.remove = function() {
        if (!this.parent) throw new Error("No parent !");
        return this.parent.removeChild(this);
    }, Element.prototype.removeChild = function(child) {
        if (!this.children) return !1;
        var idx = this.children.indexOf(child);
        if (idx < 0) return !1;
        this.children.splice(idx, 1), child.parent._markModified(), child.parent = null;
        var doc = this.ownerDocument;
        return child.deepWalk((function(c) {
            var schemaInfo = c.schemaInfo;
            schemaInfo && (c._positionTargetType && (c._positionTargetType = void 0, doc._unregisterPosition(c)), 
            schemaInfo.crc && doc._unregisterCRC(c));
        })), !0;
    }, Element.prototype.appendChild = function(child, noUpdate) {
        if (!this.masterType) throw new Error("Element " + this._name + "/" + this.ebmlID + "/" + this.type + " is not a master type");
        return this.insertBefore(child, null, noUpdate);
    }, Element.prototype.insertBefore = function(child, beforeChild, noUpdate) {
        child.parent && child.remove(), this.children || (this.children = []);
        var doc = this.ownerDocument;
        if (child.deepWalk((function(c) {
            var schemaInfo = c.schemaInfo;
            schemaInfo && (schemaInfo.position && (c._positionTargetType = schemaInfo.position, 
            doc._registerPosition(c)), schemaInfo.crc && doc._registerCRC(c));
        })), beforeChild) {
            var idx = this.children.indexOf(beforeChild);
            if (idx >= 0) return this.children.splice(idx, 0, child), child.parent = this, void (!1 !== noUpdate && this._markModified());
        }
        this.children.push(child), child.parent = this, !1 !== noUpdate && this._markModified();
    }, Element.prototype.getLevel1 = function() {
        for (var p = this; p; p = p.parent) if ("D" === p.parent.type) return p;
    }, Element.prototype.getPosition = function() {
        var parent = this.parent;
        if (!parent) return 0;
        var pos = parent.getContentPosition(), children = parent.children;
        if (children) for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child === this) break;
            pos += child._getSize();
        }
        return pos;
    }, Element.prototype.getContentPosition = function() {
        if (!this.parent) return 0;
        var pos = this.getPosition() + tools.sizeHInt(this.ebmlID);
        if (!this.masterType) {
            var dataLength = this.getDataSize();
            return pos + tools.sizeVInt(dataLength);
        }
        if (this.lengthTagSize) return pos + this.lengthTagSize;
        var totalSize = 0;
        return this.children && this.children.forEach((function(child) {
            totalSize += child._getSize();
        })), pos + tools.sizeVInt(totalSize);
    }, Element.prototype.eachChild = function(callback) {
        var children = this.children;
        children && children.length && children.forEach(callback);
    }, Element.prototype.getDataStream = function(callback) {
        if (this.data) {
            var bufferStream = new stream.PassThrough;
            return bufferStream.end(this.data), void callback(null, bufferStream);
        }
        this._dataSource ? this._dataSource.getStream(callback) : this.ownerDocument.source.getTagDataStream(this, callback);
    }, Element.prototype.computeCRC = function(crc, callback) {
        if (addCRC(crc = crc || {}, tools.writeUInt(this.ebmlID)), this.masterType) {
            var c2 = this.children, csize = 0;
            return c2 && c2.forEach((function(c3) {
                csize += c3._getSize();
            })), addCRC(crc, tools.writeVInt(csize)), c2 ? void setImmediate(this._computeChildrenCRC.bind(this, !1, crc, callback)) : callback(null, crc.value);
        }
        if (this.data) return addCRC(crc, tools.writeVInt(this.data.length)), addCRC(crc, this.data), 
        callback(null, crc.value);
        addCRC(crc, tools.writeVInt(this.dataSize)), this.getDataStream((function(error, stream) {
            if (error) return callback(error);
            !(function(stream, crc, callback) {
                stream.on("readable", (function() {
                    var buffer = stream.read();
                    if (!buffer) return callback(null);
                    addCRC(crc, buffer);
                }));
            })(stream, crc, (function(error) {
                if (error) return callback(error);
                callback(null, crc.value);
            }));
        }));
    }, Element.prototype.moveChildBefore = function(child, beforeChild) {
        var children = this.children;
        if (!children) throw new Error("This tag has no children " + this);
        var idx = children.indexOf(child);
        if (idx < 0) throw new Error("Can not find the child '" + child + "' parent=" + this);
        var bidx = 0;
        if (beforeChild) {
            if ((bidx = children.indexOf(beforeChild)) < 0) throw new Error("Can not find the before child '" + beforeChild + "' parent=" + this);
        } else {
            if (idx === children.length - 1) return;
            bidx = children.length;
        }
        return children.splice(idx, 1), children.splice(bidx - (idx < bidx ? 1 : 0), 0, child), 
        this._markModified(), !0;
    }, Element.prototype._computeChildrenCRC = function(ignoreCRCTag, crc, callback) {
        crc = crc || {};
        var children = this.children;
        if (!children || !children.length) return callback(null, crc.value);
        async.eachSeries(children, (function(child, callback) {
            if (ignoreCRCTag && child.ebmlID === schema.byName.CRC_32) return callback(null);
            child.computeCRC(crc, callback);
        }), (function(error) {
            return error ? callback(error) : callback(null, crc.value);
        }));
    }, Element.prototype.deepWalk = function(func) {
        if (void 0 !== (ret = func(this))) return ret;
        var children = this.children;
        if (children) for (children = children.slice(0); children.length; ) {
            var ret, child = children.shift();
            if (void 0 !== (ret = func(child))) return ret;
            if (child.children) {
                var sp = [ 0, 0 ].concat(child.children);
                children.splice.apply(children, sp);
            }
        }
    }, Element.prototype.toString = function() {
        return "[Element #" + this.tagId + "]";
    }, Element.prototype.setMkvFormatDate = function(date) {
        this.setUTF8(tools.formatDate(value));
    }, Element.prototype.isModified = function() {
        return !!this._modified;
    }, Object.defineProperty(Element.prototype, "firstChild", {
        iterable: !0,
        get: function() {
            var children = this.children;
            return children && children.length ? children[0] : null;
        }
    }), Object.defineProperty(Element.prototype, "lastChild", {
        iterable: !0,
        get: function() {
            var children = this.children;
            return children && children.length ? children[children.length - 1] : null;
        }
    }), Object.defineProperty(Element.prototype, "empty", {
        iterable: !0,
        get: function() {
            var children = this.children;
            return !children || !children.length;
        }
    });
}
