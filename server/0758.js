function(module, exports, __webpack_require__) {
    const profiles = __webpack_require__(178);
    module.exports = (profileName, accelConfig, options) => {
        const profile = profiles[profileName];
        return profile && (options.video && (accelConfig.inputArgs = accelConfig.inputArgs.concat(profile.video.inputArgs || []), 
        accelConfig.encoderH264 = profile.video.encoders[accelConfig.encoderH264] || accelConfig.encoderH264, 
        accelConfig.videoPreset = profile.video.preset || accelConfig.videoPreset, accelConfig.pixelFormat = profile.video.hasOwnProperty("pixelFormat") ? profile.video.pixelFormat : accelConfig.pixelFormat, 
        accelConfig.videoTune = profile.video.tune || accelConfig.videoTune, accelConfig.scale = profile.video.scale || accelConfig.scale, 
        accelConfig.resizeHeightAuto = profile.video.resizeHeightAuto || accelConfig.resizeHeightAuto, 
        accelConfig.wrapSwFilters = profile.video.wrapSwFilters || accelConfig.wrapSwFilters, 
        accelConfig.extraSwFilters = profile.video.extraSwFilters || accelConfig.extraSwFilters, 
        accelConfig.scalePrefix = profile.video.scalePrefix || accelConfig.scalePrefix, 
        accelConfig.scaleExtra = profile.video.hasOwnProperty("scaleExtra") ? profile.video.scaleExtra : accelConfig.scaleExtra, 
        accelConfig.extraVideoOutputArgs = profile.video.extraOutputArgs || accelConfig.extraVideoOutputArgs, 
        accelConfig.hwFilters = profile.video.hwFilters || accelConfig.hwFilters, accelConfig.colorSpace = profile.video.colorSpace || accelConfig.colorSpace, 
        accelConfig.levelH264 = profile.video.levelH264 || accelConfig.levelH264, accelConfig.encodeThreads = profile.video.hasOwnProperty("encodeThreads") ? profile.video.encodeThreads : accelConfig.encodeThreads, 
        accelConfig.noH264Level = profile.video.noH264Level || accelConfig.noH264Level, 
        options.video.transcode && profile.video.decoders[options.video.codec] && accelConfig.inputArgs.push("-c:v", profile.video.decoders[options.video.codec])), 
        options.audio && (accelConfig.inputArgs = accelConfig.inputArgs.concat(profile.audio.inputArgs || []), 
        accelConfig.encoderAAC = profile.audio.encoders[accelConfig.encoderAAC] || accelConfig.encoderAAC, 
        options.audio.transcode && profile.audio.decoders[options.audio.codec] && accelConfig.inputArgs.push("-c:a", profile.audio.decoders[options.audio.codec]))), 
        accelConfig;
    };
}
