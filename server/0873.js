function(module, exports, __webpack_require__) {
    var root;
    module.exports && (this.VTTCue = this.VTTCue || __webpack_require__(874).VTTCue), 
    (root = this).VTTCue.prototype.toJSON = function() {
        var cue = {}, self = this;
        return Object.keys(this).forEach((function(key) {
            "getCueAsHTML" !== key && "hasBeenReset" !== key && "displayState" !== key && (cue[key] = self[key]);
        })), cue;
    }, root.VTTCue.create = function(options) {
        if (!options.hasOwnProperty("startTime") || !options.hasOwnProperty("endTime") || !options.hasOwnProperty("text")) throw new Error("You must at least have start time, end time, and text.");
        var cue = new root.VTTCue(options.startTime, options.endTime, options.text);
        for (var key in options) cue.hasOwnProperty(key) && (cue[key] = options[key]);
        return cue;
    }, root.VTTCue.fromJSON = function(json) {
        return this.create(JSON.parse(json));
    };
}
