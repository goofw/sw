function(module, exports, __webpack_require__) {
    var Traverse = __webpack_require__(1153), EventEmitter = __webpack_require__(5).EventEmitter;
    function Chainsaw(builder) {
        var saw = Chainsaw.saw(builder, {}), r = builder.call(saw.handlers, saw);
        return void 0 !== r && (saw.handlers = r), saw.record(), saw.chain();
    }
    module.exports = Chainsaw, Chainsaw.light = function(builder) {
        var saw = Chainsaw.saw(builder, {}), r = builder.call(saw.handlers, saw);
        return void 0 !== r && (saw.handlers = r), saw.chain();
    }, Chainsaw.saw = function(builder, handlers) {
        var saw = new EventEmitter;
        return saw.handlers = handlers, saw.actions = [], saw.chain = function() {
            var ch = Traverse(saw.handlers).map((function(node) {
                if (this.isRoot) return node;
                var ps = this.path;
                "function" == typeof node && this.update((function() {
                    return saw.actions.push({
                        path: ps,
                        args: [].slice.call(arguments)
                    }), ch;
                }));
            }));
            return process.nextTick((function() {
                saw.emit("begin"), saw.next();
            })), ch;
        }, saw.pop = function() {
            return saw.actions.shift();
        }, saw.next = function() {
            var action = saw.pop();
            if (action) {
                if (!action.trap) {
                    var node = saw.handlers;
                    action.path.forEach((function(key) {
                        node = node[key];
                    })), node.apply(saw.handlers, action.args);
                }
            } else saw.emit("end");
        }, saw.nest = function(cb) {
            var args = [].slice.call(arguments, 1), autonext = !0;
            "boolean" == typeof cb && (autonext = cb, cb = args.shift());
            var s = Chainsaw.saw(builder, {}), r = builder.call(s.handlers, s);
            void 0 !== r && (s.handlers = r), void 0 !== saw.step && s.record(), cb.apply(s.chain(), args), 
            !1 !== autonext && s.on("end", saw.next);
        }, saw.record = function() {
            !(function(saw) {
                saw.step = 0, saw.pop = function() {
                    return saw.actions[saw.step++];
                }, saw.trap = function(name, cb) {
                    var ps = Array.isArray(name) ? name : [ name ];
                    saw.actions.push({
                        path: ps,
                        step: saw.step,
                        cb: cb,
                        trap: !0
                    });
                }, saw.down = function(name) {
                    var ps = (Array.isArray(name) ? name : [ name ]).join("/"), i = saw.actions.slice(saw.step).map((function(x) {
                        return !(x.trap && x.step <= saw.step) && x.path.join("/") == ps;
                    })).indexOf(!0);
                    i >= 0 ? saw.step += i : saw.step = saw.actions.length;
                    var act = saw.actions[saw.step - 1];
                    act && act.trap ? (saw.step = act.step, act.cb()) : saw.next();
                }, saw.jump = function(step) {
                    saw.step = step, saw.next();
                };
            })(saw);
        }, [ "trap", "down", "jump" ].forEach((function(method) {
            saw[method] = function() {
                throw new Error("To use the trap, down and jump features, please call record() first to start recording actions.");
            };
        })), saw;
    };
}
