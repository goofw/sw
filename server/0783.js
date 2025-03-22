function(module, exports, __webpack_require__) {
    var wrappy = __webpack_require__(252), reqs = Object.create(null), once = __webpack_require__(34);
    function slice(args) {
        for (var length = args.length, array = [], i = 0; i < length; i++) array[i] = args[i];
        return array;
    }
    module.exports = wrappy((function(key, cb) {
        return reqs[key] ? (reqs[key].push(cb), null) : (reqs[key] = [ cb ], (function(key) {
            return once((function RES() {
                var cbs = reqs[key], len = cbs.length, args = slice(arguments);
                try {
                    for (var i = 0; i < len; i++) cbs[i].apply(null, args);
                } finally {
                    cbs.length > len ? (cbs.splice(0, len), process.nextTick((function() {
                        RES.apply(null, args);
                    }))) : delete reqs[key];
                }
            }));
        })(key));
    }));
}
