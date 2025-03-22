function(module, exports, __webpack_require__) {
    "use strict";
    var url = __webpack_require__(7), tunnel = __webpack_require__(1142), defaultProxyHeaderWhiteList = [ "accept", "accept-charset", "accept-encoding", "accept-language", "accept-ranges", "cache-control", "content-encoding", "content-language", "content-location", "content-md5", "content-range", "content-type", "connection", "date", "expect", "max-forwards", "pragma", "referer", "te", "user-agent", "via" ], defaultProxyHeaderExclusiveList = [ "proxy-authorization" ];
    function Tunnel(request) {
        this.request = request, this.proxyHeaderWhiteList = defaultProxyHeaderWhiteList, 
        this.proxyHeaderExclusiveList = [], void 0 !== request.tunnel && (this.tunnelOverride = request.tunnel);
    }
    Tunnel.prototype.isEnabled = function() {
        var request = this.request;
        return void 0 !== this.tunnelOverride ? this.tunnelOverride : "https:" === request.uri.protocol;
    }, Tunnel.prototype.setup = function(options) {
        var request = this.request;
        if (options = options || {}, "string" == typeof request.proxy && (request.proxy = url.parse(request.proxy)), 
        !request.proxy || !request.tunnel) return !1;
        options.proxyHeaderWhiteList && (this.proxyHeaderWhiteList = options.proxyHeaderWhiteList), 
        options.proxyHeaderExclusiveList && (this.proxyHeaderExclusiveList = options.proxyHeaderExclusiveList);
        var uriObject, port, protocol, proxyHeaderExclusiveList = this.proxyHeaderExclusiveList.concat(defaultProxyHeaderExclusiveList), proxyHeaderWhiteList = this.proxyHeaderWhiteList.concat(proxyHeaderExclusiveList), proxyHeaders = (function(headers, proxyHeaderWhiteList) {
            var whiteList = proxyHeaderWhiteList.reduce((function(set, header) {
                return set[header.toLowerCase()] = !0, set;
            }), {});
            return Object.keys(headers).filter((function(header) {
                return whiteList[header.toLowerCase()];
            })).reduce((function(set, header) {
                return set[header] = headers[header], set;
            }), {});
        })(request.headers, proxyHeaderWhiteList);
        proxyHeaders.host = (port = (uriObject = request.uri).port, protocol = uriObject.protocol, 
        uriObject.hostname + ":" + (port || ("https:" === protocol ? "443" : "80"))), proxyHeaderExclusiveList.forEach(request.removeHeader, request);
        var tunnelFn = (function(request) {
            var uri, proxy, tunnelFnName = (uri = request.uri, proxy = request.proxy, [ "https:" === uri.protocol ? "https" : "http", "https:" === proxy.protocol ? "Https" : "Http" ].join("Over"));
            return tunnel[tunnelFnName];
        })(request), tunnelOptions = (function(request, proxyHeaders) {
            var proxy = request.proxy;
            return {
                proxy: {
                    host: proxy.hostname,
                    port: +proxy.port,
                    proxyAuth: proxy.auth,
                    headers: proxyHeaders
                },
                headers: request.headers,
                ca: request.ca,
                cert: request.cert,
                key: request.key,
                passphrase: request.passphrase,
                pfx: request.pfx,
                ciphers: request.ciphers,
                rejectUnauthorized: request.rejectUnauthorized,
                secureOptions: request.secureOptions,
                secureProtocol: request.secureProtocol
            };
        })(request, proxyHeaders);
        return request.agent = tunnelFn(tunnelOptions), !0;
    }, Tunnel.defaultProxyHeaderWhiteList = defaultProxyHeaderWhiteList, Tunnel.defaultProxyHeaderExclusiveList = defaultProxyHeaderExclusiveList, 
    exports.Tunnel = Tunnel;
}
