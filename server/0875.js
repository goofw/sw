function(module, exports, __webpack_require__) {
    var root;
    module.exports && (this.VTTRegion = __webpack_require__(876).VTTRegion), (root = this).VTTRegion.create = function(options) {
        var region = new root.VTTRegion;
        for (var key in options) region.hasOwnProperty(key) && (region[key] = options[key]);
        return region;
    }, root.VTTRegion.fromJSON = function(json) {
        return this.create(JSON.parse(json));
    };
}
