function(module, exports, __webpack_require__) {
    const store = __webpack_require__(240), getRouter = __webpack_require__(1147), getZipStream = __webpack_require__(504);
    module.exports = {
        router: getRouter,
        create: zipUrls => {
            if (!zipUrls || !Array.isArray(zipUrls)) throw Error('"zipUrls" is undefined or not an array');
            return store.set(zipUrls);
        },
        file: async (key, opts) => {
            if (!key) throw Error('Missing "key"');
            const file = await getZipStream({
                url: key,
                query: {
                    o: JSON.stringify(opts || {}),
                    key: key
                }
            });
            return file.createReadStream = () => file.stream(), file;
        }
    };
}
