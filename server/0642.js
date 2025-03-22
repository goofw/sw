function(module, exports, __webpack_require__) {
    "use strict";
    __webpack_require__(38);
    var util = __webpack_require__(0), Document = __webpack_require__(272), schema = __webpack_require__(12);
    function Document1() {
        Document.call(this);
    }
    util.inherits(Document1, Document), module.exports = Document1, Document1.prototype.getEBML = function() {
        return this.getFirstChildByName(schema.byName.EBML);
    }, Document1.prototype.getFirstSegment = function() {
        return this.getFirstChildByName(schema.byName.Segment);
    }, Object.defineProperty(Document1.prototype, "firstSegment", {
        iterable: !1,
        get: function() {
            return this.getFirstSegment();
        }
    }), Object.defineProperty(Document1.prototype, "head", {
        iterable: !1,
        get: function() {
            return this.getEBML();
        }
    }), Object.defineProperty(Document1.prototype, "segments", {
        iterable: !1,
        get: function() {
            return this.listChildrenByName(schema.byName.Segment);
        }
    });
}
