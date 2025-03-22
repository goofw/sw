function(module, exports, __webpack_require__) {
    "use strict";
    var myIp = __webpack_require__(444), url = __webpack_require__(7), querystring = __webpack_require__(28);
    function Player() {
        this.mediaStatus = {
            audio: [],
            audioTrack: null,
            volume: 100,
            time: 0,
            paused: !1,
            state: 5,
            length: 0,
            source: null,
            subtitlesSrc: null,
            subtitlesDelay: 0,
            subtitlesSize: 2
        }, this.states = {
            NothingSpecial: 0,
            Opening: 1,
            Buffering: 2,
            Playing: 3,
            Paused: 4,
            Stopped: 5,
            Ended: 6,
            Error: 7
        };
    }
    Player._shallowCopyParams = function(params, source, param) {
        void 0 !== source[param] && (params[param] = source[param]);
    }, Player.handleError = function(result) {
        return console.log("Handle Cast Error", result.message ? result.message : result), 
        result.message;
    }, Player.returnJSON = function(res, obj) {
        res.setHeader("Content-Type", "application/json; charset=utf8"), res.end(JSON.stringify(obj || {}));
    }, Player.prototype.setEndpoint = function(req, path) {
        var protocol = "http", port = ":" + req.socket.localPort;
        req.socket.encrypted ? (protocol += "s", 443 == req.socket.localPort && (port = "")) : 80 == req.socket.localPort && (port = ""), 
        this.endpoint = protocol + "://" + myIp.addressFor(this.device.host) + port, void 0 !== path && (this.endpoint += req.baseUrl + path);
    }, Player.prototype.__call = function(method, args) {
        return args = args.slice(0, 3), this[method].apply(this, args);
    }, Player.prototype.methodInvoke = function(method, args, res) {
        return this.init().then(this.__call.bind(this, method, args)).catch(Player.handleError).then(Player.returnJSON.bind(null, res));
    }, Player.prototype.middleware = function(req, res, next) {
        var segments = url.parse(req.url), query = querystring.parse((segments.search || "").slice(1)), params = {};
        Object.keys(query).forEach(Player._shallowCopyParams.bind(null, params, query)), 
        Object.keys(req.body).forEach(Player._shallowCopyParams.bind(null, params, req.body)), 
        Object.keys(params).forEach(Player._shallowCopyParams.bind(null, this.mediaStatus, params));
        var method = "status", args = {};
        function isset(v) {
            return void 0 !== v;
        }
        if (isset(params.formats) && (method = "protocolsGet"), isset(params.audioTrack) && (args[method = "audioTrack"] = params.audioTrack), 
        isset(params.volume) && (args[method = "volume"] = params.volume), isset(params.time) && (args[method = "seek"] = params.time), 
        (isset(params.subtitlesSrc) || isset(params.subtitlesDelay) || isset(params.subtitlesSize)) && (args[method = "subtitles"] = [ this.mediaStatus.subtitlesSrc, this.mediaStatus.subtitlesDelay, {
            fontSize: parseInt(this.mediaStatus.subtitlesSize, 10) + 1 + "vw"
        } ]), isset(params.source) && (params.source ? args[method = "play"] = params.source : method = "close"), 
        isset(params.stop) && (method = "stop"), isset(params.paused)) switch (params.paused) {
          case "":
          case "0":
          case "false":
          case 0:
          case !1:
            method = "resume";
            break;

          default:
            method = "pause";
        }
        method ? this.methodInvoke(method, [].concat(args[method]), res) : next("Unknown Method");
    }, module.exports = Player;
}
