function(module, exports) {
    module.exports = function(tasks, cb) {
        var current = 0, results = [], isSync = !0;
        function done(err) {
            function end() {
                cb && cb(err, results);
            }
            isSync ? process.nextTick(end) : end();
        }
        tasks.length > 0 ? tasks[0]((function each(err, result) {
            results.push(result), ++current >= tasks.length || err ? done(err) : tasks[current](each);
        })) : done(null), isSync = !1;
    };
}
