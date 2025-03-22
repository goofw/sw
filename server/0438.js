function(module, exports, __webpack_require__) {
    const querystring = __webpack_require__(28), Cache = __webpack_require__(439), utils = __webpack_require__(95);
    exports.cache = new Cache, exports.getTokens = (html5playerfile, options) => exports.cache.getOrSet(html5playerfile, (async () => {
        const body = await utils.exposedMiniget(html5playerfile, options).text(), tokens = exports.extractActions(body);
        if (!tokens || !tokens.length) throw Error("Could not extract signature deciphering actions");
        return exports.cache.set(html5playerfile, tokens), tokens;
    })), exports.decipher = (tokens, sig) => {
        sig = sig.split("");
        for (let i = 0, len = tokens.length; i < len; i++) {
            let pos, token = tokens[i];
            switch (token[0]) {
              case "r":
                sig = sig.reverse();
                break;

              case "w":
                pos = ~~token.slice(1), sig = swapHeadAndPosition(sig, pos);
                break;

              case "s":
                pos = ~~token.slice(1), sig = sig.slice(pos);
                break;

              case "p":
                pos = ~~token.slice(1), sig.splice(0, pos);
            }
        }
        return sig.join("");
    };
    const swapHeadAndPosition = (arr, position) => {
        const first = arr[0];
        return arr[0] = arr[position % arr.length], arr[position] = first, arr;
    }, jsVarStr = "[a-zA-Z_\\$][a-zA-Z_0-9]*", jsQuoteStr = "(?:'[^'\\\\]*(:?\\\\[\\s\\S][^'\\\\]*)*'|\"[^\"\\\\]*(:?\\\\[\\s\\S][^\"\\\\]*)*\")", jsKeyStr = `(?:${jsVarStr}|${jsQuoteStr})`, jsPropStr = `(?:\\.${jsVarStr}|\\[${jsQuoteStr}\\])`, reverseStr = ":function\\(a\\)\\{(?:return )?a\\.reverse\\(\\)\\}", sliceStr = ":function\\(a,b\\)\\{return a\\.slice\\(b\\)\\}", spliceStr = ":function\\(a,b\\)\\{a\\.splice\\(0,b\\)\\}", swapStr = ":function\\(a,b\\)\\{var c=a\\[0\\];a\\[0\\]=a\\[b(?:%a\\.length)?\\];a\\[b(?:%a\\.length)?\\]=c(?:;return a)?\\}", actionsObjRegexp = new RegExp(`var (${jsVarStr})=\\{((?:(?:${jsKeyStr}${reverseStr}|${jsKeyStr}${sliceStr}|${jsKeyStr}${spliceStr}|${jsKeyStr}${swapStr}),?\\r?\\n?)+)\\};`), actionsFuncRegexp = new RegExp(`function(?: ${jsVarStr})?\\(a\\)\\{a=a\\.split\\((?:''|"")\\);\\s*((?:(?:a=)?${jsVarStr}${jsPropStr}\\(a,\\d+\\);)+)return a\\.join\\((?:''|"")\\)\\}`), reverseRegexp = new RegExp(`(?:^|,)(${jsKeyStr})${reverseStr}`, "m"), sliceRegexp = new RegExp(`(?:^|,)(${jsKeyStr})${sliceStr}`, "m"), spliceRegexp = new RegExp(`(?:^|,)(${jsKeyStr})${spliceStr}`, "m"), swapRegexp = new RegExp(`(?:^|,)(${jsKeyStr})${swapStr}`, "m");
    exports.extractActions = body => {
        const objResult = actionsObjRegexp.exec(body), funcResult = actionsFuncRegexp.exec(body);
        if (!objResult || !funcResult) return null;
        const obj = objResult[1].replace(/\$/g, "\\$"), objBody = objResult[2].replace(/\$/g, "\\$"), funcBody = funcResult[1].replace(/\$/g, "\\$");
        let result = reverseRegexp.exec(objBody);
        const reverseKey = result && result[1].replace(/\$/g, "\\$").replace(/\$|^'|^"|'$|"$/g, "");
        result = sliceRegexp.exec(objBody);
        const sliceKey = result && result[1].replace(/\$/g, "\\$").replace(/\$|^'|^"|'$|"$/g, "");
        result = spliceRegexp.exec(objBody);
        const spliceKey = result && result[1].replace(/\$/g, "\\$").replace(/\$|^'|^"|'$|"$/g, "");
        result = swapRegexp.exec(objBody);
        const swapKey = result && result[1].replace(/\$/g, "\\$").replace(/\$|^'|^"|'$|"$/g, ""), keys = `(${[ reverseKey, sliceKey, spliceKey, swapKey ].join("|")})`, tokenizeRegexp = new RegExp(`(?:a=)?${obj}(?:\\.${keys}|\\['${keys}'\\]|\\["${keys}"\\])\\(a,(\\d+)\\)`, "g"), tokens = [];
        for (;null !== (result = tokenizeRegexp.exec(funcBody)); ) switch (result[1] || result[2] || result[3]) {
          case swapKey:
            tokens.push(`w${result[4]}`);
            break;

          case reverseKey:
            tokens.push("r");
            break;

          case sliceKey:
            tokens.push(`s${result[4]}`);
            break;

          case spliceKey:
            tokens.push(`p${result[4]}`);
        }
        return tokens;
    }, exports.setDownloadURL = (format, sig) => {
        let decodedUrl;
        if (!format.url) return;
        decodedUrl = format.url;
        try {
            decodedUrl = decodeURIComponent(decodedUrl);
        } catch (err) {
            return;
        }
        const parsedUrl = new URL(decodedUrl);
        parsedUrl.searchParams.set("ratebypass", "yes"), sig && parsedUrl.searchParams.set(format.sp || "signature", sig), 
        format.url = parsedUrl.toString();
    }, exports.decipherFormats = async (formats, html5player, options) => {
        let decipheredFormats = {}, tokens = await exports.getTokens(html5player, options);
        return formats.forEach((format => {
            let cipher = format.signatureCipher || format.cipher;
            cipher && (Object.assign(format, querystring.parse(cipher)), delete format.signatureCipher, 
            delete format.cipher);
            const sig = tokens && format.s ? exports.decipher(tokens, format.s) : null;
            exports.setDownloadURL(format, sig), decipheredFormats[format.url] = format;
        })), decipheredFormats;
    };
}
