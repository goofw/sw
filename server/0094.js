function(module, exports, __webpack_require__) {
    var util = __webpack_require__(0), fs = __webpack_require__(2), path = __webpack_require__(4), pkg = __webpack_require__(378), isPositiveInteger = __webpack_require__(368), appPath = __webpack_require__(379);
    module.exports = (function(appPath, args) {
        var self = {
            get serverVersion() {
                return pkg.version;
            },
            set serverVersion(_) {}
        };
        util._extend(self, void 0);
        var p = path.join(appPath, "server-settings.json");
        return self.extend = function(opts) {
            util._extend(self, opts);
        }, self.save = function(cb) {
            fs.writeFile(p, JSON.stringify(self, null, 4), cb);
        }, self.load = function() {
            try {
                Object.assign(self, JSON.parse(fs.readFileSync(p).toString())), self.save((function() {}));
            } catch (e) {
                console.error("Cannot update settings", e.message);
            }
        }, self.appPath = appPath, self.cacheRoot = self.hasOwnProperty("cacheRoot") ? self.cacheRoot : appPath, 
        self.cacheSize = process.env.DISABLE_CACHING ? 0 : self.hasOwnProperty("cacheSize") ? self.cacheSize : "android" === process.platform ? 0 : 2147483648, 
        self.btMaxConnections = isPositiveInteger(self.btMaxConnections) ? self.btMaxConnections : 55, 
        self.btHandshakeTimeout = isPositiveInteger(self.btHandshakeTimeout) ? self.btHandshakeTimeout : 2e4, 
        self.btRequestTimeout = isPositiveInteger(self.btRequestTimeout || self.btConnectionTimeout) ? self.btRequestTimeout : 4e3, 
        self.btDownloadSpeedSoftLimit = isPositiveInteger(self.btDownloadSpeedSoftLimit) ? self.btDownloadSpeedSoftLimit : 2621440, 
        self.btDownloadSpeedHardLimit = isPositiveInteger(self.btDownloadSpeedHardLimit) ? self.btDownloadSpeedHardLimit : 3670016, 
        self.btMinPeersForStable = isPositiveInteger(self.btMinPeersForStable) ? self.btMinPeersForStable : 5, 
        self.remoteHttps = "string" == typeof self.remoteHttps ? self.remoteHttps : "", 
        self.localAddonEnabled = !!self.hasOwnProperty("localAddonEnabled") && self.localAddonEnabled, 
        self.transcodeHorsepower = self.transcodeHorsepower ? self.transcodeHorsepower : .75, 
        self.transcodeMaxBitRate = isPositiveInteger(self.transcodeMaxBitRate) ? self.transcodeMaxBitRate : 0, 
        self.transcodeConcurrency = isPositiveInteger(self.transcodeConcurrency) ? self.transcodeConcurrency : 1, 
        self.transcodeTrackConcurrency = isPositiveInteger(self.transcodeTrackConcurrency) ? self.transcodeTrackConcurrency : 1, 
        self.transcodeHardwareAccel = !self.hasOwnProperty("transcodeHardwareAccel") || self.transcodeHardwareAccel, 
        self.transcodeProfile = self.hasOwnProperty("transcodeProfile") ? self.transcodeProfile : null, 
        self.allTranscodeProfiles = [], self.transcodeMaxWidth = self.hasOwnProperty("transcodeMaxWidth") ? self.transcodeMaxWidth : 1920, 
        self.load(), self;
    })(appPath);
}
