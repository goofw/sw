function(module, exports) {
    const ADDR_RE = /^\[?([^\]]+)\]?:(\d+)$/;
    let cache = {}, size = 0;
    module.exports = function(addr) {
        if (1e5 === size && module.exports.reset(), !cache[addr]) {
            const m = ADDR_RE.exec(addr);
            if (!m) throw new Error(`invalid addr: ${addr}`);
            cache[addr] = [ m[1], Number(m[2]) ], size += 1;
        }
        return cache[addr];
    }, module.exports.reset = function() {
        cache = {}, size = 0;
    };
}
