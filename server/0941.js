function(module, exports, __webpack_require__) {
    const getContentType = __webpack_require__(1148), getZipStream = __webpack_require__(504), bodyParser = __webpack_require__(106), Router = __webpack_require__(469), store = __webpack_require__(240);
    module.exports = function() {
        const router = Router();
        return router.use(bodyParser.json()), router.post("/create", ((req, res) => {
            Array.isArray(req.body) || res.status(500).send("Cannot parse JSON data");
            const key = store.set(req.body);
            res.setHeader("Content-Length", JSON.stringify({
                key: key
            }).length + ""), res.setHeader("Content-Type", "application/json"), res.end(JSON.stringify({
                key: key
            }));
        })), router.get("/stream", (async (req, res) => {
            let file;
            try {
                file = await getZipStream(req);
            } catch (e) {
                return console.error(e), res.statusCode = 500, void res.end();
            }
            const contentLength = file.uncompressedSize;
            return ((req || {}).headers || {}).range && "bytes=0-" !== req.headers.range && req.headers.range !== "bytes=0-" + (contentLength - 1) ? (res.statusCode = 405, 
            void res.end()) : "HEAD" === req.method ? (res.statusCode = 204, res.setHeader("Content-Length", contentLength + ""), 
            res.setHeader("Content-Type", getContentType({
                name: file.path
            })), void res.end()) : (res.statusCode = 200, res.setHeader("Content-Type", getContentType({
                name: file.path
            })), res.setHeader("Content-Length", contentLength), void file.stream().pipe(res));
        })), router;
    };
}
