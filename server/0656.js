function(module, exports, __webpack_require__) {
    "use strict";
    var util = __webpack_require__(0), MasterElement = __webpack_require__(35), schema = __webpack_require__(12), _proto = __webpack_require__(20);
    function Attachments(doc, tagId, start, length) {
        MasterElement.call(this, doc, tagId, schema.byName.Attachments, start, length);
    }
    util.inherits(Attachments, MasterElement), module.exports = Attachments, Attachments.prototype.toString = function() {
        return "[Attachments #" + this.tagId + "]";
    }, _proto.addChild(Attachments.prototype, "AttachedFile");
}
