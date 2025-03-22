function(module, exports, __webpack_require__) {
    const store = __webpack_require__(227), getRouter = __webpack_require__(1035), getRarStream = __webpack_require__(472);
    module.exports = {
        router: getRouter,
        create: rarUrls => {
            if (!rarUrls || !Array.isArray(rarUrls)) throw Error('"rarUrls" is undefined or not an array');
            return store.set(rarUrls);
        },
        file: async (key, opts) => {
            if (!key) throw Error('Missing "key"');
            return await getRarStream({
                url: key,
                query: {
                    o: JSON.stringify(opts || {}),
                    key: key
                }
            });
        }
    };
}
