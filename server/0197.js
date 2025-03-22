function(module, exports, __webpack_require__) {
    "use strict";
    var util = __webpack_require__(0), MasterElement = __webpack_require__(29), schema = __webpack_require__(13), _proto = __webpack_require__(19);
    function SeekHead(doc, tagId, start, length) {
        MasterElement.call(this, doc, tagId, schema.byName.SeekHead, start, length);
    }
    util.inherits(SeekHead, MasterElement), module.exports = SeekHead, SeekHead.prototype.toString = function() {
        return "[SeekHead #" + this.tagId + "]";
    }, _proto.addChild(SeekHead.prototype, "Seek");
}
