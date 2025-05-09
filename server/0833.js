function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function() {
        var self = this;
        this.list = [], this.push = function(tag) {
            this.list.push({
                bytes: tag.bytes,
                dts: tag.dts,
                pts: tag.pts,
                keyFrame: tag.keyFrame,
                metaDataTag: tag.metaDataTag
            });
        }, Object.defineProperty(this, "length", {
            get: function() {
                return self.list.length;
            }
        });
    };
}
