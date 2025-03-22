function(module, exports, __webpack_require__) {
    "use strict";
    var has = Object.prototype.hasOwnProperty, id = 0;
    function Ultron(ee) {
        if (!(this instanceof Ultron)) return new Ultron(ee);
        this.id = id++, this.ee = ee;
    }
    Ultron.prototype.on = function(event, fn, context) {
        return fn.__ultron = this.id, this.ee.on(event, fn, context), this;
    }, Ultron.prototype.once = function(event, fn, context) {
        return fn.__ultron = this.id, this.ee.once(event, fn, context), this;
    }, Ultron.prototype.remove = function() {
        var event, args = arguments;
        if (1 === args.length && "string" == typeof args[0]) args = args[0].split(/[, ]+/); else if (!args.length) for (event in args = [], 
        this.ee._events) has.call(this.ee._events, event) && args.push(event);
        for (var i = 0; i < args.length; i++) for (var listeners = this.ee.listeners(args[i]), j = 0; j < listeners.length; j++) {
            if ((event = listeners[j]).listener) {
                if (event.listener.__ultron !== this.id) continue;
                delete event.listener.__ultron;
            } else {
                if (event.__ultron !== this.id) continue;
                delete event.__ultron;
            }
            this.ee.removeListener(args[i], event);
        }
        return this;
    }, Ultron.prototype.destroy = function() {
        return !!this.ee && (this.remove(), this.ee = null, !0);
    }, module.exports = Ultron;
}
