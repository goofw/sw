function(module, exports, __webpack_require__) {
    "use strict";
    var util = __webpack_require__(0), MasterElement = __webpack_require__(35), schema = __webpack_require__(12), _proto = __webpack_require__(20);
    function Tags(doc, tagId, start, length) {
        MasterElement.call(this, doc, tagId, schema.byName.Tags, start, length);
    }
    util.inherits(Tags, MasterElement), module.exports = Tags, Tags.prototype.toString = function() {
        return "[Tags #" + this.tagId + "]";
    }, _proto.addChild(Tags.prototype, "Tag");
}
