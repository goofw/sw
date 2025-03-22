function(module, exports) {
    var PROPS = [ "volume", "time", "paused", "state", "length", "source", "mediaSessionId", "subtitlesSrc", "subtitlesDelay", "subtitlesSize" ];
    module.exports = function(player, manifest) {
        return function(req, res, next) {
            if (!req.body) return res.end(400);
            var modifications = req.body || {};
            Object.keys(modifications).forEach((function(k) {
                "source" === k && (modifications.source ? player.play(modifications.source) : player.stop()), 
                modifications[k] !== player[k] && (player[k] = modifications[k]);
            })), (function(next) {
                player.update ? player.update(next) : next();
            })((function() {
                var status = {};
                PROPS.forEach((function(k) {
                    status[k] = player[k];
                })), res.setHeader("content-type", "application/json"), res.end(JSON.stringify(status));
            }));
        };
    };
}
