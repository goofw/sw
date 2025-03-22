function(module, exports, __webpack_require__) {
    "use strict";
    var _TransportPacketStream, _TransportParseStream, _ElementaryStream, Stream = __webpack_require__(37), CaptionStream = __webpack_require__(416), StreamTypes = __webpack_require__(144), TimestampRolloverStream = __webpack_require__(418).TimestampRolloverStream;
    (_TransportPacketStream = function() {
        var buffer = new Uint8Array(188), bytesInBuffer = 0;
        _TransportPacketStream.prototype.init.call(this), this.push = function(bytes) {
            var everything, startIndex = 0, endIndex = 188;
            for (bytesInBuffer ? ((everything = new Uint8Array(bytes.byteLength + bytesInBuffer)).set(buffer.subarray(0, bytesInBuffer)), 
            everything.set(bytes, bytesInBuffer), bytesInBuffer = 0) : everything = bytes; endIndex < everything.byteLength; ) 71 !== everything[startIndex] || 71 !== everything[endIndex] ? (startIndex++, 
            endIndex++) : (this.trigger("data", everything.subarray(startIndex, endIndex)), 
            startIndex += 188, endIndex += 188);
            startIndex < everything.byteLength && (buffer.set(everything.subarray(startIndex), 0), 
            bytesInBuffer = everything.byteLength - startIndex);
        }, this.flush = function() {
            188 === bytesInBuffer && 71 === buffer[0] && (this.trigger("data", buffer), bytesInBuffer = 0), 
            this.trigger("done");
        }, this.endTimeline = function() {
            this.flush(), this.trigger("endedtimeline");
        }, this.reset = function() {
            bytesInBuffer = 0, this.trigger("reset");
        };
    }).prototype = new Stream, (_TransportParseStream = function() {
        var parsePsi, parsePat, parsePmt, self;
        _TransportParseStream.prototype.init.call(this), self = this, this.packetsWaitingForPmt = [], 
        this.programMapTable = void 0, parsePsi = function(payload, psi) {
            var offset = 0;
            psi.payloadUnitStartIndicator && (offset += payload[offset] + 1), "pat" === psi.type ? parsePat(payload.subarray(offset), psi) : parsePmt(payload.subarray(offset), psi);
        }, parsePat = function(payload, pat) {
            pat.section_number = payload[7], pat.last_section_number = payload[8], self.pmtPid = (31 & payload[10]) << 8 | payload[11], 
            pat.pmtPid = self.pmtPid;
        }, parsePmt = function(payload, pmt) {
            var tableEnd, offset;
            if (1 & payload[5]) {
                for (self.programMapTable = {
                    video: null,
                    audio: null,
                    "timed-metadata": {}
                }, tableEnd = 3 + ((15 & payload[1]) << 8 | payload[2]) - 4, offset = 12 + ((15 & payload[10]) << 8 | payload[11]); offset < tableEnd; ) {
                    var streamType = payload[offset], pid = (31 & payload[offset + 1]) << 8 | payload[offset + 2];
                    streamType === StreamTypes.H264_STREAM_TYPE && null === self.programMapTable.video ? self.programMapTable.video = pid : streamType === StreamTypes.ADTS_STREAM_TYPE && null === self.programMapTable.audio ? self.programMapTable.audio = pid : streamType === StreamTypes.METADATA_STREAM_TYPE && (self.programMapTable["timed-metadata"][pid] = streamType), 
                    offset += 5 + ((15 & payload[offset + 3]) << 8 | payload[offset + 4]);
                }
                pmt.programMapTable = self.programMapTable;
            }
        }, this.push = function(packet) {
            var result = {}, offset = 4;
            if (result.payloadUnitStartIndicator = !!(64 & packet[1]), result.pid = 31 & packet[1], 
            result.pid <<= 8, result.pid |= packet[2], (48 & packet[3]) >>> 4 > 1 && (offset += packet[offset] + 1), 
            0 === result.pid) result.type = "pat", parsePsi(packet.subarray(offset), result), 
            this.trigger("data", result); else if (result.pid === this.pmtPid) for (result.type = "pmt", 
            parsePsi(packet.subarray(offset), result), this.trigger("data", result); this.packetsWaitingForPmt.length; ) this.processPes_.apply(this, this.packetsWaitingForPmt.shift()); else void 0 === this.programMapTable ? this.packetsWaitingForPmt.push([ packet, offset, result ]) : this.processPes_(packet, offset, result);
        }, this.processPes_ = function(packet, offset, result) {
            result.pid === this.programMapTable.video ? result.streamType = StreamTypes.H264_STREAM_TYPE : result.pid === this.programMapTable.audio ? result.streamType = StreamTypes.ADTS_STREAM_TYPE : result.streamType = this.programMapTable["timed-metadata"][result.pid], 
            result.type = "pes", result.data = packet.subarray(offset), this.trigger("data", result);
        };
    }).prototype = new Stream, _TransportParseStream.STREAM_TYPES = {
        h264: 27,
        adts: 15
    }, _ElementaryStream = function() {
        var programMapTable, self = this, segmentHadPmt = !1, video = {
            data: [],
            size: 0
        }, audio = {
            data: [],
            size: 0
        }, timedMetadata = {
            data: [],
            size: 0
        }, flushStream = function(stream, type, forceFlush) {
            var packetFlushable, fragment, packetData = new Uint8Array(stream.size), event = {
                type: type
            }, i = 0, offset = 0;
            if (stream.data.length && !(stream.size < 9)) {
                for (event.trackId = stream.data[0].pid, i = 0; i < stream.data.length; i++) fragment = stream.data[i], 
                packetData.set(fragment.data, offset), offset += fragment.data.byteLength;
                var payload, pes, ptsDtsFlags, startPrefix;
                pes = event, startPrefix = (payload = packetData)[0] << 16 | payload[1] << 8 | payload[2], 
                pes.data = new Uint8Array, 1 === startPrefix && (pes.packetLength = 6 + (payload[4] << 8 | payload[5]), 
                pes.dataAlignmentIndicator = 0 != (4 & payload[6]), 192 & (ptsDtsFlags = payload[7]) && (pes.pts = (14 & payload[9]) << 27 | (255 & payload[10]) << 20 | (254 & payload[11]) << 12 | (255 & payload[12]) << 5 | (254 & payload[13]) >>> 3, 
                pes.pts *= 4, pes.pts += (6 & payload[13]) >>> 1, pes.dts = pes.pts, 64 & ptsDtsFlags && (pes.dts = (14 & payload[14]) << 27 | (255 & payload[15]) << 20 | (254 & payload[16]) << 12 | (255 & payload[17]) << 5 | (254 & payload[18]) >>> 3, 
                pes.dts *= 4, pes.dts += (6 & payload[18]) >>> 1)), pes.data = payload.subarray(9 + payload[8])), 
                packetFlushable = "video" === type || event.packetLength <= stream.size, (forceFlush || packetFlushable) && (stream.size = 0, 
                stream.data.length = 0), packetFlushable && self.trigger("data", event);
            }
        };
        _ElementaryStream.prototype.init.call(this), this.push = function(data) {
            ({
                pat: function() {},
                pes: function() {
                    var stream, streamType;
                    switch (data.streamType) {
                      case StreamTypes.H264_STREAM_TYPE:
                        stream = video, streamType = "video";
                        break;

                      case StreamTypes.ADTS_STREAM_TYPE:
                        stream = audio, streamType = "audio";
                        break;

                      case StreamTypes.METADATA_STREAM_TYPE:
                        stream = timedMetadata, streamType = "timed-metadata";
                        break;

                      default:
                        return;
                    }
                    data.payloadUnitStartIndicator && flushStream(stream, streamType, !0), stream.data.push(data), 
                    stream.size += data.data.byteLength;
                },
                pmt: function() {
                    var event = {
                        type: "metadata",
                        tracks: []
                    };
                    null !== (programMapTable = data.programMapTable).video && event.tracks.push({
                        timelineStartInfo: {
                            baseMediaDecodeTime: 0
                        },
                        id: +programMapTable.video,
                        codec: "avc",
                        type: "video"
                    }), null !== programMapTable.audio && event.tracks.push({
                        timelineStartInfo: {
                            baseMediaDecodeTime: 0
                        },
                        id: +programMapTable.audio,
                        codec: "adts",
                        type: "audio"
                    }), segmentHadPmt = !0, self.trigger("data", event);
                }
            })[data.type]();
        }, this.reset = function() {
            video.size = 0, video.data.length = 0, audio.size = 0, audio.data.length = 0, this.trigger("reset");
        }, this.flushStreams_ = function() {
            flushStream(video, "video"), flushStream(audio, "audio"), flushStream(timedMetadata, "timed-metadata");
        }, this.flush = function() {
            if (!segmentHadPmt && programMapTable) {
                var pmt = {
                    type: "metadata",
                    tracks: []
                };
                null !== programMapTable.video && pmt.tracks.push({
                    timelineStartInfo: {
                        baseMediaDecodeTime: 0
                    },
                    id: +programMapTable.video,
                    codec: "avc",
                    type: "video"
                }), null !== programMapTable.audio && pmt.tracks.push({
                    timelineStartInfo: {
                        baseMediaDecodeTime: 0
                    },
                    id: +programMapTable.audio,
                    codec: "adts",
                    type: "audio"
                }), self.trigger("data", pmt);
            }
            segmentHadPmt = !1, this.flushStreams_(), this.trigger("done");
        };
    }, _ElementaryStream.prototype = new Stream;
    var m2ts = {
        PAT_PID: 0,
        MP2T_PACKET_LENGTH: 188,
        TransportPacketStream: _TransportPacketStream,
        TransportParseStream: _TransportParseStream,
        ElementaryStream: _ElementaryStream,
        TimestampRolloverStream: TimestampRolloverStream,
        CaptionStream: CaptionStream.CaptionStream,
        Cea608Stream: CaptionStream.Cea608Stream,
        Cea708Stream: CaptionStream.Cea708Stream,
        MetadataStream: __webpack_require__(828)
    };
    for (var type in StreamTypes) StreamTypes.hasOwnProperty(type) && (m2ts[type] = StreamTypes[type]);
    module.exports = m2ts;
}
