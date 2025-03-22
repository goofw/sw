function(module, exports, __webpack_require__) {
    "use strict";
    var util = __webpack_require__(0), MasterElement = __webpack_require__(35), schema = __webpack_require__(12), _proto = __webpack_require__(20);
    function CuePoint(doc, tagId, start, length) {
        MasterElement.call(this, doc, tagId, schema.byName.CuePoint, start, length);
    }
    util.inherits(CuePoint, MasterElement), module.exports = CuePoint, CuePoint.prototype.toString = function() {
        return "[CuePoint #" + this.tagId + "]";
    }, _proto.addAttribute(CuePoint.prototype, "CueTime"), _proto.addChild(CuePoint.prototype, "CueTrackPositions");
}
