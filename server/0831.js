function(module, exports, __webpack_require__) {
    "use strict";
    var _Transmuxer, _VideoSegmentStream, _AudioSegmentStream, collectTimelineInfo, metaDataTag, extraDataTag, Stream = __webpack_require__(37), FlvTag = __webpack_require__(214), m2ts = __webpack_require__(143), AdtsStream = __webpack_require__(139), H264Stream = __webpack_require__(207).H264Stream, CoalesceStream = __webpack_require__(832), TagList = __webpack_require__(833);
    collectTimelineInfo = function(track, data) {
        "number" == typeof data.pts && (void 0 === track.timelineStartInfo.pts ? track.timelineStartInfo.pts = data.pts : track.timelineStartInfo.pts = Math.min(track.timelineStartInfo.pts, data.pts)), 
        "number" == typeof data.dts && (void 0 === track.timelineStartInfo.dts ? track.timelineStartInfo.dts = data.dts : track.timelineStartInfo.dts = Math.min(track.timelineStartInfo.dts, data.dts));
    }, metaDataTag = function(track, pts) {
        var tag = new FlvTag(FlvTag.METADATA_TAG);
        return tag.dts = pts, tag.pts = pts, tag.writeMetaDataDouble("videocodecid", 7), 
        tag.writeMetaDataDouble("width", track.width), tag.writeMetaDataDouble("height", track.height), 
        tag;
    }, extraDataTag = function(track, pts) {
        var i, tag = new FlvTag(FlvTag.VIDEO_TAG, !0);
        for (tag.dts = pts, tag.pts = pts, tag.writeByte(1), tag.writeByte(track.profileIdc), 
        tag.writeByte(track.profileCompatibility), tag.writeByte(track.levelIdc), tag.writeByte(255), 
        tag.writeByte(225), tag.writeShort(track.sps[0].length), tag.writeBytes(track.sps[0]), 
        tag.writeByte(track.pps.length), i = 0; i < track.pps.length; ++i) tag.writeShort(track.pps[i].length), 
        tag.writeBytes(track.pps[i]);
        return tag;
    }, (_AudioSegmentStream = function(track) {
        var oldExtraData, adtsFrames = [], videoKeyFrames = [];
        _AudioSegmentStream.prototype.init.call(this), this.push = function(data) {
            collectTimelineInfo(track, data), track && (track.audioobjecttype = data.audioobjecttype, 
            track.channelcount = data.channelcount, track.samplerate = data.samplerate, track.samplingfrequencyindex = data.samplingfrequencyindex, 
            track.samplesize = data.samplesize, track.extraData = track.audioobjecttype << 11 | track.samplingfrequencyindex << 7 | track.channelcount << 3), 
            data.pts = Math.round(data.pts / 90), data.dts = Math.round(data.dts / 90), adtsFrames.push(data);
        }, this.flush = function() {
            var currentFrame, adtsFrame, lastMetaPts, tags = new TagList;
            if (0 !== adtsFrames.length) {
                for (lastMetaPts = -1 / 0; adtsFrames.length; ) currentFrame = adtsFrames.shift(), 
                videoKeyFrames.length && currentFrame.pts >= videoKeyFrames[0] && (lastMetaPts = videoKeyFrames.shift(), 
                this.writeMetaDataTags(tags, lastMetaPts)), (track.extraData !== oldExtraData || currentFrame.pts - lastMetaPts >= 1e3) && (this.writeMetaDataTags(tags, currentFrame.pts), 
                oldExtraData = track.extraData, lastMetaPts = currentFrame.pts), (adtsFrame = new FlvTag(FlvTag.AUDIO_TAG)).pts = currentFrame.pts, 
                adtsFrame.dts = currentFrame.dts, adtsFrame.writeBytes(currentFrame.data), tags.push(adtsFrame.finalize());
                videoKeyFrames.length = 0, oldExtraData = null, this.trigger("data", {
                    track: track,
                    tags: tags.list
                }), this.trigger("done", "AudioSegmentStream");
            } else this.trigger("done", "AudioSegmentStream");
        }, this.writeMetaDataTags = function(tags, pts) {
            var adtsFrame;
            (adtsFrame = new FlvTag(FlvTag.METADATA_TAG)).pts = pts, adtsFrame.dts = pts, adtsFrame.writeMetaDataDouble("audiocodecid", 10), 
            adtsFrame.writeMetaDataBoolean("stereo", 2 === track.channelcount), adtsFrame.writeMetaDataDouble("audiosamplerate", track.samplerate), 
            adtsFrame.writeMetaDataDouble("audiosamplesize", 16), tags.push(adtsFrame.finalize()), 
            (adtsFrame = new FlvTag(FlvTag.AUDIO_TAG, !0)).pts = pts, adtsFrame.dts = pts, adtsFrame.view.setUint16(adtsFrame.position, track.extraData), 
            adtsFrame.position += 2, adtsFrame.length = Math.max(adtsFrame.length, adtsFrame.position), 
            tags.push(adtsFrame.finalize());
        }, this.onVideoKeyFrame = function(pts) {
            videoKeyFrames.push(pts);
        };
    }).prototype = new Stream, (_VideoSegmentStream = function(track) {
        var config, h264Frame, nalUnits = [];
        _VideoSegmentStream.prototype.init.call(this), this.finishFrame = function(tags, frame) {
            if (frame) {
                if (config && track && track.newMetadata && (frame.keyFrame || 0 === tags.length)) {
                    var metaTag = metaDataTag(config, frame.dts).finalize(), extraTag = extraDataTag(track, frame.dts).finalize();
                    metaTag.metaDataTag = extraTag.metaDataTag = !0, tags.push(metaTag), tags.push(extraTag), 
                    track.newMetadata = !1, this.trigger("keyframe", frame.dts);
                }
                frame.endNalUnit(), tags.push(frame.finalize()), h264Frame = null;
            }
        }, this.push = function(data) {
            collectTimelineInfo(track, data), data.pts = Math.round(data.pts / 90), data.dts = Math.round(data.dts / 90), 
            nalUnits.push(data);
        }, this.flush = function() {
            for (var currentNal, tags = new TagList; nalUnits.length && "access_unit_delimiter_rbsp" !== nalUnits[0].nalUnitType; ) nalUnits.shift();
            if (0 !== nalUnits.length) {
                for (;nalUnits.length; ) "seq_parameter_set_rbsp" === (currentNal = nalUnits.shift()).nalUnitType ? (track.newMetadata = !0, 
                config = currentNal.config, track.width = config.width, track.height = config.height, 
                track.sps = [ currentNal.data ], track.profileIdc = config.profileIdc, track.levelIdc = config.levelIdc, 
                track.profileCompatibility = config.profileCompatibility, h264Frame.endNalUnit()) : "pic_parameter_set_rbsp" === currentNal.nalUnitType ? (track.newMetadata = !0, 
                track.pps = [ currentNal.data ], h264Frame.endNalUnit()) : "access_unit_delimiter_rbsp" === currentNal.nalUnitType ? (h264Frame && this.finishFrame(tags, h264Frame), 
                (h264Frame = new FlvTag(FlvTag.VIDEO_TAG)).pts = currentNal.pts, h264Frame.dts = currentNal.dts) : ("slice_layer_without_partitioning_rbsp_idr" === currentNal.nalUnitType && (h264Frame.keyFrame = !0), 
                h264Frame.endNalUnit()), h264Frame.startNalUnit(), h264Frame.writeBytes(currentNal.data);
                h264Frame && this.finishFrame(tags, h264Frame), this.trigger("data", {
                    track: track,
                    tags: tags.list
                }), this.trigger("done", "VideoSegmentStream");
            } else this.trigger("done", "VideoSegmentStream");
        };
    }).prototype = new Stream, (_Transmuxer = function(options) {
        var packetStream, parseStream, elementaryStream, videoTimestampRolloverStream, audioTimestampRolloverStream, timedMetadataTimestampRolloverStream, adtsStream, h264Stream, videoSegmentStream, audioSegmentStream, captionStream, coalesceStream, self = this;
        _Transmuxer.prototype.init.call(this), options = options || {}, this.metadataStream = new m2ts.MetadataStream, 
        options.metadataStream = this.metadataStream, packetStream = new m2ts.TransportPacketStream, 
        parseStream = new m2ts.TransportParseStream, elementaryStream = new m2ts.ElementaryStream, 
        videoTimestampRolloverStream = new m2ts.TimestampRolloverStream("video"), audioTimestampRolloverStream = new m2ts.TimestampRolloverStream("audio"), 
        timedMetadataTimestampRolloverStream = new m2ts.TimestampRolloverStream("timed-metadata"), 
        adtsStream = new AdtsStream, h264Stream = new H264Stream, coalesceStream = new CoalesceStream(options), 
        packetStream.pipe(parseStream).pipe(elementaryStream), elementaryStream.pipe(videoTimestampRolloverStream).pipe(h264Stream), 
        elementaryStream.pipe(audioTimestampRolloverStream).pipe(adtsStream), elementaryStream.pipe(timedMetadataTimestampRolloverStream).pipe(this.metadataStream).pipe(coalesceStream), 
        captionStream = new m2ts.CaptionStream(options), h264Stream.pipe(captionStream).pipe(coalesceStream), 
        elementaryStream.on("data", (function(data) {
            var i, videoTrack, audioTrack;
            if ("metadata" === data.type) {
                for (i = data.tracks.length; i--; ) "video" === data.tracks[i].type ? videoTrack = data.tracks[i] : "audio" === data.tracks[i].type && (audioTrack = data.tracks[i]);
                videoTrack && !videoSegmentStream && (coalesceStream.numberOfTracks++, videoSegmentStream = new _VideoSegmentStream(videoTrack), 
                h264Stream.pipe(videoSegmentStream).pipe(coalesceStream)), audioTrack && !audioSegmentStream && (coalesceStream.numberOfTracks++, 
                audioSegmentStream = new _AudioSegmentStream(audioTrack), adtsStream.pipe(audioSegmentStream).pipe(coalesceStream), 
                videoSegmentStream && videoSegmentStream.on("keyframe", audioSegmentStream.onVideoKeyFrame));
            }
        })), this.push = function(data) {
            packetStream.push(data);
        }, this.flush = function() {
            packetStream.flush();
        }, this.resetCaptions = function() {
            captionStream.reset();
        }, coalesceStream.on("data", (function(event) {
            self.trigger("data", event);
        })), coalesceStream.on("done", (function() {
            self.trigger("done");
        }));
    }).prototype = new Stream, module.exports = _Transmuxer;
}
