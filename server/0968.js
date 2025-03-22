function(module, exports, __webpack_require__) {
    const addonSDK = __webpack_require__(969), fs = __webpack_require__(2);
    let engineUrl = "http://127.0.0.1:11470";
    const manifest = __webpack_require__(465), manifestNoCatalogs = __webpack_require__(999), catalogHandler = __webpack_require__(1e3), metaHandler = __webpack_require__(1001), streamHandler = __webpack_require__(1023), Storage = __webpack_require__(1024), findFiles = __webpack_require__(1025), indexer = __webpack_require__(467), mapEntryToMeta = __webpack_require__(468), storage = new Storage({
        validateRecord: function(index, entry) {
            fs.accessSync(index, fs.constants.R_OK);
        },
        entryIndexes: [ "itemId" ]
    }), metaStorage = new Storage;
    function logError(err) {
        console.log("Error:", err);
    }
    function onDiscoveredFile(fPath) {
        storage.indexes.primaryKey.has(fPath) || storage.indexes.primaryKey.size >= 1e4 || indexer.indexFile(fPath, (function(err, entry) {
            err ? indexLog(fPath, "indexing error: " + (err.message || err)) : entry && (storage.saveEntry(fPath, entry, (function(err) {
                err ? console.log(err) : entry.itemId && indexLog(fPath, "is now indexed: " + entry.itemId);
            })), entry.files && entry.files.length > 0 && entry.itemId && mapEntryToMeta(entry).then((function(meta) {
                metaStorage.saveEntry(meta.id, meta, (function() {}));
            })).catch((() => {})));
        }));
    }
    function indexLog(fPath, status) {
        console.log("-> " + fPath + ": " + status);
    }
    module.exports = {
        addon: function(options) {
            const addonBuilder = new addonSDK((options = options || {}).disableCatalogSupport ? manifestNoCatalogs : manifest);
            return addonBuilder.defineCatalogHandler((function(args, cb) {
                catalogHandler(storage, metaStorage, args, cb);
            })), addonBuilder.defineMetaHandler((function(args, cb) {
                metaHandler(storage, metaStorage, engineUrl, args, cb);
            })), addonBuilder.defineStreamHandler((function(args, cb) {
                streamHandler(storage, args, cb);
            })), addonBuilder;
        },
        setEngineUrl: function(url) {
            engineUrl = url;
        },
        startIndexing: function(fPath) {
            Promise.all([ metaStorage.load(fPath + "Meta").catch(logError), storage.load(fPath).catch(logError) ]).then((function(err) {
                findFiles().on("file", onDiscoveredFile);
            }));
        }
    };
}
