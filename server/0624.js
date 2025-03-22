function(module, exports, __webpack_require__) {
    var hat = __webpack_require__(91), peerIds = [ "qB4600", "DE2110", "AZ5770", "TR4040" ];
    module.exports = function() {
        for (var peerId = peerIds[Math.floor(Math.random() * peerIds.length)], newPeerId = "", i = 0; i < peerId.length; i++) if (isNaN(peerId[i])) newPeerId += peerId[i]; else {
            var nr = parseInt(peerId[i]);
            if (0 === nr) newPeerId += peerId[i]; else {
                var min = Math.floor(nr / 2);
                newPeerId += Math.floor(Math.random() * (nr - min + 1) + min);
            }
        }
        return `-${newPeerId}-${hat(48)}`;
    };
}
