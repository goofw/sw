function(module, exports, __webpack_require__) {
    "use strict";
    var util = __webpack_require__(0), MasterElement = __webpack_require__(35), schema = __webpack_require__(12), _proto = __webpack_require__(20);
    function Segment(doc, tagId, start, length) {
        MasterElement.call(this, doc, tagId, schema.byName.Segment, start, length);
    }
    util.inherits(Segment, MasterElement), module.exports = Segment, Segment.prototype.toString = function() {
        return "[Segment #" + this.tagId + "]";
    }, _proto.oneChild(Segment.prototype, "Info"), _proto.oneChild(Segment.prototype, "SeekHead"), 
    _proto.oneChild(Segment.prototype, "Attachments"), _proto.oneChild(Segment.prototype, "Tracks"), 
    _proto.oneChild(Segment.prototype, "Tags");
}
