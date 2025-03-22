function(module, exports, __webpack_require__) {
    "use strict";
    var util = __webpack_require__(0), MasterElement = __webpack_require__(29), schema = __webpack_require__(13), _proto = __webpack_require__(19);
    function SimpleTag(doc, tagId, start, length) {
        MasterElement.call(this, doc, tagId, schema.byName.SimpleTag, start, length);
    }
    util.inherits(SimpleTag, MasterElement), module.exports = SimpleTag, SimpleTag.prototype.toString = function() {
        return "[SimpleTag #" + this.tagId + "]";
    }, _proto.addChild(SimpleTag.prototype, "SimpleTag"), _proto.addAttribute(SimpleTag.prototype, "TagName"), 
    _proto.addAttribute(SimpleTag.prototype, "TagLanguage"), _proto.addAttribute(SimpleTag.prototype, "TagDefault"), 
    _proto.addAttribute(SimpleTag.prototype, "TagString"), _proto.addAttribute(SimpleTag.prototype, "TagBinary");
}
