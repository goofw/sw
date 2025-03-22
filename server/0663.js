function(module, exports, __webpack_require__) {
    "use strict";
    var util = __webpack_require__(0), Element1 = __webpack_require__(64), schema = __webpack_require__(12), _proto = __webpack_require__(20);
    function Seek(doc, tagId, start, length) {
        Element1.call(this, doc, tagId, schema.byName.Seek, start, length);
    }
    util.inherits(Seek, Element1), module.exports = Seek, Seek.prototype.toString = function() {
        return "[Seek #" + this.tagId + "]";
    }, _proto.addAttribute(Seek.prototype, "SeekID"), _proto.addAttribute(Seek.prototype, "SeekPosition");
}
