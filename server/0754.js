function(module, exports, __webpack_require__) {
    const profiles = __webpack_require__(178), userSettings = __webpack_require__(94), cache = __webpack_require__(380), fetch = __webpack_require__(33), saveSettings = settings => {
        userSettings.extend(settings), cache.setOptionValues(userSettings), userSettings.save((function() {}));
    }, perPlatforms = {
        android: [],
        darwin: [ "videotoolbox" ],
        win32: [ "qsv-win", "nvenc-win", "amf" ],
        linux: [ "qsv-linux", "nvenc-linux", "vaapi-renderD128" ],
        ios: [ "videotoolbox", "mediacodec" ],
        rpi: [ "v4l2m2m" ]
    };
    module.exports = (serverPort, cb) => {
        const platform = process.env.IS_IOS ? "ios" : process.platform, hasProfiles = !!(perPlatforms[platform] || []).length, initialDetection = process.env.HLS_DEBUG || userSettings.transcodeHardwareAccel && !(userSettings.allTranscodeProfiles || []).length, expectResult = !!cb;
        if (!hasProfiles) return cb && cb(!1), void (userSettings.transcodeHardwareAccel && saveSettings({
            transcodeHardwareAccel: !1
        }));
        if (initialDetection || expectResult) {
            serverPort = serverPort || 11470;
            const supportedHwAccel = [], possibleProfiles = [ ...perPlatforms[platform] ];
            console.log(`hls-converter - Initiating tests for hardware accelerated transcoding support, possible options: ${possibleProfiles}`);
            const testProfile = async () => {
                const profile = possibleProfiles.shift(), attemptTranscode = (profile, type) => new Promise(((resolve, reject) => {
                    const sampleFile = "video" === type ? "hevc.mkv" : "ac3-2chan.wav", convertId = `${serverPort}-${profile}-${type}-${sampleFile}`, url = `http://127.0.0.1:${serverPort}/hlsv2/${convertId}/${type}0.m3u8?mediaURL=http%3A%2F%2F127.0.0.1%3A${serverPort}%2Fsamples%2F${encodeURIComponent(sampleFile)}&profile=${profile}&maxWidth=1200`;
                    console.log(`hls-converter - Testing ${type} hw accel for profile: ${profile}`), 
                    fetch(url).then((async res => {
                        await fetch(`http://127.0.0.1:${serverPort}/hlsv2/${convertId}/destroy`).then((() => {})).catch((() => {})), 
                        res.ok ? (resolve(!0), console.log(`hls-converter - Tests passed for [${type}] hw accel profile: ${profile}`)) : (resolve(!1), 
                        console.log(`hls-converter - Tests failed for [${type}] hw accel profile: ${profile}`));
                    })).catch((() => resolve(!1)));
                })), supported = {};
                profiles[profile].audio.encoders.aac || profiles[profile].audio.decoders.ac3 ? supported.audio = await attemptTranscode(profile, "audio") : supported.audio = !0, 
                profiles[profile].video.encoders.libx264 || profiles[profile].video.decoders.hevc ? supported.video = await attemptTranscode(profile, "video") : supported.video = !0, 
                supported.audio && supported.video ? (supportedHwAccel.length || saveSettings({
                    transcodeHardwareAccel: !0
                }), supportedHwAccel.push(profile), console.log(`hls-converter - All tests passed for hw accel profile: ${profile}`)) : console.log(`hls-converter - Some tests failed for hw accel profile: ${profile}`), 
                possibleProfiles.length ? testProfile() : supportedHwAccel.length ? (cb && cb(supportedHwAccel), 
                saveSettings({
                    allTranscodeProfiles: supportedHwAccel
                }), console.log(`hls-converter - Tests for hardware accelerated transcoding finished, supported acceleration profiles: ${supportedHwAccel.join(", ")}`)) : (cb && cb(!1), 
                saveSettings({
                    transcodeHardwareAccel: !1
                }), console.log("hls-converter - Tests for hardware accelerated transcoding finished, no viable acceleration profiles detected"));
            };
            testProfile();
        }
    };
}
