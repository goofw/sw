function(module, exports, __webpack_require__) {
    const pkg = __webpack_require__(466);
    var fs = __webpack_require__(2), byline = __webpack_require__(93), promisify = __webpack_require__(0).promisify;
    module.exports = function(opts) {
        var writeStream, self = this;
        function commitEntry(key, entry) {
            self.indexes.primaryKey.set(key, entry), self.opts.entryIndexes.forEach((function(property) {
                entry[property] && (self.indexes[property].has(entry[property]) || self.indexes[property].set(entry[property], new Map), 
                self.indexes[property].get(entry[property]).set(key, entry));
            }));
        }
        function persistEntry(key, entry, cb) {
            if (!writeStream) return cb(new Error("unable to persist, no fd"));
            writeStream.write(JSON.stringify({
                id: key,
                entry: entry,
                v: pkg.version
            }) + "\n", cb);
        }
        function onInternalErr(err) {
            console.error("storage", err);
        }
        this.opts = Object.assign({
            entryIndexes: [],
            validateRecord: null
        }, opts), this.indexes = {
            primaryKey: new Map
        }, this.opts.entryIndexes.forEach((function(key) {
            self.indexes[key] = new Map;
        })), this.load = function(dbPath) {
            var truncate = !1, open = promisify(fs.open), close = promisify(fs.close);
            return open(dbPath, "a+").then((function(fd) {
                return new Promise((function(resolve) {
                    fs.createReadStream(null, {
                        fd: fd,
                        autoClose: !1
                    }).on("error", onInternalErr).pipe(byline()).on("error", onInternalErr).on("data", (function(line) {
                        var record;
                        try {
                            if ((record = JSON.parse(line.toString())).v !== pkg.version) throw "Version missmatch";
                            self.opts.validateRecord && self.opts.validateRecord(record.id, record.entry), commitEntry(record.id, record.entry);
                        } catch (e) {
                            truncate = !0;
                        }
                    })).on("finish", (function() {
                        Promise.resolve().then((function() {
                            return truncate ? close(fd).then((function() {
                                return open(dbPath, "w");
                            })) : fd;
                        })).then((function(fd) {
                            (writeStream = fs.createWriteStream(null, {
                                fd: fd,
                                autoClose: !1
                            })).on("error", onInternalErr), truncate && self.indexes.primaryKey.forEach((function(entry, key) {
                                persistEntry(key, entry);
                            }));
                        })).catch(onInternalErr).then(resolve);
                    }));
                }));
            }));
        }, this.saveEntry = function(primaryKey, entry, cb) {
            if (self.indexes.primaryKey.has(primaryKey)) return cb();
            commitEntry(primaryKey, entry), persistEntry(primaryKey, entry, cb);
        }, this.getAggrEntry = function(index, key, groups) {
            const items = this.indexes[index].get(key);
            if (!items) return null;
            let entry;
            return items.forEach((function(item) {
                if (entry) for (let group of groups) {
                    if (void 0 === entry[group]) return;
                    Array.isArray(entry[group]) || (entry[group] = [ entry[group] ]), entry[group] = entry[group].concat(item[group]);
                } else entry = Object.assign({}, item);
            })), entry;
        };
    };
}
