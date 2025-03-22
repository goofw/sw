function(module, exports, __webpack_require__) {
    const namedQueue = __webpack_require__(270), helpers = __webpack_require__(226);
    var providers = {
        metadata: __webpack_require__(1012),
        imdbFind: __webpack_require__(1013)
    }, defaultProviders = [ "metadata", "imdbFind" ], cache = {}, cacheLastSet = {}, queue = new namedQueue((function(task, cb) {
        var prov = [].concat(task.providers);
        !(function nextProv() {
            var n = prov.shift();
            if (!n) return cb(null, null);
            var provider = providers[n];
            if (!provider) return cb(new Error("unknown provider: " + n));
            provider(task.q, (function(err, res) {
                return err ? cb(err) : res ? cb(null, res, {
                    match: n
                }) : void nextProv();
            }));
        })();
    }), 3);
    module.exports = function(args, cb) {
        args = "string" == typeof args ? {
            name: args
        } : args;
        var q = {
            name: helpers.parseSearchTerm(args.name)
        };
        if (args.year && (q.year = args.year), args.type && (q.type = args.type), !q.name) return cb(new Error("empty name"));
        if (q.year && "string" == typeof q.year && (q.year = parseInt(q.year.split("-")[0])), 
        q.year && isNaN(q.year)) return cb(new Error("invalid year"));
        if (q.type && "movie" != q.type && "series" != q.type) return cb(null, null);
        var key = new Buffer.from(args.hintUrl || Object.values(q).join(":")).toString("ascii");
        if (cache.hasOwnProperty(key) && Date.now() - cacheLastSet[key] < 432e5) return cb(null, cache[key][0], {
            match: cache[key][1].match,
            isCached: !0
        });
        queue.push({
            id: key,
            q: q,
            providers: args.providers || defaultProviders
        }, (function(err, res, match) {
            if (err) return cb(err);
            res && res.id && (cache[key] = [ res.id, match ], cacheLastSet[key] = Date.now()), 
            cb(null, (res || {}).id, {
                ...match,
                meta: res
            });
        }));
    };
}
