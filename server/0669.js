function(module, exports, __webpack_require__) {
    "use strict";
    var util = __webpack_require__(0), Element1 = __webpack_require__(64), schema = __webpack_require__(12), EMPTY_BUFFER = (__webpack_require__(20), 
    new Buffer([]));
    function CRC_32(doc, tagId, start, length) {
        Element1.call(this, doc, tagId, schema.byName.CRC_32, start, length), this.data = EMPTY_BUFFER, 
        this.type = "b";
    }
    util.inherits(CRC_32, Element1), module.exports = CRC_32, CRC_32.prototype.toString = function() {
        return "[CRC-32 #" + this.tagId + "]";
    };
}
