function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    const stream_1 = __webpack_require__(3);
    class m3u8Parser extends stream_1.Writable {
        constructor() {
            super(), this._lastLine = "", this._seq = 0, this._nextItemDuration = null, this._nextItemRange = null, 
            this._lastItemRangeEnd = 0, this.on("finish", (() => {
                this._parseLine(this._lastLine), this.emit("end");
            }));
        }
        _parseAttrList(value) {
            let match, attrs = {}, regex = /([A-Z0-9-]+)=(?:"([^"]*?)"|([^,]*?))/g;
            for (;null != (match = regex.exec(value)); ) attrs[match[1]] = match[2] || match[3];
            return attrs;
        }
        _parseRange(value) {
            if (!value) return null;
            let svalue = value.split("@"), start = svalue[1] ? parseInt(svalue[1]) : this._lastItemRangeEnd + 1, range = {
                start: start,
                end: start + parseInt(svalue[0]) - 1
            };
            return this._lastItemRangeEnd = range.end, range;
        }
        _parseLine(line) {
            let match = line.match(/^#(EXT[A-Z0-9-]+)(?::(.*))?/);
            if (match) {
                const tag = match[1], value = match[2] || "";
                switch (tag) {
                  case "EXT-X-PROGRAM-DATE-TIME":
                    this.emit("starttime", new Date(value).getTime());
                    break;

                  case "EXT-X-MEDIA-SEQUENCE":
                    this._seq = parseInt(value);
                    break;

                  case "EXT-X-MAP":
                    {
                        let attrs = this._parseAttrList(value);
                        if (!attrs.URI) return void this.destroy(new Error("`EXT-X-MAP` found without required attribute `URI`"));
                        this.emit("item", {
                            url: attrs.URI,
                            seq: this._seq,
                            init: !0,
                            duration: 0,
                            range: this._parseRange(attrs.BYTERANGE)
                        });
                        break;
                    }

                  case "EXT-X-BYTERANGE":
                    this._nextItemRange = this._parseRange(value);
                    break;

                  case "EXTINF":
                    this._nextItemDuration = Math.round(1e3 * parseFloat(value.split(",")[0]));
                    break;

                  case "EXT-X-ENDLIST":
                    this.emit("endlist");
                }
            } else !/^#/.test(line) && line.trim() && (this.emit("item", {
                url: line.trim(),
                seq: this._seq++,
                duration: this._nextItemDuration,
                range: this._nextItemRange
            }), this._nextItemRange = null);
        }
        _write(chunk, encoding, callback) {
            let lines = chunk.toString("utf8").split("\n");
            this._lastLine && (lines[0] = this._lastLine + lines[0]), lines.forEach(((line, i) => {
                this.destroyed || (i < lines.length - 1 ? this._parseLine(line) : this._lastLine = line);
            })), callback();
        }
    }
    exports.default = m3u8Parser;
}
