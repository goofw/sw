function(module, exports) {
    var tick = 1, timer = setInterval((function() {
        tick = tick + 1 & 65535;
    }), 250);
    timer.unref && timer.unref(), module.exports = function(seconds) {
        var size = 4 * (seconds || 5), buffer = [ 0 ], pointer = 1, last = tick - 1 & 65535;
        return function(delta) {
            var dist = tick - last & 65535;
            for (dist > size && (dist = size), last = tick; dist--; ) pointer === size && (pointer = 0), 
            buffer[pointer] = buffer[0 === pointer ? size - 1 : pointer - 1], pointer++;
            delta && (buffer[pointer - 1] += delta);
            var top = buffer[pointer - 1], btm = buffer.length < size ? 0 : buffer[pointer === size ? 0 : pointer];
            return buffer.length < 4 ? top : 4 * (top - btm) / buffer.length;
        };
    };
}
