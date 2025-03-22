function(module, exports, __webpack_require__) {
    const Router = __webpack_require__(469), bodyParser = __webpack_require__(106), getRarStream = __webpack_require__(472), getContentType = __webpack_require__(1145), store = __webpack_require__(227);
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
            let rarInnerFile;
            try {
                rarInnerFile = await getRarStream(req);
            } catch (e) {
                return console.error(e), res.statusCode = 500, void res.end();
            }
            if ("HEAD" === req.method) return res.statusCode = 204, res.setHeader("Accept-Ranges", "bytes"), 
            res.setHeader("Content-Length", rarInnerFile.length + ""), res.setHeader("Content-Type", getContentType(rarInnerFile)), 
            void res.end();
            const fileSize = rarInnerFile.length, range = req.headers.range;
            let start = 0, end = fileSize - 1;
            if (res.setHeader("Accept-Ranges", "bytes"), res.setHeader("Content-Type", getContentType(rarInnerFile)), 
            Object.values(range || {}).length) {
                const parts = range.replace(/bytes=/, "").split("-");
                start = parseInt(parts[0], 10) || 0, end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1, 
                res.statusCode = 206, res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
                const chunksize = end - start + 1;
                res.setHeader("Content-Length", chunksize + "");
            } else res.statusCode = 200, res.setHeader("Content-Length", fileSize + "");
            rarInnerFile.createReadStream({
                start: start,
                end: end
            }).pipe(res);
        })), router;
    };
}
