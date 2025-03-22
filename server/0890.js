function(module, exports, __webpack_require__) {
    "use strict";
    function Discovery(Facilities) {
        if (!Array.isArray(Facilities)) throw new TypeError("Invalid facilities");
        for (var i in this.facilities = [], this.devices = {}, Facilities) {
            var facility = new (0, Facilities[i]);
            facility.on("device", this.collect.bind(this)), facility.search(), this.facilities.push(facility);
        }
    }
    Discovery.prototype.collect = function(device) {
        this.devices[device.id] || (console.log('Discovery of new %s device "%s" - %s', device.type, device.id, device.name), 
        this.devices[device.id] = device);
    }, module.exports = Discovery;
}
