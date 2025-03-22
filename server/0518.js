function(module, exports, __webpack_require__) {
    (function(__dirname) {
        process.env.TV_ENV && (process.env.CASTING_DISABLED = 1, process.env.DISABLE_CACHING = 1, 
        process.env.NO_CORS = 1), process.env.NO_CORS = 1, __webpack_require__(519);
        var enginefs = __webpack_require__(155), path = __webpack_require__(4), os = __webpack_require__(21), http = __webpack_require__(11), url = __webpack_require__(7), ip = __webpack_require__(116), mkdirp = __webpack_require__(170), HLS = __webpack_require__(626), moment = __webpack_require__(1), isPositiveInteger = __webpack_require__(368), subtitlesTracks = __webpack_require__(695), subtitlesHash = __webpack_require__(741), https = __webpack_require__(751), proxy = __webpack_require__(752), defaultTrackers = __webpack_require__(753).map((el => `tracker:${el}`)), hwAccelProfiler = __webpack_require__(377).profiler, argv = __webpack_require__(759)(process.argv.slice(2)), apiCertifficateEndpoint = argv["https-cert-endpoint"] || process.env.HTTPS_CERT_ENDPOINT || "https://api.strem.io/api/certificateGet", webUILocation = argv["webui-location"] || process.env.WEBUI_LOCATION || "https://app.strem.io/shell-v4.4/", cache = __webpack_require__(380), searchPaths = {
            ffmpeg: [ argv.ffmpeg, process.env.FFMPEG_BIN, path.dirname(process.execPath) + "/ffmpeg", path.dirname(process.execPath) + "\\ffmpeg.exe", path.dirname(process.execPath) + "\\bin\\ffmpeg.exe", "/usr/lib/jellyfin-ffmpeg/ffmpeg", "/usr/bin/ffmpeg", "/usr/local/bin/ffmpeg", "android" !== process.platform ? __webpack_require__(381).ffmpegPath : null ],
            ffprobe: [ argv.ffprobe, process.env.FFPROBE_BIN, path.dirname(process.execPath) + "/ffprobe", path.dirname(process.execPath) + "\\ffprobe.exe", path.dirname(process.execPath) + "\\bin\\ffprobe.exe", "/usr/lib/jellyfin-ffmpeg/ffprobe", "/usr/bin/ffprobe", "/usr/local/bin/ffprobe", "android" !== process.platform ? __webpack_require__(381).ffprobePath : null ],
            ffsplit: [ path.join(__dirname, "./node_modules/stremio-ffsplit-prebuilt/bin/ffsplit.bin"), process.env.HOME + "/hls-segment-splitter/ffsplit.bin", path.dirname(process.execPath) + "\\bin\\ffsplit.exe" ]
        }, executables = HLS.locateAllExecutables(searchPaths);
        console.log("hls executables located -> ", executables), enginefs.engine = __webpack_require__(760), 
        enginefs.loggingEnabled = !0;
        var appPath = __webpack_require__(379);
        try {
            mkdirp.sync(appPath, {
                recursive: !0,
                mode: 493
            });
        } catch (err) {}
        console.log("Using app path -> " + appPath), enginefs.router.use((function(req, res, next) {
            process.env.NO_CORS || !req.headers.origin || req.headers.origin.match(".strem.io(:80)?$") || req.headers.origin.match(".stremio.net(:80)?$") || req.headers.origin.match(".stremio.com(:80)?$") || req.headers.origin.match("stremio-development.netlify.app(:80)?$") || req.headers.origin.match("stremio.github.io(:80)?$") || req.headers.origin.match("gstatic.com") || "https://stremio.github.io" === req.headers.origin || req.headers.origin.match("(127.0.0.1|localhost):11470$") || req.headers.origin.match("peario.xyz") ? enginefs.sendCORSHeaders(req, res, next) : next();
        }));
        var settings = __webpack_require__(94);
        if (!process.env.HLS_V2_DISABLED) {
            const hlsV2Router = new (__webpack_require__(797))(executables);
            enginefs.router.use("/hlsv2", hlsV2Router);
            const regexParam = (param, expression) => {
                enginefs.router.param(param, ((req, res, next, val) => {
                    const captures = val.match(expression);
                    if (!captures) return next("route");
                    req.params[param] = captures.groups ? {
                        val: val,
                        groups: captures.groups
                    } : val, next();
                }));
            };
            regexParam("infoHash", /^([0-9a-fA-F]{40}|file|url)$/), regexParam("playlist", /^(?:hls.m3u8|(?:video|audio|subtitle)\d+(?:.m3u8)?)$/), 
            regexParam("HLSSegment", /^(?:init.mp4|segment\d+.(?:m4s|vtt))$/), enginefs.router.get("/:infoHash/:videoId/:playlist/:HLSSegment?", ((req, res, next) => {
                req.url = `/${encodeURIComponent(`${req.params.infoHash}-${req.params.videoId}`)}/${req.params.playlist.replace("hls.m3u8", "master.m3u8")}`, 
                req.url += req.params.HLSSegment ? `/${req.params.HLSSegment}` : "", req.query = {
                    mediaURL: [ "file", "url" ].includes(req.params.infoHash) ? `${"url" === req.params.infoHash ? "" : "file://"}${req.params.videoId}` : [ enginefs.baseUrlLocal, req.params.infoHash, req.params.videoId ].join("/"),
                    maxAudioChannels: 2
                }, hlsV2Router.handle(req, res, next);
            }));
        }
        var avSamples = __webpack_require__(879);
        Object.keys(avSamples).forEach((key => {
            enginefs.router.get(`/samples/${key}.${avSamples[key].container}`, ((req, res, next) => {
                res.writeHead(200, {
                    "Content-Type": avSamples[key].mime
                }), res.end(Buffer.from(avSamples[key].data, "base64"));
            }));
        })), HLS.setParallelConverts(8);
        var setHLSFrom = function(req, res, next) {
            var first = req.params.first, second = req.params.second, from = req.params.from || req.query.from;
            from ? req.params.from = decodeURIComponent(from) : 40 == first.length ? req.params.from = enginefs.baseUrlLocal + "/" + first + "/" + second : "file" != first && "url" != first || (req.params.from = second), 
            next();
        };
        enginefs.router.get("/:first/:second/hls.m3u8", setHLSFrom, HLS.masterPlaylistMiddleware), 
        enginefs.router.get("/:first/:second/master.m3u8", setHLSFrom, HLS.masterMultiPlaylistMiddleware), 
        enginefs.router.get("/:first/:second/stream.m3u8", setHLSFrom, HLS.streamPlaylistMiddleware), 
        enginefs.router.get("/:first/:second/stream-q-:quality.m3u8", setHLSFrom, HLS.streamPlaylistMiddleware), 
        enginefs.router.get("/:first/:second/stream-:stream.m3u8", setHLSFrom, HLS.streamPlaylistMiddleware), 
        enginefs.router.get("/:first/:second/stream-q-:quality/:seg.ts", setHLSFrom, HLS.segmentMiddleware), 
        enginefs.router.get("/:first/:second/stream-:stream/:seg.ts", setHLSFrom, HLS.segmentMiddleware), 
        HLS.mp4StreamPlaylistMiddleware && enginefs.router.get("/:first/:second/mp4stream-q-:quality.m3u8", setHLSFrom, HLS.mp4StreamPlaylistMiddleware), 
        HLS.segmentMp4Middleware && enginefs.router.get("/:first/:second/mp4stream-q-:quality/:seg.mp4", setHLSFrom, HLS.segmentMp4Middleware), 
        enginefs.router.get("/:first/:second/dlna", setHLSFrom, HLS.DLNAMpegTtsMiddleware), 
        enginefs.router.get("/:first/:second/subs-:lang.m3u8", setHLSFrom, HLS.subsPlaylistMiddleware), 
        enginefs.router.get("/:first/:second/thumb.jpg", setHLSFrom, HLS.thumbMiddleware), 
        enginefs.router.get("/thumb.jpg", setHLSFrom, HLS.thumbMiddleware), enginefs.router.get("/probe", (function(req, res, next) {
            var vid = url.parse(req.url, !0).query.url;
            vid.match("://") || (vid = enginefs.baseUrlLocal + vid), HLS.probeVideo(vid, (function(err, result) {
                err && console.error(err), res.writeHead(err ? 500 : 200, {
                    "content-type": "application/json"
                }), res.end(JSON.stringify(result));
            }));
        }));
        var ytdl = __webpack_require__(880);
        function getYt(id, cb) {
            ytdl.getInfo("http://www.youtube.com/watch?v=" + id, {
                downloadURL: !0
            }).then((function(inf) {
                if (inf) {
                    var formatPref = ytdl.chooseFormat(inf.formats, {
                        filter: "audioandvideo"
                    });
                    cb(null, formatPref);
                } else cb(new Error("empty response from ytdl.getInfo"));
            })).catch((function(err) {
                cb(err || new Error("unknown error from ytdl.getInfo"));
            }));
        }
        if (enginefs.router.get("/yt/:id.json", (function(req, res, next) {
            getYt(req.params.id, (function(err, format) {
                var status = 200, body = {};
                err && (status = 403, body = {
                    err: err.message || err
                }), format && format.url ? body = format : status = 404, res.writeHead(status, {
                    "content-type": "application/json"
                }), res.end(JSON.stringify(body));
            }));
        })), enginefs.router.get("/yt/:id", (function(req, res, next) {
            getYt(req.params.id, (function(err, format) {
                if (err) return console.error(err), res.writeHead(403), void res.end();
                format && format.url ? res.writeHead(301, {
                    Location: format.url
                }) : res.writeHead(404), res.end();
            }));
        })), !process.env.CASTING_DISABLED && "android" !== process.platform) {
            console.log("Enabling casting...");
            var casting = new (__webpack_require__(887))(executables);
            enginefs.router.use("/casting/", casting.middleware);
        }
        enginefs.router.get("/subtitlesTracks", (function(req, res) {
            subtitlesTracks({
                url: req.query.subsUrl
            }, (function(error, result) {
                var code = error ? 500 : 200, body = JSON.stringify({
                    error: error,
                    result: result
                });
                res.writeHead(code, {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(body, "utf8")
                }), res.end(body);
            }));
        })), enginefs.router.get("/opensubHash", (function(req, res) {
            subtitlesHash({
                url: req.query.videoUrl
            }, (function(error, result) {
                var code = error ? 500 : 200, body = JSON.stringify({
                    error: error,
                    result: result
                });
                res.writeHead(code, {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(body, "utf8")
                }), res.end(body);
            }));
        })), enginefs.router.get("/subtitles.:ext", (function(req, res) {
            var isVtt = req.url.match("^/subtitles.vtt"), query = url.parse(req.url, !0).query, offset = query.offset ? parseInt(query.offset) : null;
            subtitlesTracks({
                url: query.from
            }, (function(err, handle) {
                if (err) return console.error(err), res.writeHead(500), void res.end();
                if (0 === handle.tracks.length) return res.writeHead(500), void res.end();
                isVtt && res.write("WEBVTT\n\n");
                var format = function(d) {
                    return isVtt ? moment(d).utcOffset(0).format("HH:mm:ss.SSS") : moment(d).utcOffset(0).format("HH:mm:ss,SSS");
                }, applOffset = offset ? function(d) {
                    return new Date(new Date(d).getTime() + offset);
                } : function(d) {
                    return new Date(d);
                };
                handle.tracks.forEach((function(track, i) {
                    res.write(i.toString() + "\n"), res.write(format(applOffset(track.startTime)) + " --\x3e " + format(applOffset(track.endTime)) + "\n"), 
                    res.write(track.text.replace(/&/g, "&amp;") + "\n\n");
                })), res.end();
            }));
        })), enginefs.router.get("/network-info", ((req, res) => {
            try {
                const networkInterfaces = os.networkInterfaces(), availableInterfaces = Object.entries(networkInterfaces).flatMap((([, addresses]) => addresses)).filter((({internal: internal, family: family}) => !internal && "IPv4" === family)).map((({address: address}) => address)), networkInfo = JSON.stringify({
                    availableInterfaces: availableInterfaces
                });
                res.writeHead(200, {
                    "Content-Type": "application/json"
                }), res.end(networkInfo);
            } catch (e) {
                console.error(e), res.writeHead(500, {
                    "Content-Type": "text/plain",
                    "Content-Length": e.message.length
                }), res.end(e.message);
            }
        })), enginefs.router.get("/device-info", ((req, res) => {
            try {
                const onHardwareAcceleration = profiles => {
                    const deviceInfo = JSON.stringify({
                        availableHardwareAccelerations: profiles
                    });
                    res.writeHead(200, {
                        "Content-Type": "application/json"
                    }), res.end(deviceInfo);
                }, port = server.address().port;
                hwAccelProfiler(port, onHardwareAcceleration);
            } catch (e) {
                console.error(e), res.writeHead(500, {
                    "Content-Type": "text/plain",
                    "Content-Length": e.message.length
                }), res.end(e.message);
            }
        })), enginefs.router.get("/settings", (function(req, res) {
            res.writeHead(200, {
                "content-type": "application/json"
            }), cache.getOptions((function(err, opts) {
                res.end(JSON.stringify({
                    options: opts,
                    values: settings,
                    baseUrl: enginefs.baseUrl
                }));
            }));
        })), enginefs.router.post("/settings", (function(req, res) {
            settings.extend(req.body), cache.setOptionValues(settings), settings.save((function() {
                res.writeHead(200, {
                    "content-type": "application/json"
                }), res.end(JSON.stringify({
                    success: !0
                }));
            }));
        }));
        var localAddon = __webpack_require__(968);
        enginefs.router.use("/local-addon", localAddon.addon({
            disableCatalogSupport: !settings.localAddonEnabled
        }).getRouter()), "android" !== process.platform && settings.localAddonEnabled && localAddon.startIndexing(path.join(appPath, "./localFiles")), 
        enginefs.router.get("/get-https", (function(req, res) {
            var message;
            https.newCertificate(req.query.ipAddress, req.query.authKey).then((function(cert) {
                message = JSON.stringify({
                    ipAddress: req.query.ipAddress,
                    domain: cert.domain,
                    port: sserver.address().port
                }), res.writeHead(200, {
                    "content-type": "application/json",
                    "content-length": message.length
                }), res.end(message);
            })).catch((function(err) {
                message = "Cannot get valid certificate", res.writeHead(500, {
                    "content-type": "text/plain",
                    "content-length": message.length
                }), res.end(message), console.error(message, err);
            }));
        })), enginefs.router.get("/hwaccel-profiler", (function(req, res) {
            hwAccelProfiler(server.address().port, (function(result) {
                result ? res.end(JSON.stringify(result)) : (message = "No viable hardware acceleration profiles detected", 
                res.writeHead(500, {
                    "content-type": "text/plain",
                    "content-length": message.length
                }), res.end(message));
            }));
        })), enginefs.router.get("/", (function(req, res, next) {
            if (!req.headers.host) return next("No host header");
            var socketConstructor = req.socket.constructor.name, protocol = "";
            if ("Socket" == socketConstructor) protocol = "http://"; else {
                if ("TLSSocket" != socketConstructor) return next("Unknown protocol");
                protocol = "https://";
            }
            var serverUrl = encodeURIComponent(protocol + req.headers.host), sep = webUILocation.includes("?") ? "&" : "?", location = webUILocation + sep + "streamingServer=" + serverUrl;
            res.writeHead(307, {
                location: location
            }), res.end();
        })), enginefs.router.use("/proxy", proxy.getRouter());
        var app = enginefs.app(), server = (http = __webpack_require__(11), enginefs._server = http.createServer(app)), port = 11470;
        server.listen(port), server.on("error", (function(err) {
            port++ < 11474 ? (console.warn(err), server.listen(port)) : console.error(err);
        })), http.globalAgent.maxSockets = 40, server.on("listening", (function() {
            enginefs.baseUrlLocal = "http://127.0.0.1:" + server.address().port, enginefs.baseUrl = "http://" + ip.address() + ":" + server.address().port, 
            localAddon.setEngineUrl(enginefs.baseUrlLocal), console.log("EngineFS server started at " + enginefs.baseUrlLocal), 
            hwAccelProfiler(server.address().port);
        })), https.setOptions({
            appPath: appPath,
            apiEndpoint: apiCertifficateEndpoint
        });
        var sserver = https.createServer(app);
        if (sserver.listen(12470), sserver.on("listening", (function() {
            console.log("EngineFS HTTPS endpoint at https://local.strem.io:12470");
        })), sserver.on("error", (function(err) {
            console.warn(err);
        })), argv.open || process.env.OPEN) {
            var open = __webpack_require__(1033);
            server.on("listening", (function() {
                open(enginefs.baseUrlLocal);
            }));
        }
        enginefs.STREAM_TIMEOUT = 2e4, enginefs.ENGINE_TIMEOUT = 12e4, enginefs.on("engine-created", (function(hash) {
            console.log("Engine created for " + hash), cache.clearCache(enginefs.getCachePath(""), settings.cacheSize, 0);
        })), enginefs.on("engine-destroyed", (function(hash) {
            console.log("Engine " + hash + " destroyed");
        })), enginefs.on("engine-idle", (function(hash) {
            console.log("Engine " + hash + " is idle, pausing swarm"), enginefs.settings(hash, {
                swarm: "PAUSE"
            });
        })), enginefs.on("engine-inactive", (function(hash) {
            console.log("Engine " + hash + " is inactive, destroying it"), enginefs.remove(hash);
        })), enginefs.on("engine-error", (function(hash, err) {
            console.error("Engine error for " + hash), console.error(err);
        })), enginefs.on("engine-invalid-piece", (function(hash, p) {
            console.error("Engine invalid piece " + p + " for " + hash);
        })), enginefs.getCachePath = function(ih) {
            var err, cacheDir = path.join(settings.cacheRoot, "stremio-cache");
            try {
                mkdirp.sync(cacheDir);
            } catch (e) {
                err = e;
            }
            return err && mkdirp.sync(cacheDir = os.tmpdir()), path.join(cacheDir, ih);
        }, enginefs.getDefaults = function(ih) {
            var MAX_CONNECTIONS = isPositiveInteger(settings.btMaxConnections) ? settings.btMaxConnections : 35, HANDSHAKE_TIMEOUT = isPositiveInteger(settings.btHandshakeTimeout) ? settings.btHandshakeTimeout : 2e4, REQUEST_TIMEOUT = isPositiveInteger(settings.btRequestTimeout) ? settings.btRequestTimeout : 4e3, DOWNLOAD_SPEED_LIMIT = isPositiveInteger(settings.btDownloadSpeedSoftLimit) ? settings.btDownloadSpeedSoftLimit : 1677721.6, DOWNLOAD_SPEED_HARD_LIMIT = isPositiveInteger(settings.btDownloadSpeedHardLimit) ? settings.btDownloadSpeedHardLimit : 2621440, MIN_PEERS_FOR_STABLE = isPositiveInteger(settings.btMinPeersForStable) ? settings.btMinPeersForStable : 5, defaults = {
                peerSearch: {
                    min: 40,
                    max: 150,
                    sources: defaultTrackers.concat([ `dht:${ih}` ])
                },
                dht: !1,
                tracker: !1,
                connections: MAX_CONNECTIONS,
                handshakeTimeout: HANDSHAKE_TIMEOUT,
                timeout: REQUEST_TIMEOUT,
                virtual: !0,
                swarmCap: {
                    minPeers: MIN_PEERS_FOR_STABLE,
                    maxSpeed: DOWNLOAD_SPEED_LIMIT
                },
                growler: {
                    flood: 0,
                    pulse: DOWNLOAD_SPEED_HARD_LIMIT
                }
            };
            return (argv.noCache || 0 == settings.cacheSize) && (defaults.buffer = 15728640, 
            defaults.circularBuffer = {
                type: "memory",
                size: 47185920
            }, defaults.swarmCap = {
                minPeers: MIN_PEERS_FOR_STABLE,
                maxBuffer: .75
            }), defaults;
        };
        const rarHttp = __webpack_require__(1034);
        enginefs.router.use("/rar", rarHttp.router());
        const zipHttp = __webpack_require__(1146);
        enginefs.router.use("/zip", zipHttp.router()), module.exports = enginefs;
    }).call(this, "/");
}
