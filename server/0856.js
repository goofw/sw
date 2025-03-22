function(module, exports, __webpack_require__) {
    const fs = __webpack_require__(2), {http: http, https: https} = __webpack_require__(857), {URL: URL, fileURLToPath: fileURLToPath} = __webpack_require__(7);
    module.exports = {
        open: async function(url, offset) {
            const {protocol: protocol, href: href} = new URL(url);
            return new Promise(((resolve, reject) => {
                switch (protocol) {
                  case "http:":
                    http.get(href, {
                        headers: {
                            range: `bytes=${offset}-`
                        }
                    }, resolve).on("error", reject);
                    break;

                  case "https:":
                    https.get(href, {
                        headers: {
                            range: `bytes=${offset}-`
                        }
                    }, resolve).on("error", reject);
                    break;

                  case "file:":
                    resolve(fs.createReadStream(fileURLToPath(href), {
                        start: offset
                    }));
                    break;

                  default:
                    reject(new Error("Unsupported protocol"));
                }
            }));
        },
        close: function(stream) {
            stream.req && "function" == typeof stream.req.abort ? stream.req.abort() : "function" == typeof stream.destroy && stream.destroy();
        }
    };
}
