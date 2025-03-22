function(module, exports, __webpack_require__) {
    "use strict";
    var util = __webpack_require__(0), Element1 = __webpack_require__(43), schema = __webpack_require__(13), _proto = __webpack_require__(19);
    function AttachedFile(doc, tagId, start, length) {
        Element1.call(this, doc, tagId, schema.byName.AttachedFile, start, length);
    }
    util.inherits(AttachedFile, Element1), module.exports = AttachedFile, AttachedFile.prototype.toString = function() {
        return "[AttachedFile #" + this.tagId + "]";
    }, _proto.addAttribute(AttachedFile.prototype, "FileName"), _proto.addAttribute(AttachedFile.prototype, "FileMimeType"), 
    _proto.addAttribute(AttachedFile.prototype, "FileDescription"), _proto.addAttribute(AttachedFile.prototype, "FileData"), 
    _proto.addAttribute(AttachedFile.prototype, "FileUID");
}
