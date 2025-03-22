function(module, exports, __webpack_require__) {
    const mkdirp = __webpack_require__(132), path = __webpack_require__(4), fs = __webpack_require__(2);
    function commitRes(endPath, res) {
        mkdirp(path.dirname(endPath), (function(err) {
            if (err) return console.error(err);
            fs.writeFile(endPath, JSON.stringify(res), (function(err) {
                if (err) return console.error(err);
                console.log("Written " + endPath);
            }));
        }));
    }
    module.exports = function(baseDir, manifest, handlers) {
        function addToQueue(res, type, id, extra, cb) {
            const endPath = path.join(baseDir, res, type, id + ".json");
            handlers[res]({
                id: id,
                type: type,
                extra: {}
            }, (function(err, res) {
                if (err) return cb(err);
                commitRes(endPath, res), cb(null, res);
            }));
        }
        mkdirp.sync(baseDir), commitRes(path.join(baseDir, "manifest.json"), manifest), 
        manifest.catalogs && handlers.catalog && manifest.catalogs.forEach((function(cat) {
            addToQueue("catalog", cat.type, cat.id, 0, (function(err, res) {
                err && console.error(err), res && Array.isArray(res.metas) && (function(res) {
                    res.metas.forEach((function(meta) {
                        meta.id && addToQueue("meta", meta.type, meta.id, 0, (function(err, res) {
                            err && console.error(err);
                        }));
                    }));
                })(res);
            }));
        }));
    };
}
