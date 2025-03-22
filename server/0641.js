function(module, exports, __webpack_require__) {
    "use strict";
    var async = __webpack_require__(38), util = __webpack_require__(0), Document1 = __webpack_require__(642);
    function Document2() {
        Document1.call(this);
    }
    __webpack_require__(12), util.inherits(Document2, Document1), module.exports = Document2, 
    Document2.prototype.optimizeData = function(options, callback) {
        if (1 === arguments.length && "function" == typeof options && (callback = options, 
        options = null), !this.children) return callback();
        options = options || {};
        var cnt = 0;
        return this.deepWalk((function(child) {
            var c = child._optimizeData(options);
            cnt += c;
        })), console.log("Optimize " + cnt + " values"), callback();
    }, Document2.prototype.normalizeSegments = function(options, callback) {
        var segments = this.segments;
        options = options || {}, async.eachSeries(segments, (function(segment, callback) {
            segment.normalize(options, callback);
        }), callback);
    }, Document2.prototype._prepareDocument = function(options, callback) {
        var fcts = [], self = this;
        !1 !== options.normalizeSegments && fcts.push((function(callback) {
            self.normalizeSegments(options, callback);
        })), !1 !== options.optimizeData && fcts.push((function(callback) {
            self.optimizeData(options, callback);
        })), void 0 !== options.forceStereoMode && this.segments.forEach((function(segment) {
            segment.tracks.trackEntries.forEach((function(trackEntry) {
                try {
                    var video = trackEntry.video;
                    if (!video) return;
                    video.stereoMode = options.forceStereoMode;
                } catch (x) {
                    console.error(x);
                }
            }));
        })), self = this, async.series(fcts, (function(error) {
            if (error) return callback(error);
            Document1.prototype._prepareDocument.call(self, options, callback);
        }));
    };
}
