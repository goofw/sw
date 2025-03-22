function(module, exports, __webpack_require__) {
    const unzipper = __webpack_require__(1149), request = __webpack_require__(228), store = __webpack_require__(240), safeStatelessRegex = __webpack_require__(169), isRegex = /^\/(.*)\/(.*)$/;
    module.exports = async function(req) {
        let {opts: opts, query: query} = (function(req) {
            let opts = {};
            try {
                opts = JSON.parse(req.query.o);
            } catch (e) {}
            return (opts.fileMustInclude || []).length && (opts.fileMustInclude = opts.fileMustInclude.map((el => {
                if ((el || "").match(isRegex)) {
                    const parts = isRegex.exec(el);
                    try {
                        return new RegExp(parts[1], parts[2]);
                    } catch (e) {}
                }
                return el;
            }))), {
                opts: opts,
                query: req.query
            };
        })(req);
        const zipUrls = (function(query) {
            let zipUrls = [], key = query.key;
            return key && store.get(key) ? zipUrls = store.get(key) : (zipUrls = query.r || [], 
            "string" == typeof zipUrls && (zipUrls = [ zipUrls ])), zipUrls;
        })(query);
        (opts.fileMustInclude || []).length || opts.hasOwnProperty("fileIdx") || (opts = {
            fileMustInclude: [ /.mkv$|.mp4$|.avi$/i ]
        });
        const directory = await unzipper.Open.url(request, zipUrls[0]);
        let countFiles = -1;
        return directory.files.find((d => (countFiles++, (opts.fileMustInclude || []).length ? !!opts.fileMustInclude.find((reg => (reg = "string" == typeof reg ? new RegExp(reg) : reg, 
        safeStatelessRegex(d.path || "", reg, 500)))) : !opts.hasOwnProperty("fileIdx") || opts.fileIdx === countFiles)));
    };
}
