function(module, exports, __webpack_require__) {
    const express = __webpack_require__(970), cors = __webpack_require__(992), http = __webpack_require__(11), linter = __webpack_require__(994), qs = __webpack_require__(28), publishToDir = __webpack_require__(997), publishToCentral = __webpack_require__(998);
    module.exports = function(manifest) {
        const addonHTTP = express.Router();
        addonHTTP.use(cors());
        const handlers = {}, linterRes = linter.lintManifest(manifest);
        if (!linterRes.valid) throw linterRes.errors[0];
        linterRes.warnings.length && linterRes.warnings.forEach((function(warning) {
            console.log("WARNING:", warning.message);
        }));
        const manifestBuf = new Buffer(JSON.stringify(manifest));
        if (manifestBuf.length > 8192) throw "manifest size exceeds 8kb, which is incompatible with addonCollection API";
        return addonHTTP.get("/manifest.json", (function(req, res) {
            res.setHeader("Content-Type", "application/json; charset=utf-8"), res.end(manifestBuf);
        })), addonHTTP.get("/:resource/:type/:id/:extra?.json", (function(req, res, next) {
            let handler = handlers[req.params.resource];
            handler ? (res.setHeader("Content-Type", "application/json; charset=utf-8"), handler({
                type: req.params.type,
                id: req.params.id,
                extra: req.params.extra ? qs.parse(req.params.extra) : {}
            }, (function(err, resp) {
                err && (console.error(err), res.writeHead(500), res.end(JSON.stringify({
                    err: "handler error"
                }))), res.end(JSON.stringify(resp));
            }))) : next();
        })), this.defineResourceHandler = function(resource, handler) {
            if (handlers[resource]) throw "handler for " + resource + " already defined";
            handlers[resource] = handler;
        }, this.defineStreamHandler = this.defineResourceHandler.bind(this, "stream"), this.defineMetaHandler = this.defineResourceHandler.bind(this, "meta"), 
        this.defineCatalogHandler = this.defineResourceHandler.bind(this, "catalog"), this.defineSubtitleHandler = this.defineResourceHandler.bind(this, "subtitles"), 
        this.run = function(cb) {
            this.runHTTPWithOptions({
                port: process.env.PORT || null,
                cache: 7200
            }, cb);
        }, this.runHTTPWithOptions = function(options, cb) {
            var addonHTTPApp = express();
            addonHTTPApp.use((function(req, res, next) {
                options.cache && res.setHeader("Cache-Control", "max-age=" + options.cache), next();
            })), addonHTTPApp.use("/", addonHTTP);
            var server = http.createServer(addonHTTPApp);
            server.listen(options.port, (function() {
                var url = "http://127.0.0.1:" + server.address().port + "/manifest.json";
                console.log("HTTP addon accessible at:", url), cb && cb(null, {
                    server: server,
                    url: url
                });
            }));
        }, this.getRouter = function() {
            return addonHTTP;
        }, this.publishToCentral = function(addonURL, apiURL) {
            return publishToCentral(addonURL, apiURL);
        }, this.publishToDir = function(baseDir) {
            publishToDir(baseDir || "./publish-" + manifest.id, manifest, handlers);
        }, this;
    };
}
