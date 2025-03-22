function(module, exports, __webpack_require__) {
    "use strict";
    var util = __webpack_require__(0), MasterElement = __webpack_require__(29), schema = __webpack_require__(13), _proto = __webpack_require__(19);
    function CueTrackPositions(doc, tagId, start, length) {
        MasterElement.call(this, doc, tagId, schema.byName.CueTrackPositions, start, length);
    }
    util.inherits(CueTrackPositions, MasterElement), module.exports = CueTrackPositions, 
    CueTrackPositions.prototype.toString = function() {
        return "[CueTrackPositions #" + this.tagId + "]";
    }, _proto.addAttribute(CueTrackPositions.prototype, "CueTrack"), _proto.addAttribute(CueTrackPositions.prototype, "CueClusterPosition"), 
    _proto.addAttribute(CueTrackPositions.prototype, "CueRelativePosition"), _proto.addAttribute(CueTrackPositions.prototype, "CueDuration"), 
    _proto.addAttribute(CueTrackPositions.prototype, "CueBlockNumber"), _proto.addAttribute(CueTrackPositions.prototype, "CueCodecState"), 
    _proto.addChild(CueTrackPositions.prototype, "CueReference");
}
