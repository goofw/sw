function(module, exports, __webpack_require__) {
    "use strict";
    (function(__dirname) {
        function getPath(name) {
            const os = __webpack_require__(21), path = __webpack_require__(4), binaries = Object.assign(Object.create(null), {
                darwin: [ "x64" ],
                linux: [ "x64", "ia32", "arm64", "arm" ],
                win32: [ "x64", "ia32" ]
            }), platform = process.env.npm_config_platform || os.platform(), arch = process.env.npm_config_arch || os.arch();
            return binaries[platform] && -1 !== binaries[platform].indexOf(arch) ? path.join(__dirname, "win32" === platform ? name + ".exe" : name) : null;
        }
        exports.ffmpegPath = getPath("ffmpeg"), exports.ffprobePath = getPath("ffprobe");
    }).call(this, "/");
}
