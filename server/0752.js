function(module, exports, __webpack_require__) {
    var path = __webpack_require__(4), Router = __webpack_require__(111), stream = __webpack_require__(3), https = __webpack_require__(22), fetch = __webpack_require__(33), Headers = fetch.Headers, proxyReqHeaders = [ "accept", "accept-encoding", "accept-language", "connection", "transfer-encoding", "range", "if-range", "user-agent" ], proxyResHeaders = [ "accept-ranges", "content-type", "content-length", "content-range", "connection", "transfer-encoding", "last-modified", "etag", "server", "date" ], supportedPlaylists = [ ".m3u", ".m3u8" ];
    function makeHeaders(sourceHeaders, allowedHeaders, defaultHeaders) {
        return allowedHeaders.reduce((function(headers, header) {
            return sourceHeaders.has(header) && (headers[header] = sourceHeaders.get(header)), 
            headers;
        }), defaultHeaders || {});
    }
    function parseHeaderString(headerString) {
        var headerArray = headerString.split(":");
        return [ headerArray.shift(), headerArray.join(":") ];
    }
    module.exports = {
        getRouter: function() {
            var router = Router(), httpsAgent = new https.Agent({
                rejectUnauthorized: !1
            });
            return router.all("/:opts/:pathname(*)?", (function(req, res, next) {
                var opts = new URLSearchParams(req.params.opts), dest = new URL(opts.get("d")), headers = new Headers(makeHeaders(new Headers(req.headers), proxyReqHeaders, {
                    host: dest.host
                }));
                dest.pathname = req.params.pathname || "", dest.search = req.search || "", opts.getAll("h").forEach((function(headerString) {
                    headers.set.apply(headers, parseHeaderString(headerString));
                })), fetch(dest, {
                    method: req.method,
                    headers: headers,
                    agent: httpsAgent
                }).then((function(result) {
                    var responseHeaders = makeHeaders(result.headers, proxyResHeaders);
                    opts.getAll("r").forEach((function(headerString) {
                        var parsedHeader = parseHeaderString(headerString);
                        responseHeaders[parsedHeader[0]] = parsedHeader[1];
                    }));
                    var isPlaylist = supportedPlaylists.includes(path.extname(dest.pathname)) || (responseHeaders["content-type"] || "").toLowerCase().includes("mpegurl");
                    if (isPlaylist && (delete responseHeaders["content-length"], responseHeaders["accept-ranges"] = "none", 
                    responseHeaders["transfer-encoding"] ? responseHeaders["transfer-encoding"].toLowerCase().includes("chunked") || (responseHeaders["transfer-encoding"] += ", chunked") : responseHeaders["transfer-encoding"] = "chunked"), 
                    res.writeHead(result.status, responseHeaders), isPlaylist) {
                        var virtualRoot = req.originalUrl.slice(0, -req.url.length) + "/" + opts.toString();
                        result.body.pipe((function(virtualRoot, dest) {
                            var partialLine = "", eol = null;
                            function parseUrl(line) {
                                if (line.startsWith("http://") || line.startsWith("https://")) {
                                    var lineUrl = new URL(line);
                                    return lineUrl.origin !== dest.origin ? line : path.join(virtualRoot, lineUrl.pathname) + lineUrl.search;
                                }
                                return line.startsWith("/") ? path.join(virtualRoot, line) : line;
                            }
                            function parseLine(line) {
                                if (!line.startsWith("#") && line.length > 0) return parseUrl(line);
                                var uri = line.match(/URI="(?<url>[^"]+)"/);
                                return uri ? line.replace(uri.groups.url, parseUrl(uri.groups.url)) : line;
                            }
                            return new stream.Transform({
                                transform: function(chunk, _, done) {
                                    var data = partialLine + chunk.toString();
                                    eol || (eol = (function(data) {
                                        var lf = data.indexOf("\n"), cr = data.indexOf("\r");
                                        return lf < 0 && cr < 0 ? null : lf >= 0 && cr >= 0 ? cr < lf ? "\r\n" : "\n\r" : cr < 0 ? "\n" : "\r";
                                    })(data));
                                    var lines = data.split(eol);
                                    partialLine = lines.splice(lines.length - 1, 1)[0];
                                    var push = this.push.bind(this);
                                    lines.forEach((function(line) {
                                        push(parseLine(line) + eol);
                                    })), done();
                                },
                                flush: function(done) {
                                    done(null, parseLine(partialLine)), partialLine = "", eol = null;
                                }
                            });
                        })(virtualRoot, dest)).pipe(res);
                    } else result.body.pipe(res);
                })).catch(next);
            })), router;
        }
    };
}
