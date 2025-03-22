function(module, exports, __webpack_require__) {
    "use strict";
    var firstLineError;
    try {
        throw new Error;
    } catch (e) {
        firstLineError = e;
    }
    var schedule = __webpack_require__(1162), Queue = __webpack_require__(1163), util = __webpack_require__(17);
    function Async() {
        this._customScheduler = !1, this._isTickUsed = !1, this._lateQueue = new Queue(16), 
        this._normalQueue = new Queue(16), this._haveDrainedQueues = !1, this._trampolineEnabled = !0;
        var self = this;
        this.drainQueues = function() {
            self._drainQueues();
        }, this._schedule = schedule;
    }
    function AsyncInvokeLater(fn, receiver, arg) {
        this._lateQueue.push(fn, receiver, arg), this._queueTick();
    }
    function AsyncInvoke(fn, receiver, arg) {
        this._normalQueue.push(fn, receiver, arg), this._queueTick();
    }
    function AsyncSettlePromises(promise) {
        this._normalQueue._pushOne(promise), this._queueTick();
    }
    Async.prototype.setScheduler = function(fn) {
        var prev = this._schedule;
        return this._schedule = fn, this._customScheduler = !0, prev;
    }, Async.prototype.hasCustomScheduler = function() {
        return this._customScheduler;
    }, Async.prototype.enableTrampoline = function() {
        this._trampolineEnabled = !0;
    }, Async.prototype.disableTrampolineIfNecessary = function() {
        util.hasDevTools && (this._trampolineEnabled = !1);
    }, Async.prototype.haveItemsQueued = function() {
        return this._isTickUsed || this._haveDrainedQueues;
    }, Async.prototype.fatalError = function(e, isNode) {
        isNode ? (process.stderr.write("Fatal " + (e instanceof Error ? e.stack : e) + "\n"), 
        process.exit(2)) : this.throwLater(e);
    }, Async.prototype.throwLater = function(fn, arg) {
        if (1 === arguments.length && (arg = fn, fn = function() {
            throw arg;
        }), "undefined" != typeof setTimeout) setTimeout((function() {
            fn(arg);
        }), 0); else try {
            this._schedule((function() {
                fn(arg);
            }));
        } catch (e) {
            throw new Error("No async scheduler available\n\n    See http://goo.gl/MqrFmX\n");
        }
    }, util.hasDevTools ? (Async.prototype.invokeLater = function(fn, receiver, arg) {
        this._trampolineEnabled ? AsyncInvokeLater.call(this, fn, receiver, arg) : this._schedule((function() {
            setTimeout((function() {
                fn.call(receiver, arg);
            }), 100);
        }));
    }, Async.prototype.invoke = function(fn, receiver, arg) {
        this._trampolineEnabled ? AsyncInvoke.call(this, fn, receiver, arg) : this._schedule((function() {
            fn.call(receiver, arg);
        }));
    }, Async.prototype.settlePromises = function(promise) {
        this._trampolineEnabled ? AsyncSettlePromises.call(this, promise) : this._schedule((function() {
            promise._settlePromises();
        }));
    }) : (Async.prototype.invokeLater = AsyncInvokeLater, Async.prototype.invoke = AsyncInvoke, 
    Async.prototype.settlePromises = AsyncSettlePromises), Async.prototype._drainQueue = function(queue) {
        for (;queue.length() > 0; ) {
            var fn = queue.shift();
            if ("function" == typeof fn) {
                var receiver = queue.shift(), arg = queue.shift();
                fn.call(receiver, arg);
            } else fn._settlePromises();
        }
    }, Async.prototype._drainQueues = function() {
        this._drainQueue(this._normalQueue), this._reset(), this._haveDrainedQueues = !0, 
        this._drainQueue(this._lateQueue);
    }, Async.prototype._queueTick = function() {
        this._isTickUsed || (this._isTickUsed = !0, this._schedule(this.drainQueues));
    }, Async.prototype._reset = function() {
        this._isTickUsed = !1;
    }, module.exports = Async, module.exports.firstLineError = firstLineError;
}
