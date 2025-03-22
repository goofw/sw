function(module, exports, __webpack_require__) {
    "use strict";
    var url = __webpack_require__(7), EventEmitter = __webpack_require__(5), parseXML = __webpack_require__(219).promisify(__webpack_require__(172).parseString), fetch = __webpack_require__(33), SSDP = __webpack_require__(936).Client;
    function SSDPDiscovery() {
        EventEmitter.call(this), this.SSDPServices = {
            "urn:dial-multiscreen-org:device:dial:1": "chromecast",
            "urn:schemas-upnp-org:device:MediaRenderer:1": "tv"
        }, this.ssdp = new SSDP, this.ssdp.on("response", this.handleResponse.bind(this)), 
        this.ssdp.on("error", (function(err) {
            console.log("SSDP error:", err);
        }));
    }
    __webpack_require__(0).inherits(SSDPDiscovery, EventEmitter), SSDPDiscovery.prototype.search = function() {
        for (var service in this.SSDPServices) this.ssdp.browse(service);
    }, SSDPDiscovery.prototype.normalizeObject = function(location, ssdpData) {
        try {
            if (!this.SSDPServices[ssdpData.root.device[0].deviceType[0]]) return;
            var device = {
                facility: "SSDP",
                id: ssdpData.root.device[0].UDN[0].slice(5),
                name: ssdpData.root.device[0].friendlyName[0],
                host: url.parse(location).hostname,
                location: location,
                type: this.SSDPServices[ssdpData.root.device[0].deviceType[0]],
                icon: this.SSDPServices[ssdpData.root.device[0].deviceType[0]],
                playerUIRoles: [ "playpause", "seek", "dub", "subtitles", "volume" ],
                usePlayerUI: !0,
                onlyHtml5Formats: !1
            };
            this.emit("device", device);
        } catch (e) {
            console.log("SSDP Parse error", e.toString(), ssdpData.root.device);
        }
    }, SSDPDiscovery.prototype.handleResponse = function(response) {
        var location = response.headers.LOCATION;
        location && fetch(location).then((function(res) {
            return res.text();
        })).then(parseXML).then(this.normalizeObject.bind(this, location)).catch((function(err) {
            console.log("SSDP Location error:", err);
        }));
    }, module.exports = SSDPDiscovery;
}
