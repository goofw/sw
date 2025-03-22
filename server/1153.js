function(module, exports) {
    function Traverse(obj) {
        if (!(this instanceof Traverse)) return new Traverse(obj);
        this.value = obj;
    }
    function walk(root, cb, immutable) {
        var path = [], parents = [], alive = !0;
        return (function walker(node_) {
            var node = immutable ? copy(node_) : node_, modifiers = {}, state = {
                node: node,
                node_: node_,
                path: [].concat(path),
                parent: parents.slice(-1)[0],
                key: path.slice(-1)[0],
                isRoot: 0 === path.length,
                level: path.length,
                circular: null,
                update: function(x) {
                    state.isRoot || (state.parent.node[state.key] = x), state.node = x;
                },
                delete: function() {
                    delete state.parent.node[state.key];
                },
                remove: function() {
                    Array.isArray(state.parent.node) ? state.parent.node.splice(state.key, 1) : delete state.parent.node[state.key];
                },
                before: function(f) {
                    modifiers.before = f;
                },
                after: function(f) {
                    modifiers.after = f;
                },
                pre: function(f) {
                    modifiers.pre = f;
                },
                post: function(f) {
                    modifiers.post = f;
                },
                stop: function() {
                    alive = !1;
                }
            };
            if (!alive) return state;
            if ("object" == typeof node && null !== node) {
                state.isLeaf = 0 == Object.keys(node).length;
                for (var i = 0; i < parents.length; i++) if (parents[i].node_ === node_) {
                    state.circular = parents[i];
                    break;
                }
            } else state.isLeaf = !0;
            state.notLeaf = !state.isLeaf, state.notRoot = !state.isRoot;
            var ret = cb.call(state, state.node);
            if (void 0 !== ret && state.update && state.update(ret), modifiers.before && modifiers.before.call(state, state.node), 
            "object" == typeof state.node && null !== state.node && !state.circular) {
                parents.push(state);
                var keys = Object.keys(state.node);
                keys.forEach((function(key, i) {
                    path.push(key), modifiers.pre && modifiers.pre.call(state, state.node[key], key);
                    var child = walker(state.node[key]);
                    immutable && Object.hasOwnProperty.call(state.node, key) && (state.node[key] = child.node), 
                    child.isLast = i == keys.length - 1, child.isFirst = 0 == i, modifiers.post && modifiers.post.call(state, child), 
                    path.pop();
                })), parents.pop();
            }
            return modifiers.after && modifiers.after.call(state, state.node), state;
        })(root).node;
    }
    function copy(src) {
        var dst;
        return "object" == typeof src && null !== src ? (dst = Array.isArray(src) ? [] : src instanceof Date ? new Date(src) : src instanceof Boolean ? new Boolean(src) : src instanceof Number ? new Number(src) : src instanceof String ? new String(src) : Object.create(Object.getPrototypeOf(src)), 
        Object.keys(src).forEach((function(key) {
            dst[key] = src[key];
        })), dst) : src;
    }
    module.exports = Traverse, Traverse.prototype.get = function(ps) {
        for (var node = this.value, i = 0; i < ps.length; i++) {
            var key = ps[i];
            if (!Object.hasOwnProperty.call(node, key)) {
                node = void 0;
                break;
            }
            node = node[key];
        }
        return node;
    }, Traverse.prototype.set = function(ps, value) {
        for (var node = this.value, i = 0; i < ps.length - 1; i++) {
            var key = ps[i];
            Object.hasOwnProperty.call(node, key) || (node[key] = {}), node = node[key];
        }
        return node[ps[i]] = value, value;
    }, Traverse.prototype.map = function(cb) {
        return walk(this.value, cb, !0);
    }, Traverse.prototype.forEach = function(cb) {
        return this.value = walk(this.value, cb, !1), this.value;
    }, Traverse.prototype.reduce = function(cb, init) {
        var skip = 1 === arguments.length, acc = skip ? this.value : init;
        return this.forEach((function(x) {
            this.isRoot && skip || (acc = cb.call(this, acc, x));
        })), acc;
    }, Traverse.prototype.deepEqual = function(obj) {
        if (1 !== arguments.length) throw new Error("deepEqual requires exactly one object to compare against");
        var equal = !0, node = obj;
        return this.forEach((function(y) {
            var notEqual = function() {
                equal = !1;
            }.bind(this);
            if (!this.isRoot) {
                if ("object" != typeof node) return notEqual();
                node = node[this.key];
            }
            var x = node;
            this.post((function() {
                node = x;
            }));
            var toS = function(o) {
                return Object.prototype.toString.call(o);
            };
            if (this.circular) Traverse(obj).get(this.circular.path) !== x && notEqual(); else if (typeof x != typeof y) notEqual(); else if (null === x || null === y || void 0 === x || void 0 === y) x !== y && notEqual(); else if (x.__proto__ !== y.__proto__) notEqual(); else if (x === y) ; else if ("function" == typeof x) x instanceof RegExp ? x.toString() != y.toString() && notEqual() : x !== y && notEqual(); else if ("object" == typeof x) if ("[object Arguments]" === toS(y) || "[object Arguments]" === toS(x)) toS(x) !== toS(y) && notEqual(); else if (x instanceof Date || y instanceof Date) x instanceof Date && y instanceof Date && x.getTime() === y.getTime() || notEqual(); else {
                var kx = Object.keys(x), ky = Object.keys(y);
                if (kx.length !== ky.length) return notEqual();
                for (var i = 0; i < kx.length; i++) {
                    var k = kx[i];
                    Object.hasOwnProperty.call(y, k) || notEqual();
                }
            }
        })), equal;
    }, Traverse.prototype.paths = function() {
        var acc = [];
        return this.forEach((function(x) {
            acc.push(this.path);
        })), acc;
    }, Traverse.prototype.nodes = function() {
        var acc = [];
        return this.forEach((function(x) {
            acc.push(this.node);
        })), acc;
    }, Traverse.prototype.clone = function() {
        var parents = [], nodes = [];
        return (function clone(src) {
            for (var i = 0; i < parents.length; i++) if (parents[i] === src) return nodes[i];
            if ("object" == typeof src && null !== src) {
                var dst = copy(src);
                return parents.push(src), nodes.push(dst), Object.keys(src).forEach((function(key) {
                    dst[key] = clone(src[key]);
                })), parents.pop(), nodes.pop(), dst;
            }
            return src;
        })(this.value);
    }, Object.keys(Traverse.prototype).forEach((function(key) {
        Traverse[key] = function(obj) {
            var args = [].slice.call(arguments, 1), t = Traverse(obj);
            return t[key].apply(t, args);
        };
    }));
}
