function(module, exports, __webpack_require__) {
    const {RarFilesPackage: RarFilesPackage} = __webpack_require__(1038), urlToFileMedia = __webpack_require__(1039), store = __webpack_require__(227), safeStatelessRegex = __webpack_require__(169), rarStreams = {}, isRegex = /^\/(.*)\/(.*)$/;
    module.exports = async function(req) {
        const {opts: opts, query: query} = (function(req) {
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
        })(req), rarUrls = (function(query) {
            let rarUrls = [], key = query.key;
            return key && store.get(key) ? rarUrls = store.get(key) : (rarUrls = query.r || [], 
            "string" == typeof rarUrls && (rarUrls = [ rarUrls ])), rarUrls;
        })(query);
        return rarStreams[req.url] = rarStreams[req.url] || await (async (urls, opts = {}) => {
            const rarFiles = [];
            for (let url of urls) rarFiles.push(urlToFileMedia(url));
            const rarStreamPackage = new RarFilesPackage(await Promise.all(rarFiles));
            (opts.fileMustInclude || []).length || opts.hasOwnProperty("fileIdx") || (opts = {
                fileMustInclude: [ /.mkv$|.mp4$|.avi$/i ]
            });
            const rarStreamOpts = {
                filter: function(name, idx) {
                    return (opts.fileMustInclude || []).length ? !!opts.fileMustInclude.find((reg => (reg = "string" == typeof reg ? new RegExp(reg) : reg, 
                    safeStatelessRegex(name || "", reg, 500)))) : !opts.hasOwnProperty("fileIdx") || opts.fileIdx === idx;
                },
                maxFiles: 1
            }, innerFiles = await rarStreamPackage.parse(rarStreamOpts);
            if (!innerFiles[0]) throw Error("no file matching " + JSON.stringify(opts));
            return innerFiles[0];
        })(rarUrls, opts), rarStreams[req.url];
    };
}
