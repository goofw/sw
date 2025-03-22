function(module, exports) {
    module.exports = function(processor, concurrency) {
        concurrency = concurrency || 1;
        var waiting = [], inProg = {}, count = 0;
        function update() {
            for (;waiting.length && count < concurrency; ) !(function() {
                var t = waiting.shift();
                inProg[t.task.id] ? inProg[t.task.id].push(t.cb) : (inProg[t.task.id] = [ t.cb ], 
                count++, processor(t.task, (function() {
                    var args = arguments;
                    inProg[t.task.id] && (count--, inProg[t.task.id].forEach((function(cb) {
                        cb.apply(null, args);
                    })), delete inProg[t.task.id], setImmediate(update));
                })));
            })();
        }
        this.push = function(task, cb) {
            if (!task.hasOwnProperty("id")) throw new Error("no task.id");
            inProg[task.id] ? inProg[task.id].push(cb) : (waiting.push({
                task: task,
                cb: cb
            }), setImmediate(update));
        }, this.unshift = function(task, cb) {
            inProg[task.id] ? inProg[task.id].push(cb) : (waiting.unshift({
                task: task,
                cb: cb
            }), setImmediate(update));
        }, this.length = function() {
            return waiting.length;
        };
    };
}
