function(module, exports, __webpack_require__) {
    var bops = __webpack_require__(177);
    function consolidate(buffers) {
        var at, i, buffer, result, length = 0, ii = buffers.length;
        for (i = 0; i < ii; i++) length += (buffer = buffers[i]).length;
        for (result = bops.create(length), at = 0, i = 0; i < ii; i++) buffer = buffers[i], 
        bops.copy(buffer, result, at, 0, buffer.length), at += buffer.length;
        buffers.splice(0, ii, result);
    }
    exports.BufferIO = function() {
        var self = {}, buffers = [];
        return self.read = function() {
            return consolidate(buffers), buffers.shift();
        }, self.write = function(buffer) {
            buffers.push(bops.from(buffer));
        }, self.close = function() {}, self.destroy = function() {}, self.toBuffer = function() {
            consolidate(buffers);
            var buffer = bops.create(buffers[0].length);
            return bops.copy(buffers[0], buffer, 0, 0, buffers[0].length), buffer;
        }, self;
    }, exports.consolidate = consolidate;
}
