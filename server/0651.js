function(module, exports, __webpack_require__) {
    "use strict";
    __webpack_require__(38), __webpack_require__(2), __webpack_require__(63), __webpack_require__(4);
    var util = __webpack_require__(0), Segment2 = __webpack_require__(653);
    function Segment3(doc, tagId, start, length) {
        Segment2.call(this, doc, tagId, start, length);
    }
    __webpack_require__(12), util.inherits(Segment3, Segment2), module.exports = Segment3, 
    Segment3.prototype.findTagByName = function(tagName) {};
}
