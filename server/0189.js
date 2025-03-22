function(module, exports, __webpack_require__) {
    "use strict";
    var util = __webpack_require__(0), Element1 = __webpack_require__(43), schema = __webpack_require__(13), _proto = __webpack_require__(19);
    function Audio(doc, tagId, start, length) {
        Element1.call(this, doc, tagId, schema.byName.Audio, start, length);
    }
    util.inherits(Audio, Element1), module.exports = Audio, Audio.prototype.toString = function() {
        return "[Audio #" + this.tagId + "]";
    }, _proto.addAttribute(Audio.prototype, "SamplingFrequency"), _proto.addAttribute(Audio.prototype, "OutputSamplingFrequency"), 
    _proto.addAttribute(Audio.prototype, "Channels"), _proto.addAttribute(Audio.prototype, "BitDepth");
}
