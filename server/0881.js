function(module, exports, __webpack_require__) {
    const querystring = __webpack_require__(28), sax = __webpack_require__(175), miniget = __webpack_require__(146), utils = __webpack_require__(95), {setTimeout: setTimeout} = __webpack_require__(117), formatUtils = __webpack_require__(435), urlUtils = __webpack_require__(436), extras = __webpack_require__(883), sig = __webpack_require__(438), Cache = __webpack_require__(439), BASE_URL = "https://www.youtube.com/watch?v=";
    exports.cache = new Cache, exports.cookieCache = new Cache(864e5), exports.watchPageCache = new Cache;
    let cver = "2.20210622.10.00";
    class UnrecoverableError extends Error {}
    const AGE_RESTRICTED_URLS = [ "support.google.com/youtube/?p=age_restrictions", "youtube.com/t/community_guidelines" ];
    exports.getBasicInfo = async (id, options) => {
        const retryOptions = Object.assign({}, miniget.defaultOptions, options.requestOptions);
        options.requestOptions = Object.assign({}, options.requestOptions, {}), options.requestOptions.headers = Object.assign({}, {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36"
        }, options.requestOptions.headers);
        let info = await pipeline([ id, options ], (info => {
            let playErr = utils.playError(info.player_response, [ "ERROR" ], UnrecoverableError), privateErr = privateVideoError(info.player_response);
            if (playErr || privateErr) throw playErr || privateErr;
            return info && info.player_response && (info.player_response.streamingData || isRental(info.player_response) || isNotYetBroadcasted(info.player_response));
        }), retryOptions, [ getWatchHTMLPage, getWatchJSONPage, getVideoInfoPage ]);
        Object.assign(info, {
            formats: parseFormats(info.player_response),
            related_videos: extras.getRelatedVideos(info)
        });
        const media = extras.getMedia(info), additional = {
            author: extras.getAuthor(info),
            media: media,
            likes: extras.getLikes(info),
            dislikes: extras.getDislikes(info),
            age_restricted: !!(media && media.notice_url && AGE_RESTRICTED_URLS.some((url => media.notice_url.includes(url)))),
            video_url: BASE_URL + id,
            storyboards: extras.getStoryboards(info),
            chapters: extras.getChapters(info)
        };
        return info.videoDetails = extras.cleanVideoDetails(Object.assign({}, info.player_response && info.player_response.microformat && info.player_response.microformat.playerMicroformatRenderer, info.player_response && info.player_response.videoDetails, additional), info), 
        info;
    };
    const privateVideoError = player_response => {
        let playability = player_response && player_response.playabilityStatus;
        return playability && "LOGIN_REQUIRED" === playability.status && playability.messages && playability.messages.filter((m => /This is a private video/.test(m))).length ? new UnrecoverableError(playability.reason || playability.messages && playability.messages[0]) : null;
    }, isRental = player_response => {
        let playability = player_response.playabilityStatus;
        return playability && "UNPLAYABLE" === playability.status && playability.errorScreen && playability.errorScreen.playerLegacyDesktopYpcOfferRenderer;
    }, isNotYetBroadcasted = player_response => {
        let playability = player_response.playabilityStatus;
        return playability && "LIVE_STREAM_OFFLINE" === playability.status;
    }, getWatchHTMLURL = (id, options) => `${BASE_URL + id}&hl=${options.lang || "en"}`, getWatchHTMLPageBody = (id, options) => {
        const url = getWatchHTMLURL(id, options);
        return exports.watchPageCache.getOrSet(url, (() => utils.exposedMiniget(url, options).text()));
    }, getHTML5player = body => {
        let html5playerRes = /<script\s+src="([^"]+)"(?:\s+type="text\/javascript")?\s+name="player_ias\/base"\s*>|"jsUrl":"([^"]+)"/.exec(body);
        return html5playerRes ? html5playerRes[1] || html5playerRes[2] : null;
    }, pipeline = async (args, validate, retryOptions, endpoints) => {
        let info;
        for (let func of endpoints) try {
            const newInfo = await retryFunc(func, args.concat([ info ]), retryOptions);
            if (newInfo.player_response && (newInfo.player_response.videoDetails = assign(info && info.player_response && info.player_response.videoDetails, newInfo.player_response.videoDetails), 
            newInfo.player_response = assign(info && info.player_response, newInfo.player_response)), 
            info = assign(info, newInfo), validate(info, !1)) break;
        } catch (err) {
            if (err instanceof UnrecoverableError || func === endpoints[endpoints.length - 1]) throw err;
        }
        return info;
    }, assign = (target, source) => {
        if (!target || !source) return target || source;
        for (let [key, value] of Object.entries(source)) null != value && (target[key] = value);
        return target;
    }, retryFunc = async (func, args, options) => {
        let result, currentTry = 0;
        for (;currentTry <= options.maxRetries; ) try {
            result = await func(...args);
            break;
        } catch (err) {
            if (err instanceof UnrecoverableError || err instanceof miniget.MinigetError && err.statusCode < 500 || currentTry >= options.maxRetries) throw err;
            let wait = Math.min(++currentTry * options.backoff.inc, options.backoff.max);
            await new Promise((resolve => setTimeout(resolve, wait)));
        }
        return result;
    }, jsonClosingChars = /^[)\]}'\s]+/, parseJSON = (source, varName, json) => {
        if (!json || "object" == typeof json) return json;
        try {
            return json = json.replace(jsonClosingChars, ""), JSON.parse(json);
        } catch (err) {
            throw Error(`Error parsing ${varName} in ${source}: ${err.message}`);
        }
    }, findJSON = (source, varName, body, left, right, prependJSON) => {
        let jsonStr = utils.between(body, left, right);
        if (!jsonStr) throw Error(`Could not find ${varName} in ${source}`);
        return parseJSON(source, varName, utils.cutAfterJSON(`${prependJSON}${jsonStr}`));
    }, findPlayerResponse = (source, info) => {
        const player_response = info && (info.args && info.args.player_response || info.player_response || info.playerResponse || info.embedded_player_response);
        return parseJSON(source, "player_response", player_response);
    }, getWatchJSONPage = async (id, options) => {
        const reqOptions = Object.assign({
            headers: {}
        }, options.requestOptions);
        let cookie = reqOptions.headers.Cookie || reqOptions.headers.cookie;
        reqOptions.headers = Object.assign({
            "x-youtube-client-name": "1",
            "x-youtube-client-version": cver,
            "x-youtube-identity-token": exports.cookieCache.get(cookie || "browser") || ""
        }, reqOptions.headers);
        const setIdentityToken = async (key, throwIfNotFound) => {
            reqOptions.headers["x-youtube-identity-token"] || (reqOptions.headers["x-youtube-identity-token"] = await ((id, options, key, throwIfNotFound) => exports.cookieCache.getOrSet(key, (async () => {
                let match = (await getWatchHTMLPageBody(id, options)).match(/(["'])ID_TOKEN\1[:,]\s?"([^"]+)"/);
                if (!match && throwIfNotFound) throw new UnrecoverableError("Cookie header used in request, but unable to find YouTube identity token");
                return match && match[2];
            })))(id, options, key, throwIfNotFound));
        };
        cookie && await setIdentityToken(cookie, !0);
        const jsonUrl = ((id, options) => `${getWatchHTMLURL(id, options)}&pbj=1`)(id, options), body = await utils.exposedMiniget(jsonUrl, options, reqOptions).text();
        let parsedBody = parseJSON("watch.json", "body", body);
        if ("now" === parsedBody.reload && await setIdentityToken("browser", !1), "now" === parsedBody.reload || !Array.isArray(parsedBody)) throw Error("Unable to retrieve video metadata in watch.json");
        let info = parsedBody.reduce(((part, curr) => Object.assign(curr, part)), {});
        return info.player_response = findPlayerResponse("watch.json", info), info.html5player = info.player && info.player.assets && info.player.assets.js, 
        info;
    }, getWatchHTMLPage = async (id, options) => {
        let body = await getWatchHTMLPageBody(id, options), info = {
            page: "watch"
        };
        try {
            cver = utils.between(body, '{"key":"cver","value":"', '"}'), info.player_response = findJSON("watch.html", "player_response", body, /\bytInitialPlayerResponse\s*=\s*\{/i, "<\/script>", "{");
        } catch (err) {
            let args = findJSON("watch.html", "player_response", body, /\bytplayer\.config\s*=\s*{/, "<\/script>", "{");
            info.player_response = findPlayerResponse("watch.html", args);
        }
        return info.response = findJSON("watch.html", "response", body, /\bytInitialData("\])?\s*=\s*\{/i, "<\/script>", "{"), 
        info.html5player = getHTML5player(body), info;
    }, getVideoInfoPage = async (id, options) => {
        const url = new URL("https://www.youtube.com/get_video_info");
        url.searchParams.set("video_id", id), url.searchParams.set("c", "TVHTML5"), url.searchParams.set("cver", `7${cver.substr(1)}`), 
        url.searchParams.set("eurl", "https://youtube.googleapis.com/v/" + id), url.searchParams.set("ps", "default"), 
        url.searchParams.set("gl", "US"), url.searchParams.set("hl", options.lang || "en"), 
        url.searchParams.set("html5", "1");
        const body = await utils.exposedMiniget(url.toString(), options).text();
        let info = querystring.parse(body);
        return info.player_response = findPlayerResponse("get_video_info", info), info;
    }, parseFormats = player_response => {
        let formats = [];
        return player_response && player_response.streamingData && (formats = formats.concat(player_response.streamingData.formats || []).concat(player_response.streamingData.adaptiveFormats || [])), 
        formats;
    };
    exports.getInfo = async (id, options) => {
        let info = await exports.getBasicInfo(id, options);
        const hasManifest = info.player_response && info.player_response.streamingData && (info.player_response.streamingData.dashManifestUrl || info.player_response.streamingData.hlsManifestUrl);
        let funcs = [];
        if (info.formats.length) {
            if (info.html5player = info.html5player || getHTML5player(await getWatchHTMLPageBody(id, options)) || getHTML5player(await ((id, options) => {
                const embedUrl = `${"https://www.youtube.com/embed/" + id}?hl=${options.lang || "en"}`;
                return utils.exposedMiniget(embedUrl, options).text();
            })(id, options)), !info.html5player) throw Error("Unable to find html5player file");
            const html5player = new URL(info.html5player, BASE_URL).toString();
            funcs.push(sig.decipherFormats(info.formats, html5player, options));
        }
        if (hasManifest && info.player_response.streamingData.dashManifestUrl) {
            let url = info.player_response.streamingData.dashManifestUrl;
            funcs.push(getDashManifest(url, options));
        }
        if (hasManifest && info.player_response.streamingData.hlsManifestUrl) {
            let url = info.player_response.streamingData.hlsManifestUrl;
            funcs.push(getM3U8(url, options));
        }
        let results = await Promise.all(funcs);
        return info.formats = Object.values(Object.assign({}, ...results)), info.formats = info.formats.map(formatUtils.addFormatMeta), 
        info.formats.sort(formatUtils.sortFormats), info.full = !0, info;
    };
    const getDashManifest = (url, options) => new Promise(((resolve, reject) => {
        let formats = {};
        const parser = sax.parser(!1);
        let adaptationSet;
        parser.onerror = reject, parser.onopentag = node => {
            if ("ADAPTATIONSET" === node.name) adaptationSet = node.attributes; else if ("REPRESENTATION" === node.name) {
                const itag = parseInt(node.attributes.ID);
                isNaN(itag) || (formats[url] = Object.assign({
                    itag: itag,
                    url: url,
                    bitrate: parseInt(node.attributes.BANDWIDTH),
                    mimeType: `${adaptationSet.MIMETYPE}; codecs="${node.attributes.CODECS}"`
                }, node.attributes.HEIGHT ? {
                    width: parseInt(node.attributes.WIDTH),
                    height: parseInt(node.attributes.HEIGHT),
                    fps: parseInt(node.attributes.FRAMERATE)
                } : {
                    audioSampleRate: node.attributes.AUDIOSAMPLINGRATE
                }));
            }
        }, parser.onend = () => {
            resolve(formats);
        };
        const req = utils.exposedMiniget(new URL(url, BASE_URL).toString(), options);
        req.setEncoding("utf8"), req.on("error", reject), req.on("data", (chunk => {
            parser.write(chunk);
        })), req.on("end", parser.close.bind(parser));
    })), getM3U8 = async (url, options) => {
        url = new URL(url, BASE_URL);
        const body = await utils.exposedMiniget(url.toString(), options).text();
        let formats = {};
        return body.split("\n").filter((line => /^https?:\/\//.test(line))).forEach((line => {
            const itag = parseInt(line.match(/\/itag\/(\d+)\//)[1]);
            formats[line] = {
                itag: itag,
                url: line
            };
        })), formats;
    };
    for (let funcName of [ "getBasicInfo", "getInfo" ]) {
        const func = exports[funcName];
        exports[funcName] = async (link, options = {}) => {
            utils.checkForUpdates();
            let id = await urlUtils.getVideoID(link);
            const key = [ funcName, id, options.lang ].join("-");
            return exports.cache.getOrSet(key, (() => func(id, options)));
        };
    }
    exports.validateID = urlUtils.validateID, exports.validateURL = urlUtils.validateURL, 
    exports.getURLVideoID = urlUtils.getURLVideoID, exports.getVideoID = urlUtils.getVideoID;
}
