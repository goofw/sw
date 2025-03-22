function(module, exports, __webpack_require__) {
    "use strict";
    var util = __webpack_require__(0), MasterElement = __webpack_require__(29), schema = __webpack_require__(13), _proto = __webpack_require__(19);
    function Tag(doc, tagId, start, length) {
        MasterElement.call(this, doc, tagId, schema.byName.Tag, start, length);
    }
    util.inherits(Tag, MasterElement), module.exports = Tag, Tag.prototype.toString = function() {
        return "[Tag #" + this.tagId + "]";
    }, _proto.oneChild(Tag.prototype, "Targets", !0), _proto.addChild(Tag.prototype, "SimpleTag");
}
