function(module, exports, __webpack_require__) {
    "use strict";
    var util = __webpack_require__(0), Element1 = __webpack_require__(43), _proto = (__webpack_require__(13), 
    __webpack_require__(19));
    function MasterElement(doc, tagId, ebmlId, start, length) {
        Element1.call(this, doc, tagId, ebmlId, start, length);
    }
    util.inherits(MasterElement, Element1), module.exports = MasterElement, _proto.oneChild(MasterElement.prototype, "CRC_32");
}
