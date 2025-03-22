function(module, exports, __webpack_require__) {
    const miniget = __webpack_require__(146);
    exports.between = (haystack, left, right) => {
        let pos;
        if (left instanceof RegExp) {
            const match = haystack.match(left);
            if (!match) return "";
            pos = match.index + match[0].length;
        } else {
            if (pos = haystack.indexOf(left), -1 === pos) return "";
            pos += left.length;
        }
        return pos = (haystack = haystack.slice(pos)).indexOf(right), -1 === pos ? "" : haystack = haystack.slice(0, pos);
    }, exports.parseAbbreviatedNumber = string => {
        const match = string.replace(",", ".").replace(" ", "").match(/([\d,.]+)([MK]?)/);
        if (match) {
            let [, num, multi] = match;
            return num = parseFloat(num), Math.round("M" === multi ? 1e6 * num : "K" === multi ? 1e3 * num : num);
        }
        return null;
    }, exports.cutAfterJSON = mixedJson => {
        let open, close;
        if ("[" === mixedJson[0] ? (open = "[", close = "]") : "{" === mixedJson[0] && (open = "{", 
        close = "}"), !open) throw new Error(`Can't cut unsupported JSON (need to begin with [ or { ) but got: ${mixedJson[0]}`);
        let i, isString = !1, isEscaped = !1, counter = 0;
        for (i = 0; i < mixedJson.length; i++) if ('"' !== mixedJson[i] || isEscaped) {
            if (isEscaped = "\\" === mixedJson[i] && !isEscaped, !isString && (mixedJson[i] === open ? counter++ : mixedJson[i] === close && counter--, 
            0 === counter)) return mixedJson.substr(0, i + 1);
        } else isString = !isString;
        throw Error("Can't cut unsupported JSON (no matching closing bracket found)");
    }, exports.playError = (player_response, statuses, ErrorType = Error) => {
        let playability = player_response && player_response.playabilityStatus;
        return playability && statuses.includes(playability.status) ? new ErrorType(playability.reason || playability.messages && playability.messages[0]) : null;
    }, exports.exposedMiniget = (url, options = {}, requestOptionsOverwrite) => {
        const req = miniget(url, requestOptionsOverwrite || options.requestOptions);
        return "function" == typeof options.requestCallback && options.requestCallback(req), 
        req;
    }, exports.deprecate = (obj, prop, value, oldPath, newPath) => {
        Object.defineProperty(obj, prop, {
            get: () => (console.warn(`\`${oldPath}\` will be removed in a near future release, use \`${newPath}\` instead.`), 
            value)
        });
    };
    const pkg = __webpack_require__(434);
    exports.lastUpdateCheck = 0, exports.checkForUpdates = () => !process.env.YTDL_NO_UPDATE && !pkg.version.startsWith("0.0.0-") && Date.now() - exports.lastUpdateCheck >= 432e5 ? (exports.lastUpdateCheck = Date.now(), 
    miniget("https://api.github.com/repos/fent/node-ytdl-core/releases/latest", {
        headers: {
            "User-Agent": "ytdl-core"
        }
    }).text().then((response => {
        JSON.parse(response).tag_name !== `v${pkg.version}` && console.warn('[33mWARNING:[0m ytdl-core is out of date! Update with "npm install ytdl-core@latest".');
    }), (err => {
        console.warn("Error checking for updates:", err.message), console.warn("You can disable this check by setting the `YTDL_NO_UPDATE` env variable.");
    }))) : null;
}
