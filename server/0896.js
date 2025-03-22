function(module, exports, __webpack_require__) {
    "use strict";
    var EventEmitter = __webpack_require__(5), txt = __webpack_require__(897)(), MDNS = __webpack_require__(899);
    function MDNSDiscovery() {
        EventEmitter.call(this), this.MDNSServices = {
            "_googlecast._tcp.local": "chromecast"
        }, this.mdns = MDNS({
            loopback: !0,
            reuseAddr: !0
        }), this.mdns.on("response", this.onResponse.bind(this)), this.mdns.on("error", (function(e) {
            console.log("MDNS error", e);
        }));
    }
    __webpack_require__(0).inherits(MDNSDiscovery, EventEmitter), MDNSDiscovery.prototype.search = function() {
        for (var service in this.MDNSServices) this.mdns.query(service, "PTR");
    }, MDNSDiscovery.prototype.propMap = function(res, item) {
        return res[item.type] = item.data, res;
    }, MDNSDiscovery.prototype.onResponse = function(response) {
        if (0 !== response.answers.length && void 0 !== this.MDNSServices[response.answers[0].name]) {
            var records = response.additionals.reduce(this.propMap, {});
            if (response.answers.reduce(this.propMap, records), records.TXT && records.SRV) {
                var device = {
                    facility: "MDNS",
                    id: records.SRV.target.slice(0, records.SRV.target.indexOf(".local") >>> 0),
                    name: txt.decode(records.TXT).fn || records.PTR.replace("." + response.answers[0].name, ""),
                    host: records.A,
                    location: records.A,
                    type: this.MDNSServices[response.answers[0].name],
                    icon: "chromecast",
                    playerUIRoles: [ "playpause", "seek", "dub", "subtitles", "volume" ],
                    usePlayerUI: !0,
                    onlyHtml5Formats: !1
                };
                this.emit("device", device);
            }
        }
    }, module.exports = MDNSDiscovery;
}
