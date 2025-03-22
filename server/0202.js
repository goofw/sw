function(module, exports, __webpack_require__) {
    "use strict";
    var util = __webpack_require__(0), MasterElement = __webpack_require__(29), schema = __webpack_require__(13), _proto = __webpack_require__(19);
    function Targets(doc, tagId, start, length) {
        MasterElement.call(this, doc, tagId, schema.byName.Targets, start, length);
    }
    util.inherits(Targets, MasterElement), module.exports = Targets, Targets.prototype.toString = function() {
        return "[Targets #" + this.tagId + "]";
    }, _proto.addAttribute(Targets.prototype, "TargetTypeValue"), _proto.addAttribute(Targets.prototype, "TargetType"), 
    _proto.addChild(Targets.prototype, "TagTrackUID"), _proto.addChild(Targets.prototype, "TagEditionUID"), 
    _proto.addChild(Targets.prototype, "TagChapterUID"), _proto.addChild(Targets.prototype, "TagAttachmentUID");
}
