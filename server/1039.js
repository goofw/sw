function(module, exports, __webpack_require__) {
    const request = __webpack_require__(228), getContentLength = __webpack_require__(1144);
    module.exports = async function(url) {
        return new Promise((async (resolve, reject) => {
            let contentLength = !1;
            try {
                contentLength = await getContentLength(url);
            } catch (e) {
                return console.error(e), void reject(e);
            }
            let fileName = url.split("/").pop();
            (fileName || "").includes(".") ? (fileName = decodeURIComponent(fileName), fileName.includes("?") && (fileName = fileName.split("?")[0])) : fileName = "archive.rar", 
            resolve({
                length: parseInt(contentLength),
                name: fileName,
                createReadStream: range => {
                    const opts = {
                        url: url,
                        followRedirect: !0,
                        maxRedirects: 5,
                        strictSSL: !1
                    };
                    return Object.values(range).length && (range.start = range.start || 0, range.end = range.end || 0, 
                    (range.end > contentLength - 1 || 0 === range.end) && (range.end = ""), opts.headers = {
                        range: `bytes=${range.start}-${range.end}`
                    }), request(opts);
                }
            });
        }));
    };
}
