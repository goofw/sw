function(module, exports, __webpack_require__) {
    "use strict";
    var Stream = __webpack_require__(37), CoalesceStream = function CoalesceStream(options) {
        this.numberOfTracks = 0, this.metadataStream = options.metadataStream, this.videoTags = [], 
        this.audioTags = [], this.videoTrack = null, this.audioTrack = null, this.pendingCaptions = [], 
        this.pendingMetadata = [], this.pendingTracks = 0, this.processedTracks = 0, CoalesceStream.prototype.init.call(this), 
        this.push = function(output) {
            return output.text ? this.pendingCaptions.push(output) : output.frames ? this.pendingMetadata.push(output) : ("video" === output.track.type && (this.videoTrack = output.track, 
            this.videoTags = output.tags, this.pendingTracks++), void ("audio" === output.track.type && (this.audioTrack = output.track, 
            this.audioTags = output.tags, this.pendingTracks++)));
        };
    };
    (CoalesceStream.prototype = new Stream).flush = function(flushSource) {
        var id3, caption, i, timelineStartPts, event = {
            tags: {},
            captions: [],
            captionStreams: {},
            metadata: []
        };
        if (this.pendingTracks < this.numberOfTracks) {
            if ("VideoSegmentStream" !== flushSource && "AudioSegmentStream" !== flushSource) return;
            if (0 === this.pendingTracks && (this.processedTracks++, this.processedTracks < this.numberOfTracks)) return;
        }
        if (this.processedTracks += this.pendingTracks, this.pendingTracks = 0, !(this.processedTracks < this.numberOfTracks)) {
            for (this.videoTrack ? timelineStartPts = this.videoTrack.timelineStartInfo.pts : this.audioTrack && (timelineStartPts = this.audioTrack.timelineStartInfo.pts), 
            event.tags.videoTags = this.videoTags, event.tags.audioTags = this.audioTags, i = 0; i < this.pendingCaptions.length; i++) (caption = this.pendingCaptions[i]).startTime = caption.startPts - timelineStartPts, 
            caption.startTime /= 9e4, caption.endTime = caption.endPts - timelineStartPts, caption.endTime /= 9e4, 
            event.captionStreams[caption.stream] = !0, event.captions.push(caption);
            for (i = 0; i < this.pendingMetadata.length; i++) (id3 = this.pendingMetadata[i]).cueTime = id3.pts - timelineStartPts, 
            id3.cueTime /= 9e4, event.metadata.push(id3);
            event.metadata.dispatchType = this.metadataStream.dispatchType, this.videoTrack = null, 
            this.audioTrack = null, this.videoTags = [], this.audioTags = [], this.pendingCaptions.length = 0, 
            this.pendingMetadata.length = 0, this.pendingTracks = 0, this.processedTracks = 0, 
            this.trigger("data", event), this.trigger("done");
        }
    }, module.exports = CoalesceStream;
}
