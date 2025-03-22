function(module, exports, __webpack_require__) {
    const consts = __webpack_require__(79), pkg = __webpack_require__(466);
    module.exports = {
        id: "org.stremio.local",
        version: pkg.version,
        description: pkg.description,
        name: "Local Files",
        resources: [ "catalog", {
            name: "meta",
            types: [ "other" ],
            idPrefixes: [ consts.PREFIX_LOCAL, consts.PREFIX_BT ]
        }, {
            name: "stream",
            types: [ "movie", "series" ],
            idPrefixes: [ consts.PREFIX_IMDB ]
        } ],
        types: [ "movie", "series", "other" ],
        catalogs: [ {
            type: "other",
            id: "local"
        } ]
    };
}
