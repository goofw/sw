function(module, exports, __webpack_require__) {
    "use strict";
    var Stream = function() {
        this.init = function() {
            var listeners = {};
            this.on = function(type, listener) {
                listeners[type] || (listeners[type] = []), listeners[type] = listeners[type].concat(listener);
            }, this.off = function(type, listener) {
                var index;
                return !!listeners[type] && (index = listeners[type].indexOf(listener), listeners[type] = listeners[type].slice(), 
                listeners[type].splice(index, 1), index > -1);
            }, this.trigger = function(type) {
                var callbacks, i, length, args;
                if (callbacks = listeners[type]) if (2 === arguments.length) for (length = callbacks.length, 
                i = 0; i < length; ++i) callbacks[i].call(this, arguments[1]); else {
                    for (args = [], i = arguments.length, i = 1; i < arguments.length; ++i) args.push(arguments[i]);
                    for (length = callbacks.length, i = 0; i < length; ++i) callbacks[i].apply(this, args);
                }
            }, this.dispose = function() {
                listeners = {};
            };
        };
    };
    Stream.prototype.pipe = function(destination) {
        return this.on("data", (function(data) {
            destination.push(data);
        })), this.on("done", (function(flushSource) {
            destination.flush(flushSource);
        })), this.on("partialdone", (function(flushSource) {
            destination.partialFlush(flushSource);
        })), this.on("endedtimeline", (function(flushSource) {
            destination.endTimeline(flushSource);
        })), this.on("reset", (function(flushSource) {
            destination.reset(flushSource);
        })), destination;
    }, Stream.prototype.push = function(data) {
        this.trigger("data", data);
    }, Stream.prototype.flush = function(flushSource) {
        this.trigger("done", flushSource);
    }, Stream.prototype.partialFlush = function(flushSource) {
        this.trigger("partialdone", flushSource);
    }, Stream.prototype.endTimeline = function(flushSource) {
        this.trigger("endedtimeline", flushSource);
    }, Stream.prototype.reset = function(flushSource) {
        this.trigger("reset", flushSource);
    }, module.exports = Stream;
}
