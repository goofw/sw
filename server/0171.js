function(module, exports, __webpack_require__) {
    "use strict";
    var assert = __webpack_require__(24), util = (__webpack_require__(2), __webpack_require__(0)), debug = __webpack_require__(40)("matroska:abstractSource"), Source = __webpack_require__(275), tools = __webpack_require__(72);
    function AbstractSource() {
        this._vints = [], this._vintsSize = 0;
    }
    module.exports = AbstractSource, util.inherits(AbstractSource, Source), AbstractSource.prototype.writeCompleteTag = function(session, tag, callback) {
        assert("number" == typeof tag.start, "Invalid start index of tag #" + tag.tagId), 
        assert("number" == typeof tag.end, "Invalid start index of tag #" + tag.tagId);
        var self = this;
        this._flush(session, (function(error) {
            if (error) return callback(error);
            var start = tag.start, end = tag.end, modified = tag._modified;
            modified && (start = modified.start, end = modified.end), self.getStream({
                start: start,
                end: end - 1
            }, (function(error, stream) {
                if (error) return callback(error);
                stream.on("end", callback), stream.on("error", callback), stream.pipe(session.stream, {
                    end: !1
                });
            }));
        }));
    }, AbstractSource.prototype.writeTagData = function(session, data, callback) {
        if (!data) throw new Error("No data !");
        if (this.writeVInt(session, data.length), this._vintsSize + data.length < 65536) return this._vints.push(data), 
        this._vintsSize += data.length, void setImmediate(callback);
        this._flush(session, (function(error) {
            if (error) return callback(error);
            session.stream.write(data, callback);
        }));
    }, AbstractSource.prototype.writeTagDataSource = function(session, dataSize, dataSource, callback) {
        this.writeVInt(session, dataSize), this._flush(session, (function(error) {
            if (error) return callback(error);
            dataSource.getStream(session, (function(error, stream) {
                if (error) return callback(error);
                stream.pipe(session.stream, {
                    end: !1
                }), stream.on("error", callback), stream.on("end", callback);
            }));
        }));
    }, AbstractSource.prototype.writeVInt = function(session, value) {
        if ("number" != typeof value) throw new Error("Invalid value (" + value + ")");
        var buffer = tools.writeVInt(value);
        this._vints.push(buffer), this._vintsSize += buffer.length;
    }, AbstractSource.prototype.writeHInt = function(session, value) {
        if ("number" != typeof value) throw new Error("Invalid value (" + value + ")");
        var buffer = value;
        Buffer.isBuffer(buffer) || (buffer = tools.writeUInt(value)), this._vints.push(buffer), 
        this._vintsSize += buffer.length;
    }, AbstractSource.prototype._flush = function(session, callback) {
        var buffer, vints = this._vints;
        if (!this._vintsSize) return callback();
        buffer = 1 === vints.length ? vints[0] : Buffer.concat(vints), this._vints = [], 
        this._vintsSize = 0, session.stream.write(buffer, callback);
    }, AbstractSource.prototype.getTagDataStream = function(tag, callback) {
        debug.enabled && debug("Get data stream of #" + tag.tagId + "  start=" + tag.start + " end=" + tag.end + " modified=", modified);
        var end = tag.end, modified = tag._modified;
        modified && (end = modified.end);
        var start = end - tag.getDataSize();
        debug.enabled && debug("Open stream " + this.filename + " start=" + start + " end=" + end + " size=" + tag.dataSize), 
        this.getStream({}, {
            start: start,
            end: end - 1
        }, (function(error, stream) {
            return error ? callback(error) : callback(null, stream);
        }));
    }, AbstractSource.prototype.end = function(session, callback) {
        var self = this;
        this._flush(session, (function(error) {
            if (error) return callback(error);
            self._end(session, callback);
        }));
    }, AbstractSource.prototype._end = function(session, callback) {
        callback();
    }, AbstractSource.prototype.release = function(callback) {
        this.end(this, callback);
    };
}
