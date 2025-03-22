function(module, exports) {
    module.exports = function() {
        if ("undefined" == typeof window) return null;
        var wrtc = {
            RTCPeerConnection: window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection,
            RTCSessionDescription: window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription,
            RTCIceCandidate: window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate
        };
        return wrtc.RTCPeerConnection ? wrtc : null;
    };
}
