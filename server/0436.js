function(module, exports) {
    const validQueryDomains = new Set([ "youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "gaming.youtube.com" ]), validPathDomains = /^https?:\/\/(youtu\.be\/|(www\.)?youtube.com\/(embed|v|shorts)\/)/;
    exports.getURLVideoID = link => {
        const parsed = new URL(link);
        let id = parsed.searchParams.get("v");
        if (validPathDomains.test(link) && !id) {
            const paths = parsed.pathname.split("/");
            id = paths[paths.length - 1];
        } else if (parsed.hostname && !validQueryDomains.has(parsed.hostname)) throw Error("Not a YouTube domain");
        if (!id) throw Error(`No video id found: ${link}`);
        if (id = id.substring(0, 11), !exports.validateID(id)) throw TypeError(`Video id (${id}) does not match expected format (${idRegex.toString()})`);
        return id;
    };
    const urlRegex = /^https?:\/\//;
    exports.getVideoID = str => {
        if (exports.validateID(str)) return str;
        if (urlRegex.test(str)) return exports.getURLVideoID(str);
        throw Error(`No video id found: ${str}`);
    };
    const idRegex = /^[a-zA-Z0-9-_]{11}$/;
    exports.validateID = id => idRegex.test(id), exports.validateURL = string => {
        try {
            return exports.getURLVideoID(string), !0;
        } catch (e) {
            return !1;
        }
    };
}
