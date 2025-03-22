function(module, exports, __webpack_require__) {
    "use strict";
    var util = __webpack_require__(0), MasterElement = __webpack_require__(35), schema = __webpack_require__(12), _proto = __webpack_require__(20);
    function Cues(doc, tagId, start, length) {
        MasterElement.call(this, doc, tagId, schema.byName.Cues, start, length);
    }
    util.inherits(Cues, MasterElement), module.exports = Cues, Cues.prototype.toString = function() {
        return "[Cues #" + this.tagId + "]";
    }, _proto.addChild(Cues.prototype, "CuePoint");
}
