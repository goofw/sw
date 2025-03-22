function(module, exports) {
    module.exports = function(evs, incEv, decEv, idFn, onPositive, onZero, timeout) {
        var counter = {}, timeouts = {};
        evs.on(incEv, (function(hash, idx) {
            var id = idFn(hash, idx);
            counter.hasOwnProperty(id) || (counter[id] = 0, onPositive(hash, idx)), counter[id]++, 
            timeouts[id] && (clearTimeout(timeouts[id]), delete timeouts[id]);
        })), evs.on(decEv, (function(hash, idx) {
            var id = idFn(hash, idx);
            counter[id]--, 0 == counter[id] && (timeouts[id] && clearTimeout(timeouts[id]), 
            timeouts[id] = setTimeout((function() {
                onZero(hash, idx), delete counter[id], delete timeouts[id];
            }), timeout()));
        }));
    };
}
