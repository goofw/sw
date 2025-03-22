function(module, exports, __webpack_require__) {
    "use strict";
    var _FlvTag;
    (_FlvTag = function(type, extraData) {
        var i, adHoc = 0, bufferStartSize = 16384, prepareWrite = function(flv, count) {
            var bytes, minLength = flv.position + count;
            minLength < flv.bytes.byteLength || ((bytes = new Uint8Array(2 * minLength)).set(flv.bytes.subarray(0, flv.position), 0), 
            flv.bytes = bytes, flv.view = new DataView(flv.bytes.buffer));
        }, widthBytes = _FlvTag.widthBytes || new Uint8Array("width".length), heightBytes = _FlvTag.heightBytes || new Uint8Array("height".length), videocodecidBytes = _FlvTag.videocodecidBytes || new Uint8Array("videocodecid".length);
        if (!_FlvTag.widthBytes) {
            for (i = 0; i < "width".length; i++) widthBytes[i] = "width".charCodeAt(i);
            for (i = 0; i < "height".length; i++) heightBytes[i] = "height".charCodeAt(i);
            for (i = 0; i < "videocodecid".length; i++) videocodecidBytes[i] = "videocodecid".charCodeAt(i);
            _FlvTag.widthBytes = widthBytes, _FlvTag.heightBytes = heightBytes, _FlvTag.videocodecidBytes = videocodecidBytes;
        }
        switch (this.keyFrame = !1, type) {
          case _FlvTag.VIDEO_TAG:
            this.length = 16, bufferStartSize *= 6;
            break;

          case _FlvTag.AUDIO_TAG:
            this.length = 13, this.keyFrame = !0;
            break;

          case _FlvTag.METADATA_TAG:
            this.length = 29, this.keyFrame = !0;
            break;

          default:
            throw new Error("Unknown FLV tag type");
        }
        this.bytes = new Uint8Array(bufferStartSize), this.view = new DataView(this.bytes.buffer), 
        this.bytes[0] = type, this.position = this.length, this.keyFrame = extraData, this.pts = 0, 
        this.dts = 0, this.writeBytes = function(bytes, offset, length) {
            var end, start = offset || 0;
            end = start + (length = length || bytes.byteLength), prepareWrite(this, length), 
            this.bytes.set(bytes.subarray(start, end), this.position), this.position += length, 
            this.length = Math.max(this.length, this.position);
        }, this.writeByte = function(byte) {
            prepareWrite(this, 1), this.bytes[this.position] = byte, this.position++, this.length = Math.max(this.length, this.position);
        }, this.writeShort = function(short) {
            prepareWrite(this, 2), this.view.setUint16(this.position, short), this.position += 2, 
            this.length = Math.max(this.length, this.position);
        }, this.negIndex = function(pos) {
            return this.bytes[this.length - pos];
        }, this.nalUnitSize = function() {
            return 0 === adHoc ? 0 : this.length - (adHoc + 4);
        }, this.startNalUnit = function() {
            if (adHoc > 0) throw new Error("Attempted to create new NAL wihout closing the old one");
            adHoc = this.length, this.length += 4, this.position = this.length;
        }, this.endNalUnit = function(nalContainer) {
            var nalStart, nalLength;
            this.length === adHoc + 4 ? this.length -= 4 : adHoc > 0 && (nalStart = adHoc + 4, 
            nalLength = this.length - nalStart, this.position = adHoc, this.view.setUint32(this.position, nalLength), 
            this.position = this.length, nalContainer && nalContainer.push(this.bytes.subarray(nalStart, nalStart + nalLength))), 
            adHoc = 0;
        }, this.writeMetaDataDouble = function(key, val) {
            var i;
            if (prepareWrite(this, 2 + key.length + 9), this.view.setUint16(this.position, key.length), 
            this.position += 2, "width" === key) this.bytes.set(widthBytes, this.position), 
            this.position += 5; else if ("height" === key) this.bytes.set(heightBytes, this.position), 
            this.position += 6; else if ("videocodecid" === key) this.bytes.set(videocodecidBytes, this.position), 
            this.position += 12; else for (i = 0; i < key.length; i++) this.bytes[this.position] = key.charCodeAt(i), 
            this.position++;
            this.position++, this.view.setFloat64(this.position, val), this.position += 8, this.length = Math.max(this.length, this.position), 
            ++adHoc;
        }, this.writeMetaDataBoolean = function(key, val) {
            var i;
            for (prepareWrite(this, 2), this.view.setUint16(this.position, key.length), this.position += 2, 
            i = 0; i < key.length; i++) prepareWrite(this, 1), this.bytes[this.position] = key.charCodeAt(i), 
            this.position++;
            prepareWrite(this, 2), this.view.setUint8(this.position, 1), this.position++, this.view.setUint8(this.position, val ? 1 : 0), 
            this.position++, this.length = Math.max(this.length, this.position), ++adHoc;
        }, this.finalize = function() {
            var dtsDelta, len;
            switch (this.bytes[0]) {
              case _FlvTag.VIDEO_TAG:
                this.bytes[11] = 7 | (this.keyFrame || extraData ? 16 : 32), this.bytes[12] = extraData ? 0 : 1, 
                dtsDelta = this.pts - this.dts, this.bytes[13] = (16711680 & dtsDelta) >>> 16, this.bytes[14] = (65280 & dtsDelta) >>> 8, 
                this.bytes[15] = (255 & dtsDelta) >>> 0;
                break;

              case _FlvTag.AUDIO_TAG:
                this.bytes[11] = 175, this.bytes[12] = extraData ? 0 : 1;
                break;

              case _FlvTag.METADATA_TAG:
                this.position = 11, this.view.setUint8(this.position, 2), this.position++, this.view.setUint16(this.position, 10), 
                this.position += 2, this.bytes.set([ 111, 110, 77, 101, 116, 97, 68, 97, 116, 97 ], this.position), 
                this.position += 10, this.bytes[this.position] = 8, this.position++, this.view.setUint32(this.position, adHoc), 
                this.position = this.length, this.bytes.set([ 0, 0, 9 ], this.position), this.position += 3, 
                this.length = this.position;
            }
            return len = this.length - 11, this.bytes[1] = (16711680 & len) >>> 16, this.bytes[2] = (65280 & len) >>> 8, 
            this.bytes[3] = (255 & len) >>> 0, this.bytes[4] = (16711680 & this.dts) >>> 16, 
            this.bytes[5] = (65280 & this.dts) >>> 8, this.bytes[6] = (255 & this.dts) >>> 0, 
            this.bytes[7] = (4278190080 & this.dts) >>> 24, this.bytes[8] = 0, this.bytes[9] = 0, 
            this.bytes[10] = 0, prepareWrite(this, 4), this.view.setUint32(this.length, this.length), 
            this.length += 4, this.position += 4, this.bytes = this.bytes.subarray(0, this.length), 
            this.frameTime = _FlvTag.frameTime(this.bytes), this;
        };
    }).AUDIO_TAG = 8, _FlvTag.VIDEO_TAG = 9, _FlvTag.METADATA_TAG = 18, _FlvTag.isAudioFrame = function(tag) {
        return _FlvTag.AUDIO_TAG === tag[0];
    }, _FlvTag.isVideoFrame = function(tag) {
        return _FlvTag.VIDEO_TAG === tag[0];
    }, _FlvTag.isMetaData = function(tag) {
        return _FlvTag.METADATA_TAG === tag[0];
    }, _FlvTag.isKeyFrame = function(tag) {
        return _FlvTag.isVideoFrame(tag) ? 23 === tag[11] : !!_FlvTag.isAudioFrame(tag) || !!_FlvTag.isMetaData(tag);
    }, _FlvTag.frameTime = function(tag) {
        var pts = tag[4] << 16;
        return pts |= tag[5] << 8, (pts |= tag[6] << 0) | tag[7] << 24;
    }, module.exports = _FlvTag;
}
