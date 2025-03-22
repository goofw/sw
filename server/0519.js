function(module, exports) {
    const reduce = Function.bind.call(Function.call, Array.prototype.reduce), isEnumerable = Function.bind.call(Function.call, Object.prototype.propertyIsEnumerable), concat = Function.bind.call(Function.call, Array.prototype.concat), keys = Reflect.ownKeys;
    Object.values || (Object.values = function(O) {
        return reduce(keys(O), ((v, k) => concat(v, "string" == typeof k && isEnumerable(O, k) ? [ O[k] ] : [])), []);
    }), Object.entries || (Object.entries = function(O) {
        return reduce(keys(O), ((e, k) => concat(e, "string" == typeof k && isEnumerable(O, k) ? [ [ k, O[k] ] ] : [])), []);
    }), Object.fromEntries || (Object.fromEntries = function(iter) {
        const obj = {};
        for (const pair of iter) {
            if (Object(pair) !== pair) throw new TypeError("iterable for fromEntries should yield objects");
            const {0: key, 1: val} = pair;
            Object.defineProperty(obj, key, {
                configurable: !0,
                enumerable: !0,
                writable: !0,
                value: val
            });
        }
        return obj;
    });
}
