function(module, exports, __webpack_require__) {
    var events = __webpack_require__(5), Bagpipe = function(limit, options) {
        for (var key in events.EventEmitter.call(this), this.limit = limit, this.active = 0, 
        this.paused = !1, this.queue = [], this.options = {
            disabled: !1,
            refuse: !1,
            ratio: 1,
            timeout: null
        }, "boolean" == typeof options && (options = {
            disabled: options
        }), options = options || {}, this.options) options.hasOwnProperty(key) && (this.options[key] = options[key]);
        this.queueLength = Math.round(this.limit * (this.options.ratio || 1));
    };
    __webpack_require__(786)(Bagpipe, events.EventEmitter);
    var addToQueue = function(unshift) {
        return function(method) {
            var args = [].slice.call(arguments, 1), callback = args[args.length - 1];
            if ("function" != typeof callback && args.push((function() {})), this.options.disabled || this.limit < 1) return method.apply(null, args), 
            this;
            if (this.queue.length < this.queueLength || !this.options.refuse) this.queue[unshift ? "unshift" : "push"]({
                method: method,
                args: args
            }); else {
                var err = new Error("Too much async call in queue");
                err.name = "TooMuchAsyncCallError", callback(err);
            }
            return this.queue.length > 1 && this.emit("full", this.queue.length), this.next(), 
            this;
        };
    };
    Bagpipe.prototype.push = addToQueue(0), Bagpipe.prototype.unshift = addToQueue(1), 
    Bagpipe.prototype.pause = function() {
        this.paused = !0;
    }, Bagpipe.prototype.resume = function() {
        this.paused = !1, this.next();
    }, Bagpipe.prototype.next = function() {
        if (!this.paused && this.active < this.limit && this.queue.length) {
            var req = this.queue.shift();
            this.run(req.method, req.args);
        }
    }, Bagpipe.prototype._next = function() {
        this.active--, this.next();
    }, Bagpipe.prototype.run = function(method, args) {
        var that = this;
        that.active++;
        var callback = args[args.length - 1], timer = null, called = !1;
        args[args.length - 1] = function(err) {
            timer && (clearTimeout(timer), timer = null), called ? err && that.emit("outdated", err) : (that._next(), 
            callback.apply(null, arguments));
        };
        var timeout = that.options.timeout;
        timeout && (timer = setTimeout((function() {
            called = !0, that._next();
            var err = new Error(timeout + "ms timeout");
            err.name = "BagpipeTimeoutError", err.data = {
                name: method.name,
                method: method.toString(),
                args: args.slice(0, -1)
            }, callback(err);
        }), timeout)), setTimeout((function() {
            method.apply(null, args);
        }), 0);
    }, module.exports = Bagpipe;
}
