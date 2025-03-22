function(module, exports, __webpack_require__) {
    const request = __webpack_require__(228);
    module.exports = async function(url) {
        return new Promise(((resolve, reject) => {
            const req = request({
                url: url,
                followRedirect: !0,
                maxRedirects: 5,
                strictSSL: !1
            });
            req.on("response", (function(d) {
                req.abort(), d.headers["content-length"] ? resolve(d.headers["content-length"]) : reject("Could not retrieve content-length from ranged request");
            })).on("error", reject);
        }));
    };
}
