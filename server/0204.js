function(module, exports, __webpack_require__) {
    "use strict";
    var util = __webpack_require__(0), MasterElement = __webpack_require__(29), schema = __webpack_require__(13), _proto = __webpack_require__(19);
    function Tracks(doc, tagId, start, length) {
        MasterElement.call(this, doc, tagId, schema.byName.Tracks, start, length);
    }
    util.inherits(Tracks, MasterElement), module.exports = Tracks, Tracks.prototype.toString = function() {
        return "[Tracks #" + this.tagId + "]";
    }, _proto.addChild(Tracks.prototype, "TrackEntry");
}
