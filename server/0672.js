function(module, exports, __webpack_require__) {
    "use strict";
    var util = __webpack_require__(0), Element1 = __webpack_require__(64), schema = __webpack_require__(12), _proto = __webpack_require__(20);
    function CueReference(doc, tagId, start, length) {
        Element1.call(this, doc, tagId, schema.byName.CueReference, start, length);
    }
    util.inherits(CueReference, Element1), module.exports = CueReference, CueReference.prototype.toString = function() {
        return "[CueReference #" + this.tagId + "]";
    }, _proto.addAttribute(CueReference.prototype, "CueRefTime");
}
