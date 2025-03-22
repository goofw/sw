function(module, exports) {
    module.exports = function(tasks, cb) {
        var results, pending, keys, isSync = !0;
        function done(err) {
            function end() {
                cb && cb(err, results), cb = null;
            }
            isSync ? process.nextTick(end) : end();
        }
        function each(i, err, result) {
            results[i] = result, (0 == --pending || err) && done(err);
        }
        Array.isArray(tasks) ? (results = [], pending = tasks.length) : (keys = Object.keys(tasks), 
        results = {}, pending = keys.length), pending ? keys ? keys.forEach((function(key) {
            tasks[key]((function(err, result) {
                each(key, err, result);
            }));
        })) : tasks.forEach((function(task, i) {
            task((function(err, result) {
                each(i, err, result);
            }));
        })) : done(null), isSync = !1;
    };
}
