function(module, exports, __webpack_require__) {
    "use strict";
    function formatHostname(hostname) {
        return hostname.replace(/^\.*/, ".").toLowerCase();
    }
    function parseNoProxyZone(zone) {
        var zoneParts = (zone = zone.trim().toLowerCase()).split(":", 2);
        return {
            hostname: formatHostname(zoneParts[0]),
            port: zoneParts[1],
            hasPort: zone.indexOf(":") > -1
        };
    }
    module.exports = function(uri) {
        var noProxy = process.env.NO_PROXY || process.env.no_proxy || "";
        return "*" === noProxy || "" !== noProxy && (function(uri, noProxy) {
            var port = uri.port || ("https:" === uri.protocol ? "443" : "80"), hostname = formatHostname(uri.hostname);
            return noProxy.split(",").map(parseNoProxyZone).some((function(noProxyZone) {
                var isMatchedAt = hostname.indexOf(noProxyZone.hostname), hostnameMatched = isMatchedAt > -1 && isMatchedAt === hostname.length - noProxyZone.hostname.length;
                return noProxyZone.hasPort ? port === noProxyZone.port && hostnameMatched : hostnameMatched;
            }));
        })(uri, noProxy) ? null : "http:" === uri.protocol ? process.env.HTTP_PROXY || process.env.http_proxy || null : "https:" === uri.protocol && (process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy) || null;
    };
}
