function(module, exports, __webpack_require__) {
    module.exports = magnetURIDecode, module.exports.decode = magnetURIDecode, module.exports.encode = function(obj) {
        (obj = Object.assign({}, obj)).infoHashBuffer && (obj.xt = `urn:btih:${obj.infoHashBuffer.toString("hex")}`), 
        obj.infoHash && (obj.xt = `urn:btih:${obj.infoHash}`), obj.name && (obj.dn = obj.name), 
        obj.keywords && (obj.kt = obj.keywords), obj.announce && (obj.tr = obj.announce), 
        obj.urlList && (obj.ws = obj.urlList, delete obj.as);
        let result = "magnet:?";
        return Object.keys(obj).filter((key => 2 === key.length)).forEach(((key, i) => {
            (Array.isArray(obj[key]) ? obj[key] : [ obj[key] ]).forEach(((val, j) => {
                !(i > 0 || j > 0) || "kt" === key && 0 !== j || (result += "&"), "dn" === key && (val = encodeURIComponent(val).replace(/%20/g, "+")), 
                "tr" !== key && "xs" !== key && "as" !== key && "ws" !== key || (val = encodeURIComponent(val)), 
                "kt" === key && (val = encodeURIComponent(val)), result += "kt" === key && j > 0 ? `+${val}` : `${key}=${val}`;
            }));
        })), result;
    };
    const base32 = __webpack_require__(1008), uniq = __webpack_require__(114);
    function magnetURIDecode(uri) {
        const result = {}, data = uri.split("magnet:?")[1];
        let m;
        return (data && data.length >= 0 ? data.split("&") : []).forEach((param => {
            const keyval = param.split("=");
            if (2 !== keyval.length) return;
            const key = keyval[0];
            let val = keyval[1];
            if ("dn" === key && (val = decodeURIComponent(val).replace(/\+/g, " ")), "tr" !== key && "xs" !== key && "as" !== key && "ws" !== key || (val = decodeURIComponent(val)), 
            "kt" === key && (val = decodeURIComponent(val).split("+")), "ix" === key && (val = Number(val)), 
            result[key]) if (Array.isArray(result[key])) result[key].push(val); else {
                const old = result[key];
                result[key] = [ old, val ];
            } else result[key] = val;
        })), result.xt && (Array.isArray(result.xt) ? result.xt : [ result.xt ]).forEach((xt => {
            if (m = xt.match(/^urn:btih:(.{40})/)) result.infoHash = m[1].toLowerCase(); else if (m = xt.match(/^urn:btih:(.{32})/)) {
                const decodedStr = base32.decode(m[1]);
                result.infoHash = Buffer.from(decodedStr, "binary").toString("hex");
            }
        })), result.infoHash && (result.infoHashBuffer = Buffer.from(result.infoHash, "hex")), 
        result.dn && (result.name = result.dn), result.kt && (result.keywords = result.kt), 
        "string" == typeof result.tr ? result.announce = [ result.tr ] : Array.isArray(result.tr) ? result.announce = result.tr : result.announce = [], 
        result.urlList = [], ("string" == typeof result.as || Array.isArray(result.as)) && (result.urlList = result.urlList.concat(result.as)), 
        ("string" == typeof result.ws || Array.isArray(result.ws)) && (result.urlList = result.urlList.concat(result.ws)), 
        uniq(result.announce), uniq(result.urlList), result;
    }
}
