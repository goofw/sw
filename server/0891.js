function(module, exports, __webpack_require__) {
    "use strict";
    var EventEmitter = __webpack_require__(5), util = __webpack_require__(0), externalPlayers = __webpack_require__(892);
    function ExternalDiscovery() {
        EventEmitter.call(this);
        var self = this;
        this.devices = {
            groups: {},
            update: function() {
                self.devices.groups.external.forEach(self.emit.bind(self, "device"));
            }
        };
    }
    util.inherits(ExternalDiscovery, EventEmitter), ExternalDiscovery.prototype.search = function() {
        externalPlayers(this.devices);
    }, module.exports = ExternalDiscovery;
}
