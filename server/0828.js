function(module, exports, __webpack_require__) {
    "use strict";
    var _MetadataStream, Stream = __webpack_require__(37), StreamTypes = __webpack_require__(144), percentEncode = function(bytes, start, end) {
        var i, result = "";
        for (i = start; i < end; i++) result += "%" + ("00" + bytes[i].toString(16)).slice(-2);
        return result;
    }, parseUtf8 = function(bytes, start, end) {
        return decodeURIComponent(percentEncode(bytes, start, end));
    }, parseSyncSafeInteger = function(data) {
        return data[0] << 21 | data[1] << 14 | data[2] << 7 | data[3];
    }, tagParsers = {
        TXXX: function(tag) {
            var i;
            if (3 === tag.data[0]) {
                for (i = 1; i < tag.data.length; i++) if (0 === tag.data[i]) {
                    tag.description = parseUtf8(tag.data, 1, i), tag.value = parseUtf8(tag.data, i + 1, tag.data.length).replace(/\0*$/, "");
                    break;
                }
                tag.data = tag.value;
            }
        },
        WXXX: function(tag) {
            var i;
            if (3 === tag.data[0]) for (i = 1; i < tag.data.length; i++) if (0 === tag.data[i]) {
                tag.description = parseUtf8(tag.data, 1, i), tag.url = parseUtf8(tag.data, i + 1, tag.data.length);
                break;
            }
        },
        PRIV: function(tag) {
            var i, bytes;
            for (i = 0; i < tag.data.length; i++) if (0 === tag.data[i]) {
                tag.owner = (bytes = tag.data, unescape(percentEncode(bytes, 0, i)));
                break;
            }
            tag.privateData = tag.data.subarray(i + 1), tag.data = tag.privateData;
        }
    };
    (_MetadataStream = function(options) {
        var i, settings = {
            descriptor: options && options.descriptor
        }, tagSize = 0, buffer = [], bufferSize = 0;
        if (_MetadataStream.prototype.init.call(this), this.dispatchType = StreamTypes.METADATA_STREAM_TYPE.toString(16), 
        settings.descriptor) for (i = 0; i < settings.descriptor.length; i++) this.dispatchType += ("00" + settings.descriptor[i].toString(16)).slice(-2);
        this.push = function(chunk) {
            var tag, frameStart, frameSize, frame, i;
            if ("timed-metadata" === chunk.type) if (chunk.dataAlignmentIndicator && (bufferSize = 0, 
            buffer.length = 0), 0 === buffer.length && (chunk.data.length < 10 || chunk.data[0] !== "I".charCodeAt(0) || chunk.data[1] !== "D".charCodeAt(0) || chunk.data[2] !== "3".charCodeAt(0))) this.trigger("log", {
                level: "warn",
                message: "Skipping unrecognized metadata packet"
            }); else if (buffer.push(chunk), bufferSize += chunk.data.byteLength, 1 === buffer.length && (tagSize = parseSyncSafeInteger(chunk.data.subarray(6, 10)), 
            tagSize += 10), !(bufferSize < tagSize)) {
                for (tag = {
                    data: new Uint8Array(tagSize),
                    frames: [],
                    pts: buffer[0].pts,
                    dts: buffer[0].dts
                }, i = 0; i < tagSize; ) tag.data.set(buffer[0].data.subarray(0, tagSize - i), i), 
                i += buffer[0].data.byteLength, bufferSize -= buffer[0].data.byteLength, buffer.shift();
                frameStart = 10, 64 & tag.data[5] && (frameStart += 4, frameStart += parseSyncSafeInteger(tag.data.subarray(10, 14)), 
                tagSize -= parseSyncSafeInteger(tag.data.subarray(16, 20)));
                do {
                    if ((frameSize = parseSyncSafeInteger(tag.data.subarray(frameStart + 4, frameStart + 8))) < 1) return void this.trigger("log", {
                        level: "warn",
                        message: "Malformed ID3 frame encountered. Skipping metadata parsing."
                    });
                    if ((frame = {
                        id: String.fromCharCode(tag.data[frameStart], tag.data[frameStart + 1], tag.data[frameStart + 2], tag.data[frameStart + 3]),
                        data: tag.data.subarray(frameStart + 10, frameStart + frameSize + 10)
                    }).key = frame.id, tagParsers[frame.id] && (tagParsers[frame.id](frame), "com.apple.streaming.transportStreamTimestamp" === frame.owner)) {
                        var d = frame.data, size = (1 & d[3]) << 30 | d[4] << 22 | d[5] << 14 | d[6] << 6 | d[7] >>> 2;
                        size *= 4, size += 3 & d[7], frame.timeStamp = size, void 0 === tag.pts && void 0 === tag.dts && (tag.pts = frame.timeStamp, 
                        tag.dts = frame.timeStamp), this.trigger("timestamp", frame);
                    }
                    tag.frames.push(frame), frameStart += 10, frameStart += frameSize;
                } while (frameStart < tagSize);
                this.trigger("data", tag);
            }
        };
    }).prototype = new Stream, module.exports = _MetadataStream;
}
